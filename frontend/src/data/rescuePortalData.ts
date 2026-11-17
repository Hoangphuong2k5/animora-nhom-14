"use client";

import { useCallback, useEffect, useState } from "react";
import { safeGetStorage, safeSetStorage } from "@/utils/cartLogic";
import { AdoptionRequest } from "@/types";
import {
  ExtendedAdoptionPet,
  INITIAL_SHELTERS,
  SAMPLE_ADOPTION_REQUESTS,
  ShelterPartner,
  seedInitialAdoptionPets,
} from "@/components/manager/adoptions/managerAdoptionsData";
import {
  PetProfileEntity,
  createInitialPetProfiles,
  offsetDaysIso,
} from "@/data/petProfilesData";
import { PET_SYNC_EVENT } from "@/utils/clinicalSync";

export const ADOPTION_PETS_STORAGE_KEY = "animora_adoption_pets_v2";
export const ADOPTION_REQUESTS_STORAGE_KEY = "animora_adoption_requests_v2";
export const ADOPTION_SHELTERS_STORAGE_KEY = "animora_adoption_shelters_v2";
export const RESCUE_ACTIVE_SHELTER_KEY = "animora_rescue_active_shelter_v1";
export const ADOPTION_SYNC_EVENT = "animora_adoption_sync";

const CUSTOMER_PET_PROFILES_KEY = "animora_pet_profiles_v3";

export interface RescueAdoptionPet extends ExtendedAdoptionPet {
  healthSummary?: string;
  adoptionConditions?: string;
}

export function loadRescueShelters(): ShelterPartner[] {
  const saved = safeGetStorage<ShelterPartner[]>(ADOPTION_SHELTERS_STORAGE_KEY, []);
  if (Array.isArray(saved) && saved.length > 0) {
    return saved;
  }
  safeSetStorage(ADOPTION_SHELTERS_STORAGE_KEY, INITIAL_SHELTERS);
  return INITIAL_SHELTERS;
}

export function saveRescueShelters(next: ShelterPartner[]): void {
  safeSetStorage(ADOPTION_SHELTERS_STORAGE_KEY, next);
  window.dispatchEvent(new Event(ADOPTION_SYNC_EVENT));
}

export function loadRescuePets(): RescueAdoptionPet[] {
  const saved = safeGetStorage<RescueAdoptionPet[]>(ADOPTION_PETS_STORAGE_KEY, []);
  if (Array.isArray(saved) && saved.length > 0) {
    return saved;
  }
  const seeded = seedInitialAdoptionPets();
  safeSetStorage(ADOPTION_PETS_STORAGE_KEY, seeded);
  return seeded;
}

export function saveRescuePets(next: RescueAdoptionPet[]): void {
  safeSetStorage(ADOPTION_PETS_STORAGE_KEY, next);
  window.dispatchEvent(new Event(ADOPTION_SYNC_EVENT));
}

export function loadRescueRequests(): AdoptionRequest[] {
  const saved = safeGetStorage<AdoptionRequest[]>(
    ADOPTION_REQUESTS_STORAGE_KEY,
    []
  );
  if (Array.isArray(saved) && saved.length > 0) {
    return saved;
  }
  safeSetStorage(ADOPTION_REQUESTS_STORAGE_KEY, SAMPLE_ADOPTION_REQUESTS);
  return SAMPLE_ADOPTION_REQUESTS;
}

export function saveRescueRequests(next: AdoptionRequest[]): void {
  safeSetStorage(ADOPTION_REQUESTS_STORAGE_KEY, next);
  safeSetStorage("animora_adoption_requests", next);
  window.dispatchEvent(new Event(ADOPTION_SYNC_EVENT));
}

/**
 * Quy tắc hồ sơ thú cưng khi nhận nuôi (PhanTichNghiepVu.md Mục 8):
 * - Nếu thú cưng đã có hồ sơ trên Animora (`animora_pet_profiles_v3`), chuyển/liên kết hồ sơ hiện có
 *   sang khách hàng nhận nuôi, KHÔNG tạo hồ sơ trùng.
 * - Nếu chưa có hồ sơ, tạo 1 hồ sơ mới.
 */
export function syncAdoptedPetToCustomerProfiles(
  pet: RescueAdoptionPet | undefined,
  applicantName: string
): { action: "linked" | "created"; profileId: string } {
  let profiles = safeGetStorage<PetProfileEntity[]>(
    CUSTOMER_PET_PROFILES_KEY,
    []
  );
  if (!Array.isArray(profiles) || profiles.length === 0) {
    profiles = createInitialPetProfiles();
  }

  const targetName = (pet?.name || "").trim().toLowerCase();
  const targetChip = (pet?.microchip || "").trim().toLowerCase();

  const existingIndex = profiles.findIndex((existing) => {
    if (pet?.id && existing.id === pet.id) return true;
    if (
      targetChip &&
      existing.microchip &&
      existing.microchip.trim().toLowerCase() === targetChip
    ) {
      return true;
    }
    if (
      targetName &&
      existing.name.trim().toLowerCase() === targetName &&
      existing.species === pet?.species
    ) {
      return true;
    }
    return false;
  });

  if (existingIndex >= 0) {
    const existing = profiles[existingIndex];
    const updatedProfile: PetProfileEntity = {
      ...existing,
      owner: applicantName || existing.owner,
      vaccinated: pet?.vaccinated ?? existing.vaccinated,
      neutered: pet?.neutered ?? existing.neutered,
      photo: pet?.photo || existing.photo,
    };
    const nextProfiles = profiles.map((p, idx) =>
      idx === existingIndex ? updatedProfile : p
    );
    safeSetStorage(CUSTOMER_PET_PROFILES_KEY, nextProfiles);
    window.dispatchEvent(new Event(PET_SYNC_EVENT));
    return { action: "linked", profileId: existing.id };
  }

  const newProfileId = pet?.id || `pet-adopted-${Date.now()}`;
  const createdProfile: PetProfileEntity = {
    id: newProfileId,
    name: pet?.name || "Bé cưng nhận nuôi",
    species: pet?.species || "Chó",
    breed: pet?.breed || "Chưa rõ giống",
    breedEn: pet?.breedEn || pet?.breed || "Mixed",
    gender: pet?.gender === "Cái" ? "Cái" : "Đực",
    birthDate: new Date().toISOString().slice(0, 10),
    age: pet?.age || "1 tuổi",
    ageEn: pet?.ageEn || pet?.age || "1 year old",
    weight: pet?.weight || "5 kg",
    coatColor: pet?.color || "Tự nhiên",
    coatColorEn: pet?.colorEn || "Natural",
    allergies: "Không có",
    allergiesEn: "None",
    microchip: pet?.microchip || "Chưa gắn chip",
    photo: pet?.photo || "/assets/aistudio/cute_dog_transparent.png",
    neutered: Boolean(pet?.neutered),
    vaccinated: Boolean(pet?.vaccinated),
    nextCheckupDate: offsetDaysIso(30),
    owner: applicantName || "Khách hàng nhận nuôi",
  };

  const nextProfiles = [createdProfile, ...profiles];
  safeSetStorage(CUSTOMER_PET_PROFILES_KEY, nextProfiles);
  window.dispatchEvent(new Event(PET_SYNC_EVENT));
  return { action: "created", profileId: createdProfile.id };
}

export function useActiveRescueShelterFilter(): [string, (next: string) => void] {
  const [activeShelter, setActiveShelter] = useState<string>("all");

  useEffect(() => {
    const load = () => {
      const saved = safeGetStorage<string>(RESCUE_ACTIVE_SHELTER_KEY, "all");
      setActiveShelter(saved || "all");
    };
    load();
    window.addEventListener(ADOPTION_SYNC_EVENT, load);
    return () => window.removeEventListener(ADOPTION_SYNC_EVENT, load);
  }, []);

  const update = useCallback((next: string) => {
    safeSetStorage(RESCUE_ACTIVE_SHELTER_KEY, next);
    setActiveShelter(next);
    window.dispatchEvent(new Event(ADOPTION_SYNC_EVENT));
  }, []);

  return [activeShelter, update];
}
