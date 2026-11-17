// Entity hồ sơ thú cưng + tiêm chủng, theo đúng schema thật của nhóm
// (animora-sqlserver-v0_1.sql v1.6, 54 bảng) và mẫu §7.2 trong rules.md.
// KHÁC mẫu trong rules.md ở 2 chỗ — đây là chỗ mẫu sai so với schema thật:
//  - cột cân nặng tên là `weight` (DECIMAL 6,2), KHÔNG phải `weight_kg`.
//  - bảng pets có thêm cột `chronic` (JSON) và `color`; `avatar` chỉ dài 255,
//    `name` chỉ dài 100, `vaccine_name` chỉ dài 100, `note` chỉ dài 255.
// pet_vaccinations KHÔNG có cột created_at.
import { EntitySchema } from 'typeorm';
// Ngoại lệ 1 (merge 17/11): PetEntity trùng với file pet.entity.js của Hoàng nên
// KHÔNG khai báo lại ở đây — import từ file của Hoàng, export lại để code
// repository của Phương dùng tiếp được mà không động vào file của Hoàng.
import { PetEntity } from './pet.entity.js';

const PetVaccinationEntity = new EntitySchema({
  name: 'PetVaccination',
  tableName: 'pet_vaccinations',
  columns: {
    id: { type: 'bigint', primary: true, generated: 'increment' },
    pet_id: { type: 'bigint', nullable: false },
    vaccine_name: { type: 'nvarchar', length: 100, nullable: false },
    vaccinated_at: { type: 'date', nullable: true },
    next_due_date: { type: 'date', nullable: true },
    note: { type: 'nvarchar', length: 255, nullable: true },
  },
});

// Chỉ dùng cho log đổi cân nặng (PET-02, action 'UPDATE_WEIGHT') — bảng thật
// dbo.audit_logs, xem docs/schema-assumptions.md mục 18 trong bản node-mssql.
const AuditLogEntity = new EntitySchema({
  name: 'AuditLog',
  tableName: 'audit_logs',
  columns: {
    id: { type: 'bigint', primary: true, generated: 'increment' },
    actor_id: { type: 'bigint', nullable: true },
    action: { type: 'nvarchar', length: 50, nullable: false },
    entity_type: { type: 'nvarchar', length: 50, nullable: false },
    entity_id: { type: 'bigint', nullable: false },
    old_values: { type: 'nvarchar', length: 'MAX', nullable: true },
    new_values: { type: 'nvarchar', length: 'MAX', nullable: true },
    ip_address: { type: 'nvarchar', length: 45, nullable: true },
    created_at: { type: 'datetime2', precision: 0, createDate: true },
  },
});

export { PetEntity, PetVaccinationEntity, AuditLogEntity };
