import { safeGetStorage, safeSetStorage } from "@/utils/cartLogic";
import {
  ADMIN_BOOKINGS_STORAGE_KEY,
  ADMIN_BOOKINGS_SYNC_EVENT,
  readExpertPetsRegistry,
  writeExpertPetsRegistry,
} from "@/utils/clinicalSync";
import {
  BOOKINGS_SEED_VERSION,
  buildDefaultBookings,
  type ExtendedBooking,
  sortBookingsByNearestTime,
} from "@/components/shared/operations/bookings/bookingsTypesAndData";
import type { ExpertPet } from "@/types/expert.type";
import {
  INITIAL_RECEPTIONIST_AUDIT_LOGS,
  INITIAL_WALK_IN_CUSTOMERS,
  INITIAL_WALK_IN_PETS,
  type ManualRefundCompensationEntry,
  RECEPTIONIST_STORAGE_KEYS,
  RECEPTIONIST_SYNC_EVENT,
  type ReceptionistAuditLogEntry,
  type ServiceInvoiceRecord,
  type WalkInCustomerRecord,
  type WalkInPetRecord,
} from "./types";

const BOOKINGS_SEED_KEY = "animora_bookings_seed_version_v2";

export function dispatchReceptionistSync(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ADMIN_BOOKINGS_SYNC_EVENT));
  window.dispatchEvent(new Event(RECEPTIONIST_SYNC_EVENT));
}

export function loadReceptionistBookings(): ExtendedBooking[] {
  const seedVer = safeGetStorage<string>(BOOKINGS_SEED_KEY, "");
  const saved = safeGetStorage<ExtendedBooking[]>(ADMIN_BOOKINGS_STORAGE_KEY, []);
  if (Array.isArray(saved) && saved.length > 0 && seedVer === BOOKINGS_SEED_VERSION) {
    return sortBookingsByNearestTime(saved);
  }
  const seeded = sortBookingsByNearestTime(buildDefaultBookings());
  safeSetStorage(ADMIN_BOOKINGS_STORAGE_KEY, seeded);
  safeSetStorage(BOOKINGS_SEED_KEY, BOOKINGS_SEED_VERSION);
  return seeded;
}

export function saveReceptionistBookings(nextBookings: ExtendedBooking[]): ExtendedBooking[] {
  const sorted = sortBookingsByNearestTime(nextBookings);
  safeSetStorage(ADMIN_BOOKINGS_STORAGE_KEY, sorted);
  return sorted;
}

export function loadWalkInCustomers(): WalkInCustomerRecord[] {
  return safeGetStorage<WalkInCustomerRecord[]>(
    RECEPTIONIST_STORAGE_KEYS.walkInCustomers,
    INITIAL_WALK_IN_CUSTOMERS
  );
}

export function saveWalkInCustomers(customers: WalkInCustomerRecord[]): void {
  safeSetStorage(RECEPTIONIST_STORAGE_KEYS.walkInCustomers, customers);
}

export function loadWalkInPets(): WalkInPetRecord[] {
  return safeGetStorage<WalkInPetRecord[]>(
    RECEPTIONIST_STORAGE_KEYS.walkInPets,
    INITIAL_WALK_IN_PETS
  );
}

export function saveWalkInPets(pets: WalkInPetRecord[]): void {
  safeSetStorage(RECEPTIONIST_STORAGE_KEYS.walkInPets, pets);
}

export function appendReceptionistAuditLog(entry: ReceptionistAuditLogEntry): void {
  const logs = safeGetStorage<ReceptionistAuditLogEntry[]>(
    RECEPTIONIST_STORAGE_KEYS.auditLogs,
    INITIAL_RECEPTIONIST_AUDIT_LOGS
  );
  safeSetStorage(RECEPTIONIST_STORAGE_KEYS.auditLogs, [entry, ...logs]);
}

export function appendManualLedger(entry: ManualRefundCompensationEntry): void {
  const ledgers = safeGetStorage<ManualRefundCompensationEntry[]>(
    RECEPTIONIST_STORAGE_KEYS.manualLedgers,
    []
  );
  safeSetStorage(RECEPTIONIST_STORAGE_KEYS.manualLedgers, [entry, ...ledgers]);
}

export function appendServiceInvoice(entry: ServiceInvoiceRecord): void {
  const invoices = safeGetStorage<ServiceInvoiceRecord[]>(
    RECEPTIONIST_STORAGE_KEYS.invoices,
    []
  );
  safeSetStorage(RECEPTIONIST_STORAGE_KEYS.invoices, [entry, ...invoices]);
}

/**
 * Đồng bộ hồ sơ thú cưng khách vãng lai do Lễ tân tạo sang kho thú cưng của Bác sĩ/NVCS
 * (`animora_expert_pets_v2`) để cổng `/expert` hiển thị tức thì.
 */
export function syncWalkInPetToExpertRegistry(pet: WalkInPetRecord): void {
  if (typeof window === "undefined") return;
  const current = readExpertPetsRegistry();
  const exists = current.some((p) => p.id === pet.id);
  if (exists) return;

  const speciesMap: Record<WalkInPetRecord["species"], ExpertPet["species"]> = {
    Chó: "dog",
    Mèo: "cat",
    Thỏ: "rabbit",
    Chuột: "hamster",
  };

  const ageYears = Math.max(0, parseFloat(pet.age) || 1);
  const approxBirthYear = new Date().getFullYear() - Math.floor(ageYears);

  const expertPet: ExpertPet = {
    id: pet.id,
    ownerId: pet.customerId,
    name: pet.name,
    species: speciesMap[pet.species],
    breed: pet.breed || "Lai",
    gender: pet.gender === "Đực" ? "male" : "female",
    birthDate: `${approxBirthYear}-01-01`,
    weightKg: pet.weightKg,
    photo:
      pet.species === "Mèo"
        ? "/assets/images/about_fluffy_cat_1793177483392.jpg"
        : pet.species === "Thỏ"
        ? "/assets/adoption/tuyet-nhung-1.jpg"
        : pet.species === "Chuột"
        ? "/assets/adoption/banh-quy-1.jpg"
        : "/assets/images/hero_golden_retriever_1793177482877.jpg",
    allergies: pet.allergies || undefined,
    behaviors: pet.behaviorNote || undefined,
    ownerNote: "Hồ sơ do Lễ tân tạo cho khách vãng lai (Do khách khai)",
  };

  writeExpertPetsRegistry([expertPet, ...current]);
}
