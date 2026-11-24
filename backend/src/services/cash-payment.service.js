// Service thu tiền mặt tại quầy (SPAY-05) — theo schema Animora v1.5 mới.
// payments -> appointment_payments; bookings -> appointments.
// Người thu là LT (lễ tân) tại quầy (D9) — không còn là bác sĩ xác nhận.
// Số tiền = appointments.final_total_amount.
// Chống thu trùng (giữ nguyên guard 409): (1) đã có dòng
// SERVICE_CHARGE/CASH/SUCCESS cho lịch hẹn này, (2) idempotency_key đã dùng.
// Thu xong: appointments.payment_status = 'PAID' + paid_amount,
// và tạo hóa đơn (invoices, 1 hóa đơn / 1 lịch hẹn, nếu chưa có).
import { AppDataSource } from '../config/data-source.js';
import * as cashPaymentRepository from '../repositories/cash-payment.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { generateCode } from '../utils/codeGenerator.js';

// SPAY-05: Lễ tân thu tiền mặt tại quầy cho 1 lịch hẹn.
const confirmCashPayment = async (appointmentId, userId, payload = {}) => {
  const appointment = await cashPaymentRepository.findAppointmentById(appointmentId);
  if (!appointment) {
    throw new ApiError(404, 'Không tìm thấy lịch hẹn', 'APPOINTMENT_NOT_FOUND');
  }
  if (['CANCELLED', 'NO_SHOW', 'HOLD_EXPIRED'].includes(appointment.appointment_status)) {
    throw new ApiError(409, 'Lịch hẹn đã hủy/không đến nên không thu tiền được', 'INVALID_APPOINTMENT_STATUS');
  }
  if (appointment.payment_status === 'PAID') {
    throw new ApiError(409, 'Lịch hẹn này đã được thanh toán', 'ALREADY_PAID');
  }

  const amount = Number(appointment.final_total_amount);
  if (!amount || amount <= 0) {
    throw new ApiError(409, 'Lịch hẹn không có số tiền cần thu', 'INVALID_AMOUNT');
  }

  const existingCash = await cashPaymentRepository.countExistingCashPayment(appointmentId);
  if (existingCash > 0) {
    throw new ApiError(409, 'Lịch hẹn này đã thu tiền mặt rồi', 'DUPLICATE_CASH_PAYMENT');
  }

  const idempotencyKey = payload.idempotency_key || null;
  if (idempotencyKey) {
    const existingKey = await cashPaymentRepository.findPaymentByIdempotencyKey(idempotencyKey);
    if (existingKey) {
      throw new ApiError(409, 'Yêu cầu thu tiền này đã được xử lý rồi', 'DUPLICATE_REQUEST');
    }
  }

  return AppDataSource.transaction(async (manager) => {
    const payment = await cashPaymentRepository.createPayment(
      {
        payment_code: generateCode('PAY'),
        appointment_id: Number(appointmentId),
        prescription_id: payload.prescription_id ? Number(payload.prescription_id) : null,
        transaction_direction: 'SERVICE_CHARGE',
        payment_method: 'CASH',
        amount,
        payment_tx_status: 'SUCCESS',
        gateway_transaction_ref: null,
        idempotency_key: idempotencyKey,
        operator_user_id: Number(userId), // LT thu tiền tại quầy
        reason: payload.note || null,
        paid_at: new Date(),
      },
      manager,
    );

    await cashPaymentRepository.updateAppointmentPaid(
      appointmentId,
      amount,
      (appointment.row_version || 1) + 1,
      manager,
    );

    // Tạo hóa đơn nếu chưa có (invoices.appointment_id UNIQUE).
    const existingInvoice = await cashPaymentRepository.findInvoiceByAppointmentId(appointmentId, manager);
    let invoice = existingInvoice;
    if (!invoice) {
      invoice = await cashPaymentRepository.createInvoice(
        {
          invoice_code: generateCode('INV'),
          appointment_id: Number(appointmentId),
          customer_id: Number(appointment.customer_id),
          service_total: amount,
          prescription_total: 0,
          discount_total: 0,
          grand_total: amount,
          issued_by_user_id: Number(userId),
          notes: payload.note || null,
        },
        manager,
      );
    }

    return { payment, invoice };
  });
};

export { confirmCashPayment };
