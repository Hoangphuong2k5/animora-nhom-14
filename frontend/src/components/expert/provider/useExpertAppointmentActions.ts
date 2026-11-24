"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { getCareStageMeta } from "@/utils/expertPolicy";
import { pushManagerNotification } from "@/utils/clinicalSync";
import type {
  CareServiceStage,
  ExpertAppointment,
  ExpertProfile,
  ExpertStoreState,
} from "@/types/expert.type";

interface UseExpertAppointmentActionsParams {
  profile: ExpertProfile;
  isVet: boolean;
  appointments: ExpertAppointment[];
  setStore: React.Dispatch<React.SetStateAction<ExpertStoreState>>;
  pushAppointmentToAdminBookings: (appt: ExpertAppointment) => void;
}

export function useExpertAppointmentActions({
  profile,
  isVet,
  appointments,
  setStore,
  pushAppointmentToAdminBookings,
}: UseExpertAppointmentActionsParams) {
  const updateAppointment = useCallback(
    (id: string, patch: Partial<ExpertAppointment>) => {
      setStore((prev) => ({
        ...prev,
        appointments: prev.appointments.map((a) =>
          a.id === id ? { ...a, ...patch } : a
        ),
      }));
    },
    [setStore]
  );

  const confirmAppointment = useCallback(
    (id: string) => {
      const nowIso = new Date().toISOString();
      setStore((prev) => {
        const nextAppointments = prev.appointments.map((a) => {
          if (a.id !== id) return a;
          const updated: ExpertAppointment = {
            ...a,
            status: "upcoming",
            history: [
              ...a.history,
              {
                at: nowIso,
                status: "upcoming",
                note: {
                  vi: "Bác sĩ / Chuyên viên xác nhận tiếp nhận lịch hẹn",
                  en: "Expert confirmed appointment",
                },
              },
            ],
          };
          pushAppointmentToAdminBookings(updated);
          return updated;
        });
        return { ...prev, appointments: nextAppointments };
      });
      toast.success("Đã xác nhận tiếp nhận lịch hẹn (chuyển sang Sắp tới)!");
    },
    [pushAppointmentToAdminBookings, setStore]
  );

  const startAppointment = useCallback(
    (id: string) => {
      const nowIso = new Date().toISOString();
      const shortTime = nowIso.slice(0, 16);
      setStore((prev) => {
        const nextAppointments = prev.appointments.map((a) => {
          if (a.id !== id) return a;
          const updated: ExpertAppointment = {
            ...a,
            status: "in_progress",
            startedAt: nowIso,
            ...(!isVet
              ? {
                careStage: "checked_in" as CareServiceStage,
                careProgressLog: [
                  ...(a.careProgressLog || []),
                  {
                    stage: "checked_in" as CareServiceStage,
                    updatedAt: shortTime,
                    note: "Đã tiếp nhận bé & kiểm tra lông/da/tâm lý ban đầu.",
                    updatedBy: profile.fullName,
                  },
                ],
              }
              : {}),
            history: [
              ...a.history,
              {
                at: nowIso,
                status: "in_progress",
                note: {
                  vi: isVet
                    ? "Bác sĩ bắt đầu thăm khám lâm sàng"
                    : "Nhân viên bắt đầu ca chăm sóc • Bước 1: Đã tiếp nhận bé",
                  en: "Expert started slot",
                },
              },
            ],
          };
          pushAppointmentToAdminBookings(updated);
          return updated;
        });
        return { ...prev, appointments: nextAppointments };
      });
      toast.success(
        isVet
          ? "Đã bắt đầu ca khám! Chức năng bệnh án và kê đơn hiện đã được kích hoạt."
          : "Đã bắt đầu ca chăm sóc (Bước 1: Tiếp nhận bé)! Hãy cập nhật tiến trình từng bước trong khi làm."
      );
    },
    [isVet, profile.fullName, pushAppointmentToAdminBookings, setStore]
  );

  const advanceCareStage = useCallback(
    (id: string, stage: CareServiceStage, note?: string) => {
      const nowIso = new Date().toISOString();
      const shortTime = nowIso.slice(0, 16);
      const stageMeta = getCareStageMeta(stage);

      setStore((prev) => {
        const nextAppointments = prev.appointments.map((a) => {
          if (a.id !== id) return a;
          const updated: ExpertAppointment = {
            ...a,
            careStage: stage,
            careProgressLog: [
              ...(a.careProgressLog || []),
              {
                stage,
                updatedAt: shortTime,
                note: note?.trim() || stageMeta.description,
                updatedBy: profile.fullName,
              },
            ],
            history: [
              ...a.history,
              {
                at: nowIso,
                status: a.status,
                note: {
                  vi: `Bước ${stageMeta.stepNumber}: ${stageMeta.label}${note?.trim() ? ` (${note.trim()})` : ""}`,
                  en: `Stage ${stageMeta.stepNumber}: ${stage}`,
                },
              },
            ],
          };
          pushAppointmentToAdminBookings(updated);
          return updated;
        });
        return { ...prev, appointments: nextAppointments };
      });
      toast.success(`Đã cập nhật bước ${stageMeta.stepNumber}: ${stageMeta.shortLabel}!`);
    },
    [profile.fullName, pushAppointmentToAdminBookings, setStore]
  );

  const completeAppointment = useCallback(
    (id: string, note: string, condition?: string, followUp?: string) => {
      const targetBefore = appointments.find((a) => a.id === id);
      if (
        !targetBefore ||
        targetBefore.status === "completed" ||
        targetBefore.status === "cancelled"
      ) {
        return;
      }

      const nowIso = new Date().toISOString();
      const shortTime = nowIso.slice(0, 16);
      const finalNote =
        note.trim() ||
        (isVet
          ? "Đã hoàn tất khám lâm sàng và tư vấn cho chủ nuôi."
          : "Đã hoàn tất quy trình chăm sóc & sẵn sàng bàn giao cho khách.");

      setStore((prev) => {
        const nextAppointments = prev.appointments.map((a) => {
          if (a.id !== id || a.status === "completed" || a.status === "cancelled") {
            return a;
          }
          const existingLog = a.careProgressLog || [];
          const needsHandoverLog = !isVet && a.careStage !== "ready_handover";
          const updated: ExpertAppointment = {
            ...a,
            status: "completed",
            completedAt: nowIso,
            completionNote: finalNote,
            petConditionAfter: condition,
            followUpDate: followUp,
            ...(!isVet
              ? {
                careStage: "ready_handover" as CareServiceStage,
                careProgressLog: needsHandoverLog
                  ? [
                    ...existingLog,
                    {
                      stage: "ready_handover" as CareServiceStage,
                      updatedAt: shortTime,
                      note: finalNote,
                      updatedBy: profile.fullName,
                    },
                  ]
                  : existingLog,
              }
              : {}),
            history: [
              ...a.history,
              {
                at: nowIso,
                status: "completed",
                note: {
                  vi: isVet
                    ? "Hoàn thành ca khám"
                    : "Hoàn tất dịch vụ chăm sóc (Xong)",
                  en: "Service completed",
                },
              },
            ],
          };
          pushAppointmentToAdminBookings(updated);
          return updated;
        });
        return { ...prev, appointments: nextAppointments };
      });

      const isPostpaidUnpaid =
        targetBefore?.paymentTiming === "postpaid" &&
        targetBefore?.paymentState !== "paid";
      toast.success(
        isVet
          ? isPostpaidUnpaid
            ? "Đã hoàn thành ca khám! Mời khách thanh toán tại quầy Lễ tân."
            : "Đã ghi nhận hoàn thành ca khám!"
          : isPostpaidUnpaid
            ? "Đã hoàn tất dịch vụ chăm sóc (Xong)! Mời khách thanh toán tại quầy Lễ tân."
            : "Đã hoàn tất dịch vụ chăm sóc (Xong)!"
      );
    },
    [appointments, isVet, profile.fullName, pushAppointmentToAdminBookings, setStore]
  );

  const rejectAppointment = useCallback(
    (id: string, reason: string) => {
      const nowIso = new Date().toISOString();
      const targetAppt = appointments.find((a) => a.id === id);
      setStore((prev) => ({
        ...prev,
        appointments: prev.appointments.map((a) => {
          if (a.id !== id) return a;
          const updated: ExpertAppointment = {
            ...a,
            rejectReason: reason,
            cancelRequest: {
              reason,
              requestedAt: nowIso,
              status: "pending_admin",
            },
            history: [
              ...a.history,
              {
                at: nowIso,
                status: "cancel_requested",
                note: {
                  vi: `Chuyên viên gửi yêu cầu Quản lý nghiệp vụ điều phối / duyệt hủy: ${reason}`,
                  en: `Expert requested Manager reassignment / cancellation: ${reason}`,
                },
              },
            ],
          };
          pushAppointmentToAdminBookings(updated);
          return updated;
        }),
      }));
      pushManagerNotification({
        type: "booking",
        title: `Yêu cầu điều phối / hủy ca ${targetAppt?.code || id}`,
        desc: `${profile.fullName}: ${reason}`,
        href: "/manager/bookings",
      });
      toast.success("Đã gửi yêu cầu điều phối / duyệt hủy ca lên Quản lý nghiệp vụ!");
    },
    [appointments, profile.fullName, pushAppointmentToAdminBookings, setStore]
  );

  const acceptReschedule = useCallback(
    (id: string) => {
      const nowIso = new Date().toISOString();
      const targetAppt = appointments.find((a) => a.id === id);
      setStore((prev) => ({
        ...prev,
        appointments: prev.appointments.map((a) => {
          if (a.id !== id || !a.rescheduleRequest) return a;
          const newStartAt = a.rescheduleRequest.requestedStartAt;
          const updated: ExpertAppointment = {
            ...a,
            previousStartAt: a.startAt,
            startAt: newStartAt,
            rescheduleRequest: undefined,
            history: [
              ...a.history,
              {
                at: nowIso,
                status: "rescheduled",
                note: {
                  vi: `Đã đồng ý dời lịch hẹn sang: ${newStartAt}`,
                  en: `Reschedule accepted to: ${newStartAt}`,
                },
              },
            ],
          };
          pushAppointmentToAdminBookings(updated);
          return updated;
        }),
      }));
      if (targetAppt?.rescheduleRequest) {
        pushManagerNotification({
          type: "booking",
          title: `Đã xác nhận dời lịch ${targetAppt.code}`,
          desc: `${profile.fullName} đồng ý dời lịch sang ${targetAppt.rescheduleRequest.requestedStartAt.replace("T", " ")}`,
          href: "/manager/bookings",
        });
      }
      toast.success("Đã đồng ý dời lịch hẹn theo yêu cầu của khách!");
    },
    [appointments, profile.fullName, pushAppointmentToAdminBookings, setStore]
  );

  return {
    updateAppointment,
    confirmAppointment,
    startAppointment,
    advanceCareStage,
    completeAppointment,
    rejectAppointment,
    acceptReschedule,
  };
}

