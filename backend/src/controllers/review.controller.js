// Controller đánh giá dịch vụ (RVW-01/02).
import * as reviewService from '../services/review.service.js';
import { successResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.params.id, req.user.id, req.body);
  return successResponse(res, review, 'Đánh giá thành công', 201);
});

const listStaffReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.listStaffReviews(req.params.id, req.query);
  return successResponse(res, result, 'Lấy danh sách đánh giá thành công');
});

export {
  createReview,
  listStaffReviews,
};
