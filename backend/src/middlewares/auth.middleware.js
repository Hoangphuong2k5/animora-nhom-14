const jwt = require('jsonwebtoken');
const config = require('../config/env.config');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Middleware xác thực Bearer Token (JWT)
 */
const verifyToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Yêu cầu đăng nhập để truy cập tài nguyên này', 'UNAUTHORIZED');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', 'TOKEN_EXPIRED');
    }
    throw new ApiError(401, 'Mã xác thực không hợp lệ', 'INVALID_TOKEN');
  }
});

module.exports = { verifyToken };

