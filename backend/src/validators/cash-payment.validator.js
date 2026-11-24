// Validator thu tiền mặt tại quầy (SPAY-05).
import Joi from 'joi';

const confirmCashPaymentSchema = Joi.object({
  note: Joi.string().max(500).optional().allow(null, ''),
  idempotency_key: Joi.string().max(120).optional().allow(null, ''),
  prescription_id: Joi.number().integer().positive().optional(),
});

export { confirmCashPaymentSchema };
