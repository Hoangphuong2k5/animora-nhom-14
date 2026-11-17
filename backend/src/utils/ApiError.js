class ApiError extends Error {
  constructor(statusCode, message, errorCode = 'BAD_REQUEST', errors = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export { ApiError };
export default ApiError;
