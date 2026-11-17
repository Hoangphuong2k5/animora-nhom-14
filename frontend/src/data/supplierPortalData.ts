"use client";

import { useCallback, useEffect, useState } from "react";
import { safeGetStorage, safeSetStorage } from "@/utils/cartLogic";
import { initialProducts } from "@/data/mockData";
import { ExtendedProduct } from "@/components/manager/shop/shopTypesAndData";

export const SUPPLIER_PROFILES_STORAGE_KEY = "animora_supplier_profiles_v1";
export const SUPPLIER_CATALOG_META_STORAGE_KEY = "animora_supplier_catalog_meta_v1";
export const SUPPLIER_OFFERINGS_STORAGE_KEY = "animora_supplier_offerings_v1";
export const SUPPLIER_ACTIVE_ID_STORAGE_KEY = "animora_supplier_active_id_v1";
export const SUPPLIER_SYNC_EVENT = "animora_supplier_sync";
export const SHOP_PRODUCTS_STORAGE_KEY = "animora_shop_products_v2";

export type SupplierSupplyStatus = "available" | "low_stock" | "discontinued";

export interface SupplierOfferingItem {
  id: string;
  name: string;
  category: "food" | "care" | "toys" | "accessories" | "medicine";
  costPrice: number;
  suggestedRetailPrice: number;
  requiresPrescription: boolean;
  supplierName: string;
  supplierStock: number;
  supplyStatus: SupplierSupplyStatus;
}

export interface SupplierProfile {
  id: string;
  name: string;
  taxCode: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  leadTimeDays: number;
  bankAccount: string;
  specialty: string;
  importSlipsCount: number;
  totalImportValue: number;
}

export interface SupplierCatalogMeta {
  supplierName: string;
  supplierStock: number;
  supplyStatus: SupplierSupplyStatus;
}

export const SEED_SUPPLIER_PROFILES: SupplierProfile[] = [
  {
    id: "sup-1",
    name: "Công ty TNHH Royal Canin Việt Nam",
    taxCode: "0312458901",
    contactPerson: "Lê Minh Tuấn",
    phone: "028.3822.4455",
    email: "b2b.vn@royalcanin.com",
    address: "KCN Tân Bình, Quận Tân Phú, TP.HCM",
    leadTimeDays: 3,
    bankAccount: "Vietcombank CN TP.HCM - 0071000889922",
    specialty: "Thức ăn hạt & Dinh dưỡng thú y",
    importSlipsCount: 14,
    totalImportValue: 142000000,
  },
  {
    id: "sup-2",
    name: "Công ty CP Dược Thú Y Vemedim",
    taxCode: "1800547192",
    contactPerson: "Nguyễn Thị Phương Mai",
    phone: "028.3910.1122",
    email: "supply@vemedim.vn",
    address: "Tòa nhà Mê Linh Point, Quận 1, TP.HCM",
    leadTimeDays: 2,
    bankAccount: "BIDV CN Sài Gòn - 3101000293847",
    specialty: "Thuốc kê đơn Rx, Vaccine & Chăm sóc y tế",
    importSlipsCount: 9,
    totalImportValue: 98000000,
  },
  {
    id: "sup-3",
    name: "Petcare Accessories Co.",
    taxCode: "0108923415",
    contactPerson: "Trần Anh Khoa",
    phone: "024.3772.8899",
    email: "orders@petcare-acc.vn",
    address: "Keangnam Landmark 72, Quận Cầu Giấy, Hà Nội",
    leadTimeDays: 4,
    bankAccount: "Techcombank CN Hà Nội - 1903482910201",
    specialty: "Phụ kiện, Đồ chơi & Trang thiết bị",
    importSlipsCount: 6,
    totalImportValue: 65000000,
  },
];

export function defaultSupplierForCategory(category?: string): string {
  if (category === "food") return SEED_SUPPLIER_PROFILES[0].name;
  if (category === "care" || category === "medicine" || category === "vaccine") {
    return SEED_SUPPLIER_PROFILES[1].name;
  }
  return SEED_SUPPLIER_PROFILES[2].name;
}

export function loadShopProductsForSupplier(): ExtendedProduct[] {
  const saved = safeGetStorage<ExtendedProduct[]>(SHOP_PRODUCTS_STORAGE_KEY, []);
  if (Array.isArray(saved) && saved.length > 0) {
    return saved.map((p) => ({
      ...p,
      costPrice: p.costPrice ?? Math.round((p.price || 200000) * 0.65),
    }));
  }
  const extended: ExtendedProduct[] = initialProducts.map((p, i) => ({
    ...p,
    requiresPrescription: Boolean(p.requiresPrescription),
    isHidden: false,
    stock: p.stock || (i === 1 ? 3 : i === 4 ? 2 : 25),
    costPrice: Math.round((p.price || 200000) * 0.65),
  }));
  safeSetStorage(SHOP_PRODUCTS_STORAGE_KEY, extended);
  return extended;
}

export function saveShopProductsFromSupplier(next: ExtendedProduct[]): void {
  safeSetStorage(SHOP_PRODUCTS_STORAGE_KEY, next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SUPPLIER_SYNC_EVENT));
    window.dispatchEvent(new Event("animora_medicine_box_sync"));
  }
}

export function loadSupplierProfiles(): SupplierProfile[] {
  const saved = safeGetStorage<SupplierProfile[]>(SUPPLIER_PROFILES_STORAGE_KEY, []);
  if (Array.isArray(saved) && saved.length > 0) {
    return saved;
  }
  safeSetStorage(SUPPLIER_PROFILES_STORAGE_KEY, SEED_SUPPLIER_PROFILES);
  return SEED_SUPPLIER_PROFILES;
}

export function saveSupplierProfiles(next: SupplierProfile[]): void {
  safeSetStorage(SUPPLIER_PROFILES_STORAGE_KEY, next);
  window.dispatchEvent(new Event(SUPPLIER_SYNC_EVENT));
}

export function loadSupplierCatalogMeta(
  products: ExtendedProduct[]
): Record<string, SupplierCatalogMeta> {
  const saved = safeGetStorage<Record<string, SupplierCatalogMeta> | null>(
    SUPPLIER_CATALOG_META_STORAGE_KEY,
    null
  );
  const base: Record<string, SupplierCatalogMeta> = saved ? { ...saved } : {};
  let changed = !saved;

  for (const p of products) {
    if (!base[p.id]) {
      base[p.id] = {
        supplierName: defaultSupplierForCategory(p.category),
        supplierStock: 250,
        supplyStatus: "available",
      };
      changed = true;
    }
  }

  if (changed) {
    safeSetStorage(SUPPLIER_CATALOG_META_STORAGE_KEY, base);
  }
  return base;
}

export function saveSupplierCatalogMeta(
  next: Record<string, SupplierCatalogMeta>
): void {
  safeSetStorage(SUPPLIER_CATALOG_META_STORAGE_KEY, next);
  window.dispatchEvent(new Event(SUPPLIER_SYNC_EVENT));
}

/**
 * Hook quản lý đối tác NCC đang được chọn trong Cổng Nhà Cung Cấp ("all" hoặc tên NCC).
 */
export function useActiveSupplierFilter(): [string, (next: string) => void] {
  const [activeSupplier, setActiveSupplier] = useState<string>("all");

  useEffect(() => {
    const load = () => {
      const saved = safeGetStorage<string>(SUPPLIER_ACTIVE_ID_STORAGE_KEY, "all");
      setActiveSupplier(saved || "all");
    };
    load();
    window.addEventListener(SUPPLIER_SYNC_EVENT, load);
    return () => window.removeEventListener(SUPPLIER_SYNC_EVENT, load);
  }, []);

  const update = useCallback((next: string) => {
    safeSetStorage(SUPPLIER_ACTIVE_ID_STORAGE_KEY, next);
    setActiveSupplier(next);
    window.dispatchEvent(new Event(SUPPLIER_SYNC_EVENT));
  }, []);

  return [activeSupplier, update];
}

export const SEED_SUPPLIER_OFFERINGS: SupplierOfferingItem[] = [
  {
    id: "sup-offer-1",
    name: "Hạt Royal Canin Urinary S/O cho mèo (1.5kg)",
    category: "food",
    costPrice: 310000,
    suggestedRetailPrice: 440000,
    requiresPrescription: true,
    supplierName: "Công ty TNHH Royal Canin Việt Nam",
    supplierStock: 120,
    supplyStatus: "available",
  },
  {
    id: "sup-offer-2",
    name: "Hạt Royal Canin Gastro Intestinal cho chó (2kg)",
    category: "food",
    costPrice: 390000,
    suggestedRetailPrice: 540000,
    requiresPrescription: true,
    supplierName: "Công ty TNHH Royal Canin Việt Nam",
    supplierStock: 85,
    supplyStatus: "available",
  },
  {
    id: "sup-offer-3",
    name: "Dung dịch nhỏ gáy Vemedim Anti-Tick (Hộp 3 ống)",
    category: "care",
    costPrice: 145000,
    suggestedRetailPrice: 220000,
    requiresPrescription: false,
    supplierName: "Công ty CP Dược Thú Y Vemedim",
    supplierStock: 200,
    supplyStatus: "available",
  },
  {
    id: "sup-offer-4",
    name: "Men vi sinh Vemedim Bio-Prob cho thú cưng (Hộp 20 gói)",
    category: "care",
    costPrice: 110000,
    suggestedRetailPrice: 175000,
    requiresPrescription: false,
    supplierName: "Công ty CP Dược Thú Y Vemedim",
    supplierStock: 160,
    supplyStatus: "available",
  },
  {
    id: "sup-offer-5",
    name: "Balo phi hành gia vận chuyển thú cưng thoáng khí",
    category: "accessories",
    costPrice: 260000,
    suggestedRetailPrice: 395000,
    requiresPrescription: false,
    supplierName: "Petcare Accessories Co.",
    supplierStock: 75,
    supplyStatus: "available",
  },
  {
    id: "sup-offer-6",
    name: "Cần câu lông vũ tương tác tự động cho mèo",
    category: "toys",
    costPrice: 95000,
    suggestedRetailPrice: 155000,
    requiresPrescription: false,
    supplierName: "Petcare Accessories Co.",
    supplierStock: 140,
    supplyStatus: "available",
  },
  {
    id: "sup-offer-7",
    name: "Thuốc nhỏ mắt Tobramycin Vet 5ml (Vemedim)",
    category: "medicine",
    costPrice: 68000,
    suggestedRetailPrice: 115000,
    requiresPrescription: true,
    supplierName: "Công ty CP Dược Thú Y Vemedim",
    supplierStock: 90,
    supplyStatus: "available",
  },
  {
    id: "sup-offer-8",
    name: "Vắc-xin 5 bệnh mèo Feligen CRP/R (Lọ 1 liều)",
    category: "medicine",
    costPrice: 185000,
    suggestedRetailPrice: 280000,
    requiresPrescription: true,
    supplierName: "Công ty CP Dược Thú Y Vemedim",
    supplierStock: 60,
    supplyStatus: "available",
  },
];

export function loadSupplierOfferings(): SupplierOfferingItem[] {
  const saved = safeGetStorage<SupplierOfferingItem[]>(
    SUPPLIER_OFFERINGS_STORAGE_KEY,
    []
  );
  if (Array.isArray(saved) && saved.length > 0) {
    const existingIds = new Set(saved.map((o) => o.id));
    const missingMedicineSeeds = SEED_SUPPLIER_OFFERINGS.filter(
      (seed) => seed.category === "medicine" && !existingIds.has(seed.id)
    );
    if (missingMedicineSeeds.length > 0) {
      const merged = [...saved, ...missingMedicineSeeds];
      safeSetStorage(SUPPLIER_OFFERINGS_STORAGE_KEY, merged);
      return merged;
    }
    return saved;
  }
  safeSetStorage(SUPPLIER_OFFERINGS_STORAGE_KEY, SEED_SUPPLIER_OFFERINGS);
  return SEED_SUPPLIER_OFFERINGS;
}

export function saveSupplierOfferings(next: SupplierOfferingItem[]): void {
  safeSetStorage(SUPPLIER_OFFERINGS_STORAGE_KEY, next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SUPPLIER_SYNC_EVENT));
  }
}

export function ensureSupplierCatalogMetaForProduct(
  productId: string,
  category?: string,
  preferredSupplier?: string
): SupplierCatalogMeta {
  const saved = safeGetStorage<Record<string, SupplierCatalogMeta> | null>(
    SUPPLIER_CATALOG_META_STORAGE_KEY,
    null
  );
  const base: Record<string, SupplierCatalogMeta> = saved ? { ...saved } : {};
  if (!base[productId]) {
    base[productId] = {
      supplierName: preferredSupplier || defaultSupplierForCategory(category),
      supplierStock: 200,
      supplyStatus: "available",
    };
    safeSetStorage(SUPPLIER_CATALOG_META_STORAGE_KEY, base);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(SUPPLIER_SYNC_EVENT));
    }
  }
  return base[productId];
}

export function deductSupplierStockAfterImport(
  items: { productId: string; quantity: number }[]
): void {
  if (items.length === 0) return;
  const meta = safeGetStorage<Record<string, SupplierCatalogMeta>>(
    SUPPLIER_CATALOG_META_STORAGE_KEY,
    {}
  );
  let metaChanged = false;
  for (const item of items) {
    const rec = meta[item.productId];
    if (rec && item.quantity > 0) {
      const nextStock = Math.max(0, rec.supplierStock - item.quantity);
      meta[item.productId] = {
        ...rec,
        supplierStock: nextStock,
        supplyStatus:
          nextStock === 0
            ? "low_stock"
            : nextStock < 20 && rec.supplyStatus === "available"
            ? "low_stock"
            : rec.supplyStatus,
      };
      metaChanged = true;
    }
  }
  if (metaChanged) {
    safeSetStorage(SUPPLIER_CATALOG_META_STORAGE_KEY, meta);
  }

  const offerings = loadSupplierOfferings();
  let offChanged = false;
  const nextOfferings: SupplierOfferingItem[] = offerings.map((o) => {
    const match = items.find((i) => i.productId === o.id);
    if (!match || match.quantity <= 0) return o;
    offChanged = true;
    const nextStock = Math.max(0, o.supplierStock - match.quantity);
    const nextStatus: SupplierSupplyStatus =
      nextStock < 20 && o.supplyStatus === "available"
        ? "low_stock"
        : o.supplyStatus;
    return {
      ...o,
      supplierStock: nextStock,
      supplyStatus: nextStatus,
    };
  });
  if (offChanged) {
    saveSupplierOfferings(nextOfferings);
  } else if (metaChanged && typeof window !== "undefined") {
    window.dispatchEvent(new Event(SUPPLIER_SYNC_EVENT));
  }
}

/**
 * Trả về các mặt hàng nhà cung cấp hiện có mà trong kho Animora chưa có.
 */
export function getAvailableNewProductsForShop(
  shopProducts: ExtendedProduct[],
  supplierName?: string
): SupplierOfferingItem[] {
  const offerings = loadSupplierOfferings();
  const existingIds = new Set(shopProducts.map((p) => p.id));
  const existingNames = new Set(
    shopProducts.map((p) => p.name.trim().toLowerCase())
  );

  return offerings.filter((item) => {
    if (item.supplyStatus === "discontinued") return false;
    if (supplierName && item.supplierName !== supplierName) return false;
    if (existingIds.has(item.id)) return false;
    if (existingNames.has(item.name.trim().toLowerCase())) return false;
    return true;
  });
}
