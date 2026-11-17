import Joi from 'joi';

const createSupplierSchema = Joi.object({
  user_id: Joi.number().integer().positive().required(),
  company_name: Joi.string().trim().max(200).required(),
  contact_name: Joi.string().trim().max(150).allow('', null).optional(),
  phone: Joi.string().trim().max(20).allow('', null).optional(),
  email: Joi.string().trim().email().max(255).allow('', null).optional(),
  address: Joi.string().trim().max(500).allow('', null).optional(),
  tax_code: Joi.string().trim().max(50).allow('', null).optional(),
});

const updateSupplierSchema = Joi.object({
  company_name: Joi.string().trim().max(200).optional(),
  contact_name: Joi.string().trim().max(150).allow('', null).optional(),
  phone: Joi.string().trim().max(20).allow('', null).optional(),
  email: Joi.string().trim().email().max(255).allow('', null).optional(),
  address: Joi.string().trim().max(500).allow('', null).optional(),
  tax_code: Joi.string().trim().max(50).allow('', null).optional(),
}).min(1);

const lockSupplierSchema = Joi.object({
  status: Joi.string().valid('active', 'locked').required(),
});

const supplierQuerySchema = Joi.object({
  status: Joi.string().valid('active', 'locked').optional(),
  keyword: Joi.string().trim().max(100).optional(),
  after_id: Joi.number().integer().positive().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const upsertSupplierPriceSchema = Joi.object({
  product_variant_id: Joi.number().integer().positive().optional(),
  product_id: Joi.number().integer().positive().optional(),
  supplier_sku: Joi.string().trim().max(100).allow('', null).optional(),
  price: Joi.number().min(0).precision(2).required(),
}).or('product_variant_id', 'product_id');

const createPurchaseOrderSchema = Joi.object({
  supplier_id: Joi.number().integer().positive().required(),
  status: Joi.string().valid('draft', 'sent').default('sent'),
  expected_date: Joi.date().iso().allow(null).optional(),
  note: Joi.string().trim().max(1000).allow('', null).optional(),
  items: Joi.array()
    .items(
      Joi.object({
        product_variant_id: Joi.number().integer().positive().optional(),
        product_id: Joi.number().integer().positive().optional(),
        quantity: Joi.number().integer().min(1).required(),
        unit_price: Joi.number().min(0).precision(2).required(),
      }).or('product_variant_id', 'product_id')
    )
    .min(1)
    .required(),
});

const updatePurchaseOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('draft', 'sent', 'confirmed', 'accepted', 'rejected', 'shipping', 'cancelled')
    .required(),
});

const supplierRespondPoSchema = Joi.object({
  status: Joi.string().valid('confirmed', 'accepted', 'rejected').required(),
});

const supplierShippingStatusSchema = Joi.object({
  status: Joi.string().valid('shipping').required(),
});

const poQuerySchema = Joi.object({
  supplier_id: Joi.number().integer().positive().optional(),
  status: Joi.string()
    .valid(
      'draft',
      'sent',
      'confirmed',
      'accepted',
      'rejected',
      'shipping',
      'partially_received',
      'received',
      'cancelled'
    )
    .optional(),
  after_id: Joi.number().integer().positive().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const createGoodsReceiptSchema = Joi.object({
  po_id: Joi.number().integer().positive().required(),
  note: Joi.string().trim().max(1000).allow('', null).optional(),
  items: Joi.array()
    .items(
      Joi.object({
        product_variant_id: Joi.number().integer().positive().optional(),
        product_id: Joi.number().integer().positive().optional(),
        qty_received: Joi.number().integer().min(0).required(),
        qty_damaged: Joi.number().integer().min(0).default(0),
        batch_code: Joi.string().trim().max(100).required(),
        expiry_date: Joi.date().iso().allow(null).optional(),
      }).or('product_variant_id', 'product_id')
    )
    .min(1)
    .required(),
});

const batchQuerySchema = Joi.object({
  product_variant_id: Joi.number().integer().positive().optional(),
  product_id: Joi.number().integer().positive().optional(),
  expiring_within_days: Joi.number().integer().min(1).max(365).optional(),
  after_id: Joi.number().integer().positive().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const adjustInventorySchema = Joi.object({
  product_variant_id: Joi.number().integer().positive().optional(),
  product_id: Joi.number().integer().positive().optional(),
  batch_id: Joi.number().integer().positive().required(),
  change_qty: Joi.number().integer().invalid(0).required(),
  reason: Joi.string().trim().min(3).max(500).required(),
}).or('product_variant_id', 'product_id');

const allocateFefoSchema = Joi.object({
  order_id: Joi.number().integer().positive().allow(null).optional(),
  items: Joi.array()
    .items(
      Joi.object({
        product_variant_id: Joi.number().integer().positive().optional(),
        product_id: Joi.number().integer().positive().optional(),
        quantity: Joi.number().integer().min(1).required(),
      }).or('product_variant_id', 'product_id')
    )
    .min(1)
    .required(),
});

export {
  createSupplierSchema,
  updateSupplierSchema,
  lockSupplierSchema,
  supplierQuerySchema,
  upsertSupplierPriceSchema,
  createPurchaseOrderSchema,
  updatePurchaseOrderStatusSchema,
  supplierRespondPoSchema,
  supplierShippingStatusSchema,
  poQuerySchema,
  createGoodsReceiptSchema,
  batchQuerySchema,
  adjustInventorySchema,
  allocateFefoSchema,
};
export default {
  createSupplierSchema,
  updateSupplierSchema,
  lockSupplierSchema,
  supplierQuerySchema,
  upsertSupplierPriceSchema,
  createPurchaseOrderSchema,
  updatePurchaseOrderStatusSchema,
  supplierRespondPoSchema,
  supplierShippingStatusSchema,
  poQuerySchema,
  createGoodsReceiptSchema,
  batchQuerySchema,
  adjustInventorySchema,
  allocateFefoSchema,
};
