import defaultExpertService from '../services/expert.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, paginatedResponse } from '../utils/apiResponse.js';

/**
 * ExpertController tuân thủ Mục 1, 8, 10 clauden_node_js.md:
 * - Phụ thuộc vào tầng Service qua Constructor Injection
 * - Mỗi hàm chỉ điều phối Request/Response và trả về chuẩn JSON đồng nhất
 */
class ExpertController {
  constructor(expertService = defaultExpertService) {
    this.expertService = expertService;

    this.createCertificatePresignedUrl = asyncHandler(
      this.createCertificatePresignedUrl.bind(this)
    );
    this.onboardExpert = asyncHandler(this.onboardExpert.bind(this));
    this.addCertificate = asyncHandler(this.addCertificate.bind(this));
    this.getPendingExperts = asyncHandler(this.getPendingExperts.bind(this));
    this.verifyExpert = asyncHandler(this.verifyExpert.bind(this));
    this.assignServices = asyncHandler(this.assignServices.bind(this));
    this.getExpertServices = asyncHandler(this.getExpertServices.bind(this));
    this.getMySchedules = asyncHandler(this.getMySchedules.bind(this));
    this.upsertMySchedule = asyncHandler(this.upsertMySchedule.bind(this));
    this.updateSlotStatus = asyncHandler(this.updateSlotStatus.bind(this));
    this.searchExperts = asyncHandler(this.searchExperts.bind(this));
    this.getExpertPublicProfile = asyncHandler(this.getExpertPublicProfile.bind(this));
    this.getMyBookings = asyncHandler(this.getMyBookings.bind(this));
    this.confirmBooking = asyncHandler(this.confirmBooking.bind(this));
    this.rejectBooking = asyncHandler(this.rejectBooking.bind(this));
    this.updateBookingSpecialStatus = asyncHandler(this.updateBookingSpecialStatus.bind(this));
    this.completeBooking = asyncHandler(this.completeBooking.bind(this));
  }

  // EXP-01 (Mục 22 Direct-to-Cloud): Cấp URL Pre-signed PUT ngắn hạn
  async createCertificatePresignedUrl(req, res) {
    const result = await this.expertService.generateCertificatePresignedUrl(req.user, req.body);
    return successResponse(
      res,
      result,
      'Cấp Pre-signed PUT URL tải chứng chỉ trực tiếp lên Cloud thành công',
      201
    );
  }

  // EXP-01: Tạo hồ sơ chuyên viên
  async onboardExpert(req, res) {
    const result = await this.expertService.onboardExpert(req.user, req.body);
    return successResponse(
      res,
      result,
      'Tạo hồ sơ chuyên viên thành công, đang chờ Admin phê duyệt',
      201
    );
  }

  // EXP-01: Lưu metadata chứng chỉ sau khi upload lên Cloud
  async addCertificate(req, res) {
    const result = await this.expertService.addCertificate(req.user, req.body);
    return successResponse(res, result, 'Lưu chứng chỉ chuyên môn thành công', 201);
  }

  // EXP-02: Admin xem danh sách chuyên viên chờ duyệt
  async getPendingExperts(req, res) {
    const result = await this.expertService.getPendingExperts(req.query);
    return paginatedResponse(
      res,
      result.items,
      result.page,
      result.limit,
      result.totalItems,
      'Lấy danh sách hồ sơ chuyên viên thành công'
    );
  }

  // EXP-02: Admin duyệt / từ chối chuyên viên
  async verifyExpert(req, res) {
    const result = await this.expertService.verifyExpertProfile(
      req.user.id,
      req.params.id,
      req.body
    );
    return successResponse(res, result, 'Cập nhật trạng thái duyệt hồ sơ chuyên viên thành công');
  }

  // SVC-02: Gán dịch vụ cho chuyên viên
  async assignServices(req, res) {
    const result = await this.expertService.assignServicesToExpert(
      req.params.id,
      req.body.service_ids,
      req.user.id
    );
    return successResponse(res, result, 'Gán danh mục dịch vụ cho chuyên viên thành công');
  }

  // SVC-02: Xem dịch vụ của chuyên viên
  async getExpertServices(req, res) {
    const result = await this.expertService.getServicesOfExpert(req.params.id);
    return successResponse(res, result, 'Lấy danh sách dịch vụ của chuyên viên thành công');
  }

  // EXP-03: Xem lịch làm việc của tôi
  async getMySchedules(req, res) {
    const result = await this.expertService.getMySchedules(req.user.id, req.query);
    return successResponse(res, result, 'Lấy lịch làm việc của chuyên viên thành công');
  }

  // EXP-03: Đăng ký lịch làm việc & tự sinh slot
  async upsertMySchedule(req, res) {
    const result = await this.expertService.upsertMySchedule(req.user.id, req.body);
    return successResponse(
      res,
      result,
      'Cấu hình lịch làm việc và sinh khung giờ thành công',
      201
    );
  }

  // EXP-03: Đánh dấu slot rảnh/bận
  async updateSlotStatus(req, res) {
    const result = await this.expertService.updateMySlotStatus(
      req.user.id,
      req.params.slotId,
      req.body.status
    );
    return successResponse(res, result, 'Cập nhật trạng thái khung giờ làm việc thành công');
  }

  // EXP-04: Tìm kiếm & lọc chuyên viên
  async searchExperts(req, res) {
    const result = await this.expertService.searchExperts(req.query);
    return paginatedResponse(
      res,
      result.items,
      result.page,
      result.limit,
      result.totalItems,
      'Tìm kiếm danh sách chuyên viên thành công',
      { next_cursor: result.next_cursor }
    );
  }

  // EXP-05: Xem hồ sơ chuyên viên công khai
  async getExpertPublicProfile(req, res) {
    const result = await this.expertService.getExpertPublicProfile(req.params.id);
    return successResponse(res, result, 'Lấy hồ sơ chuyên viên thành công');
  }

  // BKG-05: Xem danh sách lịch hẹn của chuyên viên
  async getMyBookings(req, res) {
    const result = await this.expertService.getMyAssignedBookings(req.user.id, req.query);
    return paginatedResponse(
      res,
      result.items,
      result.page,
      result.limit,
      result.totalItems,
      'Lấy danh sách lịch hẹn của chuyên viên thành công'
    );
  }

  // BKG-06: Xác nhận lịch hẹn
  async confirmBooking(req, res) {
    const result = await this.expertService.confirmBookingByExpert(req.user.id, req.params.id);
    return successResponse(res, result, 'Xác nhận tiếp nhận lịch hẹn thành công');
  }

  // BKG-07: Từ chối lịch hẹn
  async rejectBooking(req, res) {
    const result = await this.expertService.rejectBookingByExpert(
      req.user.id,
      req.params.id,
      req.body
    );
    return successResponse(
      res,
      result,
      'Đã từ chối lịch hẹn, giải phóng khung giờ và gửi gợi ý chuyên viên thay thế'
    );
  }

  // BKG-08: Cập nhật trạng thái đặc biệt
  async updateBookingSpecialStatus(req, res) {
    const result = await this.expertService.updateBookingSpecialStatus(
      req.user.id,
      req.params.id,
      req.body,
      req.ip
    );
    return successResponse(res, result, 'Cập nhật trạng thái lịch hẹn thành công');
  }

  // BKG-09: Hoàn thành dịch vụ
  async completeBooking(req, res) {
    const result = await this.expertService.completeBookingByExpert(
      req.user.id,
      req.params.id,
      req.body
    );
    return successResponse(
      res,
      result,
      'Hoàn tất dịch vụ và lưu nhật ký chăm sóc thú cưng thành công'
    );
  }
}

const expertControllerInstance = new ExpertController();

export { expertControllerInstance, ExpertController };
export default expertControllerInstance;
