// Repository đánh giá dịch vụ (RVW-01/02) — theo schema Animora v1.5 mới.
// expert_reviews -> service_reviews; booking_id -> appointment_id;
// expert_id -> staff_user_id (users.user_id).
// Đã BỎ HẲN: updateExpertRating — staff_profiles không còn cột
// rating/rating_count; thống kê tính bằng AVG/COUNT lúc đọc (D3(a)).
// Tên khách lấy qua customers -> users (service_reviews.customer_id
// trỏ vào customers, không phải users).
import { AppDataSource } from '../config/data-source.js';
import { ReviewEntity } from '../entities/review.entity.js';
import { ApiError } from '../utils/ApiError.js';

const getReviewRepo = (manager = null) => (manager || AppDataSource).getRepository(ReviewEntity);

const findByAppointmentId = async (appointmentId, manager = null) => {
  return getReviewRepo(manager).findOne({ where: { appointment_id: Number(appointmentId) } });
};

const createReview = async (reviewData, manager = null) => {
  const review = getReviewRepo(manager).create(reviewData);
  return getReviewRepo(manager).save(review);
};

const findAppointmentById = async (appointmentId, manager = null) => {
  const db = manager || AppDataSource;
  const rows = await db.query(`SELECT * FROM dbo.appointments WHERE appointment_id = @0`, [Number(appointmentId)]);
  return rows[0] || null;
};

// Nhân viên đầu tiên của lịch hẹn (theo sequence_order) — mặc định
// đánh giá người này nếu FE không chỉ định staff_user_id.
const findFirstStaffByAppointmentId = async (appointmentId, manager = null) => {
  const db = manager || AppDataSource;
  const rows = await db.query(
    `SELECT TOP 1 assigned_staff_user_id FROM dbo.appointment_items
     WHERE appointment_id = @0 ORDER BY sequence_order ASC`,
    [Number(appointmentId)],
  );
  return rows[0] ? Number(rows[0].assigned_staff_user_id) : null;
};

// Nhân viên có được giao lịch hẹn này không?
const isStaffAssignedToAppointment = async (staffUserId, appointmentId, manager = null) => {
  const db = manager || AppDataSource;
  const rows = await db.query(
    `SELECT COUNT(*) AS c FROM dbo.appointment_items
     WHERE appointment_id = @0 AND assigned_staff_user_id = @1`,
    [Number(appointmentId), Number(staffUserId)],
  );
  return Number(rows[0].c) > 0;
};

// Danh sách đánh giá của 1 nhân viên + thống kê tính lúc đọc (AVG/COUNT).
const listStaffReviews = async (staffUserId, { rating, page = 1, limit = 20 }) => {
  const db = AppDataSource;
  const params = [Number(staffUserId)];
  let where = `WHERE r.staff_user_id = @0 AND r.review_status = 'PUBLISHED'`;
  if (rating) {
    params.push(Number(rating));
    where += ` AND r.rating = @${params.length - 1}`;
  }
  const offset = (page - 1) * limit;

  const rows = await db.query(
    `SELECT r.*, u.full_name AS customer_name
     FROM dbo.service_reviews r
     LEFT JOIN dbo.customers c ON c.customer_id = r.customer_id
     LEFT JOIN dbo.users u ON u.user_id = c.user_id
     ${where}
     ORDER BY r.created_at DESC
     OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`,
    params,
  );

  const totalRows = await db.query(
    `SELECT COUNT(*) AS total FROM dbo.service_reviews r ${where}`,
    params,
  );
  const statsRows = await db.query(
    `SELECT AVG(CAST(r.rating AS FLOAT)) AS avg_rating, COUNT(*) AS total_reviews
     FROM dbo.service_reviews r
     WHERE r.staff_user_id = @0 AND r.review_status = 'PUBLISHED'`,
    [Number(staffUserId)],
  );
  const stats = statsRows[0];
  return {
    data: rows,
    total: Number(totalRows[0].total),
    average_rating: stats.avg_rating == null ? null : Number(stats.avg_rating.toFixed(2)),
    total_reviews: Number(stats.total_reviews),
  };
};

export {
  findByAppointmentId,
  createReview,
  findAppointmentById,
  findFirstStaffByAppointmentId,
  isStaffAssignedToAppointment,
  listStaffReviews,
};
