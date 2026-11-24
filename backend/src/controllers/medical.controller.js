// Controller bệnh án (MED-01/02/03).
import * as medicalService from '../services/medical.service.js';
import { successResponse, paginatedResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const vetViewMedicalHistory = asyncHandler(async (req, res) => {
  const history = await medicalService.vetViewMedicalHistory(req.params.id, req.user.id);
  return paginatedResponse(res, history, { page: 1, limit: history.length, total: history.length, total_pages: 1 });
});

const createMedicalRecord = asyncHandler(async (req, res) => {
  const record = await medicalService.createMedicalRecord(req.user.id, req.body);
  return successResponse(res, record, 'Tạo bệnh án thành công', 201);
});

const updateMedicalNotes = asyncHandler(async (req, res) => {
  const result = await medicalService.updateMedicalNotes(req.params.id, req.user.id, req.body);
  return successResponse(res, result, 'Cập nhật bệnh án thành công');
});

const listMedicalHistoryByPet = asyncHandler(async (req, res) => {
  const history = await medicalService.listMedicalHistoryByPet(req.params.id, req.user.id);
  return paginatedResponse(res, history, { page: 1, limit: history.length, total: history.length, total_pages: 1 });
});

export {
  vetViewMedicalHistory,
  createMedicalRecord,
  updateMedicalNotes,
  listMedicalHistoryByPet,
};
