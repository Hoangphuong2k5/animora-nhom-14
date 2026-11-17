import defaultBookingService from '../services/booking.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, paginatedResponse } from '../utils/apiResponse.js';

class BookingController {
  constructor(bookingService = defaultBookingService) {
    this.bookingService = bookingService;

    this.listBookings = asyncHandler(this.listBookings.bind(this));
    this.getAvailability = asyncHandler(this.getAvailability.bind(this));
    this.getBookingById = asyncHandler(this.getBookingById.bind(this));
    this.createBooking = asyncHandler(this.createBooking.bind(this));
    this.cancelBooking = asyncHandler(this.cancelBooking.bind(this));
    this.rescheduleBooking = asyncHandler(this.rescheduleBooking.bind(this));
  }

  async getAvailability(req, res) {
    const result = await this.bookingService.getBookingAvailability(req.query);
    return successResponse(res, result, 'Kiểm tra khung giờ trống thành công');
  }

  async listBookings(req, res) {
    const { items, page, limit, totalItems } = await this.bookingService.listBookings(
      req.user,
      req.query
    );
    return paginatedResponse(
      res,
      items,
      page,
      limit,
      totalItems,
      'Lấy danh sách lịch hẹn thành công'
    );
  }

  async getBookingById(req, res) {
    const result = await this.bookingService.getBookingById(req.user, req.params.id);
    return successResponse(res, result, 'Lấy chi tiết lịch hẹn thành công');
  }

  async createBooking(req, res) {
    const result = await this.bookingService.createBooking(req.user, req.body);
    return successResponse(res, result, 'Đặt lịch dịch vụ thành công', 201);
  }

  async cancelBooking(req, res) {
    const result = await this.bookingService.cancelBooking(req.user, req.params.id, req.body);
    return successResponse(res, result, 'Hủy lịch hẹn thành công');
  }

  async rescheduleBooking(req, res) {
    const result = await this.bookingService.rescheduleBooking(req.user, req.params.id, req.body);
    return successResponse(res, result, 'Đổi lịch hẹn thành công');
  }
}

const defaultBookingController = new BookingController();
export { defaultBookingController, BookingController };
export default defaultBookingController;

