const serviceService = require('../services/service.service');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');

/**
 * [SVC-01] Lấy danh sách dịch vụ (khách hàng & admin)
 */
const getServices = asyncHandler(async (req, res) => {
  const { items, page, limit, totalItems } = await serviceService.getServices(req.query);
  return paginatedResponse(res, items, page, limit, totalItems, 'Lấy danh sách dịch vụ thành công');
});

/**
 * [SVC-01] Xem chi tiết dịch vụ
 */
const getServiceById = asyncHandler(async (req, res) => {
  const result = await serviceService.getServiceById(req.params.id);
  return successResponse(res, result, 'Lấy thông tin dịch vụ thành công');
});

/**
 * [SVC-01] Admin: Tạo mới dịch vụ
 */
const createService = asyncHandler(async (req, res) => {
  const result = await serviceService.createService(req.body);
  return successResponse(res, result, 'Tạo dịch vụ mới thành công', 201);
});

/**
 * [SVC-01] Admin: Cập nhật thông tin dịch vụ
 */
const updateService = asyncHandler(async (req, res) => {
  const result = await serviceService.updateService(req.params.id, req.body);
  return successResponse(res, result, 'Cập nhật dịch vụ thành công');
});

/**
 * [SVC-01] Admin: Cập nhật trạng thái dịch vụ
 */
const updateServiceStatus = asyncHandler(async (req, res) => {
  const result = await serviceService.updateServiceStatus(req.params.id, req.body);
  return successResponse(res, result, 'Cập nhật trạng thái dịch vụ thành công');
});

/**
 * [SVC-01] Admin: Xóa dịch vụ
 */
const deleteService = asyncHandler(async (req, res) => {
  const result = await serviceService.deleteService(req.params.id);
  return successResponse(res, result, 'Xóa dịch vụ thành công');
});

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  updateServiceStatus,
  deleteService,
};
