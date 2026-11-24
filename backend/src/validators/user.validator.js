import Joi from 'joi';
import { DB_ROLES, ROLES, DB_USER_STATUS, USER_STATUS } from '../utils/constants.js';

const ALL_ROLES = [...new Set([...Object.values(ROLES), ...Object.values(DB_ROLES)])];
const ALL_STATUSES = [...new Set([...Object.values(USER_STATUS), ...Object.values(DB_USER_STATUS)])];

/**
 * [ACC-04] Cập nhật Profile - Chuẩn camelCase
 */
const updateProfileSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(150).messages({
    'string.min': 'Họ và tên phải có ít nhất 2 ký tự',
    'string.max': 'Họ và tên không được vượt quá 150 ký tự',
  }),
  phone: Joi.string()
    .trim()
    .pattern(/^(0|84)(3|5|7|8|9)[0-9]{8}$/)
    .allow(null, '')
    .messages({
      'string.pattern.base': 'Số điện thoại không đúng định dạng Việt Nam',
    }),
  avatar: Joi.string().trim().max(1000).allow(null, '').messages({
    'string.max': 'Đường dẫn ảnh đại diện quá dài',
  }),
})
  .rename('full_name', 'fullName', { ignoreUndefined: true })
  .min(1)
  .messages({
    'object.min': 'Vui lòng cung cấp ít nhất một thông tin cần cập nhật',
  });

/**
 * [ACC-05] Thêm địa chỉ mới - Chuẩn camelCase
 */
const createAddressSchema = Joi.object({
  addressLabel: Joi.string().trim().max(50).allow(null, ''),
  receiverName: Joi.string().trim().min(2).max(150).required().messages({
    'string.min': 'Tên người nhận phải có ít nhất 2 ký tự',
    'any.required': 'Tên người nhận (receiverName) là bắt buộc',
  }),
  phone: Joi.string()
    .trim()
    .pattern(/^(0|84)(3|5|7|8|9)[0-9]{8}$/)
    .required()
    .messages({
      'string.pattern.base': 'Số điện thoại người nhận không đúng định dạng Việt Nam',
      'any.required': 'Số điện thoại người nhận là bắt buộc',
    }),
  streetAddress: Joi.string().trim().max(500).required().messages({
    'any.required': 'Địa chỉ đường/phố (streetAddress) là bắt buộc',
  }),
  ward: Joi.string().trim().max(150).allow(null, ''),
  district: Joi.string().trim().max(150).allow(null, ''),
  city: Joi.string().trim().max(150).required().messages({
    'any.required': 'Tỉnh / Thành phố là bắt buộc',
  }),
  isDefault: Joi.boolean().default(false),
})
  .rename('address_label', 'addressLabel', { ignoreUndefined: true })
  .rename('receiver_name', 'receiverName', { ignoreUndefined: true })
  .rename('street_address', 'streetAddress', { ignoreUndefined: true })
  .rename('province', 'city', { ignoreUndefined: true })
  .rename('is_default', 'isDefault', { ignoreUndefined: true });

/**
 * [ACC-05] Cập nhật địa chỉ - Chuẩn camelCase
 */
const updateAddressSchema = Joi.object({
  addressLabel: Joi.string().trim().max(50).allow(null, ''),
  receiverName: Joi.string().trim().min(2).max(150).messages({
    'string.min': 'Tên người nhận phải có ít nhất 2 ký tự',
  }),
  phone: Joi.string()
    .trim()
    .pattern(/^(0|84)(3|5|7|8|9)[0-9]{8}$/)
    .messages({
      'string.pattern.base': 'Số điện thoại người nhận không đúng định dạng Việt Nam',
    }),
  streetAddress: Joi.string().trim().max(500),
  ward: Joi.string().trim().max(150).allow(null, ''),
  district: Joi.string().trim().max(150).allow(null, ''),
  city: Joi.string().trim().max(150),
  isDefault: Joi.boolean(),
})
  .rename('address_label', 'addressLabel', { ignoreUndefined: true })
  .rename('receiver_name', 'receiverName', { ignoreUndefined: true })
  .rename('street_address', 'streetAddress', { ignoreUndefined: true })
  .rename('province', 'city', { ignoreUndefined: true })
  .rename('is_default', 'isDefault', { ignoreUndefined: true })
  .min(1)
  .messages({
    'object.min': 'Vui lòng cung cấp ít nhất một trường cần cập nhật',
  });

/**
 * [ACC-08] Admin Validation Schemas
 */
const adminCreateUserSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Email không đúng định dạng',
    'any.required': 'Email là bắt buộc',
  }),
  password: Joi.string().min(6).max(100).required().messages({
    'string.min': 'Mật khẩu phải chứa ít nhất 6 ký tự',
    'any.required': 'Mật khẩu là bắt buộc',
  }),
  fullName: Joi.string().trim().min(2).max(150).required().messages({
    'string.min': 'Họ và tên phải có ít nhất 2 ký tự',
    'any.required': 'Họ và tên (fullName) là bắt buộc',
  }),
  phone: Joi.string()
    .trim()
    .pattern(/^(0|84)(3|5|7|8|9)[0-9]{8}$/)
    .allow(null, '')
    .messages({
      'string.pattern.base': 'Số điện thoại không đúng định dạng Việt Nam',
    }),
  role: Joi.string()
    .valid(...ALL_ROLES)
    .default(DB_ROLES.MANAGER)
    .messages({
      'any.only': 'Vai trò không hợp lệ',
    }),
  employmentType: Joi.string().valid('FullTime').optional(),
  status: Joi.string()
    .valid(...ALL_STATUSES)
    .default(DB_USER_STATUS.ACTIVE)
    .messages({
      'any.only': 'Trạng thái không hợp lệ',
    }),
}).rename('full_name', 'fullName', { ignoreUndefined: true });

const adminUpdateUserSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(150),
  phone: Joi.string().trim().pattern(/^(0|84)(3|5|7|8|9)[0-9]{8}$/).allow(null, ''),
  role: Joi.string().valid(...ALL_ROLES),
  status: Joi.string().valid(...ALL_STATUSES),
  avatar: Joi.string().trim().max(1000).allow(null, ''),
})
  .rename('full_name', 'fullName', { ignoreUndefined: true })
  .min(1)
  .messages({
    'object.min': 'Vui lòng cung cấp ít nhất một trường cần chỉnh sửa',
  });

const adminUpdateStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...ALL_STATUSES)
    .required()
    .messages({
      'any.only': 'Trạng thái không hợp lệ',
      'any.required': 'Trạng thái là bắt buộc',
    }),
});

export {
  updateProfileSchema,
  createAddressSchema,
  updateAddressSchema,
  adminCreateUserSchema,
  adminUpdateUserSchema,
  adminUpdateStatusSchema,
};
export default {
  updateProfileSchema,
  createAddressSchema,
  updateAddressSchema,
  adminCreateUserSchema,
  adminUpdateUserSchema,
  adminUpdateStatusSchema,
};
