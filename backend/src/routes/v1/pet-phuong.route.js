// Routes hồ sơ thú cưng (PET-01, PET-02, PET-03, PET-05).
// URL giữ nguyên bản node-mssql đã giao 28/10, chỉ đổi middleware sang của nhóm:
// verifyToken + authorizeRoles('customer') thay cho requireRole('customer').
// PET-07 (GET /:id/medical-records) thuộc module medical, không nằm ở đây —
// khi làm module medical thì gắn thêm route đó vào file này hoặc medical.route.js.
import express from 'express';
const router = express.Router();
import * as petController from '../../controllers/pet-phuong.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createPetSchema,
  updatePetSchema,
  createVaccinationSchema,
  updateAllergiesSchema,
} from '../../validators/pet-phuong.validator.js';
import { ROLES } from '../../utils/constants.js';

router.use(verifyToken, authorizeRoles(ROLES.CUSTOMER));

// [PET-01] Thêm hồ sơ pet
router.post('/', validate(createPetSchema), petController.createPet);
// [PET-03] Danh sách pet của tôi
router.get('/', petController.listMyPets);
// [PET-03] Chi tiết pet
router.get('/:id', petController.getPetById);
// [PET-02] Cập nhật hồ sơ pet
router.put('/:id', validate(updatePetSchema), petController.updatePet);
// [PET-05] Danh sách tiêm chủng
router.get('/:id/vaccinations', petController.listVaccinations);
// [PET-05] Thêm mũi tiêm
router.post('/:id/vaccinations', validate(createVaccinationSchema), petController.addVaccination);
// [PET-05] Cập nhật dị ứng
router.put('/:id/allergies', validate(updateAllergiesSchema), petController.updateAllergies);

export default router;
