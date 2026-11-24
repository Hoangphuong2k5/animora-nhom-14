// Controller hồ sơ thú cưng (PET-01/02/03/05) + lịch sức khỏe (PET-07).
import * as petService from '../services/pet-phuong.service.js';
import { successResponse, paginatedResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const createPet = asyncHandler(async (req, res) => {
  const pet = await petService.createPet(req.user.id, req.body);
  return successResponse(res, pet, 'Tạo hồ sơ thú cưng thành công', 201);
});

const updatePet = asyncHandler(async (req, res) => {
  const pet = await petService.updatePet(req.params.id, req.user.id, req.body);
  return successResponse(res, pet, 'Cập nhật hồ sơ thú cưng thành công');
});

const updateAllergies = asyncHandler(async (req, res) => {
  const pet = await petService.updateAllergies(req.params.id, req.user.id, req.body);
  return successResponse(res, pet, 'Cập nhật dị ứng thành công');
});

const listMyPets = asyncHandler(async (req, res) => {
  const pets = await petService.listMyPets(req.user.id);
  return paginatedResponse(res, pets, { page: 1, limit: pets.length, total: pets.length, total_pages: 1 });
});

const getPetById = asyncHandler(async (req, res) => {
  const pet = await petService.getPetById(req.params.id, req.user.id);
  return successResponse(res, pet, 'Lấy thông tin thú cưng thành công');
});

const listHealthSchedules = asyncHandler(async (req, res) => {
  const schedules = await petService.listHealthSchedules(req.params.id, req.user.id);
  return paginatedResponse(res, schedules, { page: 1, limit: schedules.length, total: schedules.length, total_pages: 1 });
});

const addHealthSchedule = asyncHandler(async (req, res) => {
  const schedule = await petService.addHealthSchedule(req.params.id, req.user.id, req.body);
  return successResponse(res, schedule, 'Thêm lịch sức khỏe thành công', 201);
});

export {
  createPet,
  updatePet,
  updateAllergies,
  listMyPets,
  getPetById,
  listHealthSchedules,
  addHealthSchedule,
};
