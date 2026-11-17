import Joi from 'joi';

/**
 * [ACC-01] Đăng ký tài khoản - Chuẩn camelCase thống nhất
 */
const registerSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Email không đúng định dạng',
    'any.required': 'Email là bắt buộc',
  }),
  password: Joi.string().min(6).max(100).required().messages({
    'string.min': 'Mật khẩu phải chứa ít nhất 6 ký tự',
    'any.required': 'Mật khẩu là bắt buộc',
  }),
  fullName: Joi.string().trim().min(2).max(100).required().messages({
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
}).rename('full_name', 'fullName', { ignoreUndefined: true });

/**
 * [ACC-02] Đăng nhập tài khoản
 */
const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Email không đúng định dạng',
    'any.required': 'Email là bắt buộc',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Mật khẩu là bắt buộc',
  }),
});

/**
 * [ACC-06] Đổi mật khẩu tài khoản
 */
const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    'any.required': 'Mật khẩu cũ là bắt buộc',
  }),
  newPassword: Joi.string().min(6).max(100).required().messages({
    'string.min': 'Mật khẩu mới phải chứa ít nhất 6 ký tự',
    'any.required': 'Mật khẩu mới là bắt buộc',
  }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .messages({
      'any.only': 'Xác nhận mật khẩu mới không khớp',
    }),
})
  .rename('old_password', 'oldPassword', { ignoreUndefined: true })
  .rename('new_password', 'newPassword', { ignoreUndefined: true })
  .rename('confirm_password', 'confirmPassword', { ignoreUndefined: true });

/**
 * [ACC-07] Quên mật khẩu
 */
const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Email không đúng định dạng',
    'any.required': 'Email là bắt buộc',
  }),
});

/**
 * [ACC-07] Đặt lại mật khẩu mới
 */
const resetPasswordSchema = Joi.object({
  token: Joi.string().trim().required().messages({
    'any.required': 'Mã đặt lại mật khẩu (token) là bắt buộc',
  }),
  newPassword: Joi.string().min(6).max(100).required().messages({
    'string.min': 'Mật khẩu mới phải chứa ít nhất 6 ký tự',
    'any.required': 'Mật khẩu mới là bắt buộc',
  }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .messages({
      'any.only': 'Xác nhận mật khẩu mới không khớp',
    }),
})
  .rename('new_password', 'newPassword', { ignoreUndefined: true })
  .rename('confirm_password', 'confirmPassword', { ignoreUndefined: true });

/**
 * [ACC-02-GOOGLE] Đăng nhập bằng Google OAuth 2.0
 * Chấp nhận idToken hoặc credential (từ Google Identity Services của Next.js/React)
 */
const googleLoginSchema = Joi.object({
  idToken: Joi.string().trim().required().messages({
    'any.required': 'Mã Google ID Token (idToken hoặc credential) là bắt buộc',
  }),
}).rename('credential', 'idToken', { ignoreUndefined: true });

export {
  registerSchema,
  loginSchema,
  googleLoginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
export default {
  registerSchema,
  loginSchema,
  googleLoginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
