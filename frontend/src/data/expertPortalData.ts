import {
  ExpertProfile,
  ExpertPetOwner,
  ExpertPet,
  ExpertServiceDef,
  ExpertAppointment,
  ExpertShift,
  ShiftRequest,
  HealthEntry,
  WeightLog,
  MedicalRecord,
  Prescription,
  ExpertReview,
  PayrollMonth,
  ExpertNotification,
  ExpertStoreState,
  ExpertType,
} from "@/types/expert.type";

// ==========================================
// 1. CHUYÊN VIÊN & BÁC SĨ (EXPERTS)
// ==========================================
export function stripExpertPrefix(rawName: string): string {
  if (!rawName) return "";
  return rawName
    .trim()
    .replace(/^(BS\.|BS|Dr\.|Chuyên viên|CV\.|HLV|Specialist|Trainer)\s+/i, "")
    .trim();
}

export function getExpertHonorificPrefix(
  expertType: ExpertType,
  lang: "vi" | "en" = "vi"
): string {
  if (expertType === "vet") return lang === "en" ? "Dr." : "BS.";
  if (expertType === "trainer") return lang === "en" ? "Trainer" : "HLV";
  return lang === "en" ? "Specialist" : "Chuyên viên";
}

export function formatExpertDisplayName(
  rawName: string,
  expertType: ExpertType,
  lang: "vi" | "en" = "vi"
): string {
  const pure = stripExpertPrefix(rawName);
  const prefix = getExpertHonorificPrefix(expertType, lang);
  if (!pure) return prefix;
  return `${prefix} ${pure}`;
}

export const SEED_EXPERTS: Record<string, ExpertProfile> = {
  "exp-vet-01": {
    id: "exp-vet-01",
    fullName: "BS. Lê Minh Khoa",
    email: "vet@animora.vn",
    phone: "0912 345 678",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80",
    expertType: "vet",
    specialties: ["Khám lâm sàng nội khoa", "Phẫu thuật mô mềm", "Tiêm chủng và da liễu"],
    certificates: [
      {
        id: "c-01",
        name: "Bác sĩ thú y chính quy",
        issuer: "Đại học Nông Lâm TP.HCM",
        year: 2018,
        status: "approved",
        scanUrl:
          "https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "c-02",
        name: "Chứng chỉ phẫu thuật ngoại khoa thú nhỏ",
        issuer: "Chi cục Thú y VSP",
        year: 2021,
        status: "approved",
        scanUrl:
          "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "c-04",
        name: "Chứng chỉ siêu âm chẩn đoán hình ảnh thú cưng",
        issuer: "Hội Thú y Nhỏ Thế giới WSAVA",
        year: 2024,
        status: "pending",
        scanUrl:
          "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "c-05",
        name: "Chứng nhận gây mê hồi sức thú nhỏ nâng cao",
        issuer: "Viện Đào tạo Thú y Lâm sàng Sài Gòn",
        year: 2023,
        status: "rejected",
        rejectReason:
          "Ảnh bản scan bị mờ góc dấu mộc đỏ và số hiệu chứng nhận, vui lòng tải lại bản chụp rõ nét.",
        scanUrl:
          "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80",
      },
    ],
    licenseNumber: "CCHN-TY-79-002488",
    licenseVerified: true,
    yearsOfExperience: 8,
    bio: "Chuyên sâu khám lâm sàng nội khoa, phẫu thuật mô mềm và chăm sóc da liễu thú cưng tại TP.HCM. Tận tâm, chu đáo và luôn đặt sự an tâm của thú cưng lên hàng đầu.",
    joinedAt: "2023-03-15",
    baseSalary: 18000000,
    commissionRate: 0.15,
  },
  "exp-spa-01": {
    id: "exp-spa-01",
    fullName: "Nguyễn Thu Hà",
    email: "spa@animora.vn",
    phone: "0938 765 432",
    avatar: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=300&auto=format&fit=crop&q=80",
    expertType: "groomer",
    specialties: ["Cắt tỉa tạo kiểu Poodle", "Spa dưỡng lông thảo mộc", "Vệ sinh tai móng"],
    certificates: [
      {
        id: "c-03",
        name: "Chứng chỉ cắt tỉa thú cưng chuyên nghiệp hạng A",
        issuer: "Hiệp hội cắt tỉa quốc tế ISCC",
        year: 2020,
        status: "approved",
        scanUrl:
          "https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=800&auto=format&fit=crop&q=80",
      },
      {
        id: "c-06",
        name: "Chứng nhận chăm sóc da lông thảo dược Hàn Quốc",
        issuer: "Học viện Grooming KKF Seoul",
        year: 2024,
        status: "pending",
        scanUrl:
          "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&auto=format&fit=crop&q=80",
      },
    ],
    yearsOfExperience: 6,
    bio: "Nghệ nhân cắt tỉa thú cưng chuyên sâu cho các bé Poodle, Pomeranian, Corgi. Phong cách chăm sóc ân cần, nhẹ nhàng giúp các bé luôn cảm thấy thư giãn.",
    joinedAt: "2023-06-01",
    baseSalary: 12000000,
    commissionRate: 0.2,
  },
};

// ==========================================
// 2. KHÁCH HÀNG & THÚ CƯNG (OWNERS & PETS)
// ==========================================
export const SEED_OWNERS: ExpertPetOwner[] = [
  { id: "own-001", fullName: "Trần Anh Tuấn", phone: "0903 112 233", email: "anhtuan.tran@gmail.com" },
  { id: "own-002", fullName: "Nguyễn Thảo My", phone: "0918 334 455", email: "thaomy.nguyen@gmail.com" },
  { id: "own-003", fullName: "Lê Hoàng Long", phone: "0932 778 899", email: "hoanglong.le@gmail.com" },
  { id: "own-004", fullName: "Vũ Bích Ngọc", phone: "0987 654 321", email: "bichngoc.vu@gmail.com" },
  { id: "own-005", fullName: "Phạm Hải Đăng", phone: "0971 223 344", email: "haidang.pham@gmail.com" },
  { id: "own-006", fullName: "Đỗ Mai Khanh", phone: "0944 556 677", email: "maikhanh.do@gmail.com" },
];

export const SEED_PETS: ExpertPet[] = [
  {
    id: "pet-001",
    name: "Bơ",
    species: "dog",
    breed: "Corgi Pembroke",
    gender: "male",
    birthDate: "2022-04-10",
    weightKg: 11.8,
    photo: "https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=400&auto=format&fit=crop&q=80",
    ownerId: "own-001",
    ownerNote: "Bé hơi sợ máy sấy kêu to, cần vỗ về nhẹ nhàng",
    allergies: "Dị ứng phấn hoa nhẹ",
  },
  {
    id: "pet-002",
    name: "Miu Miu",
    species: "cat",
    breed: "Mèo Anh lông ngắn (BSH)",
    gender: "female",
    birthDate: "2023-01-15",
    weightKg: 4.2,
    photo: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop&q=80",
    ownerId: "own-002",
    ownerNote: "Rất ngoan khi khám tai, nhưng ghét bị đè ngửa",
  },
  {
    id: "pet-003",
    name: "Kẹo Kéo",
    species: "dog",
    breed: "Poodle Tiny",
    gender: "female",
    birthDate: "2021-11-20",
    weightKg: 3.5,
    photo: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&auto=format&fit=crop&q=80",
    ownerId: "own-003",
    ownerNote: "Cắt kiểu mặt gấu Teddy tròn",
  },
  {
    id: "pet-004",
    name: "Chibi",
    species: "rabbit",
    breed: "Thỏ Minilop",
    gender: "male",
    birthDate: "2023-07-05",
    weightKg: 1.6,
    photo: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&auto=format&fit=crop&q=80",
    ownerId: "own-004",
    ownerNote: "Rất nhạy cảm với nhiệt độ cao",
  },
  {
    id: "pet-005",
    name: "Bắp",
    species: "dog",
    breed: "Golden Retriever",
    gender: "male",
    birthDate: "2020-09-02",
    weightKg: 29.5,
    photo: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&auto=format&fit=crop&q=80",
    ownerId: "own-005",
    ownerNote: "Thân thiện nhưng hay nhảy chồm mừng rỡ",
  },
  {
    id: "pet-006",
    name: "Lili",
    species: "cat",
    breed: "Mèo Ba Tư trắng",
    gender: "female",
    birthDate: "2022-08-12",
    weightKg: 3.9,
    photo: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&auto=format&fit=crop&q=80",
    ownerId: "own-006",
    ownerNote: "Cần lau nước mắt thường xuyên",
  },
  {
    id: "pet-007",
    name: "Rocky",
    species: "dog",
    breed: "Phốc Sóc (Pomeranian)",
    gender: "male",
    birthDate: "2022-12-01",
    weightKg: 2.8,
    photo: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&auto=format&fit=crop&q=80",
    ownerId: "own-001",
    ownerNote: "Hay sủa khi gặp người lạ 2 phút đầu",
  },
  {
    id: "pet-008",
    name: "Bánh Bao",
    species: "cat",
    breed: "Mèo Ragdoll",
    gender: "male",
    birthDate: "2023-03-25",
    weightKg: 5.1,
    photo: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&auto=format&fit=crop&q=80",
    ownerId: "own-002",
    ownerNote: "Rất bện hơi người, thích ôm",
  },
];

// ==========================================
// 3. DỊCH VỤ (SERVICES)
// ==========================================
export const SEED_SERVICES: ExpertServiceDef[] = [
  {
    id: "srv-vet-01",
    name: { vi: "Khám sức khỏe tổng quát định kỳ", en: "General Veterinary Wellness Exam" },
    durationMin: 45,
    price: 250000,
    medical: true,
    expertTypes: ["vet"],
  },
  {
    id: "srv-vet-02",
    name: { vi: "Khám chuyên sâu da liễu & soi tai", en: "Dermatology & Ear Canal Exam" },
    durationMin: 60,
    price: 350000,
    medical: true,
    expertTypes: ["vet"],
  },
  {
    id: "srv-vet-03",
    name: { vi: "Tiêm chủng vaccine 7 bệnh & dại", en: "Core Vaccination 7-in-1 & Rabies" },
    durationMin: 30,
    price: 320000,
    medical: true,
    expertTypes: ["vet"],
  },
  {
    id: "srv-vet-04",
    name: { vi: "Siêu âm & Xét nghiệm máu cơ bản", en: "Basic Bloodwork & Ultrasound" },
    durationMin: 60,
    price: 650000,
    medical: true,
    expertTypes: ["vet"],
  },
  {
    id: "srv-spa-01",
    name: { vi: "Gói Spa Tắm & Dưỡng Thảo Mộc (5 bước)", en: "Herbal Bath & Spa (5-Step)" },
    durationMin: 60,
    price: 280000,
    medical: false,
    expertTypes: ["groomer"],
  },
  {
    id: "srv-spa-02",
    name: { vi: "Cắt tỉa tạo kiểu phong cách Hàn Quốc", en: "Styling & Grooming Korean Style" },
    durationMin: 90,
    price: 450000,
    medical: false,
    expertTypes: ["groomer"],
  },
  {
    id: "srv-spa-03",
    name: { vi: "Vệ sinh toàn diện: móng, tai, vắt tuyến hôi", en: "Full Hygiene Grooming" },
    durationMin: 40,
    price: 180000,
    medical: false,
    expertTypes: ["groomer"],
  },
];

// ==========================================
// 4. LỊCH HẸN (APPOINTMENTS)
// ==========================================
// Sử dụng helper để tạo giờ địa phương linh hoạt quanh ngày hôm nay
const getTodayStr = (offsetDays = 0, timeStr = "09:00"): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${timeStr}`;
};

export const SEED_APPOINTMENTS: ExpertAppointment[] = [
  // --- BÁC SĨ (exp-vet-01) ---
  // Ca đang diễn ra hôm nay (in_progress)
  {
    id: "apt-vet-001",
    code: "ANM-VET-0912",
    expertId: "exp-vet-01",
    petId: "pet-001",
    ownerId: "own-001",
    serviceId: "srv-vet-02",
    startAt: getTodayStr(0, "09:30"),
    status: "in_progress",
    paymentTiming: "prepaid",
    paymentState: "paid",
    customerNote: "Bé gãi tai liên tục 3 ngày nay, tai trong có mùi hôi.",
    createdAt: getTodayStr(-2, "14:10"),
    startedAt: getTodayStr(0, "09:35"),
    history: [
      { at: getTodayStr(-2, "14:10"), status: "pending", note: { vi: "Khách đặt lịch qua website", en: "Booked online" } },
      { at: getTodayStr(-1, "08:30"), status: "upcoming", note: { vi: "Bác sĩ xác nhận lịch hẹn", en: "Doctor confirmed" } },
      { at: getTodayStr(0, "09:35"), status: "in_progress", note: { vi: "Bác sĩ bắt đầu thăm khám lâm sàng", en: "Doctor started exam" } },
    ],
  },
  // Ca sắp tới hôm nay (upcoming)
  {
    id: "apt-vet-002",
    code: "ANM-VET-0913",
    expertId: "exp-vet-01",
    petId: "pet-002",
    ownerId: "own-002",
    serviceId: "srv-vet-01",
    startAt: getTodayStr(0, "11:00"),
    status: "upcoming",
    paymentTiming: "postpaid",
    paymentState: "unpaid",
    customerNote: "Khám sức khỏe định kỳ 6 tháng + tư vấn cân nặng.",
    createdAt: getTodayStr(-1, "18:20"),
    history: [
      { at: getTodayStr(-1, "18:20"), status: "pending", note: { vi: "Khách đặt lịch", en: "Booked" } },
      { at: getTodayStr(-1, "19:00"), status: "upcoming", note: { vi: "Đã xác nhận", en: "Confirmed" } },
    ],
  },
  // Ca chiều nay (upcoming)
  {
    id: "apt-vet-003",
    code: "ANM-VET-0914",
    expertId: "exp-vet-01",
    petId: "pet-005",
    ownerId: "own-005",
    serviceId: "srv-vet-03",
    startAt: getTodayStr(0, "14:30"),
    status: "upcoming",
    paymentTiming: "prepaid",
    paymentState: "paid",
    customerNote: "Tiêm nhắc dại định kỳ hàng năm.",
    createdAt: getTodayStr(-3, "10:15"),
    history: [
      { at: getTodayStr(-3, "10:15"), status: "pending", note: { vi: "Khách đặt lịch", en: "Booked" } },
      { at: getTodayStr(-3, "11:00"), status: "upcoming", note: { vi: "Đã xác nhận", en: "Confirmed" } },
    ],
  },
  // Lịch mới chờ xác nhận (pending)
  {
    id: "apt-vet-004",
    code: "ANM-VET-0915",
    expertId: "exp-vet-01",
    petId: "pet-004",
    ownerId: "own-004",
    serviceId: "srv-vet-01",
    startAt: getTodayStr(1, "10:00"),
    status: "pending",
    paymentTiming: "postpaid",
    paymentState: "unpaid",
    customerNote: "Bé thỏ ăn ít, bụng hơi trướng.",
    createdAt: getTodayStr(0, "08:10"),
    history: [
      { at: getTodayStr(0, "08:10"), status: "pending", note: { vi: "Chờ bác sĩ tiếp nhận", en: "Awaiting doctor acceptance" } },
    ],
  },
  // Yêu cầu đổi lịch từ khách (rescheduleRequest)
  {
    id: "apt-vet-005",
    code: "ANM-VET-0916",
    expertId: "exp-vet-01",
    petId: "pet-007",
    ownerId: "own-001",
    serviceId: "srv-vet-01",
    startAt: getTodayStr(2, "09:00"),
    status: "upcoming",
    paymentTiming: "prepaid",
    paymentState: "paid",
    rescheduleRequest: {
      requestedStartAt: getTodayStr(2, "15:30"),
      reason: "Em bận họp đột xuất buổi sáng, xin chuyển sang chiều cùng ngày ạ.",
    },
    customerNote: "Tái khám kiểm tra da.",
    createdAt: getTodayStr(-2, "09:00"),
    history: [
      { at: getTodayStr(-2, "09:00"), status: "upcoming", note: { vi: "Lịch hẹn ban đầu", en: "Initial booking" } },
      { at: getTodayStr(0, "07:30"), status: "reschedule_requested", note: { vi: "Khách xin đổi sang 15:30", en: "Customer requested 15:30" } },
    ],
  },
  // Ca hoàn thành chưa ghi kết quả (completed nhưng thiếu medicalRecordId)
  {
    id: "apt-vet-006",
    code: "ANM-VET-0909",
    expertId: "exp-vet-01",
    petId: "pet-008",
    ownerId: "own-002",
    serviceId: "srv-vet-01",
    startAt: getTodayStr(-1, "16:00"),
    status: "completed",
    paymentTiming: "prepaid",
    paymentState: "paid",
    startedAt: getTodayStr(-1, "16:05"),
    completedAt: getTodayStr(-1, "16:50"),
    completionNote: "Đã khám lâm sàng, nghi ngờ rối loạn tiêu hóa nhẹ. Chưa hoàn tất ghi bệnh án và đơn thuốc.",
    createdAt: getTodayStr(-4, "11:00"),
    history: [
      { at: getTodayStr(-4, "11:00"), status: "pending", note: { vi: "Đặt lịch", en: "Booked" } },
      { at: getTodayStr(-1, "16:50"), status: "completed", note: { vi: "Hoàn thành ca khám", en: "Exam finished" } },
    ],
  },
  // Ca hoàn thành đầy đủ trong quá khứ
  {
    id: "apt-vet-007",
    code: "ANM-VET-0888",
    expertId: "exp-vet-01",
    petId: "pet-001",
    ownerId: "own-001",
    serviceId: "srv-vet-02",
    startAt: getTodayStr(-14, "10:00"),
    status: "completed",
    paymentTiming: "prepaid",
    paymentState: "paid",
    startedAt: getTodayStr(-14, "10:02"),
    completedAt: getTodayStr(-14, "10:55"),
    completionNote: "Viêm tai ngoài do nấm men Malassezia. Đã kê đơn Dexoryl nhỏ tai 10 ngày.",
    petConditionAfter: "Bé thoải mái, hết ngứa cấp.",
    medicalRecordId: "rec-001",
    prescriptionId: "rx-001",
    createdAt: getTodayStr(-16, "15:00"),
    history: [
      { at: getTodayStr(-14, "10:55"), status: "completed", note: { vi: "Khám & kê đơn hoàn tất", en: "Exam & prescription completed" } },
    ],
  },
  // Ca đã hủy (<3h bị phạt 50%)
  {
    id: "apt-vet-008",
    code: "ANM-VET-0895",
    expertId: "exp-vet-01",
    petId: "pet-005",
    ownerId: "own-005",
    serviceId: "srv-vet-01",
    startAt: getTodayStr(-3, "14:00"),
    status: "cancelled",
    paymentTiming: "prepaid",
    paymentState: "partial_fee",
    cancelledAt: getTodayStr(-3, "12:30"), // Hủy trước 1.5 giờ (<3h)
    cancelledBy: "customer",
    cancelReason: "Khách bận đột xuất, thông báo trước giờ hẹn 1.5 giờ.",
    createdAt: getTodayStr(-5, "10:00"),
    history: [
      { at: getTodayStr(-3, "12:30"), status: "cancelled", note: { vi: "Khách hủy lịch dưới 3 giờ (tính phí 50%)", en: "Cancelled <3h (50% fee)" } },
    ],
  },

  // --- CHUYÊN VIÊN SPA (exp-spa-01) ---
  {
    id: "apt-spa-001",
    code: "ANM-SPA-1021",
    expertId: "exp-spa-01",
    petId: "pet-003",
    ownerId: "own-003",
    serviceId: "srv-spa-02",
    startAt: getTodayStr(0, "10:00"),
    status: "in_progress",
    paymentTiming: "prepaid",
    paymentState: "paid",
    customerNote: "Tỉa gọn mặt tròn Teddy, giữ lông đuôi bông.",
    createdAt: getTodayStr(-1, "12:00"),
    startedAt: getTodayStr(0, "10:05"),
    history: [
      { at: getTodayStr(0, "10:05"), status: "in_progress", note: { vi: "Bắt đầu tắm & tạo kiểu", en: "Started bath & styling" } },
    ],
  },
  {
    id: "apt-spa-002",
    code: "ANM-SPA-1022",
    expertId: "exp-spa-01",
    petId: "pet-006",
    ownerId: "own-006",
    serviceId: "srv-spa-01",
    startAt: getTodayStr(0, "14:00"),
    status: "upcoming",
    paymentTiming: "postpaid",
    paymentState: "unpaid",
    customerNote: "Mèo lông dài, chải gỡ rối kỹ vùng nách.",
    createdAt: getTodayStr(-2, "16:00"),
    history: [{ at: getTodayStr(-2, "16:00"), status: "upcoming", note: { vi: "Đã xác nhận", en: "Confirmed" } }],
  },
  {
    id: "apt-spa-003",
    code: "ANM-SPA-1023",
    expertId: "exp-spa-01",
    petId: "pet-001",
    ownerId: "own-001",
    serviceId: "srv-spa-03",
    startAt: getTodayStr(1, "11:00"),
    status: "pending",
    paymentTiming: "prepaid",
    paymentState: "paid",
    customerNote: "Cắt mài móng chân sau cẩn thận.",
    createdAt: getTodayStr(0, "08:30"),
    history: [{ at: getTodayStr(0, "08:30"), status: "pending", note: { vi: "Chờ xác nhận", en: "Pending" } }],
  },
];

// ==========================================
// 5. CA LÀM VIỆC & XIN NGHỈ (SCHEDULE)
// ==========================================
export const SEED_SHIFTS: ExpertShift[] = [
  { id: "sh-01", expertId: "exp-vet-01", date: getTodayStr(-1).slice(0, 10), shift: "morning" },
  { id: "sh-02", expertId: "exp-vet-01", date: getTodayStr(0).slice(0, 10), shift: "morning" },
  { id: "sh-03", expertId: "exp-vet-01", date: getTodayStr(0).slice(0, 10), shift: "afternoon" },
  { id: "sh-04", expertId: "exp-vet-01", date: getTodayStr(1).slice(0, 10), shift: "morning" },
  { id: "sh-05", expertId: "exp-vet-01", date: getTodayStr(2).slice(0, 10), shift: "morning" },
  { id: "sh-06", expertId: "exp-vet-01", date: getTodayStr(3).slice(0, 10), shift: "afternoon" },
  { id: "sh-07", expertId: "exp-spa-01", date: getTodayStr(0).slice(0, 10), shift: "morning" },
  { id: "sh-08", expertId: "exp-spa-01", date: getTodayStr(0).slice(0, 10), shift: "afternoon" },
];

export const SEED_SHIFT_REQUESTS: ShiftRequest[] = [
  {
    id: "req-01",
    expertId: "exp-vet-01",
    kind: "leave",
    date: getTodayStr(5).slice(0, 10),
    shift: "morning",
    reason: "Đi hội thảo Da liễu Thú y Toàn quốc tại Hà Nội.",
    status: "pending",
    createdAt: getTodayStr(-1, "09:00"),
  },
  {
    id: "req-02",
    expertId: "exp-vet-01",
    kind: "shift",
    date: getTodayStr(6).slice(0, 10),
    shift: "evening",
    reason: "Đăng ký tăng ca trực cấp cứu tối thứ Bảy.",
    status: "approved",
    createdAt: getTodayStr(-3, "11:20"),
    adminNote: "Đã duyệt, trực cùng BS. Tuấn.",
  },
];

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
    authorName: "BS. Lê Minh Khoa",
  },
  {
    id: "he-02",
    petId: "pet-001",
    kind: "deworm",
    date: "2024-08-15",
    title: "Tẩy giun định kỳ Drontal Plus",
    detail: "1 viên theo cân nặng 11.8kg",
    nextDueDate: "2024-11-15",
    authorName: "BS. Lê Minh Khoa",
  },
  {
    id: "he-03",
    petId: "pet-001",
    kind: "illness",
    date: "2024-09-02",
    title: "Viêm da dị ứng nhẹ vùng bụng",
    detail: "Đã dùng xịt thảo mộc sát khuẩn và bổ sung Omega 3",
    authorName: "BS. Lê Minh Khoa",
  },
  {
    id: "he-04",
    petId: "pet-001",
    kind: "service_note",
    date: "2024-10-20",
    title: "Ghi chú spa sau buổi tắm dưỡng lông",
    detail: "Lông mềm mượt, da sạch gàu, móng chân sau đã mài gọn. Bé hợp tác tốt.",
    authorName: "Nguyễn Thu Hà",
  },
  {
    id: "he-05",
    petId: "pet-002",
    kind: "vaccine",
    date: "2024-02-18",
    title: "Vaccine 4 bệnh cho mèo Purevax",
    nextDueDate: "2025-02-18",
    authorName: "BS. Lê Minh Khoa",
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
    date: getTodayStr(-14).slice(0, 10),
    symptoms: "Gãi tai dữ dội, lắc đầu liên tục, dịch nâu đọng vành tai.",
    diagnosis: "Viêm ống tai ngoài cấp tính do nấm men Malassezia",
    severity: "mild",
    weightKg: 11.8,
    temperatureC: 38.6,
    note: "Vệ sinh tai bằng dung dịch chuyên dụng trước khi nhỏ thuốc.",
    revisitDate: getTodayStr(0).slice(0, 10),
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
    issuedAt: getTodayStr(-14).slice(0, 10),
    diagnosis: "Viêm ống tai ngoài cấp tính do Malassezia",
    severity: "mild", // Bệnh nhẹ: cho phép mua lại
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
    refillsUsed: 1, // Đã mua lại 1 lần
    refillLog: [
      {
        at: getTodayStr(-4, "15:30"),
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
    issuedAt: getTodayStr(-30).slice(0, 10),
    diagnosis: "Nhiễm khuẩn hô hấp trên diện rộng",
    severity: "severe", // Bệnh nặng: không cho mua lại!
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
    issuedAt: getTodayStr(-20).slice(0, 10),
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
    refillsUsed: 1, // Đã hết lượt mua lại!
    refillLog: [
      {
        at: getTodayStr(-7, "09:40"),
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
    comment: "Bác sĩ Khoa cực kỳ ân cần, giải thích kỹ nguyên nhân nấm tai của bé Corgi. Nhỏ thuốc 3 ngày bé đã hết gãi!",
    createdAt: getTodayStr(-10),
  },
  {
    id: "rev-02",
    expertId: "exp-vet-01",
    appointmentId: "apt-vet-006",
    ownerId: "own-002",
    serviceId: "srv-vet-01",
    rating: 5,
    comment: "Phòng khám sạch sẽ, bác sĩ tư vấn dinh dưỡng chi tiết giúp mèo nhà mình không bị thừa cân nữa.",
    createdAt: getTodayStr(-5),
  },
  {
    id: "rev-03",
    expertId: "exp-vet-01",
    appointmentId: "apt-vet-003",
    ownerId: "own-005",
    serviceId: "srv-vet-03",
    rating: 4,
    comment: "Bác sĩ tiêm nhanh, bé không khóc tiếng nào. Chờ hơi lâu 1 chút vào cuối tuần.",
    createdAt: getTodayStr(-2),
  },
  {
    id: "rev-04",
    expertId: "exp-spa-01",
    appointmentId: "apt-spa-001",
    ownerId: "own-003",
    serviceId: "srv-spa-02",
    rating: 5,
    comment: "Chị Hà cắt mặt tròn Teddy cho bé Poodle nhà mình siêu xinh, thơm phức suốt cả tuần!",
    createdAt: getTodayStr(-3),
  },
];

// ==========================================
// 9. THU NHẬP & BẢNG LƯƠNG (PAYROLL)
// ==========================================
export const SEED_PAYROLL_MONTHS: PayrollMonth[] = [
  {
    expertId: "exp-vet-01",
    month: "2024-07",
    baseSalary: 18000000,
    commission: 6200000,
    ratingBonus: 1000000,
    deductions: 500000,
    status: "paid",
    paidAt: "2024-08-05",
    completedBookings: 58,
    avgRating: 4.9,
  },
  {
    expertId: "exp-vet-01",
    month: "2024-08",
    baseSalary: 18000000,
    commission: 7450000,
    ratingBonus: 1200000,
    deductions: 0,
    status: "paid",
    paidAt: "2024-09-05",
    completedBookings: 64,
    avgRating: 5.0,
  },
  {
    expertId: "exp-vet-01",
    month: "2024-09",
    baseSalary: 18000000,
    commission: 8100000,
    ratingBonus: 1500000,
    deductions: 0,
    status: "paid",
    paidAt: "2024-10-05",
    completedBookings: 71,
    avgRating: 4.95,
  },
  {
    expertId: "exp-vet-01",
    month: "2024-10",
    baseSalary: 18000000,
    commission: 8900000,
    ratingBonus: 1500000,
    deductions: 0,
    status: "paid",
    paidAt: "2024-11-05",
    completedBookings: 79,
    avgRating: 4.92,
  },
  {
    expertId: "exp-vet-01",
    month: "2024-11",
    baseSalary: 18000000,
    commission: 4350000,
    ratingBonus: 800000,
    deductions: 0,
    status: "estimated",
    completedBookings: 32,
    avgRating: 4.95,
  },
];

// ==========================================
// 10. THÔNG BÁO (NOTIFICATIONS)
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
    title: { vi: "Đã duyệt ca làm việc", en: "Shift Request Approved" },
    body: { vi: "Admin đã phê duyệt đăng ký ca tối thứ Bảy của bạn.", en: "Admin approved your Saturday evening shift registration." },
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
    id: "notif-05",
    expertId: "exp-vet-01",
    type: "salary_paid",
    title: { vi: "Lương tháng 10 đã được chi trả", en: "October Salary Paid" },
    body: { vi: "Tổng thu nhập thực nhận 28.400.000đ đã được chuyển khoản.", en: "Net earnings 28,400,000đ have been transferred." },
    at: "2 ngày trước",
    unread: false,
    href: "/expert/earnings",
  },
];

// ==========================================
// 11. CÁC HÀM TIỆN ÍCH & SCOPED SELECTORS
// ==========================================

/**
 * Quy tắc tính phí hủy:
 * - Báo trước >= 24h: 0% phí
 * - Hủy trong khoảng 3h - 24h: 0% phí (nhắc nhở)
 * - Hủy dưới 3h: phạt 50% tổng tiền dịch vụ
 */
export function computeCancellationFee(
  appt: ExpertAppointment,
  servicePrice: number,
  cancelledAtIso?: string
): { feePercentage: number; feeVnd: number; isUnder3Hours: boolean; hoursBefore: number } {
  const startMs = new Date(appt.startAt).getTime();
  const cancelMs = cancelledAtIso ? new Date(cancelledAtIso).getTime() : Date.now();
  const diffHours = (startMs - cancelMs) / (1000 * 60 * 60);

  if (diffHours < 3) {
    const feeVnd = Math.round(servicePrice * 0.5);
    return { feePercentage: 50, feeVnd, isUnder3Hours: true, hoursBefore: Math.max(0, Math.round(diffHours * 10) / 10) };
  }
  return { feePercentage: 0, feeVnd: 0, isUnder3Hours: false, hoursBefore: Math.round(diffHours * 10) / 10 };
}

/**
 * Lọc danh sách thú cưng: Chỉ hiển thị các thú cưng đã có ít nhất 1 booking với chuyên viên đó.
 */
export function getScopedPets(
  expertId: string,
  appointments: ExpertAppointment[],
  allPets: ExpertPet[] = SEED_PETS
): ExpertPet[] {
  const myPetIds = new Set(
    appointments.filter((a) => a.expertId === expertId).map((a) => a.petId)
  );
  return allPets.filter((p) => myPetIds.has(p.id));
}

/**
 * Lọc danh sách chủ nuôi: Chỉ hiển thị chủ nuôi có thú cưng đã book chuyên viên đó.
 */
export function getScopedOwners(
  expertId: string,
  appointments: ExpertAppointment[],
  allOwners: ExpertPetOwner[] = SEED_OWNERS
): ExpertPetOwner[] {
  const myOwnerIds = new Set(
    appointments.filter((a) => a.expertId === expertId).map((a) => a.ownerId)
  );
  return allOwners.filter((o) => myOwnerIds.has(o.id));
}

/**
 * Tạo dữ liệu store ban đầu cho chuyên viên.
 */
export function getInitialExpertStore(expertId: string): ExpertStoreState {
  const profile = SEED_EXPERTS[expertId] ?? SEED_EXPERTS["exp-vet-01"];
  return {
    version: 1,
    appointments: SEED_APPOINTMENTS.filter((a) => a.expertId === expertId),
    shifts: SEED_SHIFTS.filter((s) => s.expertId === expertId),
    shiftRequests: SEED_SHIFT_REQUESTS.filter((r) => r.expertId === expertId),
    healthEntries: SEED_HEALTH_ENTRIES,
    weightLogs: SEED_WEIGHT_LOGS,
    medicalRecords: SEED_MEDICAL_RECORDS.filter((m) => m.expertId === expertId),
    prescriptions: SEED_PRESCRIPTIONS.filter((p) => p.expertId === expertId),
    reviews: SEED_REVIEWS.filter((r) => r.expertId === expertId),
    notifications: SEED_NOTIFICATIONS.filter((n) => n.expertId === expertId),
    profile,
  };
}

