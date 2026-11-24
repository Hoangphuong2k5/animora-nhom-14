import type { Booking } from "@/types";
import { normalizeVietnamPhone } from "./customerPetOps";
import type { CustomerViolationAssessment } from "./types";

function parseBookingTimestampMs(b: Booking): number {
  const datePart = b.date || "2026-01-01";
  const slotPart = ((b.timeSlot || "09:00").split(" - ")[0] || "09:00").trim();
  const dt = new Date(`${datePart}T${slotPart}:00`);
  return Number.isNaN(dt.getTime())
    ? new Date(b.createdAt || Date.now()).getTime()
    : dt.getTime();
}

function isViolationBookingRecord(b: Booking): {
  isViolation: boolean;
  kind?: "late_cancel" | "no_show";
  timestampMs: number;
} {
  if (b.cancelWithoutPenalty) {
    return { isViolation: false, timestampMs: 0 };
  }
  if (b.bookingMode === "walk_in_now") {
    // Mục 5: Khách làm ngay tại quầy (không hẹn trước) không có "không đến"
    return { isViolation: false, timestampMs: 0 };
  }

  if (b.status === "Không đến") {
    const ts = b.noShowMarkedAt
      ? new Date(b.noShowMarkedAt).getTime()
      : parseBookingTimestampMs(b);
    return { isViolation: true, kind: "no_show", timestampMs: ts };
  }

  if (b.status === "Đã hủy") {
    // Mục 5: Hủy trong vòng 3 giờ đối với đơn Trả sau tính 1 violation
    const apptMs = parseBookingTimestampMs(b);
    const cancelMs = b.cancelledAt ? new Date(b.cancelledAt).getTime() : 0;
    const cancelledUnder3h =
      (cancelMs > 0 && (apptMs - cancelMs) / 3_600_000 < 3) ||
      Boolean(b.cancellationFee && b.cancellationFee > 0);
    if (cancelledUnder3h && (b.paymentTiming || "postpaid") === "postpaid") {
      return {
        isViolation: true,
        kind: "late_cancel",
        timestampMs: cancelMs > 0 ? cancelMs : apptMs,
      };
    }
  }

  return { isViolation: false, timestampMs: 0 };
}

function isQualifiedPrepaidForUnlock(b: Booking): boolean {
  if (b.paymentTiming !== "prepaid" || b.status !== "Hoàn thành") {
    return false;
  }
  // ver1.4.1 (🔴2): Bắt buộc đã thanh toán thực tế (paymentState = paid), chặn lách luật bằng đơn chưa trả
  const isActuallyPaid =
    b.paymentState === "paid" ||
    (b as Booking & { paymentStatus?: string }).paymentStatus === "paid";
  if (!isActuallyPaid) {
    return false;
  }
  // Kênh Online không chấp nhận "nộp tiền mặt tại quầy" như một ca trả trước để mở khóa
  if (
    (b.bookingChannel || "online") === "online" &&
    b.paymentMethod === "counter"
  ) {
    return false;
  }
  return true;
}

/**
 * Mục 5 (ver1.4.1):
 * - violation_count = số lần hủy dưới 3 giờ (trả sau) và không đến, tính trong cửa sổ 90 ngày (sau mốc violation_reset_at nếu đã từng mở khóa).
 * - Đạt 2 thì khóa lựa chọn "trả sau"; khách đặt online bắt buộc trả trước online.
 * - Mở lại khi khách hoàn thành 2 ca đã thanh toán trước thực tế tính từ sau thời điểm bị khóa (ghi nhận postpaidUnlockedAt & reset bộ đếm về 0).
 * - Khách có vi phạm: LT thấy cảnh báo khi đặt giúp, không bị chặn.
 */
export function evaluateCustomerViolationStatus(
  rawPhone: string,
  bookings: Booking[],
  now: Date = new Date()
): CustomerViolationAssessment {
  const normPhone = normalizeVietnamPhone(rawPhone);
  if (!normPhone) {
    return {
      phone: "",
      violationCount: 0,
      lateCancelCount: 0,
      noShowCount: 0,
      prepaidCompletedSinceLock: 0,
      isPostpaidLocked: false,
      postpaidUnlockedAt: null,
      hasWarning: false,
      warningMessage: null,
      lockReasonMessage: null,
    };
  }

  const MS_90_DAYS = 90 * 24 * 60 * 60 * 1000;
  const windowStartMs = now.getTime() - MS_90_DAYS;

  const customerBookings = bookings.filter(
    (b) => normalizeVietnamPhone(b.phone) === normPhone
  );

  const violationsInWindow: Array<{
    kind: "late_cancel" | "no_show";
    timestampMs: number;
  }> = [];

  for (const b of customerBookings) {
    const check = isViolationBookingRecord(b);
    if (
      check.isViolation &&
      check.kind &&
      check.timestampMs >= windowStartMs &&
      check.timestampMs <= now.getTime() + 24 * 3600_000
    ) {
      violationsInWindow.push({
        kind: check.kind,
        timestampMs: check.timestampMs,
      });
    }
  }

  const timelineEvents: Array<
    | { type: "violation"; kind: "late_cancel" | "no_show"; ts: number }
    | { type: "prepaid_completed"; ts: number }
  > = [
    ...violationsInWindow.map((v) => ({
      type: "violation" as const,
      kind: v.kind,
      ts: v.timestampMs,
    })),
    ...customerBookings
      .filter(
        (b) =>
          isQualifiedPrepaidForUnlock(b) &&
          parseBookingTimestampMs(b) >= windowStartMs
      )
      .map((b) => ({
        type: "prepaid_completed" as const,
        ts: b.completedAt
          ? new Date(b.completedAt).getTime()
          : parseBookingTimestampMs(b),
      })),
  ].sort((a, b) => a.ts - b.ts);

  let activeViolationCount = 0;
  let activeLateCancelCount = 0;
  let activeNoShowCount = 0;
  let isLocked = false;
  let prepaidCompletedWhileLocked = 0;
  let lastUnlockedAtMs: number | null = null;

  for (const ev of timelineEvents) {
    if (ev.type === "violation") {
      activeViolationCount += 1;
      if (ev.kind === "late_cancel") activeLateCancelCount += 1;
      if (ev.kind === "no_show") activeNoShowCount += 1;
      if (activeViolationCount >= 2) {
        isLocked = true;
      }
    } else if (ev.type === "prepaid_completed" && isLocked) {
      prepaidCompletedWhileLocked += 1;
      if (prepaidCompletedWhileLocked >= 2) {
        isLocked = false;
        activeViolationCount = 0;
        activeLateCancelCount = 0;
        activeNoShowCount = 0;
        prepaidCompletedWhileLocked = 0;
        lastUnlockedAtMs = ev.ts;
      }
    }
  }

  const hasWarning = activeViolationCount > 0;
  const warningMessage = hasWarning
    ? `Khách hàng có ${activeViolationCount} vi phạm trong 90 ngày qua (${activeNoShowCount} lần không đến, ${activeLateCancelCount} lần hủy dưới 3h). Lễ tân vẫn được phép đặt lịch giúp.`
    : null;

  const lockReasonMessage = isLocked
    ? `Khách hàng đang bị khóa lựa chọn "Trả sau" do đạt ${activeViolationCount}/2 lần vi phạm trong 90 ngày. Cần thanh toán trả trước online (hoặc thanh toán ngay tại quầy trước khi làm — đã hoàn thành ${prepaidCompletedWhileLocked}/2 ca trả trước hợp lệ để mở khóa lại).`
    : null;

  return {
    phone: normPhone,
    violationCount: activeViolationCount,
    lateCancelCount: activeLateCancelCount,
    noShowCount: activeNoShowCount,
    prepaidCompletedSinceLock: prepaidCompletedWhileLocked,
    isPostpaidLocked: isLocked,
    postpaidUnlockedAt: lastUnlockedAtMs
      ? new Date(lastUnlockedAtMs).toISOString()
      : null,
    hasWarning,
    warningMessage,
    lockReasonMessage,
  };
}
