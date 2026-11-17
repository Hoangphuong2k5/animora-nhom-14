import customerService from '../services/customer.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';

/**
 * [MGR-CUS-01] Lấy danh sách khách hàng phân trang & tìm kiếm
 */
const getCustomers = asyncHandler(async (req, res) => {
  const result = await customerService.getCustomers(req.query);
  return successResponse(res, result, 'Lấy danh sách khách hàng thành công');
});

/**
 * [MGR-CUS-02] Xem chi tiết hồ sơ khách hàng 360 độ
 */
const getCustomerDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await customerService.getCustomerDetail(id);
  return successResponse(res, result, 'Lấy thông tin chi tiết khách hàng thành công');
});

/**
 * [MGR-CUS-03] Khóa / Mở khóa tài khoản khách hàng
 */
const updateCustomerStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentManagerId = req.user?.id;
  const result = await customerService.updateCustomerStatus(id, req.body, currentManagerId);
  return successResponse(res, result.customer, result.message);
});

export {
  getCustomers,
  getCustomerDetail,
  updateCustomerStatus,
};
export default {
  getCustomers,
  getCustomerDetail,
  updateCustomerStatus,
};
