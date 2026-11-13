const Joi = require('joi');

const registerSchema = Joi.object({
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
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Email không đúng định dạng',
    'any.required': 'Email là bắt buộc',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Mật khẩu là bắt buộc',
  }),
});

const changePasswordSchema = Joi.object({
  old_password: Joi.string().required().messages({
    'any.required': 'Mật khẩu cũ là bắt buộc',
  }),
  new_password: Joi.string().min(6).max(100).required().messages({
    'string.min': 'Mật khẩu mới phải chứa ít nhất 6 ký tự',
    'any.required': 'Mật khẩu mới là bắt buộc',
  }),
  confirm_password: Joi.string()
    .valid(Joi.ref('new_password'))
    .messages({
      'any.only': 'Xác nhận mật khẩu mới không khớp',
    }),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Email không đúng định dạng',
    'any.required': 'Email là bắt buộc',
  }),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().trim().required().messages({
    'any.required': 'Mã đặt lại mật khẩu (token) là bắt buộc',
  }),
  new_password: Joi.string().min(6).max(100).required().messages({
    'string.min': 'Mật khẩu mới phải chứa ít nhất 6 ký tự',
    'any.required': 'Mật khẩu mới là bắt buộc',
  }),
  confirm_password: Joi.string()
    .valid(Joi.ref('new_password'))
    .messages({
      'any.only': 'Xác nhận mật khẩu mới không khớp',
    }),
});

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
