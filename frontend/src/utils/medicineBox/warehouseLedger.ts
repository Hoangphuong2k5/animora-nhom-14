import { MEDICINE_CATALOG } from "@/data/medicineCatalog";
import type { MedicineBoxItem, MedicineItem } from "@/types/expert.type";
import {
  appendMedicineBoxLogs,
  emitMedicineBoxSync,
  getActiveVetDoctors,
  isMedicineOrVaccineProduct,
  mapShopGroupsToSpecies,
  readMedicineBoxLogs,
  readShelfMap,
  readWarehouseProducts,
  resolveMedicineBoxCategory,
  writeWarehouseProducts,
} from "./storage";

/**
 * Đọc danh sách Thuốc & Vắc-xin từ Kho thuốc chung (animora_shop_products_v2) theo Animora v1.4 (Mục 8).
 * Loại bỏ các sản phẩm không phải Thuốc/Vắc-xin (đồ ăn, sữa tắm, đồ chơi, phụ kiện).
 */
export function readMedicineBoxItems(
  expertId = "exp-vet-01",
  options?: { includeHidden?: boolean }
): MedicineBoxItem[] {
  const warehouseProducts = readWarehouseProducts();
  const shelfMap = readShelfMap(expertId);
  const doctorLogs = readMedicineBoxLogs(expertId);
  const usedByDoctorMap = new Map<string, number>();

  for (const log of doctorLogs) {
    if (log.action === "usage") {
      const prev = usedByDoctorMap.get(log.shopProductId) ?? 0;
      usedByDoctorMap.set(log.shopProductId, prev + Math.abs(log.quantityDelta));
    }
  }

  const catalogByShopId = new Map(
    MEDICINE_CATALOG.map((m) => [m.shopProductId, m])
  );

  const items: MedicineBoxItem[] = [];

  for (const prod of warehouseProducts) {
    if (!isMedicineOrVaccineProduct(prod)) continue;

    const meta = catalogByShopId.get(prod.id);
    const shelfRec = shelfMap[prod.id];
    const warehouseStock = prod.stock ?? 0;
    const usedByDoctorCount = usedByDoctorMap.get(prod.id) ?? 0;

    if (prod.isHidden && warehouseStock <= 0 && !options?.includeHidden) {
      continue;
    }

    const itemType = resolveMedicineBoxCategory(prod);

    items.push({
      id: prod.medicineId || meta?.id || prod.id,
      shopProductId: prod.id,
      itemType,
      name: prod.name,
      activeIngredient:
        meta?.activeIngredient ?? prod.ingredientsVi ?? prod.name,
      form:
        meta?.form ??
        prod.spec ??
        (itemType === "vaccine" ? "Vắc-xin" : "Dược phẩm"),
      unit: meta?.unit ?? (itemType === "vaccine" ? "liều" : "đơn vị"),
      speciesHint: meta?.speciesHint ?? mapShopGroupsToSpecies(prod.petTypes),
      // v1.4 Mục 8: Hộp thuốc riêng đã gộp vào Kho thuốc chung -> tồn khả dụng đọc trực tiếp từ kho chung
      shelfStock: warehouseStock,
      warehouseStock,
      usedByDoctorCount,
      minShelfThreshold: shelfRec?.minShelfThreshold ?? 5,
      isNewInWarehouse: shelfRec === undefined,
      isHidden: Boolean(prod.isHidden),
      lastUpdatedAt: shelfRec?.lastUpdatedAt ?? new Date().toISOString(),
    });
  }

  return items;
}

/**
 * Danh sách dược phẩm kê đơn đồng bộ trực tiếp với Kho thuốc chung (loại bỏ sản phẩm ngừng kinh doanh).
 */
export function readLivePrescriptionCatalog(_expertId?: string): MedicineItem[] {
  void _expertId;
  const warehouseProducts = readWarehouseProducts();
  const catalogByShopId = new Map(
    MEDICINE_CATALOG.map((m) => [m.shopProductId, m])
  );

  const list: MedicineItem[] = [];
  for (const prod of warehouseProducts) {
    if (prod.isHidden) continue;
    if (!prod.requiresPrescription && !isMedicineOrVaccineProduct(prod)) continue;

    const meta = catalogByShopId.get(prod.id);
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
      stock: warehouseStock,
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
  /** Tổng số lượng các bác sĩ đã xuất dùng từ kho chung (theo v1.4) */
  totalAllocatedOnShelves: number;
  byDoctor: { expertId: string; expertName: string; shelfStock: number }[];
}

/**
 * Tổng quan đối chiếu Kho thuốc chung & số lượng xuất dùng của từng Bác sĩ (Animora v1.4).
 */
export function readAllDoctorsShelfOverview(): DoctorShelfOverviewRow[] {
  const warehouseProducts = readWarehouseProducts().filter(
    isMedicineOrVaccineProduct
  );
  const allLogs = readMedicineBoxLogs();
  const doctors = getActiveVetDoctors();
  const catalogByShopId = new Map(
    MEDICINE_CATALOG.map((m) => [m.shopProductId, m])
  );

  const usageByDoctorAndProd = new Map<string, number>();
  for (const log of allLogs) {
    if (log.action !== "usage") continue;
    const key = `${log.expertId}::${log.shopProductId}`;
    usageByDoctorAndProd.set(
      key,
      (usageByDoctorAndProd.get(key) ?? 0) + Math.abs(log.quantityDelta)
    );
  }

  return warehouseProducts.map((prod) => {
    const meta = catalogByShopId.get(prod.id);
    const itemType = resolveMedicineBoxCategory(prod);
    const unit = meta?.unit ?? (itemType === "vaccine" ? "liều" : "đơn vị");
    const byDoctor = doctors.map((doc) => ({
      expertId: doc.id,
      expertName: doc.fullName,
      shelfStock: usageByDoctorAndProd.get(`${doc.id}::${prod.id}`) ?? 0,
    }));
    const totalUsedAcrossDoctors = byDoctor.reduce(
      (s, d) => s + d.shelfStock,
      0
    );
    return {
      shopProductId: prod.id,
      medicineName: prod.name,
      unit,
      warehouseStock: prod.stock ?? 0,
      isHidden: Boolean(prod.isHidden),
      totalAllocatedOnShelves: totalUsedAcrossDoctors,
      byDoctor,
    };
  });
}

/**
 * Giữ lại hàm tiện ích chia đều thuần túy cho trường hợp cần thống kê/tương thích.
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

/**
 * Nghiệp vụ Animora v1.4 (Mục 8):
 * Khi Quản lý nhập kho PO thuốc/vắc-xin, tồn kho được cộng trực tiếp vào Kho thuốc chung
 * (SHOP_PRODUCTS.stock) để toàn bộ Bác sĩ dùng chung, KHÔNG chia nhỏ lên kệ cá nhân nữa.
 */
export function recordWarehousePoImport(params: {
  shopProductId: string;
  medicineName: string;
  unit?: string;
  receivedQty: number;
  poCode?: string;
  actorLabel?: string;
  /** Nếu caller (như ShopWorkspace) đã cập nhật SHOP_PRODUCTS.stock trước đó, đặt true để không cộng đúp */
  stockAlreadyUpdated?: boolean;
  beforeWarehouseStockOverride?: number;
}): {
  ok: boolean;
  error?: string;
  afterWarehouseStock?: number;
} {
  const {
    shopProductId,
    medicineName,
    unit = "đơn vị",
    receivedQty,
    poCode,
    actorLabel = "Đã xử lý bởi Quản lý",
    stockAlreadyUpdated = false,
    beforeWarehouseStockOverride,
  } = params;

  if (!Number.isInteger(receivedQty) || receivedQty <= 0) {
    return {
      ok: false,
      error: "Số lượng nhập kho phải là số nguyên dương.",
    };
  }

  const warehouse = readWarehouseProducts();
  const prodIdx = warehouse.findIndex((p) => p.id === shopProductId);
  if (prodIdx < 0) {
    return {
      ok: false,
      error: "Không tìm thấy mã thuốc trong Kho thuốc chung.",
    };
  }

  const currentStock = warehouse[prodIdx].stock ?? 0;
  const beforeWarehouse = stockAlreadyUpdated
    ? beforeWarehouseStockOverride ?? Math.max(0, currentStock - receivedQty)
    : currentStock;
  const afterWarehouse = stockAlreadyUpdated
    ? currentStock
    : beforeWarehouse + receivedQty;

  if (!stockAlreadyUpdated) {
    const updatedWarehouse = warehouse.map((p, idx) =>
      idx === prodIdx ? { ...p, stock: afterWarehouse } : p
    );
    writeWarehouseProducts(updatedWarehouse);
  }

  const nowIso = new Date().toISOString();
  appendMedicineBoxLogs([
    {
      id: `mblog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      expertId: "warehouse",
      expertName: "Kho thuốc chung",
      shopProductId,
      medicineName,
      unit,
      action: "po_allocation",
      quantityDelta: receivedQty,
      beforeShelfStock: beforeWarehouse,
      afterShelfStock: afterWarehouse,
      actorLabel,
      referenceCode: poCode,
      note: poCode
        ? `Nhập kho chung từ đơn PO ${poCode} (+${receivedQty} ${unit})`
        : `Nhập bổ sung vào Kho thuốc chung (+${receivedQty} ${unit})`,
      createdAt: nowIso,
    },
  ]);

  emitMedicineBoxSync(true);
  return {
    ok: true,
    afterWarehouseStock: afterWarehouse,
  };
}

/**
 * Facade tương thích ngược cho tên hàm cũ — chuyển hướng hoàn toàn sang nhập trực tiếp Kho thuốc chung v1.4.
 */
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
  const res = recordWarehousePoImport({
    shopProductId: params.shopProductId,
    medicineName: params.medicineName,
    unit: params.unit,
    receivedQty: params.receivedQty,
    poCode: params.poCode,
    actorLabel: params.actorLabel,
    stockAlreadyUpdated: false,
  });
  if (!res.ok) {
    return {
      ok: false,
      error: res.error,
      totalAllocated: 0,
      allocations: [],
    };
  }
  return {
    ok: true,
    totalAllocated: params.receivedQty,
    allocations: [
      {
        expertId: "warehouse",
        expertName: "Kho thuốc chung",
        quantity: params.receivedQty,
      },
    ],
  };
}

/**
 * Nghiệp vụ Animora v1.4 (Mục 4 & Mục 8):
 * - Bác sĩ ghi nhận xuất dùng thuốc tại phòng khám -> trừ trực tiếp vào Kho thuốc chung.
 * - Chặn xuất âm (quantity > warehouseStock) và trả cờ insufficientStock để UI hiện nút 1-click báo Quản lý.
 * - Tùy chọn preventDuplicateForReference: chặn xuất đúp cùng 1 thuốc cho 1 mã ca khám.
 */
export function recordDoctorMedicineUsage(params: {
  expertId: string;
  expertName: string;
  shopProductId: string;
  quantity: number;
  note?: string;
  referenceCode?: string;
  preventDuplicateForReference?: boolean;
}): {
  ok: boolean;
  error?: string;
  afterShelfStock?: number;
  afterWarehouseStock?: number;
  insufficientStock?: boolean;
  availableStock?: number;
} {
  const {
    expertId,
    expertName,
    shopProductId,
    quantity,
    note,
    referenceCode,
    preventDuplicateForReference,
  } = params;

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return {
      ok: false,
      error: "Số lượng xuất dùng phải là số nguyên lớn hơn 0.",
    };
  }

  const warehouse = readWarehouseProducts();
  const prodIdx = warehouse.findIndex((p) => p.id === shopProductId);
  const items = readMedicineBoxItems(expertId, { includeHidden: true });
  const matched = items.find((it) => it.shopProductId === shopProductId);
  if (!matched || prodIdx < 0) {
    return {
      ok: false,
      error: "Không tìm thấy thuốc này trong Kho thuốc chung.",
    };
  }

  const cleanRef = referenceCode?.trim() || undefined;
  if (preventDuplicateForReference && cleanRef) {
    const alreadyDispensed = readMedicineBoxLogs().some(
      (l) =>
        l.action === "usage" &&
        l.referenceCode === cleanRef &&
        l.shopProductId === shopProductId
    );
    if (alreadyDispensed) {
      return {
        ok: false,
        error: `Thuốc "${matched.name}" đã được ghi nhận xuất kho cho ca khám ${cleanRef} rồi (mỗi dòng dịch vụ chỉ xuất 1 lần).`,
      };
    }
  }

  const beforeWarehouse = warehouse[prodIdx].stock ?? 0;

  if (quantity > beforeWarehouse) {
    return {
      ok: false,
      insufficientStock: true,
      availableStock: beforeWarehouse,
      error: `Chặn xuất âm: Kho chung hiện chỉ còn ${beforeWarehouse} ${matched.unit}, không đủ ${quantity} ${matched.unit} để xuất dùng! Vui lòng bấm "Báo Quản lý bổ sung kho".`,
    };
  }

  const afterWarehouse = beforeWarehouse - quantity;
  const nowIso = new Date().toISOString();

  const updatedWarehouse = warehouse.map((p, idx) =>
    idx === prodIdx ? { ...p, stock: afterWarehouse } : p
  );
  writeWarehouseProducts(updatedWarehouse);

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
      beforeShelfStock: beforeWarehouse,
      afterShelfStock: afterWarehouse,
      actorLabel: expertName,
      referenceCode: cleanRef,
      note:
        note?.trim() ||
        (cleanRef
          ? `Xuất dùng tại phòng khám cho ca ${cleanRef} (trừ kho chung)`
          : "Xuất dùng trực tiếp tại phòng khám (trừ kho chung)"),
      createdAt: nowIso,
    },
  ]);

  emitMedicineBoxSync();
  return {
    ok: true,
    afterShelfStock: afterWarehouse,
    afterWarehouseStock: afterWarehouse,
  };
}

