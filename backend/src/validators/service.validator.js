const Joi = require('joi');

const createServiceSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required().messages({
    'string.min': 'Tên dịch vụ phải có ít nhất 2 ký tự',
    'string.max': 'Tên dịch vụ không được vượt quá 150 ký tự',
    'any.required': 'Tên dịch vụ là bắt buộc',
  }),
  category: Joi.string().trim().max(100).allow(null, '').messages({
    'string.max': 'Danh mục không được vượt quá 100 ký tự',
  }),
  service_kind: Joi.string().valid('medical', 'care').default('care').messages({
    'any.only': 'Loại hình dịch vụ chỉ nhận giá trị medical hoặc care',
  }),
  description: Joi.string().trim().allow(null, ''),
  price: Joi.number().min(0).required().messages({
    'number.min': 'Giá dịch vụ phải lớn hơn hoặc bằng 0',
    'any.required': 'Giá dịch vụ là bắt buộc',
  }),
  duration_min: Joi.number().integer().positive().messages({
    'number.positive': 'Thời lượng dịch vụ phải lớn hơn 0 phút',
  }),
  duration_minutes: Joi.number().integer().positive().messages({
    'number.positive': 'Thời lượng dịch vụ phải lớn hơn 0 phút',
  }),
  allow_postpay: Joi.boolean().default(false),
  allow_pay_later: Joi.boolean().default(false),
  free_cancel_hours: Joi.number().integer().min(0).default(24).messages({
    'number.min': 'Thời gian hủy miễn phí phải >= 0 giờ',
  }),
  late_threshold_hours: Joi.number().integer().min(0).default(3).messages({
    'number.min': 'Ngưỡng hủy trễ phải >= 0 giờ',
  }),
  late_fee_percent: Joi.number().min(0).max(100).default(50).messages({
    'number.min': 'Phí hủy trễ phải từ 0% đến 100%',
    'number.max': 'Phí hủy trễ phải từ 0% đến 100%',
  }),
  cancel_policy: Joi.string().trim().allow(null, ''),
  cancellation_policy: Joi.string().trim().allow(null, ''),
  is_active: Joi.boolean().default(true),
  status: Joi.string().valid('active', 'inactive').default('active'),
})
  .or('duration_min', 'duration_minutes')
  .messages({
    'object.missing': 'Vui lòng cung cấp thời lượng dịch vụ (duration_min)',
  });

const updateServiceSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).messages({
    'string.min': 'Tên dịch vụ phải có ít nhất 2 ký tự',
    'string.max': 'Tên dịch vụ không được vượt quá 150 ký tự',
  }),
  category: Joi.string().trim().max(100).allow(null, ''),
  service_kind: Joi.string().valid('medical', 'care'),
  description: Joi.string().trim().allow(null, ''),
  price: Joi.number().min(0).messages({
    'number.min': 'Giá dịch vụ phải lớn hơn hoặc bằng 0',
  }),
  duration_min: Joi.number().integer().positive().messages({
    'number.positive': 'Thời lượng dịch vụ phải lớn hơn 0 phút',
  }),
  duration_minutes: Joi.number().integer().positive().messages({
    'number.positive': 'Thời lượng dịch vụ phải lớn hơn 0 phút',
  }),
  allow_postpay: Joi.boolean(),
  allow_pay_later: Joi.boolean(),
  free_cancel_hours: Joi.number().integer().min(0),
  late_threshold_hours: Joi.number().integer().min(0),
  late_fee_percent: Joi.number().min(0).max(100),
  cancel_policy: Joi.string().trim().allow(null, ''),
  cancellation_policy: Joi.string().trim().allow(null, ''),
  is_active: Joi.boolean(),
  status: Joi.string().valid('active', 'inactive'),
})
  .min(1)
  .messages({
    'object.min': 'Vui lòng cung cấp ít nhất một trường cần chỉnh sửa',
  });

const updateServiceStatusSchema = Joi.object({
  is_active: Joi.boolean(),
  status: Joi.string().valid('active', 'inactive'),
})
  .min(1)
  .messages({
    'object.min': 'Vui lòng cung cấp trạng thái dịch vụ (is_active hoặc status)',
  });

module.exports = {
  createServiceSchema,
  updateServiceSchema,
  updateServiceStatusSchema,
};
