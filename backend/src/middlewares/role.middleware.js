import ApiError from '../utils/ApiError.js';
import { toDbRoleName } from '../utils/constants.js';

/**
 * Middleware kiểm tra phân quyền RBAC dựa trên req.user.role / req.user.dbRole.
 * Hỗ trợ đối chiếu linh hoạt giữa tên Role trong AnimoraDB (Admin, Manager, Doctor, CareStaff, Customer, Supplier, RescueStation)
 * và các alias ở router (admin, manager, staff, warehouse, expert, customer, supplier, shelter).
 * @param  {...string} allowedRoles Các vai trò được phép truy cập
 */
const authorizeRoles = (...allowedRoles) => {
  const expandedAllowed = new Set();
  for (const role of allowedRoles) {
    if (!role) continue;
    expandedAllowed.add(String(role).trim().toLowerCase());
    expandedAllowed.add(toDbRoleName(role).toLowerCase());
  }

  return (req, res, next) => {
    if (!req.user || (!req.user.role && !req.user.dbRole)) {
      throw new ApiError(401, 'Chưa xác thực danh tính người dùng', 'UNAUTHORIZED');
    }

    const userCandidates = [
      req.user.role ? String(req.user.role).trim().toLowerCase() : null,
      req.user.dbRole ? String(req.user.dbRole).trim().toLowerCase() : null,
      req.user.role ? toDbRoleName(req.user.role).toLowerCase() : null,
    ].filter(Boolean);

    const hasAccess = userCandidates.some((candidate) => expandedAllowed.has(candidate));
    if (!hasAccess) {
      throw new ApiError(403, 'Bạn không có quyền thực hiện thao tác này', 'FORBIDDEN');
    }

    next();
  };
};

const authorize = authorizeRoles;

export { authorizeRoles, authorize };
export default { authorizeRoles, authorize };
