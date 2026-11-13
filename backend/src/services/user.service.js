const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/user.repository');
const ApiError = require('../utils/ApiError');
const { ROLES, USER_STATUS } = require('../utils/constants');

/**
 * [ACC-04] Lấy thông tin cá nhân (Profile)
 */
const getProfile = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, 'Không tìm thấy thông tin người dùng', 'USER_NOT_FOUND');
  }

  const { password_hash, ...profile } = user;
  return profile;
};

/**
 * [ACC-04] Cập nhật thông tin cá nhân (Profile)
 */
const updateProfile = async (userId, payload) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, 'Không tìm thấy thông tin người dùng', 'USER_NOT_FOUND');
  }

  const allowedUpdates = {};
  if (payload.full_name !== undefined) allowedUpdates.full_name = payload.full_name;
  if (payload.phone !== undefined) allowedUpdates.phone = payload.phone;
  if (payload.avatar !== undefined) allowedUpdates.avatar = payload.avatar;

  const updatedUser = await userRepository.updateProfile(userId, allowedUpdates);
  const { password_hash, ...profile } = updatedUser;
  return profile;
};

/**
 * [ACC-05] Lấy danh sách địa chỉ giao hàng của người dùng
 */
const getUserAddresses = async (userId) => {
  return await userRepository.findAddressesByUserId(userId);
};

/**
 * [ACC-05] Lấy chi tiết một địa chỉ
 */
const getAddressDetail = async (userId, addressId) => {
  const address = await userRepository.findAddressById(addressId);
  if (!address) {
    throw new ApiError(404, 'Không tìm thấy địa chỉ giao hàng', 'ADDRESS_NOT_FOUND');
  }

  if (Number(address.user_id) !== Number(userId)) {
    throw new ApiError(403, 'Bạn không có quyền truy cập địa chỉ này', 'FORBIDDEN');
  }

  return address;
};

/**
 * [ACC-05] Thêm mới địa chỉ giao hàng
 */
const addAddress = async (userId, payload) => {
  const addressCount = await userRepository.countAddressesByUserId(userId);
  const isFirstAddress = addressCount === 0;

  const isDefault = isFirstAddress || Boolean(payload.is_default);

  if (isDefault && addressCount > 0) {
    await userRepository.clearDefaultAddresses(userId);
  }

  const newAddressData = {
    ...payload,
    user_id: userId,
    is_default: isDefault,
  };

  return await userRepository.createAddress(newAddressData);
};

/**
 * [ACC-05] Cập nhật địa chỉ giao hàng
 */
const editAddress = async (userId, addressId, payload) => {
  const address = await userRepository.findAddressById(addressId);
  if (!address) {
    throw new ApiError(404, 'Không tìm thấy địa chỉ giao hàng', 'ADDRESS_NOT_FOUND');
  }

  if (Number(address.user_id) !== Number(userId)) {
    throw new ApiError(403, 'Bạn không có quyền chỉnh sửa địa chỉ này', 'FORBIDDEN');
  }

  if (payload.is_default === true) {
    await userRepository.clearDefaultAddresses(userId, addressId);
  }

  return await userRepository.updateAddress(addressId, payload);
};

/**
 * [ACC-05] Xóa địa chỉ giao hàng
 */
const removeAddress = async (userId, addressId) => {
  const address = await userRepository.findAddressById(addressId);
  if (!address) {
    throw new ApiError(404, 'Không tìm thấy địa chỉ giao hàng', 'ADDRESS_NOT_FOUND');
  }

  if (Number(address.user_id) !== Number(userId)) {
    throw new ApiError(403, 'Bạn không có quyền xóa địa chỉ này', 'FORBIDDEN');
  }

  await userRepository.deleteAddress(addressId);
  return { deleted: true, addressId };
};

/**
 * [ACC-08] Admin: Lấy danh sách người dùng phân trang & tìm kiếm
 */
const adminGetUsers = async (queryParams) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 10;
  const search = queryParams.search || '';
  const role = queryParams.role || null;
  const status = queryParams.status || null;

  const { items, totalItems } = await userRepository.findUsersPaginated({
    page,
    limit,
    search,
    role,
    status,
  });

  return { items, page, limit, totalItems };
};

/**
 * [ACC-08] Admin: Xem chi tiết một người dùng
 */
const adminGetUserById = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, 'Không tìm thấy người dùng', 'USER_NOT_FOUND');
  }

  const { password_hash, ...userInfo } = user;
  return userInfo;
};

/**
 * [ACC-08] Admin: Tạo mới tài khoản (nhân viên, chuyên viên, admin)
 */
const adminCreateUser = async (payload) => {
  const existingUser = await userRepository.findByEmail(payload.email);
  if (existingUser) {
    throw new ApiError(409, 'Email này đã tồn tại trong hệ thống', 'EMAIL_ALREADY_EXISTS');
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(payload.password, saltRounds);

  const newUserData = {
    email: payload.email,
    password_hash: passwordHash,
    full_name: payload.full_name,
    phone: payload.phone || null,
    role: payload.role || ROLES.STAFF,
    status: payload.status || USER_STATUS.ACTIVE,
  };

  const createdUser = await userRepository.createUser(newUserData);
  const { password_hash, ...userInfo } = createdUser;
  return userInfo;
};

/**
 * [ACC-08] Admin: Cập nhật thông tin & vai trò người dùng
 */
const adminUpdateUser = async (userId, payload) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, 'Không tìm thấy người dùng', 'USER_NOT_FOUND');
  }

  const updatedUser = await userRepository.updateUser(userId, payload);
  const { password_hash, ...userInfo } = updatedUser;
  return userInfo;
};

/**
 * [ACC-08] Admin: Cập nhật trạng thái người dùng (Khóa/Mở khóa)
 */
const adminUpdateStatus = async (userId, status) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, 'Không tìm thấy người dùng', 'USER_NOT_FOUND');
  }

  const updatedUser = await userRepository.updateUser(userId, { status });
  const { password_hash, ...userInfo } = updatedUser;
  return userInfo;
};

/**
 * [ACC-08] Admin: Xóa mềm người dùng
 */
const adminDeleteUser = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, 'Không tìm thấy người dùng', 'USER_NOT_FOUND');
  }

  await userRepository.softDeleteUser(userId);
  return { deleted: true, userId };
};

module.exports = {
  getProfile,
  updateProfile,
  getUserAddresses,
  getAddressDetail,
  addAddress,
  editAddress,
  removeAddress,
  adminGetUsers,
  adminGetUserById,
  adminCreateUser,
  adminUpdateUser,
  adminUpdateStatus,
  adminDeleteUser,
};
