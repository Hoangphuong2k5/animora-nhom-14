import dayjs from 'dayjs';
import { AppDataSource } from '../config/data-source.js';
import defaultBookingRepo from '../repositories/booking.repository.js';
import defaultNotificationRepo from '../repositories/notification.repository.js';
import ApiError from '../utils/ApiError.js';
import { toBookingDTO } from '../dtos/booking.dto.js';

const MAX_ADVANCE_DAYS = 60;
const FREE_CANCEL_HOURS = 24;
const LATE_THRESHOLD_HOURS = 3;
const LATE_FEE_PERCENT = 50;
const STAFF_ROLES = new Set(['admin', 'manager', 'staff']);

/**
 * BookingService (BKG-01..04) - Đặt lịch, xem lịch, hủy & đổi lịch (AnimoraDB ver 1.5)
 */
class BookingService {
  constructor(
    bookingRepo = defaultBookingRepo,
    notificationRepo = defaultNotificationRepo,
    dataSource = AppDataSource
  ) {
    this.bookingRepo = bookingRepo;
    this.notificationRepo = notificationRepo;
    this.dataSource = dataSource;
  }

  isStaffUser(currentUser) {
    const role = String(currentUser.role || '').toLowerCase();
    const dbRole = String(currentUser.dbRole || '').toLowerCase();
    return STAFF_ROLES.has(role) || dbRole === 'admin' || dbRole === 'manager';
  }

  async executeLockedTransaction(callback) {
    if (typeof this.bookingRepo.runSerializableTransaction === 'function') {
      return await this.bookingRepo.runSerializableTransaction(callback);
    }
    return await this.dataSource.transaction(callback);
  }

  async getBookingAvailability(query = {}) {
    if (typeof this.bookingRepo.getBusySlotsForDate !== 'function') {
      return { date: query.date, pet_busy_slots: [], expert_busy_slots: [], handover_busy_slots: [], busy_slots: [] };
    }
    return await this.bookingRepo.getBusySlotsForDate({
      dateStr: query.date,
      petId: query.pet_id || null,
      expertId: query.expert_id || null,
    });
  }

  async listBookings(currentUser, query = {}) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;

    let customerId = null;
    if (!this.isStaffUser(currentUser)) {
      const customer = await this.bookingRepo.resolveCustomerByUserId(currentUser.id);
      if (!customer) {
        throw new ApiError(404, 'Không tìm thấy hồ sơ khách hàng', 'CUSTOMER_NOT_FOUND');
      }
      customerId = Number(customer.CustomerID);
    }

    const { items, totalItems } = await this.bookingRepo.findAppointments({
      customerId,
      page,
      limit,
      status: query.status,
      pet_id: query.pet_id,
      from_date: query.from_date,
      to_date: query.to_date,
    });

    return {
      items: items.map(toBookingDTO),
      page,
      limit,
      totalItems,
    };
  }

  async getBookingById(currentUser, bookingId) {
    const appointment = await this.bookingRepo.findAppointmentById(bookingId);
    if (!appointment) {
      throw new ApiError(404, 'Không tìm thấy lịch hẹn', 'BOOKING_NOT_FOUND');
    }

    if (
      !this.isStaffUser(currentUser) &&
      Number(appointment.customer?.UserID) !== Number(currentUser.id)
    ) {
      throw new ApiError(403, 'Bạn không có quyền xem lịch hẹn này', 'FORBIDDEN');
    }

    return toBookingDTO(appointment);
  }

  /**
   * BKG-01: Tạo lịch hẹn dịch vụ mới
   */
  async createBooking(currentUser, payload) {
    const customer = await this.bookingRepo.resolveCustomerByUserId(currentUser.id);
    if (!customer) {
      throw new ApiError(404, 'Không tìm thấy hồ sơ khách hàng', 'CUSTOMER_NOT_FOUND');
    }

    const pet = await this.bookingRepo.findPetById(payload.pet_id);
    if (!pet) {
      throw new ApiError(404, 'Không tìm thấy hồ sơ thú cưng', 'PET_NOT_FOUND');
    }
    if (Number(pet.CustomerID) !== Number(customer.CustomerID)) {
      throw new ApiError(403, 'Bạn chỉ được đặt lịch cho thú cưng của chính mình', 'FORBIDDEN');
    }

    const requestedItems =
      Array.isArray(payload.services) && payload.services.length > 0
        ? payload.services
        : [{ service_id: payload.service_id, quantity: 1, notes: null }];

    const uniqueServiceIds = [...new Set(requestedItems.map((i) => Number(i.service_id)))];
    const services = await this.bookingRepo.findServicesByIds(uniqueServiceIds);
    if (services.length !== uniqueServiceIds.length) {
      throw new ApiError(
        400,
        'Một hoặc nhiều dịch vụ không tồn tại hoặc đang ngừng hoạt động',
        'INVALID_SERVICES'
      );
    }

    const serviceMap = new Map(services.map((s) => [Number(s.ServiceID), s]));
    const scheduledAt = new Date(payload.scheduled_at);
    const now = new Date();
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt <= now) {
      throw new ApiError(400, 'Thời gian đặt lịch phải nằm trong tương lai', 'INVALID_APPOINTMENT_TIME');
    }

    const diffDays = dayjs(scheduledAt).diff(dayjs(now), 'day', true);
    if (diffDays > MAX_ADVANCE_DAYS) {
      throw new ApiError(
        400,
        `Chỉ được đặt lịch trước tối đa ${MAX_ADVANCE_DAYS} ngày`,
        'EXCEED_MAX_ADVANCE_DAYS'
      );
    }

    let totalDurationMin = 0;
    let totalAmount = 0;
    const servicesData = requestedItems.map((item) => {
      const svc = serviceMap.get(Number(item.service_id));
      const qty = Number(item.quantity || 1);
      const unitPrice = Number(svc.BasePrice);
      totalDurationMin += Number(svc.EstimatedDurationMinutes || 60) * qty;
      totalAmount += unitPrice * qty;
      return {
        ServiceID: Number(svc.ServiceID),
        Quantity: qty,
        UnitPrice: unitPrice,
        Notes: item.notes || null,
      };
    });

    const endAt = new Date(scheduledAt.getTime() + totalDurationMin * 60 * 1000);

    let expert = null;
    if (payload.expert_id) {
      expert = await this.bookingRepo.findExpertById(payload.expert_id);
      if (!expert) {
        throw new ApiError(404, 'Không tìm thấy chuyên viên hoặc chuyên viên chưa hoạt động', 'EXPERT_NOT_FOUND');
      }

      const hasMedical = services.some((s) => s.service_kind === 'medical');
      if (hasMedical && expert.EmployeeType !== 'Doctor') {
        throw new ApiError(
          400,
          'Dịch vụ y tế chỉ được phép đặt với Bác sĩ thú y (Doctor)',
          'MEDICAL_SERVICE_REQUIRES_VET'
        );
      }

      if (typeof this.bookingRepo.findExpertUnassignedServiceIds === 'function') {
        const unassigned = await this.bookingRepo.findExpertUnassignedServiceIds(
          expert.EmployeeID,
          uniqueServiceIds
        );
        if (unassigned.length > 0) {
          throw new ApiError(
            400,
            'Chuyên viên này không phụ trách một hoặc nhiều dịch vụ bạn đã chọn',
            'EXPERT_SERVICE_MISMATCH'
          );
        }
      }
    }

    const isPrepaid = String(payload.payment_timing || '').toLowerCase() === 'prepaid';
    const paymentTiming = isPrepaid ? 'Prepaid' : 'Postpaid';
    const paymentStatus = isPrepaid ? 'Prepaid_Pending' : 'Postpaid_Pending';
    const paymentExpiresAt = isPrepaid ? new Date(Date.now() + 10 * 60 * 1000) : null;

    const created = await this.executeLockedTransaction(async (manager) => {
      if (typeof this.bookingRepo.lockBookingResources === 'function') {
        await this.bookingRepo.lockBookingResources(
          { petId: pet.PetID, expertId: expert ? expert.EmployeeID : null },
          manager
        );
      }

      const petBusy = await this.bookingRepo.hasOverlappingPetAppointment(
        pet.PetID,
        scheduledAt,
        endAt,
        null,
        manager
      );
      if (petBusy) {
        throw new ApiError(
          409,
          'Thú cưng đã có lịch hẹn trùng vào khung giờ này',
          'PET_SCHEDULE_CONFLICT'
        );
      }

      if (typeof this.bookingRepo.hasOverlappingPetHandover === 'function') {
        const handoverBusy = await this.bookingRepo.hasOverlappingPetHandover(
          pet.PetID,
          scheduledAt,
          endAt,
          manager
        );
        if (handoverBusy) {
          throw new ApiError(
            409,
            'Thú cưng đang có lịch bàn giao nhận nuôi trùng vào khung giờ này',
            'PET_HANDOVER_CONFLICT'
          );
        }
      }

      let assignmentData = null;
      let assignedExpertUserId = null;
      if (expert) {
        const expertBusy = await this.bookingRepo.hasOverlappingExpertAppointment(
          expert.EmployeeID,
          scheduledAt,
          endAt,
          null,
          manager
        );
        if (expertBusy) {
          throw new ApiError(
            409,
            'Chuyên viên đã có lịch hẹn trùng vào khung giờ này',
            'EXPERT_SCHEDULE_CONFLICT'
          );
        }

        if (typeof this.bookingRepo.checkExpertScheduleAndLeave === 'function') {
          const shiftCheck = await this.bookingRepo.checkExpertScheduleAndLeave(
            expert.EmployeeID,
            scheduledAt,
            endAt,
            manager
          );
          if (!shiftCheck.available) {
            throw new ApiError(
              409,
              shiftCheck.reason || 'Chuyên viên không có lịch làm việc vào khung giờ này',
              'EXPERT_NOT_AVAILABLE'
            );
          }
        }

        assignedExpertUserId = Number(expert.UserID);
        assignmentData = {
          EmployeeID: Number(expert.EmployeeID),
          AssignedByUserID: Number(currentUser.id),
          AssignmentRole: expert.EmployeeType === 'Doctor' ? 'Doctor' : 'CareStaff',
        };
      }

      const aggregate = await this.bookingRepo.createAppointmentAggregate(
        {
          appointmentData: {
            CustomerID: Number(customer.CustomerID),
            PetID: Number(pet.PetID),
            AppointmentAt: scheduledAt,
            AppointmentEndAt: endAt,
            AppointmentStatus: 'Pending',
            PaymentTiming: paymentTiming,
            PaymentStatus: paymentStatus,
            PaymentExpiresAt: paymentExpiresAt,
            TotalAmount: Math.round(totalAmount * 100) / 100,
            CustomerNote: payload.customer_note || null,
          },
          servicesData,
          assignmentData,
          historyData: {
            OldStatus: null,
            NewStatus: 'Pending',
            ChangedByUserID: Number(currentUser.id),
            ChangeReason: 'Khách hàng đặt lịch dịch vụ',
          },
        },
        manager
      );

      if (assignedExpertUserId) {
        await this.notificationRepo.createNotification(
          {
            user_id: assignedExpertUserId,
            type: 'appointment_created',
            title: `Lịch hẹn mới ${aggregate.AppointmentCode}`,
            content: `Bạn có lịch hẹn mới cho thú cưng ${pet.PetName} vào lúc ${dayjs(scheduledAt).format('HH:mm DD/MM/YYYY')}.`,
            ref_type: 'Appointment',
            ref_id: Number(aggregate.AppointmentID),
          },
          manager
        );
      }

      return aggregate;
    });

    return toBookingDTO(created);
  }

  /**
   * BKG-02: Khách hàng hủy lịch hẹn (áp dụng chính sách 24h / <3h phạt 50%)
   */
  async cancelBooking(currentUser, bookingId, payload = {}) {
    const appointment = await this.bookingRepo.findAppointmentById(bookingId);
    if (!appointment) {
      throw new ApiError(404, 'Không tìm thấy lịch hẹn', 'BOOKING_NOT_FOUND');
    }

    const isStaff = this.isStaffUser(currentUser);
    if (!isStaff && Number(appointment.customer?.UserID) !== Number(currentUser.id)) {
      throw new ApiError(403, 'Bạn không có quyền hủy lịch hẹn này', 'FORBIDDEN');
    }

    if (['Completed', 'Cancelled', 'Rejected', 'NoShow'].includes(appointment.AppointmentStatus)) {
      throw new ApiError(
        400,
        `Không thể hủy lịch hẹn đang ở trạng thái "${appointment.AppointmentStatus}"`,
        'INVALID_BOOKING_STATUS'
      );
    }

    const hoursRemaining = dayjs(appointment.AppointmentAt).diff(dayjs(), 'hour', true);
    let cancelFee = 0;
    if (!isStaff && hoursRemaining < LATE_THRESHOLD_HOURS) {
      cancelFee = Math.round((Number(appointment.TotalAmount) * LATE_FEE_PERCENT) / 100);
    }

    const result = await this.dataSource.transaction(async (manager) => {
      let nextPaymentStatus = appointment.PaymentStatus;
      let refund = null;

      if (appointment.PaymentTiming === 'Prepaid' && appointment.PaymentStatus === 'Prepaid_Paid') {
        const refundableAmount = Math.max(0, Number(appointment.TotalAmount) - cancelFee);
        if (refundableAmount > 0) {
          const lastPayment = await this.bookingRepo.findLastPaidPaymentByAppointment(
            appointment.AppointmentID,
            manager
          );
          if (lastPayment) {
            refund = await this.bookingRepo.createCancelRefund(
              {
                PaymentID: Number(lastPayment.PaymentID),
                ReturnRequestID: null,
                RefundCode: `REF-${appointment.AppointmentCode}-${Date.now()}`,
                RefundType: 'AppointmentCancel',
                RefundAmount: refundableAmount,
                RefundMethod: 'OriginalPaymentMethod',
                RefundStatus: 'Pending',
                ProcessedByUserID: Number(currentUser.id),
                Notes: payload.reason || `Hoàn tiền hủy lịch (phí hủy: ${cancelFee})`,
              },
              manager
            );
            nextPaymentStatus = 'Refunded';
          }
        }
      }

      const updated = await this.bookingRepo.updateAppointment(
        appointment.AppointmentID,
        {
          AppointmentStatus: 'Cancelled',
          PaymentStatus: nextPaymentStatus,
          CancelledAt: new Date(),
          InternalNote: payload.reason || null,
        },
        manager
      );

      await this.bookingRepo.addStatusHistory(
        {
          AppointmentID: Number(appointment.AppointmentID),
          OldStatus: appointment.AppointmentStatus,
          NewStatus: 'Cancelled',
          ChangedByUserID: Number(currentUser.id),
          ChangeReason: payload.reason || 'Khách hàng hủy lịch hẹn',
        },
        manager
      );

      await this.bookingRepo.addChangeRequest(
        {
          AppointmentID: Number(appointment.AppointmentID),
          RequestedByUserID: Number(currentUser.id),
          RequestType: 'Cancel',
          RequestReason: payload.reason || 'Hủy lịch hẹn',
          RequestStatus: 'Approved',
          ReviewedByUserID: Number(currentUser.id),
          ReviewedAt: new Date(),
        },
        manager
      );

      return { booking: toBookingDTO(updated), cancel_fee: cancelFee, refund };
    });

    return result;
  }

  /**
   * BKG-03: Khách hàng đổi lịch hẹn (phải báo trước tối thiểu 24h trừ Manager/Admin)
   */
  async rescheduleBooking(currentUser, bookingId, payload) {
    const appointment = await this.bookingRepo.findAppointmentById(bookingId);
    if (!appointment) {
      throw new ApiError(404, 'Không tìm thấy lịch hẹn', 'BOOKING_NOT_FOUND');
    }

    const isStaff = this.isStaffUser(currentUser);
    if (!isStaff && Number(appointment.customer?.UserID) !== Number(currentUser.id)) {
      throw new ApiError(403, 'Bạn không có quyền đổi lịch hẹn này', 'FORBIDDEN');
    }

    if (!['Pending', 'Confirmed'].includes(appointment.AppointmentStatus)) {
      throw new ApiError(
        400,
        `Không thể đổi lịch hẹn ở trạng thái "${appointment.AppointmentStatus}"`,
        'INVALID_BOOKING_STATUS'
      );
    }

    const hoursUntilCurrent = dayjs(appointment.AppointmentAt).diff(dayjs(), 'hour', true);
    if (!isStaff && hoursUntilCurrent < FREE_CANCEL_HOURS) {
      throw new ApiError(
        400,
        `Đổi lịch hẹn phải báo trước tối thiểu ${FREE_CANCEL_HOURS} giờ`,
        'RESCHEDULE_TOO_LATE'
      );
    }

    const newStart = new Date(payload.scheduled_at);
    const now = new Date();
    if (Number.isNaN(newStart.getTime()) || newStart <= now) {
      throw new ApiError(400, 'Thời gian mới phải nằm trong tương lai', 'INVALID_APPOINTMENT_TIME');
    }
    if (dayjs(newStart).diff(dayjs(now), 'day', true) > MAX_ADVANCE_DAYS) {
      throw new ApiError(
        400,
        `Chỉ được đặt trước tối đa ${MAX_ADVANCE_DAYS} ngày`,
        'EXCEED_MAX_ADVANCE_DAYS'
      );
    }

    const durationMs = appointment.AppointmentEndAt
      ? new Date(appointment.AppointmentEndAt).getTime() -
        new Date(appointment.AppointmentAt).getTime()
      : 60 * 60 * 1000;
    const newEnd = new Date(newStart.getTime() + Math.max(15 * 60 * 1000, durationMs));

    const updated = await this.executeLockedTransaction(async (manager) => {
      const firstAssign = (appointment.assignments || [])[0];
      if (typeof this.bookingRepo.lockBookingResources === 'function') {
        await this.bookingRepo.lockBookingResources(
          { petId: appointment.PetID, expertId: firstAssign ? firstAssign.EmployeeID : null },
          manager
        );
      }

      const petBusy = await this.bookingRepo.hasOverlappingPetAppointment(
        appointment.PetID,
        newStart,
        newEnd,
        appointment.AppointmentID,
        manager
      );
      if (petBusy) {
        throw new ApiError(409, 'Thú cưng đã có lịch hẹn khác trùng giờ mới', 'PET_SCHEDULE_CONFLICT');
      }

      if (typeof this.bookingRepo.hasOverlappingPetHandover === 'function') {
        const handoverBusy = await this.bookingRepo.hasOverlappingPetHandover(
          appointment.PetID,
          newStart,
          newEnd,
          manager
        );
        if (handoverBusy) {
          throw new ApiError(
            409,
            'Thú cưng đang có lịch bàn giao nhận nuôi trùng vào khung giờ mới',
            'PET_HANDOVER_CONFLICT'
          );
        }
      }

      for (const assign of appointment.assignments || []) {
        const expertBusy = await this.bookingRepo.hasOverlappingExpertAppointment(
          assign.EmployeeID,
          newStart,
          newEnd,
          appointment.AppointmentID,
          manager
        );
        if (expertBusy) {
          throw new ApiError(409, 'Chuyên viên đã có lịch hẹn trùng khung giờ mới', 'EXPERT_SCHEDULE_CONFLICT');
        }

        if (typeof this.bookingRepo.checkExpertScheduleAndLeave === 'function') {
          const shiftCheck = await this.bookingRepo.checkExpertScheduleAndLeave(
            assign.EmployeeID,
            newStart,
            newEnd,
            manager
          );
          if (!shiftCheck.available) {
            throw new ApiError(
              409,
              shiftCheck.reason || 'Chuyên viên không có lịch làm việc vào khung giờ mới',
              'EXPERT_NOT_AVAILABLE'
            );
          }
        }
      }

      const saved = await this.bookingRepo.updateAppointment(
        appointment.AppointmentID,
        {
          AppointmentAt: newStart,
          AppointmentEndAt: newEnd,
        },
        manager
      );

      await this.bookingRepo.addChangeRequest(
        {
          AppointmentID: Number(appointment.AppointmentID),
          RequestedByUserID: Number(currentUser.id),
          RequestType: 'Reschedule',
          RequestedAppointmentAt: newStart,
          RequestReason: payload.reason || 'Khách hàng đổi lịch hẹn',
          RequestStatus: 'Approved',
          ReviewedByUserID: Number(currentUser.id),
          ReviewedAt: new Date(),
        },
        manager
      );

      return saved;
    });

    return toBookingDTO(updated);
  }
}

const defaultBookingService = new BookingService();
export { defaultBookingService, BookingService };
export default defaultBookingService;

