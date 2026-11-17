import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';

/**
 * Middleware validate đầu vào bằng Joi (Rule 14):
 *  - Hỗ trợ validate(schema, 'body' | 'query' | 'params')
 *  - Hỗ trợ validate({ body, query, params })
 *  - Trả 422 Unprocessable Entity kèm danh sách errors: [{ field, message }]
 *  - Lưu kết quả chuẩn hóa vào req.validated
 */
export const validate = (schema, property = 'body') => async (req, res, next) => {
  try {
    if (!schema) return next();

    // Trường hợp 1: schema là Joi Schema đơn lẻ
    if (typeof schema.validateAsync === 'function') {
      const value = await schema.validateAsync(req[property], { abortEarly: false, stripUnknown: true });
      req.validated = { ...req.validated, [property]: value };
      if (property !== 'query') {
        req[property] = value;
      }
      return next();
    }

    // Trường hợp 2: schema là object gom nhóm { body, query, params }
    const targets = Object.entries(schema).filter(
      ([, subSchema]) => subSchema && typeof subSchema.validateAsync === 'function'
    );

    for (const [targetProp, subSchema] of targets) {
      const value = await subSchema.validateAsync(req[targetProp], {
        abortEarly: false,
        stripUnknown: true,
      });
      req.validated = { ...req.validated, [targetProp]: value };
      if (targetProp !== 'query') {
        req[targetProp] = value;
      }
    }

    next();
  } catch (error) {
    const errors =
      error.details?.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      })) ?? null;

    next(
      new ApiError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Dữ liệu không hợp lệ',
        'VALIDATION_ERROR',
        errors
      )
    );
  }
};

export default { validate };
