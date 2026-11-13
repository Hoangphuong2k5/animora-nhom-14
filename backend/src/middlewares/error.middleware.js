const ApiError = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Lỗi hệ thống không mong muốn";
  let errorCode = err.errorCode || "INTERNAL_SERVER_ERROR";
  let errors = err.errors || null;

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    statusCode = 400;
    message = "Dữ liệu JSON gửi lên sai định dạng cú pháp";
    errorCode = "INVALID_JSON";
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    errors,
  });
};

module.exports = { errorHandler };
