import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { StatusCodes } from 'http-status-codes';
import { JwtProvider } from '../../src/providers/jwt.provider.js';
import { env } from '../../src/config/environment.js';
import authService from '../../src/services/auth.service.js';
import authController from '../../src/controllers/auth.controller.js';
import authMiddleware from '../../src/middlewares/auth.middleware.js';
import authRepository from '../../src/repositories/auth.repository.js';
import bcrypt from 'bcryptjs';
import { ROLES, USER_STATUS } from '../../src/utils/constants.js';

describe('[ACC-01, ACC-02, ACC-09] Unit Tests - 100% Thuần HttpOnly Cookie Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('JwtProvider', () => {
    test('TC-1: Sinh token và giải mã token thành công với đúng chữ ký', async () => {
      const payload = { id: 10, email: 'toan@animora.vn', role: ROLES.CUSTOMER };
      const secret = env.JWT_ACCESS_SECRET;
      const token = await JwtProvider.generateToken(payload, secret, '1h');

      expect(typeof token).toBe('string');
      const decoded = await JwtProvider.verifyToken(token, secret);
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    test('TC-2: Ném lỗi khi giải mã token với sai chữ ký bí mật', async () => {
      const payload = { id: 10, email: 'toan@animora.vn' };
      const token = await JwtProvider.generateToken(payload, 'secret_1', '1h');

      await expect(JwtProvider.verifyToken(token, 'wrong_secret')).rejects.toThrow();
    });
  });

  describe('authService.login() & refreshToken()', () => {
    test('TC-3: Đăng nhập thành công trả về đầy đủ user và tokens', async () => {
      const mockUser = {
        id: 1,
        email: 'customer@animora.vn',
        password_hash: await bcrypt.hash('password123', 10),
        full_name: 'Ngô Phước Toàn',
        role: ROLES.CUSTOMER,
        status: USER_STATUS.ACTIVE,
      };

      jest.spyOn(authRepository, 'findByEmail').mockResolvedValue(mockUser);

      const result = await authService.login({
        email: 'customer@animora.vn',
        password: 'password123',
      });

      expect(result.user.id).toBe(1);
      expect(result.user.email).toBe('customer@animora.vn');
      expect(result.user).not.toHaveProperty('password_hash');
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
    });

    test('TC-4: refreshToken thành công khi refresh token từ Cookie hợp lệ', async () => {
      const payload = { id: 1, email: 'customer@animora.vn', role: ROLES.CUSTOMER };
      const validRefreshToken = await JwtProvider.generateToken(payload, env.JWT_REFRESH_SECRET, '7d');

      const result = await authService.refreshToken(validRefreshToken);
      expect(result).toHaveProperty('accessToken');

      const decoded = await JwtProvider.verifyToken(result.accessToken, env.JWT_ACCESS_SECRET);
      expect(decoded.id).toBe(1);
      expect(decoded.email).toBe('customer@animora.vn');
    });

    test('TC-5: refreshToken ném lỗi 401 khi không truyền refresh token hoặc token sai', async () => {
      await expect(authService.refreshToken(null)).rejects.toThrow('Không tìm thấy Refresh Token');
      await expect(authService.refreshToken('invalid_token')).rejects.toThrow();
    });
  });

  describe('authMiddleware.isAuthorized (Thuần HttpOnly Cookie)', () => {
    let mockReq;
    let mockRes;
    let next;

    beforeEach(() => {
      mockReq = {
        cookies: {},
      };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      next = jest.fn();
    });

    test('TC-6: Xác thực thành công khi có accessToken hợp lệ trong HttpOnly Cookie', async () => {
      const payload = { id: 1, email: 'toan@animora.vn', role: ROLES.CUSTOMER };
      const token = await JwtProvider.generateToken(payload, env.JWT_ACCESS_SECRET, '1h');
      mockReq.cookies.accessToken = token;

      await authMiddleware.isAuthorized(mockReq, mockRes, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(mockReq.user.id).toBe(1);
      expect(mockReq.jwtDecoded.id).toBe(1);
    });

    test('TC-7: Trả về mã 401 UNAUTHORIZED khi không có cookie accessToken', async () => {
      await authMiddleware.isAuthorized(mockReq, mockRes, next);

      expect(next).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Unauthorized! (Token not found in Cookie)',
        errorCode: 'UNAUTHORIZED',
      }));
    });

    test('TC-8: Trả về mã đặc biệt 410 GONE khi accessToken trong Cookie bị hết hạn', async () => {
      const payload = { id: 1, email: 'toan@animora.vn' };
      // Tạo token sống 0 giây để hết hạn ngay lập tức
      const expiredToken = await JwtProvider.generateToken(payload, env.JWT_ACCESS_SECRET, 0);
      mockReq.cookies.accessToken = expiredToken;

      await authMiddleware.isAuthorized(mockReq, mockRes, next);

      expect(next).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.GONE);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Need to refresh token',
        errorCode: 'NEED_TO_REFRESH_TOKEN',
      }));
    });

    test('TC-9: Trả về mã 401 UNAUTHORIZED khi token trong Cookie giả mạo / sai chữ ký', async () => {
      const payload = { id: 1, email: 'hacker@malicious.com' };
      const forgedToken = await JwtProvider.generateToken(payload, 'wrong_signature_123', '1h');
      mockReq.cookies.accessToken = forgedToken;

      await authMiddleware.isAuthorized(mockReq, mockRes, next);

      expect(next).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Unauthorized! Please login',
      }));
    });
  });

  describe('authController 100% Thuần HttpOnly Cookie', () => {
    test('TC-10: Controller login() gán accessToken và refreshToken vào Cookie, body KHÔNG chứa tokens', async () => {
      const mockReq = {
        body: { email: 'toan@animora.vn', password: 'password123' },
      };
      let capturedResponse;
      const mockRes = {
        cookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockImplementation((data) => {
          capturedResponse = data;
          return mockRes;
        }),
      };

      jest.spyOn(authService, 'login').mockResolvedValue({
        user: { id: 1, email: 'toan@animora.vn', full_name: 'Ngô Phước Toàn' },
        tokens: { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' },
      });

      await authController.login(mockReq, mockRes);

      // Kiểm tra 2 token phải được set vào cookie với httpOnly: true
      expect(mockRes.cookie).toHaveBeenCalledWith('accessToken', 'mock-access-token', expect.objectContaining({
        httpOnly: true,
      }));
      expect(mockRes.cookie).toHaveBeenCalledWith('refreshToken', 'mock-refresh-token', expect.objectContaining({
        httpOnly: true,
      }));

      // Kiểm tra bảo mật: Body CHỈ chứa user, KHÔNG chứa tokens
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(capturedResponse.data).toHaveProperty('email', 'toan@animora.vn');
      expect(capturedResponse.data).not.toHaveProperty('accessToken');
      expect(capturedResponse.data).not.toHaveProperty('refreshToken');
    });

    test('TC-11: Controller logout() xóa sạch cả 2 cookie accessToken và refreshToken', async () => {
      const mockReq = { user: { id: 1 } };
      const mockRes = {
        clearCookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      jest.spyOn(authService, 'logout').mockResolvedValue({ loggedOut: true });

      await authController.logout(mockReq, mockRes);

      expect(mockRes.clearCookie).toHaveBeenCalledWith('accessToken');
      expect(mockRes.clearCookie).toHaveBeenCalledWith('refreshToken');
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
    });

    test('TC-12: Controller refreshToken() đọc từ Cookie, gán đè cookie mới và KHÔNG để lộ token ở body', async () => {
      const mockReq = {
        cookies: { refreshToken: 'valid-refresh-cookie-123' },
      };
      let capturedResponse;
      const mockRes = {
        cookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockImplementation((data) => {
          capturedResponse = data;
          return mockRes;
        }),
      };

      jest.spyOn(authService, 'refreshToken').mockResolvedValue({
        accessToken: 'brand-new-access-token-456',
      });

      await authController.refreshToken(mockReq, mockRes);

      // Cookie accessToken phải được cập nhật lại
      expect(mockRes.cookie).toHaveBeenCalledWith('accessToken', 'brand-new-access-token-456', expect.objectContaining({
        httpOnly: true,
      }));
      expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
      // Body không để lộ accessToken
      expect(capturedResponse.data).toBeNull();
    });

    test('TC-13: Controller refreshToken() gọi next với ApiError 401 nếu thiếu cookie refreshToken', async () => {
      const mockReq = { cookies: {} };
      const mockRes = {};
      const next = jest.fn();

      await authController.refreshToken(mockReq, mockRes, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      expect(error.errorCode).toBe('REFRESH_TOKEN_NOT_FOUND');
    });
  });
});
