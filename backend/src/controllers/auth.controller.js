// Author: TrungQuanDev & Animora Team (Group 14)
import ms from 'ms';
import { env } from '../config/environment.js';
import authService from '../services/auth.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import ApiError from '../utils/ApiError.js';

/**
 * Cấu hình Cookie chung cho dự án - 100% thuần HttpOnly Cookie
 * Về cái maxAge và thư viện ms: https://expressjs.com/en/api.html
 * Đối với maxAge - thời gian sống của Cookie thì chúng ta sẽ để tối đa 14 ngày, tùy dự án.
 * Lưu ý: Thời gian sống của Cookie khác với thời gian sống của token nhé. Đừng bị nhầm.
 */
const getCookieOptions = () => ({
  httpOnly: true, // Bảo mật cao nhất: Chặn JavaScript truy cập vào cookie -> Chống tấn công XSS đánh cắp token
  secure: env.NODE_ENV === 'production', // Khi lên production bắt buộc chạy qua giao thức HTTPS
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax', // Cho phép gửi cookie trong các request cross-origin nếu khác domain
  maxAge: ms('14 days'), // Thư viện ms giúp đổi chuỗi '14 days' thành milliseconds chuẩn xác
});

/**
 * [ACC-01] Đăng ký tài khoản khách hàng mới (Áp dụng cơ chế Auto-Login & HttpOnly Cookie)
 * - Chỗ này làm gì: Nhận yêu cầu đăng ký từ client, gọi Service tạo user & sinh token,
 *   sau đó set 2 HttpOnly Cookie (accessToken & refreshToken) và trả về thông tin user.
 * - Chỗ nào lấy cái gì:
 *   + Lấy req.body đã được Joi validate hợp lệ ở auth.route.js.
 *   + Nhận { user, tokens } trả về từ authService.register().
 * - Xử lí tiếp theo ra sao:
 *   + Lấy cấu hình getCookieOptions() (HttpOnly: true, maxAge: 14 ngày).
 *   + Dùng res.cookie() để gán accessToken và refreshToken vào cookie trình duyệt.
 *   + Dùng successResponse() trả về mã 201 Created và thông tin user (KHÔNG trả token ở body).
 */
const register = asyncHandler(async (req, res) => {
  // 1. Gọi sang tầng Service để xử lý tạo tài khoản mới và sinh cặp JWT token
  const result = await authService.register(req.body);
  const { tokens, user } = result;

  // 2. Cơ chế Auto-Login: Gán cả 2 loại token vào HttpOnly Cookie của trình duyệt
  const cookieOptions = getCookieOptions();
  res.cookie('accessToken', tokens.accessToken, cookieOptions);
  res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

  // 3. Chuẩn bảo mật cao nhất: Body CHỈ trả về thông tin user (để hiển thị UI, chào mừng)
  // Tuyệt đối KHÔNG trả token ở body để tránh việc JS client lưu vào LocalStorage (chống XSS)
  return successResponse(
    res,
    user,
    'Đăng ký và đăng nhập tài khoản thành công',
    201
  );
});

/**
 * [ACC-02] Đăng nhập & cấp JWT Tokens (Lưu 100% vào HttpOnly Cookie)
 */
const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  const { tokens, user } = result;

  /**
   * Xử lý trường hợp trả httpOnly cookie cho phía trình duyệt
   * Cả 2 loại token accessToken và refreshToken đều được đính kèm vào cookie
   */
  const cookieOptions = getCookieOptions();
  res.cookie('accessToken', tokens.accessToken, cookieOptions);
  res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

  // Chuẩn HttpOnly Cookie: Body CHỈ trả về thông tin user (để hiển thị UI, phân quyền)
  // Tuyệt đối KHÔNG trả token về body để tránh việc JS client lưu vào LocalStorage
  return successResponse(
    res,
    user,
    'Đăng nhập thành công'
  );
});

/**
 * [ACC-02-GOOGLE] Đăng nhập / Đăng ký bằng Google OAuth 2.0 (100% Thuần HttpOnly Cookie)
 * 
 * 📌 CHỖ NÀY LÀM GÌ:
 *    Tiếp nhận Google ID Token từ phía Front-End (Next.js / ReactJS), ủy quyền cho Service
 *    xác thực với Google và tạo/lấy user trong DB, sau đó cấp 2 HttpOnly Cookie (accessToken & refreshToken).
 * 
 * 📌 CHỖ NÀO LẤY CÁI GÌ:
 *    - req.body: Nhận { idToken } (hoặc { credential } từ Next.js) đã qua validator.
 *    - Nhận { user, tokens } từ authService.googleLogin().
 * 
 * 📌 XỬ LÍ TIẾP THEO RA SAO:
 *    - res.cookie('accessToken', tokens.accessToken, cookieOptions);
 *    - res.cookie('refreshToken', tokens.refreshToken, cookieOptions);
 *    - successResponse(res, user, 'Đăng nhập bằng Google thành công');
 */
const googleLogin = asyncHandler(async (req, res) => {
  const result = await authService.googleLogin(req.body);
  const { tokens, user } = result;

  const cookieOptions = getCookieOptions();
  res.cookie('accessToken', tokens.accessToken, cookieOptions);
  res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

  return successResponse(
    res,
    user,
    'Đăng nhập bằng Google thành công'
  );
});

/**
 * [ACC-03] Đăng xuất tài khoản & Xóa Cookie
 */
const logout = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (userId) {
    await authService.logout(userId);
  }

  // Xóa Cookie - đơn giản là làm ngược lại so với việc gán cookie ở hàm login
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  return successResponse(res, null, 'Đăng xuất thành công');
});

/**
 * [ACC-09] Làm mới Access Token thông qua Refresh Token trong Cookie
 */
const refreshToken = asyncHandler(async (req, res) => {
  // Lấy refreshToken trực tiếp và duy nhất từ HttpOnly Cookie đã đính kèm vào request
  const refreshTokenFromCookie = req.cookies?.refreshToken;

  if (!refreshTokenFromCookie) {
    throw new ApiError(401, 'Không tìm thấy Refresh Token trong Cookie, vui lòng đăng nhập lại!', 'REFRESH_TOKEN_NOT_FOUND');
  }

  const result = await authService.refreshToken(refreshTokenFromCookie);

  // Gán đè accessToken mới vào HttpOnly Cookie cho trình duyệt
  res.cookie('accessToken', result.accessToken, getCookieOptions());

  // Trả về kết quả thành công, không để lộ accessToken ra ngoài JSON body
  return successResponse(
    res,
    null,
    'Làm mới Access Token thành công'
  );
});

/**
 * [ACC-06] Đổi mật khẩu tài khoản (Dành cho user ĐÃ ĐĂNG NHẬP ở Profile)
 * 
 * 📌 CHỖ NÀY LÀM GÌ:
 *    Nhận thông tin mật khẩu cũ và mới từ user đang đăng nhập, gọi authService.changePassword
 *    để kiểm tra và cập nhật mật khẩu, sau đó xóa sạch Cookie phiên hiện tại để yêu cầu đăng nhập lại an toàn.
 * 
 * 📌 CHỖ NÀO LẤY CÁI GÌ:
 *    - req.user.id: Lấy từ middleware xác thực verifyToken (giải mã từ HttpOnly Cookie accessToken).
 *    - req.body: Nhận { oldPassword, newPassword, confirmPassword } đã được Joi validate.
 * 
 * 📌 XỬ LÍ TIẾP THEO RA SAO:
 *    - Gọi authService.changePassword(userId, req.body).
 *    - res.clearCookie('accessToken') & res.clearCookie('refreshToken'): Xóa cookie phiên cũ.
 *    - Trả về successResponse() thông báo thành công (200 OK).
 */
const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  await authService.changePassword(userId, req.body);

  // Bảo mật phiên làm việc: Sau khi đổi mật khẩu thành công, xóa sạch cookie phiên cũ
  // để yêu cầu người dùng đăng nhập lại bằng mật khẩu mới
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  return successResponse(res, null, 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới.');
});

/**
 * [ACC-07] Quên mật khẩu (Dành cho user CHƯA ĐĂNG NHẬP ở màn hình Login)
 * 
 * 📌 CHỖ NÀY LÀM GÌ:
 *    Nhận email từ khách hàng, gọi authService.forgotPassword để sinh mã resetToken (hạn 15 phút)
 *    và gửi link đặt lại mật khẩu cho người dùng.
 * 
 * 📌 CHỖ NÀO LẤY CÁI GÌ:
 *    - req.body: Nhận { email } đã được Joi validate.
 * 
 * 📌 XỬ LÍ TIẾP THEO RA SAO:
 *    - Gọi authService.forgotPassword(req.body).
 *    - Trả về successResponse() thông báo đã gửi hướng dẫn đặt lại mật khẩu.
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body);
  return successResponse(res, result, result.message);
});

/**
 * [ACC-07] Đặt lại mật khẩu mới (Bước 2 của Quên mật khẩu)
 * 
 * 📌 CHỖ NÀY LÀM GÌ:
 *    Nhận token và mật khẩu mới từ link email khách hàng click vào, gọi authService.resetPassword
 *    để xác thực token và cập nhật mật khẩu mới.
 * 
 * 📌 CHỖ NÀO LẤY CÁI GÌ:
 *    - req.body: Nhận { token, newPassword, confirmPassword } đã được Joi validate.
 * 
 * 📌 XỬ LÍ TIẾP THEO RA SAO:
 *    - Gọi authService.resetPassword(req.body).
 *    - Trả về successResponse() thông báo đặt lại mật khẩu thành công (200 OK).
 */
const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  return successResponse(
    res,
    null,
    'Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.'
  );
});

/**
 * Lấy thông tin tài khoản hiện tại (kèm Verify Token từ Cookie)
 */
const getMe = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const result = await authService.getCurrentUser(userId);
  return successResponse(res, result, 'Lấy thông tin tài khoản thành công');
});

export {
  register,
  login,
  googleLogin,
  logout,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  getMe,
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
  getMe,
};
