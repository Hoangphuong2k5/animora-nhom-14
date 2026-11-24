// Controller đơn thuốc (MED-04–08).
import * as prescriptionService from '../services/prescription.service.js';
import { successResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const createPrescription = asyncHandler(async (req, res) => {
  const prescription = await prescriptionService.createPrescription(req.user.id, req.body);
  return successResponse(res, prescription, 'Kê đơn thuốc thành công', 201);
});

const updatePrescription = asyncHandler(async (req, res) => {
  const prescription = await prescriptionService.updatePrescription(req.params.id, req.user.id, req.body);
  return successResponse(res, prescription, 'Đã hủy đơn cũ và kê đơn mới thành công');
});

const listPrescriptionHistory = asyncHandler(async (req, res) => {
  const result = await prescriptionService.listPrescriptionHistory(req.query, req.user);
  return successResponse(res, result.data, 'Lấy lịch sử đơn thuốc thành công', 200, result.pagination);
});

const validatePurchase = asyncHandler(async (req, res) => {
  const result = await prescriptionService.validatePurchase(req.body);
  return successResponse(res, result, 'Kiểm tra đơn thuốc thành công');
});

const reorderPrescription = asyncHandler(async (req, res) => {
  const result = await prescriptionService.reorderPrescription(req.params.id, req.user.id);
  return successResponse(res, result, 'Đã thêm thuốc vào giỏ hàng');
});

export {
  createPrescription,
  updatePrescription,
  listPrescriptionHistory,
  validatePurchase,
  reorderPrescription,
};
