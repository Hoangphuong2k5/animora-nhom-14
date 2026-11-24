// Entity đề xuất kho, theo đúng schema Animora v1.5 mới
// (dbo.warehouse_proposals, file Animora_v1.5__1___1.sql).
// medicine_suggestions (v1.6) -> warehouse_proposals — hộp thuốc riêng
// từng bác sĩ đã BỎ, dùng 1 kho chung (v1.5):
//  - medicine_name -> product_id (RESTOCK/DISCONTINUE) hoặc
//    proposed_product_name (NEW_DRUG); note -> reason (bắt buộc);
//  - suggested_by -> proposed_by_doctor_id (NOT NULL, users.user_id);
//  - status pending/approved/rejected -> PENDING/APPROVED/REJECTED;
//  - Mới: proposal_code, proposal_type (RESTOCK/NEW_DRUG/DISCONTINUE),
//    proposed_unit_name, proposed_quantity, suggested_supplier_id,
//    reviewed_by_ql_id, reviewed_at, review_note, linked_po_id
//    (nối phiếu nhập — chưa làm, để phần PO của nhóm).
// CHECK: NEW_DRUG bắt buộc proposed_product_name;
// RESTOCK/DISCONTINUE bắt buộc product_id; proposed_quantity NULL hoặc > 0.
import { EntitySchema } from 'typeorm';

const WarehouseProposalEntity = new EntitySchema({
  name: 'WarehouseProposal',
  tableName: 'warehouse_proposals',
  columns: {
    proposal_id: { type: 'bigint', primary: true, generated: 'increment' },
    proposal_code: { type: 'nvarchar', length: 40, nullable: false }, // VD: PRP-20261124-000001
    proposal_type: { type: 'nvarchar', length: 20, nullable: false }, // RESTOCK, NEW_DRUG, DISCONTINUE
    product_id: { type: 'bigint', nullable: true },
    proposed_product_name: { type: 'nvarchar', length: 250, nullable: true },
    proposed_unit_name: { type: 'nvarchar', length: 50, nullable: true },
    proposed_quantity: { type: 'int', nullable: true },
    suggested_supplier_id: { type: 'bigint', nullable: true },
    reason: { type: 'nvarchar', length: 1000, nullable: false },
    proposal_status: { type: 'nvarchar', length: 20, default: 'PENDING' }, // PENDING, APPROVED, REJECTED
    proposed_by_doctor_id: { type: 'bigint', nullable: false },
    reviewed_by_ql_id: { type: 'bigint', nullable: true },
    reviewed_at: { type: 'datetime2', precision: 0, nullable: true },
    review_note: { type: 'nvarchar', length: 1000, nullable: true },
    linked_po_id: { type: 'bigint', nullable: true },
    created_at: { type: 'datetime2', precision: 0, createDate: true },
  },
});

export { WarehouseProposalEntity };
