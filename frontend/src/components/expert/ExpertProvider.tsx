"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  CareServiceStage,
  ExpertAppointment,
  ExpertPet,
  ExpertPetOwner,
  ExpertProfile,
  ExpertServiceDef,
  ExpertStoreState,
  HealthEntry,
  MedicalRecord,
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
  SEED_SHIFTS,
} from "@/data/expertPortalData";
import { toast } from "sonner";
import { devGetSessionInfoAction } from "@/actions/auth.action";
import {
  canCancelShiftRequest,
  evaluateMonthlyLeaveQuota,
  getCareStageMeta,
  isDateInPastWeek,
  isPartTimeOffShift,
  validateShiftRequestKindForEmployment,
} from "@/utils/expertPolicy";
import {
  EXPERT_IDS,
  EXPERT_SYNC_EVENT,
  getExpertStorageKey,
  PET_SYNC_EVENT,
  pushManagerNotification,
  readExpertPetsRegistry,
  readExpertStore,
  syncExpertAppointmentToAdminBookings,
  writeExpertPetsRegistry,
} from "@/utils/clinicalSync";
import { formatDateDdMmYyyy, getTodayLocalIso } from "@/utils/dateFormat";

interface ExpertContextValue {
  profile: ExpertProfile;
  isVet: boolean;
  isPartTime: boolean;
  store: ExpertStoreState;
  scopedPets: ExpertPet[];
  scopedOwners: ExpertPetOwner[];
  allServices: ExpertServiceDef[];
  allPets: ExpertPet[];
  allOwners: ExpertPetOwner[];
  // Actions
  updateAppointment: (id: string, patch: Partial<ExpertAppointment>) => void;
  confirmAppointment: (id: string) => void;
  startAppointment: (id: string) => void;
  advanceCareStage: (id: string, stage: CareServiceStage, note?: string) => void;
  completeAppointment: (id: string, note: string, condition?: string, followUp?: string) => void;
  rejectAppointment: (id: string, reason: string) => void;
  proposeAppointmentTime: (id: string, proposedStartAt: string) => void;
  acceptReschedule: (id: string) => void;
  addPrescription: (prescription: Prescription) => void;
  addMedicalRecord: (record: MedicalRecord) => void;
  addHealthEntry: (entry: HealthEntry) => void;
  addWeightLog: (log: WeightLog) => void;
  addPet: (pet: Omit<ExpertPet, "id" | "createdByExpertId">) => ExpertPet;
  updatePet: (petId: string, patch: Partial<ExpertPet>) => void;
  deletePet: (petId: string) => { ok: boolean; reason?: string };
  submitShiftRequest: (
    req: Omit<ShiftRequest, "id" | "expertId" | "createdAt" | "status">
  ) => void;
  cancelShiftRequest: (id: string) => void;
  reportReview: (reviewId: string, reason: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateProfile: (patch: Partial<ExpertProfile>, options?: { silent?: boolean }) => void;
  refreshFromStorage: () => void;
}

function normalizeLegacyText(text: string): string {
  return text
    .replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, "$3-$2-$1")
    .replace(/Quản lý nghiệp vụ chính/g, "Manager");
}

function normalizeExpertStore(parsed: ExpertStoreState, expertId: string): ExpertStoreState {
  const existingShifts = Array.isArray(parsed.shifts) ? parsed.shifts : [];
  const shifts = existingShifts.some((s) => s.id.startsWith("sh-wk-"))
    ? existingShifts
    : [
        ...existingShifts,
        ...SEED_SHIFTS.filter((s) => s.expertId === expertId && s.id.startsWith("sh-wk-")),
      ];

  const notifications = Array.isArray(parsed.notifications)
    ? parsed.notifications.map((n) => ({
        ...n,
        title: {
          vi: normalizeLegacyText(n.title?.vi ?? ""),
          en: normalizeLegacyText(n.title?.en ?? ""),
        },
        body: {
          vi: normalizeLegacyText(n.body?.vi ?? ""),
          en: normalizeLegacyText(n.body?.en ?? ""),
        },
      }))
    : parsed.notifications;

  const shiftRequests = Array.isArray(parsed.shiftRequests)
    ? parsed.shiftRequests.map((r) =>
        r.adminNote ? { ...r, adminNote: normalizeLegacyText(r.adminNote) } : r
      )
    : parsed.shiftRequests;

  return { ...parsed, shifts, notifications, shiftRequests };
}

const ExpertContext = createContext<ExpertContextValue | undefined>(undefined);

export function ExpertProvider({
  expertId: initialExpertId = "exp-vet-01",
  children,
}: {
  expertId?: string;
  children: React.ReactNode;
}) {
  const [currentExpertId, setCurrentExpertId] = useState<string>(initialExpertId);

  // Auto-detect specialist identity from server session via Server Action or localStorage on client mount
  useEffect(() => {
    let isMounted = true;

    async function syncSession() {
      try {
        const session = await devGetSessionInfoAction();
        if (!isMounted) return;
        if (session.isLoggedIn) {
          if (
            session.email === "care.pt@animora.vn" ||
            session.employmentType === "part_time"
          ) {
            setCurrentExpertId("exp-spa-02");
            return;
          }
          if (session.expertType === "groomer" || session.email === "spa@animora.vn") {
            setCurrentExpertId("exp-spa-01");
            return;
          }
          if (session.email === "vet.toan@animora.vn") {
            setCurrentExpertId("exp-vet-02");
            return;
          }
          if (session.email === "vet.phuong@animora.vn") {
            setCurrentExpertId("exp-vet-03");
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
          if (u.id === "exp-spa-02" || u.email === "care.pt@animora.vn") {
            setCurrentExpertId("exp-spa-02");
            return;
          }
          if (u.id === "exp-spa-01" || u.email === "spa@animora.vn") {
            setCurrentExpertId("exp-spa-01");
            return;
          }
          if (u.id === "exp-vet-02" || u.email === "vet.toan@animora.vn") {
            setCurrentExpertId("exp-vet-02");
            return;
          }
          if (u.id === "exp-vet-03" || u.email === "vet.phuong@animora.vn") {
            setCurrentExpertId("exp-vet-03");
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
  const isSelfDispatchingRef = useRef(false);
  const [store, setStore] = useState<ExpertStoreState>(() =>
    getInitialExpertStore(initialExpertId)
  );
  const [pets, setPets] = useState<ExpertPet[]>(SEED_PETS);

  // Switch or reload store when currentExpertId changes (chỉ chạy ở client sau khi hydrate để tránh lỗi Hydration mismatch)
  useEffect(() => {
    hasHydratedRef.current = false;
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      try {
        setPets(readExpertPetsRegistry());
        const raw = localStorage.getItem(getExpertStorageKey(currentExpertId));
        if (raw) {
          const parsed: ExpertStoreState = JSON.parse(raw);
          setStore(normalizeExpertStore(parsed, currentExpertId));
          hasHydratedRef.current = true;
          return;
        }
      } catch {}
      setStore(getInitialExpertStore(currentExpertId));
      hasHydratedRef.current = true;
    });
    return () => {
      cancelled = true;
    };
  }, [currentExpertId]);

  // Sync to localStorage (chỉ lưu sau khi đã đọc dữ liệu khởi tạo từ localStorage)
  useEffect(() => {
    if (!hasHydratedRef.current) return;
    try {
      localStorage.setItem(getExpertStorageKey(currentExpertId), JSON.stringify(store));
      isSelfDispatchingRef.current = true;
      try {
        window.dispatchEvent(new Event(PET_SYNC_EVENT));
        window.dispatchEvent(new Event(EXPERT_SYNC_EVENT));
      } finally {
        isSelfDispatchingRef.current = false;
      }
    } catch {}
  }, [store, currentExpertId]);

  const refreshFromStorage = useCallback(() => {
    try {
      setPets(readExpertPetsRegistry());
      const raw = localStorage.getItem(getExpertStorageKey(currentExpertId));
      if (raw) setStore(normalizeExpertStore(JSON.parse(raw), currentExpertId));
    } catch {}
  }, [currentExpertId]);

  // Handle external sync events
  useEffect(() => {
    const handleSync = () => {
      if (isSelfDispatchingRef.current) return;
      refreshFromStorage();
    };
    window.addEventListener(EXPERT_SYNC_EVENT, handleSync);
    window.addEventListener(PET_SYNC_EVENT, handleSync);
    return () => {
      window.removeEventListener(EXPERT_SYNC_EVENT, handleSync);
      window.removeEventListener(PET_SYNC_EVENT, handleSync);
    };
  }, [refreshFromStorage]);

  const profile = store.profile || SEED_EXPERTS[currentExpertId] || SEED_EXPERTS["exp-vet-01"];
  const isVet = profile.expertType === "vet";
  const isPartTime = profile.employmentType === "part_time";

  const pushAppointmentToAdminBookings = useCallback(
    (appt: ExpertAppointment) => {
      const pet = pets.find((p) => p.id === appt.petId);
      const owner = SEED_OWNERS.find((o) => o.id === appt.ownerId);
      const srv = SEED_SERVICES.find((s) => s.id === appt.serviceId);
      syncExpertAppointmentToAdminBookings(appt, {
        petName: pet?.name,
        petSpecies: pet?.species === "cat" ? "Mèo" : pet?.species === "rabbit" ? "Thỏ & chuột" : "Chó",
        petBreed: pet?.breed,
        ownerName: owner?.fullName,
        ownerPhone: owner?.phone,
        serviceName: srv?.name.vi,
        servicePrice: srv?.price,
        expertName: profile.fullName,
      });
    },
    [pets, profile.fullName]
  );

  const scopedPets = useMemo(() => {
    const myScoped = getScopedPets(profile.id, store.appointments, pets);
    const myPetIdSet = new Set(myScoped.map((p) => p.id));
    const createdByMe = pets.filter(
      (p) => p.createdByExpertId === profile.id && !myPetIdSet.has(p.id)
    );
    return [...createdByMe, ...myScoped];
  }, [profile.id, store.appointments, pets]);

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

  const confirmAppointment = useCallback((id: string) => {
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
  }, [pushAppointmentToAdminBookings]);

  const startAppointment = useCallback((id: string) => {
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
  }, [isVet, profile.fullName, pushAppointmentToAdminBookings]);

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
    [profile.fullName, pushAppointmentToAdminBookings]
  );

  const completeAppointment = useCallback(
    (id: string, note: string, condition?: string, followUp?: string) => {
      const nowIso = new Date().toISOString();
      const shortTime = nowIso.slice(0, 16);
      setStore((prev) => {
        const nextAppointments = prev.appointments.map((a) => {
          if (a.id !== id) return a;
          const existingLog = a.careProgressLog || [];
          const needsHandoverLog =
            !isVet && a.careStage !== "ready_handover";
          const updated: ExpertAppointment = {
            ...a,
            status: "completed",
            completedAt: nowIso,
            completionNote: note,
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
                          note:
                            note ||
                            "Hoàn tất chăm sóc & sẵn sàng bàn giao cho khách.",
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
                    : "Hoàn tất dịch vụ & chờ Quản lý xác nhận bàn giao",
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
      toast.success(
        isVet
          ? "Đã ghi nhận hoàn thành ca khám!"
          : "Đã hoàn tất dịch vụ và gửi Quản lý xác nhận bàn giao!"
      );
    },
    [isVet, profile.fullName, pushAppointmentToAdminBookings]
  );

  const rejectAppointment = useCallback(
    (id: string, reason: string) => {
      const nowIso = new Date().toISOString();
      const targetAppt = store.appointments.find((a) => a.id === id);
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
    [profile.fullName, pushAppointmentToAdminBookings, store.appointments]
  );

  const proposeAppointmentTime = useCallback(
    (id: string, proposedStartAt: string) => {
      const nowIso = new Date().toISOString();
      const targetAppt = store.appointments.find((a) => a.id === id);
      setStore((prev) => ({
        ...prev,
        appointments: prev.appointments.map((a) => {
          if (a.id !== id) return a;
          const updated: ExpertAppointment = {
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
          pushAppointmentToAdminBookings(updated);
          return updated;
        }),
      }));
      pushManagerNotification({
        type: "booking",
        title: `Đề xuất đổi giờ ca ${targetAppt?.code || id}`,
        desc: `${profile.fullName} đề xuất giờ mới: ${proposedStartAt.replace("T", " ")}`,
        href: "/manager/bookings",
      });
      toast.success("Đã gửi đề xuất đổi giờ hẹn cho khách hàng & Quản lý!");
    },
    [profile.fullName, pushAppointmentToAdminBookings, store.appointments]
  );

  const acceptReschedule = useCallback(
    (id: string) => {
      const nowIso = new Date().toISOString();
      const targetAppt = store.appointments.find((a) => a.id === id);
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
    [profile.fullName, pushAppointmentToAdminBookings, store.appointments]
  );

  const addPrescription = useCallback((prescription: Prescription) => {
    setStore((prev) => {
      const targetRecordId =
        prescription.medicalRecordId ||
        prev.medicalRecords.find(
          (r) =>
            (prescription.appointmentId &&
              r.appointmentId === prescription.appointmentId) ||
            (r.petId === prescription.petId && r.date === prescription.issuedAt)
        )?.id;

      const enrichedRx: Prescription = {
        ...prescription,
        medicalRecordId: targetRecordId,
      };

      return {
        ...prev,
        prescriptions: [enrichedRx, ...prev.prescriptions],
        appointments: prev.appointments.map((a) =>
          a.id === prescription.appointmentId
            ? { ...a, prescriptionId: prescription.id }
            : a
        ),
        medicalRecords: targetRecordId
          ? prev.medicalRecords.map((r) =>
              r.id === targetRecordId
                ? { ...r, prescriptionId: prescription.id }
                : r
            )
          : prev.medicalRecords,
      };
    });
    toast.success(`Đã lưu đơn thuốc ${prescription.code}!`);
  }, []);

  const addMedicalRecord = useCallback(
    (record: MedicalRecord) => {
      const generatedEntries: HealthEntry[] = [
        {
          id: `he-ill-${Date.now()}`,
          petId: record.petId,
          kind: "illness",
          date: record.date,
          title: record.diagnosis,
          detail: `${record.symptoms}${record.note ? ` • Chỉ định: ${record.note}` : ""}`,
          nextDueDate: record.revisitDate || undefined,
          authorId: profile.id,
          authorName: profile.fullName,
        },
      ];

      if (record.nextVaccineDate) {
        generatedEntries.push({
          id: `he-vac-${Date.now() + 1}`,
          petId: record.petId,
          kind: "vaccine",
          date: record.date,
          title: "Nhắc lịch tiêm chủng theo chỉ định bác sĩ",
          detail: `Chẩn đoán liên quan: ${record.diagnosis}`,
          nextDueDate: record.nextVaccineDate,
          authorId: profile.id,
          authorName: profile.fullName,
        });
      }

      if (record.nextDewormDate) {
        generatedEntries.push({
          id: `he-dew-${Date.now() + 2}`,
          petId: record.petId,
          kind: "deworm",
          date: record.date,
          title: "Nhắc lịch tẩy giun định kỳ theo chỉ định bác sĩ",
          detail: `Chẩn đoán liên quan: ${record.diagnosis}`,
          nextDueDate: record.nextDewormDate,
          authorId: profile.id,
          authorName: profile.fullName,
        });
      }

      setStore((prev) => ({
        ...prev,
        medicalRecords: [record, ...prev.medicalRecords],
        healthEntries: [...generatedEntries, ...prev.healthEntries],
        appointments: prev.appointments.map((a) =>
          a.id === record.appointmentId
            ? { ...a, medicalRecordId: record.id }
            : a
        ),
      }));
      toast.success("Đã lưu bệnh án và đồng bộ vào sổ sức khỏe của thú cưng!");
    },
    [profile.id, profile.fullName]
  );

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
      // 1. Kiểm tra loại yêu cầu hợp lệ theo hình thức và vai trò (Bác sĩ chỉ xin nghỉ; Full-time không đổi ca)
      const validation = validateShiftRequestKindForEmployment(
        req.kind,
        profile.employmentType,
        profile.expertType
      );
      if (!validation.allowed) {
        toast.error(validation.reason || "Loại yêu cầu không hợp lệ cho hình thức nhân sự này.");
        return;
      }

      // 2. Chặn yêu cầu cho các tuần đã qua trong tháng
      if (isDateInPastWeek(req.date)) {
        toast.error("Không thể tạo yêu cầu lịch cho các tuần đã qua trong tháng.");
        return;
      }

      // 3. Chặn gửi trùng đơn xin nghỉ phép cùng ngày (khi đang chờ duyệt hoặc đã duyệt)
      if (
        req.kind === "leave" &&
        store.shiftRequests.some(
          (r) => r.kind === "leave" && r.date === req.date && r.status !== "rejected"
        )
      ) {
        toast.error(
          `Bạn đã có đơn xin nghỉ phép ngày ${formatDateDdMmYyyy(req.date)} rồi.`
        );
        return;
      }

      // 4. Nhân viên part-time: ca nghỉ có sẵn thì không đổi ca
      if (
        profile.employmentType === "part_time" &&
        req.kind === "shift_swap" &&
        isPartTimeOffShift(store.shifts, profile.id, req.date, req.shift)
      ) {
        toast.error("Khung ca này là ca nghỉ có sẵn của bạn, không thể đổi ca.");
        return;
      }

      // 5. Xin nghỉ thì nghỉ cả ngày không cần tính buổi
      const normalizedShift = req.kind === "leave" ? undefined : req.shift;

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
          shift: normalizedShift,
          policyWarnings: policyWarnings.length > 0 ? policyWarnings : undefined,
          exceedsMonthlyLeaveLimit,
        };

        return {
          ...prev,
          shiftRequests: [newReq, ...prev.shiftRequests],
        };
      });

      const kindTitle =
        req.kind === "leave"
          ? "Đơn xin nghỉ phép cần duyệt"
          : req.kind === "extra_shift"
          ? "Đơn đăng ký ca làm thêm cần duyệt"
          : "Đơn xin đổi ca cần duyệt";

      pushManagerNotification({
        type: "staff",
        title: kindTitle,
        desc: `${profile.fullName} gửi yêu cầu ngày ${formatDateDdMmYyyy(req.date)}.`,
        href: "/manager/staff?tab=requests",
      });

      toast.success(
        req.policyWarnings && req.policyWarnings.length > 0
          ? "Đã gửi yêu cầu kèm cờ cảnh báo tới Manager xem xét!"
          : "Đã gửi yêu cầu tới Manager phê duyệt!"
      );
    },
    [
      profile.id,
      profile.fullName,
      profile.employmentType,
      profile.expertType,
      store.shifts,
      store.shiftRequests,
    ]
  );

  const addPet = useCallback(
    (petInput: Omit<ExpertPet, "id" | "createdByExpertId">): ExpertPet => {
      const created: ExpertPet = {
        ...petInput,
        id: `pet-exp-${Date.now()}`,
        createdByExpertId: profile.id,
      };
      setPets((prev) => {
        const next = [created, ...prev];
        writeExpertPetsRegistry(next);
        return next;
      });
      toast.success(`Đã thêm hồ sơ thú cưng "${created.name}"!`);
      return created;
    },
    [profile.id]
  );

  const updatePet = useCallback((petId: string, patch: Partial<ExpertPet>) => {
    setPets((prev) => {
      const next = prev.map((p) => (p.id === petId ? { ...p, ...patch } : p));
      writeExpertPetsRegistry(next);
      return next;
    });
    toast.success("Đã cập nhật thông tin hồ sơ thú cưng!");
  }, []);

  const deletePet = useCallback(
    (petId: string): { ok: boolean; reason?: string } => {
      const hasLinkedHistory =
        store.appointments.some((a) => a.petId === petId) ||
        store.medicalRecords.some((r) => r.petId === petId) ||
        EXPERT_IDS.some((expertId) => {
          const st = readExpertStore(expertId);
          return (
            st.appointments.some((a) => a.petId === petId) ||
            st.medicalRecords.some((r) => r.petId === petId)
          );
        });

      if (hasLinkedHistory) {
        const reason =
          "Không thể xóa thú cưng đang có lịch hẹn hoặc bệnh án lưu trữ để bảo toàn dữ liệu y tế.";
        toast.error(reason);
        return { ok: false, reason };
      }

      setPets((prev) => {
        const next = prev.filter((p) => p.id !== petId);
        writeExpertPetsRegistry(next);
        return next;
      });
      toast.success("Đã xóa hồ sơ thú cưng khỏi danh sách.");
      return { ok: true };
    },
    [store.appointments, store.medicalRecords]
  );

  const cancelShiftRequest = useCallback((id: string) => {
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
  }, []);

  const reportReview = useCallback(
    (reviewId: string, reason: string) => {
      const todayIso = getTodayLocalIso();
      setStore((prev) => ({
        ...prev,
        reviews: prev.reviews.map((rev) =>
          rev.id === reviewId
            ? {
                ...rev,
                reported: {
                  reason,
                  at: todayIso,
                  status: "sent",
                },
              }
            : rev
        ),
      }));
      pushManagerNotification({
        type: "staff",
        title: "Báo cáo đánh giá cần kiểm tra",
        desc: `${profile.fullName} đã báo cáo một đánh giá (${reason}).`,
        href: "/manager/staff",
      });
      toast.success("Đã gửi báo cáo vi phạm tới Quản lý nghiệp vụ Animora!");
    },
    [profile.fullName]
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
    isPartTime,
    store,
    scopedPets,
    scopedOwners,
    allServices: SEED_SERVICES,
    allPets: pets,
    allOwners: SEED_OWNERS,
    updateAppointment,
    confirmAppointment,
    startAppointment,
    advanceCareStage,
    completeAppointment,
    rejectAppointment,
    proposeAppointmentTime,
    acceptReschedule,
    addPrescription,
    addMedicalRecord,
    addHealthEntry,
    addWeightLog,
    addPet,
    updatePet,
    deletePet,
    submitShiftRequest,
    cancelShiftRequest,
    reportReview,
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

