import { MEDICINE_CATALOG } from "@/data/medicineCatalog";
import { SHOP_PRODUCTS } from "@/data/shopData";
import { SEED_EXPERTS } from "@/data/expertPortalData";
import {
  SUPPLIER_SYNC_EVENT,
  ensureSupplierCatalogMetaForProduct,
} from "@/data/supplierPortalData";
import type { PurchaseOrder } from "@/data/managerOpsData";
import type { Product, ShopPetGroup } from "@/types/animora.type";
import type {
  ExpertNotification,
  MedicineBoxCategory,
  MedicineBoxItem,
  MedicineBoxLogAction,
  MedicineBoxLogEntry,
  MedicineBoxRequest,
  MedicineBoxRequestType,
  MedicineItem,
  PetSpeciesCode,
} from "@/types/expert.type";
import {
  EXPERT_SYNC_EVENT,
  readExpertStore,
  writeExpertStore,
} from "@/utils/clinicalSync";
import { readOrdersFromStorage } from "@/utils/orderSync";

export const MEDICINE_BOX_SHELF_STORAGE_KEY = "animora_medicine_box_shelf_v1";
export const MEDICINE_BOX_REQUESTS_STORAGE_KEY = "animora_medicine_box_requests_v1";
export const MEDICINE_BOX_LOGS_STORAGE_KEY = "animora_medicine_box_logs_v1";
export const SHOP_PRODUCTS_STORAGE_KEY = "animora_shop_products_v2";
export const MEDICINE_BOX_SYNC_EVENT = "animora_medicine_box_sync";

export interface ShelfRecord {
  shelfStock: number;
  minShelfThreshold: number;
  lastUpdatedAt: string;
}

/** Bản đồ kệ theo từng bác sĩ: expertId -> shopProductId -> ShelfRecord */
export type DoctorShelfStore = Record<string, Record<string, ShelfRecord>>;

export type StoredShopProduct = Product & {
  requiresPrescription?: boolean;
  isHidden?: boolean;
  costPrice?: number;
};

const DEFAULT_SHELF_QUANTITIES: Record<string, number> = {
  "med-001": 12,
  "med-002": 3, // Sắp hết trên kệ
  "med-003": 10,
  "med-004": 8,
  "med-005": 6,
  "med-006": 2, // Sắp hết trên kệ
  "med-007": 9,
  "med-008": 15,
  "med-009": 7,
  "med-010": 0, // Hết trên kệ
  "med-011": 11,
  "med-012": 14,
  "vac-001": 10,
  "vac-002": 4, // Sắp hết trên kệ
  "vac-003": 15,
  "vac-004": 0, // Hết trên kệ
};

export function getActiveVetDoctors(): { id: string; fullName: string }[] {
  return Object.values(SEED_EXPERTS)
    .filter((exp) => exp.expertType === "vet")
    .map((exp) => ({ id: exp.id, fullName: exp.fullName }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function createInitialShelfForDoctor(doctorIndex: number): Record<string, ShelfRecord> {
  const nowIso = new Date().toISOString();
  const map: Record<string, ShelfRecord> = {};
  for (const med of MEDICINE_CATALOG) {
    const base = DEFAULT_SHELF_QUANTITIES[med.id] ?? 8;
    const seededQty = base <= 0 ? 0 : Math.max(1, base - doctorIndex);
    map[med.shopProductId] = {
      shelfStock: seededQty,
      minShelfThreshold: 5,
      lastUpdatedAt: nowIso,
    };
  }
  return map;
}

function createInitialAllDoctorsShelfStore(): DoctorShelfStore {
  const doctors = getActiveVetDoctors();
  const store: DoctorShelfStore = {};
  doctors.forEach((doc, idx) => {
    store[doc.id] = createInitialShelfForDoctor(idx);
  });
  return store;
}

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
    quantity: 5,
    reason: "Trên kệ chỉ còn 3 lọ, cần bổ sung từ kho để phục vụ kê đơn giảm đau sau phẫu thuật.",
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
];

function mapShopGroupsToSpecies(groups?: ShopPetGroup[]): PetSpeciesCode[] {
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

export function isMedicineOrVaccineProduct(p: Pick<StoredShopProduct, "category">): boolean {
  const cat = String(p.category || "");
  return cat === "medicine" || cat === "vaccine";
}

export function resolveMedicineBoxCategory(
  p: Pick<StoredShopProduct, "category" | "medicineId" | "name" | "ingredientsVi">
): MedicineBoxCategory {
  if (String(p.category || "") === "vaccine") return "vaccine";
  if (p.medicineId && p.medicineId.startsWith("vac-")) return "vaccine";
  const text = `${p.name || ""} ${p.ingredientsVi || ""}`;
  if (/vắc[\s-]?xin|vaccine|rabisin|felocell|vanguard|nobivac|feligen/i.test(text)) {
    return "vaccine";
  }
  return "medicine";
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
        const sanitized: StoredShopProduct[] = parsed.map((p: StoredShopProduct) => {
          if (!isMedicineOrVaccineProduct(p) && p.requiresPrescription) {
            dirty = true;
            return { ...p, requiresPrescription: false };
          }
          return p;
        });

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

function writeWarehouseProducts(products: StoredShopProduct[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SHOP_PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch {
    // ignore
  }
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

  doctors.forEach((doc, idx) => {
    if (!store[doc.id] || typeof store[doc.id] !== "object") {
      store[doc.id] = createInitialShelfForDoctor(idx);
      updated = true;
      return;
    }
    for (const med of MEDICINE_CATALOG) {
      if (!(med.shopProductId in store[doc.id])) {
        const base = DEFAULT_SHELF_QUANTITIES[med.id] ?? 8;
        store[doc.id][med.shopProductId] = {
          shelfStock: base <= 0 ? 0 : Math.max(1, base - idx),
          minShelfThreshold: 5,
          lastUpdatedAt: nowIso,
        };
        updated = true;
      }
    }
  });

  return { store, updated };
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
        // Migrate từ format cũ (flat Record<shopProductId, ShelfRecord>) sang theo expertId
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

function writeAllDoctorsShelfMap(store: DoctorShelfStore): void {
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

export function readShelfMap(expertId = "exp-vet-01"): Record<string, ShelfRecord> {
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

function appendMedicineBoxLogs(entries: MedicineBoxLogEntry[]): void {
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

/**
 * Tự động đọc và hợp nhất danh sách Thuốc & Vắc-xin từ Kho (animora_shop_products_v2)
 * với số lượng đang có trên kệ cá nhân của bác sĩ (expertId).
 * Tuyệt đối loại bỏ các sản phẩm không phải Thuốc/Vắc-xin (đồ ăn, sữa tắm, đồ chơi, phụ kiện).
 */
export function readMedicineBoxItems(
  expertId = "exp-vet-01",
  options?: { includeHidden?: boolean }
): MedicineBoxItem[] {
  const warehouseProducts = readWarehouseProducts();
  const shelfMap = readShelfMap(expertId);
  const catalogByShopId = new Map(
    MEDICINE_CATALOG.map((m) => [m.shopProductId, m])
  );

  const items: MedicineBoxItem[] = [];

  for (const prod of warehouseProducts) {
    if (!isMedicineOrVaccineProduct(prod)) continue;

    const meta = catalogByShopId.get(prod.id);
    const shelfRec = shelfMap[prod.id];
    const shelfStock = shelfRec?.shelfStock ?? 0;

    // Ẩn thuốc ngừng kinh doanh nếu trên kệ bác sĩ không còn tồn (trừ khi includeHidden = true)
    if (prod.isHidden && shelfStock <= 0 && !options?.includeHidden) {
      continue;
    }

    const isNewInWarehouse = shelfRec === undefined;
    const itemType = resolveMedicineBoxCategory(prod);

    items.push({
      id: prod.medicineId || meta?.id || prod.id,
      shopProductId: prod.id,
      itemType,
      name: prod.name,
      activeIngredient:
        meta?.activeIngredient ?? prod.ingredientsVi ?? prod.name,
      form: meta?.form ?? prod.spec ?? (itemType === "vaccine" ? "Vắc-xin" : "Dược phẩm"),
      unit: meta?.unit ?? (itemType === "vaccine" ? "liều" : "đơn vị"),
      speciesHint: meta?.speciesHint ?? mapShopGroupsToSpecies(prod.petTypes),
      shelfStock,
      warehouseStock: prod.stock ?? 0,
      minShelfThreshold: shelfRec?.minShelfThreshold ?? 5,
      isNewInWarehouse,
      isHidden: Boolean(prod.isHidden),
      lastUpdatedAt: shelfRec?.lastUpdatedAt ?? new Date().toISOString(),
    });
  }

  return items;
}

/**
 * Danh sách dược phẩm kê đơn đồng bộ trực tiếp với Kho Shop & Kệ bác sĩ (loại bỏ sản phẩm đã ngừng kinh doanh).
 */
export function readLivePrescriptionCatalog(expertId = "exp-vet-01"): MedicineItem[] {
  const warehouseProducts = readWarehouseProducts();
  const shelfMap = readShelfMap(expertId);
  const catalogByShopId = new Map(
    MEDICINE_CATALOG.map((m) => [m.shopProductId, m])
  );

  const list: MedicineItem[] = [];
  for (const prod of warehouseProducts) {
    if (prod.isHidden) continue;
    if (!prod.requiresPrescription && !isMedicineOrVaccineProduct(prod)) continue;

    const meta = catalogByShopId.get(prod.id);
    const shelfStock = shelfMap[prod.id]?.shelfStock ?? 0;
    const warehouseStock = prod.stock ?? 0;

    list.push({
      id: prod.medicineId || meta?.id || prod.id,
      shopProductId: prod.id,
      name: prod.name,
      activeIngredient:
        meta?.activeIngredient ?? prod.ingredientsVi ?? prod.name,
      form: meta?.form ?? prod.spec ?? "Dược phẩm",
      unit: meta?.unit ?? "đơn vị",
      price: prod.price,
      stock: warehouseStock + shelfStock,
      requiresPrescription: true,
      speciesHint: meta?.speciesHint ?? mapShopGroupsToSpecies(prod.petTypes),
    });
  }

  return list.length > 0 ? list : MEDICINE_CATALOG;
}

export interface DoctorShelfOverviewRow {
  shopProductId: string;
  medicineName: string;
  unit: string;
  warehouseStock: number;
  isHidden: boolean;
  totalAllocatedOnShelves: number;
  byDoctor: { expertId: string; expertName: string; shelfStock: number }[];
}

export function readAllDoctorsShelfOverview(): DoctorShelfOverviewRow[] {
  const warehouseProducts = readWarehouseProducts().filter(isMedicineOrVaccineProduct);
  const allShelves = readAllDoctorsShelfMap();
  const doctors = getActiveVetDoctors();
  const catalogByShopId = new Map(MEDICINE_CATALOG.map((m) => [m.shopProductId, m]));

  return warehouseProducts.map((prod) => {
    const meta = catalogByShopId.get(prod.id);
    const itemType = resolveMedicineBoxCategory(prod);
    const unit = meta?.unit ?? (itemType === "vaccine" ? "liều" : "đơn vị");
    const byDoctor = doctors.map((doc) => ({
      expertId: doc.id,
      expertName: doc.fullName,
      shelfStock: allShelves[doc.id]?.[prod.id]?.shelfStock ?? 0,
    }));
    const totalAllocatedOnShelves = byDoctor.reduce((s, d) => s + d.shelfStock, 0);
    return {
      shopProductId: prod.id,
      medicineName: prod.name,
      unit,
      warehouseStock: prod.stock ?? 0,
      isHidden: Boolean(prod.isHidden),
      totalAllocatedOnShelves,
      byDoctor,
    };
  });
}

/**
 * Thuật toán chia đều số lượng nhập kho cho tất cả bác sĩ theo thứ tự ổn định.
 * Ví dụ: 100 viên chia 3 BS -> [34, 33, 33]. Tổng phân bổ === totalQty.
 */
export function computeEvenDoctorAllocations(
  totalQty: number,
  doctorIds: string[]
): { expertId: string; quantity: number }[] {
  if (!Number.isInteger(totalQty) || totalQty <= 0 || doctorIds.length === 0) {
    return [];
  }
  const n = doctorIds.length;
  const base = Math.floor(totalQty / n);
  const remainder = totalQty % n;
  return doctorIds.map((expertId, idx) => ({
    expertId,
    quantity: base + (idx < remainder ? 1 : 0),
  }));
}

export function allocateMedicineImportToDoctors(params: {
  shopProductId: string;
  medicineName: string;
  unit?: string;
  receivedQty: number;
  poCode?: string;
  actorLabel?: string;
  doctorIds?: string[];
}): {
  ok: boolean;
  error?: string;
  totalAllocated: number;
  allocations: { expertId: string; expertName: string; quantity: number }[];
} {
  const {
    shopProductId,
    medicineName,
    unit = "đơn vị",
    receivedQty,
    poCode,
    actorLabel = "Đã xử lý bởi Quản lý",
  } = params;

  if (!Number.isInteger(receivedQty) || receivedQty <= 0) {
    return {
      ok: false,
      error: "Số lượng phân bổ phải là số nguyên dương.",
      totalAllocated: 0,
      allocations: [],
    };
  }

  const activeDoctors = getActiveVetDoctors();
  const targetDoctorIds =
    params.doctorIds && params.doctorIds.length > 0
      ? params.doctorIds
      : activeDoctors.map((d) => d.id);

  const split = computeEvenDoctorAllocations(receivedQty, targetDoctorIds);
  const sumAllocated = split.reduce((s, item) => s + item.quantity, 0);
  if (sumAllocated !== receivedQty) {
    return {
      ok: false,
      error: "Lỗi kiểm tra nhất quán: tổng lượng phân bổ không khớp số lượng thực nhận.",
      totalAllocated: 0,
      allocations: [],
    };
  }

  const allShelves = readAllDoctorsShelfMap();
  const nowIso = new Date().toISOString();
  const doctorNameMap = new Map(activeDoctors.map((d) => [d.id, d.fullName]));

  // Clone nguyên tử trước khi ghi
  const nextShelves: DoctorShelfStore = { ...allShelves };
  const logsToAppend: MedicineBoxLogEntry[] = [];
  const summary: { expertId: string; expertName: string; quantity: number }[] = [];

  for (const part of split) {
    const prevMap = nextShelves[part.expertId] ?? {};
    const prevRec = prevMap[shopProductId];
    const beforeShelf = prevRec?.shelfStock ?? 0;
    const afterShelf = beforeShelf + part.quantity;
    const doctorName = doctorNameMap.get(part.expertId) ?? part.expertId;

    nextShelves[part.expertId] = {
      ...prevMap,
      [shopProductId]: {
        shelfStock: afterShelf,
        minShelfThreshold: prevRec?.minShelfThreshold ?? 5,
        lastUpdatedAt: nowIso,
      },
    };

    summary.push({
      expertId: part.expertId,
      expertName: doctorName,
      quantity: part.quantity,
    });

    if (part.quantity > 0) {
      logsToAppend.push({
        id: `mblog-${Date.now()}-${part.expertId}-${Math.random().toString(36).slice(2, 6)}`,
        expertId: part.expertId,
        expertName: doctorName,
        shopProductId,
        medicineName,
        unit,
        action: "po_allocation",
        quantityDelta: part.quantity,
        beforeShelfStock: beforeShelf,
        afterShelfStock: afterShelf,
        actorLabel,
        referenceCode: poCode,
        note: poCode
          ? `Tự động phân bổ từ đơn nhập kho ${poCode} (tổng thực nhận ${receivedQty} ${unit})`
          : `Tự động phân bổ nhập kho (${receivedQty} ${unit})`,
        createdAt: nowIso,
      });
    }
  }

  writeAllDoctorsShelfMap(nextShelves);
  appendMedicineBoxLogs(logsToAppend);
  emitMedicineBoxSync(true);

  return {
    ok: true,
    totalAllocated: sumAllocated,
    allocations: summary,
  };
}

export function recordDoctorMedicineUsage(params: {
  expertId: string;
  expertName: string;
  shopProductId: string;
  quantity: number;
  note?: string;
  referenceCode?: string;
}): { ok: boolean; error?: string; afterShelfStock?: number } {
  const { expertId, expertName, shopProductId, quantity, note, referenceCode } = params;

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { ok: false, error: "Số lượng sử dụng phải là số nguyên lớn hơn 0." };
  }

  const items = readMedicineBoxItems(expertId, { includeHidden: true });
  const matched = items.find((it) => it.shopProductId === shopProductId);
  if (!matched) {
    return { ok: false, error: "Không tìm thấy thuốc này trong Hộp thuốc của bạn." };
  }

  const allShelves = readAllDoctorsShelfMap();
  const docShelf = allShelves[expertId] ?? {};
  const beforeShelf = docShelf[shopProductId]?.shelfStock ?? 0;

  if (quantity > beforeShelf) {
    return {
      ok: false,
      error: `Số lượng sử dụng (${quantity} ${matched.unit}) vượt quá tồn trên kệ cá nhân (${beforeShelf} ${matched.unit}).`,
    };
  }

  const afterShelf = beforeShelf - quantity;
  const nowIso = new Date().toISOString();

  const nextAllShelves: DoctorShelfStore = {
    ...allShelves,
    [expertId]: {
      ...docShelf,
      [shopProductId]: {
        shelfStock: afterShelf,
        minShelfThreshold: docShelf[shopProductId]?.minShelfThreshold ?? 5,
        lastUpdatedAt: nowIso,
      },
    },
  };

  writeAllDoctorsShelfMap(nextAllShelves);
  appendMedicineBoxLogs([
    {
      id: `mblog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      expertId,
      expertName,
      shopProductId,
      medicineName: matched.name,
      unit: matched.unit,
      action: "usage",
      quantityDelta: -quantity,
      beforeShelfStock: beforeShelf,
      afterShelfStock: afterShelf,
      actorLabel: expertName,
      referenceCode: referenceCode?.trim() || undefined,
      note: note?.trim() || "Ghi nhận sử dụng thuốc trực tiếp tại phòng khám",
      createdAt: nowIso,
    },
  ]);

  emitMedicineBoxSync();
  return { ok: true, afterShelfStock: afterShelf };
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

function writeMedicineBoxRequests(requests: MedicineBoxRequest[]): void {
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

export interface SubmitMedicineBoxRequestInput {
  expertId: string;
  expertName: string;
  type: MedicineBoxRequestType;
  itemType?: MedicineBoxCategory;
  medicineId?: string;
  shopProductId?: string;
  medicineName: string;
  activeIngredient?: string;
  unit: string;
  quantity: number;
  isNewMedicineProposal?: boolean;
  removeAll?: boolean;
  returnToWarehouse?: boolean;
  discontinueAction?: "hide" | "delete";
  reason: string;
}

export function validateMedicineBoxRequest(
  input: SubmitMedicineBoxRequestInput,
  items: MedicineBoxItem[],
  existingRequests: MedicineBoxRequest[]
): { valid: boolean; error?: string } {
  if (!input.medicineName.trim()) {
    return { valid: false, error: "Vui lòng chọn hoặc nhập tên thuốc." };
  }
  if (!input.reason.trim()) {
    return { valid: false, error: "Vui lòng nhập lý do gửi Quản lý duyệt." };
  }

  const matchedItem = items.find(
    (it) =>
      (input.shopProductId && it.shopProductId === input.shopProductId) ||
      (input.medicineId && it.id === input.medicineId)
  );

  if (input.type === "discontinue") {
    if (!matchedItem) {
      return { valid: false, error: "Không tìm thấy thuốc này trong danh mục Shop." };
    }
    if (matchedItem.isHidden) {
      return { valid: false, error: "Sản phẩm này đã ở trạng thái ngừng kinh doanh." };
    }
    const alreadyPendingDiscontinue = existingRequests.some(
      (r) =>
        r.status === "pending" &&
        r.type === "discontinue" &&
        ((input.shopProductId && r.shopProductId === input.shopProductId) ||
          (input.medicineId && r.medicineId === input.medicineId))
    );
    if (alreadyPendingDiscontinue) {
      return {
        valid: false,
        error: "Đã có yêu cầu ngừng kinh doanh / xóa khỏi Shop đang chờ Quản lý duyệt cho thuốc này.",
      };
    }
    return { valid: true };
  }

  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    return { valid: false, error: "Số lượng yêu cầu phải là số nguyên lớn hơn 0." };
  }

  if (input.type === "add" && !input.isNewMedicineProposal) {
    if (!matchedItem) {
      return { valid: false, error: "Không tìm thấy thuốc này trong kho." };
    }
    if (matchedItem.isHidden) {
      return {
        valid: false,
        error: "Thuốc này đã ngừng kinh doanh tại Shop, không thể xin bổ sung thêm.",
      };
    }
    // Tính tổng các yêu cầu thêm đang chờ của TẤT CẢ bác sĩ vì cùng trừ từ kho chung
    const pendingAddQty = existingRequests
      .filter(
        (r) =>
          r.status === "pending" &&
          r.type === "add" &&
          !r.isNewMedicineProposal &&
          ((input.shopProductId && r.shopProductId === input.shopProductId) ||
            (input.medicineId && r.medicineId === input.medicineId))
      )
      .reduce((sum, r) => sum + r.quantity, 0);

    if (input.quantity + pendingAddQty > matchedItem.warehouseStock) {
      return {
        valid: false,
        error: `Số lượng yêu cầu (${input.quantity}) + đang chờ duyệt (${pendingAddQty}) vượt quá tồn kho hiện có (${matchedItem.warehouseStock} ${matchedItem.unit}).`,
      };
    }
  }

  if (input.type === "remove") {
    if (!matchedItem) {
      return { valid: false, error: "Không tìm thấy thuốc này trên kệ của bạn." };
    }
    const ownPendingRemove = existingRequests.filter(
      (r) =>
        r.status === "pending" &&
        r.type === "remove" &&
        r.expertId === input.expertId &&
        ((input.shopProductId && r.shopProductId === input.shopProductId) ||
          (input.medicineId && r.medicineId === input.medicineId))
    );
    if (input.removeAll && ownPendingRemove.some((r) => r.removeAll)) {
      return {
        valid: false,
        error: "Bạn đã có một yêu cầu xóa toàn bộ thuốc này đang chờ duyệt.",
      };
    }

    const pendingRemoveQty = ownPendingRemove.reduce((sum, r) => sum + r.quantity, 0);

    if (input.quantity + pendingRemoveQty > matchedItem.shelfStock) {
      return {
        valid: false,
        error: `Số lượng xóa (${input.quantity}) + đang chờ duyệt (${pendingRemoveQty}) vượt quá số lượng đang có trên kệ của bạn (${matchedItem.shelfStock} ${matchedItem.unit}).`,
      };
    }
  }

  return { valid: true };
}

export function submitMedicineBoxRequest(
  input: SubmitMedicineBoxRequestInput
): { ok: boolean; error?: string; request?: MedicineBoxRequest } {
  const items = readMedicineBoxItems(input.expertId, { includeHidden: true });
  const existing = readMedicineBoxRequests();
  const validation = validateMedicineBoxRequest(input, items, existing);
  if (!validation.valid) {
    return { ok: false, error: validation.error };
  }

  const normalizedQuantity =
    input.type === "discontinue" ? 0 : Math.trunc(input.quantity);

  const newReq: MedicineBoxRequest = {
    id: `mbr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    expertId: input.expertId,
    expertName: input.expertName,
    type: input.type,
    itemType: input.itemType,
    medicineId: input.medicineId,
    shopProductId: input.shopProductId,
    medicineName: input.medicineName.trim(),
    activeIngredient: input.activeIngredient?.trim(),
    unit: input.unit.trim() || "đơn vị",
    quantity: normalizedQuantity,
    isNewMedicineProposal: input.isNewMedicineProposal,
    removeAll: input.removeAll,
    returnToWarehouse: input.returnToWarehouse,
    discontinueAction:
      input.type === "discontinue" ? input.discontinueAction ?? "hide" : undefined,
    reason: input.reason.trim(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  writeMedicineBoxRequests([newReq, ...existing]);
  emitMedicineBoxSync();
  return { ok: true, request: newReq };
}

export function cancelMedicineBoxRequest(reqId: string, expertId?: string): boolean {
  const existing = readMedicineBoxRequests();
  const target = existing.find((r) => r.id === reqId);
  if (!target || target.status !== "pending") return false;
  if (expertId && target.expertId !== expertId) return false;

  const next = existing.filter((r) => r.id !== reqId);
  writeMedicineBoxRequests(next);
  emitMedicineBoxSync();
  return true;
}

export interface ProductConstraintReport {
  canHardDelete: boolean;
  canDiscontinue: boolean;
  warehouseStock: number;
  totalShelfStockAcrossDoctors: number;
  pendingMedBoxRequestsCount: number;
  activePrescriptionsCount: number;
  totalPrescriptionsCount: number;
  activeOrdersCount: number;
  activePurchaseOrdersCount: number;
  reasons: string[];
}

export function checkProductDeletionConstraints(
  productId: string
): ProductConstraintReport {
  const warehouse = readWarehouseProducts();
  const prod = warehouse.find((p) => p.id === productId);
  const warehouseStock = prod?.stock ?? 0;

  const allShelves = readAllDoctorsShelfMap();
  let totalShelfStockAcrossDoctors = 0;
  for (const docShelf of Object.values(allShelves)) {
    totalShelfStockAcrossDoctors += docShelf?.[productId]?.shelfStock ?? 0;
  }

  const requests = readMedicineBoxRequests();
  const pendingMedBoxRequestsCount = requests.filter(
    (r) =>
      r.status === "pending" &&
      (r.shopProductId === productId ||
        (prod?.medicineId && r.medicineId === prod.medicineId))
  ).length;

  let activePrescriptionsCount = 0;
  let totalPrescriptionsCount = 0;
  const targetMedId = prod?.medicineId;
  if (targetMedId) {
    for (const doc of getActiveVetDoctors()) {
      const store = readExpertStore(doc.id);
      for (const rx of store.prescriptions) {
        if (rx.lines.some((l) => l.medicineId === targetMedId)) {
          totalPrescriptionsCount += 1;
          if (rx.severity !== "severe" && rx.refillsUsed < rx.refillsAllowed) {
            activePrescriptionsCount += 1;
          }
        }
      }
    }
  }

  let activeOrdersCount = 0;
  if (typeof window !== "undefined") {
    try {
      const orders = readOrdersFromStorage();
      const prodNameNorm = (prod?.name || "").trim().toLowerCase();
      activeOrdersCount = orders.filter((ord) => {
        if (ord.status !== "pending" && ord.status !== "packing" && ord.status !== "shipping") {
          return false;
        }
        return ord.items.some(
          (item) =>
            item.productId === productId ||
            (prodNameNorm && item.productName.trim().toLowerCase() === prodNameNorm)
        );
      }).length;
    } catch {
      // ignore
    }
  }

  let activePurchaseOrdersCount = 0;
  if (typeof window !== "undefined") {
    try {
      const rawPo = window.localStorage.getItem("animora_manager_purchase_orders_v1");
      if (rawPo) {
        const pos = JSON.parse(rawPo) as PurchaseOrder[];
        if (Array.isArray(pos)) {
          activePurchaseOrdersCount = pos.filter(
            (po) =>
              po.status !== "received" &&
              po.status !== "received_partial" &&
              po.status !== "supplier_rejected" &&
              po.lines.some((l) => l.productId === productId)
          ).length;
        }
      }
    } catch {
      // ignore
    }
  }

  const reasons: string[] = [];
  if (warehouseStock > 0) {
    reasons.push(`Kho chung còn ${warehouseStock} đơn vị`);
  }
  if (totalShelfStockAcrossDoctors > 0) {
    reasons.push(`Hộp thuốc các Bác sĩ còn ${totalShelfStockAcrossDoctors} đơn vị`);
  }
  if (pendingMedBoxRequestsCount > 0) {
    reasons.push(`Có ${pendingMedBoxRequestsCount} yêu cầu Hộp thuốc đang chờ duyệt`);
  }
  if (totalPrescriptionsCount > 0) {
    reasons.push(
      `Đang được tham chiếu trong ${totalPrescriptionsCount} đơn thuốc (${activePrescriptionsCount} đơn còn lượt mua lại)`
    );
  }
  if (activeOrdersCount > 0) {
    reasons.push(`Có ${activeOrdersCount} đơn hàng khách đang xử lý/giao`);
  }
  if (activePurchaseOrdersCount > 0) {
    reasons.push(`Có ${activePurchaseOrdersCount} đơn nhập hàng PO đang mở`);
  }

  const hasReferences = reasons.length > 0;
  return {
    canHardDelete: !hasReferences,
    canDiscontinue: true,
    warehouseStock,
    totalShelfStockAcrossDoctors,
    pendingMedBoxRequestsCount,
    activePrescriptionsCount,
    totalPrescriptionsCount,
    activeOrdersCount,
    activePurchaseOrdersCount,
    reasons,
  };
}

export function reviewMedicineBoxRequest(
  reqId: string,
  decision: "approved" | "rejected",
  adminNote?: string
): {
  ok: boolean;
  error?: string;
  request?: MedicineBoxRequest;
  createdProductId?: string;
} {
  const existing = readMedicineBoxRequests();
  const target = existing.find((r) => r.id === reqId);
  if (!target) {
    return { ok: false, error: "Không tìm thấy yêu cầu này." };
  }
  if (target.status !== "pending") {
    return { ok: false, error: "Yêu cầu này đã được xử lý trước đó." };
  }

  const nowIso = new Date().toISOString();
  let createdProductId: string | undefined;
  let finalNote =
    adminNote?.trim() ||
    (decision === "approved"
      ? "Quản lý đã phê duyệt và cập nhật tồn kho."
      : "Quản lý từ chối yêu cầu.");

  if (decision === "approved") {
    const warehouse = readWarehouseProducts();
    const allShelves = readAllDoctorsShelfMap();
    const targetDocShelf = allShelves[target.expertId] ?? {};

    if (target.type === "add") {
      if (target.isNewMedicineProposal) {
        const prefix = target.itemType === "vaccine" ? "vac" : "med";
        const stamp = Date.now();
        const newProdId = `prod-${prefix}-${stamp}`;
        const newMedId = `${prefix}-${String(stamp).slice(-4)}`;
        const newProd: StoredShopProduct = {
          id: newProdId,
          medicineId: newMedId,
          name: target.medicineName,
          description: target.reason || `Thuốc đề xuất bởi ${target.expertName}`,
          category: "medicine",
          petTypes: ["dog", "cat"],
          price: 150000,
          stock: 0, // Chờ đặt PO & nhập hàng từ NCC
          rating: 5,
          reviewCount: 0,
          image: "/assets/products/gallery-nutrition-detail.jpg",
          images: ["/assets/products/gallery-nutrition-detail.jpg"],
          spec: target.unit,
          ingredientsVi: target.activeIngredient || target.medicineName,
          requiresPrescription: true,
          isHidden: false,
          costPrice: 95000,
        };
        writeWarehouseProducts([newProd, ...warehouse]);

        // Khởi tạo kệ = 0 cho tất cả bác sĩ
        const nextShelves: DoctorShelfStore = { ...allShelves };
        for (const doc of getActiveVetDoctors()) {
          nextShelves[doc.id] = {
            ...(nextShelves[doc.id] ?? {}),
            [newProdId]: {
              shelfStock: 0,
              minShelfThreshold: 5,
              lastUpdatedAt: nowIso,
            },
          };
        }
        writeAllDoctorsShelfMap(nextShelves);
        ensureSupplierCatalogMetaForProduct(newProdId, "medicine");

        createdProductId = newProdId;
        if (!adminNote?.trim()) {
          finalNote = `Đã duyệt tạo SKU mới (${newProdId}) ở trạng thái chờ nhập PO từ NCC Dược (${target.quantity} ${target.unit}).`;
        }
      } else {
        const prodIdx = warehouse.findIndex(
          (p) =>
            (target.shopProductId && p.id === target.shopProductId) ||
            (target.medicineId && p.medicineId === target.medicineId)
        );
        if (prodIdx < 0) {
          return { ok: false, error: "Không tìm thấy thuốc này trong kho." };
        }
        if (warehouse[prodIdx].isHidden) {
          return { ok: false, error: "Sản phẩm đã ngừng kinh doanh, không thể bổ sung lên kệ." };
        }
        const currentWarehouse = warehouse[prodIdx].stock ?? 0;
        if (currentWarehouse < target.quantity) {
          return {
            ok: false,
            error: `Kho không đủ số lượng (chỉ còn ${currentWarehouse} ${target.unit}).`,
          };
        }

        const updatedWarehouse = warehouse.map((p, idx) =>
          idx === prodIdx ? { ...p, stock: currentWarehouse - target.quantity } : p
        );
        writeWarehouseProducts(updatedWarehouse);

        const prodId = warehouse[prodIdx].id;
        const prevShelf = targetDocShelf[prodId]?.shelfStock ?? 0;
        const nextShelf = prevShelf + target.quantity;
        const nextShelves: DoctorShelfStore = {
          ...allShelves,
          [target.expertId]: {
            ...targetDocShelf,
            [prodId]: {
              shelfStock: nextShelf,
              minShelfThreshold: targetDocShelf[prodId]?.minShelfThreshold ?? 5,
              lastUpdatedAt: nowIso,
            },
          },
        };
        writeAllDoctorsShelfMap(nextShelves);

        appendMedicineBoxLogs([
          {
            id: `mblog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            expertId: target.expertId,
            expertName: target.expertName,
            shopProductId: prodId,
            medicineName: target.medicineName,
            unit: target.unit,
            action: "request_add",
            quantityDelta: target.quantity,
            beforeShelfStock: prevShelf,
            afterShelfStock: nextShelf,
            actorLabel: "Đã xử lý bởi Quản lý",
            referenceCode: target.id,
            note: `QL duyệt bổ sung từ kho chung (${target.reason})`,
            createdAt: nowIso,
          },
        ]);
      }
    } else if (target.type === "remove") {
      const prodIdx = warehouse.findIndex(
        (p) =>
          (target.shopProductId && p.id === target.shopProductId) ||
          (target.medicineId && p.medicineId === target.medicineId)
      );
      const prodId = target.shopProductId || (prodIdx >= 0 ? warehouse[prodIdx].id : "");
      if (!prodId) {
        return { ok: false, error: "Không xác định được mã thuốc trên kệ." };
      }
      const prevShelf = targetDocShelf[prodId]?.shelfStock ?? 0;
      if (prevShelf < target.quantity) {
        return {
          ok: false,
          error: `Số lượng trên kệ của ${target.expertName} không đủ để xóa (chỉ còn ${prevShelf} ${target.unit}).`,
        };
      }

      const nextShelfStock = target.removeAll
        ? 0
        : Math.max(0, prevShelf - target.quantity);
      const actualRemoved = prevShelf - nextShelfStock;

      const nextShelves: DoctorShelfStore = {
        ...allShelves,
        [target.expertId]: {
          ...targetDocShelf,
          [prodId]: {
            shelfStock: nextShelfStock,
            minShelfThreshold: targetDocShelf[prodId]?.minShelfThreshold ?? 5,
            lastUpdatedAt: nowIso,
          },
        },
      };
      writeAllDoctorsShelfMap(nextShelves);

      if (target.returnToWarehouse && prodIdx >= 0 && actualRemoved > 0) {
        const updatedWarehouse = warehouse.map((p, idx) =>
          idx === prodIdx
            ? { ...p, stock: (p.stock ?? 0) + actualRemoved }
            : p
        );
        writeWarehouseProducts(updatedWarehouse);
      }

      const action: MedicineBoxLogAction = target.returnToWarehouse
        ? "remove_return"
        : "remove_dispose";

      appendMedicineBoxLogs([
        {
          id: `mblog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          expertId: target.expertId,
          expertName: target.expertName,
          shopProductId: prodId,
          medicineName: target.medicineName,
          unit: target.unit,
          action,
          quantityDelta: -actualRemoved,
          beforeShelfStock: prevShelf,
          afterShelfStock: nextShelfStock,
          actorLabel: "Đã xử lý bởi Quản lý",
          referenceCode: target.id,
          note: target.returnToWarehouse
            ? `QL duyệt hoàn trả ${actualRemoved} ${target.unit} về kho chung`
            : `QL duyệt xuất hủy / hết hạn ${actualRemoved} ${target.unit}`,
          createdAt: nowIso,
        },
      ]);
    } else if (target.type === "discontinue") {
      const prodIdx = warehouse.findIndex(
        (p) =>
          (target.shopProductId && p.id === target.shopProductId) ||
          (target.medicineId && p.medicineId === target.medicineId)
      );
      if (prodIdx < 0) {
        return { ok: false, error: "Không tìm thấy sản phẩm này trong danh mục Shop." };
      }
      const targetProd = warehouse[prodIdx];
      const report = checkProductDeletionConstraints(targetProd.id);

      // Nếu có đơn hàng đang giao hoặc PO đang mở, chặn ngừng kinh doanh cứng? Vẫn cho ngừng bán mới (isHidden=true) nếu không xóa vật lý,
      // nhưng nếu muốn xóa vật lý (delete) mà còn tham chiếu thì chuyển sang ngừng kinh doanh (isHidden = true).
      const updatedWarehouse = warehouse.map((p, idx) =>
        idx === prodIdx ? { ...p, isHidden: true } : p
      );
      writeWarehouseProducts(updatedWarehouse);

      const prevShelf = targetDocShelf[targetProd.id]?.shelfStock ?? 0;
      appendMedicineBoxLogs([
        {
          id: `mblog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          expertId: target.expertId,
          expertName: target.expertName,
          shopProductId: targetProd.id,
          medicineName: target.medicineName,
          unit: target.unit,
          action: "discontinue",
          quantityDelta: 0,
          beforeShelfStock: prevShelf,
          afterShelfStock: prevShelf,
          actorLabel: "Đã xử lý bởi Quản lý",
          referenceCode: target.id,
          note:
            report.reasons.length > 0
              ? `Ngừng kinh doanh (ẩn khỏi Shop, giữ lịch sử do: ${report.reasons.join("; ")})`
              : "Ngừng kinh doanh khỏi danh mục Shop",
          createdAt: nowIso,
        },
      ]);

      if (!adminNote?.trim()) {
        finalNote =
          report.reasons.length > 0
            ? `Đã chuyển thuốc sang Ngừng kinh doanh (giữ dữ liệu lịch sử do: ${report.reasons.join("; ")}).`
            : "Quản lý đã phê duyệt ngừng kinh doanh thuốc khỏi danh mục Shop.";
      }
    }
  }

  const updatedTarget: MedicineBoxRequest = {
    ...target,
    status: decision,
    shopProductId: target.shopProductId || createdProductId,
    reviewedAt: nowIso,
    adminNote: finalNote,
  };
  const updatedList = existing.map((r) => (r.id === reqId ? updatedTarget : r));
  writeMedicineBoxRequests(updatedList);

  // Gửi thông báo cho đúng bác sĩ đã gửi yêu cầu
  try {
    const store = readExpertStore(target.expertId);
    const actionLabelVi =
      target.type === "add"
        ? "thêm"
        : target.type === "remove"
        ? "xóa khỏi kệ"
        : "ngừng kinh doanh";
    const notif: ExpertNotification = {
      id: `notif-mb-${Date.now()}`,
      expertId: target.expertId,
      type: "medicine_box_result",
      title: {
        vi:
          decision === "approved"
            ? `Đã duyệt yêu cầu ${actionLabelVi} thuốc`
            : `Từ chối yêu cầu ${actionLabelVi} thuốc`,
        en:
          decision === "approved"
            ? "Medicine box request approved"
            : "Medicine box request rejected",
      },
      body: {
        vi:
          target.type === "discontinue"
            ? `${target.medicineName}: ${finalNote}`
            : `${target.medicineName} (${target.quantity} ${target.unit}): ${finalNote}`,
        en: `${target.medicineName}: ${finalNote}`,
      },
      at: "Vừa xong",
      unread: true,
      href: "/expert/medicine-box",
    };
    writeExpertStore(target.expertId, {
      ...store,
      notifications: [notif, ...store.notifications],
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(EXPERT_SYNC_EVENT));
    }
  } catch {
    // ignore notification errors
  }

  emitMedicineBoxSync(true);
  return { ok: true, request: updatedTarget, createdProductId };
}
