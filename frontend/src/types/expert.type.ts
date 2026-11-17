import type { ExpertType } from "@/constants/roles.constant";

export type { ExpertType };

export type ExpertAppointmentStatus =
  | "pending"
  | "upcoming"
  | "in_progress"
  | "completed"
  | "cancelled";

export type PaymentTiming = "prepaid" | "postpaid";
export type PaymentState = "paid" | "unpaid" | "refunded" | "partial_fee";

export type PetSpeciesCode = "dog" | "cat" | "rabbit" | "hamster";

export type ExpertCertificateStatus = "approved" | "pending" | "rejected";
export type EmploymentType = "full_time" | "part_time";

export interface ExpertCertificate {
  id: string;
  name: string;
  issuer: string;
  year: number;
  status?: ExpertCertificateStatus;
  scanUrl?: string;
  rejectReason?: string;
}

export interface ExpertProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  expertType: ExpertType;
  /** Loại hình nhân sự: full_time hoặc part_time (áp dụng rõ nhất cho NV chăm sóc thú cưng) */
  employmentType?: EmploymentType;
  specialties: string[];
  certificates: ExpertCertificate[];
  /** [Bác sĩ] Số chứng chỉ hành nghề thú y — chỉ đọc, Admin xác nhận */
  licenseNumber?: string;
  licenseVerified?: boolean;
  yearsOfExperience?: number;
  bio: string;
  joinedAt: string;
}

export interface ExpertPetOwner {
  id: string;
  fullName: string;
  phone: string;
  email: string;
}

export interface ExpertPet {
  id: string;
  name: string;
  species: PetSpeciesCode;
  breed: string;
  gender: "male" | "female";
  birthDate: string;
  weightKg: number;
  photo: string;
  ownerId: string;
  ownerNote?: string;
  allergies?: string;
  createdByExpertId?: string;
}

export interface ExpertServiceDef {
  id: string;
  name: { vi: string; en: string };
  durationMin: number;
  price: number;
  /** Dịch vụ thuộc nhóm khám bệnh (mở Ghi bệnh án / Kê đơn cho bác sĩ) */
  medical: boolean;
  expertTypes: ExpertType[];
}

export interface AppointmentHistoryEntry {
  at: string;
  status:
    | ExpertAppointmentStatus
    | "rescheduled"
    | "reschedule_requested"
    | "cancel_requested";
  note: { vi: string; en: string };
}

export type CareServiceStage =
  | "checked_in"
  | "performing"
  | "finishing"
  | "ready_handover";

export interface ServiceProgressEntry {
  stage: CareServiceStage;
  updatedAt: string;
  note?: string;
  updatedBy: string;
}

export interface ExpertAppointment {
  id: string;
  code: string;
  expertId: string;
  petId: string;
  ownerId: string;
  serviceId: string;
  /** ISO "YYYY-MM-DDTHH:mm" theo giờ địa phương */
  startAt: string;
  status: ExpertAppointmentStatus;
  paymentTiming: PaymentTiming;
  paymentState: PaymentState;
  customerNote?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  completionNote?: string;
  petConditionAfter?: string;
  followUpDate?: string;
  /** Tiến trình 4 bước thực hiện dịch vụ chăm sóc */
  careStage?: CareServiceStage;
  careProgressLog?: ServiceProgressEntry[];
  /** Xác nhận của Manager cho trạng thái/kết quả dịch vụ */
  managerConfirmedAt?: string;
  managerConfirmedBy?: string;
  managerConfirmNote?: string;
  rejectReason?: string;
  cancelledAt?: string;
  cancelledBy?: "customer" | "expert" | "admin";
  cancelReason?: string;
  /** Chuyên viên gửi yêu cầu lên Admin xin điều phối người thay hoặc duyệt hủy lịch */
  cancelRequest?: {
    reason: string;
    requestedAt: string;
    status: "pending_admin" | "approved" | "reassigned";
  };
  /** Khách gửi yêu cầu đổi lịch */
  rescheduleRequest?: { requestedStartAt: string; reason: string };
  /** Chuyên viên đề xuất giờ khác */
  proposedStartAt?: string;
  previousStartAt?: string;
  medicalRecordId?: string;
  prescriptionId?: string;
  history: AppointmentHistoryEntry[];
}

export type ShiftCode = "morning" | "afternoon";

export type ShiftAssignmentType =
  | "fixed"
  | "rotational_off"
  | "extra_shift";

export interface ExpertShift {
  id: string;
  expertId: string;
  date: string;
  shift: ShiftCode;
  /** Loại ca: ca cố định do Quản lý xếp, ngày nghỉ luân phiên, hoặc ca làm thêm (part-time) */
  shiftType?: ShiftAssignmentType;
}

export type ShiftRequestStatus = "pending" | "approved" | "rejected";
export type ShiftRequestKind =
  | "extra_shift"
  | "leave"
  | "shift_swap";
export type LeaveReasonType = "rotational" | "sick" | "unpaid";

export interface ShiftRequest {
  id: string;
  expertId: string;
  /** "extra_shift" (ca làm thêm part-time), "leave" (xin nghỉ phép cả ngày), "shift_swap" (xin đổi ca part-time) */
  kind: ShiftRequestKind;
  leaveType?: LeaveReasonType;
  date: string;
  shift?: ShiftCode;
  targetSwapDate?: string;
  targetSwapShift?: ShiftCode;
  extraShiftHours?: number;
  reason: string;
  status: ShiftRequestStatus;
  createdAt: string;
  adminNote?: string;
  /** Cờ cảnh báo nghiệp vụ gửi Manager duyệt */
  policyWarnings?: string[];
  exceedsMonthlyLeaveLimit?: boolean;
}

export type HealthEntryKind = "vaccine" | "deworm" | "illness" | "service_note";

export interface HealthEntry {
  id: string;
  petId: string;
  kind: HealthEntryKind;
  date: string;
  title: string;
  detail?: string;
  nextDueDate?: string;
  authorId?: string;
  authorName?: string;
}

export interface WeightLog {
  petId: string;
  date: string;
  weightKg: number;
}

export type DiseaseSeverity = "mild" | "severe";

export interface MedicalRecord {
  id: string;
  petId: string;
  appointmentId?: string;
  expertId: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  severity: DiseaseSeverity;
  weightKg: number;
  temperatureC: number;
  note?: string;
  nextVaccineDate?: string;
  nextDewormDate?: string;
  revisitDate?: string;
  prescriptionId?: string;
}

export interface MedicineItem {
  id: string;
  /** ID sản phẩm tương ứng trong danh mục Shop (SHOP_PRODUCTS) */
  shopProductId: string;
  name: string;
  activeIngredient: string;
  form: string;
  unit: string;
  price: number;
  stock: number;
  requiresPrescription: true;
  speciesHint: PetSpeciesCode[];
}

export interface PrescriptionLine {
  medicineId: string;
  dosage: string;
  days: number;
  instruction: string;
}

export type PrescriptionStatus = "active" | "exhausted" | "needs_revisit" | "expired";

export interface RefillLogEntry {
  at: string;
  orderCode: string;
  amount: number;
}

export interface Prescription {
  id: string;
  code: string;
  expertId: string;
  petId: string;
  ownerId: string;
  appointmentId?: string;
  medicalRecordId?: string;
  issuedAt: string;
  diagnosis: string;
  severity: DiseaseSeverity;
  lines: PrescriptionLine[];
  refillsAllowed: number;
  refillInstruction?: string;
  refillsUsed: number;
  refillLog: RefillLogEntry[];
  note?: string;
}

export interface ExpertReview {
  id: string;
  expertId: string;
  appointmentId: string;
  ownerId: string;
  serviceId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string;
  reported?: { reason: string; at: string; status: "sent" | "resolved" };
}

export type ExpertNotificationType =
  | "new_booking"
  | "booking_changed"
  | "booking_cancelled"
  | "new_review"
  | "shift_result"
  | "medicine_box_result";

export type MedicineBoxCategory = "medicine" | "vaccine";

export interface MedicineBoxItem {
  /** Mã thuốc chuẩn (med-001..., vac-001...) hoặc productId nếu là mặt hàng mới từ kho */
  id: string;
  shopProductId: string;
  itemType: MedicineBoxCategory;
  name: string;
  activeIngredient: string;
  form: string;
  unit: string;
  speciesHint: PetSpeciesCode[];
  /** Số lượng hiện đang có trên kệ cá nhân của bác sĩ */
  shelfStock: number;
  /** Số lượng hiện đang có trong kho chung (chưa phân bổ) */
  warehouseStock: number;
  /** Ngưỡng cảnh báo sắp hết trên kệ */
  minShelfThreshold: number;
  /** Mặt hàng mới được nhập vào kho nhưng chưa từng lên kệ (shelfStock = 0) */
  isNewInWarehouse?: boolean;
  /** True nếu sản phẩm đã bị Quản lý ngừng kinh doanh khỏi danh mục Shop */
  isHidden?: boolean;
  lastUpdatedAt: string;
}

export type MedicineBoxRequestType = "add" | "remove" | "discontinue";
export type MedicineBoxRequestStatus = "pending" | "approved" | "rejected";

export interface MedicineBoxRequest {
  id: string;
  expertId: string;
  expertName: string;
  type: MedicineBoxRequestType;
  itemType?: MedicineBoxCategory;
  /** ID thuốc/vắc-xin trong kho / kệ (nếu chọn mặt hàng có sẵn) */
  medicineId?: string;
  shopProductId?: string;
  medicineName: string;
  activeIngredient?: string;
  unit: string;
  quantity: number;
  /** True nếu bác sĩ đề xuất nhập thuốc mới chưa có trong kho */
  isNewMedicineProposal?: boolean;
  /** True nếu yêu cầu xóa toàn bộ thuốc này khỏi kệ */
  removeAll?: boolean;
  /** True nếu xóa khỏi kệ để hoàn trả về kho (ngược lại là xuất hủy / hết hạn) */
  returnToWarehouse?: boolean;
  /** Hành động đề xuất với danh mục Shop khi type === "discontinue" */
  discontinueAction?: "hide" | "delete";
  reason: string;
  status: MedicineBoxRequestStatus;
  createdAt: string;
  reviewedAt?: string;
  adminNote?: string;
}

export type MedicineBoxLogAction =
  | "po_allocation"
  | "request_add"
  | "usage"
  | "remove_return"
  | "remove_dispose"
  | "discontinue";

export interface MedicineBoxLogEntry {
  id: string;
  expertId: string;
  expertName: string;
  shopProductId: string;
  medicineName: string;
  unit: string;
  action: MedicineBoxLogAction;
  quantityDelta: number;
  beforeShelfStock: number;
  afterShelfStock: number;
  actorLabel: string;
  referenceCode?: string;
  note?: string;
  createdAt: string;
}

export interface ExpertNotification {
  id: string;
  expertId: string;
  type: ExpertNotificationType;
  title: { vi: string; en: string };
  body: { vi: string; en: string };
  at: string;
  unread: boolean;
  href?: string;
}

/** Toàn bộ dữ liệu có thể thay đổi của 1 chuyên viên, được lưu trong localStorage */
export interface ExpertStoreState {
  version: number;
  appointments: ExpertAppointment[];
  shifts: ExpertShift[];
  shiftRequests: ShiftRequest[];
  healthEntries: HealthEntry[];
  weightLogs: WeightLog[];
  medicalRecords: MedicalRecord[];
  prescriptions: Prescription[];
  reviews: ExpertReview[];
  notifications: ExpertNotification[];
  profile: ExpertProfile;
}

