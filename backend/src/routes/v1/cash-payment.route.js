// Routes xác nhận thu tiền mặt (SPAY-05).
// URL giữ nguyên bản node-mssql đã giao 28/10:
// POST /api/v1/experts/me/bookings/:id/cash-payment.
// File này gắn TRỰC TIẾP vào router /api/v1 (không có tiền tố riêng) vì đường
// dẫn đã đầy đủ (xem patches/routes-index.patch.txt).
// Đặt tên cash-payment.* để KHÔNG đụng file payment.* của Toàn (VNPAY, SPAY-02).
import express from 'express';
const router = express.Router();
import * as cashPaymentController from '../../controllers/cash-payment.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { confirmCashPaymentSchema } from '../../validators/cash-payment.validator.js';
import { ROLES } from '../../utils/constants.js';

// [SPAY-05] Chuyên viên/admin xác nhận đã thu tiền mặt cho 1 lịch hẹn
router.post(
  '/experts/me/bookings/:id/cash-payment',
  verifyToken,
  authorizeRoles(ROLES.EXPERT, ROLES.ADMIN),
  validate(confirmCashPaymentSchema),
  cashPaymentController.confirmCashPayment,
);

export default router;
