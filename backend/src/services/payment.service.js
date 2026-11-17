import crypto from 'crypto';
import defaultPaymentRepo from '../repositories/payment.repository.js';
import defaultNotificationRepo from '../repositories/notification.repository.js';
import vnpayProvider from '../providers/vnpay.provider.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { toPaymentDTO } from '../dtos/booking.dto.js';

/**
 * PaymentService (BKG-04, VNPAY & Cash Confirmation - AnimoraDB ver 1.5)
 */
class PaymentService {
  constructor(
    paymentRepo = defaultPaymentRepo,
    gateway = vnpayProvider,
    notificationRepo = defaultNotificationRepo
  ) {
    this.paymentRepo = paymentRepo;
    this.gateway = gateway;
    this.notificationRepo = notificationRepo;
  }

  async createVnpayPaymentUrl(currentUser, payload, ipAddr = '127.0.0.1') {
    const customer = await this.paymentRepo.resolveCustomerByUserId(currentUser.id);
    if (!customer) {
      throw new ApiError(404, 'Không tìm thấy hồ sơ khách hàng', 'CUSTOMER_NOT_FOUND');
    }

    const onlineMethod = await this.paymentRepo.findMethodByCode('E_WALLET');
    if (!onlineMethod) {
      throw new ApiError(500, 'Chưa cấu hình phương thức thanh toán trực tuyến', 'PAYMENT_METHOD_MISSING');
    }

    let targetAmount = 0;
    let orderInfo = '';
    let appointmentId = null;
    let orderId = null;

    if (payload.appointment_id) {
      const appointment = await this.paymentRepo.findAppointmentById(payload.appointment_id);
      if (!appointment) {
        throw new ApiError(404, 'Không tìm thấy lịch hẹn', 'BOOKING_NOT_FOUND');
      }
      if (Number(appointment.CustomerID) !== Number(customer.CustomerID)) {
        throw new ApiError(403, 'Bạn không có quyền thanh toán cho lịch hẹn này', 'FORBIDDEN');
      }
      if (['Cancelled', 'Rejected', 'NoShow'].includes(appointment.AppointmentStatus)) {
        throw new ApiError(
          400,
          'Không thể thanh toán cho lịch hẹn đã hủy hoặc bị từ chối',
          'INVALID_BOOKING_STATUS'
        );
      }
      if (
        appointment.PaymentTiming === 'Prepaid' &&
        appointment.PaymentStatus === 'Prepaid_Pending' &&
        appointment.PaymentExpiresAt &&
        new Date(appointment.PaymentExpiresAt) < new Date()
      ) {
        throw new ApiError(
          400,
          'Thời hạn giữ chỗ thanh toán trả trước (10 phút) đã hết. Vui lòng đặt lịch mới.',
          'PAYMENT_EXPIRED'
        );
      }
      if (['Prepaid_Paid', 'Paid', 'Refunded'].includes(appointment.PaymentStatus)) {
        throw new ApiError(409, 'Lịch hẹn này đã được thanh toán hoặc hoàn tiền', 'ALREADY_PAID');
      }
      appointmentId = Number(appointment.AppointmentID);
      targetAmount = Number(appointment.TotalAmount);
      orderInfo = `Thanh toan lich hen ${appointment.AppointmentCode}`;
    } else if (payload.order_id) {
      const order = await this.paymentRepo.findOrderById(payload.order_id);
      if (!order) {
        throw new ApiError(404, 'Không tìm thấy đơn hàng', 'ORDER_NOT_FOUND');
      }
      if (Number(order.CustomerID) !== Number(customer.CustomerID)) {
        throw new ApiError(403, 'Bạn không có quyền thanh toán cho đơn hàng này', 'FORBIDDEN');
      }
      if (order.OrderStatus === 'Cancelled') {
        throw new ApiError(400, 'Không thể thanh toán cho đơn hàng đã hủy', 'INVALID_ORDER_STATUS');
      }
      orderId = Number(order.OrderID);
      targetAmount = Number(order.TotalAmount);
      orderInfo = `Thanh toan don hang ${order.OrderCode}`;
    }

    if (targetAmount <= 0) {
      throw new ApiError(400, 'Số tiền thanh toán phải lớn hơn 0', 'INVALID_PAYMENT_AMOUNT');
    }

    if (typeof this.paymentRepo.hasSuccessfulPaymentForTarget === 'function') {
      const alreadyPaid = await this.paymentRepo.hasSuccessfulPaymentForTarget({
        appointmentId,
        orderId,
      });
      if (alreadyPaid) {
        throw new ApiError(
          409,
          'Giao dịch này đã được thanh toán thành công trước đó',
          'ALREADY_PAID'
        );
      }
    }

    const paymentCode = `PAY-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const idempotencyKey =
      payload.idempotency_key ||
      `VNP-${appointmentId ? `APP-${appointmentId}` : `ORD-${orderId}`}-${customer.CustomerID}-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    const payment = await this.paymentRepo.createPaymentRequestViaSp({
      customerId: Number(customer.CustomerID),
      paymentMethodId: Number(onlineMethod.PaymentMethodID),
      paymentCode,
      amount: targetAmount,
      idempotencyKey,
      appointmentId,
      orderId,
    });

    if (!payment || payment.PaymentStatus !== 'Pending') {
      throw new ApiError(
        409,
        'Không thể khởi tạo URL thanh toán do trạng thái giao dịch không hợp lệ',
        'INVALID_PAYMENT_STATUS'
      );
    }

    const paymentUrl = this.gateway.buildPaymentUrl({
      txnRef: payment.PaymentCode,
      amount: Number(payment.Amount),
      orderInfo,
      ipAddr,
      bankCode: payload.bank_code || undefined,
    });

    return {
      payment: toPaymentDTO(payment),
      payment_url: paymentUrl,
    };
  }

  async handleVnpayCallback(query) {
    const verification = this.gateway.verifyCallback(query);
    if (!verification.isValid) {
      return {
        RspCode: '97',
        Message: 'Invalid signature',
        isValid: false,
        isSuccess: false,
      };
    }

    const rawTxnNo = String(verification.transactionNo || '').trim();
    const gatewayTransactionCode =
      rawTxnNo && rawTxnNo !== '0'
        ? rawTxnNo
        : `VNP-${verification.txnRef || 'UNKNOWN'}-${verification.responseCode || 'ERR'}`;

    const gatewayStatus = verification.isSuccess ? 'Success' : 'Failed';
    const result = await this.paymentRepo.processGatewayCallbackViaSp({
      paymentCode: verification.txnRef,
      gatewayName: 'VNPAY',
      gatewayTransactionCode,
      gatewayStatus,
      transactionAmount: verification.amount,
      rawResponse: JSON.stringify(query),
    });

    const isDuplicateReconciliation =
      result &&
      (result.ProcessingResult === 'DuplicatePaymentNeedsReconciliation' ||
        result.PaymentStatus === 'Duplicate' ||
        result.IsDuplicatePayment === true ||
        Number(result.IsDuplicatePayment) === 1);

    if (isDuplicateReconciliation) {
      logger.warn('Duplicate payment detected during VNPAY callback - requires reconciliation', {
        paymentId: result.PaymentID,
        paymentCode: result.PaymentCode,
        gatewayTransactionCode,
        appointmentId: result.AppointmentID || null,
        orderId: result.OrderID || null,
      });

      if (
        this.notificationRepo &&
        typeof this.paymentRepo.findManagerAndAdminUserIds === 'function'
      ) {
        try {
          const staffIds = await this.paymentRepo.findManagerAndAdminUserIds();
          for (const staffUserId of staffIds) {
            await this.notificationRepo.createNotification({
              user_id: staffUserId,
              type: 'duplicate_payment_reconciliation',
              title: `Cảnh báo trùng thanh toán ${result.PaymentCode}`,
              content: `Phát hiện giao dịch thanh toán trùng (Mã GD: ${gatewayTransactionCode}, Số tiền: ${result.Amount}). Cần đối soát hoàn tiền.`,
              ref_type: 'Payment',
              ref_id: Number(result.PaymentID),
            });
          }
        } catch (notifyErr) {
          logger.error('Failed to notify staff for duplicate payment reconciliation', {
            message: notifyErr.message,
          });
        }
      }
    }

    if (
      verification.isSuccess &&
      result &&
      result.AppointmentID &&
      result.PaymentStatus === 'Paid'
    ) {
      const appointment = await this.paymentRepo.findAppointmentById(result.AppointmentID);
      if (appointment) {
        await this.paymentRepo.syncAppointmentPaymentStatus(
          appointment.AppointmentID,
          appointment.PaymentTiming
        );
      }
    }

    return {
      RspCode: '00',
      Message: 'Confirm Success',
      isValid: true,
      isSuccess: verification.isSuccess,
      isDuplicate: Boolean(isDuplicateReconciliation),
      payment: result ? toPaymentDTO(result) : null,
    };
  }

  async confirmCashPayment(adminOrStaffUserId, paymentId) {
    if (typeof this.paymentRepo.confirmCashPaymentAtomic === 'function') {
      const updatedAtomic = await this.paymentRepo.confirmCashPaymentAtomic(
        paymentId,
        adminOrStaffUserId
      );
      return toPaymentDTO(updatedAtomic);
    }

    const payment = await this.paymentRepo.findPaymentById(paymentId);
    if (!payment) {
      throw new ApiError(404, 'Không tìm thấy giao dịch thanh toán', 'PAYMENT_NOT_FOUND');
    }
    if (payment.PaymentStatus === 'Paid') {
      throw new ApiError(409, 'Giao dịch này đã được xác nhận thanh toán trước đó', 'ALREADY_PAID');
    }
    if (payment.PaymentStatus !== 'Pending') {
      throw new ApiError(
        400,
        `Không thể xác nhận thu tiền cho giao dịch ở trạng thái "${payment.PaymentStatus}"`,
        'INVALID_PAYMENT_STATUS'
      );
    }

    const updated = await this.paymentRepo.markCashPaymentPaid(paymentId, adminOrStaffUserId);
    if (updated && updated.AppointmentID) {
      const appointment = await this.paymentRepo.findAppointmentById(updated.AppointmentID);
      if (appointment) {
        await this.paymentRepo.syncAppointmentPaymentStatus(
          appointment.AppointmentID,
          appointment.PaymentTiming
        );
      }
    }

    return toPaymentDTO(updated);
  }

  async listMyPayments(userId, query = {}) {
    const customer = await this.paymentRepo.resolveCustomerByUserId(userId);
    if (!customer) {
      throw new ApiError(404, 'Không tìm thấy hồ sơ khách hàng', 'CUSTOMER_NOT_FOUND');
    }

    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
    const { items, totalItems } = await this.paymentRepo.findPaymentsByCustomer(
      Number(customer.CustomerID),
      { page, limit }
    );

    return {
      items: items.map(toPaymentDTO),
      page,
      limit,
      totalItems,
    };
  }
}

const defaultPaymentService = new PaymentService();
export { defaultPaymentService, PaymentService };
export default defaultPaymentService;

