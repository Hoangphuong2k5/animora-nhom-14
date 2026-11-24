// Entity đơn thuốc + chi tiết đơn, theo đúng schema Animora v1.5 mới
// (dbo.prescriptions / dbo.prescription_items, file Animora_v1.5__1___1.sql).
// Đã BỎ HẲN so với bản v1.6 (không giữ tương thích ngược):
//  - version / parent_id: BỎ — không còn versioning (quyết định D2(a): MED-05
//    hủy đơn cũ (CANCELLED) + kê đơn mới, không tạo phiên bản);
//  - allow_reorder: BỎ — suy ra từ max_refills > 0;
//  - status 'active'/'superseded': BỎ — trạng thái mới là
//    DRAFT/ISSUED/EXHAUSTED/EXPIRED/CANCELLED (mặc định ISSUED);
//  - prescription_items.product_name: BỎ — tên snapshot chuyển sang
//    shop_order_items.product_name_snapshot lúc mua;
//  - usage_note -> usage_instructions; dosage bắt buộc (NOT NULL, tối đa 200);
//  - Mới: prescription_code, appointment_id, customer_id, prescribed_date,
//    used_refills (bộ đếm mua lại, CHECK used_refills <= max_refills),
//    counter_payment_status (NONE/PAID_AT_COUNTER), unit_price_snapshot,
//    species_mismatch_ack; CHECK bệnh nặng (SEVERE) thì max_refills = 0.
import { EntitySchema } from 'typeorm';

const PrescriptionEntity = new EntitySchema({
  name: 'Prescription',
  tableName: 'prescriptions',
  columns: {
    prescription_id: { type: 'bigint', primary: true, generated: 'increment' },
    prescription_code: { type: 'nvarchar', length: 30, nullable: false }, // VD: RX-20261124-000001
    medical_record_id: { type: 'bigint', nullable: false },
    appointment_id: { type: 'bigint', nullable: false },
    pet_id: { type: 'bigint', nullable: false },
    customer_id: { type: 'bigint', nullable: false },
    doctor_user_id: { type: 'bigint', nullable: false },
    prescribed_date: { type: 'date', nullable: false },
    severity_level: { type: 'nvarchar', length: 10, nullable: false }, // MILD, SEVERE
    max_refills: { type: 'int', default: 0 },
    used_refills: { type: 'int', default: 0 },
    valid_until: { type: 'date', nullable: true },
    prescription_status: { type: 'nvarchar', length: 20, default: 'ISSUED' }, // DRAFT, ISSUED, EXHAUSTED, EXPIRED, CANCELLED
    counter_payment_status: { type: 'nvarchar', length: 20, default: 'NONE' }, // NONE, PAID_AT_COUNTER
    counter_paid_at: { type: 'datetime2', precision: 0, nullable: true },
    counter_paid_by: { type: 'bigint', nullable: true },
    notes: { type: 'nvarchar', length: 1500, nullable: true },
    created_at: { type: 'datetime2', precision: 0, createDate: true },
    updated_at: { type: 'datetime2', precision: 0, updateDate: true },
  },
});

const PrescriptionItemEntity = new EntitySchema({
  name: 'PrescriptionItem',
  tableName: 'prescription_items',
  columns: {
    prescription_item_id: { type: 'bigint', primary: true, generated: 'increment' },
    prescription_id: { type: 'bigint', nullable: false },
    product_id: { type: 'bigint', nullable: false },
    quantity: { type: 'int', nullable: false },
    dosage: { type: 'nvarchar', length: 200, nullable: false },
    frequency: { type: 'nvarchar', length: 200, nullable: true },
    duration_days: { type: 'int', nullable: true },
    usage_instructions: { type: 'nvarchar', length: 1000, nullable: true },
    unit_price_snapshot: { type: 'decimal', precision: 15, scale: 2, nullable: false },
    species_mismatch_ack: { type: 'bit', default: false },
  },
});

export { PrescriptionEntity, PrescriptionItemEntity };
