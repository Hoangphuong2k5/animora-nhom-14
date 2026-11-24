import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  EXPERT_IDS,
  EXPERT_SYNC_EVENT,
  readExpertStore,
  reviewExpertCertificate,
} from "@/utils/clinicalSync";
import { evaluateMonthlyLeaveQuota } from "@/utils/expertPolicy";
import type { EmploymentType, ExpertStoreState } from "@/types/expert.type";
import { INITIAL_STAFF, StaffItem } from "@/components/admin/staff/staffData";

/** Manages staff directory, absence quotas, certificate reviews, and account creation. */
export function useAdminStaff() {
  const [activeTab, setActiveTab] = useState<"directory" | "absences" | "accounts">(
    "directory"
  );
  const [staffList, setStaffList] = useState<StaffItem[]>(INITIAL_STAFF);
  const [selectedStaff, setSelectedStaff] = useState<StaffItem | null>(null);
  const [expertStores, setExpertStores] = useState<Record<string, ExpertStoreState>>(
    {}
  );
  const [certRejectReasons, setCertRejectReasons] = useState<Record<string, string>>(
    {}
  );

  // Account Creation Form State
  const [newAccName, setNewAccName] = useState("");
  const [newAccEmail, setNewAccEmail] = useState("");
  const [newAccPhone, setNewAccPhone] = useState("");
  const [newAccType, setNewAccType] = useState<"staff" | "supplier">("staff");
  const [newAccEmployment, setNewAccEmployment] =
    useState<EmploymentType>("full_time");
  const [newAccSpecialty, setNewAccSpecialty] = useState("");
  const [newSupplierCompany, setNewSupplierCompany] = useState("");

  const refreshExpertStores = useCallback(() => {
    const next: Record<string, ExpertStoreState> = {};
    for (const id of EXPERT_IDS) {
      next[id] = readExpertStore(id);
    }
    setExpertStores(next);
  }, []);

  useEffect(() => {
    queueMicrotask(refreshExpertStores);
    window.addEventListener(EXPERT_SYNC_EVENT, refreshExpertStores);
    return () => window.removeEventListener(EXPERT_SYNC_EVENT, refreshExpertStores);
  }, [refreshExpertStores]);

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const absenceRows = useMemo(() => {
    return EXPERT_IDS.map((id) => {
      const st = expertStores[id] || readExpertStore(id);
      const quota = evaluateMonthlyLeaveQuota(
        st.shiftRequests,
        st.shifts,
        id,
        todayIso
      );
      return {
        expertId: id,
        profile: st.profile,
        quota,
        overLimitDays: Math.max(0, quota.usedDays - quota.maxDays),
      };
    });
  }, [expertStores, todayIso]);

  const handleReviewCert = (
    expertId: string,
    certId: string,
    decision: "approved" | "rejected"
  ) => {
    const reason = certRejectReasons[certId];
    reviewExpertCertificate(expertId, certId, decision, reason);
    refreshExpertStores();
    toast.success(
      decision === "approved"
        ? "Đã phê duyệt chứng chỉ và đồng bộ về hồ sơ nhân viên!"
        : "Đã từ chối chứng chỉ kèm lý do gửi về nhân viên."
    );
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName || !newAccEmail) {
      toast.error("Vui lòng điền đủ họ tên và email!");
      return;
    }

    if (newAccType === "staff") {
      const createdStaff: StaffItem = {
        id: `st-${Date.now()}`,
        name: newAccName,
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        roleType: "NV Chăm sóc thú cưng",
        employmentType: newAccEmployment,
        specialty: newAccSpecialty || "Chăm sóc thú cưng tổng quát",
        experience: "1 năm kinh nghiệm",
        rating: 5.0,
        reviewCount: 0,
        monthlyCases: 0,
        status: "active",
        phone: newAccPhone || "0900.000.000",
        email: newAccEmail,
        certificates: ["Chứng chỉ Thực hành Animora Internal"],
        scheduleShifts: ["Full-time T2 - T7 (08:00 - 17:00 • Nghỉ trưa 12:00 - 13:00)"],
        recentReviews: [],
      };
      setStaffList((prev) => [createdStaff, ...prev]);
      toast.success(
        `Đã cấp tài khoản NV Chăm sóc (Full-time) cho ${newAccName}!`
      );
    } else {
      toast.success(
        `Đã tạo tài khoản Nhà cung cấp cho đối tác: ${
          newSupplierCompany || newAccName
        }!`
      );
    }

    setNewAccName("");
    setNewAccEmail("");
    setNewAccPhone("");
    setNewAccSpecialty("");
    setNewSupplierCompany("");
  };

  return {
    activeTab,
    setActiveTab,
    staffList,
    selectedStaff,
    setSelectedStaff,
    expertStores,
    certRejectReasons,
    setCertRejectReasons,
    todayIso,
    absenceRows,
    handleReviewCert,
    newAccName,
    setNewAccName,
    newAccEmail,
    setNewAccEmail,
    newAccPhone,
    setNewAccPhone,
    newAccType,
    setNewAccType,
    newAccEmployment,
    setNewAccEmployment,
    newAccSpecialty,
    setNewAccSpecialty,
    newSupplierCompany,
    setNewSupplierCompany,
    handleCreateAccount,
  };
}
