// Controller đề xuất kho (MED-09).
import * as medicineSuggestionService from '../services/medicine-suggestion.service.js';
import { successResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const suggestMedicine = asyncHandler(async (req, res) => {
  const proposal = await medicineSuggestionService.suggestMedicine(req.user.id, req.body);
  return successResponse(res, proposal, 'Gửi đề xuất thành công', 201);
});

const listSuggestions = asyncHandler(async (req, res) => {
  const result = await medicineSuggestionService.listSuggestions(req.query);
  return successResponse(res, result.data, 'Lấy danh sách đề xuất thành công', 200, result.pagination);
});

const reviewProposal = asyncHandler(async (req, res) => {
  const proposal = await medicineSuggestionService.reviewProposal(req.params.id, req.user.id, req.body);
  return successResponse(res, proposal, 'Đã duyệt đề xuất');
});

export {
  suggestMedicine,
  listSuggestions,
  reviewProposal,
};
