const express = require('express');
const router = express.Router();
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const serviceRoute = require('./service.route');
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
  adminCreateUserSchema,
  adminUpdateUserSchema,
  adminUpdateStatusSchema,
} = require('../validators/user.validator');
const { ROLES } = require('../utils/constants');
const { AppDataSource } = require('../config/data-source');

// Health-check endpoint: Kiểm tra trạng thái server & DB
router.get('/health', async (req, res) => {
  const isDbConnected = AppDataSource.isInitialized;
  return res.status(200).json({
    success: true,
    message: 'Animora API Server is running',
    database: isDbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// [ACC-01, 02, 03, 06, 07] Authentication Routes
router.use('/auth', authRoute);

// [ACC-04, 05] User Profile & Address Routes
router.use('/users', userRoute);

// [ACC-08] Admin User Management Routes: /api/v1/admin/users
const adminUserRoute = express.Router();
adminUserRoute.use(verifyToken, authorizeRoles(ROLES.ADMIN));

adminUserRoute.get('/', userController.adminGetUsers);
adminUserRoute.get('/:id', userController.adminGetUserById);
adminUserRoute.post('/', validate(adminCreateUserSchema), userController.adminCreateUser);
adminUserRoute.put('/:id', validate(adminUpdateUserSchema), userController.adminUpdateUser);
adminUserRoute.patch('/:id/status', validate(adminUpdateStatusSchema), userController.adminUpdateStatus);
adminUserRoute.delete('/:id', userController.adminDeleteUser);

router.use('/admin/users', adminUserRoute);

// [SVC-01] Services Routes: /api/v1/services
router.use('/services', serviceRoute);

module.exports = router;
