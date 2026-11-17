import express from 'express';
import notificationController from '../../controllers/notification.controller.js';
import validator from '../../validators/notification.validator.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';

// /api/v1/notifications  (NTF-01) - mọi vai trò đã đăng nhập đều xem được thông báo của chính mình
const router = express.Router();
router.use(verifyToken);

router.get('/', validate(validator.notificationQuerySchema), notificationController.list);
router.get('/unread-count', notificationController.unreadCount);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch(
  '/:id/read',
  validate(validator.notificationIdParamSchema),
  notificationController.markAsRead
);

export default router;
