import { Booking } from "@/types";
import { createSeededServiceBookings } from "@/data/serviceBookingData";
import { INITIAL_PET_PROFILES } from "@/data/petProfilesData";
import { parseBookingStart } from "@/data/managerOpsData";

export interface ExtendedBooking extends Booking {
  staffName?: string;
  price?: number;
  paymentMethod?: "online" | "counter";
  paymentStatus?: "paid" | "unpaid";
  cancellationFee?: number;
  prescription?: string;
  progressStep?: number;
  progressNotes?: { step: string; timestamp: string; note?: string }[];
}

export const RESCHEDULE_SLOTS = [
  "08:30 - 10:00",
  "10:00 - 11:30",
  "13:30 - 15:00",
  "15:00 - 16:30",
  "16:30 - 18:00",
] as const;

export const CANCEL_REASON_OPTIONS = [
  "Khách yêu cầu hủy / bận đột xuất",
  "Không liên lạc được với khách hàng",
  "Khách đổi sang ngày / khung giờ khác",
  "Chuyên viên bận đột xuất / thiếu thiết bị",
  "Bé cưng không đủ điều kiện sức khỏe",
  "Khác",
] as const;

export const ASSIGNABLE_STAFF_OPTIONS = [
  { id: "exp-vet-01", name: "BS. Lê Huy Hoàng" },
  { id: "exp-vet-02", name: "BS. Nguyễn Thúc Hoàng Phương" },
  { id: "exp-vet-03", name: "BS. Ngô Phước Toàn" },
  { id: "exp-spa-01", name: "Phan Thị Đình Thùy (Groomer)" },
  { id: "exp-spa-02", name: "Nguyễn Văn Tuấn Anh (Groomer)" },
] as const;

export const BOOKING_WEEK_FILTER_LABELS = {
  all: "Tất cả tuần (7 ngày)",
  today: "Hôm nay",
  next_7_days: "7 ngày tới",
  this_week: "Tuần này (T2 – CN)",
  next_week: "Tuần sau (T2 – CN)",
  last_7_days: "7 ngày trước",
} as const;

export type BookingWeekFilter = keyof typeof BOOKING_WEEK_FILTER_LABELS;

/** Checks whether a booking date falls within the selected 7-day / calendar-week range. */
export function matchesBookingWeekFilter(
  dateStr: string | undefined,
  filter: string,
  now: Date = new Date()
): boolean {
  if (!filter || filter === "all") return true;
  const parsed = parseBookingStart(dateStr || "");
  if (!parsed) return false;

  const MS_PER_DAY = 86_400_000;
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const targetDay = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).getTime();

  const mondayOffset = (now.getDay() + 6) % 7;
  const thisWeekStart = todayStart - mondayOffset * MS_PER_DAY;
  const nextWeekStart = thisWeekStart + 7 * MS_PER_DAY;

  switch (filter) {
    case "today":
      return targetDay === todayStart;
    case "next_7_days":
      return targetDay >= todayStart && targetDay < todayStart + 7 * MS_PER_DAY;
    case "this_week":
      return targetDay >= thisWeekStart && targetDay < nextWeekStart;
    case "next_week":
      return targetDay >= nextWeekStart && targetDay < nextWeekStart + 7 * MS_PER_DAY;
    case "last_7_days":
      return targetDay >= todayStart - 7 * MS_PER_DAY && targetDay < todayStart;
    default:
      return true;
  }
}

const SPECIES_FALLBACK_PHOTOS: Record<string, string> = {
  Chó: "/assets/images/hero_golden_retriever_1793177482877.jpg",
  Mèo: "/assets/images/about_fluffy_cat_1793177483392.jpg",
  Thỏ: "/assets/adoption/tuyet-nhung-1.jpg",
  Hamster: "/assets/adoption/banh-quy-1.jpg",
  Chim: "/assets/adoption/kiwi-1.jpg",
};

export function resolveBookingPetPhoto(b: Booking): string {
  const petNameNorm = (b.petName || "").trim().toLowerCase();
  if (petNameNorm) {
    const matched = INITIAL_PET_PROFILES.find(
      (p) => p.name.trim().toLowerCase() === petNameNorm
    );
    if (matched?.photo) return matched.photo;
  }
  const typeStr = b.petType || "";
  if (typeStr.includes("Chó")) return SPECIES_FALLBACK_PHOTOS.Chó;
  if (typeStr.includes("Thỏ")) return SPECIES_FALLBACK_PHOTOS.Thỏ;
  if (typeStr.includes("Hamster")) return SPECIES_FALLBACK_PHOTOS.Hamster;
  if (typeStr.includes("Chim")) return SPECIES_FALLBACK_PHOTOS.Chim;
  return SPECIES_FALLBACK_PHOTOS.Mèo;
}

const COMPLETED_SEED_SAMPLES = [
  { fullName: "Nguyễn Minh Anh", phone: "0903 456 781", petName: "Cà Phê", petType: "Chó", serviceSlug: "spa-tam", service: "Spa & tắm", weightRange: "5_to_10", timeSlot: "09:00" },
  { fullName: "Trần Quốc Bảo", phone: "0918 234 562", petName: "Mực", petType: "Chó", serviceSlug: "kham-tong-quat", service: "Khám tổng quát", weightRange: "10_to_20", timeSlot: "10:00" },
  { fullName: "Lê Ngọc Hân", phone: "0937 890 123", petName: "Bông", petType: "Mèo", serviceSlug: "spa-tam", service: "Spa & tắm", weightRange: "under_5", timeSlot: "14:00" },
  { fullName: "Phạm Gia Huy", phone: "0975 112 334", petName: "Sữa", petType: "Mèo", serviceSlug: "nha-khoa-thu-nho", service: "Nha khoa & Chăm sóc Thú nhỏ", weightRange: "under_5", timeSlot: "15:00" },
  { fullName: "Võ Thanh Trúc", phone: "0982 667 889", petName: "Xù", petType: "Chó", serviceSlug: "huan-luyen", service: "Huấn luyện", weightRange: "5_to_10", timeSlot: "08:30" },
  { fullName: "Đặng Hoàng Nam", phone: "0909 778 990", petName: "Milo", petType: "Chó", serviceSlug: "kham-tong-quat", service: "Khám tổng quát", weightRange: "over_20", timeSlot: "11:00" },
  { fullName: "Bùi Thu Thảo", phone: "0912 345 670", petName: "Na", petType: "Mèo", serviceSlug: "luu-tru", service: "Lưu trú", weightRange: "under_5", timeSlot: "09:30" },
  { fullName: "Hoàng Tuấn Kiệt", phone: "0933 221 445", petName: "Rex", petType: "Chó", serviceSlug: "kham-tong-quat", service: "Khám tổng quát", weightRange: "over_20", timeSlot: "16:00" },
  { fullName: "Ngô Khánh Linh", phone: "0945 667 112", petName: "Kẹo", petType: "Mèo", serviceSlug: "spa-tam", service: "Spa & tắm", weightRange: "under_5", timeSlot: "13:30" },
  { fullName: "Đỗ Văn Phong", phone: "0966 889 223", petName: "Bim", petType: "Chó", serviceSlug: "nha-khoa-thu-nho", service: "Nha khoa & Chăm sóc Thú nhỏ", weightRange: "5_to_10", timeSlot: "10:30" },
  { fullName: "Huỳnh Bảo Ngọc", phone: "0908 554 332", petName: "Momo", petType: "Mèo", serviceSlug: "kham-tong-quat", service: "Khám tổng quát", weightRange: "under_5", timeSlot: "14:30" },
  { fullName: "Tạ Quang Vinh", phone: "0919 443 221", petName: "Rocky", petType: "Chó", serviceSlug: "huan-luyen", service: "Huấn luyện", weightRange: "10_to_20", timeSlot: "15:30" },
  { fullName: "Lý Mỹ Duyên", phone: "0938 119 887", petName: "Bánh Bao", petType: "Mèo", serviceSlug: "spa-tam", service: "Spa & tắm", weightRange: "under_5", timeSlot: "09:00" },
  { fullName: "Trịnh Xuân Trường", phone: "0971 223 445", petName: "Vàng", petType: "Chó", serviceSlug: "luu-tru", service: "Lưu trú", weightRange: "10_to_20", timeSlot: "11:30" },
  { fullName: "Dương Thảo Nhi", phone: "0988 990 112", petName: "Nấm", petType: "Thỏ & chuột", serviceSlug: "nha-khoa-thu-nho", service: "Nha khoa & Chăm sóc Thú nhỏ", weightRange: "under_5", timeSlot: "16:30" },
  { fullName: "Phan Anh Khoa", phone: "0905 334 556", petName: "Sóc", petType: "Chó", serviceSlug: "kham-tong-quat", service: "Khám tổng quát", weightRange: "5_to_10", timeSlot: "08:00" },
  { fullName: "Mai Phương Anh", phone: "0914 776 554", petName: "Gấu", petType: "Chó", serviceSlug: "spa-tam", service: "Spa & tắm", weightRange: "over_20", timeSlot: "13:00" },
  { fullName: "Lương Đức Thắng", phone: "0931 665 443", petName: "Táo", petType: "Mèo", serviceSlug: "kham-tong-quat", service: "Khám tổng quát", weightRange: "under_5", timeSlot: "17:00" },
] as const;

export const BOOKINGS_SEED_VERSION = "2026-11-20-v2";

export function sortBookingsByNearestTime(list: ExtendedBooking[]): ExtendedBooking[] {
  return [...list].sort((a, b) => {
    const timeA = parseBookingStart(a.date, a.timeSlot)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const timeB = parseBookingStart(b.date, b.timeSlot)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return timeA - timeB;
  });
}

export function buildDefaultBookings(): ExtendedBooking[] {
  const baseSeeded = createSeededServiceBookings();
  const nonFullSeeded = baseSeeded.filter((b) => !b.id.startsWith("seed-full-"));
  const fullSlotConfirmed = baseSeeded.filter((b) => b.id.startsWith("seed-full-")).slice(0, 4);

  const nowMs = Date.now();
  const extraCompleted: Booking[] = COMPLETED_SEED_SAMPLES.map((sample, idx) => {
    const visitDate = new Date(nowMs - (idx + 2) * 86400000).toISOString().slice(0, 10);
    const createdDate = new Date(nowMs - (idx + 4) * 86400000).toISOString().slice(0, 10);
    return {
      id: `seed-completed-${idx + 1}`,
      code: `DL-2026-02${String(idx + 1).padStart(2, "0")}`,
      serviceSlug: sample.serviceSlug,
      service: sample.service,
      petType: sample.petType,
      petName: sample.petName,
      weightRange: sample.weightRange,
      date: visitDate,
      timeSlot: sample.timeSlot,
      fullName: sample.fullName,
      phone: sample.phone,
      preferredContact: idx % 2 === 0 ? "phone" : "zalo",
      status: "Hoàn thành",
      confirmedAt: `${createdDate}T09:00:00.000Z`,
      completedAt: `${visitDate}T${sample.timeSlot}:00.000Z`,
      createdAt: `${createdDate}T08:00:00.000Z`,
    };
  });

  const nov20BaseMs = Date.UTC(2026, 10, 20);
  let upcomingIdx = 0;

  return [...nonFullSeeded, ...fullSlotConfirmed, ...extraCompleted].map((b, i) => {
    const method = (i % 3 === 0 ? "counter" : "online") as "counter" | "online";
    const paid = method === "online" || b.status === "Hoàn thành";
    const isPendingOrApproved = !b.status || b.status === "Mới" || b.status === "Đã xác nhận";
    const needsConfirmedAt = b.status === "Đã xác nhận" || b.status === "Hoàn thành";

    let resolvedDate = b.date;
    if (isPendingOrApproved) {
      const dayOffset = Math.floor(upcomingIdx / 2);
      resolvedDate = new Date(nov20BaseMs + dayOffset * 86400000).toISOString().slice(0, 10);
      upcomingIdx += 1;
    }

    return {
      ...b,
      date: resolvedDate,
      confirmedAt: needsConfirmedAt ? b.confirmedAt || b.createdAt : b.confirmedAt,
      staffName: i % 2 === 0 ? "BS. Lê Huy Hoàng" : "Phan Thị Đình Thùy (Groomer)",
      price: b.service.includes("Spa") ? 350000 : b.service.includes("Khám") ? 300000 : 250000,
      paymentMethod: method,
      paymentStatus: (paid ? "paid" : "unpaid") as "unpaid" | "paid",
      prescription:
        i % 2 === 0 ? "Vitamin B-Complex 1 viên/ngày x 7 ngày. Giữ ấm vết mổ." : undefined,
    };
  });
}

export const isBookingPaid = (b: ExtendedBooking) =>
  b.paymentStatus === "paid" || b.paymentState === "paid";

export const isBookingFinalized = (b: ExtendedBooking) =>
  b.status === "Hoàn thành" || b.status === "Đã hủy" || b.status === "Không đến";

export function getBookingPaymentMeta(b: ExtendedBooking) {
  const isPaid = isBookingPaid(b);
  const isOnline = b.paymentMethod === "online" || b.paymentTiming === "prepaid";
  const isCounter = !isOnline;
  const badgeLabel = isOnline
    ? isPaid
      ? "Online • Đã trả"
      : "Online • Chờ trả"
    : isPaid
      ? "Tại quầy • Đã trả"
      : "Tại quầy • Chưa trả";
  const badgeClass = isPaid
    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    : isOnline
      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
      : "bg-zinc-100 dark:bg-muted text-zinc-500";
  return { isPaid, isOnline, isCounter, badgeLabel, badgeClass };
}
