import customerRepository from "../repositories/customer.repository.js";
import ApiError from "../utils/ApiError.js";
import { USER_STATUS } from "../utils/constants.js";

/**
 * [MGR-CUS-01] Lấy danh sách khách hàng phân trang & tìm kiếm cho Manager/Admin
 */
const getCustomers = async (queryParams) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 10;
  const search = (queryParams.search || "").trim();
  const status = queryParams.status || "all";

  const { items, totalItems } = await customerRepository.findCustomersPaginated(
    {
      page,
      limit,
      search,
      status,
    },
  );

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return {
    items,
    page,
    limit,
    totalItems,
    totalPages,
  };
};

/**
 * [MGR-CUS-02] Xem chi tiết hồ sơ khách hàng
 */
const getCustomerDetail = async (customerId) => {
  const customer = await customerRepository.findCustomerDetailById(customerId);
  if (!customer) {
    throw new ApiError(
      404,
      "Không tìm thấy hồ sơ khách hàng trong hệ thống",
      "CUSTOMER_NOT_FOUND",
    );
  }

  return customer;
};

/**
 * [MGR-CUS-03] Khóa hoặc mở khóa tài khoản khách hàng
 */
const updateCustomerStatus = async (
  customerId,
  payload,
  currentManagerId = null,
) => {
  const { status, reason } = payload;
  const targetId = Number(String(customerId).replace(/^cus-/, ""));

  if (currentManagerId && Number(targetId) === Number(currentManagerId)) {
    throw new ApiError(
      400,
      "Bạn không thể tự thay đổi trạng thái tài khoản của chính mình",
      "CANNOT_UPDATE_SELF",
    );
  }

  const existingCustomer =
    await customerRepository.findCustomerDetailById(customerId);
  if (!existingCustomer) {
    throw new ApiError(
      404,
      "Không tìm thấy khách hàng cần cập nhật trạng thái",
      "CUSTOMER_NOT_FOUND",
    );
  }

  const normalizedStatus =
    status.toLowerCase() === "locked" || status.toLowerCase() === "banned"
      ? USER_STATUS.LOCKED
      : USER_STATUS.ACTIVE;

  const updatedCustomer = await customerRepository.updateCustomerAccountStatus(
    customerId,
    normalizedStatus,
  );

  return {
    customer: updatedCustomer,
    message:
      normalizedStatus === USER_STATUS.LOCKED
        ? "Đã khóa tài khoản khách hàng thành công"
        : "Đã mở khóa tài khoản khách hàng thành công",
    reason: reason || null,
  };
};

export { getCustomers, getCustomerDetail, updateCustomerStatus };
export default {
  getCustomers,
  getCustomerDetail,
  updateCustomerStatus,
};
