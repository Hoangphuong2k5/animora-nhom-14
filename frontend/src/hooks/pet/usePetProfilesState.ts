import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { Booking, Language, Pet, Vaccination } from '@/types';
import {
  CareRecord,
  CareRecordType,
  PetProfileEntity,
  WeightLog,
  INITIAL_PET_PROFILES,
  INITIAL_WEIGHT_LOGS,
  INITIAL_CARE_RECORDS,
  createInitialPetProfiles,
  createInitialWeightLogs,
  createInitialCareRecords,
  getSafeNow,
  computeDaysFromToday,
  formatDisplayDate,
  getCareRecordStatusBadge,
  getNearestReminderForPet,
  sortAndGroupCareRecords,
  computeWeightTrend,
  formatWeightNumber,
} from '@/data/petProfilesData';
import { triggerTextDownload } from '@/utils/downloadFile';
import {
  EXPERT_SYNC_EVENT,
  PET_SYNC_EVENT,
  getActiveMedicationReminders,
  getDoctorCareRecordsForCustomerPet,
  getDoctorWeightLogsForCustomerPet,
  getSyncedMedicalRecordsForCustomerPet,
  getSyncedPrescriptionsForCustomerPet,
} from '@/utils/clinicalSync';
import type { MedicalRecord, Prescription } from '@/types/expert.type';

const STORAGE_KEYS = {
  PROFILES: 'animora_pet_profiles_v3',
  WEIGHTS: 'animora_pet_weights_v3',
  RECORDS: 'animora_pet_care_records_v3',
  EMAIL_REMINDERS: 'animora_pet_email_reminders_v3',
};

interface UsePetProfilesStateParams {
  lang: Language;
  onUpdatePet?: (updatedPet: Pet, updatedVaccinations: Vaccination[]) => void;
  onAddPet?: (newPet: Pet, newVaccinations: Vaccination[]) => void;
  onDeletePet?: (petId: string) => void;
  onBookService?: (serviceName: string) => void;
  onAddBooking?: (booking: Booking) => void;
  onShowToast?: (text: string) => void;
}

/**
 * Manages pet profiles, weight logs, care history records, email reminders,
 * localStorage hydration/persistence, and modal triggers.
 */
export function usePetProfilesState({
  lang,
  onUpdatePet,
  onAddPet,
  onDeletePet,
  onBookService,
  onAddBooking,
  onShowToast,
}: UsePetProfilesStateParams) {
  const [isStorageHydrated, setIsStorageHydrated] = useState(false);
  const [referenceNow, setReferenceNow] = useState<Date>(() => getSafeNow());

  const [profiles, setProfiles] =
    useState<PetProfileEntity[]>(INITIAL_PET_PROFILES);
  const [weightLogs, setWeightLogs] =
    useState<WeightLog[]>(INITIAL_WEIGHT_LOGS);
  const [careRecords, setCareRecords] =
    useState<CareRecord[]>(INITIAL_CARE_RECORDS);
  const [emailRemindersMap, setEmailRemindersMap] = useState<
    Record<string, boolean>
  >({
    'pet-1': true,
    'pet-2': true,
    'pet-3': true,
    'pet-6': true,
  });

  const [activePetId, setActivePetId] = useState<string>(
    INITIAL_PET_PROFILES[0]?.id || 'pet-1'
  );
  const [isCrossfading, setIsCrossfading] = useState(false);
  const [petSearchQuery, setPetSearchQuery] = useState('');
  const [careFilter, setCareFilter] = useState<'all' | CareRecordType>('all');

  // Selector scroll edges
  const selectorScrollerRef = useRef<HTMLDivElement | null>(null);
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Modals state
  const [isEditPetModalOpen, setIsEditPetModalOpen] = useState(false);
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
  const [isDeletePetModalOpen, setIsDeletePetModalOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isCareModalOpen, setIsCareModalOpen] = useState(false);
  const [careModalDefaultType, setCareModalDefaultType] =
    useState<CareRecordType>('vaccine');
  const [editingCareRecord, setEditingCareRecord] = useState<CareRecord | null>(
    null
  );
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const [bookingModalService, setBookingModalService] = useState<string | null>(
    null
  );
  const [syncRevision, setSyncRevision] = useState(0);

  useEffect(() => {
    const bump = () => setSyncRevision((v) => v + 1);
    window.addEventListener(PET_SYNC_EVENT, bump);
    window.addEventListener(EXPERT_SYNC_EVENT, bump);
    return () => {
      window.removeEventListener(PET_SYNC_EVENT, bump);
      window.removeEventListener(EXPERT_SYNC_EVENT, bump);
    };
  }, []);

  const triggerToast = useCallback(
    (msg: string) => {
      if (onShowToast) {
        onShowToast(msg);
      } else {
        toast.success(msg);
      }
    },
    [onShowToast]
  );

  // Hydrate from localStorage after mount
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const realNow = new Date();
      setReferenceNow(realNow);

      let loadedProfiles = false;
      try {
        const savedProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
        if (savedProfiles) {
          const parsed = JSON.parse(savedProfiles);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProfiles(parsed);
            setActivePetId((prev) =>
              parsed.some((p: PetProfileEntity) => p.id === prev)
                ? prev
                : parsed[0].id
            );
            loadedProfiles = true;
          }
        }
      } catch {
        // ignore storage errors
      }
      if (!loadedProfiles) {
        setProfiles(createInitialPetProfiles(realNow));
      }

      let loadedWeights = false;
      try {
        const savedWeights = localStorage.getItem(STORAGE_KEYS.WEIGHTS);
        if (savedWeights) {
          const parsed = JSON.parse(savedWeights);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setWeightLogs(parsed);
            loadedWeights = true;
          }
        }
      } catch {
        // ignore
      }
      if (!loadedWeights) {
        setWeightLogs(createInitialWeightLogs(realNow));
      }

      let loadedRecords = false;
      try {
        const savedRecords = localStorage.getItem(STORAGE_KEYS.RECORDS);
        if (savedRecords) {
          const parsed = JSON.parse(savedRecords);
          if (Array.isArray(parsed)) {
            setCareRecords(parsed);
            loadedRecords = true;
          }
        }
      } catch {
        // ignore
      }
      if (!loadedRecords) {
        setCareRecords(createInitialCareRecords(realNow));
      }

      try {
        const savedReminders = localStorage.getItem(
          STORAGE_KEYS.EMAIL_REMINDERS
        );
        if (savedReminders) {
          const parsed = JSON.parse(savedReminders);
          if (parsed && typeof parsed === 'object') setEmailRemindersMap(parsed);
        }
      } catch {
        // ignore
      }

      setIsStorageHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Sync back to localStorage
  useEffect(() => {
    if (!isStorageHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      window.dispatchEvent(new Event(PET_SYNC_EVENT));
    } catch {
      // ignore
    }
  }, [profiles, isStorageHydrated]);

  useEffect(() => {
    if (!isStorageHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.WEIGHTS, JSON.stringify(weightLogs));
      window.dispatchEvent(new Event(PET_SYNC_EVENT));
    } catch {
      // ignore
    }
  }, [weightLogs, isStorageHydrated]);

  useEffect(() => {
    if (!isStorageHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(careRecords));
      window.dispatchEvent(new Event(PET_SYNC_EVENT));
    } catch {
      // ignore
    }
  }, [careRecords, isStorageHydrated]);

  useEffect(() => {
    if (!isStorageHydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEYS.EMAIL_REMINDERS,
        JSON.stringify(emailRemindersMap)
      );
    } catch {
      // ignore
    }
  }, [emailRemindersMap, isStorageHydrated]);

  const activePet = profiles.find((p) => p.id === activePetId) || profiles[0];

  const updateSelectorScrollEdges = useCallback(() => {
    const el = selectorScrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 6);
  }, []);

  useEffect(() => {
    updateSelectorScrollEdges();
    window.addEventListener('resize', updateSelectorScrollEdges);
    return () => window.removeEventListener('resize', updateSelectorScrollEdges);
  }, [profiles.length, petSearchQuery, updateSelectorScrollEdges]);

  const handleSelectPet = (petId: string) => {
    if (petId === activePetId) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setActivePetId(petId);
    if (!prefersReduced) {
      setIsCrossfading(true);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setIsCrossfading(false);
        });
      });
    }

    const scroller = selectorScrollerRef.current;
    const btn = pillRefs.current[petId];
    if (scroller && btn) {
      const targetLeft =
        btn.offsetLeft - scroller.clientWidth / 2 + btn.clientWidth / 2;
      scroller.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: prefersReduced ? 'auto' : 'smooth',
      });
    }
  };

  const visibleSelectorPets = profiles.filter((p) => {
    if (!petSearchQuery.trim()) return true;
    const q = petSearchQuery.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(q) ||
      p.species.toLowerCase().includes(q) ||
      p.breed.toLowerCase().includes(q)
    );
  });

  const doctorCareRecords: CareRecord[] =
    isStorageHydrated && activePet
      ? getDoctorCareRecordsForCustomerPet(activePet.id, activePet.name)
      : [];
  const basePetRecords = careRecords.filter((r) => r.pet === activePet?.id);
  const petRecords = [
    ...doctorCareRecords.filter(
      (dr) => !basePetRecords.some((br) => br.id === dr.id)
    ),
    ...basePetRecords,
  ];

  const doctorWeights: WeightLog[] =
    isStorageHydrated && activePet
      ? getDoctorWeightLogsForCustomerPet(activePet.id, activePet.name)
      : [];
  const basePetWeights = weightLogs.filter((w) => w.pet === activePet?.id);
  const petWeights = [
    ...basePetWeights,
    ...doctorWeights.filter(
      (dw) => !basePetWeights.some((bw) => bw.date === dw.date && bw.kg === dw.kg)
    ),
  ];

  const syncedMedicalRecords: MedicalRecord[] =
    isStorageHydrated && activePet
      ? (() => {
          void syncRevision;
          return getSyncedMedicalRecordsForCustomerPet(activePet.id, activePet.name);
        })()
      : [];
  const syncedPrescriptions: Prescription[] =
    isStorageHydrated && activePet
      ? (() => {
          void syncRevision;
          return getSyncedPrescriptionsForCustomerPet(activePet.id, activePet.name);
        })()
      : [];

  const weightTrend = computeWeightTrend(petWeights, lang);
  const medicationReminders = getActiveMedicationReminders(
    syncedPrescriptions,
    referenceNow
  );
  const nearestReminder = getNearestReminderForPet(
    petRecords,
    lang,
    referenceNow
  );
  const {
    filtered: filteredRecords,
    groupedByYear,
    showYearGroups,
  } = sortAndGroupCareRecords(petRecords, careFilter);

  const nextCheckupDays = computeDaysFromToday(
    activePet?.nextCheckupDate,
    referenceNow
  );

  // Actions
  const saveEditPet = (updated: PetProfileEntity) => {
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (onUpdatePet) {
      onUpdatePet(updated, []);
    } else {
      triggerToast(
        lang === 'vi'
          ? `Đã cập nhật thông tin của ${updated.name}!`
          : `Updated ${updated.name}'s profile!`
      );
    }
    setIsEditPetModalOpen(false);
  };

  const saveNewPet = (created: PetProfileEntity, initialLog: WeightLog) => {
    setProfiles((prev) => [...prev, created]);
    setWeightLogs((prev) => [...prev, initialLog]);
    if (onAddPet) {
      onAddPet(created, []);
    } else {
      triggerToast(
        lang === 'vi'
          ? `Đã thêm hồ sơ mới cho bé ${created.name}!`
          : `Added new profile for ${created.name}!`
      );
    }
    setActivePetId(created.id);
    setIsAddPetModalOpen(false);
  };

  const deletePet = (petId: string) => {
    const target = profiles.find((p) => p.id === petId);
    const nextProfiles = profiles.filter((p) => p.id !== petId);
    setProfiles(nextProfiles);
    setWeightLogs((prev) => prev.filter((w) => w.pet !== petId));
    setCareRecords((prev) => prev.filter((c) => c.pet !== petId));
    if (activePetId === petId) {
      setActivePetId(nextProfiles[0]?.id || '');
    }
    if (onDeletePet) {
      onDeletePet(petId);
    } else {
      triggerToast(
        lang === 'vi'
          ? `Đã xóa hồ sơ của bé ${target?.name || 'thú cưng'}!`
          : `Deleted ${target?.name || 'pet'}'s profile!`
      );
    }
    setIsDeletePetModalOpen(false);
  };

  const addWeightLog = (log: WeightLog, formattedWeight: string) => {
    if (!activePet) return;
    setWeightLogs((prev) => [...prev, log]);
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === activePet.id ? { ...p, weight: formattedWeight } : p
      )
    );
    triggerToast(
      lang === 'vi'
        ? `Đã lưu cân nặng mới (${formattedWeight}) cho ${activePet.name}!`
        : `Saved new weight (${formattedWeight}) for ${activePet.name}!`
    );
  };

  const openAddCareModal = (defaultType: CareRecordType = 'vaccine') => {
    setEditingCareRecord(null);
    setCareModalDefaultType(defaultType);
    setIsCareModalOpen(true);
  };

  const openEditCareModal = (rec: CareRecord) => {
    setEditingCareRecord(rec);
    setCareModalDefaultType(rec.type);
    setIsCareModalOpen(true);
  };

  const saveCareRecord = (record: CareRecord, isEdit: boolean) => {
    if (!activePet) return;
    if (isEdit) {
      setCareRecords((prev) =>
        prev.map((r) => (r.id === record.id ? record : r))
      );
      triggerToast(
        lang === 'vi'
          ? 'Đã cập nhật lịch sử chăm sóc thành công!'
          : 'Care record updated successfully!'
      );
    } else {
      setCareRecords((prev) => [record, ...prev]);
      triggerToast(
        lang === 'vi'
          ? `Đã thêm lịch chăm sóc mới cho ${activePet.name}!`
          : `Added new care record for ${activePet.name}!`
      );
    }
    setIsCareModalOpen(false);
  };

  const handleConfirmDeleteRecord = () => {
    if (!deletingRecordId) return;
    setCareRecords((prev) => prev.filter((r) => r.id !== deletingRecordId));
    setDeletingRecordId(null);
    triggerToast(
      lang === 'vi' ? 'Đã xóa mục lịch sử chăm sóc.' : 'Deleted care record.'
    );
  };

  const handleDownloadAttachment = (rec: CareRecord) => {
    if (!activePet) return;
    const filename =
      rec.attachmentName ||
      `phieu-cham-soc-${activePet.name.toLowerCase().replace(/\s+/g, '-')}-${rec.date}.txt`;
    const content = [
      `ANIMORA VETERINARY & PET CARE — CHỨNG NHẬN CHĂM SÓC`,
      `====================================================`,
      `Bé cưng / Pet: ${activePet.name} (${activePet.species} · ${activePet.breed})`,
      `Mã vi mạch / Microchip: ${activePet.microchip}`,
      `Hạng mục / Record: ${rec.name}`,
      `Ngày thực hiện / Date: ${formatDisplayDate(rec.date, lang)}`,
      rec.nextDueDate
        ? `Ngày nhắc tiếp theo / Next Due: ${formatDisplayDate(rec.nextDueDate, lang)}`
        : '',
      rec.notes ? `Ghi chú bác sĩ / Notes: ${rec.notes}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    triggerTextDownload(
      filename.endsWith('.pdf') ? filename.replace('.pdf', '.txt') : filename,
      content,
      'text/plain;charset=utf-8'
    );

    triggerToast(
      lang === 'vi'
        ? `Đang tải tệp đính kèm: ${rec.attachmentName || filename}`
        : `Downloading attachment: ${rec.attachmentName || filename}`
    );
  };

  const isEmailReminderOn = Boolean(emailRemindersMap[activePet?.id || '']);

  const handleToggleEmailReminder = () => {
    if (!activePet) return;
    const nextVal = !isEmailReminderOn;
    setEmailRemindersMap((prev) => ({ ...prev, [activePet.id]: nextVal }));
    triggerToast(
      nextVal
        ? lang === 'vi'
          ? `Đã bật nhắc lịch qua email cho bé ${activePet.name}.`
          : `Enabled email reminders for ${activePet.name}.`
        : lang === 'vi'
        ? `Đã tắt nhắc lịch qua email cho bé ${activePet.name}.`
        : `Disabled email reminders for ${activePet.name}.`
    );
  };

  const handleExportPdf = () => {
    if (!activePet) return;
    const lines = [
      `====================================================================`,
      `ANIMORA — SỔ SỨC KHỎE THÚ CƯNG (PET HEALTH RECORD - PDF EXPORT)`,
      `====================================================================`,
      `Tên bé / Pet Name: ${activePet.name}`,
      `Loài & Giống / Species & Breed: ${activePet.species} — ${activePet.breed}`,
      `Giới tính / Gender: ${activePet.gender}`,
      `Tuổi & Ngày sinh / Age & DOB: ${activePet.age} (${formatDisplayDate(activePet.birthDate, lang)})`,
      `Cân nặng hiện tại / Weight: ${weightTrend.formattedLatest || activePet.weight}`,
      `Màu lông / Coat Color: ${activePet.coatColor}`,
      `Dị ứng / Allergies: ${activePet.allergies}`,
      `Mã vi mạch / Microchip: ${activePet.microchip}`,
      `Khám định kỳ tiếp theo / Next Checkup: ${formatDisplayDate(activePet.nextCheckupDate, lang)}`,
      ``,
      `--------------------------------------------------------------------`,
      `LỊCH SỬ CÂN NẶNG (6 LẦN GẦN NHẤT / LAST 6 WEIGHT LOGS)`,
      `--------------------------------------------------------------------`,
      ...weightTrend.lastSix.map(
        (w) =>
          `- ${formatDisplayDate(w.date, lang)}: ${formatWeightNumber(w.kg, lang)} kg`
      ),
      ``,
      `--------------------------------------------------------------------`,
      `LỊCH SỬ TIÊM CHỦNG & CHĂM SÓC (VACCINES & CARE HISTORY)`,
      `--------------------------------------------------------------------`,
      ...(petRecords.length === 0
        ? [`(Chưa có lịch sử chăm sóc / No records yet)`]
        : petRecords.map((r) => {
            const badge = getCareRecordStatusBadge(r, lang, new Date());
            return `- [${formatDisplayDate(r.date, lang)}] ${r.name} (${badge.label})${
              r.nextDueDate
                ? ` | Hẹn tiếp: ${formatDisplayDate(r.nextDueDate, lang)}`
                : ''
            }${r.notes ? ` | Ghi chú: ${r.notes}` : ''}`;
          })),
      `====================================================================`,
      `Xuất từ hệ thống Sổ Sức Khỏe Animora (Đã ẩn thông tin liên hệ chủ nuôi)`,
    ].join('\n');

    triggerTextDownload(
      `so-suc-khoe-${activePet.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
      lines,
      'application/pdf'
    );

    triggerToast(
      lang === 'vi'
        ? `Đã xuất hồ sơ PDF của ${activePet.name} (đã ẩn thông tin chủ nuôi)!`
        : `Exported ${activePet.name}'s PDF health record (owner info hidden)!`
    );
  };

  const handleOpenReminderBooking = (serviceName: string) => {
    setBookingModalService(serviceName);
    if (onBookService) {
      onBookService(serviceName);
    }
  };

  const submitReminderBooking = (
    customerName: string,
    phone: string,
    date: string
  ) => {
    if (!bookingModalService || !activePet) return;
    const newBooking: Booking = {
      id: 'bk-' + Date.now(),
      fullName: customerName.trim() || activePet.owner || 'Khách hàng Animora',
      phone: phone.trim() || '0901234567',
      petType: `${activePet.species} (${activePet.name})`,
      service: bookingModalService,
      date,
      createdAt: new Date().toISOString(),
    };
    if (onAddBooking) {
      onAddBooking(newBooking);
    } else {
      triggerToast(
        lang === 'vi'
          ? `Đã đặt lịch "${bookingModalService}" cho bé ${activePet.name}!`
          : `Booked "${bookingModalService}" for ${activePet.name}!`
      );
    }
    setBookingModalService(null);
  };

  return {
    referenceNow,
    profiles,
    activePet,
    isCrossfading,
    petSearchQuery,
    setPetSearchQuery,
    careFilter,
    setCareFilter,
    selectorScrollerRef,
    pillRefs,
    canScrollLeft,
    canScrollRight,
    updateSelectorScrollEdges,
    visibleSelectorPets,
    careRecords,
    petRecords,
    syncedMedicalRecords,
    syncedPrescriptions,
    weightTrend,
    medicationReminders,
    nearestReminder,
    filteredRecords,
    groupedByYear,
    showYearGroups,
    nextCheckupDays,
    isEmailReminderOn,
    // Modals
    isEditPetModalOpen,
    setIsEditPetModalOpen,
    isAddPetModalOpen,
    setIsAddPetModalOpen,
    isDeletePetModalOpen,
    setIsDeletePetModalOpen,
    isWeightModalOpen,
    setIsWeightModalOpen,
    isCareModalOpen,
    setIsCareModalOpen,
    careModalDefaultType,
    editingCareRecord,
    deletingRecordId,
    setDeletingRecordId,
    bookingModalService,
    setBookingModalService,
    // Actions
    handleSelectPet,
    saveEditPet,
    saveNewPet,
    deletePet,
    addWeightLog,
    openAddCareModal,
    openEditCareModal,
    saveCareRecord,
    handleConfirmDeleteRecord,
    handleDownloadAttachment,
    handleToggleEmailReminder,
    handleExportPdf,
    handleOpenReminderBooking,
    submitReminderBooking,
  };
}

