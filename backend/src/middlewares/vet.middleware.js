// Middleware kiểm tra quyền bác sĩ thú y — theo schema Animora v1.5 mới.
// experts (v1.6) đã mất: bác sĩ = staff_profiles.staff_role = 'BS'
// AND is_active = 1, tài khoản users đang ACTIVE.
// req.vet là dòng staff_profiles; doctor_user_id = req.vet.user_id
// (không còn experts.id).
import { AppDataSource } from '../config/data-source.js';
import { ApiError } from '../utils/ApiError.js';

const requireApprovedVet = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      throw new ApiError(401, 'Chưa đăng nhập', 'UNAUTHORIZED');
    }

    const rows = await AppDataSource.query(
      `SELECT sp.staff_id, sp.user_id, sp.staff_code, sp.staff_role
       FROM dbo.staff_profiles sp
       INNER JOIN dbo.users u ON u.user_id = sp.user_id
       WHERE sp.user_id = @0 AND sp.staff_role = 'BS' AND sp.is_active = 1
         AND u.account_status = 'ACTIVE'`,
      [Number(userId)],
    );

    if (!rows[0]) {
      throw new ApiError(403, 'Chỉ bác sĩ thú y mới được thực hiện thao tác này', 'FORBIDDEN');
    }

    req.vet = rows[0];
    next();
  } catch (error) {
    next(error);
  }
};

export { requireApprovedVet };
