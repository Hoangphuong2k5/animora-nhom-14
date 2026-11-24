// Repository thu tiền mặt tại quầy (SPAY-05) — theo schema Animora v1.5 mới.
// payments -> appointment_payments; bookings -> appointments.
// Người thu là LT (lễ tân) tại quầy, không còn là bác sĩ xác nhận (D9).
// Chống thu trùng: (1) đã có dòng SERVICE_CHARGE/CASH/SUCCESS cho lịch hẹn
// này, (2) idempotency_key đã dùng — cả 2 đều trả 409.
// Thu xong: cập nhật appointments.payment_status = 'PAID', paid_amount,
// và tạo hóa đơn (invoices, 1 hóa đơn / 1 lịch hẹn).
import { AppDataSource } from '../config/data-source.js';
import { AppointmentPaymentEntity, InvoiceEntity } from '../entities/payment.entity.js';
import { ApiError } from '../utils/ApiError.js';

const getAppointmentPaymentRepo = (manager = null) => (manager || AppDataSource).getRepository(AppointmentPaymentEntity);
const getInvoiceRepo = (manager = null) => (manager || AppDataSource).getRepository(InvoiceEntity);

const findAppointmentById = async (appointmentId, manager = null) => {
  const db = manager || AppDataSource;
  const rows = await db.query(`SELECT * FROM dbo.appointments WHERE appointment_id = @0`, [Number(appointmentId)]);
  return rows[0] || null;
};

const countExistingCashPayment = async (appointmentId, manager = null) => {
  const db = manager || AppDataSource;
  const rows = await db.query(
    `SELECT COUNT(*) AS c FROM dbo.appointment_payments
     WHERE appointment_id = @0
       AND transaction_direction = 'SERVICE_CHARGE'
       AND payment_method = 'CASH'
       AND payment_tx_status = 'SUCCESS'`,
    [Number(appointmentId)],
  );
  return Number(rows[0].c);
};

const findPaymentByIdempotencyKey = async (idempotencyKey, manager = null) => {
  const db = manager || AppDataSource;
  const rows = await db.query(
    `SELECT * FROM dbo.appointment_payments WHERE idempotency_key = @0`,
    [idempotencyKey],
  );
  return rows[0] || null;
};

const createPayment = async (paymentData, manager = null) => {
  const payment = getAppointmentPaymentRepo(manager).create(paymentData);
  return getAppointmentPaymentRepo(manager).save(payment);
};

const updateAppointmentPaid = async (appointmentId, paidAmount, rowVersion, manager = null) => {
  const db = manager || AppDataSource;
  await db.query(
    `UPDATE dbo.appointments
     SET payment_status = 'PAID', paid_amount = @1, row_version = @2, updated_at = SYSDATETIME()
     WHERE appointment_id = @0`,
    [Number(appointmentId), Number(paidAmount), Number(rowVersion)],
  );
  return findAppointmentById(appointmentId, manager);
};

const findInvoiceByAppointmentId = async (appointmentId, manager = null) => {
  return getInvoiceRepo(manager).findOne({ where: { appointment_id: Number(appointmentId) } });
};

const createInvoice = async (invoiceData, manager = null) => {
  const invoice = getInvoiceRepo(manager).create(invoiceData);
  return getInvoiceRepo(manager).save(invoice);
};

export {
  findAppointmentById,
  countExistingCashPayment,
  findPaymentByIdempotencyKey,
  createPayment,
  updateAppointmentPaid,
  findInvoiceByAppointmentId,
  createInvoice,
};
