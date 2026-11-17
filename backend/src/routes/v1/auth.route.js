import express from 'express';
const router = express.Router();
import authController from '../../controllers/auth.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import {
  registerSchema,
  loginSchema,
  googleLoginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../../validators/auth.validator.js';

// [ACC-01] Đăng ký tài khoản (Auto-Login & HttpOnly Cookie)
router.post('/register', validate(registerSchema), authController.register);

// [ACC-02] Đăng nhập & cấp JWT Tokens (HttpOnly Cookie)
router.post('/login', validate(loginSchema), authController.login);

// [ACC-02-GOOGLE] Đăng nhập bằng Google OAuth 2.0 (100% HttpOnly Cookie)
router.post('/google', validate(googleLoginSchema), authController.googleLogin);

// [ACC-03] Đăng xuất tài khoản (Xóa sạch Cookie)
router.post('/logout', authController.logout);

// [ACC-09] Làm mới Access Token thông qua Refresh Token (Đọc từ HttpOnly Cookie)
router.post('/refresh-token', authController.refreshToken);
router.post('/refresh', authController.refreshToken); // Alias dự phòng

// [ACC-06] Đổi mật khẩu
router.put('/change-password', verifyToken, validate(changePasswordSchema), authController.changePassword);

// [ACC-07] Quên mật khẩu & Đặt lại mật khẩu
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Lấy thông tin tài khoản đang đăng nhập
router.get('/me', verifyToken, authController.getMe);

export default router;
