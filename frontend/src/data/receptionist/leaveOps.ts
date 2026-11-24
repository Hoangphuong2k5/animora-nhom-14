import { safeGetStorage, safeSetStorage } from "@/utils/cartLogic";
import {
  MAX_MONTHLY_LEAVE_DAYS,
  getCurrentWeekMondayIso,
  isDateInPastWeek,
  type MonthlyLeaveQuotaSummary,
} from "@/utils/expertPolicy";
import { appendReceptionistAuditLog, dispatchReceptionistSync } from "./storage";
import {
  createAuditLogEntry,
  RECEPTIONIST_STORAGE_KEYS,
  type ReceptionistLeaveRequest,
  type ReceptionistLeaveType,
} from "./types";

export const RECEPTIONIST_LEAVE_TYPE_LABELS: Record<ReceptionistLeaveType, string> = {
  rotational: "Nghỉ luân phiên (Quỹ 4 ngày/tháng)",
  sick: "Nghỉ ốm (Quỹ 4 ngày/tháng)",
  unpaid: "Nghỉ không lương (Quỹ 4 ngày/tháng)",
};

export const DEFAULT_RECEPTIONIST_PROFILE = {
  id: "rec-01",
  fullName: "LT. Trần Ngọc Bảo Trâm",
  email: "receptionist@animora.vn",
} as const;

export function readReceptionistLeaveRequests(): ReceptionistLeaveRequest[] {
  return safeGetStorage<ReceptionistLeaveRequest[]>(
    RECEPTIONIST_STORAGE_KEYS.leaveRequests,
    []
  );
}

export function writeReceptionistLeaveRequests(
  requests: ReceptionistLeaveRequest[]
): void {
  safeSetStorage(RECEPTIONIST_STORAGE_KEYS.leaveRequests, requests);
  dispatchReceptionistSync();
}

/**
 * Đánh giá quỹ nghỉ phép tháng của Lễ tân (tối đa 4 ngày/tháng, reset ngày 01).
 * Tính các đơn `pending` và `approved` trong tháng; không tính đơn `rejected`.
 */
export function evaluateReceptionistMonthlyLeaveQuota(
  requests: ReceptionistLeaveRequest[],
  staffId: string,
  targetDateIso: string
): MonthlyLeaveQuotaSummary {
  const month = targetDateIso.slice(0, 7);
  const active = requests.filter(
    (r) =>
      r.staffId === staffId &&
      r.status !== "rejected" &&
      r.date.startsWith(month)
  );

  let rotationalDays = 0;
  let sickDays = 0;
  let unpaidDays = 0;

  for (const r of active) {
    if (r.leaveType === "rotational") rotationalDays += 1;
    else if (r.leaveType === "sick") sickDays += 1;
    else unpaidDays += 1;
  }

  const usedDays = active.length;
  const remainingDays = Math.max(0, MAX_MONTHLY_LEAVE_DAYS - usedDays);
  const isAtOrOverLimit = usedDays >= MAX_MONTHLY_LEAVE_DAYS;
  const exceedsOnNewRequest = usedDays + 1 > MAX_MONTHLY_LEAVE_DAYS;

  const warningMessage = exceedsOnNewRequest
    ? `Vượt hạn mức ${MAX_MONTHLY_LEAVE_DAYS} ngày nghỉ/tháng (${usedDays}/${MAX_MONTHLY_LEAVE_DAYS} ngày đã dùng) — đơn sẽ được gắn cờ "vượt hạn mức / nghỉ không lương" gửi Quản lý duyệt.`
    : null;

  return {
    month,
    maxDays: MAX_MONTHLY_LEAVE_DAYS,
    usedDays,
    remainingDays,
    absenceCount: usedDays,
    rotationalDays,
    sickDays,
    unpaidDays,
    emergencyDays: 0,
    isAtOrOverLimit,
    exceedsOnNewRequest,
    warningMessage,
  };
}

/**
 * Lễ tân gửi đơn xin nghỉ phép thường (gọn nhẹ):
 * - Chặn ngày thuộc tuần đã qua (dùng chung quy tắc `isDateInPastWeek`).
 * - Chặn gửi trùng ngày đã có đơn `pending` / `approved`.
 * - KHÔNG chặn theo lịch hẹn khách hàng (LT không nằm trong bộ máy tự gán slot).
 * - Tự động gắn cảnh báo trống quầy để Quản lý bố trí người trực thay khi duyệt.
 */
export function submitReceptionistLeaveRequest(input: {
  staffId: string;
  staffName: string;
  staffEmail: string;
  date: string;
  leaveType: ReceptionistLeaveType;
  reason: string;
  referenceDateIso?: string;
}): { ok: boolean; error?: string; request?: ReceptionistLeaveRequest } {
  const trimmedReason = input.reason.trim();
  if (!input.date) {
    return { ok: false, error: "Vui lòng chọn ngày xin nghỉ phép." };
  }
  if (trimmedReason.length < 4) {
    return { ok: false, error: "Vui lòng nhập lý do xin nghỉ (tối thiểu 4 ký tự)." };
  }
  if (isDateInPastWeek(input.date, input.referenceDateIso)) {
    const monday = getCurrentWeekMondayIso(input.referenceDateIso);
    return {
      ok: false,
      error: `Không thể xin nghỉ phép cho tuần đã qua (chỉ nhận từ Thứ Hai ${monday} trở đi).`,
    };
  }
  const selectedDay = new Date(`${input.date}T00:00:00`).getDay();
  if (selectedDay === 0) {
    return {
      ok: false,
      error:
        "Chủ Nhật là ngày nghỉ cố định của phòng khám (chỉ làm Thứ 2 – Thứ 7), không cần gửi đơn xin nghỉ.",
    };
  }

  const current = readReceptionistLeaveRequests();
  const duplicated = current.some(
    (r) =>
      r.staffId === input.staffId &&
      r.date === input.date &&
      r.status !== "rejected"
  );
  if (duplicated) {
    return {
      ok: false,
      error: `Bạn đã có đơn xin nghỉ phép cho ngày ${input.date}.`,
    };
  }

  const quota = evaluateReceptionistMonthlyLeaveQuota(
    current,
    input.staffId,
    input.date
  );
  const warnings: string[] = [
    "Cảnh báo trống quầy — cần Quản lý bố trí người trực thay (không khóa slot đặt lịch khách hàng).",
  ];
  if (quota.warningMessage) {
    warnings.push(quota.warningMessage);
  }

  const nowIso = new Date().toISOString();
  const newReq: ReceptionistLeaveRequest = {
    id: `rec-leave-${Date.now()}`,
    staffId: input.staffId,
    staffName: input.staffName,
    staffEmail: input.staffEmail,
    date: input.date,
    leaveType: input.leaveType,
    reason: trimmedReason,
    status: "pending",
    createdAt: nowIso,
    exceedsMonthlyLeaveLimit: quota.exceedsOnNewRequest,
    policyWarnings: warnings,
  };

  writeReceptionistLeaveRequests([newReq, ...current]);
  appendReceptionistAuditLog(
    createAuditLogEntry({
      action: "leave_request_submit",
      actionLabel: "Gửi đơn xin nghỉ phép (Lễ tân)",
      actorId: input.staffId,
      actorName: input.staffName,
      targetCode: newReq.id,
      beforeState: `Quỹ tháng ${quota.month}: ${quota.usedDays}/${quota.maxDays} ngày`,
      afterState: `Chờ duyệt nghỉ ngày ${input.date} (${RECEPTIONIST_LEAVE_TYPE_LABELS[input.leaveType]})`,
      reason: trimmedReason,
    })
  );

  return { ok: true, request: newReq };
}

/**
 * Lễ tân tự hủy đơn xin nghỉ khi đơn vẫn đang ở trạng thái `pending`.
 */
export function cancelReceptionistLeaveRequest(
  requestId: string,
  actor: { id: string; name: string }
): { ok: boolean; error?: string } {
  const current = readReceptionistLeaveRequests();
  const target = current.find((r) => r.id === requestId);
  if (!target) {
    return { ok: false, error: "Không tìm thấy đơn xin nghỉ phép." };
  }
  if (target.status !== "pending") {
    return {
      ok: false,
      error: "Chỉ có thể hủy đơn đang ở trạng thái Chờ duyệt.",
    };
  }

  const next = current.filter((r) => r.id !== requestId);
  writeReceptionistLeaveRequests(next);
  appendReceptionistAuditLog(
    createAuditLogEntry({
      action: "leave_request_cancel",
      actionLabel: "Hủy đơn xin nghỉ phép (Chờ duyệt)",
      actorId: actor.id,
      actorName: actor.name,
      targetCode: target.id,
      beforeState: `Chờ duyệt nghỉ ngày ${target.date}`,
      afterState: "Đã hủy đơn bởi Lễ tân",
    })
  );

  return { ok: true };
}

/**
 * Quản lý phê duyệt hoặc từ chối đơn xin nghỉ phép của Lễ tân.
 * Lưu ý: KHÔNG khóa slot đặt lịch khách hàng.
 */
export function reviewReceptionistLeaveRequest(
  requestId: string,
  decision: "approved" | "rejected",
  reviewerName: string,
  managerNote?: string
): ReceptionistLeaveRequest | null {
  const current = readReceptionistLeaveRequests();
  const idx = current.findIndex((r) => r.id === requestId);
  if (idx < 0) return null;

  const nowIso = new Date().toISOString();
  const updated: ReceptionistLeaveRequest = {
    ...current[idx],
    status: decision,
    reviewedBy: reviewerName,
    reviewedAt: nowIso,
    managerNote: managerNote?.trim() || undefined,
  };

  const next = [...current];
  next[idx] = updated;
  writeReceptionistLeaveRequests(next);

  appendReceptionistAuditLog(
    createAuditLogEntry({
      action: "leave_request_review",
      actionLabel:
        decision === "approved"
          ? "Quản lý duyệt đơn nghỉ phép Lễ tân"
          : "Quản lý từ chối đơn nghỉ phép Lễ tân",
      actorId: "manager-01",
      actorName: reviewerName,
      targetCode: updated.id,
      beforeState: `Chờ duyệt nghỉ ngày ${updated.date} (${updated.staffName})`,
      afterState:
        decision === "approved"
          ? `Đã duyệt nghỉ ngày ${updated.date} (Không khóa slot khách)`
          : `Từ chối nghỉ ngày ${updated.date}`,
      reason: managerNote?.trim() || undefined,
    })
  );

  return updated;
}
