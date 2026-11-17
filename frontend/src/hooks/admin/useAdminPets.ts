import { useState, useEffect, useCallback } from "react";
import { safeGetStorage, safeSetStorage } from "@/utils/cartLogic";
import { AdminPetItem } from "@/components/admin/pets/petsData";
import {
  CareRecord,
  PetProfileEntity,
  WeightLog,
  createInitialCareRecords,
  createInitialPetProfiles,
  createInitialWeightLogs,
} from "@/data/petProfilesData";
import {
  EXPERT_SYNC_EVENT,
  PET_SYNC_EVENT,
  getDoctorCareRecordsForCustomerPet,
  getDoctorWeightLogsForCustomerPet,
  getSyncedMedicalRecordsForCustomerPet,
  getSyncedPrescriptionsForCustomerPet,
} from "@/utils/clinicalSync";
import { SEED_EXPERTS } from "@/data/expertPortalData";
import { MEDICINE_CATALOG } from "@/data/medicineCatalog";

const STORAGE_KEYS = {
  PROFILES: "animora_pet_profiles_v3",
  WEIGHTS: "animora_pet_weights_v3",
  RECORDS: "animora_pet_care_records_v3",
} as const;

function getFallbackPetPhoto(species?: string): string {
  if (species === "Mèo") return "/assets/images/about_fluffy_cat_1793177483392.jpg";
  if (species === "Chó") return "/assets/images/hero_golden_retriever_1793177482877.jpg";
  return "/assets/aistudio/cute_dog_transparent.png";
}

function resolvePetPhoto(photo: string | undefined, species?: string): string {
  if (!photo || photo.startsWith("blob:")) {
    return getFallbackPetPhoto(species);
  }
  return photo;
}

function parseWeightKg(raw?: string | number): number {
  if (typeof raw === "number" && !Number.isNaN(raw)) return raw;
  if (!raw) return 0;
  const parsed = parseFloat(String(raw).replace(",", "."));
  return Number.isNaN(parsed) ? 0 : parsed;
}

function mapCustomerPetToAdminItem(
  profile: PetProfileEntity,
  allWeights: WeightLog[],
  allRecords: CareRecord[]
): AdminPetItem {
  const doctorWeights = getDoctorWeightLogsForCustomerPet(profile.id, profile.name);
  const petWeights = [...allWeights.filter((w) => w.pet === profile.id), ...doctorWeights].sort(
    (a, b) => b.date.localeCompare(a.date)
  );
  const latestWeight = petWeights[0]?.kg ?? parseWeightKg(profile.weight);

  const doctorRecords = getDoctorCareRecordsForCustomerPet(profile.id, profile.name);
  const petRecords = [...allRecords.filter((r) => r.pet === profile.id), ...doctorRecords];

  const syncedMedical = getSyncedMedicalRecordsForCustomerPet(profile.id, profile.name);
  const syncedPrescriptions = getSyncedPrescriptionsForCustomerPet(profile.id, profile.name);

  const vaccines = petRecords
    .filter((r) => r.type === "vaccine")
    .map((r) => ({
      id: r.id,
      name: r.name,
      date: r.date,
      nextDate: r.nextDueDate || r.date,
      doctor: "BS. Animora",
      status: (r.status === "done" ? "done" : "upcoming") as "done" | "upcoming",
    }));

  const deworms = petRecords
    .filter((r) => r.type === "deworm")
    .map((r) => ({
      id: r.id,
      drug: r.name,
      date: r.date,
      nextDate: r.nextDueDate || r.date,
    }));

  const medicalHistory = [
    ...syncedMedical.map((m) => {
      const doctorName =
        SEED_EXPERTS[m.expertId]?.fullName || "BS. Animora";
      return {
        id: m.id,
        diagnosis: m.diagnosis,
        date: m.date,
        doctor: doctorName,
        treatment: m.note || m.symptoms || "Theo dõi tại phòng khám",
      };
    }),
    ...petRecords
      .filter((r) => r.type === "checkup" || r.type === "spa")
      .map((r) => ({
        id: r.id,
        diagnosis: r.name,
        date: r.date,
        doctor: r.type === "spa" ? "NV Chăm sóc Animora" : "BS. Animora",
        treatment: r.notes || "Đã hoàn thành dịch vụ",
      })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const prescriptions = syncedPrescriptions.map((pr) =>
    pr.lines
      .map((line) => {
        const medName =
          MEDICINE_CATALOG.find((med) => med.id === line.medicineId)?.name ||
          line.medicineId;
        return `${medName} (${line.dosage} · ${line.days} ngày · ${line.instruction})`;
      })
      .join("; ")
  );

  const upcomingReminders = petRecords
    .filter((r) => r.status === "upcoming" || Boolean(r.nextDueDate))
    .slice(0, 5)
    .map((r) => ({
      id: `rem-${r.id}`,
      title: r.name,
      dueDate: r.nextDueDate || r.date,
      type: r.type,
    }));

  const allDates = [
    ...petRecords.map((r) => r.date),
    ...syncedMedical.map((m) => m.date),
  ]
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a));

  return {
    id: profile.id,
    name: profile.name,
    photo: resolvePetPhoto(profile.photo, profile.species),
    species: profile.species || "Khác",
    breed: profile.breed || "Chưa rõ giống",
    age: profile.age || "Chưa rõ",
    weight: latestWeight,
    gender: profile.gender === "Đực" ? "Đực" : "Cái",
    neutered: Boolean(profile.neutered),
    microchip: profile.microchip || "Chưa gắn chip",
    ownerName: profile.owner || "Khách hàng Animora",
    ownerPhone: "0337203332",
    lastVisit: allDates[0] || profile.birthDate || "2026-11-01",
    allergies: profile.allergies || "Không có",
    vaccines,
    deworms,
    medicalHistory,
    prescriptions,
    upcomingReminders,
  };
}

export function useAdminPets() {
  const [pets, setPets] = useState<AdminPetItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSpecies, setFilterSpecies] = useState<string>("all");
  const [selectedPet, setSelectedPet] = useState<AdminPetItem | null>(null);

  const loadSyncedPets = useCallback(() => {
    let savedProfiles = safeGetStorage<PetProfileEntity[]>(STORAGE_KEYS.PROFILES, []);
    if (!Array.isArray(savedProfiles) || savedProfiles.length === 0) {
      savedProfiles = createInitialPetProfiles();
      safeSetStorage(STORAGE_KEYS.PROFILES, savedProfiles);
    }

    let savedWeights = safeGetStorage<WeightLog[]>(STORAGE_KEYS.WEIGHTS, []);
    if (!Array.isArray(savedWeights) || savedWeights.length === 0) {
      savedWeights = createInitialWeightLogs();
      safeSetStorage(STORAGE_KEYS.WEIGHTS, savedWeights);
    }

    let savedRecords = safeGetStorage<CareRecord[]>(STORAGE_KEYS.RECORDS, []);
    if (!Array.isArray(savedRecords) || savedRecords.length === 0) {
      savedRecords = createInitialCareRecords();
      safeSetStorage(STORAGE_KEYS.RECORDS, savedRecords);
    }

    const mapped = savedProfiles.map((p) =>
      mapCustomerPetToAdminItem(p, savedWeights, savedRecords)
    );
    setPets(mapped);
    setSelectedPet((prev) =>
      prev ? mapped.find((m) => m.id === prev.id) ?? null : null
    );
  }, []);

  useEffect(() => {
    loadSyncedPets();
    const handleSync = () => loadSyncedPets();
    window.addEventListener(PET_SYNC_EVENT, handleSync);
    window.addEventListener(EXPERT_SYNC_EVENT, handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener(PET_SYNC_EVENT, handleSync);
      window.removeEventListener(EXPERT_SYNC_EVENT, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [loadSyncedPets]);

  const filteredPets = pets.filter((p) => {
    const matchSpecies =
      filterSpecies === "all" ? true : p.species === filterSpecies;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.breed.toLowerCase().includes(q) ||
      p.ownerName.toLowerCase().includes(q) ||
      p.ownerPhone.includes(q) ||
      p.microchip.toLowerCase().includes(q);

    return matchSpecies && matchSearch;
  });

  return {
    pets,
    filteredPets,
    searchQuery,
    setSearchQuery,
    filterSpecies,
    setFilterSpecies,
    selectedPet,
    setSelectedPet,
  };
}
