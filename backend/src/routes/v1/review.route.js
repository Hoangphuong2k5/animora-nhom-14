// Routes đánh giá nhân viên (RVW-01, RVW-02).
// URL giữ nguyên bản cũ: /bookings/:id/review, /experts/:id/reviews
// (:id ở đây là appointment_id / staff_user_id theo schema v1.5 mới).
// File này gắn TRỰC TIẾP vào router /api/v1 (không có tiền tố riêng)
// (xem patches/routes-index.patch.txt).
import express from 'express';
const router = express.Router();
import * as reviewController from '../../controllers/review.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createReviewSchema } from '../../validators/review.validator.js';
import { ROLES } from '../../utils/constants.js';

// [RVW-01] Khách đánh giá nhân viên sau dịch vụ
router.post('/bookings/:id/review', verifyToken, authorizeRoles(ROLES.CUSTOMER), validate(createReviewSchema), reviewController.createReview);
// [RVW-02] Xem đánh giá của nhân viên (công khai)
router.get('/experts/:id/reviews', reviewController.listStaffReviews);

export default router;
