const ApiError = require("../utils/ApiError");

const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const dataToValidate = req[source];
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));
      throw new ApiError(
        400,
        "Dữ liệu đầu vào không hợp lệ",
        "VALIDATION_ERROR",
        errorDetails,
      );
    }

    req[source] = value;
    next();
  };
};

module.exports = { validate };
