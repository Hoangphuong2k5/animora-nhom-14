// Routes đơn thuốc (MED-04, MED-05, MED-06, MED-07, MED-08).
// (MED-09 nằm ở medicine-suggestion.route.js.)
// URL giữ nguyên bản node-mssql đã giao 28/10. Bác sĩ dùng middleware
// requireApprovedVet (mới, xem src/middlewares/vet.middleware.js).
// File này gắn TRỰC TIẾP vào router /api/v1 (không có tiền tố riêng) vì các
// đường dẫn đã đầy đủ: /vet/prescriptions, /prescriptions, ...
// (xem patches/routes-index.patch.txt).
import express from 'express';
const router = express.Router();
import * as prescriptionController from '../../controllers/prescription.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';
import { requireApprovedVet } from '../../middlewares/vet.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createPrescriptionSchema,
  updatePrescriptionSchema,
  validatePurchaseSchema,
} from '../../validators/prescription.validator.js';
import { ROLES } from '../../utils/constants.js';

router.use(verifyToken);

// [MED-04] Bác sĩ kê đơn (expert + vet approved)
router.post('/vet/prescriptions', requireApprovedVet, validate(createPrescriptionSchema), prescriptionController.createPrescription);
// [MED-05] Bác sĩ cập nhật đơn thuốc = tạo phiên bản mới (expert + vet approved)
router.put('/vet/prescriptions/:id', requireApprovedVet, validate(updatePrescriptionSchema), prescriptionController.updatePrescriptionVersion);

// [MED-06] Lịch sử đơn thuốc (KH xem đơn của pet mình, BS xem đơn mình từng khám/kê)
router.get('/prescriptions', authorizeRoles(ROLES.CUSTOMER, ROLES.EXPERT, ROLES.ADMIN), prescriptionController.listPrescriptionHistory);

// [MED-07] Kiểm tra điều kiện mua thuốc theo đơn (BR-MED-08)
router.post('/prescriptions/validate-purchase', authorizeRoles(ROLES.CUSTOMER), validate(validatePurchaseSchema), prescriptionController.validatePurchase);

// [MED-08] Mua lại đơn thuốc bệnh nhẹ
router.post('/prescriptions/:id/reorder', authorizeRoles(ROLES.CUSTOMER), prescriptionController.reorderPrescription);

export default router;
