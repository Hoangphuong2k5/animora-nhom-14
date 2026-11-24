"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import {
  canCancelShiftRequest,
  canRequestRegularLeaveOnDate,
  evaluateMonthlyLeaveQuota,
  isDateInPastWeek,
  isSundayDateIso,
  validateShiftRequestKindForEmployment,
} from "@/utils/expertPolicy";
import { pushManagerNotification } from "@/utils/clinicalSync";
import { formatDateDdMmYyyy } from "@/utils/dateFormat";
import type {
  ExpertAppointment,
  ExpertProfile,
  ExpertStoreState,
  ShiftRequest,
} from "@/types/expert.type";

interface UseExpertShiftActionsParams {
  profile: ExpertProfile;
  appointments: ExpertAppointment[];
  shiftRequests: ShiftRequest[];
  setStore: React.Dispatch<React.SetStateAction<ExpertStoreState>>;
}

export function useExpertShiftActions({
  profile,
  appointments,
  shiftRequests,
  setStore,
}: UseExpertShiftActionsParams) {
  const submitShiftRequest = useCallback(
    (req: Omit<ShiftRequest, "id" | "expertId" | "createdAt" | "status">) => {
      const validation = validateShiftRequestKindForEmployment(
        req.kind,
        profile.employmentType,
        profile.expertType
      );
      if (!validation.allowed) {
        toast.error(
          validation.reason ||
            "Loại yêu cầu không hợp lệ cho hình thức nhân sự này."
        );
        return;
      }

      if (isDateInPastWeek(req.date)) {
        toast.error(
          "Không thể tạo yêu cầu lịch cho các tuần đã qua trong tháng."
        );
        return;
      }
      if (isSundayDateIso(req.date)) {
        toast.error(
          "Chủ Nhật là ngày nghỉ cố định của trung tâm (T2–T7), không cần gửi đơn xin nghỉ."
        );
        return;
      }

      const bookingCheck = canRequestRegularLeaveOnDate(
        req.date,
        appointments,
        profile.id
      );
      if (!bookingCheck.allowed) {
        toast.error(
          bookingCheck.reason ||
            "Không thể xin nghỉ phép thường vào ngày đã có khách đặt lịch hẹn."
        );
        return;
      }

      if (
        req.kind === "leave" &&
        shiftRequests.some(
          (r) =>
            r.kind === "leave" && r.date === req.date && r.status !== "rejected"
        )
      ) {
        toast.error(
          `Bạn đã có đơn xin nghỉ phép ngày ${formatDateDdMmYyyy(req.date)} rồi.`
        );
        return;
      }

      setStore((prev) => {
        const policyWarnings: string[] = [...(req.policyWarnings ?? [])];
        let exceedsMonthlyLeaveLimit = Boolean(req.exceedsMonthlyLeaveLimit);

        if (req.kind === "leave") {
          const leaveQuota = evaluateMonthlyLeaveQuota(
            prev.shiftRequests,
            prev.shifts,
            profile.id,
            req.date
          );
          if (leaveQuota.exceedsOnNewRequest && leaveQuota.warningMessage) {
            exceedsMonthlyLeaveLimit = true;
            if (!policyWarnings.includes(leaveQuota.warningMessage)) {
              policyWarnings.push(leaveQuota.warningMessage);
            }
          }
        }

        const newReq: ShiftRequest = {
          id: `req-${Date.now()}`,
          expertId: profile.id,
          createdAt: new Date().toISOString(),
          status: "pending",
          ...req,
          shift: undefined,
          policyWarnings:
            policyWarnings.length > 0 ? policyWarnings : undefined,
          exceedsMonthlyLeaveLimit,
        };

        return {
          ...prev,
          shiftRequests: [newReq, ...prev.shiftRequests],
        };
      });

      pushManagerNotification({
        type: "staff",
        title: "Đơn xin nghỉ phép cần duyệt",
        desc: `${profile.fullName} gửi đơn xin nghỉ phép ngày ${formatDateDdMmYyyy(req.date)}.`,
        href: "/manager/staff?tab=requests",
      });

      toast.success(
        req.policyWarnings && req.policyWarnings.length > 0
          ? "Đã gửi đơn xin nghỉ phép kèm cờ cảnh báo tới Manager xem xét!"
          : "Đã gửi đơn xin nghỉ phép tới Manager phê duyệt!"
      );
    },
    [
      appointments,
      profile.employmentType,
      profile.expertType,
      profile.fullName,
      profile.id,
      setStore,
      shiftRequests,
    ]
  );

  const cancelShiftRequest = useCallback(
    (id: string) => {
      setStore((prev) => {
        const target = prev.shiftRequests.find((r) => r.id === id);
        if (!target) return prev;
        if (!canCancelShiftRequest(target)) {
          toast.error("Đơn nghỉ phép đã được duyệt không thể hủy!");
          return prev;
        }
        toast.success("Đã hủy yêu cầu đang chờ duyệt.");
        return {
          ...prev,
          shiftRequests: prev.shiftRequests.filter((r) => r.id !== id),
        };
      });
    },
    [setStore]
  );

  return {
    submitShiftRequest,
    cancelShiftRequest,
  };
}

