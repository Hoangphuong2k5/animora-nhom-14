import Joi from 'joi';

const notificationQuerySchema = Joi.object({
  is_read: Joi.boolean().optional(),
  after_id: Joi.number().integer().positive().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const notificationIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const wrappedQuery = { query: notificationQuerySchema };
const wrappedParam = { params: notificationIdParamSchema };

export {
  wrappedQuery as notificationQuerySchema,
  wrappedParam as notificationIdParamSchema,
};
export default {
  notificationQuerySchema: wrappedQuery,
  notificationIdParamSchema: wrappedParam,
};
