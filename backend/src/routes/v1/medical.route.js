// Routes bệnh án phía bác sĩ (MED-01, MED-02, MED-03) + lịch sử bệnh lý
// phía chủ nuôi (PET-07).
// URL giữ nguyên bản cũ. Bác sĩ dùng middleware requireApprovedVet — kiểm tra
// staff_profiles.staff_role = 'BS' AND is_active = 1 (không còn bảng experts).
// File này gắn TRỰC TIẾP vào router /api/v1 (không có tiền tố riêng) vì các
// đường dẫn đã đầy đủ: /vet/..., /pets/:id/medical-records
// (xem patches/routes-index.patch.txt).
import express from 'express';
const router = express.Router();
import * as medicalController from '../../controllers/medical.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';
import { requireApprovedVet } from '../../middlewares/vet.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createMedicalRecordSchema,
  updateMedicalNotesSchema,
} from '../../validators/medical.validator.js';
import { ROLES } from '../../utils/constants.js';

router.use(verifyToken);

// [MED-01] Bác sĩ xem hồ sơ bệnh lý của thú cưng
router.get('/vet/pets/:id/medical-history', requireApprovedVet, medicalController.vetViewMedicalHistory);
// [MED-02] Bác sĩ tạo bệnh án
router.post('/vet/medical-records', requireApprovedVet, validate(createMedicalRecordSchema), medicalController.createMedicalRecord);
// [MED-03] Bác sĩ cập nhật ghi chú điều trị
router.put('/vet/medical-records/:id/notes', requireApprovedVet, validate(updateMedicalNotesSchema), medicalController.updateMedicalNotes);
// [PET-07] Chủ nuôi xem lịch sử bệnh lý của thú cưng mình
router.get('/pets/:id/medical-records', authorizeRoles(ROLES.CUSTOMER), medicalController.listMedicalHistoryByPet);

export default router;
