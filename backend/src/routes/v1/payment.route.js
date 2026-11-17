import express from 'express';
import paymentController from '../../controllers/payment.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  bookingIdParamSchema,
  createVnpayUrlSchema,
  confirmCashPaymentSchema,
} from '../../validators/booking.validator.js';

const router = express.Router();

// Public callbacks từ VNPAY
router.get('/vnpay/ipn', paymentController.vnpayIpn);
router.get('/vnpay/return', paymentController.vnpayReturn);

// Authenticated routes
router.use(verifyToken);

router.get('/my', paymentController.listMyPayments);
router.post('/vnpay/create-url', validate(createVnpayUrlSchema), paymentController.createVnpayUrl);
router.patch(
  '/:id/confirm-cash',
  authorizeRoles('admin', 'manager', 'staff', 'expert', 'doctor', 'care_staff'),
  validate({ params: bookingIdParamSchema, body: confirmCashPaymentSchema }),
  paymentController.confirmCashPayment
);

export default router;

