import defaultPaymentService from '../services/payment.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, paginatedResponse } from '../utils/apiResponse.js';

class PaymentController {
  constructor(paymentService = defaultPaymentService) {
    this.paymentService = paymentService;

    this.createVnpayUrl = asyncHandler(this.createVnpayUrl.bind(this));
    this.vnpayIpn = asyncHandler(this.vnpayIpn.bind(this));
    this.vnpayReturn = asyncHandler(this.vnpayReturn.bind(this));
    this.confirmCashPayment = asyncHandler(this.confirmCashPayment.bind(this));
    this.listMyPayments = asyncHandler(this.listMyPayments.bind(this));
  }

  async createVnpayUrl(req, res) {
    const ipAddr =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '127.0.0.1';
    const result = await this.paymentService.createVnpayPaymentUrl(req.user, req.body, ipAddr);
    return successResponse(res, result, 'Tạo URL thanh toán VNPAY thành công', 201);
  }

  async vnpayIpn(req, res) {
    const result = await this.paymentService.handleVnpayCallback(req.query);
    return res.status(200).json({ RspCode: result.RspCode, Message: result.Message });
  }

  async vnpayReturn(req, res) {
    const result = await this.paymentService.handleVnpayCallback(req.query);
    return successResponse(
      res,
      result,
      result.isSuccess ? 'Thanh toán VNPAY thành công' : 'Thanh toán VNPAY thất bại'
    );
  }

  async confirmCashPayment(req, res) {
    const result = await this.paymentService.confirmCashPayment(req.user.id, req.params.id);
    return successResponse(res, result, 'Xác nhận thu tiền mặt thành công');
  }

  async listMyPayments(req, res) {
    const { items, page, limit, totalItems } = await this.paymentService.listMyPayments(
      req.user.id,
      req.query
    );
    return paginatedResponse(
      res,
      items,
      page,
      limit,
      totalItems,
      'Lấy lịch sử thanh toán thành công'
    );
  }
}

const defaultPaymentController = new PaymentController();
export { defaultPaymentController, PaymentController };
export default defaultPaymentController;

