import type { ExtendedBooking } from "@/components/shared/operations/bookings/bookingsTypesAndData";
import type { DoctorDirectoryItem } from "@/data/doctorsDirectory";
import type { ServiceEntity } from "@/data/servicesData";
import {
  calculateServiceEndTime,
  generateServiceBookingCode,
  mapPetSpeciesToBookingPetType,
} from "@/data/serviceBookingData";
import type { BookingWeightRangeId } from "@/types";
import {
  createAuditLogEntry,
  type ReceptionistAuditLogEntry,
  type ServiceInvoiceRecord,
  type WalkInCustomerRecord,
  type WalkInPetRecord,
} from "./types";

function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr) return null;
  const clean = timeStr.split(" - ")[0].trim();
  const [h, m] = clean.split(":").map(Number);
  if (Number.isNaN(h)) return null;
  return h * 60 + (Number.isNaN(m) ? 0 : m);
}

function normalizeStaffName(name?: string): string {
  return (name || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function doesBookingBelongToStaff(
  booking: ExtendedBooking,
  staff: DoctorDirectoryItem
): boolean {
  if (booking.doctorId && booking.doctorId === staff.id) return true;
  const targetName = normalizeStaffName(staff.name);
  if (!targetName) return false;
  return (
    normalizeStaffName(booking.doctorName) === targetName ||
    normalizeStaffName(booking.staffName) === targetName
  );
}

/**
 * Lọc nhân sự thực sự RẢNH tại khung giờ [startTime, startTime + durationMinutes] trong ngày,
 * sau đó sắp xếp theo tiêu chí ít ca nhất trong ngày, hòa thì theo mã nhân sự (Mục 4 v1.4).
 */
export function getAvailableStaffForPosSlot(params: {
  eligibleStaff: DoctorDirectoryItem[];
  bookings: ExtendedBooking[];
  date: string;
  startTime: string;
  durationMinutes: number;
}): DoctorDirectoryItem[] {
  const { eligibleStaff, bookings, date, startTime, durationMinutes } = params;
  const slotStart = parseTimeToMinutes(startTime);
  const slotDuration = Math.max(15, durationMinutes || 45);
  const slotEnd = slotStart !== null ? slotStart + slotDuration : null;

  const activeBookingsOnDate = bookings.filter(
    (b) =>
      b.date === date &&
      b.status !== "Đã hủy" &&
      b.status !== "Không đến"
  );

  const available = eligibleStaff.filter((staff) => {
    if (slotStart === null || slotEnd === null) return true;
    const hasOverlap = activeBookingsOnDate.some((b) => {
      if (!doesBookingBelongToStaff(b, staff)) return false;
      const bStart = parseTimeToMinutes(b.startTime || b.timeSlot);
      if (bStart === null) return false;
      const rawEnd = b.endTime || b.timeSlot?.split(" - ")[1];
      const parsedEnd = parseTimeToMinutes(rawEnd);
      const bEnd =
        parsedEnd !== null && parsedEnd > bStart
          ? parsedEnd
          : bStart + (b.durationMinutes || 60);
      return bStart < slotEnd && bEnd > slotStart;
    });
    return !hasOverlap;
  });

  const countOnDate = (staff: DoctorDirectoryItem) =>
    activeBookingsOnDate.filter((b) => doesBookingBelongToStaff(b, staff)).length;

  return [...available].sort((a, b) => {
    const diff = countOnDate(a) - countOnDate(b);
    if (diff !== 0) return diff;
    return a.id.localeCompare(b.id);
  });
}

export type CounterPosPaymentOption =
  | "postpaid_cash"
  | "prepaid_cash"
  | "prepaid_bank";

/**
 * Tạo đầy đủ ExtendedBooking + AuditLog + (tự xuất ServiceInvoiceRecord nếu Trả trước tại quầy).
 */
export function buildCounterPosBookingAndInvoice(params: {
  existingBookingsCount: number;
  customer: WalkInCustomerRecord;
  pet: WalkInPetRecord;
  weightRange: BookingWeightRangeId;
  selectedServices: ServiceEntity[];
  totalDurationMinutes: number;
  totalPrice: number;
  bookingMode: "walk_in_now" | "scheduled";
  date: string;
  startTime: string;
  assignedStaff: DoctorDirectoryItem;
  paymentOption: CounterPosPaymentOption;
  note: string;
  actorId: string;
  actorName: string;
}): {
  booking: ExtendedBooking;
  auditLog: ReceptionistAuditLogEntry;
  invoice?: ServiceInvoiceRecord;
} {
  const {
    existingBookingsCount,
    customer,
    pet,
    weightRange,
    selectedServices,
    totalDurationMinutes,
    totalPrice,
    bookingMode,
    date,
    startTime,
    assignedStaff,
    paymentOption,
    note,
    actorId,
    actorName,
  } = params;

  const now = new Date();
  const nowIso = now.toISOString();
  const code = generateServiceBookingCode(existingBookingsCount);
  const serviceNames = selectedServices.map((s) => s.name.vi).join(" + ");
  const primarySrv = selectedServices[0];
  const safeDuration = totalDurationMinutes || 45;
  const endTime = calculateServiceEndTime(startTime, safeDuration);
  const isPrepaid = paymentOption !== "postpaid_cash";

  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(now.getDate()).padStart(2, "0")}`;
  const invoiceCode = isPrepaid
    ? `INV-${ymd}-${String(Math.floor(1000 + Math.random() * 9000))}`
    : undefined;

  const booking: ExtendedBooking = {
    id: `bk-pos-${Date.now()}`,
    code,
    service: serviceNames,
    serviceSlug: primarySrv.slug,
    date,
    timeSlot: `${startTime} - ${endTime}`,
    startTime,
    endTime,
    durationMinutes: safeDuration,
    fullName: customer.fullName,
    phone: customer.phone,
    email: customer.email || "",
    petName: pet.name,
    petType: mapPetSpeciesToBookingPetType(pet.species),
    weightRange,
    petWeight: `${pet.weightKg}kg`,
    petAllergies: pet.allergies,
    note: note.trim(),
    status: bookingMode === "walk_in_now" ? "Đã đến" : "Đã xác nhận",
    createdAt: nowIso,
    confirmedAt: nowIso,
    checkedInAt: bookingMode === "walk_in_now" ? nowIso : undefined,
    checkedInBy: bookingMode === "walk_in_now" ? actorName : undefined,
    doctorId: assignedStaff.id,
    doctorName: assignedStaff.name,
    staffName: assignedStaff.name,
    estimatedPrice: totalPrice,
    price: totalPrice,
    bookingChannel: "counter",
    bookingMode,
    createdByRole: "receptionist",
    createdByUserId: actorId,
    createdByName: actorName,
    paymentTiming: isPrepaid ? "prepaid" : "postpaid",
    paymentState: isPrepaid ? "paid" : "unpaid",
    paymentStatus: isPrepaid ? "paid" : "unpaid",
    paymentMethod: paymentOption === "prepaid_bank" ? "online" : "counter",
    invoiceCode,
    invoiceIssuedAt: isPrepaid ? nowIso : undefined,
    collectedByName: isPrepaid ? actorName : undefined,
  };

  const invoice: ServiceInvoiceRecord | undefined =
    isPrepaid && invoiceCode
      ? {
          id: `inv-pos-${Date.now()}`,
          invoiceCode,
          bookingId: booking.id,
          bookingCode: code,
          customerName: customer.fullName,
          customerPhone: customer.phone,
          petName: pet.name,
          petSpecies: pet.species,
          serviceName: serviceNames,
          bookingChannel: "counter",
          paymentTiming: "prepaid",
          paymentMethod:
            paymentOption === "prepaid_bank" ? "bank_transfer" : "cash",
          originalPrice: totalPrice,
          declaredWeightKg: pet.weightKg,
          weightDifferenceAmount: 0,
          finalAmount: totalPrice,
          issuedBy: actorName,
          issuedAt: nowIso,
          note: note.trim() || "Thu trả trước ngay khi đặt lịch tại quầy (POS)",
        }
      : undefined;

  const auditLog = createAuditLogEntry({
    action: "booking_create",
    actionLabel:
      bookingMode === "walk_in_now"
        ? "Đặt lịch tại quầy (Làm ngay)"
        : "Đặt lịch tại quầy (Hẹn giờ)",
    actorId,
    actorName,
    targetCode: code,
    customerName: customer.fullName,
    customerPhone: customer.phone,
    beforeState: "Tạo đơn POS mới tại quầy",
    afterState: `Đơn ${code} • ${serviceNames} (${pet.name}) • ${totalPrice.toLocaleString(
      "vi-VN"
    )}đ • Nhân sự: ${assignedStaff.name} • Trạng thái: ${booking.status}${
      invoiceCode ? ` • Đã thu & xuất HĐ ${invoiceCode}` : ""
    }`,
  });

  return { booking, auditLog, invoice };
}

