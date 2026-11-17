import express from 'express';
import voucherController from '../../controllers/voucher.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { ROLES } from '../../utils/constants.js';
import {
  voucherIdParamSchema,
  orderIdParamSchema,
  voucherQuerySchema,
  createVoucherSchema,
  updateVoucherStatusSchema,
  validateVoucherSchema,
  applyVoucherSchema,
  revertVoucherSchema,
} from '../../validators/voucher.validator.js';

const router = express.Router();

router.use(verifyToken);

// [VOUCHER.VIEW] Quản lý & Admin (Admin chỉ xem)
router.get(
  '/',
  authorizeRoles(ROLES.MANAGER, ROLES.ADMIN),
  validate(voucherQuerySchema, 'query'),
  voucherController.listVouchers
);

// [VOUCHER.MANAGE] Chỉ Quản lý nghiệp vụ
router.post(
  '/',
  authorizeRoles(ROLES.MANAGER),
  validate(createVoucherSchema),
  voucherController.createVoucher
);

router.patch(
  '/:id/status',
  authorizeRoles(ROLES.MANAGER),
  validate({ params: voucherIdParamSchema, body: updateVoucherStatusSchema }),
  voucherController.toggleVoucherStatus
);

router.delete(
  '/:id',
  authorizeRoles(ROLES.MANAGER),
  validate(voucherIdParamSchema, 'params'),
  voucherController.deleteVoucher
);

// [VOUCHER.USE] Chỉ Khách hàng (chặn Bác sĩ, Quản lý, Admin, NVCS, Supplier, Trạm cứu hộ)
router.post(
  '/validate',
  authorizeRoles(ROLES.CUSTOMER),
  validate(validateVoucherSchema),
  voucherController.validateVoucher
);

router.post(
  '/apply',
  authorizeRoles(ROLES.CUSTOMER),
  validate(applyVoucherSchema),
  voucherController.applyVoucher
);

// Hoàn tác voucher khi hủy/trả đơn
router.post(
  '/revert/:orderId',
  authorizeRoles(ROLES.CUSTOMER, ROLES.MANAGER),
  validate({ params: orderIdParamSchema, body: revertVoucherSchema }),
  voucherController.revertVoucher
);

export default router;

