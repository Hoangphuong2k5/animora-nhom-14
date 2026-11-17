// Routes bệnh án phía bác sĩ (MED-01, MED-02, MED-03) + lịch sử bệnh lý phía
// chủ nuôi (PET-07).
// URL giữ nguyên bản node-mssql đã giao 28/10. Bác sĩ dùng middleware
// requireApprovedVet (mới, xem src/middlewares/vet.middleware.js) thay cho
// requireApprovedVet cũ — kiểm tra experts.type='vet' + status='approved'.
// File này gắn TRỰC TIẾP vào router /api/v1 (không có tiền tố riêng) vì các
// đường dẫn đã đầy đủ: /vet/..., /pets/:id/medical-records
// (xem patches/routes-index.patch.txt).
// PET-07 đặt ở đây (không sửa file pet.route.js mẫu) để giữ nguyên 6 file pets.
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

// [MED-01] Bác sĩ xem hồ sơ bệnh lý của pet
router.get('/vet/pets/:id/medical-history', requireApprovedVet, medicalController.vetMedicalHistory);
// [MED-02] Bác sĩ tạo bệnh án
router.post('/vet/medical-records', requireApprovedVet, validate(createMedicalRecordSchema), medicalController.createMedicalRecord);
// [MED-03] Bác sĩ cập nhật ghi chú điều trị
router.put('/vet/medical-records/:id/notes', requireApprovedVet, validate(updateMedicalNotesSchema), medicalController.updateMedicalNotes);
// [PET-07] Chủ nuôi xem lịch sử bệnh lý + đơn thuốc của pet mình
router.get('/pets/:id/medical-records', authorizeRoles(ROLES.CUSTOMER), medicalController.petMedicalHistory);

export default router;
