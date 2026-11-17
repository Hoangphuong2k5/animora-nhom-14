import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';

export const uploadImage = async (fileBuffer, options = {}) => {
  try {
    // Provider quản lý upload ảnh (Cloudinary / Local storage)
    return {
      url: `/uploads/${Date.now()}_image.jpg`,
      public_id: `img_${Date.now()}`,
    };
  } catch (error) {
    throw new ApiError(
      StatusCodes.BAD_GATEWAY,
      'Không thể upload ảnh, vui lòng thử lại sau',
      'CLOUDINARY_PROVIDER_ERROR'
    );
  }
};

export const deleteImage = async (publicId) => {
  return { result: 'ok' };
};

export default { uploadImage, deleteImage };
