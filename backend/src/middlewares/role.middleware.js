const ApiError = require('../utils/ApiError');

/**
 * Middleware kiểm tra phân quyền RBAC dựa trên req.user.role
 * @param  {...string} allowedRoles Các vai trò được phép truy cập (admin, staff, expert, customer)
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      throw new ApiError(401, 'Chưa xác thực danh tính người dùng', 'UNAUTHORIZED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, 'Bạn không có quyền thực hiện thao tác này', 'FORBIDDEN');
    }

    next();
  };
};

module.exports = { authorizeRoles };

