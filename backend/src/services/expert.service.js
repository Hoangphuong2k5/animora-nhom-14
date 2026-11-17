import crypto from 'crypto';
import dayjs from 'dayjs';
import { AppDataSource } from '../config/data-source.js';
import { env } from '../config/environment.js';
import defaultExpertRepo from '../repositories/expert.repository.js';
import defaultNotificationRepo from '../repositories/notification.repository.js';
import { cacheService as defaultCacheService } from '../utils/cache.service.js';
import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';
import {
  toCertificateDTO,
  toServiceSummaryDTO,
  toSlotDTO,
  toScheduleDTO,
  toExpertSummaryDTO,
  toExpertAdminDTO,
  toExpertPublicDetailDTO,
} from '../dtos/expert.dto.js';

const toDbAppointmentStatus = (status) => {
  if (!status) return status;
  const map = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    in_progress: 'InProgress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
    no_show: 'NoShow',
  };
  return map[String(status).toLowerCase()] || status;
};

/**
 * ExpertService tương thích với AnimoraDB (ver 1.5)
 */
class ExpertService {
  constructor(
    expertRepo = defaultExpertRepo,
    notificationRepo = defaultNotificationRepo,
    cache = defaultCacheService,
    dataSource = AppDataSource
  ) {
    this.expertRepo = expertRepo;
    this.notificationRepo = notificationRepo;
    this.cache = cache;
    this.dataSource = dataSource;
  }

  emitAsyncCacheInvalidation(prefix) {
    setImmediate(() => {
      this.cache.consumeInvalidationEvent(prefix);
    });
  }

  async generateCertificatePresignedUrl(currentUser, { file_name, content_type }) {
    const safeName = String(file_name).replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectKey = `certificates/user_${currentUser.id}/${Date.now()}_${safeName}`;
    const expiresAtEpoch = Math.floor(Date.now() / 1000) + env.STORAGE_PRESIGN_EXPIRES_SEC;

    const signaturePayload = `PUT\n${content_type}\n${expiresAtEpoch}\n${objectKey}`;
    const signature = crypto
      .createHmac('sha256', env.STORAGE_PRESIGN_SECRET)
      .update(signaturePayload)
      .digest('hex');

    const uploadUrl = `${env.STORAGE_BASE_URL}/${objectKey}?expires=${expiresAtEpoch}&signature=${signature}`;
    const fileUrl = `${env.STORAGE_BASE_URL}/${objectKey}`;

    logger.info('Issued Direct-to-Cloud Pre-signed URL for expert certificate', {
      userId: currentUser.id,
      objectKey,
      expiresInSec: env.STORAGE_PRESIGN_EXPIRES_SEC,
    });

    return Object.freeze({
      upload_url: uploadUrl,
      file_url: fileUrl,
      object_key: objectKey,
      method: 'PUT',
      headers: { 'Content-Type': content_type },
      expires_in_seconds: env.STORAGE_PRESIGN_EXPIRES_SEC,
    });
  }

  /**
   * EXP-01: Tạo hồ sơ chuyên viên (EmployeeProfiles + EmployeeCertificates)
   */
  async onboardExpert(currentUser, payload) {
    const isAdmin =
      currentUser.role === 'admin' ||
      currentUser.dbRole === 'Admin' ||
      currentUser.role === 'manager' ||
      currentUser.dbRole === 'Manager';

    const targetUserId = isAdmin && payload.user_id ? Number(payload.user_id) : Number(currentUser.id);

    const existing = await this.expertRepo.findByUserId(targetUserId);
    if (existing) {
      throw new ApiError(
        409,
        'Tài khoản này đã có hồ sơ chuyên viên trên hệ thống',
        'EXPERT_ALREADY_EXISTS'
      );
    }

    const userRow =
      typeof this.expertRepo.findUserById === 'function'
        ? await this.expertRepo.findUserById(targetUserId)
        : null;

    const fullName =
      payload.fullName ||
      payload.full_name ||
      currentUser.fullName ||
      currentUser.full_name ||
      userRow?.Email?.split('@')[0] ||
      `Chuyên viên #${targetUserId}`;

    const employeeType = payload.type === 'vet' || payload.type === 'Doctor' ? 'Doctor' : 'CareStaff';
    const specialization = payload.license_no || payload.specialization || null;

    const created = await this.dataSource.transaction(async (manager) => {
      const newExpert = await this.expertRepo.createExpert(
        {
          UserID: targetUserId,
          FullName: fullName,
          EmployeeType: employeeType,
          EmploymentType: employeeType === 'Doctor' ? 'FullTime' : payload.employment_type || 'FullTime',
          Specialization: specialization,
          Biography: payload.bio || null,
          YearsOfExperience: payload.years_of_experience ?? null,
          IsActive: false,
        },
        manager
      );

      if (Array.isArray(payload.certificates) && payload.certificates.length > 0) {
        const certsData = payload.certificates.map((c) => ({
          EmployeeID: Number(newExpert.EmployeeID ?? newExpert.id),
          CertificateName: c.name,
          CertificateNumber: c.certificate_number || payload.license_no || null,
          IssuingOrganization: c.issuer || null,
          IssuedDate: c.issued_date || (c.year ? `${c.year}-01-01` : null),
          ExpiryDate: c.expiry_date || null,
          CertificateUrl: c.file_url || null,
          ApprovalStatus: 'Pending',
        }));
        newExpert.certificates = await this.expertRepo.createCertificates(certsData, manager);
      } else {
        newExpert.certificates = [];
      }

      newExpert.status = 'pending';
      return newExpert;
    });

    return toExpertAdminDTO(created);
  }

  /**
   * EXP-01: Lưu metadata chứng chỉ
   */
  async addCertificate(currentUser, payload) {
    const isAdmin = currentUser.role === 'admin' || currentUser.dbRole === 'Admin';
    const expert =
      isAdmin && payload.expert_id
        ? await this.expertRepo.findById(payload.expert_id)
        : await this.expertRepo.findByUserId(currentUser.id);

    if (!expert) {
      throw new ApiError(404, 'Không tìm thấy hồ sơ chuyên viên', 'EXPERT_NOT_FOUND');
    }

    const expertUserId = Number(expert.UserID ?? expert.user_id);
    if (!isAdmin && expertUserId !== Number(currentUser.id)) {
      throw new ApiError(403, 'Bạn không có quyền thêm chứng chỉ cho chuyên viên khác', 'FORBIDDEN');
    }

    const expertId = Number(expert.EmployeeID ?? expert.id);
    const [savedCert] = await this.expertRepo.createCertificates([
      {
        EmployeeID: expertId,
        CertificateName: payload.name,
        CertificateNumber: payload.certificate_number || null,
        IssuingOrganization: payload.issuer || null,
        IssuedDate: payload.issued_date || (payload.year ? `${payload.year}-01-01` : null),
        ExpiryDate: payload.expiry_date || null,
        CertificateUrl: payload.file_url,
        ApprovalStatus: 'Pending',
      },
    ]);

    this.emitAsyncCacheInvalidation(`expert:profile:${expertId}`);
    return toCertificateDTO(savedCert);
  }

  /**
   * EXP-02: Admin lấy danh sách hồ sơ chuyên viên chờ duyệt
   */
  async getPendingExperts(query) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;

    const { items, totalItems } = await this.expertRepo.findPendingExperts({
      page,
      limit,
      after_id: query.after_id,
      status: query.status || 'pending',
      type: query.type,
    });

    return {
      items: items.map(toExpertAdminDTO),
      page,
      limit,
      totalItems,
    };
  }

  /**
   * EXP-02: Admin/Manager duyệt hồ sơ chuyên viên
   */
  async verifyExpertProfile(adminId, expertId, payload) {
    const expert = await this.expertRepo.findById(expertId);
    if (!expert) {
      throw new ApiError(404, 'Không tìm thấy hồ sơ chuyên viên', 'EXPERT_NOT_FOUND');
    }

    const currentType = expert.type || (expert.EmployeeType === 'Doctor' ? 'vet' : 'groomer');
    const targetType = payload.type || currentType;
    const licenseNo = expert.license_no || expert.Specialization || payload.license_no;

    if (payload.status === 'approved' && (targetType === 'vet' || targetType === 'Doctor') && !licenseNo) {
      throw new ApiError(
        400,
        'Bác sĩ thú y (vet) bắt buộc phải có số giấy phép hành nghề (license_no) trước khi phê duyệt',
        'VET_LICENSE_REQUIRED'
      );
    }

    const updated = await this.dataSource.transaction(async (manager) => {
      const updateData = {
        IsActive: payload.status === 'approved',
        status: payload.status,
        type: targetType,
      };
      if (licenseNo) updateData.Specialization = licenseNo;

      const saved = await this.expertRepo.updateExpert(expertId, updateData, manager);
      saved.status = payload.status;

      if (payload.status === 'approved' && payload.verify_all_certificates !== false) {
        await this.expertRepo.verifyAllCertificatesByExpertId(
          expertId,
          'Approved',
          adminId,
          payload.reason || 'Hồ sơ đạt yêu cầu',
          manager
        );
      } else if (payload.status === 'rejected') {
        await this.expertRepo.verifyAllCertificatesByExpertId(
          expertId,
          'Rejected',
          adminId,
          payload.reason || 'Chưa đạt yêu cầu chứng chỉ',
          manager
        );
      }

      await this.notificationRepo.createNotification(
        {
          user_id: Number(expert.UserID ?? expert.user_id),
          type: 'expert_verification',
          title:
            payload.status === 'approved'
              ? 'Hồ sơ chuyên viên đã được phê duyệt'
              : 'Hồ sơ chuyên viên bị từ chối',
          content:
            payload.status === 'approved'
              ? `Hồ sơ chuyên viên (${targetType}) của bạn đã được phê duyệt.`
              : `Hồ sơ chuyên viên bị từ chối: ${payload.reason || 'Chưa đạt yêu cầu chứng chỉ'}.`,
          ref_type: 'expert',
          ref_id: Number(expert.EmployeeID ?? expert.id),
        },
        manager
      );

      return saved;
    });

    this.emitAsyncCacheInvalidation('expert:');
    return toExpertAdminDTO(updated);
  }

  /**
   * SVC-02: Gán dịch vụ cho chuyên viên
   */
  async assignServicesToExpert(expertId, serviceIds, assignedByUserId = 1) {
    const expert = await this.expertRepo.findById(expertId);
    if (!expert) {
      throw new ApiError(404, 'Không tìm thấy hồ sơ chuyên viên', 'EXPERT_NOT_FOUND');
    }

    const uniqueIds = [...new Set(serviceIds.map(Number))];
    const services = await this.expertRepo.findServicesByIds(uniqueIds);
    if (services.length !== uniqueIds.length) {
      throw new ApiError(
        400,
        'Một hoặc nhiều dịch vụ không tồn tại hoặc đang ngừng hoạt động',
        'INVALID_SERVICES'
      );
    }

    const expertType = expert.type || (expert.EmployeeType === 'Doctor' ? 'vet' : 'groomer');
    if (services.some((s) => s.service_kind === 'medical') && expertType !== 'vet') {
      throw new ApiError(
        400,
        `Chuyên viên thuộc nhóm "${expertType}" không được phép thực hiện dịch vụ y tế (medical). Chỉ Bác sĩ thú y (vet) mới được gán dịch vụ này.`,
        'MEDICAL_SERVICE_REQUIRES_VET'
      );
    }

    await this.expertRepo.replaceExpertServices(expertId, uniqueIds, assignedByUserId);
    const assigned = await this.expertRepo.findExpertServices(expertId);

    this.emitAsyncCacheInvalidation('expert:');

    return Object.freeze({
      expert_id: Number(expertId),
      expert_type: expertType,
      services: assigned.map(toServiceSummaryDTO),
    });
  }

  /**
   * SVC-02: Lấy danh sách dịch vụ của chuyên viên
   */
  async getServicesOfExpert(expertId) {
    const cacheKey = `expert:services:${Number(expertId)}`;
    return await this.cache.getOrSet(cacheKey, 120, async () => {
      const expert = await this.expertRepo.findById(expertId);
      if (!expert) {
        throw new ApiError(404, 'Không tìm thấy hồ sơ chuyên viên', 'EXPERT_NOT_FOUND');
      }
      const services = await this.expertRepo.findExpertServices(expertId);
      return services.map(toServiceSummaryDTO);
    });
  }

  /**
   * EXP-03: Cấu hình lịch làm việc theo ca (WorkShifts + EmployeeWorkSchedules)
   */
  async upsertMySchedule(userId, payload) {
    const expert = await this.expertRepo.findByUserId(userId);
    if (!expert) {
      throw new ApiError(404, 'Tài khoản của bạn chưa có hồ sơ chuyên viên', 'EXPERT_NOT_FOUND');
    }
    if (!expert.IsActive) {
      throw new ApiError(
        403,
        'Hồ sơ chuyên viên của bạn đang chờ duyệt, chưa thể cấu hình lịch làm việc',
        'EXPERT_NOT_APPROVED'
      );
    }

    const savedSchedule = await this.dataSource.transaction(async (manager) => {
      const shift = await this.expertRepo.findOrCreateWorkShift(
        {
          workShiftId: payload.work_shift_id,
          shiftStart: payload.shift_start || '08:00',
          shiftEnd: payload.shift_end || '17:00',
          breakMinutes: 60,
        },
        manager
      );

      const schedule = await this.expertRepo.upsertEmployeeWorkSchedule(
        {
          employeeId: Number(expert.EmployeeID ?? expert.id),
          workShiftId: Number(shift.WorkShiftID),
          workDate: payload.work_date,
          scheduleStatus: payload.is_day_off ? 'Cancelled' : 'Confirmed',
          createdByUserId: Number(userId),
        },
        manager
      );

      const fullRow = await this.expertRepo.findScheduleById(schedule.EmployeeWorkScheduleID, manager);
      return toScheduleDTO(fullRow);
    });

    this.emitAsyncCacheInvalidation('expert:');
    return savedSchedule;
  }

  /**
   * EXP-03: Xem danh sách lịch làm việc của chuyên viên
   */
  async getMySchedules(userId, query) {
    const expert = await this.expertRepo.findByUserId(userId);
    if (!expert) {
      throw new ApiError(404, 'Tài khoản của bạn chưa có hồ sơ chuyên viên', 'EXPERT_NOT_FOUND');
    }
    const schedules = await this.expertRepo.findSchedulesByExpert(
      Number(expert.EmployeeID ?? expert.id),
      {
        from_date: query.from_date,
        to_date: query.to_date,
      }
    );
    return schedules.map((s) => toScheduleDTO(s));
  }

  /**
   * EXP-03: Chuyên viên cập nhật trạng thái lịch làm việc ('off' -> 'Cancelled', 'available' -> 'Confirmed')
   */
  async updateMySlotStatus(userId, slotId, status) {
    const expert = await this.expertRepo.findByUserId(userId);
    if (!expert) {
      throw new ApiError(404, 'Không tìm thấy hồ sơ chuyên viên', 'EXPERT_NOT_FOUND');
    }

    const schedule = await this.expertRepo.findScheduleById(slotId);
    if (!schedule) {
      throw new ApiError(404, 'Không tìm thấy khung giờ làm việc', 'SLOT_NOT_FOUND');
    }

    if (Number(schedule.EmployeeID) !== Number(expert.EmployeeID ?? expert.id)) {
      throw new ApiError(
        403,
        'Bạn không có quyền chỉnh sửa khung giờ làm việc của chuyên viên khác',
        'FORBIDDEN'
      );
    }

    const nextStatus = status === 'off' ? 'Cancelled' : 'Confirmed';
    const updated = await this.expertRepo.updateScheduleStatus(slotId, nextStatus);
    this.emitAsyncCacheInvalidation('expert:');
    return toSlotDTO(updated);
  }

  /**
   * EXP-04: Tìm kiếm và lọc chuyên viên
   */
  async searchExperts(query) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    const cacheKey = `expert:search:${JSON.stringify({ ...query, page, limit })}`;

    return await this.cache.getOrSet(cacheKey, 60, async () => {
      const { items, totalItems } = await this.expertRepo.searchApprovedExperts({
        page,
        limit,
        after_id: query.after_id,
        type: query.type,
        min_rating: query.min_rating,
        service_id: query.service_id,
        work_date: query.work_date,
        start_time: query.start_time,
        search: query.search,
      });

      const dtoItems = items.map(toExpertSummaryDTO);
      const nextCursor = dtoItems.length > 0 ? dtoItems[dtoItems.length - 1].id : null;

      return {
        items: dtoItems,
        page,
        limit,
        totalItems,
        next_cursor: nextCursor,
      };
    });
  }

  /**
   * EXP-05: Xem hồ sơ chuyên viên công khai
   */
  async getExpertPublicProfile(expertId) {
    const cacheKey = `expert:profile:${Number(expertId)}`;
    return await this.cache.getOrSet(cacheKey, 120, async () => {
      const todayStr = dayjs().format('YYYY-MM-DD');
      const profile = await this.expertRepo.getPublicProfileById(expertId, todayStr);
      if (!profile) {
        throw new ApiError(
          404,
          'Không tìm thấy hồ sơ chuyên viên hoặc chuyên viên chưa được duyệt',
          'EXPERT_NOT_FOUND'
        );
      }
      return toExpertPublicDetailDTO(profile);
    });
  }

  /**
   * BKG-05: Xem danh sách lịch hẹn được gán của chuyên viên
   */
  async getMyAssignedBookings(userId, query) {
    const expert = await this.expertRepo.findByUserId(userId);
    if (!expert) {
      throw new ApiError(404, 'Không tìm thấy hồ sơ chuyên viên', 'EXPERT_NOT_FOUND');
    }

    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;

    const { items, totalItems } = await this.expertRepo.findBookingsByExpert(
      Number(expert.EmployeeID ?? expert.id),
      {
        page,
        limit,
        status: query.status ? toDbAppointmentStatus(query.status) : undefined,
        date: query.date,
        from_date: query.from_date,
        to_date: query.to_date,
      }
    );

    return { items, page, limit, totalItems };
  }

  /**
   * BKG-06: Xác nhận tiếp nhận lịch hẹn
   */
  async confirmBookingByExpert(userId, bookingId) {
    const expert = await this.expertRepo.findByUserId(userId);
    if (!expert) throw new ApiError(404, 'Không tìm thấy hồ sơ chuyên viên', 'EXPERT_NOT_FOUND');

    const booking = await this.expertRepo.findBookingById(bookingId);
    if (!booking) throw new ApiError(404, 'Không tìm thấy lịch hẹn', 'BOOKING_NOT_FOUND');

    const expertId = Number(expert.EmployeeID ?? expert.id);
    const isAssigned = (booking.assignments || []).some(
      (a) => Number(a.EmployeeID) === expertId
    );
    if (!isAssigned) {
      throw new ApiError(403, 'Bạn không phải chuyên viên phụ trách lịch hẹn này', 'FORBIDDEN');
    }

    if (booking.AppointmentStatus !== 'Pending') {
      throw new ApiError(
        400,
        `Chỉ có thể xác nhận lịch hẹn ở trạng thái "Pending" (Hiện tại: "${booking.AppointmentStatus}")`,
        'INVALID_BOOKING_STATUS'
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      const updatedBooking = await this.expertRepo.updateBooking(
        bookingId,
        { AppointmentStatus: 'Confirmed' },
        manager
      );

      await this.expertRepo.addBookingStatusHistory(
        {
          AppointmentID: Number(bookingId),
          OldStatus: booking.AppointmentStatus,
          NewStatus: 'Confirmed',
          ChangedByUserID: Number(userId),
          ChangeReason: 'Chuyên viên xác nhận tiếp nhận lịch hẹn',
        },
        manager
      );

      if (booking.customer_user_id) {
        await this.notificationRepo.createNotification(
          {
            user_id: booking.customer_user_id,
            type: 'booking_confirmed',
            title: 'Lịch hẹn đã được chuyên viên xác nhận',
            content: `Lịch hẹn ${booking.AppointmentCode} vào lúc ${dayjs(booking.AppointmentAt).format('HH:mm DD/MM/YYYY')} đã được tiếp nhận.`,
            ref_type: 'Appointment',
            ref_id: Number(booking.AppointmentID),
          },
          manager
        );
      }

      return updatedBooking;
    });
  }

  /**
   * BKG-07: Từ chối lịch hẹn (Hoàn 100% + Gợi ý chuyên viên thay thế)
   */
  async rejectBookingByExpert(userId, bookingId, payload) {
    const expert = await this.expertRepo.findByUserId(userId);
    if (!expert) throw new ApiError(404, 'Không tìm thấy hồ sơ chuyên viên', 'EXPERT_NOT_FOUND');

    const booking = await this.expertRepo.findBookingById(bookingId);
    if (!booking) throw new ApiError(404, 'Không tìm thấy lịch hẹn', 'BOOKING_NOT_FOUND');

    const expertId = Number(expert.EmployeeID ?? expert.id);
    const isAssigned = (booking.assignments || []).some(
      (a) => Number(a.EmployeeID) === expertId
    );
    if (!isAssigned) {
      throw new ApiError(403, 'Bạn không phải chuyên viên phụ trách lịch hẹn này', 'FORBIDDEN');
    }

    if (!['Pending', 'Confirmed'].includes(booking.AppointmentStatus)) {
      throw new ApiError(
        400,
        `Không thể từ chối lịch hẹn ở trạng thái "${booking.AppointmentStatus}"`,
        'INVALID_BOOKING_STATUS'
      );
    }

    const alternativeExperts = await this.expertRepo.findAlternativeExperts({
      excludedExpertId: expertId,
      serviceId: booking.service_id,
      employeeType: expert.EmployeeType,
      workDate: dayjs(booking.AppointmentAt).format('YYYY-MM-DD'),
    });

    const result = await this.dataSource.transaction(async (manager) => {
      let nextPaymentStatus = booking.PaymentStatus;
      let refundRecord = null;

      if (booking.PaymentTiming === 'Prepaid' && booking.PaymentStatus === 'Prepaid_Paid') {
        const lastCharge = await this.expertRepo.findLastPaidPaymentByAppointment(
          booking.AppointmentID,
          manager
        );
        if (lastCharge) {
          refundRecord = await this.expertRepo.createRefundRecord(
            {
              PaymentID: Number(lastCharge.PaymentID),
              ReturnRequestID: null,
              RefundCode: `REF-${booking.AppointmentCode}-${Date.now()}`,
              RefundType: 'AppointmentRejected',
              RefundAmount: Number(booking.TotalAmount),
              RefundMethod: 'OriginalPaymentMethod',
              RefundStatus: 'Completed',
              ProcessedByUserID: Number(userId),
              ProcessedAt: new Date(),
              Notes: `Hoàn tiền 100% do chuyên viên từ chối lịch hẹn (${payload.reason})`,
            },
            manager
          );
          nextPaymentStatus = 'Refunded';
        }
      }

      const updatedBooking = await this.expertRepo.updateBooking(
        booking.AppointmentID,
        {
          AppointmentStatus: 'Rejected',
          PaymentStatus: nextPaymentStatus,
          CancelledAt: new Date(),
          InternalNote: payload.reason,
        },
        manager
      );

      await this.expertRepo.addBookingStatusHistory(
        {
          AppointmentID: Number(booking.AppointmentID),
          OldStatus: booking.AppointmentStatus,
          NewStatus: 'Rejected',
          ChangedByUserID: Number(userId),
          ChangeReason: payload.reason,
        },
        manager
      );

      if (booking.customer_user_id) {
        await this.notificationRepo.createNotification(
          {
            user_id: booking.customer_user_id,
            type: 'booking_rejected_by_expert',
            title: 'Chuyên viên không thể tiếp nhận lịch hẹn',
            content: `Lịch hẹn ${booking.AppointmentCode} bị từ chối (${payload.reason}).`,
            ref_type: 'Appointment',
            ref_id: Number(booking.AppointmentID),
          },
          manager
        );
      }

      return { booking: updatedBooking, refund: refundRecord, suggested_experts: alternativeExperts };
    });

    this.emitAsyncCacheInvalidation('expert:');
    return result;
  }

  /**
   * BKG-08: Cập nhật trạng thái đặc biệt (InProgress, NoShow, late)
   */
  async updateBookingSpecialStatus(userId, bookingId, payload, ipAddress = null) {
    const expert = await this.expertRepo.findByUserId(userId);
    if (!expert) throw new ApiError(404, 'Không tìm thấy hồ sơ chuyên viên', 'EXPERT_NOT_FOUND');

    const booking = await this.expertRepo.findBookingById(bookingId);
    if (!booking) throw new ApiError(404, 'Không tìm thấy lịch hẹn', 'BOOKING_NOT_FOUND');

    const expertId = Number(expert.EmployeeID ?? expert.id);
    const isAssigned = (booking.assignments || []).some(
      (a) => Number(a.EmployeeID) === expertId
    );
    if (!isAssigned) {
      throw new ApiError(403, 'Bạn không phải chuyên viên phụ trách lịch hẹn này', 'FORBIDDEN');
    }

    if (!['Confirmed', 'InProgress'].includes(booking.AppointmentStatus)) {
      throw new ApiError(400, 'Trạng thái lịch hẹn không hợp lệ để cập nhật', 'INVALID_BOOKING_STATUS');
    }

    return await this.dataSource.transaction(async (manager) => {
      const targetStatus =
        payload.status === 'late' ? booking.AppointmentStatus : toDbAppointmentStatus(payload.status);
      const updateFields = {
        AppointmentStatus: targetStatus,
        InternalNote: payload.note
          ? `${booking.InternalNote || ''}\n${payload.note}`.trim()
          : booking.InternalNote,
      };

      if (targetStatus === 'NoShow') {
        updateFields.CancelledAt = new Date();
      }

      const updatedBooking = await this.expertRepo.updateBooking(bookingId, updateFields, manager);

      if (targetStatus !== booking.AppointmentStatus) {
        await this.expertRepo.addBookingStatusHistory(
          {
            AppointmentID: Number(bookingId),
            OldStatus: booking.AppointmentStatus,
            NewStatus: targetStatus,
            ChangedByUserID: Number(userId),
            ChangeReason: payload.note || `Cập nhật trạng thái: ${payload.status}`,
          },
          manager
        );
      }

      await this.notificationRepo.createAuditLog(
        {
          actor_id: userId,
          action: `APPOINTMENT_STATUS_${String(payload.status).toUpperCase()}`,
          entity_type: 'Appointments',
          entity_id: String(booking.AppointmentID),
          old_values: { AppointmentStatus: booking.AppointmentStatus },
          new_values: { AppointmentStatus: targetStatus, event: payload.status },
          ip_address: ipAddress,
        },
        manager
      );
      return updatedBooking;
    });
  }

  /**
   * BKG-09: Hoàn thành dịch vụ & Ghi hồ sơ y tế (với Bác sĩ) / lịch sử trạng thái
   */
  async completeBookingByExpert(userId, bookingId, payload) {
    const expert = await this.expertRepo.findByUserId(userId);
    if (!expert) throw new ApiError(404, 'Không tìm thấy hồ sơ chuyên viên', 'EXPERT_NOT_FOUND');

    const booking = await this.expertRepo.findBookingById(bookingId);
    if (!booking) throw new ApiError(404, 'Không tìm thấy lịch hẹn', 'BOOKING_NOT_FOUND');

    const expertId = Number(expert.EmployeeID ?? expert.id);
    const isAssigned = (booking.assignments || []).some(
      (a) => Number(a.EmployeeID) === expertId
    );
    if (!isAssigned) {
      throw new ApiError(403, 'Bạn không phải chuyên viên phụ trách lịch hẹn này', 'FORBIDDEN');
    }

    if (!['Confirmed', 'InProgress'].includes(booking.AppointmentStatus)) {
      throw new ApiError(
        400,
        'Chỉ hoàn tất được lịch hẹn đang Confirmed/InProgress',
        'INVALID_BOOKING_STATUS'
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      const updatedBooking = await this.expertRepo.updateBooking(
        bookingId,
        { AppointmentStatus: 'Completed' },
        manager
      );

      await this.expertRepo.addBookingStatusHistory(
        {
          AppointmentID: Number(bookingId),
          OldStatus: booking.AppointmentStatus,
          NewStatus: 'Completed',
          ChangedByUserID: Number(userId),
          ChangeReason: payload.care_note || 'Hoàn thành dịch vụ',
        },
        manager
      );

      let medicalRecord = null;
      if (expert.EmployeeType === 'Doctor') {
        medicalRecord = await this.expertRepo.createMedicalRecord(
          {
            PetID: Number(booking.PetID),
            AppointmentID: Number(booking.AppointmentID),
            DoctorEmployeeID: expertId,
            ExaminationNotes: payload.care_note || `Hoàn thành lịch hẹn ${booking.AppointmentCode}`,
            RecordStatus: 'Completed',
          },
          manager
        );
      }

      if (booking.customer_user_id) {
        await this.notificationRepo.createNotification(
          {
            user_id: booking.customer_user_id,
            type: 'booking_completed',
            title: 'Dịch vụ chăm sóc thú cưng đã hoàn tất!',
            content: `Lịch hẹn ${booking.AppointmentCode} đã hoàn thành. Hãy đánh giá chuyên viên nhé!`,
            ref_type: 'Appointment',
            ref_id: Number(booking.AppointmentID),
          },
          manager
        );
      }

      return { booking: updatedBooking, medical_record: medicalRecord };
    });
  }
}

const expertServiceInstance = new ExpertService();

export { expertServiceInstance, ExpertService };
export default expertServiceInstance;
