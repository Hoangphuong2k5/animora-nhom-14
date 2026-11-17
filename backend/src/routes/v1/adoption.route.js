import express from 'express';
import adoptionController from '../../controllers/adoption.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  adoptionIdParamSchema,
  listListingsQuerySchema,
  createListingSchema,
  listApplicationsQuerySchema,
  submitApplicationSchema,
  reviewApplicationSchema,
  scheduleHandoverSchema,
  confirmHandoverSchema,
} from '../../validators/adoption.validator.js';

const router = express.Router();

// Public: xem danh sách thú cưng nhận nuôi
router.get('/listings', validate(listListingsQuerySchema, 'query'), adoptionController.listListings);

// Authenticated routes
router.use(verifyToken);

router.post(
  '/listings',
  authorizeRoles('shelter', 'rescue_station', 'manager', 'admin'),
  validate(createListingSchema),
  adoptionController.createListing
);

router.get(
  '/applications/my',
  validate(listApplicationsQuerySchema, 'query'),
  adoptionController.listApplications
);

router.get(
  '/applications',
  authorizeRoles('shelter', 'rescue_station', 'manager', 'admin', 'staff'),
  validate(listApplicationsQuerySchema, 'query'),
  adoptionController.listApplications
);

router.post(
  '/applications',
  validate(submitApplicationSchema),
  adoptionController.submitApplication
);

router.patch(
  '/applications/:id/review',
  validate({ params: adoptionIdParamSchema, body: reviewApplicationSchema }),
  adoptionController.reviewApplication
);

router.post(
  '/applications/:id/handover',
  authorizeRoles('shelter', 'rescue_station', 'manager', 'admin'),
  validate({ params: adoptionIdParamSchema, body: scheduleHandoverSchema }),
  adoptionController.scheduleHandover
);

router.patch(
  '/applications/:id/handover-confirm',
  validate({ params: adoptionIdParamSchema, body: confirmHandoverSchema }),
  adoptionController.confirmHandover
);

export default router;

