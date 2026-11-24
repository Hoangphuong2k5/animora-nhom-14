import type { Booking } from "@/types";
import {
  getServiceDurationMinutes,
  resolveServiceBySlugOrName,
} from "@/data/serviceBookingData";
import { ASSIGNABLE_STAFF_OPTIONS } from "@/components/shared/operations/bookings/bookingsTypesAndData";
import { computeBookingEstimatedPriceSafe } from "./billingOps";
import {
  createAuditLogEntry,
  type ReceptionistAuditLogEntry,
} from "./types";

function parseHHMMToMinutes(hhmm: string): number {
  const clean = (hhmm || "09:00").split(" - ")[0].trim();
  const [h, m] = clean.split(":").map(Number);
  return (Number.isNaN(h) ? 9 : h) * 60 + (Number.isNaN(m) ? 0 : m);
}

function minutesToHHMM(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Kiểm tra lịch hẹn đã quá 15 phút sau giờ hẹn mà chưa check-in (Mục 5 v1.4).
 * Không áp dụng cho đơn "Làm ngay tại quầy" (walk_in_now).
 */
export function isBookingOverdue15Min(
  booking: Booking,
  now: Date = new Date()
): boolean {
  if (booking.bookingMode === "walk_in_now") return false;
  const status = booking.status || "Mới";
  if (status !== "Mới" && status !== "Đã xác nhận") return false;

  const startStr = (booking.startTime || booking.timeSlot || "09:00")
    .split(" - ")[0]
    .trim();
  const apptDt = new Date(`${booking.date}T${startStr}:00`);
  if (Number.isNaN(apptDt.getTime())) return false;
  return now.getTime() - apptDt.getTime() > 15 * 60 * 1000;
}

function matchesStaffRecord(
  booking: Booking,
  staffId: string,
  staffName: string
): boolean {
  if (booking.doctorId) {
    return booking.doctorId === staffId;
  }
  const bStaffName = (
    booking.doctorName ||
    (booking as Booking & { staffName?: string }).staffName ||
    ""
  )
    .trim()
    .toLowerCase();
  return Boolean(bStaffName && bStaffName === staffName.trim().toLowerCase());
}

export function checkInCustomerBooking(params: {
  booking: Booking;
  actorId?: string;
  actorName: string;
  now?: Date;
}): {
  updatedBooking: Booking;
  auditLog: ReceptionistAuditLogEntry;
} {
  const now = params.now || new Date();
  const { booking } = params;
  if (booking.status === "Đã hủy" || booking.status === "Hoàn thành") {
    throw new Error(
      `Không thể check-in cho lịch hẹn đang ở trạng thái "${booking.status}".`
    );
  }

  const prevStatus = booking.status || "Đã xác nhận";
  const updatedBooking: Booking = {
    ...booking,
    status: "Đã đến",
    careStage: "checked_in",
    checkedInAt: now.toISOString(),
    checkedInBy: params.actorName,
    internalNote: `LT ${params.actorName} đã check-in khách đến quầy lúc ${now.toLocaleTimeString(
      "vi-VN",
      { hour: "2-digit", minute: "2-digit" }
    )}`,
  };

  const auditLog = createAuditLogEntry({
    action: "booking_checkin",
    actionLabel: "Check-in khách đến quầy",
    actorId: params.actorId,
    actorName: params.actorName,
    targetCode: booking.code || booking.id,
    customerName: booking.fullName,
    customerPhone: booking.phone,
    beforeState: `Trạng thái: ${prevStatus}`,
    afterState: "Trạng thái: Đã đến (Checked-in)",
    now,
  });

  return { updatedBooking, auditLog };
}

/**
 * Mục 6.3: "Dời 30 phút" khi khách đến trễ trong thời gian ân hạn.
 * - Không tràn vào giờ nghỉ trưa cố định 12:00–13:00 hoặc quá 17:00.
 * - Kiểm tra nhân sự hiện tại có bị đè ca kế tiếp không; nếu trùng thì tự gán nhân sự rảnh ít ca nhất.
 */
export function delayBookingBy30Minutes(params: {
  booking: Booking;
  allBookings: Booking[];
  actorId?: string;
  actorName: string;
  now?: Date;
}): {
  ok: boolean;
  error?: string;
  updatedBooking?: Booking;
  reassignedStaffName?: string;
  auditLog?: ReceptionistAuditLogEntry;
} {
  const now = params.now || new Date();
  const { booking, allBookings } = params;

  if (
    booking.status === "Hoàn thành" ||
    booking.status === "Đã hủy" ||
    booking.status === "Không đến"
  ) {
    return {
      ok: false,
      error: `Không thể dời 30 phút cho lịch hẹn ở trạng thái "${booking.status}".`,
    };
  }

  // ver1.4.1 (🟠5): Giới hạn Dời 30 phút tối đa 1 lần mỗi đơn để tránh dời dây chuyền cả buổi
  const alreadyDelayed30m =
    (booking.internalNote || "").includes("dời 30 phút") ||
    (booking.rescheduledFrom || []).some((r) => {
      if (r.fromDate !== r.toDate || !r.fromTimeSlot || !r.toTimeSlot) return false;
      const fromMin = parseHHMMToMinutes(r.fromTimeSlot);
      const toMin = parseHHMMToMinutes(r.toTimeSlot);
      return toMin - fromMin === 30;
    });
  if (alreadyDelayed30m) {
    return {
      ok: false,
      error:
        'Lịch hẹn này đã sử dụng quyền "Dời 30 phút" (tối đa 1 lần/đơn). Vui lòng dùng chức năng Đổi lịch sang khung giờ khác.',
    };
  }

  const startMin = parseHHMMToMinutes(
    booking.startTime || booking.timeSlot || "09:00"
  );
  const duration =
    booking.durationMinutes ||
    getServiceDurationMinutes(booking.serviceSlug || booking.service) ||
    60;

  const newStartMin = startMin + 30;
  const newEndMin = newStartMin + duration;

  const LUNCH_START = 12 * 60;
  const LUNCH_END = 13 * 60;
  const CLOSE_MIN = 17 * 60;

  if (newStartMin < LUNCH_END && newEndMin > LUNCH_START) {
    return {
      ok: false,
      error:
        "Dời 30 phút sẽ tràn vào khung giờ Nghỉ trưa cố định (12:00 – 13:00). Vui lòng đổi lịch sang buổi chiều (từ 13:00).",
    };
  }

  if (newEndMin > CLOSE_MIN) {
    return {
      ok: false,
      error:
        "Dời 30 phút sẽ vượt quá giờ làm việc của phòng khám (17:00). Vui lòng đổi lịch sang ngày khác.",
    };
  }

  const resolvedService = resolveServiceBySlugOrName(
    booking.serviceSlug || booking.service
  );
  const requiresVet = resolvedService.category === "vet";

  const sameDayActive = allBookings.filter(
    (b) =>
      b.id !== booking.id &&
      b.date === booking.date &&
      b.status !== "Đã hủy" &&
      b.status !== "Không đến"
  );

  const isStaffBusyInInterval = (staffId: string, staffName: string): boolean => {
    return sameDayActive.some((b) => {
      if (!matchesStaffRecord(b, staffId, staffName)) return false;
      const bStart = parseHHMMToMinutes(b.startTime || b.timeSlot || "09:00");
      const bDur =
        b.durationMinutes ||
        getServiceDurationMinutes(b.serviceSlug || b.service) ||
        60;
      const bEnd = bStart + bDur;
      return bStart < newEndMin && bEnd > newStartMin;
    });
  };

  const currentDoctorId =
    booking.doctorId || (requiresVet ? "exp-vet-01" : "exp-spa-01");
  const currentStaffObj =
    ASSIGNABLE_STAFF_OPTIONS.find((s) => s.id === currentDoctorId) ||
    ASSIGNABLE_STAFF_OPTIONS[0];

  let targetStaff = currentStaffObj;
  let reassignedStaffName: string | undefined;

  if (isStaffBusyInInterval(currentStaffObj.id, currentStaffObj.name)) {
    const candidatePool = ASSIGNABLE_STAFF_OPTIONS.filter((s) =>
      requiresVet ? s.id.startsWith("exp-vet-") : s.id.startsWith("exp-spa-")
    );

    const availableCandidates = candidatePool
      .filter((s) => !isStaffBusyInInterval(s.id, s.name))
      .map((s) => ({
        staff: s,
        countToday: sameDayActive.filter((b) =>
          matchesStaffRecord(b, s.id, s.name)
        ).length,
      }))
      .sort((a, b) =>
        a.countToday !== b.countToday
          ? a.countToday - b.countToday
          : a.staff.id.localeCompare(b.staff.id)
      );

    if (availableCandidates.length === 0) {
      return {
        ok: false,
        error:
          "Không còn nhân sự rảnh ở khung giờ sau khi dời 30 phút. Vui lòng dùng chức năng Đổi lịch sang khung giờ khác.",
      };
    }

    targetStaff = availableCandidates[0].staff;
    reassignedStaffName = targetStaff.name;
  }

  const newStartStr = minutesToHHMM(newStartMin);
  const newEndStr = minutesToHHMM(newEndMin);
  const newSlotStr = `${newStartStr} - ${newEndStr}`;
  const oldSlotStr = booking.timeSlot || minutesToHHMM(startMin);

  const updatedBooking: Booking = {
    ...booking,
    timeSlot: newSlotStr,
    startTime: newStartStr,
    endTime: newEndStr,
    doctorId: targetStaff.id,
    doctorName: targetStaff.name,
    rescheduledFrom: [
      ...(booking.rescheduledFrom || []),
      {
        fromDate: booking.date,
        fromTimeSlot: oldSlotStr,
        toDate: booking.date,
        toTimeSlot: newSlotStr,
        changedAt: now.toISOString(),
      },
    ],
    internalNote: `LT ${params.actorName} dời 30 phút trong thời gian ân hạn (${oldSlotStr} -> ${newSlotStr})${
      reassignedStaffName ? ` • Tự gán sang ${reassignedStaffName}` : ""
    }`,
  };

  const auditLog = createAuditLogEntry({
    action: "booking_delay_30m",
    actionLabel: "Dời 30 phút (Thời gian ân hạn)",
    actorId: params.actorId,
    actorName: params.actorName,
    targetCode: booking.code || booking.id,
    customerName: booking.fullName,
    customerPhone: booking.phone,
    beforeState: `Giờ hẹn: ${oldSlotStr} (${currentStaffObj.name})`,
    afterState: `Giờ hẹn mới: ${newSlotStr} (${targetStaff.name})`,
    reason: "Khách báo đến trễ trong thời gian ân hạn",
    now,
  });

  return {
    ok: true,
    updatedBooking,
    reassignedStaffName,
    auditLog,
  };
}

export function markBookingNoShow(params: {
  booking: Booking;
  actorId?: string;
  actorName: string;
  now?: Date;
}): {
  updatedBooking: Booking;
  auditLog: ReceptionistAuditLogEntry;
} {
  const now = params.now || new Date();
  const { booking } = params;

  if (booking.bookingMode === "walk_in_now") {
    throw new Error('Đơn "Làm ngay tại quầy" không áp dụng trạng thái "Không đến".');
  }

  const price = computeBookingEstimatedPriceSafe(booking);
  const isPrepaid = booking.paymentTiming === "prepaid";

  const updatedBooking: Booking = {
    ...booking,
    status: "Không đến",
    noShowMarkedAt: now.toISOString(),
    cancellationFee: isPrepaid ? price : 0,
    refundAmount: 0,
    internalNote: `Đánh dấu Không đến (quá 15 phút sau giờ hẹn) bởi ${params.actorName}`,
  };

  const auditLog = createAuditLogEntry({
    action: "booking_noshow",
    actionLabel: "Đánh dấu Không đến (>15 phút)",
    actorId: params.actorId,
    actorName: params.actorName,
    targetCode: booking.code || booking.id,
    customerName: booking.fullName,
    customerPhone: booking.phone,
    beforeState: `Trạng thái: ${booking.status || "Đã xác nhận"}`,
    afterState: isPrepaid
      ? `Không đến • Nhả slot • Giữ 100% tiền trả trước (${price.toLocaleString("vi-VN")}đ)`
      : "Không đến • Nhả slot • Ghi nhận +1 Violation (0đ)",
    reason: "Quá 15 phút sau giờ hẹn chưa check-in",
    now,
  });

  return { updatedBooking, auditLog };
}

export function undoBookingNoShow(params: {
  booking: Booking;
  reason: string;
  allBookings: Booking[];
  actorId?: string;
  actorName: string;
  now?: Date;
}): {
  ok: boolean;
  error?: string;
  updatedBooking?: Booking;
  auditLog?: ReceptionistAuditLogEntry;
} {
  const now = params.now || new Date();
  const { booking, allBookings } = params;
  const cleanReason = (params.reason || "").trim();

  if (booking.status !== "Không đến") {
    return {
      ok: false,
      error: 'Chỉ có thể hoàn tác cho lịch hẹn đang ở trạng thái "Không đến".',
    };
  }

  if (cleanReason.length < 3) {
    return {
      ok: false,
      error:
        'Bắt buộc nhập lý do hoàn tác "Không đến" (tối thiểu 3 ký tự) để ghi Audit Log.',
    };
  }

  const startMin = parseHHMMToMinutes(
    booking.startTime || booking.timeSlot || "09:00"
  );
  const duration =
    booking.durationMinutes ||
    getServiceDurationMinutes(booking.serviceSlug || booking.service) ||
    60;
  const endMin = startMin + duration;

  const sameDayActive = allBookings.filter(
    (b) =>
      b.id !== booking.id &&
      b.date === booking.date &&
      b.status !== "Đã hủy" &&
      b.status !== "Không đến"
  );

  const resolvedService = resolveServiceBySlugOrName(
    booking.serviceSlug || booking.service
  );
  const requiresVet = resolvedService.category === "vet";
  const currentDoctorId =
    booking.doctorId || (requiresVet ? "exp-vet-01" : "exp-spa-01");
  const currentStaffObj =
    ASSIGNABLE_STAFF_OPTIONS.find((s) => s.id === currentDoctorId) ||
    ASSIGNABLE_STAFF_OPTIONS[0];

  const isDoctorOccupied = (docId: string, docName: string) =>
    sameDayActive.some((b) => {
      if (!matchesStaffRecord(b, docId, docName)) return false;
      const bStart = parseHHMMToMinutes(b.startTime || b.timeSlot || "09:00");
      const bDur =
        b.durationMinutes ||
        getServiceDurationMinutes(b.serviceSlug || b.service) ||
        60;
      return bStart < endMin && bStart + bDur > startMin;
    });

  let restoredDoctorId = currentStaffObj.id;
  let restoredDoctorName = booking.doctorName || currentStaffObj.name;

  if (isDoctorOccupied(currentStaffObj.id, currentStaffObj.name)) {
    const candidatePool = ASSIGNABLE_STAFF_OPTIONS.filter((s) =>
      requiresVet ? s.id.startsWith("exp-vet-") : s.id.startsWith("exp-spa-")
    );
    const replacement = candidatePool.find(
      (s) => !isDoctorOccupied(s.id, s.name)
    );
    if (!replacement) {
      return {
        ok: false,
        error:
          "Khung giờ này đã được khách khác đặt đầy sau khi nhả slot. Vui lòng đổi sang khung giờ khác.",
      };
    }
    restoredDoctorId = replacement.id;
    restoredDoctorName = replacement.name;
  }

  const isPrepaid = booking.paymentTiming === "prepaid";
  const updatedBooking: Booking = {
    ...booking,
    status: "Đã đến",
    careStage: "checked_in",
    doctorId: restoredDoctorId,
    doctorName: restoredDoctorName,
    checkedInAt: now.toISOString(),
    checkedInBy: params.actorName,
    noShowUndoneAt: now.toISOString(),
    noShowUndoReason: cleanReason,
    noShowUndoneBy: params.actorName,
    cancellationFee: 0,
    ...(isPrepaid ? { paymentState: "paid" as const } : {}),
    internalNote: `LT ${params.actorName} hoàn tác Không đến & Check-in (Lý do: ${cleanReason})`,
  };

  const auditLog = createAuditLogEntry({
    action: "booking_undo_noshow",
    actionLabel: 'Hoàn tác "Không đến" & Check-in',
    actorId: params.actorId,
    actorName: params.actorName,
    targetCode: booking.code || booking.id,
    customerName: booking.fullName,
    customerPhone: booking.phone,
    beforeState: "Trạng thái: Không đến (+1 Violation)",
    afterState: `Trạng thái: Đã đến (Đã trừ lại Violation • Phụ trách: ${restoredDoctorName})`,
    reason: cleanReason,
    now,
  });

  return {
    ok: true,
    updatedBooking,
    auditLog,
  };
}
