const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

/**
 * [ACC-01] Đăng ký tài khoản khách hàng mới
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return successResponse(res, result, 'Đăng ký tài khoản thành công', 201);
});

/**
 * [ACC-02] Đăng nhập & cấp JWT Bearer Token
 */
const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return successResponse(res, result, 'Đăng nhập thành công');
});

/**
 * [ACC-03] Đăng xuất tài khoản
 */
const logout = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const result = await authService.logout(userId);
  return successResponse(res, result, 'Đăng xuất thành công');
});

/**
 * [ACC-06] Đổi mật khẩu tài khoản
 */
const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  await authService.changePassword(userId, req.body);
  return successResponse(res, null, 'Đổi mật khẩu thành công');
});

/**
 * [ACC-07] Quên mật khẩu
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body);
  return successResponse(res, result, result.message);
});

/**
 * [ACC-07] Đặt lại mật khẩu mới
 */
const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  return successResponse(res, null, 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới');
});

/**
 * Lấy thông tin tài khoản hiện tại (kèm Verify Token)
 */
const getMe = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const result = await authService.getCurrentUser(userId);
  return successResponse(res, result, 'Lấy thông tin tài khoản thành công');
});

module.exports = {
  register,
  login,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  getMe,
};
