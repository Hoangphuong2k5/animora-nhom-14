// Validator đánh giá dịch vụ (RVW-01).
import Joi from 'joi';

const createReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(2000).optional().allow(null, ''),
  staff_user_id: Joi.number().integer().positive().optional(),
});

export { createReviewSchema };
