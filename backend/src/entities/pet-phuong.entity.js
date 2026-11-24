// Entity hồ sơ thú cưng + lịch sức khỏe + log cân + audit log,
// theo đúng schema Animora v1.5 mới (56 bảng, file Animora_v1.5__1___1.sql).
// Khác bản v1.6 (code cũ) ở những điểm sau — đã BỎ HẲN, không giữ tương thích ngược:
//  - pets.owner_id (users) -> pets.customer_id (customers); PK id -> pet_id;
//  - species/breed dạng chuỗi -> species_id/breed_id (FK) + custom_breed_name;
//  - name -> pet_name; weight -> weight_kg (+ weight_source); color -> coat_color;
//    avatar -> avatar_url; status -> is_hidden (+ hidden_reason...);
//  - pets.chronic: BỎ HẲN (không còn cột; không gộp vào đâu — theo chỉ đạo 24/11);
//  - pet_vaccinations -> pet_health_schedules (VACCINATION/DEWORMING/FOLLOW_UP);
//  - audit_logs -> system_audit_logs (cột mới: actor_role, audit_group, ...);
//  - log đổi cân ghi vào pet_weight_logs (không ghi audit_logs nữa).
import { EntitySchema } from 'typeorm';

const PetEntity = new EntitySchema({
  name: 'Pet',
  tableName: 'pets',
  columns: {
    pet_id: { type: 'bigint', primary: true, generated: 'increment' },
    pet_code: { type: 'nvarchar', length: 30, nullable: false }, // VD: PET-20261124-000001
    customer_id: { type: 'bigint', nullable: false },
    species_id: { type: 'int', nullable: false },
    breed_id: { type: 'int', nullable: true },
    custom_breed_name: { type: 'nvarchar', length: 120, nullable: true },
    pet_name: { type: 'nvarchar', length: 120, nullable: false },
    gender: { type: 'nvarchar', length: 15, default: 'UNKNOWN' }, // MALE, FEMALE, UNKNOWN
    birth_date: { type: 'date', nullable: true },
    estimated_age_months: { type: 'int', nullable: true },
    coat_color: { type: 'nvarchar', length: 100, nullable: true },
    avatar_url: { type: 'nvarchar', length: 1000, nullable: true },
    weight_kg: { type: 'decimal', precision: 6, scale: 2, nullable: true },
    weight_source: { type: 'nvarchar', length: 30, default: 'CUSTOMER_DECLARED' }, // CUSTOMER_DECLARED, RECEPTIONIST_DECLARED, DOCTOR_VERIFIED
    allergies: { type: 'nvarchar', length: 'MAX', nullable: true }, // JSON
    special_behaviors: { type: 'nvarchar', length: 'MAX', nullable: true }, // JSON
    neutered_status: { type: 'nvarchar', length: 20, default: 'UNKNOWN' }, // NEUTERED, INTACT, UNKNOWN
    medical_locked: { type: 'bit', default: false },
    medical_locked_by: { type: 'bigint', nullable: true },
    medical_locked_at: { type: 'datetime2', precision: 0, nullable: true },
    is_hidden: { type: 'bit', default: false },
    hidden_reason: { type: 'nvarchar', length: 500, nullable: true },
    hidden_by_user_id: { type: 'bigint', nullable: true },
    hidden_at: { type: 'datetime2', precision: 0, nullable: true },
    restored_by_user_id: { type: 'bigint', nullable: true },
    restored_at: { type: 'datetime2', precision: 0, nullable: true },
    row_version: { type: 'int', default: 1 },
    created_by_user_id: { type: 'bigint', nullable: false },
    created_at: { type: 'datetime2', precision: 0, createDate: true },
    updated_at: { type: 'datetime2', precision: 0, updateDate: true },
  },
});

// Lịch sức khỏe tổng quát (PET-07): tiêm chủng chỉ là 1 trong 3 loại lịch.
const PetHealthScheduleEntity = new EntitySchema({
  name: 'PetHealthSchedule',
  tableName: 'pet_health_schedules',
  columns: {
    health_schedule_id: { type: 'bigint', primary: true, generated: 'increment' },
    pet_id: { type: 'bigint', nullable: false },
    medical_record_id: { type: 'bigint', nullable: true },
    schedule_type: { type: 'nvarchar', length: 20, nullable: false }, // VACCINATION, DEWORMING, FOLLOW_UP
    title: { type: 'nvarchar', length: 200, nullable: false },
    performed_date: { type: 'date', nullable: true },
    next_due_date: { type: 'date', nullable: true },
    reminder_status: { type: 'nvarchar', length: 20, default: 'PENDING' }, // PENDING, SENT, COMPLETED, CANCELLED
    notes: { type: 'nvarchar', length: 1000, nullable: true },
    created_by_user_id: { type: 'bigint', nullable: false },
    created_at: { type: 'datetime2', precision: 0, createDate: true },
  },
});

// Lịch sử cân nặng (PET-02 đổi cân, MED-02 cân lúc khám).
// measurement_source: INITIAL_DECLARED, DOCTOR_UPDATE, SOAP_EXAM, COUNTER_WEIGHING.
const PetWeightLogEntity = new EntitySchema({
  name: 'PetWeightLog',
  tableName: 'pet_weight_logs',
  columns: {
    weight_log_id: { type: 'bigint', primary: true, generated: 'increment' },
    pet_id: { type: 'bigint', nullable: false },
    appointment_id: { type: 'bigint', nullable: true },
    weight_kg: { type: 'decimal', precision: 6, scale: 2, nullable: false },
    measurement_source: { type: 'nvarchar', length: 30, nullable: false },
    recorded_by_user_id: { type: 'bigint', nullable: false },
    recorded_by_role: { type: 'nvarchar', length: 10, nullable: false }, // KH, BS, LT...
    note: { type: 'nvarchar', length: 500, nullable: true },
    recorded_at: { type: 'datetime2', precision: 0, createDate: true },
  },
});

// Audit log hệ thống (PRD-05 cập nhật sản phẩm).
// audit_group: PROFILE, BOOKING_POS, CLINICAL_CARE, WAREHOUSE_SHOP_PO, HR_ADMIN.
// actor_role: KH, BS, NVCS, LT, QL, AD, SUP, SYSTEM.
const SystemAuditLogEntity = new EntitySchema({
  name: 'SystemAuditLog',
  tableName: 'system_audit_logs',
  columns: {
    audit_log_id: { type: 'bigint', primary: true, generated: 'increment' },
    actor_user_id: { type: 'bigint', nullable: true },
    actor_role: { type: 'nvarchar', length: 20, nullable: false },
    audit_group: { type: 'nvarchar', length: 30, nullable: false },
    action_type: { type: 'nvarchar', length: 80, nullable: false },
    entity_name: { type: 'nvarchar', length: 100, nullable: false },
    entity_id: { type: 'nvarchar', length: 100, nullable: false },
    old_values: { type: 'nvarchar', length: 'MAX', nullable: true },
    new_values: { type: 'nvarchar', length: 'MAX', nullable: true },
    reason: { type: 'nvarchar', length: 1000, nullable: true },
    ip_address: { type: 'nvarchar', length: 45, nullable: true },
    created_at: { type: 'datetime2', precision: 0, createDate: true },
  },
});

export {
  PetEntity,
  PetHealthScheduleEntity,
  PetWeightLogEntity,
  SystemAuditLogEntity,
};
