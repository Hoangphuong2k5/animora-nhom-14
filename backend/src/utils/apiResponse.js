import ApiError from './ApiError.js';

const successResponse = (res, data = null, message = 'Thành công', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Biến thể nhận object option - dùng bởi inventory.controller:
 * sendSuccess(res, { statusCode, message, data })
 */
const sendSuccess = (res, { statusCode = 200, message = 'Thành công', data = null } = {}) => {
  return successResponse(res, data, message, statusCode);
};

const paginatedResponse = (res, data, page, limit, totalItems, message = 'Thành công') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalItems: Number(totalItems),
      totalPages: Math.ceil(totalItems / limit),
    },
  });
};

/**
 * AppError(message, statusCode, errorCode) - thứ tự tham số dùng bởi inventory.service.
 * Kế thừa ApiError nên error.middleware xử lý đồng nhất.
 */
class AppError extends ApiError {
  constructor(message, statusCode = 400, errorCode = 'BAD_REQUEST', errors = null) {
    super(statusCode, message, errorCode, errors);
  }
}

export { successResponse, sendSuccess, paginatedResponse, AppError };
export default { successResponse, sendSuccess, paginatedResponse, AppError };
