// Author: TrungQuanDev & Animora Team (Group 14)
import { StatusCodes } from 'http-status-codes';
import { env } from '../config/environment.js';
import { JwtProvider } from '../providers/jwt.provider.js';

/**
 * Middleware này sẽ đảm nhận việc quan trọng:
 * Lấy và xác thực cái JWT accessToken nhận được từ phía Client (FE) qua HttpOnly Cookie.
 * Cơ chế 100% thuần HttpOnly Cookie:
 * - Bảo vệ tuyệt đối trước tấn công XSS (Mã độc JavaScript phía Client không thể đọc được Token).
 * - Client (Axios) cần bật `withCredentials: true` để tự động gửi cookie trong request.
 * - Server cần cấu hình `credentials: true` trong CORS.
 */
const isAuthorized = async (req, res, next) => {
  // Lấy accessToken từ Cookie (hoặc Bearer Header cho Postman/Mobile)
  const accessTokenFromCookie =
    req.cookies?.accessToken ||
    (req.headers?.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

  // Nếu không tìm thấy accessToken trong Cookie thì chặn lại ngay và trả về 401
  if (!accessTokenFromCookie) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: 'Unauthorized! (Token not found in Cookie)',
      errorCode: 'UNAUTHORIZED',
    });
    return;
  }

  try {
    // B1: Thực hiện giải mã token xem nó có hợp lệ hay không thông qua JwtProvider
    const accessTokenDecoded = await JwtProvider.verifyToken(
      accessTokenFromCookie,
      env.JWT_ACCESS_SECRET
    );

    // B2: Quan trọng: Nếu như token hợp lệ, lưu thông tin giải mã được
    // vào req.user và req.jwtDecoded để các tầng Controller/Service phía sau sử dụng
    req.jwtDecoded = accessTokenDecoded;
    req.user = accessTokenDecoded;

    // B3: Cho phép request đi tiếp vào Controller
    next();
  } catch (error) {
    // TH lỗi 01: Nếu cái accessToken nó bị hết hạn (expired) thì mình cần trả về mã lỗi
    // GONE - 410 cho phía FE Axios Interceptor biết để tự động gọi API refreshToken
    if (error.message?.includes('jwt expired') || error.name === 'TokenExpiredError') {
      res.status(StatusCodes.GONE).json({
        message: 'Need to refresh token',
        errorCode: 'NEED_TO_REFRESH_TOKEN',
      });
      return;
    }

    // TH lỗi 02: Nếu cái accessToken không hợp lệ do bất kì điều gì khác trường hợp hết hạn
    // (sai chữ ký bí mật, token bị sửa đổi...) thì trả về thẳng mã 401 buộc đăng nhập lại
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: 'Unauthorized! Please login',
      errorCode: 'INVALID_TOKEN',
    });
  }
};

export const authMiddleware = {
  isAuthorized,
  verifyToken: isAuthorized, // Alias giữ tương thích
  authenticate: isAuthorized,
};

export const verifyToken = isAuthorized;
export const authenticate = isAuthorized;
export default authMiddleware;
