import defaultAdoptionService from '../services/adoption.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, paginatedResponse } from '../utils/apiResponse.js';

class AdoptionController {
  constructor(adoptionService = defaultAdoptionService) {
    this.adoptionService = adoptionService;

    this.listListings = asyncHandler(this.listListings.bind(this));
    this.createListing = asyncHandler(this.createListing.bind(this));
    this.listApplications = asyncHandler(this.listApplications.bind(this));
    this.submitApplication = asyncHandler(this.submitApplication.bind(this));
    this.reviewApplication = asyncHandler(this.reviewApplication.bind(this));
    this.scheduleHandover = asyncHandler(this.scheduleHandover.bind(this));
    this.confirmHandover = asyncHandler(this.confirmHandover.bind(this));
  }

  async listListings(req, res) {
    const { items, page, limit, totalItems } = await this.adoptionService.listListings(req.query);
    return paginatedResponse(
      res,
      items,
      page,
      limit,
      totalItems,
      'Lấy danh sách thú cưng nhận nuôi thành công'
    );
  }

  async createListing(req, res) {
    const result = await this.adoptionService.createListing(req.user, req.body);
    return successResponse(res, result, 'Đăng tin nhận nuôi thành công', 201);
  }

  async listApplications(req, res) {
    const { items, page, limit, totalItems } = await this.adoptionService.listApplications(
      req.user,
      req.query
    );
    return paginatedResponse(
      res,
      items,
      page,
      limit,
      totalItems,
      'Lấy danh sách hồ sơ nhận nuôi thành công'
    );
  }

  async submitApplication(req, res) {
    const result = await this.adoptionService.submitApplication(req.user, req.body);
    return successResponse(res, result, 'Gửi hồ sơ nhận nuôi thành công', 201);
  }

  async reviewApplication(req, res) {
    const result = await this.adoptionService.reviewApplication(
      req.user,
      req.params.id,
      req.body
    );
    return successResponse(res, result, 'Cập nhật trạng thái hồ sơ nhận nuôi thành công');
  }

  async scheduleHandover(req, res) {
    const result = await this.adoptionService.scheduleHandover(
      req.user,
      req.params.id,
      req.body
    );
    return successResponse(res, result, 'Đặt lịch bàn giao thú cưng thành công', 201);
  }

  async confirmHandover(req, res) {
    const result = await this.adoptionService.confirmHandover(
      req.user,
      req.params.id,
      req.body
    );
    return successResponse(res, result, 'Xác nhận bàn giao thú cưng thành công');
  }
}

const defaultAdoptionController = new AdoptionController();
export { defaultAdoptionController, AdoptionController };
export default defaultAdoptionController;

