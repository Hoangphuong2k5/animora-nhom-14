// Routes thu tiền mặt tại quầy (SPAY-05).
// URL giữ nguyên bản cũ: POST /api/v1/experts/me/bookings/:id/cash-payment.
// Người thu nay là LT (lễ tân) tại quầy (D9) — vai 'LT' là mã vai mới của
// schema v1.5 (chưa có trong hằng ROLES của nhóm nên dùng chuỗi trực tiếp;
// nếu JWT của nhóm dùng mã khác thì sửa ở đây). Giữ thêm ADMIN.
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

// [SPAY-05] Lễ tân thu tiền mặt tại quầy cho 1 lịch hẹn
router.post(
  '/experts/me/bookings/:id/cash-payment',
  verifyToken,
  authorizeRoles('LT', ROLES.ADMIN),
  validate(confirmCashPaymentSchema),
  cashPaymentController.confirmCashPayment,
);

export default router;
