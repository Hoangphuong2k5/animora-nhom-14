import express from 'express';
import bookingController from '../../controllers/booking.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  bookingIdParamSchema,
  bookingAvailabilityQuerySchema,
  bookingQuerySchema,
  createBookingSchema,
  cancelBookingSchema,
  rescheduleBookingSchema,
} from '../../validators/booking.validator.js';

const router = express.Router();

router.get(
  '/availability',
  validate(bookingAvailabilityQuerySchema, 'query'),
  bookingController.getAvailability
);

router.use(verifyToken);

router.get('/', validate(bookingQuerySchema, 'query'), bookingController.listBookings);
router.get('/:id', validate(bookingIdParamSchema, 'params'), bookingController.getBookingById);
router.post('/', validate(createBookingSchema), bookingController.createBooking);
router.patch(
  '/:id/cancel',
  validate({ params: bookingIdParamSchema, body: cancelBookingSchema }),
  bookingController.cancelBooking
);
router.patch(
  '/:id/reschedule',
  validate({ params: bookingIdParamSchema, body: rescheduleBookingSchema }),
  bookingController.rescheduleBooking
);

export default router;

