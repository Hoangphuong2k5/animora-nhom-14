export interface ShiftSlot {
  id: string;
  dayIndex: number; // 0 = T2, 1 = T3, ..., 6 = CN
  timeSlot: string;
  staffId: string;
  staffName: string;
  staffColor: string;
  type: "booked" | "free" | "leave";
  bookingCode?: string;
  petName?: string;
  service?: string;
}

export const STAFF_PROFILES = [
  {
    id: "st-1",
    linkedExpertId: "exp-vet-01",
    name: "BS. Lê Huy Hoàng",
    color: "#6B1F2E",
    bgLight:
      "bg-[#6B1F2E]/10 border-[#6B1F2E]/30 text-[#6B1F2E] dark:text-[#FF7F6B]",
  },
  {
    id: "st-2",
    linkedExpertId: "exp-spa-01",
    name: "Phan Thị Đình Thùy (NV Chăm sóc FT)",
    color: "#EC4899",
    bgLight:
      "bg-pink-500/10 border-pink-500/30 text-pink-600 dark:text-pink-400",
  },
  {
    id: "st-3",
    linkedExpertId: "exp-spa-02",
    name: "Nguyễn Văn Tuấn Anh (NV Chăm sóc PT)",
    color: "#0D9488",
    bgLight:
      "bg-teal-500/10 border-teal-500/30 text-teal-700 dark:text-teal-400",
  },
  {
    id: "st-4",
    linkedExpertId: "exp-vet-01",
    name: "BS. Ngô Phước Toàn",
    color: "#10B981",
    bgLight:
      "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
  },
];

export const DAYS_OF_WEEK = [
  { label: "Thứ 2", date: "03/11" },
  { label: "Thứ 3", date: "04/11" },
  { label: "Thứ 4", date: "05/11" },
  { label: "Thứ 5", date: "06/11" },
  { label: "Thứ 6", date: "07/11" },
  { label: "Thứ 7", date: "08/11" },
  { label: "Chủ Nhật", date: "09/11" },
];

export const TIME_SLOTS = [
  "08:30 - 10:00",
  "10:00 - 11:30",
  "13:30 - 15:00",
  "15:00 - 16:30",
];

export const INITIAL_SHIFTS: ShiftSlot[] = [
  { id: "s1", dayIndex: 0, timeSlot: "08:30 - 10:00", staffId: "st-1", staffName: "BS. Lê Huy Hoàng", staffColor: "#6B1F2E", type: "booked", bookingCode: "BK-9821", petName: "Bơ (Corgi)", service: "Khám Tổng Quát" },
  { id: "s2", dayIndex: 0, timeSlot: "10:00 - 11:30", staffId: "st-2", staffName: "Phan Thị Đình Thùy (NV Chăm sóc FT)", staffColor: "#EC4899", type: "booked", bookingCode: "BK-9822", petName: "Miu (Mèo Ba Tư)", service: "Spa Cắt Tỉa" },
  { id: "s3", dayIndex: 0, timeSlot: "13:30 - 15:00", staffId: "st-3", staffName: "Nguyễn Văn Tuấn Anh (NV Chăm sóc PT)", staffColor: "#0D9488", type: "free" },
  { id: "s4", dayIndex: 1, timeSlot: "08:30 - 10:00", staffId: "st-2", staffName: "Phan Thị Đình Thùy (NV Chăm sóc FT)", staffColor: "#EC4899", type: "booked", bookingCode: "BK-9825", petName: "Rex (Golden)", service: "Tắm Thảo Dược" },
  { id: "s5", dayIndex: 1, timeSlot: "13:30 - 15:00", staffId: "st-1", staffName: "BS. Lê Huy Hoàng", staffColor: "#6B1F2E", type: "free" },
  { id: "s6", dayIndex: 1, timeSlot: "15:00 - 16:30", staffId: "st-4", staffName: "BS. Ngô Phước Toàn", staffColor: "#10B981", type: "leave" },
  { id: "s7", dayIndex: 2, timeSlot: "10:00 - 11:30", staffId: "st-1", staffName: "BS. Lê Huy Hoàng", staffColor: "#6B1F2E", type: "booked", bookingCode: "BK-9830", petName: "Kuro (Shiba)", service: "Tiêm Vaccine 7 Bệnh" },
  { id: "s8", dayIndex: 2, timeSlot: "15:00 - 16:30", staffId: "st-3", staffName: "Nguyễn Văn Tuấn Anh (NV Chăm sóc PT)", staffColor: "#0D9488", type: "booked", bookingCode: "BK-9831", petName: "Bông Gòn (Mèo ALN)", service: "Trông giữ nội trú" },
  { id: "s9", dayIndex: 3, timeSlot: "08:30 - 10:00", staffId: "st-3", staffName: "Nguyễn Văn Tuấn Anh (NV Chăm sóc PT)", staffColor: "#0D9488", type: "free" },
  { id: "s10", dayIndex: 3, timeSlot: "13:30 - 15:00", staffId: "st-2", staffName: "Phan Thị Đình Thùy (NV Chăm sóc FT)", staffColor: "#EC4899", type: "booked", bookingCode: "BK-9838", petName: "Max (Poodle)", service: "Cắt Tạo Kiểu Gấu Bông" },
  { id: "s11", dayIndex: 4, timeSlot: "10:00 - 11:30", staffId: "st-1", staffName: "BS. Lê Huy Hoàng", staffColor: "#6B1F2E", type: "booked", bookingCode: "BK-9842", petName: "Mít (Pug)", service: "Nội Soi Tiêu Hóa" },
  { id: "s12", dayIndex: 4, timeSlot: "15:00 - 16:30", staffId: "st-2", staffName: "Phan Thị Đình Thùy (NV Chăm sóc FT)", staffColor: "#EC4899", type: "free" },
  { id: "s13", dayIndex: 5, timeSlot: "08:30 - 10:00", staffId: "st-1", staffName: "BS. Lê Huy Hoàng", staffColor: "#6B1F2E", type: "booked", bookingCode: "BK-9850", petName: "Bơ (Corgi)", service: "Kiểm Tra Khớp" },
  { id: "s14", dayIndex: 5, timeSlot: "10:00 - 11:30", staffId: "st-3", staffName: "Nguyễn Văn Tuấn Anh (NV Chăm sóc PT)", staffColor: "#0D9488", type: "booked", bookingCode: "BK-9852", petName: "Sữa (Mèo)", service: "Combo Tắm Khô" },
  { id: "s15", dayIndex: 5, timeSlot: "13:30 - 15:00", staffId: "st-2", staffName: "Phan Thị Đình Thùy (NV Chăm sóc FT)", staffColor: "#EC4899", type: "booked", bookingCode: "BK-9855", petName: "Lulu (Mèo)", service: "Grooming VIP" },
  { id: "s16", dayIndex: 6, timeSlot: "08:30 - 10:00", staffId: "st-2", staffName: "Phan Thị Đình Thùy (NV Chăm sóc FT)", staffColor: "#EC4899", type: "free" },
  { id: "s17", dayIndex: 6, timeSlot: "15:00 - 16:30", staffId: "st-3", staffName: "Nguyễn Văn Tuấn Anh (NV Chăm sóc PT)", staffColor: "#0D9488", type: "booked", bookingCode: "BK-9860", petName: "Bắp (Golden)", service: "Trông giữ & Vệ sinh" },
];

/** Checks whether a staff member already has a shift in the given day and time slot. */
export function checkShiftConflict(
  shifts: ShiftSlot[],
  day: number,
  slot: string,
  staffId: string
): string | null {
  const existing = shifts.find(
    (s) => s.dayIndex === day && s.timeSlot === slot && s.staffId === staffId
  );
  if (existing) {
    return `Chuyên viên này đã được xếp ca "${
      existing.type === "booked" ? "Có khách" : "Ca trực"
    }" vào khung giờ này!`;
  }
  return null;
}
