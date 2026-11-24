import {
  SEED_EXPERTS,
  SEED_PETS,
  SEED_SHIFTS,
  getInitialExpertStore,
} from "@/data/expertPortalData";
import { isSundayDateIso } from "@/utils/expertPolicy";
import type { ExpertPet, ExpertStoreState } from "@/types/expert.type";

export const VET_EXPERT_IDS = ["exp-vet-01", "exp-vet-02", "exp-vet-03"] as const;
export const EXPERT_IDS = [
  "exp-vet-01",
  "exp-vet-02",
  "exp-vet-03",
  "exp-spa-01",
  "exp-spa-02",
] as const;
export type KnownExpertId = (typeof EXPERT_IDS)[number];

export const VET_STORE_STORAGE_KEY = "animora_expert_store_v2_exp-vet-01";
export const EXPERT_PETS_STORAGE_KEY = "animora_expert_pets_v2";
export const ADMIN_BOOKINGS_STORAGE_KEY = "animora_bookings_v2";
export const ADMIN_BOOKINGS_SYNC_EVENT = "animora_bookings_sync";
export const EXPERT_SYNC_EVENT = "animora_expert_sync";
export const PET_SYNC_EVENT = "animora_pet_sync";

export function createSyncEntityId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function getExpertStorageKey(expertId: string): string {
  return `animora_expert_store_v2_${expertId}`;
}

export function resolveExpertStoreKey(doctorId?: string): {
  expertId: string;
  storageKey: string;
} {
  if (doctorId === "exp-spa-01" || doctorId === "st-2") {
    return { expertId: "exp-spa-01", storageKey: getExpertStorageKey("exp-spa-01") };
  }
  if (doctorId === "exp-spa-02" || doctorId === "st-3") {
    return { expertId: "exp-spa-02", storageKey: getExpertStorageKey("exp-spa-02") };
  }
  if (doctorId && (EXPERT_IDS as readonly string[]).includes(doctorId)) {
    return { expertId: doctorId, storageKey: getExpertStorageKey(doctorId) };
  }
  return { expertId: "exp-vet-01", storageKey: VET_STORE_STORAGE_KEY };
}

function normalizeLegacyText(text: string): string {
  return text
    .replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, "$3-$2-$1")
    .replace(/Quản lý nghiệp vụ chính/g, "Manager");
}

/**
 * Chuẩn hóa dữ liệu store chuyên viên đọc từ localStorage:
 * - Lọc bỏ ca Chủ Nhật tồn dư từ bản cũ.
 * - Bổ sung đủ lịch cố định T2–T7 cho tuần hiện tại nếu thiếu.
 * - Chuẩn hóa văn bản ngày tháng cũ trong thông báo & ghi chú quản lý.
 */
export function normalizeExpertStore(
  parsed: ExpertStoreState,
  expertId: string
): ExpertStoreState {
  const existingShifts = Array.isArray(parsed.shifts) ? parsed.shifts : [];
  const cleanedShifts = existingShifts.filter((s) => !isSundayDateIso(s.date));
  const hasCurrentWeek = cleanedShifts.some((s) => s.id.startsWith("sh-wk-0-"));
  const existingShiftKeys = new Set(cleanedShifts.map((s) => `${s.date}|${s.shift}`));
  const missingSeedShifts = hasCurrentWeek
    ? []
    : SEED_SHIFTS.filter(
        (s) => s.expertId === expertId && !existingShiftKeys.has(`${s.date}|${s.shift}`)
      );
  const shifts = [...cleanedShifts, ...missingSeedShifts];

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

  const profile =
    parsed.profile?.id !== expertId && SEED_EXPERTS[expertId]
      ? SEED_EXPERTS[expertId]
      : parsed.profile;

  return { ...parsed, profile, shifts, notifications, shiftRequests };
}

export function readExpertPetsRegistry(): ExpertPet[] {
  if (typeof window === "undefined") return SEED_PETS;
  try {
    const raw = window.localStorage.getItem(EXPERT_PETS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as ExpertPet[];
      }
    }
  } catch {
    // ignore storage errors
  }
  return SEED_PETS;
}

export function writeExpertPetsRegistry(pets: ExpertPet[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(EXPERT_PETS_STORAGE_KEY, JSON.stringify(pets));
    window.dispatchEvent(new Event(EXPERT_SYNC_EVENT));
    window.dispatchEvent(new Event(PET_SYNC_EVENT));
  } catch {
    // ignore storage errors
  }
}

export function readExpertStoreByKey(
  expertId: string,
  storageKey: string
): ExpertStoreState {
  if (typeof window === "undefined") {
    return getInitialExpertStore(expertId);
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw) as ExpertStoreState;
      return normalizeExpertStore(parsed, expertId);
    }
  } catch {
    // ignore storage errors
  }
  return getInitialExpertStore(expertId);
}

export function writeExpertStoreByKey(
  storageKey: string,
  nextStore: ExpertStoreState
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(nextStore));
    window.dispatchEvent(new Event(EXPERT_SYNC_EVENT));
    window.dispatchEvent(new Event(PET_SYNC_EVENT));
  } catch {
    // ignore storage errors
  }
}

export function readExpertStore(expertId: string): ExpertStoreState {
  return readExpertStoreByKey(expertId, getExpertStorageKey(expertId));
}

export function writeExpertStore(
  expertId: string,
  nextStore: ExpertStoreState
): void {
  writeExpertStoreByKey(getExpertStorageKey(expertId), nextStore);
}

export function readVetStoreSnapshot(): ExpertStoreState {
  return readExpertStore("exp-vet-01");
}

export function writeVetStoreSnapshot(nextStore: ExpertStoreState): void {
  writeExpertStore("exp-vet-01", nextStore);
}

export function readAllVetStores(): Array<{
  expertId: string;
  store: ExpertStoreState;
}> {
  return VET_EXPERT_IDS.map((expertId) => ({
    expertId,
    store: readExpertStore(expertId),
  }));
}

