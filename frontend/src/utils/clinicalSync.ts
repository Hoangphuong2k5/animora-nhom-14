import {
  SEED_EXPERTS,
  SEED_HEALTH_ENTRIES,
  SEED_MEDICAL_RECORDS,
  SEED_OWNERS,
  SEED_PETS,
  SEED_PRESCRIPTIONS,
  getInitialExpertStore,
} from "@/data/expertPortalData";
import { MEDICINE_CATALOG } from "@/data/medicineCatalog";
import { SHOP_PRODUCTS } from "@/data/shopData";
import { formatDateDdMmYyyy, getTodayLocalIso } from "@/utils/dateFormat";
import type { CareRecord, WeightLog as CustomerWeightLog } from "@/data/petProfilesData";
import type { Booking, BookingReview, Product } from "@/types/animora.type";
import type {
  CareServiceStage,
  ExpertAppointment,
  ExpertCertificate,
  ExpertNotification,
  ExpertPet,
  ExpertProfile,
  ExpertReview,
  ExpertShift,
  ExpertStoreState,
  HealthEntry,
  MedicalRecord,
  Prescription,
  ShiftAssignmentType,
  ShiftCode,
  ShiftRequest,
} from "@/types/expert.type";

export const VET_EXPERT_IDS = ["exp-vet-01", "exp-vet-02", "exp-vet-03"] as const;
export const EXPERT_IDS = ["exp-vet-01", "exp-vet-02", "exp-vet-03", "exp-spa-01", "exp-spa-02"] as const;
export type KnownExpertId = (typeof EXPERT_IDS)[number];

export const VET_STORE_STORAGE_KEY = "animora_expert_store_v2_exp-vet-01";
export const EXPERT_PETS_STORAGE_KEY = "animora_expert_pets_v2";
export const ADMIN_BOOKINGS_STORAGE_KEY = "animora_bookings_v2";
export const ADMIN_BOOKINGS_SYNC_EVENT = "animora_bookings_sync";
export const EXPERT_SYNC_EVENT = "animora_expert_sync";
export const PET_SYNC_EVENT = "animora_pet_sync";

export function readExpertPetsRegistry(): ExpertPet[] {
  if (typeof window === "undefined") return SEED_PETS;
  try {
    const raw = window.localStorage.getItem(EXPERT_PETS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as ExpertPet[];
      }
    }
  } catch {
    // ignore storage errors
  }
  return SEED_PETS;
}

export function writeExpertPetsRegistry(pets: ExpertPet[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(EXPERT_PETS_STORAGE_KEY, JSON.stringify(pets));
    window.dispatchEvent(new Event(EXPERT_SYNC_EVENT));
    window.dispatchEvent(new Event(PET_SYNC_EVENT));
  } catch {
    // ignore storage errors
  }
}

export function getExpertStorageKey(expertId: string): string {
  return `animora_expert_store_v2_${expertId}`;
}

/**
 * Cầu nối ánh xạ ID thú cưng giữa Portal Khách hàng (pet-1..pet-6)
 * và Portal Bác sĩ (pet-001..pet-008) để hiển thị đồng bộ real-time qua localStorage.
 */
const CUSTOMER_TO_EXPERT_PET_IDS: Record<string, string[]> = {
  "pet-1": ["pet-002", "pet-006", "pet-008"], // Mèo (Mây Mây <-> Miu Miu / Lili / Bánh Bao)
  "pet-2": ["pet-001", "pet-005"], // Bơ (Chó)
  "pet-3": ["pet-004"], // Thỏ (Bông Gòn <-> Chibi)
  "pet-6": ["pet-003", "pet-007"], // Poodle / Chó nhỏ
};

export function resolveExpertPetIdsForCustomerPet(
  customerPetId: string,
  customerPetName?: string
): string[] {
  const mapped = new Set<string>(CUSTOMER_TO_EXPERT_PET_IDS[customerPetId] ?? []);
  mapped.add(customerPetId);

  if (customerPetName) {
    const clean = customerPetName.trim().toLowerCase();
    for (const sp of SEED_PETS) {
      if (sp.name.trim().toLowerCase() === clean) {
        mapped.add(sp.id);
      }
    }
  }

  return Array.from(mapped);
}

export function readExpertStore(expertId: string): ExpertStoreState {
  return readExpertStoreByKey(expertId, getExpertStorageKey(expertId));
}

export function writeExpertStore(
  expertId: string,
  nextStore: ExpertStoreState
): void {
  writeExpertStoreByKey(getExpertStorageKey(expertId), nextStore);
}

export function readVetStoreSnapshot(): ExpertStoreState {
  return readExpertStore("exp-vet-01");
}

export function writeVetStoreSnapshot(nextStore: ExpertStoreState): void {
  writeExpertStore("exp-vet-01", nextStore);
}

export function readAllVetStores(): Array<{ expertId: string; store: ExpertStoreState }> {
  return VET_EXPERT_IDS.map((expertId) => ({
    expertId,
    store: readExpertStore(expertId),
  }));
}

function resolveCatalogPriceAndName(medicineId: string): { name: string; price: number } {
  const staticMed = MEDICINE_CATALOG.find((m) => m.id === medicineId);
  if (staticMed) {
    return { name: staticMed.name, price: staticMed.price };
  }
  let shopProducts: Product[] = SHOP_PRODUCTS;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem("animora_shop_products_v2");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          shopProducts = parsed as Product[];
        }
      }
    } catch {
      // ignore storage errors
    }
  }
  const prod = shopProducts.find((p) => p.id === medicineId);
  if (prod) {
    return { name: prod.name, price: prod.price };
  }
  return { name: medicineId, price: 0 };
}

export function getSyncedMedicalRecordsForCustomerPet(
  customerPetId: string,
  customerPetName?: string
): MedicalRecord[] {
  const targetIds = new Set(
    resolveExpertPetIdsForCustomerPet(customerPetId, customerPetName)
  );
  const recordMap = new Map<string, MedicalRecord>();
  for (const { store } of readAllVetStores()) {
    for (const r of store.medicalRecords) {
      if (targetIds.has(r.petId)) {
        recordMap.set(r.id, r);
      }
    }
  }
  const records =
    recordMap.size > 0
      ? Array.from(recordMap.values())
      : SEED_MEDICAL_RECORDS.filter((r) => targetIds.has(r.petId));
  return records.sort((a, b) => b.date.localeCompare(a.date));
}

export function getSyncedPrescriptionsForCustomerPet(
  customerPetId: string,
  customerPetName?: string
): Prescription[] {
  const targetIds = new Set(
    resolveExpertPetIdsForCustomerPet(customerPetId, customerPetName)
  );
  const rxMap = new Map<string, Prescription>();
  for (const { store } of readAllVetStores()) {
    for (const rx of store.prescriptions) {
      if (targetIds.has(rx.petId)) {
        rxMap.set(rx.id, rx);
      }
    }
  }
  const prescriptions =
    rxMap.size > 0
      ? Array.from(rxMap.values())
      : SEED_PRESCRIPTIONS.filter((rx) => targetIds.has(rx.petId));
  return prescriptions.sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
}

function mapHealthEntryToCareRecord(
  entry: HealthEntry,
  customerPetId: string
): CareRecord {
  const type: CareRecord["type"] =
    entry.kind === "vaccine"
      ? "vaccine"
      : entry.kind === "deworm"
      ? "deworm"
      : entry.kind === "illness"
      ? "checkup"
      : "spa";

  return {
    id: `vet-sync-${entry.id}`,
    pet: customerPetId,
    type,
    name: entry.title,
    date: entry.date,
    nextDueDate: entry.nextDueDate,
    notes: entry.authorName
      ? `${entry.detail ? `${entry.detail} • ` : ""}Cập nhật bởi ${entry.authorName}`
      : entry.detail,
    status: entry.nextDueDate ? "upcoming" : "done",
  };
}

function mapMedicalRecordToCareRecord(
  record: MedicalRecord,
  customerPetId: string
): CareRecord {
  const doctorName =
    SEED_EXPERTS[record.expertId]?.fullName || "Bác sĩ thú y Animora";
  return {
    id: `vet-med-${record.id}`,
    pet: customerPetId,
    type: "checkup",
    name: `Khám bệnh: ${record.diagnosis}`,
    date: record.date,
    nextDueDate: record.revisitDate,
    notes: `Triệu chứng: ${record.symptoms} • Nhiệt độ: ${record.temperatureC}°C • Cân nặng: ${record.weightKg}kg (${doctorName})`,
    status: record.revisitDate ? "upcoming" : "done",
  };
}

/**
 * Chuyển đổi các bản ghi y khoa, lịch tiêm/tẩy giun và ghi chú dịch vụ chăm sóc
 * từ tất cả chuyên viên (Bác sĩ & Nhân viên chăm sóc) sang CareRecord phía Khách hàng.
 */
export function getDoctorCareRecordsForCustomerPet(
  customerPetId: string,
  customerPetName?: string
): CareRecord[] {
  const targetIds = new Set(
    resolveExpertPetIdsForCustomerPet(customerPetId, customerPetName)
  );

  const entryMap = new Map<string, HealthEntry>();
  for (const h of SEED_HEALTH_ENTRIES) {
    if (targetIds.has(h.petId)) entryMap.set(h.id, h);
  }
  for (const expertId of EXPERT_IDS) {
    const st = readExpertStore(expertId);
    for (const h of st.healthEntries) {
      if (targetIds.has(h.petId)) entryMap.set(h.id, h);
    }
  }

  const recordMap = new Map<string, MedicalRecord>();
  for (const { store } of readAllVetStores()) {
    for (const m of store.medicalRecords) {
      if (targetIds.has(m.petId)) {
        recordMap.set(m.id, m);
      }
    }
  }
  const medicalRecords =
    recordMap.size > 0
      ? Array.from(recordMap.values())
      : SEED_MEDICAL_RECORDS.filter((m) => targetIds.has(m.petId));

  const mappedEntries = Array.from(entryMap.values()).map((h) =>
    mapHealthEntryToCareRecord(h, customerPetId)
  );
  const mappedRecords = medicalRecords.map((m) =>
    mapMedicalRecordToCareRecord(m, customerPetId)
  );

  return [...mappedRecords, ...mappedEntries];
}

export function getDoctorWeightLogsForCustomerPet(
  customerPetId: string,
  customerPetName?: string
): CustomerWeightLog[] {
  const targetIds = new Set(
    resolveExpertPetIdsForCustomerPet(customerPetId, customerPetName)
  );
  const dedup = new Map<string, CustomerWeightLog>();
  for (const { store } of readAllVetStores()) {
    store.weightLogs
      .filter((w) => targetIds.has(w.petId))
      .forEach((w, idx) => {
        const key = `${w.petId}|${w.date}|${w.weightKg}`;
        if (!dedup.has(key)) {
          dedup.set(key, {
            id: `vet-wt-${w.petId}-${w.date}-${idx}`,
            pet: customerPetId,
            date: w.date,
            kg: w.weightKg,
          });
        }
      });
  }
  return Array.from(dedup.values());
}

/**
 * Tính tổng tiền ước tính của 1 đơn thuốc dựa trên danh mục thuốc của Shop.
 */
export function computePrescriptionOrderAmount(rx: Prescription): number {
  return rx.lines.reduce((sum, line) => {
    const { price } = resolveCatalogPriceAndName(line.medicineId);
    const units = Math.max(1, Math.ceil((line.days || 1) / 7));
    return sum + price * units;
  }, 0);
}

/**
 * Ghi nhận 1 lượt mua lại thuốc theo đơn sau khi Khách hàng thanh toán thành công tại Shop.
 * Tự động khóa nếu là bệnh nặng (severe) hoặc đã hết lượt mua lại.
 */
export function recordPrescriptionRefillOrder(
  prescriptionId: string,
  orderCode: string,
  amount?: number
): { ok: boolean; reason?: string } {
  let ownerExpertId: string | null = null;
  let ownerStore: ExpertStoreState | null = null;
  let targetRx: Prescription | undefined;

  for (const { expertId, store } of readAllVetStores()) {
    const found = store.prescriptions.find((p) => p.id === prescriptionId);
    if (found) {
      ownerExpertId = expertId;
      ownerStore = store;
      targetRx = found;
      break;
    }
  }

  if (!targetRx || !ownerExpertId || !ownerStore) {
    return { ok: false, reason: "Không tìm thấy đơn thuốc." };
  }
  if (targetRx.severity === "severe" && targetRx.refillsAllowed <= 0) {
    return {
      ok: false,
      reason: "Đơn thuốc bệnh nặng không được phép mua lại từ xa.",
    };
  }
  if (targetRx.refillsUsed >= targetRx.refillsAllowed) {
    return { ok: false, reason: "Đơn thuốc đã hết lượt mua lại." };
  }

  const finalAmount = amount ?? computePrescriptionOrderAmount(targetRx);
  const now = new Date();
  const timestamp = `${getTodayLocalIso(now)} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const nextStore: ExpertStoreState = {
    ...ownerStore,
    prescriptions: ownerStore.prescriptions.map((rx) => {
      if (rx.id !== prescriptionId) return rx;
      return {
        ...rx,
        refillsUsed: rx.refillsUsed + 1,
        refillLog: [
          {
            at: timestamp,
            orderCode,
            amount: finalAmount,
          },
          ...rx.refillLog,
        ],
      };
    }),
  };

  writeExpertStore(ownerExpertId, nextStore);
  return { ok: true };
}

export interface MedicationReminderItem {
  prescriptionId: string;
  prescriptionCode: string;
  diagnosis: string;
  medicineNames: string[];
  dosageSummary: string;
  endDateIso: string;
  daysLeft: number;
}

export function getActiveMedicationReminders(
  prescriptions: Prescription[],
  referenceNow: Date = new Date()
): MedicationReminderItem[] {
  const todayMidnight = new Date(
    referenceNow.getFullYear(),
    referenceNow.getMonth(),
    referenceNow.getDate()
  ).getTime();

  const reminders: MedicationReminderItem[] = [];
  for (const rx of prescriptions) {
    if (!rx.lines || rx.lines.length === 0 || !rx.issuedAt) continue;
    const maxDays = Math.max(...rx.lines.map((l) => l.days || 0), 0);
    if (maxDays <= 0) continue;

    const [y, m, d] = rx.issuedAt.slice(0, 10).split("-").map(Number);
    if (!y || !m || !d) continue;
    const startMs = new Date(y, m - 1, d).getTime();
    const endMs = startMs + maxDays * 24 * 60 * 60 * 1000;
    const daysLeft = Math.ceil((endMs - todayMidnight) / (1000 * 60 * 60 * 24));

    if (daysLeft >= 0) {
      const medicineNames = rx.lines.map(
        (l) => resolveCatalogPriceAndName(l.medicineId).name
      );
      const firstLine = rx.lines[0];
      const endDate = new Date(endMs);
      const endDateIso = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
      reminders.push({
        prescriptionId: rx.id,
        prescriptionCode: rx.code,
        diagnosis: rx.diagnosis,
        medicineNames,
        dosageSummary: `${firstLine.dosage} — ${firstLine.instruction}`,
        endDateIso,
        daysLeft,
      });
    }
  }
  return reminders;
}

function resolveExpertStoreKey(doctorId?: string): {
  expertId: string;
  storageKey: string;
} {
  if (doctorId === "exp-spa-01" || doctorId === "st-2") {
    return { expertId: "exp-spa-01", storageKey: getExpertStorageKey("exp-spa-01") };
  }
  if (doctorId === "exp-spa-02" || doctorId === "st-3") {
    return { expertId: "exp-spa-02", storageKey: getExpertStorageKey("exp-spa-02") };
  }
  if (doctorId && (EXPERT_IDS as readonly string[]).includes(doctorId)) {
    return { expertId: doctorId, storageKey: getExpertStorageKey(doctorId) };
  }
  return { expertId: "exp-vet-01", storageKey: VET_STORE_STORAGE_KEY };
}

function readExpertStoreByKey(expertId: string, storageKey: string): ExpertStoreState {
  if (typeof window === "undefined") {
    return getInitialExpertStore(expertId);
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw) as ExpertStoreState;
      if (parsed.profile?.id !== expertId && SEED_EXPERTS[expertId]) {
        parsed.profile = SEED_EXPERTS[expertId];
      }
      return parsed;
    }
  } catch {
    // ignore storage errors
  }
  return getInitialExpertStore(expertId);
}

function writeExpertStoreByKey(storageKey: string, nextStore: ExpertStoreState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(nextStore));
    window.dispatchEvent(new Event(EXPERT_SYNC_EVENT));
    window.dispatchEvent(new Event(PET_SYNC_EVENT));
  } catch {
    // ignore storage errors
  }
}

function mapBookingServiceToExpertServiceId(
  serviceSlug?: string,
  serviceName?: string
): string {
  const key = `${serviceSlug || ""} ${serviceName || ""}`.toLowerCase();
  if (key.includes("lưu trú") || key.includes("trông giữ") || key.includes("boarding")) {
    return "srv-spa-04";
  }
  if (key.includes("cắt tỉa") || key.includes("tạo kiểu")) return "srv-spa-02";
  if (key.includes("vệ sinh") || key.includes("móng")) return "srv-spa-03";
  if (key.includes("spa") || key.includes("tắm")) return "srv-spa-01";
  if (key.includes("tiêm") || key.includes("vaccine")) return "srv-vet-03";
  if (key.includes("nha khoa") || key.includes("dental")) return "srv-vet-02";
  return "srv-vet-01";
}

function mapBookingPetToSeedPetId(petName?: string): string {
  if (petName) {
    const clean = petName.trim().toLowerCase();
    const matched = SEED_PETS.find((p) => p.name.trim().toLowerCase() === clean);
    if (matched) return matched.id;
  }
  return SEED_PETS[0]?.id || "pet-001";
}

export function syncCustomerBookingToExpertStore(
  booking: Booking,
  sourceLabel: string = "khách hàng"
): void {
  if (typeof window === "undefined") return;
  const { expertId, storageKey } = resolveExpertStoreKey(booking.doctorId);
  const store = readExpertStoreByKey(expertId, storageKey);
  const code = booking.code || booking.id;
  const startAt = `${booking.date}T${booking.timeSlot || "09:00"}`;

  const existing = store.appointments.find((a) => a.code === code || a.id === booking.id);
  const mappedStatus: ExpertAppointment["status"] =
    booking.status === "Đã xác nhận"
      ? "upcoming"
      : booking.status === "Hoàn thành"
      ? "completed"
      : booking.status === "Đã hủy"
      ? "cancelled"
      : "pending";

  const nextAppointments: ExpertAppointment[] = existing
    ? store.appointments.map((a) =>
        a.id === existing.id
          ? {
              ...a,
              startAt,
              status: mappedStatus,
              paymentTiming: booking.paymentTiming ?? a.paymentTiming,
              paymentState: booking.paymentState ?? a.paymentState,
              cancelledAt: booking.cancelledAt ?? a.cancelledAt,
              cancelReason: booking.cancelReason ?? a.cancelReason,
              history: [
                ...a.history,
                {
                  at: new Date().toISOString().slice(0, 16).replace("T", " "),
                  status: mappedStatus,
                  note: {
                    vi:
                      booking.status === "Đã hủy"
                        ? `${sourceLabel === "Quản lý" ? "Quản lý" : "Khách hàng"} hủy lịch${booking.cancellationFee ? ` (phí ${booking.cancellationFee.toLocaleString("vi-VN")}đ)` : ""}`
                        : `Đồng bộ cập nhật từ ${sourceLabel}`,
                    en:
                      sourceLabel === "Quản lý"
                        ? "Synced update from manager"
                        : "Synced update from customer",
                  },
                },
              ],
            }
          : a
      )
    : [
        {
          id: `apt-cust-${booking.id}`,
          code,
          expertId,
          petId: mapBookingPetToSeedPetId(booking.petName),
          ownerId: SEED_OWNERS[0]?.id || "own-001",
          serviceId: mapBookingServiceToExpertServiceId(booking.serviceSlug, booking.service),
          startAt,
          status: mappedStatus,
          paymentTiming: booking.paymentTiming ?? "postpaid",
          paymentState: booking.paymentState ?? "unpaid",
          customerNote: [
            booking.petName ? `Bé ${booking.petName}` : "",
            booking.fullName ? `Khách: ${booking.fullName} (${booking.phone})` : "",
            booking.note || "",
          ]
            .filter(Boolean)
            .join(" • "),
          createdAt: booking.createdAt.slice(0, 16).replace("T", " "),
          history: [
            {
              at: new Date().toISOString().slice(0, 16).replace("T", " "),
              status: "pending",
              note: {
                vi: "Lịch hẹn mới từ trang Đặt lịch Khách hàng",
                en: "New booking from Customer portal",
              },
            },
          ],
        },
        ...store.appointments,
      ];

  const notif: ExpertNotification = {
    id: `notif-cust-${Date.now()}`,
    expertId,
    type: booking.status === "Đã hủy" ? "booking_cancelled" : existing ? "booking_changed" : "new_booking",
    title: {
      vi: booking.status === "Đã hủy" ? `Lịch ${code} đã hủy` : existing ? `Cập nhật lịch ${code}` : `Lịch hẹn mới ${code}`,
      en: booking.status === "Đã hủy" ? `Booking ${code} cancelled` : existing ? `Booking ${code} updated` : `New booking ${code}`,
    },
    body: {
      vi: `${booking.fullName} · ${booking.service} (${formatDateDdMmYyyy(booking.date)} ${booking.timeSlot || ""})`,
      en: `${booking.fullName} · ${booking.service} (${formatDateDdMmYyyy(booking.date)} ${booking.timeSlot || ""})`,
    },
    at: "Vừa xong",
    unread: true,
    href: "/expert/appointments",
  };

  writeExpertStoreByKey(storageKey, {
    ...store,
    appointments: nextAppointments,
    notifications: [notif, ...store.notifications],
  });
}

export function syncCustomerReviewToExpertStore(
  booking: Booking,
  review: BookingReview
): void {
  if (typeof window === "undefined") return;
  const { expertId, storageKey } = resolveExpertStoreKey(booking.doctorId);
  const store = readExpertStoreByKey(expertId, storageKey);

  const reviewId = `rev-cust-${booking.code || booking.id}`;
  const newReview: ExpertReview = {
    id: reviewId,
    expertId,
    appointmentId: booking.id,
    ownerId: SEED_OWNERS[0]?.id || "own-001",
    serviceId: mapBookingServiceToExpertServiceId(booking.serviceSlug, booking.service),
    rating: review.rating,
    comment: `${booking.fullName} (${booking.service}): ${review.comment}`,
    createdAt: review.createdAt.slice(0, 10),
  };

  const notif: ExpertNotification = {
    id: `notif-rev-${Date.now()}`,
    expertId,
    type: "new_review",
    title: {
      vi: `Đánh giá ${review.rating}★ mới từ khách hàng`,
      en: `New ${review.rating}-Star Customer Review`,
    },
    body: {
      vi: `${booking.fullName}: "${review.comment}"`,
      en: `${booking.fullName}: "${review.comment}"`,
    },
    at: "Vừa xong",
    unread: true,
    href: "/expert/reviews",
  };

  writeExpertStoreByKey(storageKey, {
    ...store,
    reviews: [newReview, ...store.reviews.filter((r) => r.id !== reviewId)],
    notifications: [notif, ...store.notifications],
  });
}

// ==========================================
// ĐỒNG BỘ ĐA CHUYÊN VIÊN CHO Manager
// ==========================================

function createSyncEntityId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export interface AggregatedShiftRequest {
  expertId: string;
  profile: ExpertProfile;
  request: ShiftRequest;
}

export function readAllExpertProfiles(): ExpertProfile[] {
  return EXPERT_IDS.map((id) => {
    const store = readExpertStore(id);
    return store.profile || SEED_EXPERTS[id];
  });
}

export function readAllExpertShiftRequests(): AggregatedShiftRequest[] {
  const items: AggregatedShiftRequest[] = [];
  for (const expertId of EXPERT_IDS) {
    const store = readExpertStore(expertId);
    const profile = store.profile || SEED_EXPERTS[expertId];
    for (const request of store.shiftRequests) {
      items.push({ expertId, profile, request });
    }
  }
  return items.sort((a, b) =>
    b.request.createdAt.localeCompare(a.request.createdAt)
  );
}

/**
 * Manager duyệt / từ chối đơn nghỉ phép, tăng ca, đổi ca hoặc ca làm thêm (part-time)
 * cho bất kỳ chuyên viên nào và đồng bộ ca vào lịch tuần của chuyên viên đó.
 */
export function updateExpertShiftRequestDecision(
  expertId: string,
  reqId: string,
  decision: "approved" | "rejected",
  adminNote?: string
): ExpertStoreState | null {
  const store = readExpertStore(expertId);
  const targetReq = store.shiftRequests.find((r) => r.id === reqId);
  if (!targetReq) return null;

  const finalNote =
    adminNote?.trim() ||
    (decision === "approved"
      ? "Manager đã phê duyệt."
      : "Manager từ chối yêu cầu.");

  const updatedRequests = store.shiftRequests.map((r) =>
    r.id === reqId ? { ...r, status: decision, adminNote: finalNote } : r
  );

  let updatedShifts: ExpertShift[] = [...store.shifts];
  if (decision === "approved") {
    if (targetReq.kind === "extra_shift") {
      updatedShifts.push({
        id: createSyncEntityId("sh-ext"),
        expertId,
        date: targetReq.date,
        shift: targetReq.shift || "afternoon",
        shiftType: "extra_shift",
      });
    } else if (targetReq.kind === "leave") {
      updatedShifts = updatedShifts.filter(
        (s) =>
          !(
            s.date === targetReq.date &&
            (!targetReq.shift || s.shift === targetReq.shift)
          )
      );
      if (targetReq.leaveType === "rotational") {
        updatedShifts.push({
          id: createSyncEntityId("sh-rot"),
          expertId,
          date: targetReq.date,
          shift: targetReq.shift || "morning",
          shiftType: "rotational_off",
        });
      }
    } else if (targetReq.kind === "shift_swap" && targetReq.targetSwapDate) {
      updatedShifts = updatedShifts.filter(
        (s) =>
          !(
            s.date === targetReq.date &&
            (!targetReq.shift || s.shift === targetReq.shift)
          )
      );
      updatedShifts.push({
        id: createSyncEntityId("sh-swap"),
        expertId,
        date: targetReq.targetSwapDate,
        shift: targetReq.targetSwapShift || targetReq.shift || "morning",
        shiftType: "fixed",
      });
    }
  }

  const kindLabel =
    targetReq.kind === "extra_shift"
      ? "đăng ký ca làm thêm"
      : targetReq.kind === "leave"
      ? "đơn xin nghỉ phép"
      : "yêu cầu đổi ca";

  const notif: ExpertNotification = {
    id: createSyncEntityId("notif-sh"),
    expertId,
    type: "shift_result",
    title: {
      vi:
        decision === "approved"
          ? `Đã duyệt ${kindLabel}`
          : `Từ chối ${kindLabel}`,
      en: decision === "approved" ? "Shift request approved" : "Shift request rejected",
    },
    body: {
      vi: `Ngày ${formatDateDdMmYyyy(targetReq.date)}: ${finalNote}`,
      en: `Date ${formatDateDdMmYyyy(targetReq.date)}: ${finalNote}`,
    },
    at: "Vừa xong",
    unread: true,
    href: "/expert/schedule",
  };

  const nextStore: ExpertStoreState = {
    ...store,
    shiftRequests: updatedRequests,
    shifts: updatedShifts,
    notifications: [notif, ...store.notifications],
  };
  writeExpertStore(expertId, nextStore);
  return nextStore;
}

export function assignManagerShiftToExpert(
  expertId: string,
  dateIso: string,
  shift: ShiftCode,
  shiftType: ShiftAssignmentType
): void {
  const store = readExpertStore(expertId);
  const nextShifts: ExpertShift[] = [
    ...store.shifts,
    {
      id: createSyncEntityId("sh-mgr"),
      expertId,
      date: dateIso,
      shift,
      shiftType,
    },
  ];
  writeExpertStore(expertId, { ...store, shifts: nextShifts });
}

/**
 * Manager duyệt hoặc từ chối bằng cấp/chứng chỉ trong hồ sơ chuyên viên.
 */
export function reviewExpertCertificate(
  expertId: string,
  certId: string,
  decision: "approved" | "rejected",
  rejectReason?: string
): ExpertStoreState | null {
  const store = readExpertStore(expertId);
  const currentCerts: ExpertCertificate[] =
    store.profile?.certificates || SEED_EXPERTS[expertId]?.certificates || [];
  const target = currentCerts.find((c) => c.id === certId);
  if (!target) return null;

  const nextCerts: ExpertCertificate[] = currentCerts.map((c) => {
    if (c.id !== certId) return c;
    return {
      ...c,
      status: decision,
      rejectReason:
        decision === "rejected"
          ? rejectReason?.trim() || "Chưa đạt yêu cầu xác minh, vui lòng tải lại bản rõ nét."
          : undefined,
    };
  });

  const notif: ExpertNotification = {
    id: createSyncEntityId("notif-cert"),
    expertId,
    type: "shift_result",
    title: {
      vi:
        decision === "approved"
          ? "Chứng chỉ đã được phê duyệt"
          : "Chứng chỉ cần bổ sung lại",
      en: decision === "approved" ? "Certificate approved" : "Certificate rejected",
    },
    body: {
      vi:
        decision === "approved"
          ? `Quản lý nghiệp vụ đã duyệt: ${target.name}`
          : `Từ chối "${target.name}": ${rejectReason || "Vui lòng kiểm tra lại hồ sơ."}`,
      en: target.name,
    },
    at: "Vừa xong",
    unread: true,
    href: "/expert/profile",
  };

  const nextStore: ExpertStoreState = {
    ...store,
    profile: {
      ...(store.profile || SEED_EXPERTS[expertId]),
      certificates: nextCerts,
    },
    notifications: [notif, ...store.notifications],
  };
  writeExpertStore(expertId, nextStore);
  return nextStore;
}

/**
 * Đồng bộ tiến trình 4 bước & trạng thái ca chăm sóc từ cổng Nhân viên sang danh sách đặt lịch Quản lý/Khách.
 */
export function syncExpertAppointmentToAdminBookings(
  appt: ExpertAppointment,
  meta?: {
    petName?: string;
    petSpecies?: string;
    petBreed?: string;
    ownerName?: string;
    ownerPhone?: string;
    serviceName?: string;
    servicePrice?: number;
    expertName?: string;
  }
): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(ADMIN_BOOKINGS_STORAGE_KEY);
    const list: Array<Booking & { staffName?: string; price?: number }> = raw
      ? JSON.parse(raw)
      : [];
    if (!Array.isArray(list)) return;

    const mappedStatus: Booking["status"] =
      appt.status === "completed"
        ? "Hoàn thành"
        : appt.status === "cancelled"
        ? "Đã hủy"
        : appt.status === "upcoming" || appt.status === "in_progress"
        ? "Đã xác nhận"
        : "Mới";

    const idx = list.findIndex(
      (b) => b.code === appt.code || b.id === appt.id || `apt-cust-${b.id}` === appt.id
    );

    const [syncedDate, syncedTime] = appt.startAt.split("T");
    const progressPatch = {
      status: mappedStatus,
      ...(syncedDate ? { date: syncedDate } : {}),
      ...(syncedTime ? { timeSlot: syncedTime.slice(0, 5) } : {}),
      careStage: appt.careStage,
      careProgressLog: appt.careProgressLog,
      managerConfirmedAt: appt.managerConfirmedAt,
      managerConfirmedBy: appt.managerConfirmedBy,
      managerConfirmNote: appt.managerConfirmNote,
      ...(appt.cancelReason || appt.rejectReason
        ? { cancelReason: appt.cancelReason || appt.rejectReason }
        : {}),
      ...(appt.proposedStartAt
        ? { internalNote: `Chuyên viên đề xuất đổi lịch sang ${appt.proposedStartAt.replace("T", " ")}` }
        : {}),
      ...(appt.status === "completed" && appt.completedAt
        ? { completedAt: appt.completedAt }
        : {}),
      ...(appt.status === "upcoming" ? { confirmedAt: new Date().toISOString() } : {}),
      ...(appt.completionNote ? { internalNote: appt.completionNote } : {}),
    };

    let nextList: Array<Booking & { staffName?: string; price?: number }>;
    if (idx >= 0) {
      nextList = list.map((b, i) => (i === idx ? { ...b, ...progressPatch } : b));
    } else {
      const [datePart, timePart] = appt.startAt.split("T");
      const created: Booking & { staffName?: string; price?: number } = {
        id: appt.id,
        code: appt.code,
        service: meta?.serviceName || "Dịch vụ chăm sóc thú cưng",
        doctorId: appt.expertId,
        doctorName: meta?.expertName || SEED_EXPERTS[appt.expertId]?.fullName,
        staffName: meta?.expertName || SEED_EXPERTS[appt.expertId]?.fullName,
        petType: meta?.petSpecies || "Chó",
        petName: meta?.petName || "Bé cưng",
        petBreed: meta?.petBreed,
        date: datePart,
        timeSlot: timePart?.slice(0, 5) || "09:00",
        fullName: meta?.ownerName || "Khách hàng Animora",
        phone: meta?.ownerPhone || "0900 000 000",
        price: meta?.servicePrice || 300000,
        estimatedPrice: meta?.servicePrice || 300000,
        paymentTiming: appt.paymentTiming,
        paymentState: appt.paymentState,
        createdAt: appt.createdAt,
        ...progressPatch,
      };
      nextList = [created, ...list];
    }

    window.localStorage.setItem(ADMIN_BOOKINGS_STORAGE_KEY, JSON.stringify(nextList));
    window.dispatchEvent(new Event(ADMIN_BOOKINGS_SYNC_EVENT));
  } catch {
    // ignore storage errors
  }
}

/**
 * Manager xác nhận trạng thái/kết quả dịch vụ chăm sóc đang thực hiện hoặc chờ bàn giao.
 */
export function confirmCareServiceResultInStores(
  bookingCodeOrId: string,
  managerName = "Manager",
  note = "Đã kiểm tra & xác nhận kết quả dịch vụ đạt chuẩn bàn giao."
): { updatedExpertId?: string } {
  const nowIso = new Date().toISOString().slice(0, 16);
  let updatedExpertId: string | undefined;

  for (const expertId of EXPERT_IDS) {
    const store = readExpertStore(expertId);
    const match = store.appointments.find(
      (a) =>
        a.code === bookingCodeOrId ||
        a.id === bookingCodeOrId ||
        a.id === `apt-cust-${bookingCodeOrId}`
    );
    if (!match) continue;

    updatedExpertId = expertId;
    const nextAppointments = store.appointments.map((a) => {
      if (a.id !== match.id) return a;
      const nextStage: CareServiceStage = a.careStage || "ready_handover";
      return {
        ...a,
        careStage: nextStage,
        managerConfirmedAt: nowIso,
        managerConfirmedBy: managerName,
        managerConfirmNote: note,
        history: [
          ...a.history,
          {
            at: nowIso,
            status: a.status,
            note: {
              vi: `${managerName} xác nhận kết quả dịch vụ: ${note}`,
              en: `${managerName} confirmed service result`,
            },
          },
        ],
      };
    });

    const notif: ExpertNotification = {
      id: createSyncEntityId("notif-mgr"),
      expertId,
      type: "booking_changed",
      title: {
        vi: `Quản lý đã xác nhận ca ${match.code}`,
        en: `Manager confirmed ${match.code}`,
      },
      body: { vi: note, en: note },
      at: "Vừa xong",
      unread: true,
      href: "/expert/appointments",
    };

    writeExpertStore(expertId, {
      ...store,
      appointments: nextAppointments,
      notifications: [notif, ...store.notifications],
    });
    break;
  }

  return { updatedExpertId };
}

// ==========================================
// ĐỒNG BỘ THÔNG BÁO CHO MANAGER
// ==========================================

export const MANAGER_NOTIF_STORAGE_KEY = "animora_manager_notifications_v1";
export const MANAGER_NOTIF_SYNC_EVENT = "animora_manager_notif_sync";

export type ManagerNotificationType =
  | "booking"
  | "staff"
  | "certificate"
  | "stock"
  | "adoption";

export interface ManagerNotificationRecord {
  id: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  type: ManagerNotificationType;
  href?: string;
}

const DEFAULT_MANAGER_NOTIFICATIONS: ManagerNotificationRecord[] = [
  {
    id: "m-notif-1",
    title: "Đơn xin nghỉ phép cần duyệt",
    desc: "BS. Lê Huy Hoàng nộp đơn xin nghỉ ngày 15-11-2026.",
    time: "5 phút trước",
    unread: true,
    type: "staff",
    href: "/manager/staff?tab=requests",
  },
  {
    id: "m-notif-2",
    title: "Lịch hẹn dịch vụ mới",
    desc: "Khách Nguyễn Văn An vừa đặt Spa Combo 5 bước lúc 14:00.",
    time: "20 phút trước",
    unread: true,
    type: "booking",
    href: "/manager/bookings",
  },
  {
    id: "m-notif-3",
    title: "Cảnh báo tồn kho dưới ngưỡng",
    desc: "Hạt Royal Canin mini adult chỉ còn 2 gói trong kho.",
    time: "1 giờ trước",
    unread: true,
    type: "stock",
    href: "/manager/shop",
  },
  {
    id: "m-notif-4",
    title: "Hồ sơ xin nhận nuôi mới",
    desc: "Trần Thùy Linh gửi hồ sơ xin nhận nuôi bé cún Mochi.",
    time: "2 giờ trước",
    unread: false,
    type: "adoption",
    href: "/manager/adoptions",
  },
];

export function readManagerNotifications(): ManagerNotificationRecord[] {
  if (typeof window === "undefined") {
    return DEFAULT_MANAGER_NOTIFICATIONS;
  }
  try {
    const raw = window.localStorage.getItem(MANAGER_NOTIF_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as ManagerNotificationRecord[];
      }
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_MANAGER_NOTIFICATIONS;
}

function writeManagerNotifications(items: ManagerNotificationRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      MANAGER_NOTIF_STORAGE_KEY,
      JSON.stringify(items.slice(0, 50))
    );
    window.dispatchEvent(new Event(MANAGER_NOTIF_SYNC_EVENT));
  } catch {
    // ignore storage errors
  }
}

export function pushManagerNotification(
  input: Omit<ManagerNotificationRecord, "id" | "time" | "unread"> & {
    time?: string;
  }
): ManagerNotificationRecord {
  const current = readManagerNotifications();
  const nextItem: ManagerNotificationRecord = {
    id: createSyncEntityId("m-notif"),
    title: input.title,
    desc: input.desc,
    time: input.time || "Vừa xong",
    unread: true,
    type: input.type,
    href: input.href,
  };
  writeManagerNotifications([nextItem, ...current]);
  return nextItem;
}

export function markManagerNotificationRead(id: string): ManagerNotificationRecord[] {
  const next = readManagerNotifications().map((n) =>
    n.id === id ? { ...n, unread: false } : n
  );
  writeManagerNotifications(next);
  return next;
}

export function markAllManagerNotificationsRead(): ManagerNotificationRecord[] {
  const next = readManagerNotifications().map((n) => ({ ...n, unread: false }));
  writeManagerNotifications(next);
  return next;
}
