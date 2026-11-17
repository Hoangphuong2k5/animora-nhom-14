import { StatusCodes } from 'http-status-codes';
import { env } from './environment.js';
import ApiError from '../utils/ApiError.js';

export const corsOptions = {
  origin: (origin, callback) => {
    const isLocalDevOrigin =
      env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin || '');
    if (!origin || env.CORS_ORIGINS.includes(origin) || isLocalDevOrigin) {
      return callback(null, true);
    }
    return callback(
      new ApiError(StatusCodes.FORBIDDEN, `${origin} không được phép truy cập (CORS)`, 'CORS_NOT_ALLOWED')
    );
  },
  optionsSuccessStatus: 200,
  credentials: true,
};

export default corsOptions;
