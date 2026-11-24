// Entity đánh giá dịch vụ, theo đúng schema Animora v1.5 mới
// (dbo.service_reviews, file Animora_v1.5__1___1.sql).
// expert_reviews (v1.6) -> service_reviews; booking_id -> appointment_id
// (UNIQUE, 1 đánh giá / 1 lịch hẹn); expert_id -> staff_user_id
// (users.user_id, có thể NULL); status approved/hidden -> PUBLISHED/HIDDEN;
// thêm trường tố cáo/kiểm duyệt: is_reported, reported_by_user_id,
// report_reason, moderated_by_user_id, moderated_at.
// KHÔNG còn cột rating/rating_count trên staff_profiles (D3(a)):
// thống kê tính bằng AVG/COUNT lúc đọc, không ghi lại (bỏ updateExpertRating).
import { EntitySchema } from 'typeorm';

const ReviewEntity = new EntitySchema({
  name: 'Review',
  tableName: 'service_reviews',
  columns: {
    review_id: { type: 'bigint', primary: true, generated: 'increment' },
    appointment_id: { type: 'bigint', nullable: false },
    customer_id: { type: 'bigint', nullable: false },
    staff_user_id: { type: 'bigint', nullable: true },
    rating: { type: 'tinyint', nullable: false }, // 1-5
    comment: { type: 'nvarchar', length: 2000, nullable: true },
    review_status: { type: 'nvarchar', length: 20, default: 'PUBLISHED' }, // PUBLISHED, HIDDEN
    is_reported: { type: 'bit', default: false },
    reported_by_user_id: { type: 'bigint', nullable: true },
    report_reason: { type: 'nvarchar', length: 1000, nullable: true },
    moderated_by_user_id: { type: 'bigint', nullable: true },
    moderated_at: { type: 'datetime2', precision: 0, nullable: true },
    created_at: { type: 'datetime2', precision: 0, createDate: true },
  },
});

export { ReviewEntity };
