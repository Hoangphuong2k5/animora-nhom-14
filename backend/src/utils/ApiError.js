class ApiError extends Error {
  constructor(statusCode, message, errorCode = "BAD_REQUEST", errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
  }
}

module.exports = ApiError;
