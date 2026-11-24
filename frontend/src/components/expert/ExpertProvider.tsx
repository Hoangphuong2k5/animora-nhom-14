"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { toast } from "sonner";
import { devGetSessionInfoAction } from "@/actions/auth.action";
import {
  getInitialExpertStore,
  getScopedOwners,
  getScopedPets,
  SEED_EXPERTS,
  SEED_OWNERS,
  SEED_PETS,
  SEED_SERVICES,
} from "@/data/expertPortalData";
import {
  EXPERT_SYNC_EVENT,
  getExpertStorageKey,
  normalizeExpertStore,
  PET_SYNC_EVENT,
  pushManagerNotification,
  readExpertPetsRegistry,
  syncExpertAppointmentToAdminBookings,
} from "@/utils/clinicalSync";
import { getTodayLocalIso } from "@/utils/dateFormat";
import type {
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
  resolveExpertIdentityFromSession,
  type SessionIdentityOverride,
} from "./provider/sessionResolver";
import { useExpertAppointmentActions } from "./provider/useExpertAppointmentActions";
import { useExpertClinicalAndPetActions } from "./provider/useExpertClinicalAndPetActions";
import { useExpertShiftActions } from "./provider/useExpertShiftActions";

interface ExpertContextValue {
  profile: ExpertProfile;
  isVet: boolean;
  store: ExpertStoreState;
  scopedPets: ExpertPet[];
  scopedOwners: ExpertPetOwner[];
  allServices: ExpertServiceDef[];
  allPets: ExpertPet[];
  allOwners: ExpertPetOwner[];
  updateAppointment: (id: string, patch: Partial<ExpertAppointment>) => void;
  confirmAppointment: (id: string) => void;
  startAppointment: (id: string) => void;
  advanceCareStage: (id: string, stage: CareServiceStage, note?: string) => void;
  completeAppointment: (
    id: string,
    note: string,
    condition?: string,
    followUp?: string
  ) => void;
  rejectAppointment: (id: string, reason: string) => void;
  acceptReschedule: (id: string) => void;
  addPrescription: (prescription: Prescription) => void;
  addMedicalRecord: (record: MedicalRecord) => void;
  addHealthEntry: (entry: HealthEntry) => void;
  addWeightLog: (log: WeightLog) => void;
  updatePet: (petId: string, patch: Partial<ExpertPet>) => void;
  confirmCustomerNoteToMedicalProfile: (
    petId: string,
    noteId: string,
    targetField: "allergies" | "behaviors"
  ) => void;
  submitShiftRequest: (
    req: Omit<ShiftRequest, "id" | "expertId" | "createdAt" | "status">
  ) => void;
  cancelShiftRequest: (id: string) => void;
  reportReview: (reviewId: string, reason: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateProfile: (
    patch: Partial<ExpertProfile>,
    options?: { silent?: boolean }
  ) => void;
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
  const [currentExpertId, setCurrentExpertId] =
    useState<string>(initialExpertId);
  const [sessionIdentityOverride, setSessionIdentityOverride] =
    useState<SessionIdentityOverride | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function syncSession() {
      try {
        const session = await devGetSessionInfoAction();
        if (!isMounted) return;
        if (session.isLoggedIn) {
          const resolved = resolveExpertIdentityFromSession(session);
          if (resolved) {
            setSessionIdentityOverride(resolved.identityOverride);
            setCurrentExpertId(resolved.expertId);
            return;
          }
        }
      } catch {
        // fallback to localStorage
      }

      try {
        const rawUser = localStorage.getItem("animora_current_user");
        if (rawUser) {
          const resolved = resolveExpertIdentityFromSession(
            JSON.parse(rawUser)
          );
          if (resolved) {
            setSessionIdentityOverride(resolved.identityOverride);
            setCurrentExpertId(resolved.expertId);
          }
        }
      } catch {
        // ignore storage errors
      }
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

  useEffect(() => {
    hasHydratedRef.current = false;
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      try {
        setPets(readExpertPetsRegistry());
        const raw = localStorage.getItem(getExpertStorageKey(currentExpertId));
        if (raw) {
          setStore(normalizeExpertStore(JSON.parse(raw), currentExpertId));
          hasHydratedRef.current = true;
          return;
        }
      } catch {
        // fallback to seed store
      }
      setStore(getInitialExpertStore(currentExpertId));
      hasHydratedRef.current = true;
    });
    return () => {
      cancelled = true;
    };
  }, [currentExpertId]);

  useEffect(() => {
    if (!hasHydratedRef.current) return;
    try {
      localStorage.setItem(
        getExpertStorageKey(currentExpertId),
        JSON.stringify(store)
      );
      isSelfDispatchingRef.current = true;
      try {
        window.dispatchEvent(new Event(PET_SYNC_EVENT));
        window.dispatchEvent(new Event(EXPERT_SYNC_EVENT));
      } finally {
        isSelfDispatchingRef.current = false;
      }
    } catch {
      // ignore storage errors
    }
  }, [store, currentExpertId]);

  const refreshFromStorage = useCallback(() => {
    try {
      setPets(readExpertPetsRegistry());
      const raw = localStorage.getItem(getExpertStorageKey(currentExpertId));
      if (raw) setStore(normalizeExpertStore(JSON.parse(raw), currentExpertId));
    } catch {
      // ignore storage errors
    }
  }, [currentExpertId]);

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

  const baseProfile =
    store.profile ||
    SEED_EXPERTS[currentExpertId] ||
    SEED_EXPERTS["exp-vet-01"];
  const profile: ExpertProfile = useMemo(
    () =>
      sessionIdentityOverride
        ? {
            ...baseProfile,
            ...(sessionIdentityOverride.fullName
              ? { fullName: sessionIdentityOverride.fullName }
              : {}),
            ...(sessionIdentityOverride.email
              ? { email: sessionIdentityOverride.email }
              : {}),
            ...(sessionIdentityOverride.expertType
              ? { expertType: sessionIdentityOverride.expertType }
              : {}),
          }
        : baseProfile,
    [baseProfile, sessionIdentityOverride]
  );
  const isVet = profile.expertType === "vet";

  const pushAppointmentToAdminBookings = useCallback(
    (appt: ExpertAppointment) => {
      const pet = pets.find((p) => p.id === appt.petId);
      const owner = SEED_OWNERS.find((o) => o.id === appt.ownerId);
      const srv = SEED_SERVICES.find((s) => s.id === appt.serviceId);
      syncExpertAppointmentToAdminBookings(appt, {
        petName: pet?.name,
        petSpecies:
          pet?.species === "cat"
            ? "Mèo"
            : pet?.species === "rabbit"
            ? "Thỏ & chuột"
            : "Chó",
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

  const appointmentActions = useExpertAppointmentActions({
    profile,
    isVet,
    appointments: store.appointments,
    setStore,
    pushAppointmentToAdminBookings,
  });

  const clinicalAndPetActions = useExpertClinicalAndPetActions({
    profile,
    isVet,
    setStore,
    setPets,
  });

  const shiftActions = useExpertShiftActions({
    profile,
    appointments: store.appointments,
    shiftRequests: store.shiftRequests,
    setStore,
  });

  const reportReview = useCallback(
    (reviewId: string, reason: string) => {
      const todayIso = getTodayLocalIso();
      setStore((prev) => ({
        ...prev,
        reviews: prev.reviews.map((rev) =>
          rev.id === reviewId
            ? {
                ...rev,
                reported: { reason, at: todayIso, status: "sent" },
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
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, unread: false } : n
      ),
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
    allPets: pets,
    allOwners: SEED_OWNERS,
    ...appointmentActions,
    ...clinicalAndPetActions,
    ...shiftActions,
    reportReview,
    markNotificationAsRead,
    markAllNotificationsRead,
    updateProfile,
    refreshFromStorage,
  };

  return (
    <ExpertContext.Provider value={value}>{children}</ExpertContext.Provider>
  );
}

export function useExpert() {
  const ctx = useContext(ExpertContext);
  if (!ctx) {
    throw new Error("useExpert must be used within an ExpertProvider");
  }
  return ctx;
}
