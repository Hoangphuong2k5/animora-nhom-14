import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import dayjs from 'dayjs';
import { BookingService } from '../../src/services/booking.service.js';
import { PaymentService } from '../../src/services/payment.service.js';
import { processExpiredPrepaidBookings } from '../../src/jobs/booking-expiry.job.js';

describe('[BKG-01..04] Unit Tests - Đặt lịch, Hủy/Đổi lịch & Thanh toán VNPAY/Tiền mặt', () => {
  let mockBookingRepo;
  let mockNotificationRepo;
  let mockDataSource;
  let bookingService;

  let mockPaymentRepo;
  let mockGateway;
  let paymentService;

  beforeEach(() => {
    mockBookingRepo = {
      resolveCustomerByUserId: jest.fn(),
      findPetById: jest.fn(),
      findServicesByIds: jest.fn(),
      findExpertById: jest.fn(),
      findExpertUnassignedServiceIds: jest.fn().mockResolvedValue([]),
      hasOverlappingPetAppointment: jest.fn(),
      hasOverlappingPetHandover: jest.fn().mockResolvedValue(false),
      hasOverlappingExpertAppointment: jest.fn(),
      checkExpertScheduleAndLeave: jest.fn().mockResolvedValue({ available: true }),
      lockBookingResources: jest.fn(),
      runSerializableTransaction: jest.fn(async (cb) => cb({})),
      createAppointmentAggregate: jest.fn(),
      findAppointments: jest.fn(),
      findAppointmentById: jest.fn(),
      updateAppointment: jest.fn(),
      addStatusHistory: jest.fn(),
      addChangeRequest: jest.fn(),
      findLastPaidPaymentByAppointment: jest.fn(),
      createCancelRefund: jest.fn(),
      getBusySlotsForDate: jest.fn(),
    };

    mockNotificationRepo = {
      createNotification: jest.fn(),
    };

    mockDataSource = {
      transaction: jest.fn(async (cb) => cb({})),
    };

    bookingService = new BookingService(mockBookingRepo, mockNotificationRepo, mockDataSource);

    mockPaymentRepo = {
      resolveCustomerByUserId: jest.fn(),
      findMethodByCode: jest.fn(),
      findAppointmentById: jest.fn(),
      findOrderById: jest.fn(),
      hasSuccessfulPaymentForTarget: jest.fn().mockResolvedValue(false),
      createPaymentRequestViaSp: jest.fn(),
      processGatewayCallbackViaSp: jest.fn(),
      syncAppointmentPaymentStatus: jest.fn(),
      findPaymentById: jest.fn(),
      findPaymentsByCustomer: jest.fn(),
      markCashPaymentPaid: jest.fn(),
      findManagerAndAdminUserIds: jest.fn().mockResolvedValue([1]),
    };

    mockGateway = {
      buildPaymentUrl: jest.fn(),
      verifyCallback: jest.fn(),
    };

    paymentService = new PaymentService(mockPaymentRepo, mockGateway, mockNotificationRepo);
  });

  describe('BookingService', () => {
    test('TC-1: createBooking() tạo lịch hẹn thành công và gửi thông báo cho Bác sĩ', async () => {
      const futureAt = dayjs().add(3, 'day').toISOString();
      mockBookingRepo.resolveCustomerByUserId.mockResolvedValue({ CustomerID: 5, UserID: 10 });
      mockBookingRepo.findPetById.mockResolvedValue({ PetID: 2, CustomerID: 5, PetName: 'Milo' });
      mockBookingRepo.findServicesByIds.mockResolvedValue([
        {
          ServiceID: 1,
          ServiceName: 'Khám tổng quát',
          BasePrice: 200000,
          EstimatedDurationMinutes: 45,
          service_kind: 'medical',
        },
      ]);
      mockBookingRepo.hasOverlappingPetAppointment.mockResolvedValue(false);
      mockBookingRepo.findExpertById.mockResolvedValue({
        EmployeeID: 7,
        UserID: 70,
        EmployeeType: 'Doctor',
      });
      mockBookingRepo.hasOverlappingExpertAppointment.mockResolvedValue(false);
      mockBookingRepo.createAppointmentAggregate.mockResolvedValue({
        AppointmentID: 300,
        AppointmentCode: 'BKG-20261120-ABC123',
        CustomerID: 5,
        PetID: 2,
        AppointmentAt: futureAt,
        AppointmentStatus: 'Pending',
        PaymentTiming: 'Prepaid',
        PaymentStatus: 'Prepaid_Pending',
        TotalAmount: 200000,
        services: [{ AppointmentServiceID: 1, ServiceID: 1, ServiceName: 'Khám tổng quát', Quantity: 1, UnitPrice: 200000 }],
        assignments: [{ AssignmentID: 1, EmployeeID: 7, AssignmentRole: 'Doctor' }],
      });

      const result = await bookingService.createBooking(
        { id: 10, role: 'customer' },
        {
          pet_id: 2,
          service_id: 1,
          expert_id: 7,
          scheduled_at: futureAt,
          payment_timing: 'Prepaid',
        }
      );

      expect(result.id).toBe(300);
      expect(result.total_amount).toBe(200000);
      expect(result.payment_timing).toBe('Prepaid');
      expect(mockNotificationRepo.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 70, ref_type: 'Appointment', ref_id: 300 }),
        expect.anything()
      );
    });

    test('TC-2: createBooking() chặn gán CareStaff cho dịch vụ y tế (medical)', async () => {
      const futureAt = dayjs().add(2, 'day').toISOString();
      mockBookingRepo.resolveCustomerByUserId.mockResolvedValue({ CustomerID: 5, UserID: 10 });
      mockBookingRepo.findPetById.mockResolvedValue({ PetID: 2, CustomerID: 5 });
      mockBookingRepo.findServicesByIds.mockResolvedValue([
        { ServiceID: 1, BasePrice: 200000, EstimatedDurationMinutes: 30, service_kind: 'medical' },
      ]);
      mockBookingRepo.hasOverlappingPetAppointment.mockResolvedValue(false);
      mockBookingRepo.findExpertById.mockResolvedValue({
        EmployeeID: 8,
        UserID: 80,
        EmployeeType: 'CareStaff',
      });

      await expect(
        bookingService.createBooking(
          { id: 10, role: 'customer' },
          { pet_id: 2, service_id: 1, expert_id: 8, scheduled_at: futureAt }
        )
      ).rejects.toMatchObject({ statusCode: 400, errorCode: 'MEDICAL_SERVICE_REQUIRES_VET' });
    });

    test('TC-3: createBooking() chặn đặt trước quá 60 ngày', async () => {
      const tooFar = dayjs().add(65, 'day').toISOString();
      mockBookingRepo.resolveCustomerByUserId.mockResolvedValue({ CustomerID: 5, UserID: 10 });
      mockBookingRepo.findPetById.mockResolvedValue({ PetID: 2, CustomerID: 5 });
      mockBookingRepo.findServicesByIds.mockResolvedValue([
        { ServiceID: 1, BasePrice: 150000, EstimatedDurationMinutes: 60, service_kind: 'care' },
      ]);

      await expect(
        bookingService.createBooking(
          { id: 10, role: 'customer' },
          { pet_id: 2, service_id: 1, scheduled_at: tooFar }
        )
      ).rejects.toMatchObject({ statusCode: 400, errorCode: 'EXCEED_MAX_ADVANCE_DAYS' });
    });

    test('TC-4: cancelBooking() tính phí 50% khi hủy dưới 3 giờ và hoàn 50% nếu đã trả trước', async () => {
      const inTwoHours = dayjs().add(2, 'hour').toDate();
      mockBookingRepo.findAppointmentById.mockResolvedValue({
        AppointmentID: 301,
        AppointmentCode: 'BKG-TEST-301',
        CustomerID: 5,
        AppointmentAt: inTwoHours,
        AppointmentStatus: 'Confirmed',
        PaymentTiming: 'Prepaid',
        PaymentStatus: 'Prepaid_Paid',
        TotalAmount: 200000,
        customer: { CustomerID: 5, UserID: 10 },
      });
      mockBookingRepo.findLastPaidPaymentByAppointment.mockResolvedValue({ PaymentID: 55 });
      mockBookingRepo.createCancelRefund.mockResolvedValue({ RefundID: 9, RefundAmount: 100000 });
      mockBookingRepo.updateAppointment.mockResolvedValue({
        AppointmentID: 301,
        AppointmentCode: 'BKG-TEST-301',
        CustomerID: 5,
        PetID: 2,
        AppointmentStatus: 'Cancelled',
        PaymentStatus: 'Refunded',
        TotalAmount: 200000,
      });

      const result = await bookingService.cancelBooking(
        { id: 10, role: 'customer' },
        301,
        { reason: 'Bận đột xuất' }
      );

      expect(result.cancel_fee).toBe(100000);
      expect(mockBookingRepo.createCancelRefund).toHaveBeenCalledWith(
        expect.objectContaining({
          PaymentID: 55,
          ReturnRequestID: null,
          RefundType: 'AppointmentCancel',
          RefundAmount: 100000,
        }),
        expect.anything()
      );
      expect(result.booking.status).toBe('Cancelled');
    });

    test('TC-5: rescheduleBooking() chặn đổi lịch nếu còn dưới 24 giờ', async () => {
      mockBookingRepo.findAppointmentById.mockResolvedValue({
        AppointmentID: 302,
        AppointmentAt: dayjs().add(10, 'hour').toDate(),
        AppointmentStatus: 'Confirmed',
        customer: { CustomerID: 5, UserID: 10 },
      });

      await expect(
        bookingService.rescheduleBooking(
          { id: 10, role: 'customer' },
          302,
          { scheduled_at: dayjs().add(3, 'day').toISOString() }
        )
      ).rejects.toMatchObject({ statusCode: 400, errorCode: 'RESCHEDULE_TOO_LATE' });
    });
  });

  describe('PaymentService', () => {
    test('TC-6: createVnpayPaymentUrl() gọi usp_CreatePaymentRequest và trả về URL VNPAY', async () => {
      mockPaymentRepo.resolveCustomerByUserId.mockResolvedValue({ CustomerID: 5, UserID: 10 });
      mockPaymentRepo.findMethodByCode.mockResolvedValue({ PaymentMethodID: 3, MethodCode: 'E_WALLET' });
      mockPaymentRepo.findAppointmentById.mockResolvedValue({
        AppointmentID: 300,
        AppointmentCode: 'BKG-20261120-ABC123',
        CustomerID: 5,
        TotalAmount: 200000,
        PaymentStatus: 'Prepaid_Pending',
      });
      mockPaymentRepo.createPaymentRequestViaSp.mockResolvedValue({
        PaymentID: 88,
        PaymentCode: 'PAY-12345',
        CustomerID: 5,
        AppointmentID: 300,
        PaymentMethodID: 3,
        Amount: 200000,
        PaymentStatus: 'Pending',
      });
      mockGateway.buildPaymentUrl.mockReturnValue('https://sandbox.vnpayment.vn/pay?mock=1');

      const result = await paymentService.createVnpayPaymentUrl(
        { id: 10, role: 'customer' },
        { appointment_id: 300 },
        '127.0.0.1'
      );

      expect(result.payment.id).toBe(88);
      expect(result.payment_url).toContain('sandbox.vnpayment.vn');
      expect(mockPaymentRepo.createPaymentRequestViaSp).toHaveBeenCalled();
    });

    test('TC-7: handleVnpayCallback() xử lý thành công & đồng bộ trạng thái Appointment', async () => {
      mockGateway.verifyCallback.mockReturnValue({
        isValid: true,
        txnRef: 'PAY-12345',
        amount: 200000,
        isSuccess: true,
        transactionNo: '14009988',
      });
      mockPaymentRepo.processGatewayCallbackViaSp.mockResolvedValue({
        PaymentID: 88,
        PaymentCode: 'PAY-12345',
        CustomerID: 5,
        AppointmentID: 300,
        PaymentMethodID: 3,
        Amount: 200000,
        PaymentStatus: 'Paid',
      });
      mockPaymentRepo.findAppointmentById.mockResolvedValue({
        AppointmentID: 300,
        PaymentTiming: 'Prepaid',
      });

      const result = await paymentService.handleVnpayCallback({ vnp_TxnRef: 'PAY-12345' });

      expect(result.RspCode).toBe('00');
      expect(result.isSuccess).toBe(true);
      expect(mockPaymentRepo.syncAppointmentPaymentStatus).toHaveBeenCalledWith(300, 'Prepaid');
    });

    test('TC-8: handleVnpayCallback() trả RspCode 97 nếu chữ ký VNPAY không hợp lệ', async () => {
      mockGateway.verifyCallback.mockReturnValue({ isValid: false, isSuccess: false });

      const result = await paymentService.handleVnpayCallback({ vnp_TxnRef: 'FAKE' });

      expect(result.RspCode).toBe('97');
      expect(mockPaymentRepo.processGatewayCallbackViaSp).not.toHaveBeenCalled();
    });

    test('TC-9: confirmCashPayment() xác nhận thu tiền mặt và cập nhật Appointment sang Paid', async () => {
      mockPaymentRepo.findPaymentById.mockResolvedValue({
        PaymentID: 89,
        PaymentCode: 'PAY-CASH-1',
        CustomerID: 5,
        AppointmentID: 305,
        PaymentMethodID: 1,
        Amount: 150000,
        PaymentStatus: 'Pending',
      });
      mockPaymentRepo.markCashPaymentPaid.mockResolvedValue({
        PaymentID: 89,
        PaymentCode: 'PAY-CASH-1',
        CustomerID: 5,
        AppointmentID: 305,
        PaymentMethodID: 1,
        Amount: 150000,
        PaymentStatus: 'Paid',
      });
      mockPaymentRepo.findAppointmentById.mockResolvedValue({
        AppointmentID: 305,
        PaymentTiming: 'Postpaid',
      });

      const result = await paymentService.confirmCashPayment(1, 89);

      expect(result.status).toBe('Paid');
      expect(mockPaymentRepo.syncAppointmentPaymentStatus).toHaveBeenCalledWith(305, 'Postpaid');
    });

    test('TC-10: createBooking() chặn khi chuyên viên không có ca làm việc / đang nghỉ phép hoặc thú cưng trùng lịch bàn giao', async () => {
      const futureAt = dayjs().add(2, 'day').toISOString();
      mockBookingRepo.resolveCustomerByUserId.mockResolvedValue({ CustomerID: 5, UserID: 10 });
      mockBookingRepo.findPetById.mockResolvedValue({ PetID: 2, CustomerID: 5, PetName: 'Milo' });
      mockBookingRepo.findServicesByIds.mockResolvedValue([
        { ServiceID: 1, BasePrice: 200000, EstimatedDurationMinutes: 45, service_kind: 'medical' },
      ]);
      mockBookingRepo.findExpertById.mockResolvedValue({
        EmployeeID: 7,
        UserID: 70,
        EmployeeType: 'Doctor',
      });
      mockBookingRepo.hasOverlappingPetAppointment.mockResolvedValue(false);
      mockBookingRepo.hasOverlappingPetHandover.mockResolvedValue(true);

      await expect(
        bookingService.createBooking(
          { id: 10, role: 'customer' },
          { pet_id: 2, service_id: 1, expert_id: 7, scheduled_at: futureAt }
        )
      ).rejects.toMatchObject({ statusCode: 409, errorCode: 'PET_HANDOVER_CONFLICT' });

      mockBookingRepo.hasOverlappingPetHandover.mockResolvedValue(false);
      mockBookingRepo.hasOverlappingExpertAppointment.mockResolvedValue(false);
      mockBookingRepo.checkExpertScheduleAndLeave.mockResolvedValue({
        available: false,
        reason: 'Chuyên viên đang nghỉ phép vào ngày đã chọn',
      });

      await expect(
        bookingService.createBooking(
          { id: 10, role: 'customer' },
          { pet_id: 2, service_id: 1, expert_id: 7, scheduled_at: futureAt }
        )
      ).rejects.toMatchObject({ statusCode: 409, errorCode: 'EXPERT_NOT_AVAILABLE' });
    });

    test('TC-11: createVnpayPaymentUrl() chặn lịch Prepaid_Pending đã hết hạn và chặn thanh toán trùng Paid', async () => {
      mockPaymentRepo.resolveCustomerByUserId.mockResolvedValue({ CustomerID: 5, UserID: 10 });
      mockPaymentRepo.findMethodByCode.mockResolvedValue({ PaymentMethodID: 3, MethodCode: 'E_WALLET' });
      mockPaymentRepo.findAppointmentById.mockResolvedValue({
        AppointmentID: 310,
        AppointmentCode: 'BKG-EXPIRED',
        CustomerID: 5,
        AppointmentStatus: 'Pending',
        PaymentTiming: 'Prepaid',
        PaymentStatus: 'Prepaid_Pending',
        PaymentExpiresAt: dayjs().subtract(5, 'minute').toDate(),
        TotalAmount: 200000,
      });

      await expect(
        paymentService.createVnpayPaymentUrl({ id: 10, role: 'customer' }, { appointment_id: 310 })
      ).rejects.toMatchObject({ statusCode: 400, errorCode: 'PAYMENT_EXPIRED' });

      mockPaymentRepo.findAppointmentById.mockResolvedValue(null);
      mockPaymentRepo.findOrderById.mockResolvedValue({
        OrderID: 410,
        OrderCode: 'ORD-410',
        CustomerID: 5,
        TotalAmount: 350000,
        OrderStatus: 'Confirmed',
      });
      mockPaymentRepo.hasSuccessfulPaymentForTarget.mockResolvedValue(true);

      await expect(
        paymentService.createVnpayPaymentUrl({ id: 10, role: 'customer' }, { order_id: 410 })
      ).rejects.toMatchObject({ statusCode: 409, errorCode: 'ALREADY_PAID' });
    });

    test('TC-12: handleVnpayCallback() dùng mã xác định khi thiếu transactionNo và gửi cảnh báo khi trùng thanh toán', async () => {
      mockGateway.verifyCallback.mockReturnValue({
        isValid: true,
        txnRef: 'PAY-DUP-1',
        amount: 200000,
        isSuccess: true,
        responseCode: '00',
        transactionNo: '',
      });
      mockPaymentRepo.processGatewayCallbackViaSp.mockResolvedValue({
        ProcessingResult: 'DuplicatePaymentNeedsReconciliation',
        IsDuplicatePayment: true,
        PaymentID: 99,
        PaymentCode: 'PAY-DUP-1',
        CustomerID: 5,
        AppointmentID: 300,
        PaymentMethodID: 3,
        Amount: 200000,
        PaymentStatus: 'Duplicate',
      });

      const res = await paymentService.handleVnpayCallback({ vnp_TxnRef: 'PAY-DUP-1' });
      expect(mockPaymentRepo.processGatewayCallbackViaSp).toHaveBeenCalledWith(
        expect.objectContaining({
          gatewayTransactionCode: 'VNP-PAY-DUP-1-00',
        })
      );
      expect(res.isDuplicate).toBe(true);
      expect(mockNotificationRepo.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 1,
          type: 'duplicate_payment_reconciliation',
        })
      );
      expect(mockPaymentRepo.syncAppointmentPaymentStatus).not.toHaveBeenCalled();
    });

    test('TC-13: BookingExpiryJob tự động hủy các lịch Prepaid_Pending quá hạn và hủy Payment Pending liên quan', async () => {
      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        isTransactionActive: true,
        query: jest
          .fn()
          .mockResolvedValueOnce([{ lock_status: 0 }])
          .mockResolvedValueOnce([{ AppointmentID: 501, AppointmentCode: 'BKG-501' }])
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]),
      };
      const fakeDataSource = {
        isInitialized: true,
        createQueryRunner: jest.fn(() => mockQueryRunner),
      };

      const jobRes = await processExpiredPrepaidBookings(fakeDataSource);
      expect(jobRes.cancelledCount).toBe(1);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });
  });
});

