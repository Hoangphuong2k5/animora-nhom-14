import type {
  CareServiceStage,
  EmploymentType,
  ExpertShift,
  ExpertType,
  ShiftCode,
  ShiftRequest,
  ShiftRequestKind,
} from "@/types/expert.type";

export const CARE_SERVICE_STAGES: ReadonlyArray<{
  id: CareServiceStage;
  stepNumber: number;
  label: string;
  shortLabel: string;
  description: string;
}> = [
  {
    id: "checked_in",
    stepNumber: 1,
    label: "Đã tiếp nhận & kiểm tra lông/da/tâm lý bé",
    shortLabel: "Tiếp nhận",
    description: "Kiểm tra tình trạng lông, da, tai móng và mức độ hợp tác trước khi làm.",
  },
  {
    id: "performing",
    stepNumber: 2,
    label: "Đang thực hiện chăm sóc / lưu trú",
    shortLabel: "Đang thực hiện",
    description: "Tiến hành tắm thảo mộc, cắt tỉa, vệ sinh hoặc theo dõi ăn uống/vận động lưu trú.",
  },
  {
    id: "finishing",
    stepNumber: 3,
    label: "Hoàn thiện, sấy tạo kiểu / vệ sinh khu vực",
    shortLabel: "Hoàn thiện",
    description: "Sấy khô, chải tạo kiểu, kiểm tra lại tai/móng hoặc vệ sinh khu vực lưu trú.",
  },
  {
    id: "ready_handover",
    stepNumber: 4,
    label: "Hoàn tất & chờ Quản lý xác nhận bàn giao",
    shortLabel: "Chờ QL xác nhận",
    description: "Đã hoàn tất dịch vụ, ghi nhận tình trạng bé để Quản lý xác nhận bàn giao cho khách.",
  },
];

export function getCareStageMeta(stage?: CareServiceStage) {
  return (
    CARE_SERVICE_STAGES.find((s) => s.id === stage) ?? CARE_SERVICE_STAGES[0]
  );
}

export function getNextCareStage(
  current?: CareServiceStage
): CareServiceStage | null {
  if (!current) return "checked_in";
  const idx = CARE_SERVICE_STAGES.findIndex((s) => s.id === current);
  if (idx < 0 || idx >= CARE_SERVICE_STAGES.length - 1) return null;
  return CARE_SERVICE_STAGES[idx + 1].id;
}

export function canRequestExtraShift(employmentType?: EmploymentType): boolean {
  return employmentType === "part_time";
}

export function validateShiftRequestKindForEmployment(
  kind: ShiftRequestKind,
  employmentType?: EmploymentType,
  expertType?: ExpertType
): { allowed: boolean; reason?: string } {
  // Bỏ hoàn toàn nghiệp vụ tăng ca ra khỏi hệ thống
  if ((kind as string) === "overtime" || (kind as string) === "shift") {
    return {
      allowed: false,
      reason: "Nghiệp vụ tăng ca đã được loại bỏ khỏi hệ thống.",
    };
  }

  // Bác sĩ chỉ xin nghỉ (nghỉ cả ngày), không đổi ca, không tăng ca
  if (expertType === "vet") {
    if (kind !== "leave") {
      return {
        allowed: false,
        reason:
          "Bác sĩ chỉ áp dụng hình thức xin nghỉ phép (nghỉ cả ngày), không áp dụng đổi ca.",
      };
    }
    return { allowed: true };
  }

  // Nhân viên full-time không đổi ca, không tăng ca -> chỉ xin nghỉ phép
  if (employmentType !== "part_time") {
    if (kind !== "leave") {
      return {
        allowed: false,
        reason:
          "Nhân sự full-time chỉ áp dụng hình thức xin nghỉ phép (nghỉ cả ngày).",
      };
    }
    return { allowed: true };
  }

  if (kind === "extra_shift" && !canRequestExtraShift(employmentType)) {
    return {
      allowed: false,
      reason:
        "Đăng ký ca làm thêm chỉ áp dụng cho nhân viên part-time.",
    };
  }
  return { allowed: true };
}

/**
 * Lấy chuỗi ngày ISO (YYYY-MM-DD) của ngày Thứ Hai trong tuần chứa referenceDate.
 */
export function getCurrentWeekMondayIso(referenceDate?: Date | string): string {
  const d = referenceDate
    ? typeof referenceDate === "string"
      ? new Date(`${referenceDate}T00:00:00`)
      : new Date(referenceDate)
    : new Date();
  const dow = d.getDay(); // 0 = Chủ Nhật
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(d);
  monday.setDate(d.getDate() + mondayOffset);

  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, "0");
  const day = String(monday.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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
 * Kiểm tra xem một khung ca của nhân viên Part-time có phải là ca nghỉ có sẵn hay không.
 * Ca nghỉ có sẵn là ca mà nhân viên KHÔNG có lịch làm việc (không có ca fixed hoặc extra_shift).
 */
export function isPartTimeOffShift(
  shifts: ExpertShift[],
  expertId: string,
  dateIso: string,
  shift?: ShiftCode
): boolean {
  if (!shift) return true;
  const hasAssignedWorkingShift = shifts.some(
    (s) =>
      s.expertId === expertId &&
      s.date === dateIso &&
      s.shift === shift &&
      (s.shiftType === "fixed" || s.shiftType === "extra_shift" || s.shiftType === undefined)
  );
  return !hasAssignedWorkingShift;
}

export const MAX_MONTHLY_LEAVE_DAYS = 4;
export const MAX_NORMAL_DAILY_HOURS = 8;
export const MAX_NORMAL_WEEKLY_HOURS = 48;
export const MAX_DAILY_WORKING_HOURS_ART_107 = 12;

// Chỉ làm việc trong giờ hành chính từ 08:00 đến 17:00 chiều (Ca sáng 4h + Ca chiều 4h = 8h/ngày)
export const SHIFT_DURATION_HOURS: Record<ShiftCode, number> = {
  morning: 4,
  afternoon: 4,
};

export function getShiftDurationHours(shift?: ShiftCode): number {
  if (!shift) return 4;
  return SHIFT_DURATION_HOURS[shift] ?? 4;
}

export function isExtraShiftRequest(req: ShiftRequest): boolean {
  return req.kind === "extra_shift";
}

export interface PartTimeExtraShiftSummary {
  month: string;
  approvedShifts: number;
  pendingShifts: number;
  approvedHours: number;
  pendingHours: number;
}

/**
 * Thống kê ca làm thêm trong tháng dành cho nhân viên part-time.
 */
export function summarizePartTimeExtraShifts(
  requests: ShiftRequest[],
  shifts: ExpertShift[],
  expertId: string,
  targetDateIso: string
): PartTimeExtraShiftSummary {
  const month = targetDateIso.slice(0, 7);
  const monthlyReqs = requests.filter(
    (r) =>
      r.expertId === expertId &&
      isExtraShiftRequest(r) &&
      r.status !== "rejected" &&
      r.date.startsWith(month)
  );
  const extraShiftEntries = shifts.filter(
    (s) =>
      s.expertId === expertId &&
      s.shiftType === "extra_shift" &&
      s.date.startsWith(month)
  );

  const approvedReqs = monthlyReqs.filter((r) => r.status === "approved");
  const pendingReqs = monthlyReqs.filter((r) => r.status === "pending");

  const getHours = (r: ShiftRequest) =>
    r.extraShiftHours ?? getShiftDurationHours(r.shift);

  const approvedHoursFromReqs = approvedReqs.reduce(
    (sum, r) => sum + getHours(r),
    0
  );
  const approvedShifts = Math.max(approvedReqs.length, extraShiftEntries.length);
  const approvedHours =
    approvedHoursFromReqs > 0
      ? approvedHoursFromReqs
      : extraShiftEntries.reduce(
          (sum, s) => sum + getShiftDurationHours(s.shift),
          0
        );

  return {
    month,
    approvedShifts,
    pendingShifts: pendingReqs.length,
    approvedHours,
    pendingHours: pendingReqs.reduce((sum, r) => sum + getHours(r), 0),
  };
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
  isAtOrOverLimit: boolean;
  exceedsOnNewRequest: boolean;
  warningMessage: string | null;
}

/**
 * Tính quỹ ngày nghỉ trong tháng (tối đa 4 ngày/tháng, reset đầu tháng, không cộng dồn).
 * Tính tất cả: nghỉ luân phiên (rotational_off), nghỉ ốm, nghỉ không lương.
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
  let extraLeaveCount = 0;

  for (const req of activeLeaveReqs) {
    if (req.leaveType === "sick") {
      sickDays += 1;
    } else if (req.leaveType === "unpaid") {
      unpaidDays += 1;
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
  const sy = sunDate.getFullYear();
  const sm = String(sunDate.getMonth() + 1).padStart(2, "0");
  const sd = String(sunDate.getDate()).padStart(2, "0");
  const weekSunday = `${sy}-${sm}-${sd}`;

  const workingShifts = shifts.filter(
    (s) =>
      s.expertId === expertId &&
      s.shiftType !== "rotational_off"
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
