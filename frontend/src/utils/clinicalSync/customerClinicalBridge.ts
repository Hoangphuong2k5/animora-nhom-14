import {
  SEED_EXPERTS,
  SEED_HEALTH_ENTRIES,
  SEED_MEDICAL_RECORDS,
  SEED_PETS,
  SEED_PRESCRIPTIONS,
} from "@/data/expertPortalData";
import { MEDICINE_CATALOG } from "@/data/medicineCatalog";
import { SHOP_PRODUCTS } from "@/data/shopData";
import { getTodayLocalIso } from "@/utils/dateFormat";
import type { CareRecord, WeightLog as CustomerWeightLog } from "@/data/petProfilesData";
import type { Product } from "@/types/animora.type";
import type {
  ExpertStoreState,
  HealthEntry,
  MedicalRecord,
  Prescription,
} from "@/types/expert.type";
import {
  EXPERT_IDS,
  readAllVetStores,
  readExpertStore,
  writeExpertStore,
} from "./expertStorage";

/**
 * Cầu nối ánh xạ ID thú cưng giữa Portal Khách hàng (pet-1..pet-6)
 * và Portal Chuyên viên (pet-001..pet-008) để hiển thị đồng bộ real-time qua localStorage.
 */
const CUSTOMER_TO_EXPERT_PET_IDS: Record<string, string[]> = {
  "pet-1": ["pet-002", "pet-006", "pet-008"],
  "pet-2": ["pet-001", "pet-005"],
  "pet-3": ["pet-004"],
  "pet-6": ["pet-003", "pet-007"],
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

/**
 * Lấy bệnh án gần nhất của một thú cưng từ TẤT CẢ các Bác sĩ (exp-vet-01, exp-vet-02, exp-vet-03)
 * để hiển thị "Lưu ý Y khoa" cho Nhân viên chăm sóc khi mở Drawer lịch hẹn.
 */
export function getLatestVetMedicalRecordForPet(petId: string): MedicalRecord | undefined {
  const recordMap = new Map<string, MedicalRecord>();
  for (const { store } of readAllVetStores()) {
    for (const r of store.medicalRecords) {
      if (r.petId === petId) {
        recordMap.set(r.id, r);
      }
    }
  }
  const list =
    recordMap.size > 0
      ? Array.from(recordMap.values())
      : SEED_MEDICAL_RECORDS.filter((r) => r.petId === petId);
  return list.sort((a, b) => b.date.localeCompare(a.date))[0];
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

export function computePrescriptionOrderAmount(rx: Prescription): number {
  return rx.lines.reduce((sum, line) => {
    const { price } = resolveCatalogPriceAndName(line.medicineId);
    const units = Math.max(1, Math.ceil((line.days || 1) / 7));
    return sum + price * units;
  }, 0);
}

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
      const endDateIso = getTodayLocalIso(endDate);
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

