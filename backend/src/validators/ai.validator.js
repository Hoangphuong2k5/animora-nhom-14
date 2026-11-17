import Joi from 'joi';

const openConversationSchema = {
  body: Joi.object({
    pet_id: Joi.number().integer().positive().allow(null).optional(),
  }),
};

const conversationIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const sendMessageSchema = {
  params: conversationIdParamSchema,
  body: Joi.object({
    content: Joi.string().trim().min(1).max(1000).required().messages({
      'string.empty': 'Nội dung câu hỏi không được để trống',
      'string.max': 'Câu hỏi tối đa 1000 ký tự',
    }),
  }),
};

const listConversationsSchema = {
  query: Joi.object({
    after_id: Joi.number().integer().positive().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

const listMessagesSchema = {
  params: conversationIdParamSchema,
  query: Joi.object({
    after_id: Joi.number().integer().positive().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50),
  }),
};

export {
  openConversationSchema,
  sendMessageSchema,
  listConversationsSchema,
  listMessagesSchema,
};
export default {
  openConversationSchema,
  sendMessageSchema,
  listConversationsSchema,
  listMessagesSchema,
};
