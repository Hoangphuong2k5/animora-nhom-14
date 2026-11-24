import type {
  ExpertNotification,
  ExpertReview,
  HealthEntry,
  MedicalRecord,
  Prescription,
  WeightLog,
} from "@/types/expert.type";
import { buildRelativeDateTimeIso } from "./appointmentsAndShifts";

// ==========================================
// 6. SỔ SỨC KHỎE & CÂN NẶNG (HEALTH & WEIGHT)
// ==========================================
export const SEED_HEALTH_ENTRIES: HealthEntry[] = [
  {
    id: "he-01",
    petId: "pet-001",
    kind: "vaccine",
    date: "2024-03-10",
    title: "Vaccine 7 bệnh Vanguard Plus 5/L4",
    detail: "Mũi nhắc hàng năm, không phản ứng phụ",
    nextDueDate: "2025-03-10",
    authorName: "BS. Lê Huy Hoàng",
  },
  {
    id: "he-02",
    petId: "pet-001",
    kind: "deworm",
    date: "2024-08-15",
    title: "Tẩy giun định kỳ Drontal Plus",
    detail: "1 viên theo cân nặng 11.8kg",
    nextDueDate: "2024-11-15",
    authorName: "BS. Lê Huy Hoàng",
  },
  {
    id: "he-03",
    petId: "pet-001",
    kind: "illness",
    date: "2024-09-02",
    title: "Viêm da dị ứng nhẹ vùng bụng",
    detail: "Đã dùng xịt thảo mộc sát khuẩn và bổ sung Omega 3",
    authorName: "BS. Lê Huy Hoàng",
  },
  {
    id: "he-04",
    petId: "pet-001",
    kind: "service_note",
    date: "2024-10-20",
    title: "Ghi chú spa sau buổi tắm dưỡng lông",
    detail: "Lông mềm mượt, da sạch gàu, móng chân sau đã mài gọn. Bé hợp tác tốt.",
    authorName: "Phan Thị Đình Thùy",
  },
  {
    id: "he-05",
    petId: "pet-002",
    kind: "vaccine",
    date: "2024-02-18",
    title: "Vaccine 4 bệnh cho mèo Purevax",
    nextDueDate: "2025-02-18",
    authorName: "BS. Lê Huy Hoàng",
  },
];

export const SEED_WEIGHT_LOGS: WeightLog[] = [
  { petId: "pet-001", date: "2024-02-01", weightKg: 10.9 },
  { petId: "pet-001", date: "2024-04-10", weightKg: 11.2 },
  { petId: "pet-001", date: "2024-06-15", weightKg: 11.5 },
  { petId: "pet-001", date: "2024-08-20", weightKg: 11.6 },
  { petId: "pet-001", date: "2024-10-15", weightKg: 11.8 },
  { petId: "pet-002", date: "2024-05-10", weightKg: 3.8 },
  { petId: "pet-002", date: "2024-08-12", weightKg: 4.0 },
  { petId: "pet-002", date: "2024-10-25", weightKg: 4.2 },
];

export const SEED_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: "rec-001",
    petId: "pet-001",
    appointmentId: "apt-vet-007",
    expertId: "exp-vet-01",
    date: buildRelativeDateTimeIso(-14).slice(0, 10),
    symptoms: "Gãi tai dữ dội, lắc đầu liên tục, dịch nâu đọng vành tai.",
    diagnosis: "Viêm ống tai ngoài cấp tính do nấm men Malassezia",
    severity: "mild",
    weightKg: 11.8,
    temperatureC: 38.6,
    note: "Vệ sinh tai bằng dung dịch chuyên dụng trước khi nhỏ thuốc.",
    revisitDate: buildRelativeDateTimeIso(0).slice(0, 10),
    prescriptionId: "rx-001",
  },
];

// ==========================================
// 7. ĐƠN THUỐC [BÁC SĨ] (PRESCRIPTIONS)
// ==========================================
export const SEED_PRESCRIPTIONS: Prescription[] = [
  {
    id: "rx-001",
    code: "RX-2024-0988",
    expertId: "exp-vet-01",
    petId: "pet-001",
    ownerId: "own-001",
    appointmentId: "apt-vet-007",
    medicalRecordId: "rec-001",
    issuedAt: buildRelativeDateTimeIso(-14).slice(0, 10),
    diagnosis: "Viêm ống tai ngoài cấp tính do Malassezia",
    severity: "mild",
    lines: [
      {
        medicineId: "med-005",
        dosage: "Nhỏ 4 giọt vào mỗi tai",
        days: 10,
        instruction: "Nhỏ 2 lần/ngày sau khi vệ sinh tai sạch và khô ráo.",
      },
      {
        medicineId: "med-002",
        dosage: "0.8ml hỗn dịch uống",
        days: 5,
        instruction: "Uống 1 lần/ngày sau bữa ăn sáng để giảm đau sưng.",
      },
    ],
    refillsAllowed: 2,
    refillsUsed: 1,
    refillLog: [
      {
        at: buildRelativeDateTimeIso(-4, "15:30"),
        orderCode: "ORD-RX-7712",
        amount: 530000,
      },
    ],
    note: "Nếu sau 10 ngày tai còn đỏ hoặc có dịch hôi cần đưa bé tái khám ngay.",
  },
  {
    id: "rx-002",
    code: "RX-2024-1015",
    expertId: "exp-vet-01",
    petId: "pet-005",
    ownerId: "own-005",
    issuedAt: buildRelativeDateTimeIso(-30).slice(0, 10),
    diagnosis: "Nhiễm khuẩn hô hấp trên diện rộng",
    severity: "severe",
    lines: [
      {
        medicineId: "med-001",
        dosage: "1.5 viên",
        days: 14,
        instruction: "Uống 2 lần/ngày cách 12 tiếng sau khi ăn.",
      },
    ],
    refillsAllowed: 0,
    refillsUsed: 0,
    refillLog: [],
    note: "Bệnh nặng, tuyệt đối không tự ý mua lại mà phải được bác sĩ khám lại trực tiếp.",
  },
  {
    id: "rx-003",
    code: "RX-2024-1044",
    expertId: "exp-vet-01",
    petId: "pet-002",
    ownerId: "own-002",
    issuedAt: buildRelativeDateTimeIso(-20).slice(0, 10),
    diagnosis: "Rối loạn hệ vi sinh đường ruột sau đổi thức ăn",
    severity: "mild",
    lines: [
      {
        medicineId: "med-010",
        dosage: "2ml dạng paste",
        days: 7,
        instruction: "Bơm trực tiếp vào miệng hoặc trộn cùng pate 2 lần/ngày.",
      },
    ],
    refillsAllowed: 1,
    refillsUsed: 1,
    refillLog: [
      {
        at: buildRelativeDateTimeIso(-7, "09:40"),
        orderCode: "ORD-RX-8841",
        amount: 285000,
      },
    ],
    note: "Đã dùng hết 1 lượt mua lại. Cần đặt lịch kiểm tra lại nếu tiêu hóa chưa ổn định hoàn toàn.",
  },
];

// ==========================================
// 8. ĐÁNH GIÁ (REVIEWS)
// ==========================================
export const SEED_REVIEWS: ExpertReview[] = [
  {
    id: "rev-01",
    expertId: "exp-vet-01",
    appointmentId: "apt-vet-007",
    ownerId: "own-001",
    serviceId: "srv-vet-02",
    rating: 5,
    comment: "Bác sĩ Hoàng cực kỳ ân cần, giải thích kỹ nguyên nhân nấm tai của bé Corgi. Nhỏ thuốc 3 ngày bé đã hết gãi!",
    createdAt: buildRelativeDateTimeIso(-10),
  },
  {
    id: "rev-02",
    expertId: "exp-vet-01",
    appointmentId: "apt-vet-006",
    ownerId: "own-002",
    serviceId: "srv-vet-01",
    rating: 5,
    comment: "Phòng khám sạch sẽ, bác sĩ tư vấn dinh dưỡng chi tiết giúp mèo nhà mình không bị thừa cân nữa.",
    createdAt: buildRelativeDateTimeIso(-5),
  },
  {
    id: "rev-03",
    expertId: "exp-vet-01",
    appointmentId: "apt-vet-003",
    ownerId: "own-005",
    serviceId: "srv-vet-03",
    rating: 4,
    comment: "Bác sĩ tiêm nhanh, bé không khóc tiếng nào. Chờ hơi lâu 1 chút vào cuối tuần.",
    createdAt: buildRelativeDateTimeIso(-2),
  },
  {
    id: "rev-04",
    expertId: "exp-spa-01",
    appointmentId: "apt-spa-004",
    ownerId: "own-003",
    serviceId: "srv-spa-02",
    rating: 5,
    comment: "Chị Thùy cắt mặt tròn Teddy cho bé Poodle nhà mình siêu xinh, thơm phức suốt cả tuần!",
    createdAt: buildRelativeDateTimeIso(-3),
  },
  {
    id: "rev-05",
    expertId: "exp-spa-02",
    appointmentId: "apt-pt-001",
    ownerId: "own-005",
    serviceId: "srv-spa-01",
    rating: 5,
    comment: "Anh Tuấn Anh tắm thảo mộc cho bé Golden rất chu đáo, cập nhật tình trạng rõ ràng!",
    createdAt: buildRelativeDateTimeIso(-1),
  },
];

// ==========================================
// 9. THÔNG BÁO (NOTIFICATIONS)
// ==========================================
export const SEED_NOTIFICATIONS: ExpertNotification[] = [
  {
    id: "notif-01",
    expertId: "exp-vet-01",
    type: "new_booking",
    title: { vi: "Lịch hẹn mới cần xác nhận", en: "New Booking Pending" },
    body: { vi: "Khách Vũ Bích Ngọc vừa đặt khám sức khỏe cho bé Chibi vào ngày mai.", en: "Vu Bich Ngoc booked an exam for Chibi tomorrow." },
    at: "10 phút trước",
    unread: true,
    href: "/expert/appointments",
  },
  {
    id: "notif-02",
    expertId: "exp-vet-01",
    type: "booking_changed",
    title: { vi: "Yêu cầu đổi giờ hẹn từ khách", en: "Reschedule Request" },
    body: { vi: "Khách Trần Anh Tuấn xin dời lịch bé Rocky sang 15:30 cùng ngày.", en: "Tran Anh Tuan requested moving Rocky's appointment to 15:30." },
    at: "45 phút trước",
    unread: true,
    href: "/expert/appointments",
  },
  {
    id: "notif-03",
    expertId: "exp-vet-01",
    type: "shift_result",
    title: { vi: "Đã duyệt đơn xin nghỉ phép", en: "Leave Request Approved" },
    body: { vi: "Manager đã phê duyệt đơn xin nghỉ phép ngày hành chính của bạn.", en: "Manager approved your leave request." },
    at: "3 giờ trước",
    unread: false,
    href: "/expert/schedule",
  },
  {
    id: "notif-04",
    expertId: "exp-vet-01",
    type: "new_review",
    title: { vi: "Đánh giá 5 sao mới", en: "New 5-Star Review" },
    body: { vi: "Khách Trần Anh Tuấn vừa gửi nhận xét khen ngợi ca khám nấm tai.", en: "Customer Tran Anh Tuan left a compliment for the ear exam." },
    at: "1 ngày trước",
    unread: false,
    href: "/expert/reviews",
  },
  {
    id: "notif-spa-01",
    expertId: "exp-spa-01",
    type: "new_booking",
    title: { vi: "Lịch hẹn Spa mới cần tiếp nhận", en: "New Spa Booking" },
    body: { vi: "Khách Trần Anh Tuấn vừa đặt vệ sinh toàn diện cho bé Bơ vào ngày mai.", en: "Tran Anh Tuan booked Full Hygiene for Bo tomorrow." },
    at: "20 phút trước",
    unread: true,
    href: "/expert/appointments",
  },
  {
    id: "notif-pt-01",
    expertId: "exp-spa-02",
    type: "new_booking",
    title: { vi: "Lịch hẹn Spa mới được gán", en: "New Spa Booking Assigned" },
    body: { vi: "Khách Trần Anh Tuấn vừa đặt Gói Spa Tắm & Dưỡng Thảo Mộc cho bé Rocky.", en: "Tran Anh Tuan booked Herbal Bath & Spa for Rocky." },
    at: "2 giờ trước",
    unread: true,
    href: "/expert/appointments",
  },
];

