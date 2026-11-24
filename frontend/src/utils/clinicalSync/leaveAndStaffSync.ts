import { SEED_EXPERTS } from "@/data/expertPortalData";
import { formatDateDdMmYyyy } from "@/utils/dateFormat";
import { isSundayDateIso } from "@/utils/expertPolicy";
import type {
  ExpertAppointment,
  ExpertCertificate,
  ExpertNotification,
  ExpertProfile,
  ExpertShift,
  ExpertStoreState,
  ShiftAssignmentType,
  ShiftCode,
  ShiftRequest,
} from "@/types/expert.type";
import {
  EXPERT_IDS,
  createSyncEntityId,
  readExpertStore,
  writeExpertStore,
} from "./expertStorage";
import { syncExpertAppointmentToAdminBookings } from "./bookingSync";

export interface AggregatedShiftRequest {
  expertId: string;
  profile: ExpertProfile;
  request: ShiftRequest;
}

export function readAllExpertProfiles(): ExpertProfile[] {
  return EXPERT_IDS.map((id) => {
    const store = readExpertStore(id);
    return store.profile || SEED_EXPERTS[id];
  });
}

export function readAllExpertShiftRequests(): AggregatedShiftRequest[] {
  const items: AggregatedShiftRequest[] = [];
  for (const expertId of EXPERT_IDS) {
    const store = readExpertStore(expertId);
    const profile = store.profile || SEED_EXPERTS[expertId];
    for (const request of store.shiftRequests) {
      items.push({ expertId, profile, request });
    }
  }
  return items.sort((a, b) =>
    b.request.createdAt.localeCompare(a.request.createdAt)
  );
}

/**
 * Manager duyệt / từ chối đơn xin nghỉ phép thường (leave)
 * cho bất kỳ chuyên viên nào và khóa ngay slot / cập nhật vào lịch tuần của chuyên viên đó.
 */
export function updateExpertShiftRequestDecision(
  expertId: string,
  reqId: string,
  decision: "approved" | "rejected",
  adminNote?: string
): ExpertStoreState | null {
  const store = readExpertStore(expertId);
  const targetReq = store.shiftRequests.find((r) => r.id === reqId);
  if (!targetReq) return null;

  const finalNote =
    adminNote?.trim() ||
    (decision === "approved"
      ? "Manager đã phê duyệt."
      : "Manager từ chối yêu cầu.");

  const updatedRequests = store.shiftRequests.map((r) =>
    r.id === reqId ? { ...r, status: decision, adminNote: finalNote } : r
  );

  let updatedShifts: ExpertShift[] = [...store.shifts];
  if (decision === "approved" && targetReq.kind === "leave") {
    updatedShifts = updatedShifts.filter(
      (s) =>
        !(
          s.date === targetReq.date &&
          (!targetReq.shift || s.shift === targetReq.shift)
        )
    );
    if (targetReq.leaveType === "rotational") {
      updatedShifts.push({
        id: createSyncEntityId("sh-rot"),
        expertId,
        date: targetReq.date,
        shift: targetReq.shift || "morning",
        shiftType: "rotational_off",
      });
    }
  }

  const kindLabel = "đơn xin nghỉ phép";
  const notif: ExpertNotification = {
    id: createSyncEntityId("notif-sh"),
    expertId,
    type: "shift_result",
    title: {
      vi:
        decision === "approved"
          ? `Đã duyệt ${kindLabel}`
          : `Từ chối ${kindLabel}`,
      en: decision === "approved" ? "Shift request approved" : "Shift request rejected",
    },
    body: {
      vi: `Ngày ${formatDateDdMmYyyy(targetReq.date)}: ${finalNote}`,
      en: `Date ${formatDateDdMmYyyy(targetReq.date)}: ${finalNote}`,
    },
    at: "Vừa xong",
    unread: true,
    href: "/expert/schedule",
  };

  const nextStore: ExpertStoreState = {
    ...store,
    shiftRequests: updatedRequests,
    shifts: updatedShifts,
    notifications: [notif, ...store.notifications],
  };
  writeExpertStore(expertId, nextStore);
  return nextStore;
}

/**
 * Quy trình Nghỉ đột xuất (Animora v1.4 - Mục 7):
 * Manager tạo trực tiếp bản ghi nghỉ đột xuất (đã duyệt), trừ quỹ 4 ngày/tháng,
 * khóa ngay ca làm việc ngày đó và trả về danh sách lịch hẹn bị ảnh hưởng để điều phối.
 */
export function createEmergencyLeaveByManager(
  expertId: string,
  dateIso: string,
  reason: string,
  managerName = "Manager"
): {
  ok: boolean;
  error?: string;
  request?: ShiftRequest;
  impactedAppointments: ExpertAppointment[];
} {
  if (!dateIso) {
    return { ok: false, error: "Vui lòng chọn ngày nghỉ đột xuất.", impactedAppointments: [] };
  }
  if (isSundayDateIso(dateIso)) {
    return {
      ok: false,
      error: "Chủ Nhật là ngày nghỉ cố định (T2–T7), không cần tạo nghỉ đột xuất.",
      impactedAppointments: [],
    };
  }

  const store = readExpertStore(expertId);
  const existingLeave = store.shiftRequests.find(
    (r) => r.kind === "leave" && r.date === dateIso && r.status === "approved"
  );
  if (existingLeave) {
    return {
      ok: false,
      error: `Nhân sự này đã có bản ghi nghỉ phép được duyệt ngày ${formatDateDdMmYyyy(dateIso)}.`,
      impactedAppointments: [],
    };
  }

  const impactedAppointments = store.appointments.filter(
    (a) =>
      a.expertId === expertId &&
      a.status !== "cancelled" &&
      a.status !== "completed" &&
      a.startAt.startsWith(dateIso)
  );

  const nowIso = new Date().toISOString();
  const cleanReason = reason.trim() || "Nghỉ đột xuất (đã gọi video call báo Quản lý)";
  const emergencyReq: ShiftRequest = {
    id: createSyncEntityId("req-emg"),
    expertId,
    kind: "leave",
    leaveType: "emergency",
    date: dateIso,
    shift: undefined,
    reason: cleanReason,
    status: "approved",
    createdAt: nowIso,
    adminNote: `${managerName} tạo nghỉ đột xuất — Đã khóa slot ngay (${impactedAppointments.length} lịch hẹn cần điều phối).`,
  };

  const updatedShifts = store.shifts.filter((s) => s.date !== dateIso);
  const updatedAppointments = store.appointments.map((a) => {
    if (!impactedAppointments.some((imp) => imp.id === a.id)) return a;
    return {
      ...a,
      cancelRequest: {
        reason: `Nhân sự nghỉ đột xuất ngày ${formatDateDdMmYyyy(dateIso)}: ${cleanReason}`,
        requestedAt: nowIso,
        status: "pending_admin" as const,
      },
      history: [
        ...a.history,
        {
          at: nowIso.slice(0, 16).replace("T", " "),
          status: "cancel_requested" as const,
          note: {
            vi: `Quản lý ghi nhận nghỉ đột xuất — Cần đổi nhân sự thay thế hoặc liên hệ khách dời lịch`,
            en: "Manager recorded emergency leave — Needs reassignment",
          },
        },
      ],
    };
  });

  const notif: ExpertNotification = {
    id: createSyncEntityId("notif-emg"),
    expertId,
    type: "shift_result",
    title: {
      vi: "Đã ghi nhận nghỉ đột xuất",
      en: "Emergency leave recorded",
    },
    body: {
      vi: `Ngày ${formatDateDdMmYyyy(dateIso)}: ${cleanReason}. Slot đã khóa và trừ vào quỹ 4 ngày/tháng.`,
      en: `Date ${formatDateDdMmYyyy(dateIso)}: ${cleanReason}.`,
    },
    at: "Vừa xong",
    unread: true,
    href: "/expert/schedule",
  };

  writeExpertStore(expertId, {
    ...store,
    shiftRequests: [emergencyReq, ...store.shiftRequests],
    shifts: updatedShifts,
    appointments: updatedAppointments,
    notifications: [notif, ...store.notifications],
  });

  for (const appt of updatedAppointments) {
    if (impactedAppointments.some((imp) => imp.id === appt.id)) {
      syncExpertAppointmentToAdminBookings(appt);
    }
  }

  return { ok: true, request: emergencyReq, impactedAppointments };
}

export function assignManagerShiftToExpert(
  expertId: string,
  dateIso: string,
  shift: ShiftCode,
  shiftType: ShiftAssignmentType
): void {
  const store = readExpertStore(expertId);
  const nextShifts: ExpertShift[] = [
    ...store.shifts,
    {
      id: createSyncEntityId("sh-mgr"),
      expertId,
      date: dateIso,
      shift,
      shiftType,
    },
  ];
  writeExpertStore(expertId, { ...store, shifts: nextShifts });
}

/**
 * Manager duyệt hoặc từ chối bằng cấp/chứng chỉ trong hồ sơ chuyên viên.
 */
export function reviewExpertCertificate(
  expertId: string,
  certId: string,
  decision: "approved" | "rejected",
  rejectReason?: string
): ExpertStoreState | null {
  const store = readExpertStore(expertId);
  const currentCerts: ExpertCertificate[] =
    store.profile?.certificates || SEED_EXPERTS[expertId]?.certificates || [];
  const target = currentCerts.find((c) => c.id === certId);
  if (!target) return null;

  const nextCerts: ExpertCertificate[] = currentCerts.map((c) => {
    if (c.id !== certId) return c;
    return {
      ...c,
      status: decision,
      rejectReason:
        decision === "rejected"
          ? rejectReason?.trim() || "Chưa đạt yêu cầu xác minh, vui lòng tải lại bản rõ nét."
          : undefined,
    };
  });

  const notif: ExpertNotification = {
    id: createSyncEntityId("notif-cert"),
    expertId,
    type: "shift_result",
    title: {
      vi:
        decision === "approved"
          ? "Chứng chỉ đã được phê duyệt"
          : "Chứng chỉ cần bổ sung lại",
      en: decision === "approved" ? "Certificate approved" : "Certificate rejected",
    },
    body: {
      vi:
        decision === "approved"
          ? `Quản lý nghiệp vụ đã duyệt: ${target.name}`
          : `Từ chối "${target.name}": ${rejectReason || "Vui lòng kiểm tra lại hồ sơ."}`,
      en: target.name,
    },
    at: "Vừa xong",
    unread: true,
    href: "/expert/profile",
  };

  const nextStore: ExpertStoreState = {
    ...store,
    profile: {
      ...(store.profile || SEED_EXPERTS[expertId]),
      certificates: nextCerts,
    },
    notifications: [notif, ...store.notifications],
  };
  writeExpertStore(expertId, nextStore);
  return nextStore;
}

