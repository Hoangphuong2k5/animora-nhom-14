import type {
  ExpertAppointment,
  ExpertPet,
  ExpertPetOwner,
  ExpertStoreState,
  ExpertType,
} from "@/types/expert.type";
import {
  SEED_EXPERTS,
  SEED_OWNERS,
  SEED_PETS,
  SEED_SERVICES,
} from "./expertSeeds/staffAndServices";
import {
  SEED_APPOINTMENTS,
  SEED_SHIFTS,
  SEED_SHIFT_REQUESTS,
} from "./expertSeeds/appointmentsAndShifts";
import {
  SEED_HEALTH_ENTRIES,
  SEED_MEDICAL_RECORDS,
  SEED_NOTIFICATIONS,
  SEED_PRESCRIPTIONS,
  SEED_REVIEWS,
  SEED_WEIGHT_LOGS,
} from "./expertSeeds/clinicalAndFeedback";

export {
  SEED_EXPERTS,
  SEED_OWNERS,
  SEED_PETS,
  SEED_SERVICES,
  SEED_APPOINTMENTS,
  SEED_SHIFTS,
  SEED_SHIFT_REQUESTS,
  SEED_HEALTH_ENTRIES,
  SEED_WEIGHT_LOGS,
  SEED_MEDICAL_RECORDS,
  SEED_PRESCRIPTIONS,
  SEED_REVIEWS,
  SEED_NOTIFICATIONS,
};

export { computeCancellationFee } from "@/utils/expertPolicy";

// ==========================================
// 1. FORMAT TÊN CHUYÊN VIÊN & BÁC SĨ
// ==========================================
export function stripExpertPrefix(rawName: string): string {
  if (!rawName) return "";
  return rawName
    .trim()
    .replace(/^(BS\.\s*CKI|BS\s*CKI|BS\.|BS|Dr\.|Chuyên viên|CV\.|HLV|Specialist|Trainer)\s+/i, "")
    .trim();
}

export function getExpertHonorificPrefix(
  expertType: ExpertType,
  lang: "vi" | "en" = "vi"
): string {
  if (expertType === "vet") return lang === "en" ? "Dr." : "BS.";
  if (expertType === "trainer") return lang === "en" ? "Trainer" : "HLV";
  return lang === "en" ? "Specialist" : "Chuyên viên";
}

export function formatExpertDisplayName(
  rawName: string,
  expertType: ExpertType,
  lang: "vi" | "en" = "vi"
): string {
  const pure = stripExpertPrefix(rawName);
  const prefix = getExpertHonorificPrefix(expertType, lang);
  if (!pure) return prefix;
  return `${prefix} ${pure}`;
}

// ==========================================
// 2. SCOPED SELECTORS & STORE KHỞI TẠO
// ==========================================

/**
 * Lọc danh sách thú cưng: Chỉ hiển thị các thú cưng đã có ít nhất 1 booking với chuyên viên đó.
 */
export function getScopedPets(
  expertId: string,
  appointments: ExpertAppointment[],
  allPets: ExpertPet[] = SEED_PETS
): ExpertPet[] {
  const myPetIds = new Set(
    appointments.filter((a) => a.expertId === expertId).map((a) => a.petId)
  );
  return allPets.filter((p) => myPetIds.has(p.id));
}

/**
 * Lọc danh sách chủ nuôi: Chỉ hiển thị chủ nuôi có thú cưng đã book chuyên viên đó.
 */
export function getScopedOwners(
  expertId: string,
  appointments: ExpertAppointment[],
  allOwners: ExpertPetOwner[] = SEED_OWNERS
): ExpertPetOwner[] {
  const myOwnerIds = new Set(
    appointments.filter((a) => a.expertId === expertId).map((a) => a.ownerId)
  );
  return allOwners.filter((o) => myOwnerIds.has(o.id));
}

/**
 * Tạo dữ liệu store ban đầu cho chuyên viên.
 */
export function getInitialExpertStore(expertId: string): ExpertStoreState {
  const profile = SEED_EXPERTS[expertId] ?? SEED_EXPERTS["exp-vet-01"];
  return {
    version: 1,
    appointments: SEED_APPOINTMENTS.filter((a) => a.expertId === expertId),
    shifts: SEED_SHIFTS.filter((s) => s.expertId === expertId),
    shiftRequests: SEED_SHIFT_REQUESTS.filter((r) => r.expertId === expertId),
    healthEntries: SEED_HEALTH_ENTRIES,
    weightLogs: SEED_WEIGHT_LOGS,
    medicalRecords: SEED_MEDICAL_RECORDS.filter((m) => m.expertId === expertId),
    prescriptions: SEED_PRESCRIPTIONS.filter((p) => p.expertId === expertId),
    reviews: SEED_REVIEWS.filter((r) => r.expertId === expertId),
    notifications: SEED_NOTIFICATIONS.filter((n) => n.expertId === expertId),
    profile,
  };
}
