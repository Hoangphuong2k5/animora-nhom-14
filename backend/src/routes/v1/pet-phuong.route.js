// Routes hồ sơ thú cưng (PET-01, PET-02, PET-03, PET-05) + lịch sức khỏe (PET-07).
// URL giữ nguyên bản cũ. PET-07 nay là lịch sức khỏe tổng quát
// (VACCINATION/DEWORMING/FOLLOW_UP) trong pet_health_schedules.
// File này gắn vào router /api/v1 với tiền tố /pets (xem patches/routes-index.patch.txt).
import express from 'express';
const router = express.Router();
import * as petController from '../../controllers/pet-phuong.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createPetSchema,
  updatePetSchema,
  createHealthScheduleSchema,
  updateAllergiesSchema,
} from '../../validators/pet-phuong.validator.js';
import { ROLES } from '../../utils/constants.js';

router.use(verifyToken, authorizeRoles(ROLES.CUSTOMER));

// [PET-01] Thêm hồ sơ thú cưng
router.post('/', validate(createPetSchema), petController.createPet);
// [PET-03] Danh sách thú cưng của tôi
router.get('/', petController.listMyPets);
// [PET-05] Chi tiết thú cưng
router.get('/:id', petController.getPetById);
// [PET-02] Cập nhật hồ sơ thú cưng
router.put('/:id', validate(updatePetSchema), petController.updatePet);
// [PET-07] Danh sách lịch sức khỏe (tiêm chủng / tẩy giun / tái khám)
router.get('/:id/vaccinations', petController.listHealthSchedules);
// [PET-07] Thêm lịch sức khỏe
router.post('/:id/vaccinations', validate(createHealthScheduleSchema), petController.addHealthSchedule);
// [PET-02] Cập nhật dị ứng
router.put('/:id/allergies', validate(updateAllergiesSchema), petController.updateAllergies);

export default router;
