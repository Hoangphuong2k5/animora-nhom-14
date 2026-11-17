import Joi from 'joi';

const adoptionIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID phải là số nguyên dương',
  }),
});

const listListingsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('Draft', 'Available', 'Pending', 'Adopted', 'Closed').optional(),
  species: Joi.string().max(100).optional(),
  search: Joi.string().max(200).allow('').optional(),
});

const createListingSchema = Joi.object({
  pet_id: Joi.number().integer().positive().required(),
  rescue_station_id: Joi.number().integer().positive().optional(),
  title: Joi.string().trim().min(3).max(200).required(),
  description: Joi.string().trim().max(2000).allow('', null).optional(),
  health_summary: Joi.string().trim().max(2000).allow('', null).optional(),
  temperament: Joi.string().trim().max(500).allow('', null).optional(),
  adoption_requirements: Joi.string().trim().max(2000).allow('', null).optional(),
  status: Joi.string().valid('Draft', 'Available').default('Available'),
})
  .rename('petId', 'pet_id', { ignoreUndefined: true })
  .rename('rescueStationId', 'rescue_station_id', { ignoreUndefined: true })
  .rename('healthSummary', 'health_summary', { ignoreUndefined: true })
  .rename('adoptionRequirements', 'adoption_requirements', { ignoreUndefined: true });

const listApplicationsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string()
    .valid('Pending', 'UnderReview', 'Approved', 'Rejected', 'Withdrawn', 'Completed')
    .optional(),
  rescue_station_id: Joi.number().integer().positive().optional(),
});

const submitApplicationSchema = Joi.object({
  listing_id: Joi.number().integer().positive().required(),
  applicant_reason: Joi.string().trim().max(2000).allow('', null).optional(),
  living_environment: Joi.string().trim().max(2000).allow('', null).optional(),
  experience_description: Joi.string().trim().max(2000).allow('', null).optional(),
})
  .rename('listingId', 'listing_id', { ignoreUndefined: true })
  .rename('applicantReason', 'applicant_reason', { ignoreUndefined: true })
  .rename('livingEnvironment', 'living_environment', { ignoreUndefined: true })
  .rename('experienceDescription', 'experience_description', { ignoreUndefined: true });

const reviewApplicationSchema = Joi.object({
  status: Joi.string().valid('UnderReview', 'Approved', 'Rejected', 'Withdrawn').required(),
  note: Joi.string().trim().max(2000).allow('', null).optional(),
});

const scheduleHandoverSchema = Joi.object({
  start_at: Joi.date().iso().required(),
  end_at: Joi.date().iso().required(),
  notes: Joi.string().trim().max(1000).allow('', null).optional(),
})
  .rename('startAt', 'start_at', { ignoreUndefined: true })
  .rename('endAt', 'end_at', { ignoreUndefined: true });

const confirmHandoverSchema = Joi.object({
  note: Joi.string().trim().max(1000).allow('', null).optional(),
});

export {
  adoptionIdParamSchema,
  listListingsQuerySchema,
  createListingSchema,
  listApplicationsQuerySchema,
  submitApplicationSchema,
  reviewApplicationSchema,
  scheduleHandoverSchema,
  confirmHandoverSchema,
};
export default {
  adoptionIdParamSchema,
  listListingsQuerySchema,
  createListingSchema,
  listApplicationsQuerySchema,
  submitApplicationSchema,
  reviewApplicationSchema,
  scheduleHandoverSchema,
  confirmHandoverSchema,
};

