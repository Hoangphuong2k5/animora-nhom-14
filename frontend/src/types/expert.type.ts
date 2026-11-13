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
  specialties: string[];
  certificates: ExpertCertificate[];
  /** [Bác sĩ] Số chứng chỉ hành nghề thú y — chỉ đọc, Admin xác nhận */
  licenseNumber?: string;
  licenseVerified?: boolean;
  yearsOfExperience?: number;
  bio: string;
  joinedAt: string;
  baseSalary: number;
  commissionRate: number;
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

export type ShiftCode = "morning" | "afternoon" | "evening";

export interface ExpertShift {
  id: string;
  expertId: string;
  date: string;
  shift: ShiftCode;
}

export type ShiftRequestStatus = "pending" | "approved" | "rejected";

export interface ShiftRequest {
  id: string;
  expertId: string;
  kind: "shift" | "leave";
  date: string;
  shift?: ShiftCode;
  reason: string;
  status: ShiftRequestStatus;
  createdAt: string;
  adminNote?: string;
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

export interface PayrollMonth {
  expertId: string;
  /** "YYYY-MM" */
  month: string;
  baseSalary: number;
  commission: number;
  ratingBonus: number;
  deductions: number;
  status: "paid" | "processing" | "estimated";
  paidAt?: string;
  completedBookings: number;
  avgRating: number;
}

export type ExpertNotificationType =
  | "new_booking"
  | "booking_changed"
  | "booking_cancelled"
  | "new_review"
  | "shift_result"
  | "salary_paid";

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

