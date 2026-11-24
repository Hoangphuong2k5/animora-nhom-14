// Entity thanh toán lịch hẹn + hóa đơn, theo đúng schema Animora v1.5 mới
// (dbo.appointment_payments / dbo.invoices, file Animora_v1.5__1___1.sql).
// payments (v1.6) -> appointment_payments:
//  - booking_id -> appointment_id; kind -> transaction_direction
//    (SERVICE_CHARGE, WEIGHT_TOPUP, REFUND, PRESCRIPTION_COUNTER_SALE);
//  - method -> payment_method (CASH, BANK_TRANSFER, VNPAY, PAYOS);
//  - confirmed_by -> operator_user_id (người thu = LT lễ tân — D9);
//  - Mới: payment_code, gateway_transaction_ref, idempotency_key
//    (chống thu trùng — guard 409), prescription_id
//    (bắt buộc khi PRESCRIPTION_COUNTER_SALE), reason
//    (bắt buộc khi hoàn tiền/topup thủ công), paid_at.
//  - 1 hóa đơn / 1 lịch hẹn: invoices.appointment_id UNIQUE.
//    service_total, prescription_total, discount_total, grand_total >= 0.
import { EntitySchema } from 'typeorm';

const AppointmentPaymentEntity = new EntitySchema({
  name: 'AppointmentPayment',
  tableName: 'appointment_payments',
  columns: {
    payment_id: { type: 'bigint', primary: true, generated: 'increment' },
    payment_code: { type: 'nvarchar', length: 40, nullable: false }, // VD: PAY-20261124-000001
    appointment_id: { type: 'bigint', nullable: false },
    prescription_id: { type: 'bigint', nullable: true },
    transaction_direction: { type: 'nvarchar', length: 30, nullable: false }, // SERVICE_CHARGE, WEIGHT_TOPUP, REFUND, PRESCRIPTION_COUNTER_SALE
    payment_method: { type: 'nvarchar', length: 20, nullable: false }, // CASH, BANK_TRANSFER, VNPAY, PAYOS
    amount: { type: 'decimal', precision: 15, scale: 2, nullable: false },
    payment_tx_status: { type: 'nvarchar', length: 20, default: 'PENDING' }, // PENDING, SUCCESS, FAILED, CANCELLED
    gateway_transaction_ref: { type: 'nvarchar', length: 100, nullable: true },
    idempotency_key: { type: 'nvarchar', length: 120, nullable: true },
    operator_user_id: { type: 'bigint', nullable: true },
    reason: { type: 'nvarchar', length: 500, nullable: true },
    paid_at: { type: 'datetime2', precision: 0, nullable: true },
    created_at: { type: 'datetime2', precision: 0, createDate: true },
  },
});

const InvoiceEntity = new EntitySchema({
  name: 'Invoice',
  tableName: 'invoices',
  columns: {
    invoice_id: { type: 'bigint', primary: true, generated: 'increment' },
    invoice_code: { type: 'nvarchar', length: 40, nullable: false }, // VD: INV-20261124-000001
    appointment_id: { type: 'bigint', nullable: false },
    customer_id: { type: 'bigint', nullable: false },
    service_total: { type: 'decimal', precision: 15, scale: 2, nullable: false },
    prescription_total: { type: 'decimal', precision: 15, scale: 2, nullable: false },
    discount_total: { type: 'decimal', precision: 15, scale: 2, nullable: false },
    grand_total: { type: 'decimal', precision: 15, scale: 2, nullable: false },
    issued_by_user_id: { type: 'bigint', nullable: false },
    issued_at: { type: 'datetime2', precision: 0, createDate: true },
    notes: { type: 'nvarchar', length: 1000, nullable: true },
  },
});

export { AppointmentPaymentEntity, InvoiceEntity };
