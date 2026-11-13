const successResponse = (
  res,
  data = null,
  message = "Thành công",
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const paginatedResponse = (
  res,
  data,
  page,
  limit,
  totalItems,
  message = "Thành công",
) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalItems: Number(totalItems),
      totalPages: Math.ceil(totalItems / limit),
    },
  });
};

module.exports = { successResponse, paginatedResponse };
