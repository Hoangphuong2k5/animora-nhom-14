// Validator đề xuất kho (MED-09).
// Chỉ nhận tên trường của schema v1.5 mới — medicine_name/note kiểu cũ
// đã BỎ HẲN, chỉ còn proposed_product_name / reason.
// proposal_type: RESTOCK (nhập thêm), NEW_DRUG (thuốc mới),
// DISCONTINUE (ngừng thuốc).
import Joi from 'joi';

const suggestMedicineSchema = Joi.object({
  proposal_type: Joi.string().valid('RESTOCK', 'NEW_DRUG', 'DISCONTINUE').required(),
  product_id: Joi.number().integer().positive().optional().allow(null),
  proposed_product_name: Joi.string().max(250).optional().allow(null, ''),
  proposed_unit_name: Joi.string().max(50).optional().allow(null, ''),
  proposed_quantity: Joi.number().integer().positive().optional().allow(null),
  suggested_supplier_id: Joi.number().integer().positive().optional().allow(null),
  reason: Joi.string().max(1000).required(),
});

const reviewProposalSchema = Joi.object({
  proposal_status: Joi.string().valid('APPROVED', 'REJECTED').required(),
  review_note: Joi.string().max(1000).optional().allow(null, ''),
});

export {
  suggestMedicineSchema,
  reviewProposalSchema,
};
