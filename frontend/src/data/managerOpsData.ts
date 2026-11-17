/**
 * Dữ liệu & quy tắc nghiệp vụ cho Cổng Manager (/manager).
 * Bám theo PhanTichNghiepVu.md – Mục 2 (hủy/đổi lịch, thanh toán), Mục 3 (lương bác sĩ),
 * Mục 5 (Manager), Mục 7 (Supplier) và Mục 9 (nghỉ phép & thu nhập).
 */
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { safeGetStorage, safeSetStorage } from "@/utils/cartLogic";
import { SERVICES_DATA } from "@/data/servicesData";

/* ------------------------------------------------------------------ */
/* Storage keys & sync                                                 */
/* ------------------------------------------------------------------ */

export const MANAGER_STORAGE_KEYS = {
  employees: "animora_manager_employees_v2",
  requests: "animora_manager_staff_requests_v1",
  quota: "animora_manager_leave_quota_v1",
  serviceConfig: "animora_manager_service_config_v3",
  serviceProgress: "animora_manager_service_progress_v1",
  purchaseOrders: "animora_manager_purchase_orders_v1",
} as const;

export const MANAGER_SYNC_EVENT = "animora_manager_ops_sync";

/**
 * Hook state đồng bộ với localStorage và giữa các component cùng trang
 * (qua custom event) – giúp các tab Nhân sự/Hạn mức/Lương luôn nhất quán.
 */
export function useManagerStore<T>(
  key: string,
  seed: T
): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(seed);
  const valueRef = useRef<T>(seed);
  const sourceId = useId();

  useEffect(() => {
    const load = () => {
      const saved = safeGetStorage<T | null>(key, null);
      if (saved !== null && saved !== undefined) {
        valueRef.current = saved;
        setValue(saved);
      } else {
        safeSetStorage(key, seed);
        valueRef.current = seed;
        setValue(seed);
      }
    };
    load();
    const onSync = (e: Event) => {
      const detail = (e as CustomEvent<{ key: string; sourceId?: string }>).detail;
      if (detail?.sourceId === sourceId) return;
      if (!detail || detail.key === key) load();
    };
    window.addEventListener(MANAGER_SYNC_EVENT, onSync);
    return () => window.removeEventListener(MANAGER_SYNC_EVENT, onSync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, sourceId]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      const saved = safeGetStorage<T | null>(key, null);
      const current = saved !== null && saved !== undefined ? saved : valueRef.current;
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(current) : next;
      valueRef.current = resolved;
      safeSetStorage(key, resolved);
      setValue(resolved);
      queueMicrotask(() => {
        window.dispatchEvent(new CustomEvent(MANAGER_SYNC_EVENT, { detail: { key, sourceId } }));
      });
    },
    [key, sourceId]
  );

  return [value, update];
}

/* ------------------------------------------------------------------ */
/* Nhân sự, chứng chỉ                                                  */
/* ------------------------------------------------------------------ */

export type EmployeeRole = "vet" | "care_staff";
export type ContractType = "full_time" | "part_time";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface EmployeeCertificate {
  id: string;
  name: string;
  issuer: string;
  issuedAt: string;
  status: ApprovalStatus;
  reviewedAt?: string;
  rejectReason?: string;
}

export interface ManagerEmployee {
  id: string;
  name: string;
  role: EmployeeRole;
  contract: ContractType;
  title: string;
  phone: string;
  email: string;
  /** Thu nhập của 1 ca làm (dùng để trừ khi vắng vượt hạn mức) */
  shiftRate: number;
  /** Số ca đã làm trong tháng */
  shiftsWorked: number;
  /** Số lịch hẹn hoàn thành trong tháng (bác sĩ) */
  completedAppointments: number;
  rating: number;
  certificates: EmployeeCertificate[];
}

export const SEED_EMPLOYEES: ManagerEmployee[] = [
  {
    id: "st-1",
    name: "BS. Lê Huy Hoàng",
    role: "vet",
    contract: "full_time",
    title: "Bác sĩ thú y CKI",
    phone: "0918.234.567",
    email: "quochung.vet@animora.vn",
    shiftRate: 450000,
    shiftsWorked: 22,
    completedAppointments: 48,
    rating: 4.95,
    certificates: [
      { id: "c-1", name: "Bằng Bác sĩ Thú y CKI", issuer: "ĐH Nông Lâm TP.HCM", issuedAt: "2018-06-20", status: "approved", reviewedAt: "2026-01-05" },
      { id: "c-2", name: "Chứng chỉ Siêu âm & X-Quang thú nhỏ (ISFM)", issuer: "ISFM", issuedAt: "2025-09-12", status: "pending" },
    ],
  },
  {
    id: "st-4",
    name: "BS. Ngô Phước Toàn",
    role: "vet",
    contract: "full_time",
    title: "Bác sĩ thú y",
    phone: "0903.456.789",
    email: "hoangmai.vet@animora.vn",
    shiftRate: 400000,
    shiftsWorked: 18,
    completedAppointments: 35,
    rating: 4.7,
    certificates: [
      { id: "c-3", name: "Bằng Bác sĩ Thú y", issuer: "Học viện Nông nghiệp Việt Nam", issuedAt: "2020-07-01", status: "approved", reviewedAt: "2026-01-05" },
      { id: "c-4", name: "Chứng chỉ Kiểm soát Dịch bệnh (CDC VET)", issuer: "CDC VET", issuedAt: "2026-10-02", status: "pending" },
    ],
  },
  {
    id: "st-2",
    name: "Phan Thị Đình Thùy",
    role: "care_staff",
    contract: "full_time",
    title: "Master Groomer",
    phone: "0912.111.222",
    email: "thaovy.care@animora.vn",
    shiftRate: 350000,
    shiftsWorked: 24,
    completedAppointments: 0,
    rating: 4.9,
    certificates: [
      { id: "c-5", name: "Chứng chỉ Grooming quốc tế (IPG)", issuer: "International Professional Groomers", issuedAt: "2022-03-15", status: "approved", reviewedAt: "2026-01-06" },
    ],
  },
  {
    id: "st-3",
    name: "Nguyễn Văn Tuấn Anh",
    role: "care_staff",
    contract: "full_time",
    title: "Chuyên viên Spa",
    phone: "0934.333.444",
    email: "hoangtoan.care@animora.vn",
    shiftRate: 300000,
    shiftsWorked: 21,
    completedAppointments: 0,
    rating: 4.6,
    certificates: [
      { id: "c-6", name: "Chứng chỉ Spa thú cưng cơ bản", issuer: "Animora Academy", issuedAt: "2026-10-20", status: "pending" },
    ],
  },
  {
    id: "st-5",
    name: "Phạm Ngọc Hân",
    role: "care_staff",
    contract: "part_time",
    title: "Nhân viên chăm sóc (Part-time)",
    phone: "0977.555.666",
    email: "ngochan.care@animora.vn",
    shiftRate: 220000,
    shiftsWorked: 10,
    completedAppointments: 0,
    rating: 4.5,
    certificates: [
      { id: "c-7", name: "Chứng chỉ Chăm sóc thú cưng nội trú", issuer: "Animora Academy", issuedAt: "2026-11-01", status: "pending" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Đơn nghỉ phép / tăng ca / ca làm thêm (Mục 4, 5, 9)                 */
/* ------------------------------------------------------------------ */

export type StaffRequestType = "leave" | "extra_shift";
export type LeaveKind = "annual" | "sick" | "unpaid";

export interface StaffRequest {
  id: string;
  employeeId: string;
  type: StaffRequestType;
  /** Ngày áp dụng (YYYY-MM-DD) */
  date: string;
  /** Số ca nghỉ / số ca làm thêm */
  shifts: number;
  hours?: number;
  leaveKind?: LeaveKind;
  reason: string;
  status: ApprovalStatus;
  createdAt: string;
  reviewedAt?: string;
  rejectReason?: string;
}

export const SEED_REQUESTS: StaffRequest[] = [
  { id: "rq-1", employeeId: "st-1", type: "leave", leaveKind: "annual", date: "2026-11-15", shifts: 2, reason: "Về quê dự đám cưới em gái", status: "pending", createdAt: "2026-11-10" },
  { id: "rq-2", employeeId: "st-3", type: "leave", leaveKind: "sick", date: "2026-11-08", shifts: 1, reason: "Sốt siêu vi, có giấy khám bệnh", status: "approved", createdAt: "2026-11-08", reviewedAt: "2026-11-08" },
  { id: "rq-4", employeeId: "st-5", type: "extra_shift", date: "2026-11-17", shifts: 2, reason: "Đăng ký thêm ca chiều Chủ nhật", status: "pending", createdAt: "2026-11-11" },
  { id: "rq-5", employeeId: "st-4", type: "leave", leaveKind: "unpaid", date: "2026-11-20", shifts: 1, reason: "Việc gia đình đột xuất", status: "pending", createdAt: "2026-11-12" },
  { id: "rq-6", employeeId: "st-3", type: "leave", leaveKind: "annual", date: "2026-10-02", shifts: 12, reason: "Nghỉ phép dài ngày (đã duyệt)", status: "approved", createdAt: "2026-09-20", reviewedAt: "2026-09-21" },
];

export const REQUEST_TYPE_LABEL: Record<StaffRequestType, string> = {
  leave: "Nghỉ phép",
  extra_shift: "Ca làm thêm",
};

export const LEAVE_KIND_LABEL: Record<LeaveKind, string> = {
  annual: "Nghỉ phép năm",
  sick: "Nghỉ ốm",
  unpaid: "Nghỉ không lương",
};

/**
 * Kiểm tra quy tắc hợp lệ của đơn (Mục 9):
 * - Ca làm thêm chỉ dành cho nhân viên part-time (đã bỏ hoàn toàn nghiệp vụ tăng ca).
 */
export function validateRequestForContract(type: StaffRequestType, contract: ContractType): string | null {
  if (type === "extra_shift" && contract === "full_time") {
    return "Ca làm thêm chỉ áp dụng cho nhân viên part-time.";
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Hạn mức nghỉ phép & vắng mặt (Mục 9)                                */
/* ------------------------------------------------------------------ */

export interface LeaveQuotaConfig {
  /** Số ca nghỉ tối đa mỗi tháng (Mục 9: tối đa 4 ngày/tháng, reset đầu mỗi tháng) */
  daysPerMonth: number;
  year: number;
  updatedAt: string;
}

export const SEED_QUOTA: LeaveQuotaConfig = {
  daysPerMonth: 4,
  year: 2026,
  updatedAt: "2026-01-01",
};

export interface AbsenceSummary {
  employeeId: string;
  totalAbsent: number;
  withinQuota: number;
  overQuota: number;
  remaining: number;
  deduction: number;
}

/**
 * Mỗi ca nghỉ (luân phiên, ốm, không lương) đều là 1 ca vắng trừ vào hạn mức tháng (4 ngày/tháng).
 */
export function computeAbsence(
  employee: ManagerEmployee,
  requests: StaffRequest[],
  quota: LeaveQuotaConfig
): AbsenceSummary {
  const currentMonthPrefix = todayIso().slice(0, 7); // YYYY-MM
  const totalAbsent = requests
    .filter(
      (r) =>
        r.employeeId === employee.id &&
        r.type === "leave" &&
        r.status === "approved" &&
        r.date.startsWith(currentMonthPrefix)
    )
    .reduce((sum, r) => sum + r.shifts, 0);
  const withinQuota = Math.min(totalAbsent, quota.daysPerMonth);
  const overQuota = Math.max(0, totalAbsent - quota.daysPerMonth);
  return {
    employeeId: employee.id,
    totalAbsent,
    withinQuota,
    overQuota,
    remaining: Math.max(0, quota.daysPerMonth - totalAbsent),
    deduction: 0,
  };
}

/* ------------------------------------------------------------------ */
/* Dịch vụ & hình thức thanh toán (Mục 2, 5)                           */
/* ------------------------------------------------------------------ */

export type PaymentPolicy = "prepaid" | "postpaid" | "flexible";

export interface ServiceConfigItem {
  id: string;
  name: string;
  category: "vet" | "spa" | "boarding" | "training";
  price: number;
  durationMinutes: number;
  paymentPolicy: PaymentPolicy;
  /** % đặt cọc khi chọn linh hoạt */
  depositPercent: number;
  active: boolean;
}

export const PAYMENT_POLICY_LABEL: Record<PaymentPolicy, string> = {
  prepaid: "Trả trước khi đặt lịch",
  postpaid: "Trả sau khi hoàn thành",
  flexible: "Linh hoạt (cọc hoặc trả sau)",
};

function parseServiceDurationMinutes(durationVi: string, id: string): number {
  if (id === "boarding" || durationVi.toLowerCase().includes("đêm")) {
    return 1440;
  }
  const nums = durationVi.match(/\d+/g);
  if (!nums || nums.length === 0) return 45;
  return Number(nums[nums.length - 1]) || 45;
}

export const SEED_SERVICE_CONFIG: ServiceConfigItem[] = SERVICES_DATA.map((svc) => {
  const paymentPolicy: PaymentPolicy = svc.defaultPaymentTiming ?? "postpaid";
  return {
    id: svc.id,
    name: svc.name.vi,
    category: svc.category,
    price: svc.priceFrom,
    durationMinutes: parseServiceDurationMinutes(svc.duration.vi, svc.id),
    paymentPolicy,
    depositPercent: paymentPolicy === "prepaid" ? 100 : 0,
    active: true,
  };
});

/* ------------------------------------------------------------------ */
/* Tiến trình dịch vụ & chính sách hủy/đổi lịch (Mục 2, 5)              */
/* ------------------------------------------------------------------ */

export const SERVICE_PROGRESS_STEPS = [
  "Chờ xác nhận",
  "Đã tiếp nhận thú cưng",
  "Đang thực hiện dịch vụ",
  "Đã hoàn tất chăm sóc",
  "Đã bàn giao cho chủ",
] as const;

export interface ServiceProgressEntry {
  step: number;
  history: { step: number; at: string; by: string }[];
}

export type ServiceProgressMap = Record<string, ServiceProgressEntry>;

export interface CancellationAssessment {
  hoursBefore: number;
  zone: "free" | "exception" | "penalty";
  feePercent: number;
  label: string;
}

/** Lấy giờ bắt đầu từ timeSlot dạng "08:30 - 10:00" hoặc "08:30". */
export function parseBookingStart(date: string, timeSlot?: string): Date | null {
  if (!date) return null;
  const match = (timeSlot || "").match(/(\d{1,2}):(\d{2})/);
  const hh = match ? match[1].padStart(2, "0") : "08";
  const mm = match ? match[2] : "00";
  const d = new Date(`${date}T${hh}:${mm}:00`);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Chính sách hủy/đổi lịch:
 * - Hủy trước giờ hẹn: miễn phí 100% (không phạt phí).
 * - Đơn thanh toán trước: hoàn tiền 100%.
 * - Đơn thanh toán sau: hủy trực tiếp tại quầy 0đ.
 */
export function assessCancellation(start: Date | null, now: Date = new Date()): CancellationAssessment {
  if (!start) {
    return { hoursBefore: Infinity, zone: "free", feePercent: 0, label: "Không xác định giờ hẹn – miễn phí" };
  }
  const hoursBefore = (start.getTime() - now.getTime()) / 3_600_000;
  if (hoursBefore > 0) {
    return { hoursBefore, zone: "free", feePercent: 0, label: "Hủy trước giờ hẹn – Miễn phí 100% (0đ)" };
  }
  return {
    hoursBefore,
    zone: "exception",
    feePercent: 0,
    label: "Đã qua giờ hẹn – Quản lý xem xét",
  };
}

/* ------------------------------------------------------------------ */
/* Đơn nhập hàng từ Supplier – Purchase Orders (Mục 5, 7)              */
/* ------------------------------------------------------------------ */

export type PurchaseOrderStatus =
  | "sent"
  | "supplier_confirmed"
  | "supplier_adjusted"
  | "supplier_rejected"
  | "delivering"
  | "received_partial"
  | "received";

export const PO_STATUS_LABEL: Record<PurchaseOrderStatus, string> = {
  sent: "Đã gửi NCC",
  supplier_confirmed: "NCC đã xác nhận",
  supplier_adjusted: "NCC điều chỉnh SL",
  supplier_rejected: "NCC từ chối",
  delivering: "Đang giao hàng",
  received_partial: "Nhập thiếu (Đối soát)",
  received: "Đã nhập kho",
};

export interface NewProductPOMeta {
  name: string;
  category: "food" | "care" | "toys" | "accessories" | "medicine";
  retailPrice: number;
  requiresPrescription: boolean;
}

export interface PurchaseOrderLine {
  productId: string;
  productName: string;
  quantity: number;
  /** Số lượng NCC xác nhận (nếu điều chỉnh) */
  confirmedQuantity?: number;
  /** Số lượng thực nhận tại kho sau kiểm đếm */
  receivedQuantity?: number;
  unitCost: number;
  /** Thông tin SKU mới nếu mặt hàng chưa có trong kho */
  newProductMeta?: NewProductPOMeta;
}

export interface PurchaseOrder {
  id: string;
  code: string;
  supplierName: string;
  lines: PurchaseOrderLine[];
  status: PurchaseOrderStatus;
  createdAt: string;
  expectedDate: string;
  receivedAt?: string;
  note?: string;
  /** Ghi chú đối soát khi kiểm đếm thực tế ít hơn số NCC báo giao */
  discrepancyNote?: string;
}

export const SUPPLIER_OPTIONS = [
  "Công ty TNHH Royal Canin Việt Nam",
  "Công ty CP Dược Thú Y Vemedim",
  "Petcare Accessories Co.",
];

export const SEED_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "po-1",
    code: "PO-202611-001",
    supplierName: "Công ty TNHH Royal Canin Việt Nam",
    lines: [{ productId: "p-seed-1", productName: "Hạt Royal Canin Mini Adult 2kg", quantity: 30, unitCost: 320000 }],
    status: "delivering",
    createdAt: "2026-11-05",
    expectedDate: "2026-11-13",
  },
  {
    id: "po-2",
    code: "PO-202611-002",
    supplierName: "Công ty CP Dược Thú Y Vemedim",
    lines: [
      { productId: "p-seed-2", productName: "Thuốc tẩy giun Vemedim", quantity: 50, confirmedQuantity: 40, unitCost: 45000 },
    ],
    status: "supplier_adjusted",
    createdAt: "2026-11-08",
    expectedDate: "2026-11-15",
    note: "NCC chỉ còn 40 hộp trong kho",
  },
  {
    id: "po-3",
    code: "PO-202611-003",
    supplierName: "Petcare Accessories Co.",
    lines: [{ productId: "p-seed-3", productName: "Vòng cổ phản quang size M", quantity: 20, unitCost: 65000 }],
    status: "sent",
    createdAt: "2026-11-11",
    expectedDate: "2026-11-18",
  },
];

export function poTotal(po: PurchaseOrder): number {
  return po.lines.reduce(
    (s, l) => s + (l.receivedQuantity ?? l.confirmedQuantity ?? l.quantity) * l.unitCost,
    0
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export const formatVnd = (n: number) => `${Math.round(n).toLocaleString("vi-VN")}đ`;
export const todayIso = () => new Date().toISOString().split("T")[0];

