import Joi from 'joi';

const bookingIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID lịch hẹn phải là số nguyên dương',
  }),
});

const bookingAvailabilityQuerySchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
    'any.required': 'Vui lòng truyền ngày cần kiểm tra (YYYY-MM-DD)',
  }),
  pet_id: Joi.number().integer().positive().optional(),
  expert_id: Joi.number().integer().positive().optional(),
})
  .rename('petId', 'pet_id', { ignoreUndefined: true })
  .rename('expertId', 'expert_id', { ignoreUndefined: true });

const bookingQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string()
    .valid('Pending', 'Confirmed', 'InProgress', 'Completed', 'Cancelled', 'Rejected', 'NoShow')
    .optional(),
  pet_id: Joi.number().integer().positive().optional(),
  from_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const createBookingSchema = Joi.object({
  pet_id: Joi.number().integer().positive().required().messages({
    'any.required': 'Vui lòng chọn thú cưng (pet_id)',
  }),
  service_id: Joi.number().integer().positive().optional(),
  services: Joi.array()
    .items(
      Joi.object({
        service_id: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().min(1).default(1),
        notes: Joi.string().max(500).allow('', null).optional(),
      })
    )
    .min(1)
    .optional(),
  expert_id: Joi.number().integer().positive().allow(null).optional(),
  scheduled_at: Joi.date().iso().required().messages({
    'any.required': 'Vui lòng chọn ngày giờ đặt lịch (scheduled_at)',
  }),
  payment_timing: Joi.string()
    .valid('Prepaid', 'Postpaid', 'prepaid', 'postpaid')
    .default('Postpaid'),
  customer_note: Joi.string().trim().max(1000).allow('', null).optional(),
})
  .rename('petId', 'pet_id', { ignoreUndefined: true })
  .rename('serviceId', 'service_id', { ignoreUndefined: true })
  .rename('expertId', 'expert_id', { ignoreUndefined: true })
  .rename('scheduledAt', 'scheduled_at', { ignoreUndefined: true })
  .rename('appointmentAt', 'scheduled_at', { ignoreUndefined: true })
  .rename('paymentTiming', 'payment_timing', { ignoreUndefined: true })
  .rename('note', 'customer_note', { ignoreUndefined: true })
  .or('service_id', 'services')
  .messages({
    'object.missing': 'Vui lòng chọn ít nhất một dịch vụ (service_id hoặc services)',
  });

const cancelBookingSchema = Joi.object({
  reason: Joi.string().trim().max(1000).allow('', null).optional(),
});

const rescheduleBookingSchema = Joi.object({
  scheduled_at: Joi.date().iso().required().messages({
    'any.required': 'Vui lòng chọn thời gian mới (scheduled_at)',
  }),
  reason: Joi.string().trim().max(1000).allow('', null).optional(),
})
  .rename('scheduledAt', 'scheduled_at', { ignoreUndefined: true })
  .rename('appointmentAt', 'scheduled_at', { ignoreUndefined: true });

const createVnpayUrlSchema = Joi.object({
  appointment_id: Joi.number().integer().positive().optional(),
  order_id: Joi.number().integer().positive().optional(),
  idempotency_key: Joi.string().trim().max(150).optional(),
  bank_code: Joi.string().trim().max(20).allow('', null).optional(),
})
  .rename('appointmentId', 'appointment_id', { ignoreUndefined: true })
  .rename('booking_id', 'appointment_id', { ignoreUndefined: true })
  .rename('orderId', 'order_id', { ignoreUndefined: true })
  .rename('idempotencyKey', 'idempotency_key', { ignoreUndefined: true })
  .xor('appointment_id', 'order_id')
  .messages({
    'object.missing': 'Vui lòng truyền appointment_id hoặc order_id',
    'object.xor': 'Chỉ được truyền một trong hai: appointment_id hoặc order_id',
  });

const confirmCashPaymentSchema = Joi.object({
  note: Joi.string().trim().max(500).allow('', null).optional(),
});

export {
  bookingIdParamSchema,
  bookingAvailabilityQuerySchema,
  bookingQuerySchema,
  createBookingSchema,
  cancelBookingSchema,
  rescheduleBookingSchema,
  createVnpayUrlSchema,
  confirmCashPaymentSchema,
};
export default {
  bookingIdParamSchema,
  bookingAvailabilityQuerySchema,
  bookingQuerySchema,
  createBookingSchema,
  cancelBookingSchema,
  rescheduleBookingSchema,
  createVnpayUrlSchema,
  confirmCashPaymentSchema,
};

