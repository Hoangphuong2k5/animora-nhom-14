const userService = require('../services/user.service');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');

/**
 * [ACC-04] Lấy thông tin cá nhân
 */
const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const result = await userService.getProfile(userId);
  return successResponse(res, result, 'Lấy thông tin cá nhân thành công');
});

/**
 * [ACC-04] Cập nhật thông tin cá nhân
 */
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const result = await userService.updateProfile(userId, req.body);
  return successResponse(res, result, 'Cập nhật thông tin cá nhân thành công');
});

/**
 * [ACC-05] Lấy danh sách địa chỉ giao hàng
 */
const getAddresses = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const result = await userService.getUserAddresses(userId);
  return successResponse(res, result, 'Lấy danh sách địa chỉ thành công');
});

/**
 * [ACC-05] Lấy chi tiết địa chỉ giao hàng
 */
const getAddressById = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const addressId = req.params.id;
  const result = await userService.getAddressDetail(userId, addressId);
  return successResponse(res, result, 'Lấy chi tiết địa chỉ thành công');
});

/**
 * [ACC-05] Thêm mới địa chỉ giao hàng
 */
const createAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const result = await userService.addAddress(userId, req.body);
  return successResponse(res, result, 'Thêm địa chỉ giao hàng thành công', 201);
});

/**
 * [ACC-05] Cập nhật địa chỉ giao hàng
 */
const updateAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const addressId = req.params.id;
  const result = await userService.editAddress(userId, addressId, req.body);
  return successResponse(res, result, 'Cập nhật địa chỉ giao hàng thành công');
});

/**
 * [ACC-05] Xóa địa chỉ giao hàng
 */
const deleteAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const addressId = req.params.id;
  const result = await userService.removeAddress(userId, addressId);
  return successResponse(res, result, 'Xóa địa chỉ giao hàng thành công');
});

/**
 * [ACC-08] Admin: Lấy danh sách người dùng phân trang
 */
const adminGetUsers = asyncHandler(async (req, res) => {
  const { items, page, limit, totalItems } = await userService.adminGetUsers(req.query);
  return paginatedResponse(res, items, page, limit, totalItems, 'Lấy danh sách người dùng thành công');
});

/**
 * [ACC-08] Admin: Xem chi tiết một người dùng
 */
const adminGetUserById = asyncHandler(async (req, res) => {
  const result = await userService.adminGetUserById(req.params.id);
  return successResponse(res, result, 'Lấy thông tin người dùng thành công');
});

/**
 * [ACC-08] Admin: Tạo mới tài khoản nhân sự
 */
const adminCreateUser = asyncHandler(async (req, res) => {
  const result = await userService.adminCreateUser(req.body);
  return successResponse(res, result, 'Tạo tài khoản người dùng thành công', 201);
});

/**
 * [ACC-08] Admin: Cập nhật thông tin & vai trò người dùng
 */
const adminUpdateUser = asyncHandler(async (req, res) => {
  const result = await userService.adminUpdateUser(req.params.id, req.body);
  return successResponse(res, result, 'Cập nhật người dùng thành công');
});

/**
 * [ACC-08] Admin: Cập nhật trạng thái người dùng (Khóa/Mở khóa)
 */
const adminUpdateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const result = await userService.adminUpdateStatus(req.params.id, status);
  return successResponse(res, result, 'Cập nhật trạng thái người dùng thành công');
});

/**
 * [ACC-08] Admin: Xóa mềm người dùng
 */
const adminDeleteUser = asyncHandler(async (req, res) => {
  const result = await userService.adminDeleteUser(req.params.id);
  return successResponse(res, result, 'Xóa người dùng thành công');
});

module.exports = {
  getProfile,
  updateProfile,
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  adminGetUsers,
  adminGetUserById,
  adminCreateUser,
  adminUpdateUser,
  adminUpdateStatus,
  adminDeleteUser,
};
