// Validator bệnh án (MED-01/02/03).
// Chỉ nhận tên trường của schema v1.5 mới — symptoms/diagnosis/treatment/notes
// kiểu cũ đã BỎ HẲN, chỉ còn subjective_symptoms / assessment_diagnosis /
// plan_treatment / doctor_advice / care_notes_for_staff.
// assessment_diagnosis bắt buộc (NOT NULL trong DB).
// severity_level: MILD/SEVERE. prescription item: dosage bắt buộc,
// usage_instructions (không còn usage_note/note).
import Joi from 'joi';

const prescriptionItemSchema = Joi.object({
  product_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().positive().required(),
  dosage: Joi.string().max(200).required(),
  frequency: Joi.string().max(200).optional().allow(null, ''),
  duration_days: Joi.number().integer().positive().optional().allow(null),
  usage_instructions: Joi.string().max(1000).optional().allow(null, ''),
  species_mismatch_ack: Joi.boolean().optional(),
});

const newPrescriptionSchema = Joi.object({
  severity: Joi.string().valid('MILD', 'SEVERE', 'mild', 'severe').optional(),
  valid_until: Joi.date().iso().optional().allow(null, ''),
  max_refills: Joi.number().integer().min(0).max(1000).optional(),
  notes: Joi.string().max(1500).optional().allow(null, ''),
  items: Joi.array().items(prescriptionItemSchema).optional(),
});

const createMedicalRecordSchema = Joi.object({
  pet_id: Joi.number().integer().positive().required(),
  appointment_id: Joi.number().integer().positive().required(),
  actual_weight_kg: Joi.number().positive().optional().allow(null),
  temperature_c: Joi.number().min(30).max(45).optional().allow(null),
  subjective_symptoms: Joi.string().optional().allow(null, ''),
  objective_findings: Joi.string().optional().allow(null, ''),
  assessment_diagnosis: Joi.string().required(),
  severity_level: Joi.string().valid('MILD', 'SEVERE', 'mild', 'severe').optional(),
  plan_treatment: Joi.string().optional().allow(null, ''),
  doctor_advice: Joi.string().optional().allow(null, ''),
  care_notes_for_staff: Joi.string().max(1000).optional().allow(null, ''),
  follow_up_date: Joi.date().iso().optional().allow(null, ''),
});

const updateMedicalNotesSchema = Joi.object({
  subjective_symptoms: Joi.string().optional().allow(null, ''),
  objective_findings: Joi.string().optional().allow(null, ''),
  assessment_diagnosis: Joi.string().optional(),
  severity_level: Joi.string().valid('MILD', 'SEVERE', 'mild', 'severe').optional(),
  plan_treatment: Joi.string().optional().allow(null, ''),
  doctor_advice: Joi.string().optional().allow(null, ''),
  care_notes_for_staff: Joi.string().max(1000).optional().allow(null, ''),
  follow_up_date: Joi.date().iso().optional().allow(null, ''),
  actual_weight_kg: Joi.number().positive().optional().allow(null),
  temperature_c: Joi.number().min(30).max(45).optional().allow(null),
  new_prescription: newPrescriptionSchema.optional(),
}).min(1);

export {
  prescriptionItemSchema,
  newPrescriptionSchema,
  createMedicalRecordSchema,
  updateMedicalNotesSchema,
};
