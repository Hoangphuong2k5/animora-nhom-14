import Joi from 'joi';

const petIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID thú cưng phải là số nguyên dương',
  }),
});

const petQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().max(100).allow('').optional(),
});

const createPetSchema = Joi.object({
  name: Joi.string().trim().min(1).max(120).required().messages({
    'any.required': 'Tên thú cưng là bắt buộc',
  }),
  species_id: Joi.number().integer().positive().optional(),
  species: Joi.string().trim().max(100).optional(),
  breed_id: Joi.number().integer().positive().allow(null).optional(),
  breed: Joi.string().trim().max(120).allow('', null).optional(),
  birth_date: Joi.date().iso().allow(null).optional(),
  gender: Joi.string()
    .valid('Male', 'Female', 'Unknown', 'male', 'female', 'unknown')
    .default('Unknown'),
  color: Joi.string().trim().max(80).allow('', null).optional(),
  weight_kg: Joi.number().positive().max(500).allow(null).optional(),
  microchip_number: Joi.string().trim().max(100).allow('', null).optional(),
  general_notes: Joi.string().trim().max(1000).allow('', null).optional(),
  image_url: Joi.string().trim().max(1000).allow('', null).optional(),
})
  .rename('PetName', 'name', { ignoreUndefined: true })
  .rename('weight', 'weight_kg', { ignoreUndefined: true })
  .rename('notes', 'general_notes', { ignoreUndefined: true })
  .rename('avatar', 'image_url', { ignoreUndefined: true })
  .or('species_id', 'species')
  .messages({
    'object.missing': 'Vui lòng cung cấp loài thú cưng (species_id hoặc species)',
  });

const updatePetSchema = Joi.object({
  name: Joi.string().trim().min(1).max(120).optional(),
  species_id: Joi.number().integer().positive().optional(),
  species: Joi.string().trim().max(100).optional(),
  breed_id: Joi.number().integer().positive().allow(null).optional(),
  breed: Joi.string().trim().max(120).allow('', null).optional(),
  birth_date: Joi.date().iso().allow(null).optional(),
  gender: Joi.string().valid('Male', 'Female', 'Unknown', 'male', 'female', 'unknown').optional(),
  color: Joi.string().trim().max(80).allow('', null).optional(),
  weight_kg: Joi.number().positive().max(500).allow(null).optional(),
  microchip_number: Joi.string().trim().max(100).allow('', null).optional(),
  general_notes: Joi.string().trim().max(1000).allow('', null).optional(),
  image_url: Joi.string().trim().max(1000).allow('', null).optional(),
})
  .rename('PetName', 'name', { ignoreUndefined: true })
  .rename('weight', 'weight_kg', { ignoreUndefined: true })
  .rename('notes', 'general_notes', { ignoreUndefined: true })
  .rename('avatar', 'image_url', { ignoreUndefined: true })
  .min(1)
  .messages({
    'object.min': 'Vui lòng cung cấp ít nhất một trường cần cập nhật',
  });

export { petIdParamSchema, petQuerySchema, createPetSchema, updatePetSchema };
export default { petIdParamSchema, petQuerySchema, createPetSchema, updatePetSchema };

