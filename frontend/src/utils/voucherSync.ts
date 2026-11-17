import type { UserAccount } from '@/types/animora.type';

export const VOUCHERS_STORAGE_KEY = 'animora_admin_vouchers_v2';
export const VOUCHERS_SEEDED_KEY = 'animora_shop_vouchers_seeded_v3';
export const VOUCHER_USAGE_HISTORY_KEY = 'animora_voucher_usage_history_v1';
export const VOUCHER_AUDIT_LOG_KEY = 'animora_voucher_audit_log_v1';
export const VOUCHERS_SYNC_EVENT = 'animora_vouchers_sync';

export type VoucherStatus = 'active' | 'paused' | 'expired';
export type EffectiveVoucherStatus =
  | 'active'
  | 'paused'
  | 'exhausted'
  | 'expired'
  | 'upcoming';

export interface ShopVoucher {
  id: string;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  applicableTo: string;
  applicableScope: 'shop';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  usedCount: number;
  maxUsage: number;
  status: VoucherStatus;
}

export type AdminVoucher = ShopVoucher;

export interface VoucherUsageRecord {
  id: string;
  voucherId: string;
  voucherCode: string;
  customerKey: string;
  orderCode: string;
  discountAmount: number;
  usageStatus: 'Used' | 'Reverted';
  usedAt: string;
  revertedAt?: string;
}

export interface VoucherAuditLogEntry {
  id: string;
  actorLabel: string;
  action: 'CREATE' | 'PAUSE' | 'ACTIVATE' | 'DELETE' | 'REVERT';
  voucherCode: string;
  detail: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  timestamp: string;
}

export const INITIAL_SHOP_VOUCHERS: ShopVoucher[] = [
  {
    id: 'vouch-1',
    code: 'ANIMORA10',
    discountType: 'percent',
    discountValue: 10,
    minOrderValue: 0,
    maxDiscount: 150000,
    applicableTo: 'Toàn bộ sản phẩm Shop Animora',
    applicableScope: 'shop',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    usedCount: 18,
    maxUsage: 500,
    status: 'active',
  },
  {
    id: 'vouch-2',
    code: 'ANIMORA50K',
    discountType: 'fixed',
    discountValue: 50000,
    minOrderValue: 200000,
    applicableTo: 'Đơn hàng Shop từ 200.000₫',
    applicableScope: 'shop',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    usedCount: 35,
    maxUsage: 300,
    status: 'active',
  },
  {
    id: 'vouch-3',
    code: 'WELCOME20',
    discountType: 'percent',
    discountValue: 20,
    minOrderValue: 0,
    maxDiscount: 100000,
    applicableTo: 'Khách hàng mới mua sản phẩm Shop',
    applicableScope: 'shop',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    usedCount: 24,
    maxUsage: 200,
    status: 'active',
  },
  {
    id: 'vouch-4',
    code: 'PETLOVE30K',
    discountType: 'fixed',
    discountValue: 30000,
    minOrderValue: 0,
    applicableTo: 'Thức ăn & Phụ kiện thú cưng tại Shop',
    applicableScope: 'shop',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    usedCount: 12,
    maxUsage: 250,
    status: 'active',
  },
  {
    id: 'vouch-5',
    code: 'ANIMORA_SHOP15',
    discountType: 'percent',
    discountValue: 15,
    minOrderValue: 300000,
    maxDiscount: 100000,
    applicableTo: 'Đơn hàng Shop từ 300.000₫',
    applicableScope: 'shop',
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    usedCount: 42,
    maxUsage: 100,
    status: 'active',
  },
  {
    id: 'vouch-6',
    code: 'VACCINE_CARE20',
    discountType: 'percent',
    discountValue: 20,
    minOrderValue: 400000,
    maxDiscount: 150000,
    applicableTo: 'Sản phẩm Chăm sóc & Thuốc thú y tại Shop',
    applicableScope: 'shop',
    startDate: '2026-10-15',
    endDate: '2026-11-15',
    usedCount: 50,
    maxUsage: 50,
    status: 'expired',
  },
  {
    id: 'vouch-7',
    code: 'FLASH_SALE_1111',
    discountType: 'percent',
    discountValue: 25,
    minOrderValue: 500000,
    maxDiscount: 200000,
    applicableTo: 'Toàn bộ sản phẩm cửa hàng Shop',
    applicableScope: 'shop',
    startDate: '2026-11-11',
    endDate: '2026-11-12',
    usedCount: 0,
    maxUsage: 300,
    status: 'paused',
  },
  {
    id: 'vou-5',
    code: 'SUMMER_PET26',
    discountType: 'percent',
    discountValue: 10,
    minOrderValue: 200000,
    maxDiscount: 80000,
    applicableTo: 'Đơn hàng Shop mùa hè',
    applicableScope: 'shop',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    usedCount: 64,
    maxUsage: 150,
    status: 'expired',
  },
];

function readJsonStorage<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJsonStorage<T>(key: string, value: T): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
}

export function getLocalDateIso(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function dispatchVouchersSync(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(VOUCHERS_SYNC_EVENT));
  }
}

function normalizeVoucherRecord(raw: Partial<ShopVoucher>): ShopVoucher {
  return {
    id: raw.id || `vouch-${Date.now()}`,
    code: String(raw.code || '').trim().toUpperCase(),
    discountType: raw.discountType === 'fixed' ? 'fixed' : 'percent',
    discountValue: Number(raw.discountValue ?? 0),
    minOrderValue: Number(raw.minOrderValue ?? 0),
    maxDiscount:
      raw.discountType === 'percent' && raw.maxDiscount !== undefined
        ? Number(raw.maxDiscount)
        : undefined,
    applicableTo: String(raw.applicableTo || 'Toàn bộ sản phẩm Shop Animora'),
    applicableScope: 'shop',
    startDate: String(raw.startDate || ''),
    endDate: String(raw.endDate || ''),
    usedCount: Number(raw.usedCount ?? 0),
    maxUsage: Number(raw.maxUsage ?? 1),
    status:
      raw.status === 'paused' || raw.status === 'expired' ? raw.status : 'active',
  };
}

export function readVouchersFromStorage(): ShopVoucher[] {
  const saved = readJsonStorage<Partial<ShopVoucher>[]>(VOUCHERS_STORAGE_KEY, []);
  if (Array.isArray(saved) && saved.length > 0) {
    const normalized = saved.map(normalizeVoucherRecord);
    const seeded = readJsonStorage<boolean>(VOUCHERS_SEEDED_KEY, false);
    if (!seeded) {
      const existingCodes = new Set(normalized.map((v) => v.code));
      const merged = [
        ...normalized,
        ...INITIAL_SHOP_VOUCHERS.filter((seed) => !existingCodes.has(seed.code)),
      ];
      writeJsonStorage(VOUCHERS_STORAGE_KEY, merged);
      writeJsonStorage(VOUCHERS_SEEDED_KEY, true);
      return merged;
    }
    return normalized;
  }

  writeJsonStorage(VOUCHERS_STORAGE_KEY, INITIAL_SHOP_VOUCHERS);
  writeJsonStorage(VOUCHERS_SEEDED_KEY, true);
  return INITIAL_SHOP_VOUCHERS;
}

export function writeVouchersToStorage(vouchers: ShopVoucher[]): void {
  const normalized = vouchers.map(normalizeVoucherRecord);
  writeJsonStorage(VOUCHERS_STORAGE_KEY, normalized);
  dispatchVouchersSync();
}

export function getEffectiveVoucherStatus(
  v: Pick<ShopVoucher, 'usedCount' | 'maxUsage' | 'status' | 'startDate' | 'endDate'>,
  todayIso = getLocalDateIso(0)
): EffectiveVoucherStatus {
  if (v.usedCount >= v.maxUsage) return 'exhausted';
  if (v.status === 'expired' || (todayIso && v.endDate && v.endDate < todayIso)) {
    return 'expired';
  }
  if (v.status === 'paused') return 'paused';
  if (todayIso && v.startDate && v.startDate > todayIso) {
    return 'upcoming';
  }
  return 'active';
}

export interface VoucherFormValidationResult {
  valid: boolean;
  errorMessage?: string;
}

export function validateVoucherFormInput(
  input: {
    code: string;
    discountType: 'percent' | 'fixed';
    discountValue: number;
    minOrderValue: number;
    maxDiscount?: number;
    applicableTo: string;
    startDate: string;
    endDate: string;
    maxUsage: number;
  },
  existingVouchers: ShopVoucher[]
): VoucherFormValidationResult {
  const normalizedCode = String(input.code || '').trim().toUpperCase();
  if (!normalizedCode) {
    return { valid: false, errorMessage: 'Vui lòng nhập mã voucher!' };
  }
  if (!/^[A-Z0-9_-]{2,50}$/.test(normalizedCode)) {
    return {
      valid: false,
      errorMessage: 'Mã voucher chỉ gồm chữ hoa, số, "-" hoặc "_" (2–50 ký tự).',
    };
  }
  if (existingVouchers.some((v) => v.code.toUpperCase() === normalizedCode)) {
    return {
      valid: false,
      errorMessage: `Mã voucher ${normalizedCode} đã tồn tại trong hệ thống!`,
    };
  }
  if (!String(input.applicableTo || '').trim()) {
    return { valid: false, errorMessage: 'Vui lòng nhập mô tả phạm vi áp dụng Shop!' };
  }
  if (!Number.isFinite(input.discountValue) || input.discountValue <= 0) {
    return { valid: false, errorMessage: 'Mức giảm giá phải lớn hơn 0!' };
  }
  if (input.discountType === 'percent' && input.discountValue > 100) {
    return {
      valid: false,
      errorMessage: 'Mức giảm theo % không được vượt quá 100%!',
    };
  }
  if (!Number.isFinite(input.minOrderValue) || input.minOrderValue < 0) {
    return { valid: false, errorMessage: 'Giá trị đơn tối thiểu không được âm!' };
  }
  if (
    input.discountType === 'percent' &&
    input.maxDiscount !== undefined &&
    (!Number.isFinite(input.maxDiscount) || input.maxDiscount < 0)
  ) {
    return { valid: false, errorMessage: 'Mức giảm tối đa không được âm!' };
  }
  if (!Number.isInteger(input.maxUsage) || input.maxUsage < 1) {
    return { valid: false, errorMessage: 'Giới hạn lượt sử dụng phải từ 1 trở lên!' };
  }
  if (!input.startDate || !input.endDate) {
    return { valid: false, errorMessage: 'Vui lòng chọn ngày bắt đầu và kết thúc!' };
  }
  if (input.endDate < input.startDate) {
    return {
      valid: false,
      errorMessage: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu!',
    };
  }
  return { valid: true };
}

/**
 * Theo Tài liệu Nghiệp vụ v1.2 (Mục 2, 3, 10) và DB AnimoraDB v1.5 (VOUCHER.USE = KH):
 * Chỉ Khách hàng (owner) hoặc khách chưa đăng nhập ở bước xem giỏ hàng mới được dùng voucher.
 * Chặn tuyệt đối Bác sĩ (vet), NVCS (care_staff), Quản lý (manager), Admin (admin), Supplier, Rescue.
 */
export function canUseVoucherRole(currentUser?: UserAccount | null): boolean {
  if (!currentUser) return true;
  return currentUser.role === 'owner';
}

export function resolveCustomerUsageKey(currentUser?: UserAccount | null): string {
  if (!currentUser) return 'guest';
  return currentUser.id || currentUser.email || currentUser.phone || 'owner';
}

export function readVoucherUsageHistory(): VoucherUsageRecord[] {
  const saved = readJsonStorage<VoucherUsageRecord[]>(VOUCHER_USAGE_HISTORY_KEY, []);
  return Array.isArray(saved) ? saved : [];
}

export function hasCustomerUsedVoucher(
  voucherCode: string,
  currentUser?: UserAccount | null
): boolean {
  if (!currentUser) return false;
  const code = voucherCode.trim().toUpperCase();
  const customerKey = resolveCustomerUsageKey(currentUser);
  const history = readVoucherUsageHistory();
  return history.some(
    (entry) =>
      entry.voucherCode === code &&
      entry.customerKey === customerKey &&
      entry.usageStatus === 'Used'
  );
}

export function recordVoucherUsageInStorage(params: {
  voucherCode: string;
  currentUser?: UserAccount | null;
  orderCode: string;
  discountAmount: number;
}): void {
  const code = params.voucherCode.trim().toUpperCase();
  if (!code) return;

  const vouchers = readVouchersFromStorage();
  const target = vouchers.find((v) => v.code === code);
  if (target) {
    const updated = vouchers.map((v) =>
      v.code === code
        ? { ...v, usedCount: Math.min(v.maxUsage, v.usedCount + 1) }
        : v
    );
    writeVouchersToStorage(updated);
  }

  const history = readVoucherUsageHistory();
  if (history.some((h) => h.orderCode.toUpperCase() === params.orderCode.toUpperCase())) {
    return;
  }

  const entry: VoucherUsageRecord = {
    id: `vuh-${Date.now()}`,
    voucherId: target?.id || code,
    voucherCode: code,
    customerKey: resolveCustomerUsageKey(params.currentUser),
    orderCode: params.orderCode,
    discountAmount: Math.max(0, Math.round(params.discountAmount)),
    usageStatus: 'Used',
    usedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
  };

  writeJsonStorage(VOUCHER_USAGE_HISTORY_KEY, [entry, ...history]);
}

export function revertVoucherUsageInStorage(orderCode: string): void {
  const codeKey = String(orderCode || '').trim().toUpperCase();
  if (!codeKey) return;

  const history = readVoucherUsageHistory();
  let revertedVoucherCode = '';

  const nextHistory = history.map((entry) => {
    if (entry.orderCode.toUpperCase() === codeKey && entry.usageStatus === 'Used') {
      revertedVoucherCode = entry.voucherCode;
      return {
        ...entry,
        usageStatus: 'Reverted' as const,
        revertedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      };
    }
    return entry;
  });

  if (!revertedVoucherCode) return;

  writeJsonStorage(VOUCHER_USAGE_HISTORY_KEY, nextHistory);

  const vouchers = readVouchersFromStorage();
  const nextVouchers = vouchers.map((v) =>
    v.code === revertedVoucherCode
      ? { ...v, usedCount: Math.max(0, v.usedCount - 1) }
      : v
  );
  writeVouchersToStorage(nextVouchers);
}

export function readVoucherAuditLogs(): VoucherAuditLogEntry[] {
  const saved = readJsonStorage<VoucherAuditLogEntry[]>(VOUCHER_AUDIT_LOG_KEY, []);
  return Array.isArray(saved) ? saved : [];
}

export function appendVoucherAuditLog(
  entry: Omit<VoucherAuditLogEntry, 'id' | 'actorLabel' | 'timestamp'>
): VoucherAuditLogEntry[] {
  const existing = readVoucherAuditLogs();
  const nextEntry: VoucherAuditLogEntry = {
    ...entry,
    id: `vlog-${Date.now()}`,
    actorLabel: 'Đã xử lý bởi Quản lý',
    timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
  };
  const next = [nextEntry, ...existing].slice(0, 50);
  writeJsonStorage(VOUCHER_AUDIT_LOG_KEY, next);
  return next;
}

