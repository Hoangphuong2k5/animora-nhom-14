const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
  updateProfileSchema,
  createAddressSchema,
  updateAddressSchema,
} = require('../validators/user.validator');

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

module.exports = router;
