import express from 'express';
import customerController from '../../controllers/customer.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { getCustomersSchema, updateCustomerStatusSchema } from '../../validators/customer.validator.js';
import { ROLES } from '../../utils/constants.js';

const router = express.Router();

// Role Manager và Admin có quyền quản lý và tra cứu khách hàng
router.use(verifyToken, authorizeRoles(ROLES.MANAGER, ROLES.ADMIN));

// [MGR-CUS-01] Danh sách khách hàng kèm phân trang, tìm kiếm, thống kê
router.get('/', validate(getCustomersSchema, 'query'), customerController.getCustomers);

// [MGR-CUS-02] Chi tiết khách hàng (hồ sơ 360: thú cưng, lịch sử khám/dịch vụ, đơn hàng)
router.get('/:id', customerController.getCustomerDetail);

// [MGR-CUS-03] Khóa / Mở khóa tài khoản khách hàng
router.patch('/:id/status', validate(updateCustomerStatusSchema), customerController.updateCustomerStatus);

export default router;
