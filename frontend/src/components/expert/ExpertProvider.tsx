"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  ExpertAppointment,
  ExpertNotification,
  ExpertPet,
  ExpertPetOwner,
  ExpertProfile,
  ExpertServiceDef,
  ExpertShift,
  ExpertStoreState,
  HealthEntry,
  MedicalRecord,
  PayrollMonth,
  Prescription,
  ShiftRequest,
  WeightLog,
} from "@/types/expert.type";
import {
  getInitialExpertStore,
  getScopedOwners,
  getScopedPets,
  SEED_EXPERTS,
  SEED_OWNERS,
  SEED_PETS,
  SEED_SERVICES,
} from "@/data/expertPortalData";
import { toast } from "sonner";
import { devGetSessionInfoAction } from "@/actions/auth.action";
import { useExpertT } from "./expertI18n";

interface ExpertContextValue {
  profile: ExpertProfile;
  isVet: boolean;
  store: ExpertStoreState;
  scopedPets: ExpertPet[];
  scopedOwners: ExpertPetOwner[];
  allServices: ExpertServiceDef[];
  allPets: ExpertPet[];
  allOwners: ExpertPetOwner[];
  // Actions
  updateAppointment: (id: string, patch: Partial<ExpertAppointment>) => void;
  startAppointment: (id: string) => void;
  completeAppointment: (id: string, note: string, condition?: string, followUp?: string) => void;
  rejectAppointment: (id: string, reason: string) => void;
  proposeAppointmentTime: (id: string, proposedStartAt: string) => void;
  acceptReschedule: (id: string) => void;
  addPrescription: (prescription: Prescription) => void;
  addMedicalRecord: (record: MedicalRecord) => void;
  addHealthEntry: (entry: HealthEntry) => void;
  addWeightLog: (log: WeightLog) => void;
  submitShiftRequest: (req: Omit<ShiftRequest, "id" | "expertId" | "createdAt" | "status">) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateProfile: (patch: Partial<ExpertProfile>, options?: { silent?: boolean }) => void;
  refreshFromStorage: () => void;
}

const ExpertContext = createContext<ExpertContextValue | undefined>(undefined);

export function ExpertProvider({
  expertId: initialExpertId = "exp-vet-01",
  children,
}: {
  expertId?: string;
  children: React.ReactNode;
}) {
  const { t } = useExpertT();
  const [currentExpertId, setCurrentExpertId] = useState<string>(initialExpertId);

  // Auto-detect specialist identity from server session via Server Action or localStorage on client mount
  useEffect(() => {
    let isMounted = true;

    async function syncSession() {
      try {
        const session = await devGetSessionInfoAction();
        if (!isMounted) return;
        if (session.isLoggedIn) {
          if (session.expertType === "groomer" || session.email === "spa@animora.vn") {
            setCurrentExpertId("exp-spa-01");
            return;
          }
          if (session.expertType === "vet" || session.email === "vet@animora.vn") {
            setCurrentExpertId("exp-vet-01");
            return;
          }
        }
      } catch {}

      // Fallback to localStorage
      try {
        const rawUser = localStorage.getItem("animora_current_user");
        if (rawUser) {
          const u = JSON.parse(rawUser);
          if (u.id === "exp-spa-01" || u.email === "spa@animora.vn") {
            setCurrentExpertId("exp-spa-01");
            return;
          }
          if (u.id === "exp-vet-01" || u.email === "vet@animora.vn") {
            setCurrentExpertId("exp-vet-01");
            return;
          }
        }
      } catch {}
    }

    syncSession();

    const handleUserSync = () => syncSession();
    window.addEventListener("animora_user_sync", handleUserSync);
    return () => {
      isMounted = false;
      window.removeEventListener("animora_user_sync", handleUserSync);
    };
  }, []);

  const hasHydratedRef = useRef(false);
  const [store, setStore] = useState<ExpertStoreState>(() =>
    getInitialExpertStore(initialExpertId)
  );

  // Switch or reload store when currentExpertId changes (chỉ chạy ở client sau khi hydrate để tránh lỗi Hydration mismatch)
  useEffect(() => {
    hasHydratedRef.current = false;
    try {
      const raw = localStorage.getItem(`animora_expert_store_${currentExpertId}`);
      if (raw) {
        setStore(JSON.parse(raw));
        hasHydratedRef.current = true;
        return;
      }
    } catch {}
    setStore(getInitialExpertStore(currentExpertId));
    hasHydratedRef.current = true;
  }, [currentExpertId]);

  // Sync to localStorage (chỉ lưu sau khi đã đọc dữ liệu khởi tạo từ localStorage)
  useEffect(() => {
    if (!hasHydratedRef.current) return;
    try {
      localStorage.setItem(`animora_expert_store_${currentExpertId}`, JSON.stringify(store));
    } catch {}
  }, [store, currentExpertId]);

  const refreshFromStorage = useCallback(() => {
    try {
      const raw = localStorage.getItem(`animora_expert_store_${currentExpertId}`);
      if (raw) setStore(JSON.parse(raw));
    } catch {}
  }, [currentExpertId]);

  // Handle external sync events
  useEffect(() => {
    const handleSync = () => refreshFromStorage();
    window.addEventListener("animora_expert_sync", handleSync);
    return () => window.removeEventListener("animora_expert_sync", handleSync);
  }, [refreshFromStorage]);

  const profile = store.profile || SEED_EXPERTS[currentExpertId] || SEED_EXPERTS["exp-vet-01"];
  const isVet = profile.expertType === "vet";

  const scopedPets = useMemo(
    () => getScopedPets(profile.id, store.appointments, SEED_PETS),
    [profile.id, store.appointments]
  );

  const scopedOwners = useMemo(
    () => getScopedOwners(profile.id, store.appointments, SEED_OWNERS),
    [profile.id, store.appointments]
  );

  const updateAppointment = useCallback((id: string, patch: Partial<ExpertAppointment>) => {
    setStore((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  }, []);

  const startAppointment = useCallback((id: string) => {
    const nowIso = new Date().toISOString();
    setStore((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) => {
        if (a.id !== id) return a;
        return {
          ...a,
          status: "in_progress",
          startedAt: nowIso,
          history: [
            ...a.history,
            { at: nowIso, status: "in_progress", note: { vi: "Bác sĩ / Chuyên viên bắt đầu ca", en: "Expert started slot" } },
          ],
        };
      }),
    }));
    toast.success("Đã bắt đầu ca phục vụ! Chức năng bệnh án và kê đơn hiện đã được kích hoạt.");
  }, []);

  const completeAppointment = useCallback(
    (id: string, note: string, condition?: string, followUp?: string) => {
      const nowIso = new Date().toISOString();
      setStore((prev) => ({
        ...prev,
        appointments: prev.appointments.map((a) => {
          if (a.id !== id) return a;
          return {
            ...a,
            status: "completed",
            completedAt: nowIso,
            completionNote: note,
            petConditionAfter: condition,
            followUpDate: followUp,
            history: [
              ...a.history,
              { at: nowIso, status: "completed", note: { vi: "Hoàn thành ca dịch vụ", en: "Service completed" } },
            ],
          };
        }),
      }));
      toast.success("Đã ghi nhận hoàn thành ca hẹn!");
    },
    []
  );

  const rejectAppointment = useCallback((id: string, reason: string) => {
    const nowIso = new Date().toISOString();
    setStore((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) => {
        if (a.id !== id) return a;
        return {
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
                vi: `Chuyên viên gửi yêu cầu Admin điều phối / duyệt hủy: ${reason}`,
                en: `Expert requested Admin reassignment / cancellation: ${reason}`,
              },
            },
          ],
        };
      }),
    }));
    toast.success("Đã gửi yêu cầu điều phối / duyệt hủy ca lên Admin!");
  }, []);

  const proposeAppointmentTime = useCallback((id: string, proposedStartAt: string) => {
    const nowIso = new Date().toISOString();
    setStore((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) => {
        if (a.id !== id) return a;
        return {
          ...a,
          proposedStartAt,
          history: [
            ...a.history,
            {
              at: nowIso,
              status: "rescheduled",
              note: {
                vi: `Chuyên viên đề xuất chuyển sang: ${proposedStartAt}`,
                en: `Expert proposed reschedule to: ${proposedStartAt}`,
              },
            },
          ],
        };
      }),
    }));
    toast.success("Đã gửi đề xuất đổi giờ hẹn cho khách hàng!");
  }, []);

  const acceptReschedule = useCallback((id: string) => {
    const nowIso = new Date().toISOString();
    setStore((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) => {
        if (a.id !== id || !a.rescheduleRequest) return a;
        const newStartAt = a.rescheduleRequest.requestedStartAt;
        return {
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
      }),
    }));
    toast.success("Đã đồng ý dời lịch hẹn theo yêu cầu của khách!");
  }, []);

  const addPrescription = useCallback((prescription: Prescription) => {
    setStore((prev) => ({
      ...prev,
      prescriptions: [prescription, ...prev.prescriptions],
      appointments: prev.appointments.map((a) =>
        a.id === prescription.appointmentId ? { ...a, prescriptionId: prescription.id } : a
      ),
    }));
    toast.success(`Đã lưu đơn thuốc ${prescription.code}!`);
  }, []);

  const addMedicalRecord = useCallback((record: MedicalRecord) => {
    setStore((prev) => ({
      ...prev,
      medicalRecords: [record, ...prev.medicalRecords],
      appointments: prev.appointments.map((a) =>
        a.id === record.appointmentId ? { ...a, medicalRecordId: record.id } : a
      ),
    }));
    toast.success("Đã lưu bệnh án vào sổ sức khỏe của thú cưng!");
  }, []);

  const addHealthEntry = useCallback((entry: HealthEntry) => {
    setStore((prev) => ({
      ...prev,
      healthEntries: [entry, ...prev.healthEntries],
    }));
    toast.success("Đã thêm bản ghi vào sổ sức khỏe!");
  }, []);

  const addWeightLog = useCallback((log: WeightLog) => {
    setStore((prev) => ({
      ...prev,
      weightLogs: [...prev.weightLogs, log],
    }));
  }, []);

  const submitShiftRequest = useCallback(
    (req: Omit<ShiftRequest, "id" | "expertId" | "createdAt" | "status">) => {
      const newReq: ShiftRequest = {
        id: `req-${Date.now()}`,
        expertId: profile.id,
        createdAt: new Date().toISOString(),
        status: "pending",
        ...req,
      };
      setStore((prev) => ({
        ...prev,
        shiftRequests: [newReq, ...prev.shiftRequests],
      }));
      toast.success("Đã gửi đơn đăng ký ca/xin nghỉ tới Admin!");
    },
    [profile.id]
  );

  const markNotificationAsRead = useCallback((id: string) => {
    setStore((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setStore((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, unread: false })),
    }));
    toast.success("Đã đánh dấu tất cả thông báo là đã đọc!");
  }, []);

  const updateProfile = useCallback(
    (patch: Partial<ExpertProfile>, options?: { silent?: boolean }) => {
      setStore((prev) => ({
        ...prev,
        profile: { ...prev.profile, ...patch },
      }));
      if (!options?.silent) {
        toast.success("Đã lưu hồ sơ");
      }
    },
    []
  );

  const value: ExpertContextValue = {
    profile,
    isVet,
    store,
    scopedPets,
    scopedOwners,
    allServices: SEED_SERVICES,
    allPets: SEED_PETS,
    allOwners: SEED_OWNERS,
    updateAppointment,
    startAppointment,
    completeAppointment,
    rejectAppointment,
    proposeAppointmentTime,
    acceptReschedule,
    addPrescription,
    addMedicalRecord,
    addHealthEntry,
    addWeightLog,
    submitShiftRequest,
    markNotificationAsRead,
    markAllNotificationsRead,
    updateProfile,
    refreshFromStorage,
  };

  return <ExpertContext.Provider value={value}>{children}</ExpertContext.Provider>;
}

export function useExpert() {
  const ctx = useContext(ExpertContext);
  if (!ctx) {
    throw new Error("useExpert must be used within an ExpertProvider");
  }
  return ctx;
}

