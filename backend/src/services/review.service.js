// Service đánh giá dịch vụ (RVW-01/02) — theo schema Animora v1.5 mới.
// expert_reviews -> service_reviews; booking_id -> appointment_id;
// expert_id -> staff_user_id (users.user_id).
// RVW-01: khách đánh giá sau khi lịch hẹn COMPLETED, 1 đánh giá / 1 lịch hẹn
// (UNIQUE trên appointment_id), nhân viên mặc định là người đầu tiên
// của lịch hẹn (appointment_items.sequence_order nhỏ nhất).
// RVW-02: xem đánh giá của 1 nhân viên (chỉ PUBLISHED) + thống kê
// tính bằng AVG/COUNT lúc đọc (D3(a) — bỏ tính lại rating vì
// staff_profiles không còn cột rating/rating_count).
import * as reviewRepository from '../repositories/review.repository.js';
import * as petRepository from '../repositories/pet-phuong.repository.js';
import { ApiError } from '../utils/ApiError.js';

// RVW-01: Khách đánh giá sau buổi khám/dịch vụ.
const createReview = async (appointmentId, userId, payload) => {
  const customerId = await petRepository.findCustomerIdByUserId(userId);
  if (!customerId) {
    throw new ApiError(404, 'Không tìm thấy hồ sơ khách hàng', 'CUSTOMER_NOT_FOUND');
  }

  const appointment = await reviewRepository.findAppointmentById(appointmentId);
  if (!appointment) {
    throw new ApiError(404, 'Không tìm thấy lịch hẹn', 'APPOINTMENT_NOT_FOUND');
  }
  if (Number(appointment.customer_id) !== Number(customerId)) {
    throw new ApiError(403, 'Lịch hẹn không thuộc về bạn', 'FORBIDDEN');
  }
  if (appointment.appointment_status !== 'COMPLETED') {
    throw new ApiError(409, 'Chỉ đánh giá được sau khi lịch hẹn đã hoàn thành', 'APPOINTMENT_NOT_COMPLETED');
  }

  const existing = await reviewRepository.findByAppointmentId(appointmentId);
  if (existing) {
    throw new ApiError(409, 'Lịch hẹn này đã được đánh giá', 'DUPLICATE_REVIEW');
  }

  let staffUserId = payload.staff_user_id ? Number(payload.staff_user_id) : null;
  if (staffUserId) {
    const assigned = await reviewRepository.isStaffAssignedToAppointment(staffUserId, appointmentId);
    if (!assigned) {
      throw new ApiError(400, 'Nhân viên không thuộc lịch hẹn này', 'STAFF_NOT_IN_APPOINTMENT');
    }
  } else {
    staffUserId = await reviewRepository.findFirstStaffByAppointmentId(appointmentId);
  }

  return reviewRepository.createReview({
    appointment_id: Number(appointmentId),
    customer_id: customerId,
    staff_user_id: staffUserId,
    rating: Number(payload.rating),
    comment: payload.comment || null,
    review_status: 'PUBLISHED',
    is_reported: false,
  });
};

// RVW-02: Xem đánh giá của 1 nhân viên (chỉ đánh giá đã công khai).
const listStaffReviews = async (staffUserId, query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20));
  const result = await reviewRepository.listStaffReviews(staffUserId, {
    rating: query.rating ? Number(query.rating) : null,
    page,
    limit,
  });
  return {
    data: result.data,
    average_rating: result.average_rating,
    total_reviews: result.total_reviews,
    pagination: { page, limit, total: result.total, total_pages: Math.ceil(result.total / limit) },
  };
};

export {
  createReview,
  listStaffReviews,
};
