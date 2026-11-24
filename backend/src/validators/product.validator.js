// Validator sản phẩm + danh mục (PRD-01–05).
// Chỉ nhận tên trường của schema v1.5 mới — name, slug, price, category_id,
// status/is_active, images/image_url, parent_id đã BỎ HẲN.
// sku + unit_name bắt buộc (NOT NULL trong DB); danh mục phẳng.
import Joi from 'joi';

const createCategorySchema = Joi.object({
  category_name: Joi.string().max(150).required(),
  description: Joi.string().max(500).optional().allow(null, ''),
  is_active: Joi.boolean().optional(),
});

const updateCategorySchema = Joi.object({
  category_name: Joi.string().max(150).optional(),
  description: Joi.string().max(500).optional().allow(null, ''),
  is_active: Joi.boolean().optional(),
}).min(1);

const createProductSchema = Joi.object({
  sku: Joi.string().max(60).required(),
  product_name: Joi.string().max(250).required(),
  product_category_id: Joi.number().integer().positive().required(),
  unit_name: Joi.string().max(50).required(),
  product_type: Joi.string().valid('RETAIL', 'MEDICINE', 'VACCINE').optional(),
  description: Joi.string().optional().allow(null, ''),
  thumbnail_url: Joi.string().max(1000).optional().allow(null, ''),
  unit_price: Joi.number().min(0).required(),
  cost_price: Joi.number().min(0).optional().allow(null),
  requires_prescription: Joi.boolean().optional(),
  target_species_codes: Joi.string().max(100).optional().allow(null, ''),
  stock_quantity: Joi.number().integer().min(0).optional(),
  defective_quantity: Joi.number().integer().min(0).optional(),
  default_supplier_id: Joi.number().integer().positive().optional().allow(null),
  lead_time_days: Joi.number().integer().min(0).optional(),
  safety_stock_days: Joi.number().integer().min(0).optional(),
  is_hidden: Joi.boolean().optional(),
  brand: Joi.string().max(150).optional().allow(null, ''),
});

const updateProductSchema = Joi.object({
  sku: Joi.string().max(60).optional(),
  product_name: Joi.string().max(250).optional(),
  product_category_id: Joi.number().integer().positive().optional(),
  unit_name: Joi.string().max(50).optional(),
  product_type: Joi.string().valid('RETAIL', 'MEDICINE', 'VACCINE').optional(),
  description: Joi.string().optional().allow(null, ''),
  thumbnail_url: Joi.string().max(1000).optional().allow(null, ''),
  unit_price: Joi.number().min(0).optional(),
  cost_price: Joi.number().min(0).optional().allow(null),
  requires_prescription: Joi.boolean().optional(),
  target_species_codes: Joi.string().max(100).optional().allow(null, ''),
  stock_quantity: Joi.number().integer().min(0).optional(),
  defective_quantity: Joi.number().integer().min(0).optional(),
  default_supplier_id: Joi.number().integer().positive().optional().allow(null),
  lead_time_days: Joi.number().integer().min(0).optional(),
  safety_stock_days: Joi.number().integer().min(0).optional(),
  is_hidden: Joi.boolean().optional(),
  brand: Joi.string().max(150).optional().allow(null, ''),
}).min(1);

export {
  createCategorySchema,
  updateCategorySchema,
  createProductSchema,
  updateProductSchema,
};
