// Validator đơn thuốc (MED-04–08).
// Chỉ nhận tên trường của schema v1.5 mới — allow_reorder, version,
// parent_id, usage_note, note (kê đơn) đã BỎ HẲN.
// severity: MILD/SEVERE. max_refills 0–1000 (bệnh nặng luôn = 0).
import Joi from 'joi';
import { prescriptionItemSchema } from './medical.validator.js';

const createPrescriptionSchema = Joi.object({
  medical_record_id: Joi.number().integer().positive().required(),
  appointment_id: Joi.number().integer().positive().optional(),
  customer_id: Joi.number().integer().positive().optional(),
  pet_id: Joi.number().integer().positive().optional(),
  severity: Joi.string().valid('MILD', 'SEVERE', 'mild', 'severe').required(),
  valid_until: Joi.date().iso().optional().allow(null, ''),
  max_refills: Joi.number().integer().min(0).max(1000).optional(),
  notes: Joi.string().max(1500).optional().allow(null, ''),
  items: Joi.array().items(prescriptionItemSchema).optional(),
});

const updatePrescriptionSchema = Joi.object({
  appointment_id: Joi.number().integer().positive().optional(),
  customer_id: Joi.number().integer().positive().optional(),
  pet_id: Joi.number().integer().positive().optional(),
  severity: Joi.string().valid('MILD', 'SEVERE', 'mild', 'severe').optional(),
  valid_until: Joi.date().iso().optional().allow(null, ''),
  max_refills: Joi.number().integer().min(0).max(1000).optional(),
  notes: Joi.string().max(1500).optional().allow(null, ''),
  items: Joi.array().items(prescriptionItemSchema).optional(),
}).min(1);

const validatePurchaseSchema = Joi.object({
  prescription_id: Joi.number().integer().positive().optional(),
  items: Joi.array()
    .items(
      Joi.object({
        product_id: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().positive().required(),
      }),
    )
    .min(1)
    .required(),
});

export {
  createPrescriptionSchema,
  updatePrescriptionSchema,
  validatePurchaseSchema,
};
