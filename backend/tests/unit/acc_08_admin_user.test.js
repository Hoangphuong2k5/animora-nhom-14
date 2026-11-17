import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import bcrypt from 'bcryptjs';
import userRepository from '../../src/repositories/user.repository.js';
import * as userService from '../../src/services/user.service.js';
import ApiError from '../../src/utils/ApiError.js';
import { ROLES, USER_STATUS } from '../../src/utils/constants.js';

describe('[ACC-08] Unit Tests - Quản lý vai trò và tài khoản nhân sự (Admin User Management)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('adminGetUsers()', () => {
    test('TC-1: Lấy danh sách người dùng phân trang thành công với query mặc định', async () => {
      const mockResult = {
        items: [
          { id: 1, email: 'admin@animora.vn', role: ROLES.ADMIN, status: USER_STATUS.ACTIVE },
          { id: 2, email: 'staff@animora.vn', role: ROLES.STAFF, status: USER_STATUS.ACTIVE },
        ],
        totalItems: 2,
      };

      const spyFind = jest.spyOn(userRepository, 'findUsersPaginated').mockResolvedValue(mockResult);

      const result = await userService.adminGetUsers({});

      expect(spyFind).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: '',
        role: null,
        status: null,
      });
      expect(result.items).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalItems).toBe(2);
    });

    test('TC-2: Phải truyền đúng các bộ lọc search, role, status và số trang tùy chỉnh', async () => {
      const mockResult = { items: [], totalItems: 0 };
      const spyFind = jest.spyOn(userRepository, 'findUsersPaginated').mockResolvedValue(mockResult);

      await userService.adminGetUsers({
        page: '2',
        limit: '20',
        search: 'nguyen',
        role: ROLES.EXPERT,
        status: USER_STATUS.ACTIVE,
      });

      expect(spyFind).toHaveBeenCalledWith({
        page: 2,
        limit: 20,
        search: 'nguyen',
        role: ROLES.EXPERT,
        status: USER_STATUS.ACTIVE,
      });
    });
  });

  describe('adminGetUserById()', () => {
    test('TC-3: Ném lỗi 404 USER_NOT_FOUND nếu không tìm thấy người dùng', async () => {
      jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

      await expect(userService.adminGetUserById(999)).rejects.toMatchObject({
        statusCode: 404,
        errorCode: 'USER_NOT_FOUND',
      });
    });

    test('TC-4: Lấy thông tin chi tiết thành công và bảo mật tuyệt đối không trả về password_hash', async () => {
      const mockUser = {
        id: 10,
        email: 'staff1@animora.vn',
        password_hash: '$2a$10$SecretHashedPassword',
        full_name: 'Nguyễn Văn Nhân Viên',
        role: ROLES.STAFF,
        status: USER_STATUS.ACTIVE,
      };

      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);

      const result = await userService.adminGetUserById(10);

      expect(result.id).toBe(10);
      expect(result.email).toBe('staff1@animora.vn');
      expect(result.full_name).toBe('Nguyễn Văn Nhân Viên');
      expect(result.password_hash).toBeUndefined(); // Chắc chắn không lộ password_hash
    });
  });

  describe('adminCreateUser()', () => {
    test('TC-5: Ném lỗi 409 EMAIL_ALREADY_EXISTS nếu email đã tồn tại', async () => {
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue({ id: 1, email: 'duplicate@animora.vn' });

      await expect(
        userService.adminCreateUser({
          email: 'duplicate@animora.vn',
          password: 'Password123!',
          full_name: 'Trùng Email',
        })
      ).rejects.toMatchObject({
        statusCode: 409,
        errorCode: 'EMAIL_ALREADY_EXISTS',
      });
    });

    test('TC-6: Tạo mới tài khoản thành công (mã hóa bcrypt, gán role/status, không trả về password_hash)', async () => {
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
      const spyBcrypt = jest.spyOn(bcrypt, 'hash').mockResolvedValue('$2a$10$hashed_pwd');
      const spyCreate = jest.spyOn(userRepository, 'createUser').mockImplementation(async (data) => ({
        id: 50,
        ...data,
      }));

      const payload = {
        email: 'warehouse_lead@animora.vn',
        password: 'SecurePassword123!',
        full_name: 'Trần Thủ Kho',
        phone: '0901234567',
        role: ROLES.WAREHOUSE,
        status: USER_STATUS.ACTIVE,
      };

      const result = await userService.adminCreateUser(payload);

      expect(spyBcrypt).toHaveBeenCalledWith('SecurePassword123!', 10);
      expect(spyCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'warehouse_lead@animora.vn',
          password_hash: '$2a$10$hashed_pwd',
          full_name: 'Trần Thủ Kho',
          role: ROLES.WAREHOUSE,
          status: USER_STATUS.ACTIVE,
        })
      );
      expect(result.id).toBe(50);
      expect(result.password_hash).toBeUndefined();
    });
  });

  describe('adminUpdateUser()', () => {
    test('TC-7: Ném lỗi 404 USER_NOT_FOUND khi cập nhật người dùng không tồn tại', async () => {
      jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

      await expect(userService.adminUpdateUser(999, { full_name: 'Mới' })).rejects.toMatchObject({
        statusCode: 404,
        errorCode: 'USER_NOT_FOUND',
      });
    });

    test('TC-8: Cập nhật thông tin và vai trò người dùng thành công (không trả về password_hash)', async () => {
      jest.spyOn(userRepository, 'findById').mockResolvedValue({ id: 5, email: 'staff@animora.vn' });
      jest.spyOn(userRepository, 'updateUser').mockResolvedValue({
        id: 5,
        email: 'staff@animora.vn',
        full_name: 'Tên Đã Cập Nhật',
        role: ROLES.EXPERT,
        password_hash: '$2a$10$hash',
      });

      const result = await userService.adminUpdateUser(5, {
        full_name: 'Tên Đã Cập Nhật',
        role: ROLES.EXPERT,
      });

      expect(result.full_name).toBe('Tên Đã Cập Nhật');
      expect(result.role).toBe(ROLES.EXPERT);
      expect(result.password_hash).toBeUndefined();
    });
  });

  describe('adminUpdateStatus()', () => {
    test('TC-9: Ném lỗi 404 USER_NOT_FOUND khi cập nhật trạng thái người dùng không tồn tại', async () => {
      jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

      await expect(
        userService.adminUpdateStatus(999, USER_STATUS.BANNED, 1)
      ).rejects.toMatchObject({
        statusCode: 404,
        errorCode: 'USER_NOT_FOUND',
      });
    });

    test('TC-10: Ném lỗi 400 CANNOT_LOCK_SELF khi admin tự khóa tài khoản của chính mình', async () => {
      await expect(
        userService.adminUpdateStatus(1, USER_STATUS.BANNED, 1)
      ).rejects.toMatchObject({
        statusCode: 400,
        errorCode: 'CANNOT_LOCK_SELF',
      });
    });

    test('TC-11: Cập nhật trạng thái người dùng thành công (Active -> Banned)', async () => {
      jest.spyOn(userRepository, 'findById').mockResolvedValue({ id: 8, status: USER_STATUS.ACTIVE });
      jest.spyOn(userRepository, 'updateUser').mockResolvedValue({
        id: 8,
        status: USER_STATUS.BANNED,
        password_hash: '$2a$10$hash',
      });

      const result = await userService.adminUpdateStatus(8, USER_STATUS.BANNED, 1);

      expect(result.id).toBe(8);
      expect(result.status).toBe(USER_STATUS.BANNED);
      expect(result.password_hash).toBeUndefined();
    });
  });

  describe('adminDeleteUser()', () => {
    test('TC-12: Ném lỗi 404 USER_NOT_FOUND khi xóa người dùng không tồn tại', async () => {
      jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

      await expect(userService.adminDeleteUser(999, 1)).rejects.toMatchObject({
        statusCode: 404,
        errorCode: 'USER_NOT_FOUND',
      });
    });

    test('TC-13: Ném lỗi 400 CANNOT_DELETE_SELF khi admin tự xóa tài khoản của chính mình', async () => {
      await expect(userService.adminDeleteUser(1, 1)).rejects.toMatchObject({
        statusCode: 400,
        errorCode: 'CANNOT_DELETE_SELF',
      });
    });

    test('TC-14: Xóa mềm người dùng thành công (soft delete)', async () => {
      jest.spyOn(userRepository, 'findById').mockResolvedValue({ id: 25, status: USER_STATUS.ACTIVE });
      const spySoftDelete = jest.spyOn(userRepository, 'softDeleteUser').mockResolvedValue(true);

      const result = await userService.adminDeleteUser(25, 1);

      expect(spySoftDelete).toHaveBeenCalledWith(25);
      expect(result).toEqual({ deleted: true, userId: 25 });
    });
  });
});
