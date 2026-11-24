import { safeGetStorage, safeSetStorage } from "@/utils/cartLogic";

export interface AdminVoucher {
  id: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  applicableTo: string;
  startDate: string;
  endDate: string;
  usedCount: number;
  maxUsage: number;
  status: "active" | "paused" | "expired";
}

export type EffectiveVoucherStatus = "active" | "paused" | "exhausted" | "expired";

export const VOUCHERS_STORAGE_KEY = "animora_admin_vouchers_v2";
const VOUCHERS_SEEDED_EXP_KEY = "animora_admin_vouchers_seeded_exp_v1";

export const INITIAL_VOUCHERS: AdminVoucher[] = [
  {
    id: "vouch-1",
    code: "ANIMORA_SPA15",
    discountType: "percent",
    discountValue: 15,
    minOrderValue: 300000,
    maxDiscount: 100000,
    applicableTo: "Tất cả dịch vụ Spa & Grooming",
    startDate: "2026-11-01",
    endDate: "2026-11-30",
    usedCount: 42,
    maxUsage: 100,
    status: "active",
  },
  {
    id: "vouch-2",
    code: "WELCOME_NEWPET",
    discountType: "fixed",
    discountValue: 50000,
    minOrderValue: 200000,
    applicableTo: "Khách hàng mới đặt lịch lần đầu",
    startDate: "2026-10-01",
    endDate: "2026-12-31",
    usedCount: 118,
    maxUsage: 200,
    status: "active",
  },
  {
    id: "vouch-3",
    code: "VACCINE_SAVE20",
    discountType: "percent",
    discountValue: 20,
    minOrderValue: 400000,
    maxDiscount: 150000,
    applicableTo: "Gói Tiêm Chủng Vaccine 7 Bệnh",
    startDate: "2026-10-15",
    endDate: "2026-11-15",
    usedCount: 50,
    maxUsage: 50,
    status: "expired",
  },
  {
    id: "vouch-4",
    code: "FLASH_SALE_1111",
    discountType: "percent",
    discountValue: 25,
    minOrderValue: 500000,
    maxDiscount: 200000,
    applicableTo: "Toàn bộ sản phẩm cửa hàng",
    startDate: "2026-11-11",
    endDate: "2026-11-12",
    usedCount: 0,
    maxUsage: 300,
    status: "paused",
  },
  {
    id: "vou-5",
    code: "SUMMER_PET26",
    discountType: "percent",
    discountValue: 10,
    minOrderValue: 200000,
    maxDiscount: 80000,
    applicableTo: "Dịch vụ Spa & Chăm sóc",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    usedCount: 64,
    maxUsage: 150,
    status: "expired",
  },
];

export function getLocalDateIso(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function getEffectiveVoucherStatus(
  v: AdminVoucher,
  todayIso: string
): EffectiveVoucherStatus {
  if (v.usedCount >= v.maxUsage) return "exhausted";
  if (v.status === "expired" || (todayIso && v.endDate && v.endDate < todayIso)) {
    return "expired";
  }
  return v.status;
}

export function loadVouchersFromStorage(seedStorage: boolean): AdminVoucher[] {
  const saved = safeGetStorage<AdminVoucher[]>(VOUCHERS_STORAGE_KEY, []);
  if (Array.isArray(saved) && saved.length > 0) {
    if (!seedStorage) return saved;
    const seededExp = safeGetStorage<boolean>(VOUCHERS_SEEDED_EXP_KEY, false);
    const expiredSample = INITIAL_VOUCHERS.find((v) => v.id === "vou-5");
    if (!seededExp && expiredSample && !saved.some((v) => v.id === "vou-5")) {
      const merged = [...saved, expiredSample];
      safeSetStorage(VOUCHERS_STORAGE_KEY, merged);
      safeSetStorage(VOUCHERS_SEEDED_EXP_KEY, true);
      return merged;
    }
    return saved;
  }

  if (seedStorage) {
    safeSetStorage(VOUCHERS_STORAGE_KEY, INITIAL_VOUCHERS);
    safeSetStorage(VOUCHERS_SEEDED_EXP_KEY, true);
  }
  return INITIAL_VOUCHERS;
}
