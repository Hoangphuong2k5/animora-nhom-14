// Controller đề xuất nhập thuốc (MED-09).
// Theo rules.md §3: controller chỉ lấy dữ liệu từ req, gọi service, trả res
// bằng successResponse / paginatedResponse; luôn bọc bằng asyncHandler.
import * as medicineSuggestionService from '../services/medicine-suggestion.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, paginatedResponse } from '../utils/apiResponse.js';

const suggestMedicine = asyncHandler(async (req, res) => {
  const result = await medicineSuggestionService.suggestMedicine(req.user, req.body);
  return successResponse(res, result, 'Đã gửi đề xuất nhập thuốc', 201);
});

const listMedicineSuggestions = asyncHandler(async (req, res) => {
  const { items, page, limit, totalItems } =
    await medicineSuggestionService.listMedicineSuggestions(req.query);
  return paginatedResponse(res, items, page, limit, totalItems, 'Lấy danh sách đề xuất thành công');
});

export {
  suggestMedicine,
  listMedicineSuggestions,
};
