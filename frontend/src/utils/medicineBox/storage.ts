import { MEDICINE_CATALOG } from "@/data/medicineCatalog";
import { SHOP_PRODUCTS } from "@/data/shopData";
import { SEED_EXPERTS } from "@/data/expertPortalData";
import { SUPPLIER_SYNC_EVENT } from "@/data/supplierPortalData";
import type { Product, ShopPetGroup } from "@/types/animora.type";
import type {
  MedicineBoxCategory,
  MedicineBoxLogEntry,
  MedicineBoxRequest,
  PetSpeciesCode,
} from "@/types/expert.type";

export const MEDICINE_BOX_SHELF_STORAGE_KEY = "animora_medicine_box_shelf_v1";
export const MEDICINE_BOX_REQUESTS_STORAGE_KEY =
  "animora_medicine_box_requests_v1";
export const MEDICINE_BOX_LOGS_STORAGE_KEY = "animora_medicine_box_logs_v1";
export const SHOP_PRODUCTS_STORAGE_KEY = "animora_shop_products_v2";
export const MEDICINE_BOX_SYNC_EVENT = "animora_medicine_box_sync";

export interface ShelfRecord {
  shelfStock: number;
  minShelfThreshold: number;
  lastUpdatedAt: string;
}

/** Bản đồ lưu ngưỡng cảnh báo & metadata theo từng bác sĩ (giữ tương thích ngược v1.3 -> v1.4) */
export type DoctorShelfStore = Record<string, Record<string, ShelfRecord>>;

export type StoredShopProduct = Product & {
  requiresPrescription?: boolean;
  isHidden?: boolean;
  costPrice?: number;
};

const DEFAULT_MIN_THRESHOLDS: Record<string, number> = {
  "med-001": 5,
  "med-002": 5,
  "med-003": 5,
  "med-004": 5,
  "med-005": 5,
  "med-006": 5,
  "med-007": 5,
  "med-008": 5,
  "med-009": 5,
  "med-010": 5,
  "med-011": 5,
  "med-012": 5,
  "vac-001": 5,
  "vac-002": 5,
  "vac-003": 5,
  "vac-004": 5,
};

const SEED_MEDICINE_BOX_REQUESTS: MedicineBoxRequest[] = [
  {
    id: "mbr-seed-01",
    expertId: "exp-vet-01",
    expertName: "BS. Lê Huy Hoàng",
    type: "add",
    medicineId: "med-002",
    shopProductId: "prod-rx-02",
    medicineName: "Metacam Oral Suspension 15ml (Meloxicam)",
    activeIngredient: "Meloxicam",
    unit: "lọ 15ml",
    quantity: 10,
    reason:
      "Nhu cầu giảm đau sau phẫu thuật tăng cao trong tuần, đề xuất Quản lý nhập bổ sung thêm vào Kho thuốc chung.",
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
];

export function getActiveVetDoctors(): { id: string; fullName: string }[] {
  return Object.values(SEED_EXPERTS)
    .filter((exp) => exp.expertType === "vet")
    .map((exp) => ({ id: exp.id, fullName: exp.fullName }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function mapShopGroupsToSpecies(groups?: ShopPetGroup[]): PetSpeciesCode[] {
  const result = new Set<PetSpeciesCode>();
  for (const g of groups ?? []) {
    if (g === "dog") result.add("dog");
    if (g === "cat") result.add("cat");
    if (g === "rabbit_rodent") {
      result.add("rabbit");
      result.add("hamster");
    }
  }
  return result.size > 0 ? Array.from(result) : ["dog", "cat"];
}

export function emitMedicineBoxSync(alsoNotifySupplier = false): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(MEDICINE_BOX_SYNC_EVENT));
  if (alsoNotifySupplier) {
    window.dispatchEvent(new Event(SUPPLIER_SYNC_EVENT));
  }
}

export function isMedicineOrVaccineProduct(
  p: Pick<StoredShopProduct, "category">
): boolean {
  const cat = String(p.category || "");
  return cat === "medicine" || cat === "vaccine";
}

export function resolveMedicineBoxCategory(
  p: Pick<StoredShopProduct, "category" | "medicineId" | "name" | "ingredientsVi">
): MedicineBoxCategory {
  if (String(p.category || "") === "vaccine") return "vaccine";
  if (p.medicineId && p.medicineId.startsWith("vac-")) return "vaccine";
  const text = `${p.name || ""} ${p.ingredientsVi || ""}`;
  if (
    /vắc[\s-]?xin|vaccine|rabisin|felocell|vanguard|nobivac|feligen/i.test(text)
  ) {
    return "vaccine";
  }
  return "medicine";
}

export function writeWarehouseProducts(products: StoredShopProduct[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      SHOP_PRODUCTS_STORAGE_KEY,
      JSON.stringify(products)
    );
  } catch {
    // ignore storage errors
  }
}

export function readWarehouseProducts(): StoredShopProduct[] {
  if (typeof window === "undefined") {
    return SHOP_PRODUCTS.map((p) => ({ ...p }));
  }
  try {
    const raw = window.localStorage.getItem(SHOP_PRODUCTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let dirty = false;
        const sanitized: StoredShopProduct[] = parsed.map(
          (p: StoredShopProduct) => {
            if (!isMedicineOrVaccineProduct(p) && p.requiresPrescription) {
              dirty = true;
              return { ...p, requiresPrescription: false };
            }
            return p;
          }
        );

        const existingIds = new Set(sanitized.map((p) => p.id));
        const missingMeds = SHOP_PRODUCTS.filter(
          (sp) => isMedicineOrVaccineProduct(sp) && !existingIds.has(sp.id)
        ).map((sp) => ({ ...sp, isHidden: false }));

        if (missingMeds.length > 0) {
          dirty = true;
          sanitized.push(...missingMeds);
        }

        if (dirty) {
          writeWarehouseProducts(sanitized);
        }
        return sanitized;
      }
    }
  } catch {
    // ignore
  }
  return SHOP_PRODUCTS.map((p) => ({ ...p }));
}

function createInitialMetaForDoctor(): Record<string, ShelfRecord> {
  const nowIso = new Date().toISOString();
  const map: Record<string, ShelfRecord> = {};
  for (const med of MEDICINE_CATALOG) {
    map[med.shopProductId] = {
      shelfStock: 0,
      minShelfThreshold: DEFAULT_MIN_THRESHOLDS[med.id] ?? 5,
      lastUpdatedAt: nowIso,
    };
  }
  return map;
}

function createInitialAllDoctorsShelfStore(): DoctorShelfStore {
  const doctors = getActiveVetDoctors();
  const store: DoctorShelfStore = {};
  doctors.forEach((doc) => {
    store[doc.id] = createInitialMetaForDoctor();
  });
  return store;
}

function isLegacyFlatShelfRecordMap(obj: Record<string, unknown>): boolean {
  const firstVal = Object.values(obj)[0];
  return (
    Boolean(firstVal) &&
    typeof firstVal === "object" &&
    firstVal !== null &&
    "shelfStock" in firstVal
  );
}

function ensureDoctorsAndMedsInStore(store: DoctorShelfStore): {
  store: DoctorShelfStore;
  updated: boolean;
} {
  let updated = false;
  const nowIso = new Date().toISOString();
  const doctors = getActiveVetDoctors();

  doctors.forEach((doc) => {
    if (!store[doc.id] || typeof store[doc.id] !== "object") {
      store[doc.id] = createInitialMetaForDoctor();
      updated = true;
      return;
    }
    for (const med of MEDICINE_CATALOG) {
      if (!(med.shopProductId in store[doc.id])) {
        store[doc.id][med.shopProductId] = {
          shelfStock: 0,
          minShelfThreshold: DEFAULT_MIN_THRESHOLDS[med.id] ?? 5,
          lastUpdatedAt: nowIso,
        };
        updated = true;
      }
    }
  });

  return { store, updated };
}

export function writeAllDoctorsShelfMap(store: DoctorShelfStore): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      MEDICINE_BOX_SHELF_STORAGE_KEY,
      JSON.stringify(store)
    );
  } catch {
    // ignore
  }
}

export function readAllDoctorsShelfMap(): DoctorShelfStore {
  if (typeof window === "undefined") {
    return createInitialAllDoctorsShelfStore();
  }
  try {
    const raw = window.localStorage.getItem(MEDICINE_BOX_SHELF_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        if (isLegacyFlatShelfRecordMap(parsed)) {
          const initialAll = createInitialAllDoctorsShelfStore();
          initialAll["exp-vet-01"] = parsed as Record<string, ShelfRecord>;
          const { store } = ensureDoctorsAndMedsInStore(initialAll);
          writeAllDoctorsShelfMap(store);
          return store;
        }
        const { store, updated } = ensureDoctorsAndMedsInStore(
          parsed as DoctorShelfStore
        );
        if (updated) {
          writeAllDoctorsShelfMap(store);
        }
        return store;
      }
    }
  } catch {
    // ignore
  }
  const initial = createInitialAllDoctorsShelfStore();
  writeAllDoctorsShelfMap(initial);
  return initial;
}

export function readShelfMap(
  expertId = "exp-vet-01"
): Record<string, ShelfRecord> {
  const all = readAllDoctorsShelfMap();
  return all[expertId] ?? {};
}

export function readMedicineBoxLogs(expertId?: string): MedicineBoxLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MEDICINE_BOX_LOGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const logs = (parsed as MedicineBoxLogEntry[]).sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt)
        );
        return expertId ? logs.filter((l) => l.expertId === expertId) : logs;
      }
    }
  } catch {
    // ignore
  }
  return [];
}

export function appendMedicineBoxLogs(entries: MedicineBoxLogEntry[]): void {
  if (typeof window === "undefined" || entries.length === 0) return;
  try {
    const existing = readMedicineBoxLogs();
    const next = [...entries, ...existing].slice(0, 300);
    window.localStorage.setItem(
      MEDICINE_BOX_LOGS_STORAGE_KEY,
      JSON.stringify(next)
    );
  } catch {
    // ignore
  }
}

export function readMedicineBoxRequests(): MedicineBoxRequest[] {
  if (typeof window === "undefined") {
    return SEED_MEDICINE_BOX_REQUESTS;
  }
  try {
    const raw = window.localStorage.getItem(MEDICINE_BOX_REQUESTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return (parsed as MedicineBoxRequest[]).sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt)
        );
      }
    }
  } catch {
    // ignore
  }
  try {
    window.localStorage.setItem(
      MEDICINE_BOX_REQUESTS_STORAGE_KEY,
      JSON.stringify(SEED_MEDICINE_BOX_REQUESTS)
    );
  } catch {
    // ignore
  }
  return SEED_MEDICINE_BOX_REQUESTS;
}

export function writeMedicineBoxRequests(requests: MedicineBoxRequest[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      MEDICINE_BOX_REQUESTS_STORAGE_KEY,
      JSON.stringify(requests)
    );
  } catch {
    // ignore
  }
}

