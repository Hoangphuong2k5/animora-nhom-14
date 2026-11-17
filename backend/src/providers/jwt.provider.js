// Author: TrungQuanDev & Animora Team (Group 14)
import JWT from 'jsonwebtoken';
import { env } from '../config/environment.js';

/**
 * 2 cái chữ ký bí mật quan trọng trong dự án dành cho JWT - Jsonwebtokens
 * Được nạp từ biến môi trường .env (không hardcode vào mã nguồn cho bảo mật)
 */
export const ACCESS_TOKEN_SECRET_SIGNATURE = env.JWT_ACCESS_SECRET;
export const REFRESH_TOKEN_SECRET_SIGNATURE = env.JWT_REFRESH_SECRET;

/**
 * Function tạo mới 1 token - cần 3 tham số đầu vào:
 * @param {Object} userInfo: Những thông tin muốn đính kèm vào payload của token (id, email, role...)
 * @param {String} secretSignature: Chữ ký bí mật (dạng một chuỗi string ngẫu nhiên), lưu trong biến môi trường ENV cho bảo mật
 * @param {String|Number} tokenLife: Thời gian sống của token (vd: '15m', '1h', '7d', hoặc số giây)
 */
const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    // Hàm sign() của thư viện jsonwebtoken - Thuật toán mặc định HS256, ghi rõ vào code để nhớ kiến thức
    return JWT.sign(userInfo, secretSignature, {
      algorithm: 'HS256',
      expiresIn: tokenLife,
    });
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Function kiểm tra 1 token có hợp lệ hay không
 * Hợp lệ ở đây hiểu đơn giản là cái token được tạo ra có đúng với cái chữ ký bí mật
 * secretSignature trong dự án hay không, và còn trong hạn sử dụng hay đã hết hạn
 * @param {String} token: Chuỗi JWT token cần kiểm tra
 * @param {String} secretSignature: Chữ ký bí mật để đối chiếu giải mã
 */
const verifyToken = async (token, secretSignature) => {
  try {
    // Hàm verify của thư viện jsonwebtoken
    return JWT.verify(token, secretSignature);
  } catch (error) {
    throw new Error(error);
  }
};

export const JwtProvider = {
  generateToken,
  verifyToken,
  verfiyToken: verifyToken, // Alias tương thích theo code mẫu của anh TrungQuanDev
};

export default JwtProvider;
