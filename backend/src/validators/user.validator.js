const Joi = require('joi');
const { ROLES, USER_STATUS } = require('../utils/constants');

const updateProfileSchema = Joi.object({
  full_name: Joi.string().trim().min(2).max(100).messages({
    'string.min': 'Họ và tên phải có ít nhất 2 ký tự',
    'string.max': 'Họ và tên không được vượt quá 100 ký tự',
  }),
  phone: Joi.string()
    .trim()
    .pattern(/^(0|84)(3|5|7|8|9)[0-9]{8}$/)
    .allow(null, '')
    .messages({
      'string.pattern.base': 'Số điện thoại không đúng định dạng Việt Nam',
    }),
  avatar: Joi.string().trim().max(255).allow(null, '').messages({
    'string.max': 'Đường dẫn ảnh đại diện quá dài',
  }),
})
  .min(1)
  .messages({
    'object.min': 'Vui lòng cung cấp ít nhất một thông tin cần cập nhật',
  });

const createAddressSchema = Joi.object({
  receiver_name: Joi.string().trim().min(2).max(100).required().messages({
    'string.min': 'Tên người nhận phải có ít nhất 2 ký tự',
    'any.required': 'Tên người nhận là bắt buộc',
  }),
  phone: Joi.string()
    .trim()
    .pattern(/^(0|84)(3|5|7|8|9)[0-9]{8}$/)
    .required()
    .messages({
      'string.pattern.base': 'Số điện thoại người nhận không đúng định dạng Việt Nam',
      'any.required': 'Số điện thoại người nhận là bắt buộc',
    }),
  street_address: Joi.string().trim().max(255).required().messages({
    'any.required': 'Địa chỉ đường/phố là bắt buộc',
  }),
  ward: Joi.string().trim().max(100).allow(null, ''),
  district: Joi.string().trim().max(100).allow(null, ''),
  city: Joi.string().trim().max(100).required().messages({
    'any.required': 'Tỉnh / Thành phố là bắt buộc',
  }),
  is_default: Joi.boolean().default(false),
});

const updateAddressSchema = Joi.object({
  receiver_name: Joi.string().trim().min(2).max(100).messages({
    'string.min': 'Tên người nhận phải có ít nhất 2 ký tự',
  }),
  phone: Joi.string()
    .trim()
    .pattern(/^(0|84)(3|5|7|8|9)[0-9]{8}$/)
    .messages({
      'string.pattern.base': 'Số điện thoại người nhận không đúng định dạng Việt Nam',
    }),
  street_address: Joi.string().trim().max(255),
  ward: Joi.string().trim().max(100).allow(null, ''),
  district: Joi.string().trim().max(100).allow(null, ''),
  city: Joi.string().trim().max(100),
  is_default: Joi.boolean(),
})
  .min(1)
  .messages({
    'object.min': 'Vui lòng cung cấp ít nhất một trường cần cập nhật',
  });

// [ACC-08] Admin Validation Schemas
const adminCreateUserSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Email không đúng định dạng',
    'any.required': 'Email là bắt buộc',
  }),
  password: Joi.string().min(6).max(100).required().messages({
    'string.min': 'Mật khẩu phải chứa ít nhất 6 ký tự',
    'any.required': 'Mật khẩu là bắt buộc',
  }),
  full_name: Joi.string().trim().min(2).max(100).required().messages({
    'string.min': 'Họ và tên phải có ít nhất 2 ký tự',
    'any.required': 'Họ và tên là bắt buộc',
  }),
  phone: Joi.string()
    .trim()
    .pattern(/^(0|84)(3|5|7|8|9)[0-9]{8}$/)
    .allow(null, '')
    .messages({
      'string.pattern.base': 'Số điện thoại không đúng định dạng Việt Nam',
    }),
  role: Joi.string()
    .valid(ROLES.ADMIN, ROLES.STAFF, ROLES.EXPERT, ROLES.CUSTOMER)
    .default(ROLES.STAFF)
    .messages({
      'any.only': 'Vai trò không hợp lệ',
    }),
  status: Joi.string()
    .valid(USER_STATUS.ACTIVE, USER_STATUS.INACTIVE, USER_STATUS.BANNED)
    .default(USER_STATUS.ACTIVE)
    .messages({
      'any.only': 'Trạng thái không hợp lệ',
    }),
});

const adminUpdateUserSchema = Joi.object({
  full_name: Joi.string().trim().min(2).max(100),
  phone: Joi.string().trim().pattern(/^(0|84)(3|5|7|8|9)[0-9]{8}$/).allow(null, ''),
  role: Joi.string().valid(ROLES.ADMIN, ROLES.STAFF, ROLES.EXPERT, ROLES.CUSTOMER),
  status: Joi.string().valid(USER_STATUS.ACTIVE, USER_STATUS.INACTIVE, USER_STATUS.BANNED, USER_STATUS.DELETED),
  avatar: Joi.string().trim().max(255).allow(null, ''),
})
  .min(1)
  .messages({
    'object.min': 'Vui lòng cung cấp ít nhất một trường cần chỉnh sửa',
  });

const adminUpdateStatusSchema = Joi.object({
  status: Joi.string()
    .valid(USER_STATUS.ACTIVE, USER_STATUS.INACTIVE, USER_STATUS.BANNED, USER_STATUS.DELETED)
    .required()
    .messages({
      'any.only': 'Trạng thái không hợp lệ',
      'any.required': 'Trạng thái là bắt buộc',
    }),
});

module.exports = {
  updateProfileSchema,
  createAddressSchema,
  updateAddressSchema,
  adminCreateUserSchema,
  adminUpdateUserSchema,
  adminUpdateStatusSchema,
};
