import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import authService from '../../src/services/auth.service.js';
import authController from '../../src/controllers/auth.controller.js';
import authRepository from '../../src/repositories/auth.repository.js';
import { GoogleProvider } from '../../src/providers/google.provider.js';
import { ROLES, USER_STATUS } from '../../src/utils/constants.js';

describe('[ACC-02-GOOGLE] Unit Tests - Đăng nhập bằng Google OAuth 2.0', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('authService.googleLogin()', () => {
    test('TC-1: Đăng nhập Google lần đầu (tự động tạo mới tài khoản và sinh tokens)', async () => {
      const mockGooglePayload = {
        email: 'toan.google@animora.vn',
        fullName: 'Ngô Phước Toàn Google',
        avatar: 'https://lh3.googleusercontent.com/photo.jpg',
        googleId: '1234567890',
      };

      jest.spyOn(GoogleProvider, 'verifyGoogleToken').mockResolvedValue(mockGooglePayload);
      jest.spyOn(authRepository, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(authRepository, 'createUser').mockImplementation(async (userData) => ({
        id: 99,
        ...userData,
        created_at: new Date(),
      }));

      const result = await authService.googleLogin({ idToken: 'valid_google_token' });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.id).toBe(99);
      expect(result.user.email).toBe('toan.google@animora.vn');
      expect(result.user.fullName).toBe('Ngô Phước Toàn Google');
      expect(result.user).not.toHaveProperty('password_hash');
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
    });

    test('TC-2: Đăng nhập Google với tài khoản đã tồn tại sẵn trong CSDL', async () => {
      const mockGooglePayload = {
        email: 'existing.google@animora.vn',
        fullName: 'User Exists',
        avatar: null,
        googleId: '987654321',
      };

      const existingDbUser = {
        id: 50,
        email: 'existing.google@animora.vn',
        full_name: 'User Exists',
        role: ROLES.CUSTOMER,
        status: USER_STATUS.ACTIVE,
        password_hash: 'some_hash',
      };

      jest.spyOn(GoogleProvider, 'verifyGoogleToken').mockResolvedValue(mockGooglePayload);
      jest.spyOn(authRepository, 'findByEmail').mockResolvedValue(existingDbUser);

      const result = await authService.googleLogin({ idToken: 'valid_google_token' });

      expect(result.user.id).toBe(50);
      expect(result.user.email).toBe('existing.google@animora.vn');
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
    });

    test('TC-3: Ném lỗi 403 ACCOUNT_BANNED nếu tài khoản Google bị khóa vi phạm chính sách', async () => {
      const mockGooglePayload = {
        email: 'banned@animora.vn',
        fullName: 'Banned User',
      };

      const bannedDbUser = {
        id: 77,
        email: 'banned@animora.vn',
        status: USER_STATUS.BANNED,
      };

      jest.spyOn(GoogleProvider, 'verifyGoogleToken').mockResolvedValue(mockGooglePayload);
      jest.spyOn(authRepository, 'findByEmail').mockResolvedValue(bannedDbUser);

      await expect(authService.googleLogin({ idToken: 'valid_google_token' })).rejects.toMatchObject({
        statusCode: 403,
        errorCode: 'ACCOUNT_BANNED',
      });
    });
  });

  describe('authController.googleLogin()', () => {
    test('TC-4: Controller googleLogin() gán accessToken & refreshToken vào HttpOnly Cookie', async () => {
      const mockResult = {
        user: { id: 99, email: 'toan@gmail.com', fullName: 'Ngô Phước Toàn' },
        tokens: { accessToken: 'google_jwt_access_token', refreshToken: 'google_jwt_refresh_token' },
      };

      jest.spyOn(authService, 'googleLogin').mockResolvedValue(mockResult);

      const req = {
        body: { idToken: 'some_google_jwt_credential' },
      };

      const res = {
        cookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await authController.googleLogin(req, res);

      expect(res.cookie).toHaveBeenCalledWith(
        'accessToken',
        'google_jwt_access_token',
        expect.objectContaining({ httpOnly: true })
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'google_jwt_refresh_token',
        expect.objectContaining({ httpOnly: true })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      const jsonResponse = res.json.mock.calls[0][0];
      expect(jsonResponse.data).not.toHaveProperty('accessToken');
      expect(jsonResponse.data).not.toHaveProperty('refreshToken');
      expect(jsonResponse.data.fullName).toBe('Ngô Phước Toàn');
    });
  });
});
