import express from 'express';
const router = express.Router();
import serviceController from '../../controllers/service.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createServiceSchema,
  updateServiceSchema,
  updateServiceStatusSchema,
} from '../../validators/service.validator.js';
import { ROLES } from '../../utils/constants.js';

// [SVC-01] Xem danh sách và chi tiết dịch vụ (Public cho khách hàng & hệ thống)
router.get('/', serviceController.getServices);
router.get('/:id', serviceController.getServiceById);

// [SVC-01] Admin quản lý danh mục dịch vụ
router.post(
  '/',
  verifyToken,
  authorizeRoles(ROLES.ADMIN),
  validate(createServiceSchema),
  serviceController.createService,
);

router.put(
  '/:id',
  verifyToken,
  authorizeRoles(ROLES.ADMIN),
  validate(updateServiceSchema),
  serviceController.updateService,
);

router.patch(
  '/:id/status',
  verifyToken,
  authorizeRoles(ROLES.ADMIN),
  validate(updateServiceStatusSchema),
  serviceController.updateServiceStatus,
);

router.delete(
  '/:id',
  verifyToken,
  authorizeRoles(ROLES.ADMIN),
  serviceController.deleteService,
);

export default router;
