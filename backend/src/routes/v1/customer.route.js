import express from 'express';
import customerController from '../../controllers/customer.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { getCustomersSchema, updateCustomerStatusSchema } from '../../validators/customer.validator.js';
import { ROLES } from '../../utils/constants.js';

const router = express.Router();

// Role Receptionist (LT), Manager và Admin có quyền tra cứu khách hàng theo SĐT tại quầy
router.use(verifyToken);

// [MGR-CUS-01] Danh sách khách hàng kèm phân trang, tìm kiếm SĐT, thống kê
router.get(
  '/',
  authorizeRoles(ROLES.RECEPTIONIST, ROLES.MANAGER, ROLES.ADMIN),
  validate(getCustomersSchema, 'query'),
  customerController.getCustomers
);

// [MGR-CUS-02] Chi tiết khách hàng (hồ sơ 360: thú cưng, lịch sử khám/dịch vụ, đơn hàng)
router.get(
  '/:id',
  authorizeRoles(ROLES.RECEPTIONIST, ROLES.MANAGER, ROLES.ADMIN),
  customerController.getCustomerDetail
);

// [MGR-CUS-03] Khóa / Mở khóa tài khoản khách hàng (Chỉ Manager và Admin)
router.patch(
  '/:id/status',
  authorizeRoles(ROLES.MANAGER, ROLES.ADMIN),
  validate(updateCustomerStatusSchema),
  customerController.updateCustomerStatus
);

export default router;
