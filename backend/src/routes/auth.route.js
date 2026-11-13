const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middlewares/validate.middleware');
const { verifyToken } = require('../middlewares/auth.middleware');
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validators/auth.validator');

// [ACC-01] Đăng ký tài khoản
router.post('/register', validate(registerSchema), authController.register);

// [ACC-02] Đăng nhập & cấp JWT Bearer Token
router.post('/login', validate(loginSchema), authController.login);

// [ACC-03] Đăng xuất
router.post('/logout', verifyToken, authController.logout);

// [ACC-06] Đổi mật khẩu
router.put('/change-password', verifyToken, validate(changePasswordSchema), authController.changePassword);

// [ACC-07] Quên mật khẩu & Đặt lại mật khẩu
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Lấy thông tin tài khoản đang đăng nhập
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
