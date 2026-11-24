import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import { env } from '../config/environment.js';
import { getTraceId } from '../utils/traceContext.js';
import logger from '../utils/logger.js';

/**
 * Middleware xử lý lỗi tập trung (Rule 15):
 *  - 4 tham số (err, req, res, next)
 *  - Chuẩn hóa StatusCodes
 *  - Ẩn stack trace ở production / test
 *  - Ghi log JSON có traceId
 */
const mapSqlServerError = (err) => {
  const sqlNumber = Number(
    err?.number ?? err?.driverError?.number ?? err?.originalError?.info?.number ?? 0
  );
  const rawMessage = String(err?.message || '');

  if (sqlNumber === 2601 || sqlNumber === 2627) {
    if (
      rawMessage.includes('UX_Payments_OneSuccessfulPerAppointment') ||
      rawMessage.includes('UX_Payments_OneSuccessfulPerOrder')
    ) {
      return {
        statusCode: StatusCodes.CONFLICT,
        errorCode: 'ALREADY_PAID',
        message: 'Giao dịch này đã được thanh toán thành công trước đó',
      };
    }
    if (
      rawMessage.includes('UX_Payments_OnePendingPerAppointment') ||
      rawMessage.includes('UX_Payments_OnePendingPerOrder')
    ) {
      return {
        statusCode: StatusCodes.CONFLICT,
        errorCode: 'DUPLICATE_PENDING_PAYMENT',
        message: 'Đã tồn tại yêu cầu thanh toán đang chờ xử lý cho giao dịch này',
      };
    }
    return {
      statusCode: StatusCodes.CONFLICT,
      errorCode: 'DUPLICATE_RESOURCE',
      message: 'Dữ liệu bị trùng lặp hoặc vi phạm ràng buộc duy nhất',
    };
  }

  if (sqlNumber >= 51101 && sqlNumber <= 51115) {
    if (sqlNumber === 51113) {
      return {
        statusCode: StatusCodes.NOT_FOUND,
        errorCode: 'PAYMENT_TARGET_NOT_FOUND',
        message: rawMessage || 'Không tìm thấy lịch hẹn hoặc đơn hàng cần thanh toán',
      };
    }
    if (sqlNumber === 51110) {
      return {
        statusCode: StatusCodes.CONFLICT,
        errorCode: 'ALREADY_PAID',
        message: rawMessage || 'Giao dịch này đã được thanh toán trước đó',
      };
    }
    if (sqlNumber === 51103 || sqlNumber === 51112) {
      return {
        statusCode: StatusCodes.CONFLICT,
        errorCode: 'IDEMPOTENCY_CONFLICT',
        message: rawMessage || 'Khóa idempotency không hợp lệ hoặc đã được sử dụng',
      };
    }
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      errorCode: 'PAYMENT_VALIDATION_ERROR',
      message: rawMessage || 'Yêu cầu thanh toán không hợp lệ',
    };
  }

  return null;
};

export const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const isDev = env.NODE_ENV === 'development';

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = StatusCodes.BAD_REQUEST;
    err.message = 'Dữ liệu JSON gửi lên sai định dạng cú pháp';
    err.errorCode = 'INVALID_JSON';
  } else if (!err.statusCode) {
    const mappedSql = mapSqlServerError(err);
    if (mappedSql) {
      statusCode = mappedSql.statusCode;
      err.message = mappedSql.message;
      err.errorCode = mappedSql.errorCode;
    }
  }

  const responseError = {
    success: false,
    message:
      statusCode === StatusCodes.INTERNAL_SERVER_ERROR && !isDev
        ? getReasonPhrase(statusCode)
        : err.message || getReasonPhrase(statusCode),
    errorCode: err.errorCode || 'INTERNAL_SERVER_ERROR',
    errors: err.errors || null,
    traceId: typeof getTraceId === 'function' ? getTraceId() : undefined,
    stack: err.stack,
  };

  if (!isDev) delete responseError.stack;

  if (statusCode >= 500) {
    logger.error('Unhandled request error', {
      errorName: err.name,
      message: err.message,
      stack: err.stack,
      method: req.method,
      path: req.originalUrl,
    });
  } else {
    logger.warn('Request rejected', {
      statusCode,
      errorCode: responseError.errorCode,
      message: responseError.message,
      path: req.originalUrl,
    });
  }

  res.status(statusCode).json(responseError);
};

export const errorHandler = errorMiddleware;
export default { errorMiddleware, errorHandler };
