// Author: TrungQuanDev & Animora Team (Group 14)
import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/environment.js';
import ApiError from '../utils/ApiError.js';

/**
 * Khởi tạo Google OAuth2Client với GOOGLE_CLIENT_ID của dự án Animora
 */
const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

/**
 * Xác thực Google ID Token gửi từ Front-End (Next.js / ReactJS)
 * 
 * 📌 CHỖ NÀY LÀM GÌ:
 *    Gọi trực tiếp máy chủ Google OAuth để giải mã và xác minh tính hợp lệ của token
 *    mà người dùng đã đăng nhập trên trình duyệt.
 * 
 * 📌 CHỖ NÀO LẤY CÁI GÌ:
 *    - idToken: Chuỗi credential nhận từ Google Sign-In ở client.
 *    - audience: Khớp với env.GOOGLE_CLIENT_ID của ứng dụng Animora.
 * 
 * 📌 XỬ LÍ TIẾP THEO RA SAO:
 *    - Nếu token hợp lệ: Trả về thông tin { email, fullName, avatar, googleId }.
 *    - Nếu token giả mạo hoặc hết hạn: Ném lỗi 401 UNAUTHORIZED.
 * 
 * @param {string} idToken Chuỗi JWT do Google cấp cho phía Client
 * @returns {Promise<{ email: string, fullName: string, avatar: string, googleId: string }>}
 */
const verifyGoogleToken = async (idToken) => {
  if (!idToken) {
    throw new ApiError(400, 'Thiếu Google ID Token, không thể xác thực!', 'MISSING_GOOGLE_TOKEN');
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new ApiError(400, 'Thông tin tài khoản Google không hợp lệ hoặc thiếu email', 'INVALID_GOOGLE_PAYLOAD');
    }

    return {
      email: payload.email.toLowerCase().trim(),
      fullName: payload.name || payload.email.split('@')[0],
      avatar: payload.picture || null,
      googleId: payload.sub,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      401,
      'Google Token không hợp lệ hoặc đã hết hạn, vui lòng đăng nhập lại!',
      'INVALID_GOOGLE_TOKEN'
    );
  }
};

export const GoogleProvider = {
  verifyGoogleToken,
};
export default GoogleProvider;
