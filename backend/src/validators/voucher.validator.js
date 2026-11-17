import Joi from 'joi';

const voucherIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID voucher phải là số nguyên dương',
  }),
});

const orderIdParamSchema = Joi.object({
  orderId: Joi.number().integer().positive().required().messages({
    'number.base': 'ID đơn hàng phải là số nguyên dương',
  }),
});

const voucherQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string()
    .valid('all', 'active', 'paused', 'exhausted', 'expired', 'upcoming')
    .default('all'),
  search: Joi.string().trim().max(100).allow('', null).optional(),
});

const createVoucherSchema = Joi.object({
  code: Joi.string()
    .trim()
    .uppercase()
    .min(2)
    .max(50)
    .pattern(/^[A-Z0-9_-]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Mã voucher chỉ gồm chữ hoa, số, dấu gạch ngang hoặc gạch dưới',
      'any.required': 'Vui lòng nhập mã voucher',
    }),
  name: Joi.string().trim().min(2).max(150).required().messages({
    'any.required': 'Vui lòng nhập tên / phạm vi áp dụng voucher',
  }),
  discountType: Joi.string().valid('Percentage', 'FixedAmount').required(),
  discountValue: Joi.number()
    .positive()
    .when('discountType', {
      is: 'Percentage',
      then: Joi.number().positive().max(100).messages({
        'number.max': 'Phần trăm giảm giá không được vượt quá 100%',
      }),
    })
    .required(),
  maxDiscount: Joi.number().min(0).allow(null).optional(),
  minOrderValue: Joi.number().min(0).default(0),
  startAt: Joi.date().iso().required(),
  endAt: Joi.date().iso().greater(Joi.ref('startAt')).required().messages({
    'date.greater': 'Ngày kết thúc phải sau ngày bắt đầu',
  }),
  usageLimit: Joi.number().integer().min(1).allow(null).optional(),
  isActive: Joi.boolean().default(true),
  applicableScope: Joi.string().valid('shop').default('shop'),
})
  .rename('voucherCode', 'code', { ignoreUndefined: true })
  .rename('voucherName', 'name', { ignoreUndefined: true })
  .rename('maximumDiscountAmount', 'maxDiscount', { ignoreUndefined: true })
  .rename('minimumOrderAmount', 'minOrderValue', { ignoreUndefined: true });

const updateVoucherStatusSchema = Joi.object({
  isActive: Joi.boolean().required(),
  reason: Joi.string().trim().max(500).allow('', null).optional(),
});

const validateVoucherSchema = Joi.object({
  code: Joi.string().trim().uppercase().min(1).max(50).required(),
  subtotal: Joi.number().min(0).required(),
  scope: Joi.string().trim().lowercase().default('shop'),
});

const applyVoucherSchema = Joi.object({
  code: Joi.string().trim().uppercase().min(1).max(50).required(),
  orderId: Joi.number().integer().positive().required(),
  subtotal: Joi.number().min(0).required(),
  scope: Joi.string().trim().lowercase().default('shop'),
});

const revertVoucherSchema = Joi.object({
  reason: Joi.string().trim().max(500).allow('', null).optional(),
});

export {
  voucherIdParamSchema,
  orderIdParamSchema,
  voucherQuerySchema,
  createVoucherSchema,
  updateVoucherStatusSchema,
  validateVoucherSchema,
  applyVoucherSchema,
  revertVoucherSchema,
};

