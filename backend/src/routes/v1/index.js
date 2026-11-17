// Author: TrungQuanDev & Animora Team (Group 14)
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import authRoute from './auth.route.js';
import userRoute from './user.route.js';
import serviceRoute from './service.route.js';
import { expertRouter, adminExpertRouter } from './expert.route.js';
import inventoryRoute from './inventory.route.js';
import aiRoute from './ai.route.js';
import notificationRoute from './notification.route.js';
import petRoute from './pet.route.js';
import bookingRoute from './booking.route.js';
import paymentRoute from './payment.route.js';
import adoptionRoute from './adoption.route.js';
import voucherRoute from './voucher.route.js';
import customerRoute from './customer.route.js';
import petPhuongRoute from './pet-phuong.route.js';
import productRoute from './product.route.js';
import medicalRoute from './medical.route.js';
import prescriptionRoute from './prescription.route.js';
import reviewRoute from './review.route.js';
import cashPaymentRoute from './cash-payment.route.js';
import adoptionPhuongRoute from './adoption-phuong.route.js';
import medicineSuggestionRoute from './medicine-suggestion.route.js';
import * as userController from '../../controllers/user.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  adminCreateUserSchema,
  adminUpdateUserSchema,
  adminUpdateStatusSchema,
} from '../../validators/user.validator.js';
import { ROLES } from '../../utils/constants.js';
import { AppDataSource } from '../../config/data-source.js';

const Router = express.Router();

/** Check APIs v1/status (Chuẩn phong cách TrungQuanDev) */
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use.' });
});

// Health-check endpoint: Kiểm tra trạng thái server & DB
Router.get('/health', async (req, res) => {
  const isDbConnected = AppDataSource.isInitialized;
  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Animora API V1 Server is running',
    database: isDbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// [ACC-01, 02, 03, 06, 07] Authentication Routes
Router.use('/auth', authRoute);

// [ACC-04, 05] User Profile & Address Routes
Router.use('/users', userRoute);

// [ACC-08] Admin User Management Routes: /api/v1/admin/users
const adminUserRoute = express.Router();
adminUserRoute.use(verifyToken, authorizeRoles(ROLES.ADMIN));

adminUserRoute.get('/', userController.adminGetUsers);
adminUserRoute.get('/:id', userController.adminGetUserById);
adminUserRoute.post('/', validate(adminCreateUserSchema), userController.adminCreateUser);
adminUserRoute.put('/:id', validate(adminUpdateUserSchema), userController.adminUpdateUser);
adminUserRoute.patch('/:id/status', validate(adminUpdateStatusSchema), userController.adminUpdateStatus);
adminUserRoute.delete('/:id', userController.adminDeleteUser);

Router.use('/admin/users', adminUserRoute);

// [SVC-01] Services Routes: /api/v1/services
Router.use('/services', serviceRoute);

// [EXP-01..05, SVC-02, BKG-05..09] Expert Routes: /api/v1/experts & /api/v1/admin/experts
Router.use('/experts', expertRouter);
Router.use('/admin/experts', adminExpertRouter);

// [SUP-01..03, PUR-01..04, INV-01..04] Inventory Routes
Router.use('/admin/inventory', inventoryRoute);

// [AI-01..05] AI Assistant Routes: /api/v1/ai
Router.use('/ai', aiRoute);

// [NTF-01] Notification Routes: /api/v1/notifications
Router.use('/notifications', notificationRoute);

// [PET-01] Pet Profiles Routes: /api/v1/pets
Router.use('/pets', petRoute);

// [BKG-01..04] Booking & Payment Routes: /api/v1/bookings & /api/v1/payments
Router.use('/bookings', bookingRoute);
Router.use('/payments', paymentRoute);

// [ADP-01] Adoption & Handover Routes: /api/v1/adoptions
Router.use('/adoptions', adoptionRoute);

// [VCH-01..04] Shop Voucher Routes: /api/v1/vouchers
Router.use('/vouchers', voucherRoute);

// [MGR-CUS] Manager & Admin Customer Management Routes: /api/v1/manager/customers & /api/v1/customers
Router.use('/manager/customers', customerRoute);
Router.use('/customers', customerRoute);

// --- Phuong (26 UC, merge 17/11) ---
// Pet: gan SAU route pet cua nhom — CRUD cua nhom thang, chi them
// vaccinations/allergies (khong trung duong dan) moi toi duoc route nay.
Router.use('/pets', petPhuongRoute);
// Product & Category: /products, /categories, /admin/products, /admin/categories
Router.use(productRoute);
// Vet Medical: /vet/... + /pets/:id/medical-records
Router.use(medicalRoute);
// Prescriptions: /vet/prescriptions, /prescriptions
Router.use(prescriptionRoute);
// Reviews: /bookings/:id/review, /experts/:id/reviews
Router.use(reviewRoute);
// SPAY-05 Cash Payment: /experts/me/bookings/:id/cash-payment
Router.use(cashPaymentRoute);
// Adoption (Phuong): /shelters/me/adoption-applications, /adoption-applications/:id/create-pet
Router.use(adoptionPhuongRoute);
// MED-09 Medicine Suggestions: /medicine-suggestions
Router.use(medicineSuggestionRoute);

export const APIs_V1 = Router;
export default Router;
