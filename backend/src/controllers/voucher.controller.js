import defaultVoucherService from '../services/voucher.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, paginatedResponse } from '../utils/apiResponse.js';

class VoucherController {
  constructor(voucherService = defaultVoucherService) {
    this.voucherService = voucherService;

    this.listVouchers = asyncHandler(this.listVouchers.bind(this));
    this.createVoucher = asyncHandler(this.createVoucher.bind(this));
    this.toggleVoucherStatus = asyncHandler(this.toggleVoucherStatus.bind(this));
    this.deleteVoucher = asyncHandler(this.deleteVoucher.bind(this));
    this.validateVoucher = asyncHandler(this.validateVoucher.bind(this));
    this.applyVoucher = asyncHandler(this.applyVoucher.bind(this));
    this.revertVoucher = asyncHandler(this.revertVoucher.bind(this));
  }

  getRequestMeta(req) {
    return {
      ipAddress: req.ip || null,
      userAgent: req.get?.('user-agent') || null,
    };
  }

  async listVouchers(req, res) {
    const { items, page, limit, totalItems } = await this.voucherService.listVouchers(req.query);
    return paginatedResponse(
      res,
      items,
      page,
      limit,
      totalItems,
      'Lấy danh sách voucher thành công'
    );
  }

  async createVoucher(req, res) {
    const created = await this.voucherService.createVoucher(
      req.user,
      req.body,
      this.getRequestMeta(req)
    );
    return successResponse(res, created, 'Tạo voucher thành công', 201);
  }

  async toggleVoucherStatus(req, res) {
    const updated = await this.voucherService.toggleVoucherStatus(
      req.user,
      req.params.id,
      req.body,
      this.getRequestMeta(req)
    );
    return successResponse(res, updated, 'Cập nhật trạng thái voucher thành công');
  }

  async deleteVoucher(req, res) {
    const result = await this.voucherService.deleteVoucher(
      req.user,
      req.params.id,
      this.getRequestMeta(req)
    );
    return successResponse(res, result, 'Xóa voucher thành công');
  }

  async validateVoucher(req, res) {
    const result = await this.voucherService.validateVoucherForCustomer(req.user, req.body);
    return successResponse(res, result, 'Kiểm tra voucher thành công');
  }

  async applyVoucher(req, res) {
    const result = await this.voucherService.applyVoucherToOrder(
      req.user,
      req.body,
      this.getRequestMeta(req)
    );
    return successResponse(res, result, 'Áp dụng voucher vào đơn hàng thành công');
  }

  async revertVoucher(req, res) {
    const result = await this.voucherService.revertVoucherForOrder(
      req.user,
      req.params.orderId,
      req.body?.reason,
      this.getRequestMeta(req)
    );
    return successResponse(res, result, 'Hoàn tác lượt sử dụng voucher thành công');
  }
}

const defaultVoucherController = new VoucherController();
export { defaultVoucherController, VoucherController };
export default defaultVoucherController;

