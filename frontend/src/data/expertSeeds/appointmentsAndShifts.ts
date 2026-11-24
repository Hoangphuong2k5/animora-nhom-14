import { getTodayLocalIso } from "@/utils/dateFormat";
import { getCurrentWeekMondayIso } from "@/utils/expertPolicy";
import type {
  ExpertAppointment,
  ExpertShift,
  ShiftRequest,
} from "@/types/expert.type";

/** Tạo chuỗi YYYY-MM-DDTHH:mm lệch offsetDays so với ngày hiện tại */
export function buildRelativeDateTimeIso(offsetDays = 0, timeStr = "09:00"): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${getTodayLocalIso(d)}T${timeStr}`;
}

export const SEED_APPOINTMENTS: ExpertAppointment[] = [
  // --- BÁC SĨ (exp-vet-01) ---
  {
    id: "apt-vet-001",
    code: "ANM-VET-0912",
    expertId: "exp-vet-01",
    petId: "pet-001",
    ownerId: "own-001",
    serviceId: "srv-vet-02",
    startAt: buildRelativeDateTimeIso(0, "09:30"),
    status: "in_progress",
    paymentTiming: "prepaid",
    paymentState: "paid",
    customerNote: "Bé gãi tai liên tục 3 ngày nay, tai trong có mùi hôi.",
    createdAt: buildRelativeDateTimeIso(-2, "14:10"),
    startedAt: buildRelativeDateTimeIso(0, "09:35"),
    history: [
      { at: buildRelativeDateTimeIso(-2, "14:10"), status: "pending", note: { vi: "Khách đặt lịch qua website", en: "Booked online" } },
      { at: buildRelativeDateTimeIso(-1, "08:30"), status: "upcoming", note: { vi: "Bác sĩ xác nhận lịch hẹn", en: "Doctor confirmed" } },
      { at: buildRelativeDateTimeIso(0, "09:35"), status: "in_progress", note: { vi: "Bác sĩ bắt đầu thăm khám lâm sàng", en: "Doctor started exam" } },
    ],
  },
  {
    id: "apt-vet-002",
    code: "ANM-VET-0913",
    expertId: "exp-vet-01",
    petId: "pet-002",
    ownerId: "own-002",
    serviceId: "srv-vet-01",
    startAt: buildRelativeDateTimeIso(0, "11:00"),
    status: "upcoming",
    paymentTiming: "postpaid",
    paymentState: "unpaid",
    customerNote: "Khám sức khỏe định kỳ 6 tháng + tư vấn cân nặng.",
    createdAt: buildRelativeDateTimeIso(-1, "18:20"),
    history: [
      { at: buildRelativeDateTimeIso(-1, "18:20"), status: "pending", note: { vi: "Khách đặt lịch", en: "Booked" } },
      { at: buildRelativeDateTimeIso(-1, "19:00"), status: "upcoming", note: { vi: "Đã xác nhận", en: "Confirmed" } },
    ],
  },
  {
    id: "apt-vet-003",
    code: "ANM-VET-0914",
    expertId: "exp-vet-01",
    petId: "pet-005",
    ownerId: "own-005",
    serviceId: "srv-vet-03",
    startAt: buildRelativeDateTimeIso(0, "14:30"),
    status: "upcoming",
    paymentTiming: "prepaid",
    paymentState: "paid",
    customerNote: "Tiêm nhắc dại định kỳ hàng năm.",
    createdAt: buildRelativeDateTimeIso(-3, "10:15"),
    history: [
      { at: buildRelativeDateTimeIso(-3, "10:15"), status: "pending", note: { vi: "Khách đặt lịch", en: "Booked" } },
      { at: buildRelativeDateTimeIso(-3, "11:00"), status: "upcoming", note: { vi: "Đã xác nhận", en: "Confirmed" } },
    ],
  },
  {
    id: "apt-vet-004",
    code: "ANM-VET-0915",
    expertId: "exp-vet-01",
    petId: "pet-004",
    ownerId: "own-004",
    serviceId: "srv-vet-01",
    startAt: buildRelativeDateTimeIso(1, "10:00"),
    status: "pending",
    paymentTiming: "postpaid",
    paymentState: "unpaid",
    customerNote: "Bé thỏ ăn ít, bụng hơi trướng.",
    createdAt: buildRelativeDateTimeIso(0, "08:10"),
    history: [
      { at: buildRelativeDateTimeIso(0, "08:10"), status: "pending", note: { vi: "Chờ bác sĩ tiếp nhận", en: "Awaiting doctor acceptance" } },
    ],
  },
  {
    id: "apt-vet-005",
    code: "ANM-VET-0916",
    expertId: "exp-vet-01",
    petId: "pet-007",
    ownerId: "own-001",
    serviceId: "srv-vet-01",
    startAt: buildRelativeDateTimeIso(2, "09:00"),
    status: "upcoming",
    paymentTiming: "prepaid",
    paymentState: "paid",
    rescheduleRequest: {
      requestedStartAt: buildRelativeDateTimeIso(2, "15:30"),
      reason: "Em bận họp đột xuất buổi sáng, xin chuyển sang chiều cùng ngày ạ.",
    },
    customerNote: "Tái khám kiểm tra da.",
    createdAt: buildRelativeDateTimeIso(-2, "09:00"),
    history: [
      { at: buildRelativeDateTimeIso(-2, "09:00"), status: "upcoming", note: { vi: "Lịch hẹn ban đầu", en: "Initial booking" } },
      { at: buildRelativeDateTimeIso(0, "07:30"), status: "reschedule_requested", note: { vi: "Khách xin đổi sang 15:30", en: "Customer requested 15:30" } },
    ],
  },
  {
    id: "apt-vet-006",
    code: "ANM-VET-0909",
    expertId: "exp-vet-01",
    petId: "pet-008",
    ownerId: "own-002",
    serviceId: "srv-vet-01",
    startAt: buildRelativeDateTimeIso(-1, "16:00"),
    status: "completed",
    paymentTiming: "prepaid",
    paymentState: "paid",
    startedAt: buildRelativeDateTimeIso(-1, "16:05"),
    completedAt: buildRelativeDateTimeIso(-1, "16:50"),
    completionNote: "Đã khám lâm sàng, nghi ngờ rối loạn tiêu hóa nhẹ. Chưa hoàn tất ghi bệnh án và đơn thuốc.",
    createdAt: buildRelativeDateTimeIso(-4, "11:00"),
    history: [
      { at: buildRelativeDateTimeIso(-4, "11:00"), status: "pending", note: { vi: "Đặt lịch", en: "Booked" } },
      { at: buildRelativeDateTimeIso(-1, "16:50"), status: "completed", note: { vi: "Hoàn thành ca khám", en: "Exam finished" } },
    ],
  },
  {
    id: "apt-vet-007",
    code: "ANM-VET-0888",
    expertId: "exp-vet-01",
    petId: "pet-001",
    ownerId: "own-001",
    serviceId: "srv-vet-02",
    startAt: buildRelativeDateTimeIso(-14, "10:00"),
    status: "completed",
    paymentTiming: "prepaid",
    paymentState: "paid",
    startedAt: buildRelativeDateTimeIso(-14, "10:02"),
    completedAt: buildRelativeDateTimeIso(-14, "10:55"),
    completionNote: "Viêm tai ngoài do nấm men Malassezia. Đã kê đơn Dexoryl nhỏ tai 10 ngày.",
    petConditionAfter: "Bé thoải mái, hết ngứa cấp.",
    medicalRecordId: "rec-001",
    prescriptionId: "rx-001",
    createdAt: buildRelativeDateTimeIso(-16, "15:00"),
    history: [
      { at: buildRelativeDateTimeIso(-14, "10:55"), status: "completed", note: { vi: "Khám & kê đơn hoàn tất", en: "Exam & prescription completed" } },
    ],
  },
  // Ca đã hủy (<3h bị giữ 30% phí theo Animora v1.4 Mục 5)
  {
    id: "apt-vet-008",
    code: "ANM-VET-0895",
    expertId: "exp-vet-01",
    petId: "pet-005",
    ownerId: "own-005",
    serviceId: "srv-vet-01",
    startAt: buildRelativeDateTimeIso(-3, "14:00"),
    status: "cancelled",
    paymentTiming: "prepaid",
    paymentState: "partial_fee",
    cancelledAt: buildRelativeDateTimeIso(-3, "12:30"),
    cancelledBy: "customer",
    cancelReason: "Khách bận đột xuất, thông báo trước giờ hẹn 1.5 giờ.",
    createdAt: buildRelativeDateTimeIso(-5, "10:00"),
    history: [
      { at: buildRelativeDateTimeIso(-3, "12:30"), status: "cancelled", note: { vi: "Khách hủy lịch dưới 3 giờ (giữ 30% phí theo v1.4)", en: "Cancelled <3h (30% fee)" } },
    ],
  },

  // --- NHÂN VIÊN CHĂM SÓC FULL-TIME (exp-spa-01) ---
  {
    id: "apt-spa-001",
    code: "ANM-SPA-1021",
    expertId: "exp-spa-01",
    petId: "pet-003",
    ownerId: "own-003",
    serviceId: "srv-spa-02",
    startAt: buildRelativeDateTimeIso(0, "10:00"),
    status: "in_progress",
    paymentTiming: "prepaid",
    paymentState: "paid",
    customerNote: "Tỉa gọn mặt tròn Teddy, giữ lông đuôi bông.",
    createdAt: buildRelativeDateTimeIso(-1, "12:00"),
    startedAt: buildRelativeDateTimeIso(0, "10:05"),
    careStage: "performing",
    careProgressLog: [
      {
        stage: "checked_in",
        updatedAt: buildRelativeDateTimeIso(0, "10:05"),
        note: "Đã kiểm tra da lông, tai sạch, bé hợp tác tốt.",
        updatedBy: "Phan Thị Đình Thùy",
      },
      {
        stage: "performing",
        updatedAt: buildRelativeDateTimeIso(0, "10:20"),
        note: "Đang tắm thảo mộc và cắt tỉa tạo kiểu mặt tròn Teddy.",
        updatedBy: "Phan Thị Đình Thùy",
      },
    ],
    history: [
      { at: buildRelativeDateTimeIso(0, "10:05"), status: "in_progress", note: { vi: "Bắt đầu ca chăm sóc • Đã tiếp nhận bé", en: "Started care slot" } },
      { at: buildRelativeDateTimeIso(0, "10:20"), status: "in_progress", note: { vi: "Cập nhật bước 2: Đang thực hiện chăm sóc", en: "Stage 2: Performing care" } },
    ],
  },
  {
    id: "apt-spa-002",
    code: "ANM-SPA-1022",
    expertId: "exp-spa-01",
    petId: "pet-006",
    ownerId: "own-006",
    serviceId: "srv-spa-01",
    startAt: buildRelativeDateTimeIso(0, "14:00"),
    status: "upcoming",
    paymentTiming: "postpaid",
    paymentState: "unpaid",
    customerNote: "Mèo lông dài, chải gỡ rối kỹ vùng nách.",
    createdAt: buildRelativeDateTimeIso(-2, "16:00"),
    history: [{ at: buildRelativeDateTimeIso(-2, "16:00"), status: "upcoming", note: { vi: "Đã xác nhận", en: "Confirmed" } }],
  },
  {
    id: "apt-spa-003",
    code: "ANM-SPA-1023",
    expertId: "exp-spa-01",
    petId: "pet-001",
    ownerId: "own-001",
    serviceId: "srv-spa-03",
    startAt: buildRelativeDateTimeIso(1, "11:00"),
    status: "pending",
    paymentTiming: "prepaid",
    paymentState: "paid",
    customerNote: "Cắt mài móng chân sau cẩn thận.",
    createdAt: buildRelativeDateTimeIso(0, "08:30"),
    history: [{ at: buildRelativeDateTimeIso(0, "08:30"), status: "pending", note: { vi: "Chờ xác nhận", en: "Pending" } }],
  },
  {
    id: "apt-spa-004",
    code: "ANM-SPA-1018",
    expertId: "exp-spa-01",
    petId: "pet-001",
    ownerId: "own-001",
    serviceId: "srv-spa-01",
    startAt: buildRelativeDateTimeIso(-2, "15:00"),
    status: "completed",
    paymentTiming: "prepaid",
    paymentState: "paid",
    startedAt: buildRelativeDateTimeIso(-2, "15:02"),
    completedAt: buildRelativeDateTimeIso(-2, "16:05"),
    careStage: "ready_handover",
    careProgressLog: [
      { stage: "checked_in", updatedAt: buildRelativeDateTimeIso(-2, "15:02"), updatedBy: "Phan Thị Đình Thùy" },
      { stage: "performing", updatedAt: buildRelativeDateTimeIso(-2, "15:15"), updatedBy: "Phan Thị Đình Thùy" },
      { stage: "finishing", updatedAt: buildRelativeDateTimeIso(-2, "15:48"), updatedBy: "Phan Thị Đình Thùy" },
      { stage: "ready_handover", updatedAt: buildRelativeDateTimeIso(-2, "16:05"), note: "Lông mượt, da sạch, sẵn sàng bàn giao.", updatedBy: "Phan Thị Đình Thùy" },
    ],
    completionNote: "Đã tắm thảo mộc 5 bước, chải mượt và cắt gọn lông bàn chân.",
    petConditionAfter: "Bé vui vẻ, khô ráo hoàn toàn.",
    createdAt: buildRelativeDateTimeIso(-4, "09:00"),
    history: [
      { at: buildRelativeDateTimeIso(-2, "16:05"), status: "completed", note: { vi: "Hoàn tất dịch vụ chăm sóc (Xong)", en: "Care service completed" } },
    ],
  },

  // --- NHÂN VIÊN CHĂM SÓC FULL-TIME 2 (exp-spa-02) ---
  {
    id: "apt-pt-001",
    code: "ANM-CARE-2011",
    expertId: "exp-spa-02",
    petId: "pet-005",
    ownerId: "own-005",
    serviceId: "srv-spa-01",
    startAt: buildRelativeDateTimeIso(0, "09:00"),
    status: "in_progress",
    paymentTiming: "prepaid",
    paymentState: "paid",
    customerNote: "Tắm thảo mộc thư giãn, chải gỡ rối kỹ lông đuôi và dưỡng ẩm da.",
    createdAt: buildRelativeDateTimeIso(-1, "17:00"),
    checkedInAt: buildRelativeDateTimeIso(0, "08:55"),
    startedAt: buildRelativeDateTimeIso(0, "09:05"),
    careStage: "performing",
    careProgressLog: [
      {
        stage: "checked_in",
        updatedAt: buildRelativeDateTimeIso(0, "09:05"),
        note: "Đã tiếp nhận bé Bắp, kiểm tra da lông và làm quen trước khi tắm.",
        updatedBy: "Nguyễn Văn Tuấn Anh",
      },
      {
        stage: "performing",
        updatedAt: buildRelativeDateTimeIso(0, "09:20"),
        note: "Đang tắm nước ấm thảo mộc và massage thư giãn cho bé.",
        updatedBy: "Nguyễn Văn Tuấn Anh",
      },
    ],
    history: [
      { at: buildRelativeDateTimeIso(0, "08:55"), status: "upcoming", note: { vi: "Lễ tân xác nhận khách đã đến quầy", en: "Receptionist checked in" } },
      { at: buildRelativeDateTimeIso(0, "09:05"), status: "in_progress", note: { vi: "Bắt đầu ca tắm thảo mộc • Đã tiếp nhận bé", en: "Started herbal bath" } },
    ],
  },
  {
    id: "apt-pt-002",
    code: "ANM-CARE-2012",
    expertId: "exp-spa-02",
    petId: "pet-002",
    ownerId: "own-002",
    serviceId: "srv-spa-03",
    startAt: buildRelativeDateTimeIso(0, "15:00"),
    status: "upcoming",
    paymentTiming: "postpaid",
    paymentState: "unpaid",
    customerNote: "Cắt móng & vệ sinh tai nhẹ nhàng, bé hơi nhạy cảm tiếng động.",
    createdAt: buildRelativeDateTimeIso(-1, "19:30"),
    history: [
      { at: buildRelativeDateTimeIso(-1, "19:30"), status: "upcoming", note: { vi: "Đã phân công ca chiều", en: "Assigned afternoon slot" } },
    ],
  },
  {
    id: "apt-pt-003",
    code: "ANM-CARE-2013",
    expertId: "exp-spa-02",
    petId: "pet-007",
    ownerId: "own-001",
    serviceId: "srv-spa-01",
    startAt: buildRelativeDateTimeIso(2, "10:30"),
    status: "pending",
    paymentTiming: "prepaid",
    paymentState: "paid",
    customerNote: "Tắm dưỡng dịu nhẹ cho Phốc Sóc.",
    createdAt: buildRelativeDateTimeIso(0, "07:50"),
    history: [
      { at: buildRelativeDateTimeIso(0, "07:50"), status: "pending", note: { vi: "Chờ nhân viên nhận lịch", en: "Pending acceptance" } },
    ],
  },
];

function buildMultiWeekShifts(): ExpertShift[] {
  const baseMonday = new Date(`${getCurrentWeekMondayIso()}T00:00:00`);
  const fullTimeExperts = ["exp-vet-01", "exp-vet-02", "exp-vet-03", "exp-spa-01", "exp-spa-02"];
  const result: ExpertShift[] = [];

  // Sinh đủ lịch hành chính cố định T2–T7 cho tuần trước (-1), tuần này (0) và 2 tuần tới (1, 2).
  // Chủ Nhật luôn nghỉ cố định (không sinh ca).
  [-1, 0, 1, 2].forEach((weekOffset) => {
    fullTimeExperts.forEach((expertId) => {
      for (let dayOffset = 0; dayOffset < 6; dayOffset++) {
        const d = new Date(baseMonday);
        d.setDate(baseMonday.getDate() + weekOffset * 7 + dayOffset);
        const date = getTodayLocalIso(d);
        (["morning", "afternoon"] as const).forEach((shift) => {
          result.push({
            id: `sh-wk-${weekOffset}-${expertId}-${dayOffset}-${shift}`,
            expertId,
            date,
            shift,
            shiftType: "fixed",
          });
        });
      }
    });
  });

  return result;
}

export const SEED_SHIFTS: ExpertShift[] = [...buildMultiWeekShifts()];

export const SEED_SHIFT_REQUESTS: ShiftRequest[] = [
  {
    id: "req-01",
    expertId: "exp-vet-01",
    kind: "leave",
    leaveType: "sick",
    date: buildRelativeDateTimeIso(5).slice(0, 10),
    shift: undefined,
    reason: "Khám sức khỏe định kỳ cá nhân (nghỉ cả ngày, tính vào quỹ 4 ngày nghỉ/tháng).",
    status: "pending",
    createdAt: buildRelativeDateTimeIso(-1, "09:00"),
  },
  {
    id: "req-spa-02",
    expertId: "exp-spa-01",
    kind: "leave",
    leaveType: "sick",
    date: buildRelativeDateTimeIso(5).slice(0, 10),
    shift: undefined,
    reason: "Xin nghỉ ốm (nghỉ cả ngày, tính vào quỹ 4 ngày nghỉ/tháng).",
    status: "approved",
    createdAt: buildRelativeDateTimeIso(-2, "10:00"),
    adminNote: "Manager đã duyệt đơn nghỉ phép cả ngày.",
  },
  {
    id: "req-pt-03",
    expertId: "exp-spa-02",
    kind: "leave",
    leaveType: "unpaid",
    date: buildRelativeDateTimeIso(3).slice(0, 10),
    shift: undefined,
    reason: "Bận việc gia đình (nghỉ cả ngày, ngày chưa có khách đặt, trừ vào quỹ 4 ngày/tháng).",
    status: "pending",
    createdAt: buildRelativeDateTimeIso(0, "08:20"),
  },
];

