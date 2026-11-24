// Validator hồ sơ thú cưng (PET-01/02/03/05) + lịch sức khỏe (PET-07).
// Chỉ nhận tên trường của schema v1.5 mới — các trường cũ đã BỎ HẲN:
// name, weight, color, avatar, breed (chuỗi), chronic, vaccine_name,
// vaccinated_at, note (lịch tiêm) đều không còn được chấp nhận.
// Loài chỉ nhận 4 mã: DOG, CAT, RODENT, RABBIT (chấp nhận cả chữ thường,
// service sẽ chuẩn hóa về chữ hoa; bird/other bị chặn ở đây).
import Joi from 'joi';

const createPetSchema = Joi.object({
  pet_name: Joi.string().max(120).required(),
  species: Joi.string()
    .valid('DOG', 'CAT', 'RODENT', 'RABBIT', 'dog', 'cat', 'rodent', 'rabbit')
    .required(),
  breed_id: Joi.number().integer().positive().optional(),
  custom_breed_name: Joi.string().max(120).optional().allow(null, ''),
  gender: Joi.string()
    .valid('MALE', 'FEMALE', 'UNKNOWN', 'male', 'female', 'unknown')
    .optional(),
  birth_date: Joi.date().iso().optional().allow(null, ''),
  estimated_age_months: Joi.number().integer().min(0).optional().allow(null),
  weight_kg: Joi.number().positive().optional().allow(null),
  coat_color: Joi.string().max(100).optional().allow(null, ''),
  avatar_url: Joi.string().max(1000).optional().allow(null, ''),
  allergies: Joi.alternatives().try(Joi.string(), Joi.array(), Joi.object()).optional().allow(null),
  special_behaviors: Joi.alternatives().try(Joi.string(), Joi.array(), Joi.object()).optional().allow(null),
  neutered_status: Joi.string()
    .valid('NEUTERED', 'INTACT', 'UNKNOWN', 'neutered', 'intact', 'unknown')
    .optional(),
});

const updatePetSchema = Joi.object({
  pet_name: Joi.string().max(120).optional(),
  breed_id: Joi.number().integer().positive().optional().allow(null),
  custom_breed_name: Joi.string().max(120).optional().allow(null, ''),
  gender: Joi.string()
    .valid('MALE', 'FEMALE', 'UNKNOWN', 'male', 'female', 'unknown')
    .optional(),
  birth_date: Joi.date().iso().optional().allow(null, ''),
  estimated_age_months: Joi.number().integer().min(0).optional().allow(null),
  weight_kg: Joi.number().positive().optional().allow(null),
  coat_color: Joi.string().max(100).optional().allow(null, ''),
  avatar_url: Joi.string().max(1000).optional().allow(null, ''),
  allergies: Joi.alternatives().try(Joi.string(), Joi.array(), Joi.object()).optional().allow(null),
  special_behaviors: Joi.alternatives().try(Joi.string(), Joi.array(), Joi.object()).optional().allow(null),
  neutered_status: Joi.string()
    .valid('NEUTERED', 'INTACT', 'UNKNOWN', 'neutered', 'intact', 'unknown')
    .optional(),
}).min(1);

const createHealthScheduleSchema = Joi.object({
  schedule_type: Joi.string()
    .valid('VACCINATION', 'DEWORMING', 'FOLLOW_UP', 'vaccination', 'deworming', 'follow_up')
    .optional()
    .default('VACCINATION'),
  title: Joi.string().max(200).required(),
  performed_date: Joi.date().iso().optional().allow(null, ''),
  next_due_date: Joi.date().iso().optional().allow(null, ''),
  notes: Joi.string().max(1000).optional().allow(null, ''),
  medical_record_id: Joi.number().integer().positive().optional().allow(null),
});

const updateAllergiesSchema = Joi.object({
  allergies: Joi.alternatives().try(Joi.string(), Joi.array(), Joi.object()).required(),
});

export {
  createPetSchema,
  updatePetSchema,
  createHealthScheduleSchema,
  updateAllergiesSchema,
};
