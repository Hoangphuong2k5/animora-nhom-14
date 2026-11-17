import express from 'express';
const router = express.Router();
import userController from '../../controllers/user.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  updateProfileSchema,
  createAddressSchema,
  updateAddressSchema,
} from '../../validators/user.validator.js';

// Toàn bộ route người dùng cá nhân đều yêu cầu đăng nhập
router.use(verifyToken);

// [ACC-04] Quản lý thông tin cá nhân
router.get('/profile', userController.getProfile);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);

// [ACC-05] Quản lý sổ địa chỉ giao hàng
router.get('/addresses', userController.getAddresses);
router.get('/addresses/:id', userController.getAddressById);
router.post('/addresses', validate(createAddressSchema), userController.createAddress);
router.put('/addresses/:id', validate(updateAddressSchema), userController.updateAddress);
router.delete('/addresses/:id', userController.deleteAddress);

export default router;
