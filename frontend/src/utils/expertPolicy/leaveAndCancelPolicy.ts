import { getTodayLocalIso } from "@/utils/dateFormat";
import type {
  EmploymentType,
  ExpertAppointment,
  ExpertShift,
  ExpertType,
  LeaveReasonType,
  ShiftCode,
  ShiftRequest,
  ShiftRequestKind,
} from "@/types/expert.type";

export const LEAVE_TYPE_LABELS: Record<LeaveReasonType, string> = {
  sick: "Nghỉ ốm",
  unpaid: "Nghỉ không lương",
  rotational: "Nghỉ luân phiên",
  emergency: "Nghỉ đột xuất",
};

export function getLeaveTypeLabel(leaveType?: LeaveReasonType): string {
  if (!leaveType) return "Nghỉ phép thường";
  return LEAVE_TYPE_LABELS[leaveType] ?? "Nghỉ phép thường";
}

export function getLeaveRequestTitle(leaveType?: LeaveReasonType): string {
  if (leaveType === "emergency") return "Nghỉ đột xuất (QL tạo)";
  if (leaveType === "sick") return "Đơn xin nghỉ ốm";
  if (leaveType === "unpaid") return "Đơn xin nghỉ không lương";
  if (leaveType === "rotational") return "Đơn nghỉ luân phiên";
  return "Đơn xin nghỉ phép thường";
}

/**
 * Quy tắc hủy lịch theo Animora v1.4 (Mục 5):
 * - Đơn trả trước (prepaid) hủy trong vòng dưới 3 giờ: giữ 30% giá trị đơn.
 * - Đơn trả trước hủy trước 3 giờ: hoàn 100% (phí 0%).
 * - Đơn trả sau (postpaid): không thu phí hủy (0đ), hủy dưới 3 giờ ghi nhận 1 violation.
 */
export function computeCancellationFee(
  appt: ExpertAppointment,
  servicePrice: number,
  cancelledAtIso?: string
): {
  feePercentage: number;
  feeVnd: number;
  isUnder3Hours: boolean;
  hoursBefore: number;
} {
  const startMs = new Date(appt.startAt).getTime();
  const cancelMs = cancelledAtIso
    ? new Date(cancelledAtIso).getTime()
    : Date.now();
  const diffHours = (startMs - cancelMs) / (1000 * 60 * 60);
  const isUnder3Hours = diffHours < 3;

  const isPrepaidPenalty = appt.paymentTiming === "prepaid" && isUnder3Hours;
  const feePercentage = isPrepaidPenalty ? 30 : 0;
  const feeVnd = isPrepaidPenalty ? Math.round((servicePrice * 30) / 100) : 0;

  return {
    feePercentage,
    feeVnd,
    isUnder3Hours,
    hoursBefore: Math.max(0, Math.round(diffHours * 10) / 10),
  };
}

/**
 * Nghiệp vụ Animora v1.4:
 * Toàn bộ Bác sĩ (BS) và Nhân viên chăm sóc (NVCS) đều làm việc Full-time (Thứ 2 – Thứ 7, 08:00–17:00, nghỉ trưa 12:00–13:00).
 * Bỏ hoàn toàn nhân sự Part-time, đổi ca (shift_swap), ca làm thêm (extra_shift) và tăng ca (overtime).
 * Chỉ áp dụng hình thức xin nghỉ phép thường cả ngày (kind === "leave").
 */
export function validateShiftRequestKindForEmployment(
  kind: ShiftRequestKind | string,
  _employmentType?: EmploymentType | string,
  expertType?: ExpertType
): { allowed: boolean; reason?: string } {
  void _employmentType;
  if (kind === "overtime" || kind === "shift") {
    return {
      allowed: false,
      reason: "Nghiệp vụ tăng ca đã được loại bỏ khỏi hệ thống.",
    };
  }

  if (kind !== "leave") {
    return {
      allowed: false,
      reason:
        expertType === "vet"
          ? "Bác sĩ chỉ áp dụng hình thức xin nghỉ phép (nghỉ cả ngày), không áp dụng đổi ca hay làm thêm."
          : "Nhân viên chăm sóc (Full-time) chỉ áp dụng hình thức xin nghỉ phép thường (nghỉ cả ngày), không có đổi ca hay ca làm thêm.",
    };
  }

  return { allowed: true };
}

export function isSundayDateIso(dateIso: string): boolean {
  if (!dateIso || !/^\d{4}-\d{2}-\d{2}/.test(dateIso)) return false;
  const d = new Date(`${dateIso.slice(0, 10)}T00:00:00`);
  return !Number.isNaN(d.getTime()) && d.getDay() === 0;
}

/**
 * Lấy chuỗi ngày ISO (YYYY-MM-DD) của ngày Thứ Hai trong tuần chứa referenceDate.
 */
export function getCurrentWeekMondayIso(referenceDate?: Date | string): string {
  const d = referenceDate
    ? typeof referenceDate === "string"
      ? new Date(`${referenceDate.slice(0, 10)}T00:00:00`)
      : new Date(referenceDate)
    : new Date();
  const dow = d.getDay(); // 0 = Chủ Nhật
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(d);
  monday.setDate(d.getDate() + mondayOffset);
  return getTodayLocalIso(monday);
}

/**
 * Kiểm tra xem một ngày có thuộc các tuần đã qua trong tháng (hoặc các tuần trước) hay không.
 * Ngày thuộc tuần đã qua nếu ngày đó đứng trước Thứ Hai của tuần hiện tại.
 */
export function isDateInPastWeek(
  dateIso: string,
  referenceDate?: Date | string
): boolean {
  if (!dateIso) return false;
  const currentWeekMonday = getCurrentWeekMondayIso(referenceDate);
  return dateIso < currentWeekMonday;
}

/**
 * Quy tắc Nghỉ phép thường (Animora ver1.4.1 - Mục 7):
 * - Lịch làm việc Thứ 2 – Thứ 7 (Chủ Nhật nghỉ cố định, không cần xin nghỉ phép).
 * - Không thể tạo đơn nghỉ phép cho các tuần đã qua.
 * - Nếu ngày đó có lịch KHÁCH CHỌN ĐÍCH DANH (`isPreferredStaff === true`) -> chặn nghỉ phép thường (chỉ xử lý qua Nghỉ đột xuất).
 * - Nếu ngày đó chỉ có lịch HỆ THỐNG TỰ GÁN (`!isPreferredStaff`) -> vẫn cho phép gửi đơn nghỉ phép thường và trả về `reassignableAppointments` để Quản lý duyệt tự chuyển ca sang đồng nghiệp rảnh ít ca nhất.
 */
export function canRequestRegularLeaveOnDate(
  dateIso: string,
  appointments: ExpertAppointment[],
  expertId: string,
  referenceDate?: Date | string
): {
  allowed: boolean;
  reason?: string;
  conflictingAppointments: ExpertAppointment[];
  reassignableAppointments: ExpertAppointment[];
} {
  if (isDateInPastWeek(dateIso, referenceDate)) {
    return {
      allowed: false,
      reason: "Không thể tạo đơn xin nghỉ phép cho các tuần đã qua trong tháng.",
      conflictingAppointments: [],
      reassignableAppointments: [],
    };
  }

  if (isSundayDateIso(dateIso)) {
    return {
      allowed: false,
      reason:
        "Chủ Nhật là ngày nghỉ cố định của trung tâm (lịch làm việc T2–T7), không cần gửi đơn xin nghỉ phép.",
      conflictingAppointments: [],
      reassignableAppointments: [],
    };
  }

  const sameDayActive = appointments.filter(
    (a) =>
      a.expertId === expertId &&
      a.status !== "cancelled" &&
      a.startAt.startsWith(dateIso)
  );

  const preferredConflicts = sameDayActive.filter((a) => a.isPreferredStaff === true);
  const autoAssigned = sameDayActive.filter((a) => a.isPreferredStaff !== true);

  if (preferredConflicts.length > 0) {
    return {
      allowed: false,
      reason: `Ngày này đã có ${preferredConflicts.length} lịch hẹn khách chọn đích danh bạn. Theo nghiệp vụ ver1.4.1, không thể xin nghỉ phép thường — vui lòng liên hệ Quản lý theo quy trình Nghỉ đột xuất.`,
      conflictingAppointments: preferredConflicts,
      reassignableAppointments: autoAssigned,
    };
  }

  return {
    allowed: true,
    conflictingAppointments: [],
    reassignableAppointments: autoAssigned,
  };
}

export const MAX_MONTHLY_LEAVE_DAYS = 4;
export const MAX_NORMAL_DAILY_HOURS = 8;
export const MAX_NORMAL_WEEKLY_HOURS = 48;
export const MAX_DAILY_WORKING_HOURS_ART_107 = 12;

// Chỉ làm việc trong giờ hành chính từ 08:00 đến 17:00 chiều (Ca sáng 4h + Ca chiều 4h = 8h/ngày, nghỉ trưa 12:00-13:00)
export const SHIFT_DURATION_HOURS: Record<ShiftCode, number> = {
  morning: 4,
  afternoon: 4,
};

export function getShiftDurationHours(shift?: ShiftCode): number {
  if (!shift) return 4;
  return SHIFT_DURATION_HOURS[shift] ?? 4;
}

export interface MonthlyLeaveQuotaSummary {
  month: string;
  maxDays: number;
  usedDays: number;
  remainingDays: number;
  absenceCount: number;
  rotationalDays: number;
  sickDays: number;
  unpaidDays: number;
  emergencyDays: number;
  isAtOrOverLimit: boolean;
  exceedsOnNewRequest: boolean;
  warningMessage: string | null;
}

/**
 * Tính quỹ ngày nghỉ trong tháng (tối đa 4 ngày/tháng, reset đầu tháng, không cộng dồn).
 * Tính tất cả: nghỉ luân phiên (rotational_off), nghỉ ốm, nghỉ không lương và nghỉ đột xuất.
 */
export function evaluateMonthlyLeaveQuota(
  requests: ShiftRequest[],
  shifts: ExpertShift[],
  expertId: string,
  targetDateIso: string
): MonthlyLeaveQuotaSummary {
  const month = targetDateIso.slice(0, 7);

  const rotationalShifts = shifts.filter(
    (s) =>
      s.expertId === expertId &&
      s.shiftType === "rotational_off" &&
      s.date.startsWith(month)
  );

  const activeLeaveReqs = requests.filter(
    (r) =>
      r.expertId === expertId &&
      r.kind === "leave" &&
      r.status !== "rejected" &&
      r.date.startsWith(month)
  );

  const rotationalDates = new Set(rotationalShifts.map((s) => s.date));

  let rotationalDays = rotationalDates.size;
  let sickDays = 0;
  let unpaidDays = 0;
  let emergencyDays = 0;
  let extraLeaveCount = 0;

  for (const req of activeLeaveReqs) {
    if (req.leaveType === "sick") {
      sickDays += 1;
    } else if (req.leaveType === "unpaid") {
      unpaidDays += 1;
    } else if (req.leaveType === "emergency") {
      emergencyDays += 1;
    } else if (req.leaveType === "rotational") {
      if (!rotationalDates.has(req.date)) {
        rotationalDays += 1;
        rotationalDates.add(req.date);
      }
      continue;
    }
    extraLeaveCount += 1;
  }

  const usedDays = rotationalDays + extraLeaveCount;
  const remainingDays = Math.max(0, MAX_MONTHLY_LEAVE_DAYS - usedDays);
  const absenceCount = activeLeaveReqs.length + rotationalShifts.length;
  const isAtOrOverLimit = usedDays >= MAX_MONTHLY_LEAVE_DAYS;
  const exceedsOnNewRequest = usedDays + 1 > MAX_MONTHLY_LEAVE_DAYS;

  const warningMessage = exceedsOnNewRequest
    ? `Vượt hạn mức ${MAX_MONTHLY_LEAVE_DAYS} ngày nghỉ/tháng (${usedDays}/${MAX_MONTHLY_LEAVE_DAYS} ngày đã dùng) — đơn sẽ được gắn cờ "vượt hạn mức / nghỉ không lương" gửi Manager duyệt.`
    : null;

  return {
    month,
    maxDays: MAX_MONTHLY_LEAVE_DAYS,
    usedDays,
    remainingDays,
    absenceCount,
    rotationalDays,
    sickDays,
    unpaidDays,
    emergencyDays,
    isAtOrOverLimit,
    exceedsOnNewRequest,
    warningMessage,
  };
}

export interface WorkingHoursPolicySummary {
  date: string;
  weekMonday: string;
  dailyHours: number;
  weeklyHours: number;
  exceedsNormalDaily: boolean;
  exceedsNormalWeekly: boolean;
  exceedsArt107DailyCap: boolean;
  warnings: string[];
}

/**
 * Đánh giá quy định giờ làm việc cho nhân viên Full-time và Bác sĩ:
 * - Thời gian làm việc bình thường: không quá 8 giờ/ngày và không quá 48 giờ/tuần.
 * - Giới hạn tối đa theo Điều 107 Bộ luật Lao động: không quá 12 giờ/ngày.
 */
export function evaluateWorkingHoursPolicy(
  shifts: ExpertShift[],
  expertId: string,
  targetDateIso: string
): WorkingHoursPolicySummary {
  const weekMonday = getCurrentWeekMondayIso(targetDateIso);
  const monDate = new Date(`${weekMonday}T00:00:00`);
  const sunDate = new Date(monDate);
  sunDate.setDate(monDate.getDate() + 6);
  const weekSunday = getTodayLocalIso(sunDate);

  const workingShifts = shifts.filter(
    (s) => s.expertId === expertId && s.shiftType !== "rotational_off"
  );

  const dailyHours = workingShifts
    .filter((s) => s.date === targetDateIso)
    .reduce((sum, s) => sum + getShiftDurationHours(s.shift), 0);

  const weeklyHours = workingShifts
    .filter((s) => s.date >= weekMonday && s.date <= weekSunday)
    .reduce((sum, s) => sum + getShiftDurationHours(s.shift), 0);

  const exceedsNormalDaily = dailyHours > MAX_NORMAL_DAILY_HOURS;
  const exceedsNormalWeekly = weeklyHours > MAX_NORMAL_WEEKLY_HOURS;
  const exceedsArt107DailyCap = dailyHours > MAX_DAILY_WORKING_HOURS_ART_107;

  const warnings: string[] = [];
  if (exceedsArt107DailyCap) {
    warnings.push(
      `Tổng giờ làm việc trong ngày (${dailyHours}h) vượt quá trần tối đa ${MAX_DAILY_WORKING_HOURS_ART_107} giờ/ngày theo Điều 107 BLLĐ.`
    );
  } else if (exceedsNormalDaily) {
    warnings.push(
      `Giờ làm việc trong ngày (${dailyHours}h) vượt mức bình thường ${MAX_NORMAL_DAILY_HOURS} giờ/ngày (trần tối đa Điều 107: ${MAX_DAILY_WORKING_HOURS_ART_107} giờ/ngày).`
    );
  }
  if (exceedsNormalWeekly) {
    warnings.push(
      `Tổng giờ làm việc trong tuần (${weeklyHours}h) vượt quá mức bình thường ${MAX_NORMAL_WEEKLY_HOURS} giờ/tuần.`
    );
  }

  return {
    date: targetDateIso,
    weekMonday,
    dailyHours,
    weeklyHours,
    exceedsNormalDaily,
    exceedsNormalWeekly,
    exceedsArt107DailyCap,
    warnings,
  };
}

/**
 * Quy tắc Mục 9: Đơn nghỉ phép đã được duyệt không thể hủy.
 * Chỉ đơn đang chờ duyệt (pending) mới có thể hủy.
 */
export function canCancelShiftRequest(req: ShiftRequest): boolean {
  if (req.kind === "leave" && req.status === "approved") {
    return false;
  }
  return req.status === "pending";
}

