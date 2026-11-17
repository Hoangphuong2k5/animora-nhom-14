import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
import { env } from '../config/environment.js';
import { JwtProvider } from '../providers/jwt.provider.js';
import { GoogleProvider } from '../providers/google.provider.js';
import mailerProvider from '../providers/mailer.provider.js';
import authRepository from '../repositories/auth.repository.js';
import ApiError from '../utils/ApiError.js';
import { ROLES, USER_STATUS, toDbRoleName, toAppRoleName, toAppAccountStatus } from '../utils/constants.js';

/**
 * Sinh cặp Access Token và Refresh Token cho người dùng
 */
const generateTokens = async (user) => {
  const userId = user.id ?? user.UserID;
  const email = user.email ?? user.Email;
  const role = user.role || toAppRoleName(user.dbRole);
  const dbRole = user.dbRole || toDbRoleName(role);

  const payload = {
    id: userId,
    email,
    role,
    dbRole,
  };

  const accessToken = await JwtProvider.generateToken(
    payload,
    env.JWT_ACCESS_SECRET,
    env.JWT_ACCESS_EXPIRES_IN || '15m'
  );

  const refreshToken = await JwtProvider.generateToken(
    payload,
    env.JWT_REFRESH_SECRET,
    env.JWT_REFRESH_EXPIRES_IN || '14 days'
  );

  return { accessToken, refreshToken };
};

/**
 * Chuẩn hóa thông tin User trả về: loại bỏ password_hash / PasswordHash
 */
const formatUserResponse = (user) => {
  if (!user) return null;
  const { password_hash, PasswordHash, ...rest } = user;
  const name = user.fullName || user.full_name || '';
  return {
    ...rest,
    id: user.id ?? user.UserID,
    email: user.email ?? user.Email,
    phone: user.phone ?? user.PhoneNumber ?? null,
    role: user.role || toAppRoleName(user.dbRole),
    status: user.status || toAppAccountStatus(user.AccountStatus),
    fullName: name,
    full_name: name,
  };
};

const assertAccountActive = (user) => {
  const status = (user.status || toAppAccountStatus(user.AccountStatus) || '').toLowerCase();
  if (status === USER_STATUS.BANNED || status === USER_STATUS.LOCKED) {
    throw new ApiError(403, 'Tài khoản của bạn đã bị khóa do vi phạm chính sách', 'ACCOUNT_BANNED');
  }
  if (status === USER_STATUS.INACTIVE || status === USER_STATUS.DELETED) {
    throw new ApiError(403, 'Tài khoản của bạn hiện đang ngừng hoạt động', 'ACCOUNT_DISABLED');
  }
};

/**
 * [ACC-01] Đăng ký tài khoản khách hàng mới
 */
const register = async ({ email, password, fullName, full_name, phone }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const finalFullName = (fullName || full_name || '').trim();

  let normalizedPhone = phone ? phone.trim() : null;
  if (normalizedPhone && normalizedPhone.startsWith('+84')) {
    normalizedPhone = '0' + normalizedPhone.slice(3);
  }

  const existingUser = await authRepository.findByEmail(normalizedEmail);
  if (existingUser) {
    throw new ApiError(
      409,
      'Email này đã được đăng ký trong hệ thống, vui lòng sử dụng email khác!',
      'EMAIL_ALREADY_EXISTS'
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const createdUser = await authRepository.createUser({
    email: normalizedEmail,
    password_hash: passwordHash,
    fullName: finalFullName,
    full_name: finalFullName,
    phone: normalizedPhone,
    role: ROLES.CUSTOMER,
    status: USER_STATUS.ACTIVE,
  });

  const tokens = await generateTokens(createdUser);

  return {
    user: formatUserResponse(createdUser),
    tokens,
  };
};

/**
 * [ACC-02] Đăng nhập hệ thống & cấp JWT Token
 */
const login = async ({ email, password }) => {
  const user = await authRepository.findByEmail(email);
  if (!user) {
    throw new ApiError(401, 'Email hoặc mật khẩu không chính xác', 'INVALID_CREDENTIALS');
  }

  assertAccountActive(user);

  const hash = user.password_hash || user.PasswordHash;
  const isMatch = await bcrypt.compare(password, hash);
  if (!isMatch) {
    throw new ApiError(401, 'Email hoặc mật khẩu không chính xác', 'INVALID_CREDENTIALS');
  }

  if (typeof authRepository.updateLastLogin === 'function') {
    await authRepository.updateLastLogin(user.id ?? user.UserID).catch(() => {});
  }

  const tokens = await generateTokens(user);
  return {
    user: formatUserResponse(user),
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
const changePassword = async (userId, payload) => {
  const oldPassword = payload.oldPassword || payload.old_password;
  const newPassword = payload.newPassword || payload.new_password;

  const user = await authRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, 'Không tìm thấy tài khoản người dùng trong hệ thống', 'USER_NOT_FOUND');
  }

  const hash = user.password_hash || user.PasswordHash;
  const isMatch = await bcrypt.compare(oldPassword, hash);
  if (!isMatch) {
    throw new ApiError(400, 'Mật khẩu cũ không chính xác, vui lòng kiểm tra lại!', 'INVALID_OLD_PASSWORD');
  }

  if (oldPassword === newPassword) {
    throw new ApiError(400, 'Mật khẩu mới không được trùng với mật khẩu hiện tại!', 'SAME_PASSWORD');
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  await authRepository.updatePassword(userId, newPasswordHash);

  return true;
};

/**
 * [ACC-07] Quên mật khẩu - Sinh mã Token khôi phục mật khẩu
 */
const forgotPassword = async ({ email }) => {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const user = await authRepository.findByEmail(normalizedEmail);

  if (!user) {
    return {
      message: 'Nếu email của bạn tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.',
    };
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = dayjs().add(15, 'minute').toDate();
  const userId = user.id ?? user.UserID;

  await authRepository.createPasswordResetToken({
    userId,
    tokenHash,
    expiresAt,
  });

  const clientBaseUrl = env.CLIENT_URL || 'http://localhost:3000';
  const resetUrl = `${clientBaseUrl}/reset-password?token=${rawToken}`;

  console.log(`\n================== [KHÔI PHỤC MẬT KHẨU ANIMORA] ==================`);
  console.log(`- Tài khoản: ${user.email} (ID: ${userId})`);
  console.log(`- Mã Reset Token: ${rawToken}`);
  console.log(`- Link khôi phục: ${resetUrl}`);
  console.log(`- Hết hạn vào lúc: ${expiresAt.toISOString()}`);
  console.log(`===================================================================\n`);

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #ff6b6b; text-align: center;">Animora - Khôi phục mật khẩu</h2>
      <p>Xin chào <strong>${user.fullName || user.full_name || 'quý khách'}</strong>,</p>
      <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${user.email}</strong> trên nền tảng chăm sóc thú cưng Animora.</p>
      <p>Vui lòng nhấn vào nút bên dưới để tiến hành tạo mật khẩu mới (Liên kết này có hiệu lực trong vòng <strong>15 phút</strong>):</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #ff6b6b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Đặt lại mật khẩu mới</a>
      </div>
      <p style="color: #666; font-size: 13px;">Nếu bạn không yêu cầu hành động này, vui lòng bỏ qua email này. Mật khẩu của bạn vẫn được giữ an toàn tuyệt đối.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 11px; text-align: center;">Đội ngũ phát triển Animora Pet Care (Nhóm 14)</p>
    </div>
  `;

  try {
    await mailerProvider.sendEmail({
      to: user.email,
      subject: '[Animora] Hướng dẫn đặt lại mật khẩu tài khoản',
      html: emailHtml,
    });
  } catch (mailError) {
    console.warn('[MAIL_WARNING] Không gửi được mail qua SMTP, fallback sang log terminal:', mailError.message);
  }

  return {
    message: 'Yêu cầu đặt lại mật khẩu đã được xử lý. Vui lòng kiểm tra email của bạn.',
    resetToken: rawToken,
    resetUrl,
    expiresAt,
  };
};

/**
 * [ACC-07] Đặt lại mật khẩu mới với Token hợp lệ
 */
const resetPassword = async (payload) => {
  const token = (payload.token || '').trim();
  const newPassword = payload.newPassword || payload.new_password;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const tokenRecord = await authRepository.findValidResetToken(tokenHash);
  if (!tokenRecord) {
    throw new ApiError(
      400,
      'Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn (tối đa 15 phút). Vui lòng thử lại!',
      'INVALID_RESET_TOKEN'
    );
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  await authRepository.updatePassword(tokenRecord.user_id ?? tokenRecord.UserID, newPasswordHash);
  await authRepository.markTokenUsed(tokenRecord.id ?? tokenRecord.PasswordResetTokenID);

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

  return formatUserResponse(user);
};

/**
 * [ACC-09] Làm mới Access Token từ Refresh Token
 */
const refreshToken = async (clientRefreshToken) => {
  if (!clientRefreshToken) {
    throw new ApiError(401, 'Không tìm thấy Refresh Token, vui lòng đăng nhập lại!', 'REFRESH_TOKEN_NOT_FOUND');
  }

  try {
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      clientRefreshToken,
      env.JWT_REFRESH_SECRET
    );

    const userInfo = {
      id: refreshTokenDecoded.id,
      email: refreshTokenDecoded.email,
      role: refreshTokenDecoded.role,
      dbRole: refreshTokenDecoded.dbRole,
    };

    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.JWT_ACCESS_SECRET,
      env.JWT_ACCESS_EXPIRES_IN || '15m'
    );

    return { accessToken };
  } catch (error) {
    throw new ApiError(401, 'Refresh Token không hợp lệ hoặc đã hết hạn, vui lòng đăng nhập lại!', 'INVALID_REFRESH_TOKEN');
  }
};

/**
 * [ACC-02-GOOGLE] Đăng nhập / Đăng ký nhanh bằng Google OAuth 2.0
 */
const googleLogin = async ({ idToken }) => {
  const googleUser = await GoogleProvider.verifyGoogleToken(idToken);
  const { email, fullName, avatar } = googleUser;

  let user = await authRepository.findByEmail(email);

  if (!user) {
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const passwordHash = await bcrypt.hash(randomPassword, 10);

    user = await authRepository.createUser({
      email,
      password_hash: passwordHash,
      fullName,
      full_name: fullName,
      avatar: avatar || null,
      phone: null,
      role: ROLES.CUSTOMER,
      status: USER_STATUS.ACTIVE,
      isEmailVerified: true,
    });
  } else {
    assertAccountActive(user);
  }

  const tokens = await generateTokens(user);

  return {
    user: formatUserResponse(user),
    tokens,
  };
};

export {
  register,
  login,
  googleLogin,
  logout,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  getCurrentUser,
};
export default {
  register,
  login,
  googleLogin,
  logout,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  getCurrentUser,
};
