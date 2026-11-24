import type { BookingWeightRangeId } from "@/types";

export const RECEPTIONIST_STORAGE_KEYS = {
  walkInCustomers: "animora_receptionist_customers_v1",
  walkInPets: "animora_receptionist_pets_v1",
  auditLogs: "animora_receptionist_audit_logs_v1",
  manualLedgers: "animora_receptionist_manual_ledgers_v1",
  invoices: "animora_receptionist_invoices_v1",
  leaveRequests: "animora_receptionist_leave_requests_v1",
} as const;

export const RECEPTIONIST_SYNC_EVENT = "animora_receptionist_sync";

/** 4 loài hợp lệ duy nhất theo Animora v1.4 (Mục 1 & Mục 3) */
export const ALLOWED_V14_SPECIES = ["Chó", "Mèo", "Chuột", "Thỏ"] as const;
export type AllowedV14Species = (typeof ALLOWED_V14_SPECIES)[number];

export interface WalkInCustomerRecord {
  id: string;
  fullName: string;
  /** SĐT đã chuẩn hóa 10 số (0xxxxxxxxx) */
  phone: string;
  email?: string;
  isWalkInGuest: boolean;
  hasWebAccount: boolean;
  webAccountMethod?: "otp" | "password";
  webAccountActivatedAt?: string;
  createdBy: string;
  createdAt: string;
}

export interface WalkInPetRecord {
  id: string;
  customerId: string;
  ownerName: string;
  ownerPhone: string;
  name: string;
  species: AllowedV14Species;
  breed: string;
  gender: "Đực" | "Cái";
  age: string;
  weightKg: number;
  allergies: string;
  behaviorNote?: string;
  neutered?: boolean;
  /** Mục 3: Cân nặng và dị ứng do LT nhập tính là "do khách khai", BS cập nhật sau */
  declarationSource: "customer_declared" | "vet_locked";
  lockedByVet: boolean;
  isHidden?: boolean;
  createdBy: string;
  createdAt: string;
}

export type ReceptionistAuditActionType =
  | "customer_create"
  | "web_account_activate"
  | "pet_create"
  | "booking_create"
  | "booking_checkin"
  | "booking_delay_30m"
  | "booking_reschedule"
  | "booking_cancel"
  | "booking_noshow"
  | "booking_undo_noshow"
  | "weight_price_adjust"
  | "weight_price_decline"
  | "payment_collect"
  | "manual_refund_compensation"
  | "invoice_issue"
  | "leave_request_submit"
  | "leave_request_cancel"
  | "leave_request_review";

export type ReceptionistLeaveType = "rotational" | "sick" | "unpaid";

export interface ReceptionistLeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  staffEmail: string;
  /** Ngày nghỉ nguyên ngày (YYYY-MM-DD) */
  date: string;
  leaveType: ReceptionistLeaveType;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  managerNote?: string;
  exceedsMonthlyLeaveLimit?: boolean;
  policyWarnings?: string[];
}

export interface ReceptionistAuditLogEntry {
  id: string;
  action: ReceptionistAuditActionType;
  actionLabel: string;
  actorId: string;
  actorName: string;
  targetCode?: string;
  customerName?: string;
  customerPhone?: string;
  beforeState: string;
  afterState: string;
  reason?: string;
  createdAt: string;
}

export interface ManualRefundCompensationEntry {
  id: string;
  code: string;
  bookingId: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  kind: "refund" | "surcharge";
  amount: number;
  method: "cash" | "vnpay" | "payos" | "bank_transfer";
  reason: string;
  processedBy: string;
  createdAt: string;
}

export interface ServiceInvoiceRecord {
  id: string;
  invoiceCode: string;
  bookingId: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  petName: string;
  petSpecies: string;
  serviceName: string;
  bookingChannel: "online" | "counter";
  paymentTiming: "prepaid" | "postpaid";
  paymentMethod: "cash" | "bank_transfer" | "vnpay" | "payos";
  originalPrice: number;
  declaredWeightKg?: number;
  actualWeightKg?: number;
  weightDifferenceAmount: number;
  finalAmount: number;
  issuedBy: string;
  issuedAt: string;
  note?: string;
}

export interface CustomerViolationAssessment {
  phone: string;
  violationCount: number;
  lateCancelCount: number;
  noShowCount: number;
  prepaidCompletedSinceLock: number;
  isPostpaidLocked: boolean;
  /** Mốc thời điểm mở khóa trả sau gần nhất (tương ứng violation_reset_at ở DB) */
  postpaidUnlockedAt?: string | null;
  hasWarning: boolean;
  warningMessage: string | null;
  lockReasonMessage: string | null;
}

export interface WeightPriceAdjustmentQuote {
  bookingId: string;
  serviceName: string;
  dependsOnWeight: boolean;
  oldWeightKg: number;
  newWeightKg: number;
  oldWeightRange: BookingWeightRangeId;
  newWeightRange: BookingWeightRangeId;
  oldPrice: number;
  newPrice: number;
  differenceAmount: number;
  isPriceChanged: boolean;
  paymentTiming: "prepaid" | "postpaid";
  financialAction:
    | "no_change"
    | "postpaid_update"
    | "prepaid_surcharge"
    | "prepaid_refund";
  financialSummary: string;
}

/** Helper dùng chung tạo bản ghi Audit Log (loại bỏ lặp code tạo ID ở các hàm nghiệp vụ) */
export function createAuditLogEntry(params: {
  action: ReceptionistAuditActionType;
  actionLabel: string;
  actorId?: string;
  actorName: string;
  targetCode?: string;
  customerName?: string;
  customerPhone?: string;
  beforeState: string;
  afterState: string;
  reason?: string;
  now?: Date;
}): ReceptionistAuditLogEntry {
  const now = params.now || new Date();
  return {
    id: `aud-${now.getTime()}-${Math.floor(Math.random() * 1000)}`,
    action: params.action,
    actionLabel: params.actionLabel,
    actorId: params.actorId || "rec-01",
    actorName: params.actorName,
    targetCode: params.targetCode,
    customerName: params.customerName,
    customerPhone: params.customerPhone,
    beforeState: params.beforeState,
    afterState: params.afterState,
    reason: params.reason,
    createdAt: now.toISOString(),
  };
}

// ============================================================================
// SEED DATA KHỞI TẠO CHO QUẦY LỄ TÂN
// ============================================================================

export const INITIAL_WALK_IN_CUSTOMERS: WalkInCustomerRecord[] = [
  {
    id: "cus-walkin-1",
    fullName: "Phan Thị Đinh Thùy",
    phone: "0337203332",
    email: "phanthidinhthuy6@gmail.com",
    isWalkInGuest: false,
    hasWebAccount: true,
    webAccountMethod: "password",
    createdBy: "Hệ thống",
    createdAt: "2026-01-15T08:00:00.000Z",
  },
  {
    id: "cus-walkin-2",
    fullName: "Nguyễn Minh Anh",
    phone: "0901234567",
    email: "minhanh.ng@gmail.com",
    isWalkInGuest: false,
    hasWebAccount: true,
    webAccountMethod: "password",
    createdBy: "Hệ thống",
    createdAt: "2026-02-04T09:00:00.000Z",
  },
  {
    id: "cus-walkin-3",
    fullName: "Cô Nguyễn Thị Bạch Tuyết",
    phone: "0915888999",
    isWalkInGuest: true,
    hasWebAccount: false,
    createdBy: "LT. Trần Ngọc Bảo Trâm",
    createdAt: "2026-11-20T08:30:00.000Z",
  },
  {
    id: "cus-walkin-4",
    fullName: "Chú Lê Văn Hòa",
    phone: "0984111222",
    isWalkInGuest: true,
    hasWebAccount: false,
    createdBy: "LT. Trần Ngọc Bảo Trâm",
    createdAt: "2026-11-21T09:15:00.000Z",
  },
];

export const INITIAL_WALK_IN_PETS: WalkInPetRecord[] = [
  {
    id: "wpet-1",
    customerId: "cus-walkin-3",
    ownerName: "Cô Nguyễn Thị Bạch Tuyết",
    ownerPhone: "0915888999",
    name: "Lu",
    species: "Chó",
    breed: "Poodle",
    gender: "Đực",
    age: "2 tuổi",
    weightKg: 4.5,
    allergies: "Sợ tiếng máy sấy lớn (Do khách khai)",
    behaviorNote: "Hiền, thích được gãi cổ",
    neutered: true,
    declarationSource: "customer_declared",
    lockedByVet: false,
    isHidden: false,
    createdBy: "LT. Trần Ngọc Bảo Trâm",
    createdAt: "2026-11-20T08:31:00.000Z",
  },
  {
    id: "wpet-2",
    customerId: "cus-walkin-4",
    ownerName: "Chú Lê Văn Hòa",
    ownerPhone: "0984111222",
    name: "Mướp",
    species: "Mèo",
    breed: "Mèo Ta",
    gender: "Cái",
    age: "1 tuổi",
    weightKg: 3.8,
    allergies: "Dị ứng cá biển (Do khách khai)",
    declarationSource: "customer_declared",
    lockedByVet: false,
    isHidden: false,
    createdBy: "LT. Trần Ngọc Bảo Trâm",
    createdAt: "2026-11-21T09:16:00.000Z",
  },
];

export const INITIAL_RECEPTIONIST_AUDIT_LOGS: ReceptionistAuditLogEntry[] = [
  {
    id: "aud-seed-1",
    action: "customer_create",
    actionLabel: "Tạo hồ sơ khách vãng lai",
    actorId: "rec-01",
    actorName: "LT. Trần Ngọc Bảo Trâm",
    targetCode: "cus-walkin-3",
    customerName: "Cô Nguyễn Thị Bạch Tuyết",
    customerPhone: "0915888999",
    beforeState: "Chưa có hồ sơ khách",
    afterState:
      "Khách vãng lai: Cô Nguyễn Thị Bạch Tuyết (0915 888 999) • Không mật khẩu",
    createdAt: "2026-11-20T08:30:00.000Z",
  },
  {
    id: "aud-seed-2",
    action: "pet_create",
    actionLabel: "Tạo hồ sơ thú cưng nhanh (Khách vãng lai)",
    actorId: "rec-01",
    actorName: "LT. Trần Ngọc Bảo Trâm",
    targetCode: "wpet-1",
    customerName: "Cô Nguyễn Thị Bạch Tuyết",
    customerPhone: "0915888999",
    beforeState: "Chưa có hồ sơ thú cưng",
    afterState: "Bé Lu (Chó • 4.5kg [Do khách khai])",
    createdAt: "2026-11-20T08:31:00.000Z",
  },
];
