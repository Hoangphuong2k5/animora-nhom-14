import express from 'express';
import expertController from '../../controllers/expert.controller.js';
import expertValidator from '../../validators/expert.validator.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';

// 1. Router cho /api/v1/experts
const expertRouter = express.Router();

// --- Public Routes cho Khách hàng (EXP-04, EXP-05, SVC-02) ---
expertRouter.get(
  '/',
  validate(expertValidator.searchExpertsQuerySchema),
  expertController.searchExperts
);

// --- Authenticated Routes cho Chuyên viên (EXP-01, EXP-03, BKG-05..09) ---
expertRouter.post(
  '/onboard',
  verifyToken,
  authorizeRoles('expert', 'admin'),
  validate(expertValidator.onboardExpertSchema),
  expertController.onboardExpert
);

// Mục 22 clauden_node_js.md: Direct-to-Cloud Pre-signed PUT URL (Zero Backend Bottleneck)
expertRouter.post(
  '/certificates/presigned-url',
  verifyToken,
  authorizeRoles('expert', 'admin'),
  validate(expertValidator.createPresignedUrlSchema),
  expertController.createCertificatePresignedUrl
);

expertRouter.post(
  '/certificates',
  verifyToken,
  authorizeRoles('expert', 'admin'),
  validate(expertValidator.addCertificateSchema),
  expertController.addCertificate
);

expertRouter.get(
  '/me/schedules',
  verifyToken,
  authorizeRoles('expert'),
  expertController.getMySchedules
);

expertRouter.post(
  '/me/schedules',
  verifyToken,
  authorizeRoles('expert'),
  validate(expertValidator.upsertScheduleSchema),
  expertController.upsertMySchedule
);

expertRouter.patch(
  '/me/slots/:slotId/status',
  verifyToken,
  authorizeRoles('expert'),
  validate(expertValidator.updateSlotStatusSchema),
  expertController.updateSlotStatus
);

expertRouter.get(
  '/me/bookings',
  verifyToken,
  authorizeRoles('expert'),
  expertController.getMyBookings
);

expertRouter.put(
  '/me/bookings/:id/confirm',
  verifyToken,
  authorizeRoles('expert'),
  validate({ params: expertValidator.idParamSchema }),
  expertController.confirmBooking
);

expertRouter.put(
  '/me/bookings/:id/reject',
  verifyToken,
  authorizeRoles('expert'),
  validate(expertValidator.rejectBookingSchema),
  expertController.rejectBooking
);

expertRouter.patch(
  '/me/bookings/:id/status',
  verifyToken,
  authorizeRoles('expert'),
  validate(expertValidator.updateBookingSpecialStatusSchema),
  expertController.updateBookingSpecialStatus
);

expertRouter.put(
  '/me/bookings/:id/complete',
  verifyToken,
  authorizeRoles('expert'),
  validate(expertValidator.completeBookingSchema),
  expertController.completeBooking
);

// --- Routes theo :id ---
expertRouter.get(
  '/:id',
  validate({ params: expertValidator.idParamSchema }),
  expertController.getExpertPublicProfile
);

expertRouter.get(
  '/:id/services',
  validate({ params: expertValidator.idParamSchema }),
  expertController.getExpertServices
);

expertRouter.post(
  '/:id/services',
  verifyToken,
  authorizeRoles('admin'),
  validate(expertValidator.assignServicesSchema),
  expertController.assignServices
);

// 2. Router cho /api/v1/admin/experts (EXP-02)
const adminExpertRouter = express.Router();
adminExpertRouter.use(verifyToken, authorizeRoles('admin'));

adminExpertRouter.get('/pending', expertController.getPendingExperts);
adminExpertRouter.put(
  '/:id/verify',
  validate(expertValidator.verifyExpertSchema),
  expertController.verifyExpert
);

export {
  expertRouter,
  adminExpertRouter,
};
export default {
  expertRouter,
  adminExpertRouter,
};
