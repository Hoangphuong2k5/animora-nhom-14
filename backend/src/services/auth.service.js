const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');
const config = require('../config/env.config');
const authRepository = require('../repositories/auth.repository');
const ApiError = require('../utils/ApiError');
const { ROLES, USER_STATUS } = require('../utils/constants');

/**
 * Sinh cặp Access Token và Refresh Token cho người dùng
 */
const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });

  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });

  return { accessToken, refreshToken };
};

/**
 * [ACC-01] Đăng ký tài khoản khách hàng mới
 */
const register = async ({ email, password, full_name, phone }) => {
  const existingUser = await authRepository.findByEmail(email);
  if (existingUser) {
    throw new ApiError(409, 'Email này đã được đăng ký trong hệ thống', 'EMAIL_ALREADY_EXISTS');
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const newUserData = {
    email,
    password_hash: passwordHash,
    full_name,
    phone: phone || null,
    role: ROLES.CUSTOMER,
    status: USER_STATUS.ACTIVE,
  };

  const createdUser = await authRepository.createUser(newUserData);
  const { password_hash, ...userResponse } = createdUser;
  return userResponse;
};

/**
 * [ACC-02] Đăng nhập hệ thống & cấp JWT Bearer Token
 */
const login = async ({ email, password }) => {
  const user = await authRepository.findByEmail(email);
  if (!user) {
    throw new ApiError(401, 'Email hoặc mật khẩu không chính xác', 'INVALID_CREDENTIALS');
  }

  if (user.status === USER_STATUS.BANNED) {
    throw new ApiError(403, 'Tài khoản của bạn đã bị khóa do vi phạm chính sách', 'ACCOUNT_BANNED');
  }
  if (user.status === USER_STATUS.INACTIVE || user.status === USER_STATUS.DELETED) {
    throw new ApiError(403, 'Tài khoản của bạn hiện đang ngừng hoạt động', 'ACCOUNT_DISABLED');
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new ApiError(401, 'Email hoặc mật khẩu không chính xác', 'INVALID_CREDENTIALS');
  }

  const tokens = generateTokens(user);
  const { password_hash, ...userInfo } = user;
  return {
    user: userInfo,
    tokens,
  };
};

/**
 * [ACC-03] Đăng xuất tài khoản
 */
const logout = async (userId) => {
  return {
    loggedOut: true,
    userId,
  };
};

/**
 * [ACC-06] Đổi mật khẩu tài khoản
 */
const changePassword = async (userId, { old_password, new_password }) => {
  const user = await authRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, 'Không tìm thấy tài khoản người dùng', 'USER_NOT_FOUND');
  }

  const isMatch = await bcrypt.compare(old_password, user.password_hash);
  if (!isMatch) {
    throw new ApiError(400, 'Mật khẩu cũ không chính xác', 'INVALID_OLD_PASSWORD');
  }

  if (old_password === new_password) {
    throw new ApiError(400, 'Mật khẩu mới không được trùng với mật khẩu hiện tại', 'SAME_PASSWORD');
  }

  const saltRounds = 10;
  const newPasswordHash = await bcrypt.hash(new_password, saltRounds);
  await authRepository.updatePassword(userId, newPasswordHash);

  return true;
};

/**
 * [ACC-07] Quên mật khẩu - Sinh mã Token khôi phục mật khẩu
 */
const forgotPassword = async ({ email }) => {
  const user = await authRepository.findByEmail(email);
  if (!user) {
    // Thông báo an toàn: không làm lộ email có tồn tại hay không
    return {
      message: 'Nếu email của bạn tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.',
    };
  }

  // 1. Tạo chuỗi ngẫu nhiên 32 bytes (64 hex characters)
  const rawToken = crypto.randomBytes(32).toString('hex');

  // 2. Hash token lưu vào DB (SHA-256)
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  // 3. Hạn sử dụng token là 15 phút
  const expiresAt = dayjs().add(15, 'minute').toDate();

  await authRepository.createPasswordResetToken({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  return {
    message: 'Yêu cầu đặt lại mật khẩu đã được xử lý thành công.',
    // Trả về resetToken để môi trường development / test Postman có thể test ngay mà không cần cấu hình SMTP thật
    resetToken: rawToken,
    expiresAt,
  };
};

/**
 * [ACC-07] Đặt lại mật khẩu với Token hợp lệ
 */
const resetPassword = async ({ token, new_password }) => {
  // 1. Hash token nhận từ client để tìm trong DB
  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

  // 2. Tìm token còn hạn và chưa sử dụng
  const tokenRecord = await authRepository.findValidResetToken(tokenHash);
  if (!tokenRecord) {
    throw new ApiError(400, 'Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn', 'INVALID_RESET_TOKEN');
  }

  // 3. Mã hóa mật khẩu mới
  const saltRounds = 10;
  const newPasswordHash = await bcrypt.hash(new_password, saltRounds);

  // 4. Cập nhật mật khẩu mới cho user
  await authRepository.updatePassword(tokenRecord.user_id, newPasswordHash);

  // 5. Đánh dấu token đã được sử dụng
  await authRepository.markTokenUsed(tokenRecord.id);

  return true;
};

/**
 * Lấy thông tin tài khoản đang đăng nhập
 */
const getCurrentUser = async (userId) => {
  const user = await authRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, 'Không tìm thấy thông tin tài khoản', 'USER_NOT_FOUND');
  }

  const { password_hash, ...userInfo } = user;
  return userInfo;
};

module.exports = {
  register,
  login,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  getCurrentUser,
};
