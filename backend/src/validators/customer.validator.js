import Joi from 'joi';
import { USER_STATUS } from '../utils/constants.js';

const getCustomersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow('', null).default(''),
  status: Joi.string().valid('all', 'Active', 'Locked', 'active', 'locked', 'Inactive', 'inactive').allow(null, '').default('all'),
});

const updateCustomerStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      USER_STATUS.ACTIVE,
      USER_STATUS.LOCKED,
      'Active',
      'Locked',
      'active',
      'locked'
    )
    .required()
    .messages({
      'any.required': 'Trạng thái (status) là bắt buộc',
      'any.only': 'Trạng thái phải là Active hoặc Locked',
    }),
  reason: Joi.string().trim().max(500).allow('', null),
});

export {
  getCustomersSchema,
  updateCustomerStatusSchema,
};
export default {
  getCustomersSchema,
  updateCustomerStatusSchema,
};
