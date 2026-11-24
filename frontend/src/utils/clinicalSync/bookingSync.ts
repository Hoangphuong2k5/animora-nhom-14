import { SEED_EXPERTS, SEED_OWNERS, SEED_PETS } from "@/data/expertPortalData";
import { formatDateDdMmYyyy } from "@/utils/dateFormat";
import type { Booking, BookingReview } from "@/types/animora.type";
import type {
  CareServiceStage,
  ExpertAppointment,
  ExpertNotification,
  ExpertReview,
} from "@/types/expert.type";
import {
  ADMIN_BOOKINGS_STORAGE_KEY,
  ADMIN_BOOKINGS_SYNC_EVENT,
  EXPERT_IDS,
  createSyncEntityId,
  readExpertStore,
  readExpertStoreByKey,
  resolveExpertStoreKey,
  writeExpertStore,
  writeExpertStoreByKey,
} from "./expertStorage";

function mapBookingServiceToExpertServiceId(
  serviceSlug?: string,
  serviceName?: string
): string {
  const key = `${serviceSlug || ""} ${serviceName || ""}`.toLowerCase();
  if (key.includes("cắt tỉa") || key.includes("tạo kiểu")) return "srv-spa-02";
  if (key.includes("vệ sinh") || key.includes("móng")) return "srv-spa-03";
  if (key.includes("spa") || key.includes("tắm")) return "srv-spa-01";
  if (key.includes("tiêm") || key.includes("vaccine")) return "srv-vet-03";
  if (key.includes("nha khoa") || key.includes("dental")) return "srv-vet-02";
  return "srv-vet-01";
}

function mapBookingPetToSeedPetId(petName?: string): string {
  if (petName) {
    const clean = petName.trim().toLowerCase();
    const matched = SEED_PETS.find((p) => p.name.trim().toLowerCase() === clean);
    if (matched) return matched.id;
  }
  return SEED_PETS[0]?.id || "pet-001";
}

export function syncCustomerBookingToExpertStore(
  booking: Booking,
  sourceLabel: string = "khách hàng"
): void {
  if (typeof window === "undefined") return;
  const { expertId, storageKey } = resolveExpertStoreKey(booking.doctorId);
  const store = readExpertStoreByKey(expertId, storageKey);
  const code = booking.code || booking.id;
  const startAt = `${booking.date}T${booking.timeSlot || "09:00"}`;

  const existing = store.appointments.find((a) => a.code === code || a.id === booking.id);
  const mappedStatus: ExpertAppointment["status"] =
    booking.status === "Đã xác nhận" || booking.status === "Đã đến"
      ? "upcoming"
      : booking.status === "Đang làm"
      ? "in_progress"
      : booking.status === "Hoàn thành"
      ? "completed"
      : booking.status === "Đã hủy" || booking.status === "Không đến"
      ? "cancelled"
      : "pending";
  const nowShort = new Date().toISOString().slice(0, 16);
  const resolvedCheckedInAt =
    booking.status === "Đã đến"
      ? booking.checkedInAt || existing?.checkedInAt || nowShort
      : booking.checkedInAt || existing?.checkedInAt;
  const resolvedCancelReason =
    booking.status === "Không đến"
      ? booking.cancelReason || "Khách không đến (quá 15 phút sau giờ hẹn)"
      : booking.cancelReason ?? existing?.cancelReason;
  const resolvedCancelledBy =
    booking.status === "Không đến"
      ? ("no_show" as const)
      : booking.status === "Đã hủy"
      ? sourceLabel === "Quản lý"
        ? ("admin" as const)
        : ("customer" as const)
      : existing?.cancelledBy;

  const nextAppointments: ExpertAppointment[] = existing
    ? store.appointments.map((a) =>
        a.id === existing.id
          ? {
              ...a,
              startAt,
              status: mappedStatus,
              checkedInAt: resolvedCheckedInAt,
              actualWeightKg: booking.actualWeightKg ?? a.actualWeightKg,
              adjustedPrice: booking.estimatedPrice ?? a.adjustedPrice,
              paymentTiming: booking.paymentTiming ?? a.paymentTiming,
              paymentState: booking.paymentState ?? a.paymentState,
              cancelledAt:
                booking.status === "Không đến"
                  ? booking.cancelledAt || nowShort
                  : booking.cancelledAt ?? a.cancelledAt,
              cancelledBy: resolvedCancelledBy,
              cancelReason: resolvedCancelReason,
              history: [
                ...a.history,
                {
                  at: nowShort.replace("T", " "),
                  status: mappedStatus,
                  note: {
                    vi:
                      booking.status === "Đã đến"
                        ? `Lễ tân (${sourceLabel}) xác nhận khách đã đến quầy (Check-in)`
                        : booking.status === "Không đến"
                        ? `Lễ tân (${sourceLabel}) đánh dấu khách không đến (No-show)`
                        : booking.status === "Đã hủy"
                        ? `${sourceLabel === "Quản lý" ? "Quản lý" : "Khách hàng"} hủy lịch${booking.cancellationFee ? ` (phí ${booking.cancellationFee.toLocaleString("vi-VN")}đ)` : ""}`
                        : `Đồng bộ cập nhật từ ${sourceLabel}`,
                    en:
                      booking.status === "Đã đến"
                        ? "Receptionist checked in customer"
                        : booking.status === "Không đến"
                        ? "Customer marked no-show"
                        : sourceLabel === "Quản lý"
                        ? "Synced update from manager"
                        : "Synced update from customer",
                  },
                },
              ],
            }
          : a
      )
    : [
        {
          id: `apt-cust-${booking.id}`,
          code,
          expertId,
          petId: mapBookingPetToSeedPetId(booking.petName),
          ownerId: SEED_OWNERS[0]?.id || "own-001",
          serviceId: mapBookingServiceToExpertServiceId(booking.serviceSlug, booking.service),
          startAt,
          status: mappedStatus,
          checkedInAt: resolvedCheckedInAt,
          actualWeightKg: booking.actualWeightKg,
          adjustedPrice: booking.estimatedPrice,
          paymentTiming: booking.paymentTiming ?? "postpaid",
          paymentState: booking.paymentState ?? "unpaid",
          cancelledBy: resolvedCancelledBy,
          cancelReason: resolvedCancelReason,
          customerNote: [
            booking.petName ? `Bé ${booking.petName}` : "",
            booking.fullName ? `Khách: ${booking.fullName} (${booking.phone})` : "",
            booking.note || "",
          ]
            .filter(Boolean)
            .join(" • "),
          createdAt: booking.createdAt.slice(0, 16).replace("T", " "),
          history: [
            {
              at: nowShort.replace("T", " "),
              status: mappedStatus,
              note: {
                vi:
                  booking.status === "Đã đến"
                    ? `Khách đến trực tiếp tại quầy (${sourceLabel} đã Check-in)`
                    : "Lịch hẹn mới từ hệ thống đặt lịch Animora",
                en: "New booking from Animora",
              },
            },
          ],
        },
        ...store.appointments,
      ];

  const notif: ExpertNotification = {
    id: `notif-cust-${Date.now()}`,
    expertId,
    type: booking.status === "Đã hủy" ? "booking_cancelled" : existing ? "booking_changed" : "new_booking",
    title: {
      vi: booking.status === "Đã hủy" ? `Lịch ${code} đã hủy` : existing ? `Cập nhật lịch ${code}` : `Lịch hẹn mới ${code}`,
      en: booking.status === "Đã hủy" ? `Booking ${code} cancelled` : existing ? `Booking ${code} updated` : `New booking ${code}`,
    },
    body: {
      vi: `${booking.fullName} · ${booking.service} (${formatDateDdMmYyyy(booking.date)} ${booking.timeSlot || ""})`,
      en: `${booking.fullName} · ${booking.service} (${formatDateDdMmYyyy(booking.date)} ${booking.timeSlot || ""})`,
    },
    at: "Vừa xong",
    unread: true,
    href: "/expert/appointments",
  };

  writeExpertStoreByKey(storageKey, {
    ...store,
    appointments: nextAppointments,
    notifications: [notif, ...store.notifications],
  });
}

export function syncCustomerReviewToExpertStore(
  booking: Booking,
  review: BookingReview
): void {
  if (typeof window === "undefined") return;
  const { expertId, storageKey } = resolveExpertStoreKey(booking.doctorId);
  const store = readExpertStoreByKey(expertId, storageKey);

  const reviewId = `rev-cust-${booking.code || booking.id}`;
  const newReview: ExpertReview = {
    id: reviewId,
    expertId,
    appointmentId: booking.id,
    ownerId: SEED_OWNERS[0]?.id || "own-001",
    serviceId: mapBookingServiceToExpertServiceId(booking.serviceSlug, booking.service),
    rating: review.rating,
    comment: `${booking.fullName} (${booking.service}): ${review.comment}`,
    createdAt: review.createdAt.slice(0, 10),
  };

  const notif: ExpertNotification = {
    id: `notif-rev-${Date.now()}`,
    expertId,
    type: "new_review",
    title: {
      vi: `Đánh giá ${review.rating}★ mới từ khách hàng`,
      en: `New ${review.rating}-Star Customer Review`,
    },
    body: {
      vi: `${booking.fullName}: "${review.comment}"`,
      en: `${booking.fullName}: "${review.comment}"`,
    },
    at: "Vừa xong",
    unread: true,
    href: "/expert/reviews",
  };

  writeExpertStoreByKey(storageKey, {
    ...store,
    reviews: [newReview, ...store.reviews.filter((r) => r.id !== reviewId)],
    notifications: [notif, ...store.notifications],
  });
}

/**
 * Đồng bộ tiến trình 4 bước & trạng thái ca chăm sóc từ cổng Nhân viên sang danh sách đặt lịch Quản lý/Khách.
 */
export function syncExpertAppointmentToAdminBookings(
  appt: ExpertAppointment,
  meta?: {
    petName?: string;
    petSpecies?: string;
    petBreed?: string;
    ownerName?: string;
    ownerPhone?: string;
    serviceName?: string;
    servicePrice?: number;
    expertName?: string;
  }
): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(ADMIN_BOOKINGS_STORAGE_KEY);
    const list: Array<Booking & { staffName?: string; price?: number }> = raw
      ? JSON.parse(raw)
      : [];
    if (!Array.isArray(list)) return;

    const mappedStatus: Booking["status"] =
      appt.status === "completed"
        ? "Hoàn thành"
        : appt.status === "cancelled"
        ? appt.cancelledBy === "no_show"
          ? "Không đến"
          : "Đã hủy"
        : appt.status === "in_progress"
        ? "Đang làm"
        : appt.status === "upcoming"
        ? appt.checkedInAt
          ? "Đã đến"
          : "Đã xác nhận"
        : "Mới";

    const idx = list.findIndex(
      (b) => b.code === appt.code || b.id === appt.id || `apt-cust-${b.id}` === appt.id
    );

    const [syncedDate, syncedTime] = appt.startAt.split("T");
    const progressPatch = {
      status: mappedStatus,
      ...(syncedDate ? { date: syncedDate } : {}),
      ...(syncedTime ? { timeSlot: syncedTime.slice(0, 5) } : {}),
      careStage: appt.careStage,
      careProgressLog: appt.careProgressLog,
      managerConfirmedAt: appt.managerConfirmedAt,
      managerConfirmedBy: appt.managerConfirmedBy,
      managerConfirmNote: appt.managerConfirmNote,
      ...(appt.cancelReason || appt.rejectReason
        ? { cancelReason: appt.cancelReason || appt.rejectReason }
        : {}),
      ...(appt.proposedStartAt
        ? { internalNote: `Chuyên viên đề xuất đổi lịch sang ${appt.proposedStartAt.replace("T", " ")}` }
        : {}),
      ...(appt.status === "completed" && appt.completedAt
        ? { completedAt: appt.completedAt }
        : {}),
      ...(appt.status === "upcoming" ? { confirmedAt: new Date().toISOString() } : {}),
      ...(appt.completionNote ? { internalNote: appt.completionNote } : {}),
    };

    let nextList: Array<Booking & { staffName?: string; price?: number }>;
    if (idx >= 0) {
      nextList = list.map((b, i) => (i === idx ? { ...b, ...progressPatch } : b));
    } else {
      const [datePart, timePart] = appt.startAt.split("T");
      const created: Booking & { staffName?: string; price?: number } = {
        id: appt.id,
        code: appt.code,
        service: meta?.serviceName || "Dịch vụ chăm sóc thú cưng",
        doctorId: appt.expertId,
        doctorName: meta?.expertName || SEED_EXPERTS[appt.expertId]?.fullName,
        staffName: meta?.expertName || SEED_EXPERTS[appt.expertId]?.fullName,
        petType: meta?.petSpecies || "Chó",
        petName: meta?.petName || "Bé cưng",
        petBreed: meta?.petBreed,
        date: datePart,
        timeSlot: timePart?.slice(0, 5) || "09:00",
        fullName: meta?.ownerName || "Khách hàng Animora",
        phone: meta?.ownerPhone || "0900 000 000",
        price: meta?.servicePrice || 300000,
        estimatedPrice: meta?.servicePrice || 300000,
        paymentTiming: appt.paymentTiming,
        paymentState: appt.paymentState,
        createdAt: appt.createdAt,
        ...progressPatch,
      };
      nextList = [created, ...list];
    }

    window.localStorage.setItem(ADMIN_BOOKINGS_STORAGE_KEY, JSON.stringify(nextList));
    window.dispatchEvent(new Event(ADMIN_BOOKINGS_SYNC_EVENT));
  } catch {
    // ignore storage errors
  }
}

/**
 * Manager xác nhận trạng thái/kết quả dịch vụ chăm sóc đang thực hiện hoặc chờ bàn giao.
 */
export function confirmCareServiceResultInStores(
  bookingCodeOrId: string,
  managerName = "Manager",
  note = "Đã kiểm tra & xác nhận kết quả dịch vụ đạt chuẩn bàn giao."
): { updatedExpertId?: string } {
  const nowIso = new Date().toISOString().slice(0, 16);
  let updatedExpertId: string | undefined;

  for (const expertId of EXPERT_IDS) {
    const store = readExpertStore(expertId);
    const match = store.appointments.find(
      (a) =>
        a.code === bookingCodeOrId ||
        a.id === bookingCodeOrId ||
        a.id === `apt-cust-${bookingCodeOrId}`
    );
    if (!match) continue;

    updatedExpertId = expertId;
    const nextAppointments = store.appointments.map((a) => {
      if (a.id !== match.id) return a;
      const nextStage: CareServiceStage = a.careStage || "ready_handover";
      return {
        ...a,
        careStage: nextStage,
        managerConfirmedAt: nowIso,
        managerConfirmedBy: managerName,
        managerConfirmNote: note,
        history: [
          ...a.history,
          {
            at: nowIso,
            status: a.status,
            note: {
              vi: `${managerName} xác nhận kết quả dịch vụ: ${note}`,
              en: `${managerName} confirmed service result`,
            },
          },
        ],
      };
    });

    const notif: ExpertNotification = {
      id: createSyncEntityId("notif-mgr"),
      expertId,
      type: "booking_changed",
      title: {
        vi: `Quản lý đã xác nhận ca ${match.code}`,
        en: `Manager confirmed ${match.code}`,
      },
      body: { vi: note, en: note },
      at: "Vừa xong",
      unread: true,
      href: "/expert/appointments",
    };

    writeExpertStore(expertId, {
      ...store,
      appointments: nextAppointments,
      notifications: [notif, ...store.notifications],
    });
    break;
  }

  return { updatedExpertId };
}

