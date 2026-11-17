import bcrypt from 'bcryptjs';
import userRepository from '../repositories/user.repository.js';
import ApiError from '../utils/ApiError.js';
import { ROLES, USER_STATUS, toAppRoleName, toAppAccountStatus } from '../utils/constants.js';

/**
 * Chuẩn hóa profile trả về cho client
 */
const formatProfileResponse = (user) => {
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

/**
 * Chuẩn hóa address trả về cho client
 */
const formatAddressResponse = (address) => {
  if (!address) return null;
  return {
    ...address,
    receiverName: address.receiverName ?? address.receiver_name ?? '',
    receiver_name: address.receiver_name ?? address.receiverName ?? '',
    streetAddress: address.streetAddress ?? address.street_address ?? '',
    street_address: address.street_address ?? address.streetAddress ?? '',
    isDefault: address.isDefault !== undefined ? address.isDefault : Boolean(address.is_default),
    is_default: address.is_default !== undefined ? address.is_default : Boolean(address.isDefault),
  };
};

/**
 * [ACC-04] Lấy thông tin cá nhân (Profile)
 */
const getProfile = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, 'Không tìm thấy thông tin người dùng', 'USER_NOT_FOUND');
  }

  return formatProfileResponse(user);
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
  const fullName = payload.fullName !== undefined ? payload.fullName : payload.full_name;
  if (fullName !== undefined) allowedUpdates.full_name = fullName;
  if (payload.phone !== undefined) allowedUpdates.phone = payload.phone;
  if (payload.avatar !== undefined) allowedUpdates.avatar = payload.avatar;

  const updatedUser = await userRepository.updateProfile(userId, allowedUpdates);
  return formatProfileResponse(updatedUser);
};

/**
 * [ACC-05] Lấy danh sách địa chỉ giao hàng của người dùng
 */
const getUserAddresses = async (userId) => {
  const addresses = await userRepository.findAddressesByUserId(userId);
  return addresses.map(formatAddressResponse);
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

  return formatAddressResponse(address);
};

/**
 * [ACC-05] Thêm mới địa chỉ giao hàng
 */
const addAddress = async (userId, payload) => {
  const addressCount = await userRepository.countAddressesByUserId(userId);
  const isFirstAddress = addressCount === 0;

  const receiverName = payload.receiverName !== undefined ? payload.receiverName : payload.receiver_name;
  const streetAddress = payload.streetAddress !== undefined ? payload.streetAddress : payload.street_address;
  const isDefaultInput = payload.isDefault !== undefined ? payload.isDefault : payload.is_default;
  const isDefault = isFirstAddress || Boolean(isDefaultInput);

  if (isDefault && addressCount > 0) {
    await userRepository.clearDefaultAddresses(userId);
  }

  const newAddressData = {
    user_id: userId,
    addressLabel: payload.addressLabel ?? payload.address_label ?? null,
    receiver_name: receiverName,
    phone: payload.phone,
    street_address: streetAddress,
    ward: payload.ward || null,
    district: payload.district || null,
    city: payload.city ?? payload.province,
    is_default: isDefault,
  };

  const created = await userRepository.createAddress(newAddressData);
  return formatAddressResponse(created);
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

  const isDefaultInput = payload.isDefault !== undefined ? payload.isDefault : payload.is_default;
  if (isDefaultInput === true) {
    await userRepository.clearDefaultAddresses(userId, addressId);
  }

  const updateData = {};
  const receiverName = payload.receiverName !== undefined ? payload.receiverName : payload.receiver_name;
  if (receiverName !== undefined) updateData.receiver_name = receiverName;
  if (payload.phone !== undefined) updateData.phone = payload.phone;
  const streetAddress = payload.streetAddress !== undefined ? payload.streetAddress : payload.street_address;
  if (streetAddress !== undefined) updateData.street_address = streetAddress;
  if (payload.ward !== undefined) updateData.ward = payload.ward;
  if (payload.district !== undefined) updateData.district = payload.district;
  if (payload.city !== undefined || payload.province !== undefined) {
    updateData.city = payload.city ?? payload.province;
  }
  if (payload.addressLabel !== undefined || payload.address_label !== undefined) {
    updateData.addressLabel = payload.addressLabel ?? payload.address_label;
  }
  if (isDefaultInput !== undefined) updateData.is_default = Boolean(isDefaultInput);

  const updated = await userRepository.updateAddress(addressId, updateData);
  return formatAddressResponse(updated);
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

  return formatProfileResponse(user);
};

/**
 * [ACC-08] Admin: Tạo mới tài khoản (nhân viên, chuyên viên, đối tác, admin)
 */
const adminCreateUser = async (payload) => {
  const existingUser = await userRepository.findByEmail(payload.email);
  if (existingUser) {
    throw new ApiError(409, 'Email này đã tồn tại trong hệ thống', 'EMAIL_ALREADY_EXISTS');
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const fullName = payload.fullName || payload.full_name;

  const createdUser = await userRepository.createUser({
    email: payload.email,
    password_hash: passwordHash,
    fullName,
    full_name: fullName,
    phone: payload.phone || null,
    role: payload.role || ROLES.STAFF,
    status: payload.status || USER_STATUS.ACTIVE,
    employmentType: payload.employmentType,
  });

  return formatProfileResponse(createdUser);
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
  return formatProfileResponse(updatedUser);
};

/**
 * [ACC-08] Admin: Cập nhật trạng thái người dùng (Khóa/Mở khóa)
 */
const adminUpdateStatus = async (userId, status, currentAdminId = null) => {
  if (currentAdminId && Number(userId) === Number(currentAdminId) && status !== USER_STATUS.ACTIVE) {
    throw new ApiError(400, 'Bạn không thể tự khóa tài khoản của chính mình', 'CANNOT_LOCK_SELF');
  }
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, 'Không tìm thấy người dùng', 'USER_NOT_FOUND');
  }

  const updatedUser = await userRepository.updateUser(userId, { status });
  return formatProfileResponse(updatedUser);
};

/**
 * [ACC-08] Admin: Xóa mềm người dùng
 */
const adminDeleteUser = async (userId, currentAdminId = null) => {
  if (currentAdminId && Number(userId) === Number(currentAdminId)) {
    throw new ApiError(400, 'Bạn không thể tự xóa tài khoản của chính mình', 'CANNOT_DELETE_SELF');
  }
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, 'Không tìm thấy người dùng', 'USER_NOT_FOUND');
  }

  await userRepository.softDeleteUser(userId);
  return { deleted: true, userId };
};

export {
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
export default {
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
