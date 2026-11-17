import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import bcrypt from 'bcryptjs';
import authService from '../../src/services/auth.service.js';
import authController from '../../src/controllers/auth.controller.js';
import authRepository from '../../src/repositories/auth.repository.js';
import mailerProvider from '../../src/providers/mailer.provider.js';
import { ROLES, USER_STATUS } from '../../src/utils/constants.js';

describe('[ACC-01, ACC-06, ACC-07] Unit Tests - Chuẩn camelCase thống nhất', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('[ACC-01] authService.register() với camelCase & Auto-Login', () => {
    test('TC-1: Đăng ký thành công với fullName chuẩn camelCase và tự động sinh tokens', async () => {
      jest.spyOn(authRepository, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(authRepository, 'createUser').mockImplementation(async (userData) => ({
        id: 100,
        ...userData,
        created_at: new Date(),
      }));

      const result = await authService.register({
        email: 'toan.ngo@animora.vn',
        password: 'Password123@',
        fullName: 'Ngô Phước Toàn',
        phone: '0987654321',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.id).toBe(100);
      expect(result.user.email).toBe('toan.ngo@animora.vn');
      expect(result.user.fullName).toBe('Ngô Phước Toàn');
      expect(result.user).not.toHaveProperty('password_hash');
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
    });

    test('TC-1b: Controller register() tự động gán accessToken & refreshToken vào HttpOnly Cookie', async () => {
      const mockResult = {
        user: { id: 100, email: 'toan@animora.vn', fullName: 'Ngô Phước Toàn' },
        tokens: { accessToken: 'mock_access_token', refreshToken: 'mock_refresh_token' },
      };

      jest.spyOn(authService, 'register').mockResolvedValue(mockResult);

      const req = {
        body: {
          email: 'toan@animora.vn',
          password: 'Password123@',
          fullName: 'Ngô Phước Toàn',
        },
      };

      const res = {
        cookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await authController.register(req, res);

      expect(res.cookie).toHaveBeenCalledWith(
        'accessToken',
        'mock_access_token',
        expect.objectContaining({ httpOnly: true })
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'mock_refresh_token',
        expect.objectContaining({ httpOnly: true })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      const jsonResponse = res.json.mock.calls[0][0];
      expect(jsonResponse.data).not.toHaveProperty('accessToken');
      expect(jsonResponse.data).not.toHaveProperty('refreshToken');
      expect(jsonResponse.data.fullName).toBe('Ngô Phước Toàn');
    });

    test('TC-2: Ném lỗi 409 khi email đã tồn tại', async () => {
      jest.spyOn(authRepository, 'findByEmail').mockResolvedValue({ id: 1, email: 'duplicate@animora.vn' });

      await expect(
        authService.register({
          email: 'duplicate@animora.vn',
          password: 'Password123@',
          fullName: 'Trùng Email',
        })
      ).rejects.toMatchObject({
        statusCode: 409,
        errorCode: 'EMAIL_ALREADY_EXISTS',
      });
    });
  });

  describe('[ACC-06] authService.changePassword() với camelCase', () => {
    test('TC-3: Đổi mật khẩu thành công với oldPassword và newPassword', async () => {
      const currentPasswordHash = await bcrypt.hash('OldPassword123@', 10);
      jest.spyOn(authRepository, 'findById').mockResolvedValue({
        id: 1,
        password_hash: currentPasswordHash,
      });
      const updatePasswordSpy = jest.spyOn(authRepository, 'updatePassword').mockResolvedValue(true);

      const result = await authService.changePassword(1, {
        oldPassword: 'OldPassword123@',
        newPassword: 'NewPassword123@',
      });

      expect(result).toBe(true);
      expect(updatePasswordSpy).toHaveBeenCalled();
    });

    test('TC-4: Ném lỗi 400 INVALID_OLD_PASSWORD khi mật khẩu cũ không đúng', async () => {
      const currentPasswordHash = await bcrypt.hash('OldPassword123@', 10);
      jest.spyOn(authRepository, 'findById').mockResolvedValue({
        id: 1,
        password_hash: currentPasswordHash,
      });

      await expect(
        authService.changePassword(1, {
          oldPassword: 'WrongPassword123@',
          newPassword: 'NewPassword123@',
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        errorCode: 'INVALID_OLD_PASSWORD',
      });
    });

    test('TC-5: Ném lỗi 400 SAME_PASSWORD khi mật khẩu mới trùng mật khẩu cũ', async () => {
      const currentPasswordHash = await bcrypt.hash('SamePassword123@', 10);
      jest.spyOn(authRepository, 'findById').mockResolvedValue({
        id: 1,
        password_hash: currentPasswordHash,
      });

      await expect(
        authService.changePassword(1, {
          oldPassword: 'SamePassword123@',
          newPassword: 'SamePassword123@',
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        errorCode: 'SAME_PASSWORD',
      });
    });
  });

  describe('[ACC-07] authService.forgotPassword() & resetPassword() với camelCase', () => {
    test('TC-6: forgotPassword sinh token khôi phục thành công', async () => {
      jest.spyOn(authRepository, 'findByEmail').mockResolvedValue({
        id: 5,
        email: 'user@animora.vn',
      });
      const createTokenSpy = jest.spyOn(authRepository, 'createPasswordResetToken').mockResolvedValue({});
      const sendEmailSpy = jest.spyOn(mailerProvider, 'sendEmail').mockResolvedValue({ messageId: 'test_msg_id' });

      const result = await authService.forgotPassword({ email: 'user@animora.vn' });

      expect(result).toHaveProperty('resetToken');
      expect(createTokenSpy).toHaveBeenCalled();
      expect(sendEmailSpy).toHaveBeenCalled();
    });

    test('TC-7: resetPassword đổi mật khẩu thành công với newPassword', async () => {
      jest.spyOn(authRepository, 'findValidResetToken').mockResolvedValue({
        id: 88,
        user_id: 5,
      });
      const updatePasswordSpy = jest.spyOn(authRepository, 'updatePassword').mockResolvedValue(true);
      const markUsedSpy = jest.spyOn(authRepository, 'markTokenUsed').mockResolvedValue(true);

      const result = await authService.resetPassword({
        token: 'valid_reset_token_hash_string',
        newPassword: 'NewBrandPassword123@',
      });

      expect(result).toBe(true);
      expect(updatePasswordSpy).toHaveBeenCalled();
      expect(markUsedSpy).toHaveBeenCalledWith(88);
    });

    test('TC-8: resetPassword ném lỗi 400 khi token không hợp lệ hoặc hết hạn', async () => {
      jest.spyOn(authRepository, 'findValidResetToken').mockResolvedValue(null);

      await expect(
        authService.resetPassword({
          token: 'expired_or_invalid_token',
          newPassword: 'NewPassword123@',
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        errorCode: 'INVALID_RESET_TOKEN',
      });
    });
  });
});
