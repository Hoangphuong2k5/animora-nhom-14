"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";

export interface ReceptionistActorInfo {
  actorId: string;
  actorName: string;
  actorEmail: string;
  initials: string;
}

/**
 * Lấy danh tính Lễ tân đang đăng nhập thực tế cho Audit Log & Hóa đơn (Mục 2 v1.4:
 * "Mỗi người dùng một tài khoản riêng; Audit Log phải biết đúng ai làm").
 */
export function useReceptionistActor(): ReceptionistActorInfo {
  const { user } = useAuth();

  return useMemo(() => {
    const actorId = user?.id ? String(user.id) : "rec-01";
    const actorName = user?.fullName?.trim() || "LT. Trần Ngọc Bảo Trâm";
    const actorEmail = user?.email?.trim() || "receptionist@animora.vn";
    const parts = actorName.replace(/^LT\.\s*/i, "").trim().split(/\s+/);
    const initials =
      parts.length >= 2
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : "LT";

    return {
      actorId,
      actorName,
      actorEmail,
      initials,
    };
  }, [user?.id, user?.fullName, user?.email]);
}
