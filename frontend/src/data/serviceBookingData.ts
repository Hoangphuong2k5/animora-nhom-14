import { getSafeNow } from '../utils/safeNow';
export { getSafeNow };
import {
  Booking,
  BookingPetTypeId,
  BookingPreferredContact,
  BookingWeightRangeId,
  Language,
  Pet,
  PetSpecies,
} from '@/types';
import {
  INITIAL_PET_PROFILES,
  INITIAL_WEIGHT_LOGS,
  PetProfileEntity,
  WeightLog,
} from './petProfilesData';
import { SERVICES_DATA, ServiceEntity, formatServicePrice } from './servicesData';

export interface TimeSlotConfig {
  openHour: number;
  closeHour: number;
  intervalMinutes: number;
  capacityPerSlot: number;
  maxAdvanceDays: number;
  closedWeekdays: number[]; // e.g., [] if open all week, or specific closed days
  closedDateOffsets: number[]; // relative to today, e.g. [5] for monthly clinic sterilization day
}

export const TIME_SLOT_CONFIG: TimeSlotConfig = {
  openHour: 8,
  closeHour: 19,
  intervalMinutes: 60,
  capacityPerSlot: 2,
  maxAdvanceDays: 60,
  closedWeekdays: [],
  closedDateOffsets: [5], // 5 days from today is closed for periodic clinic sanitization
};

export const BOOKING_PET_TYPES: {
  id: BookingPetTypeId;
  labelVi: string;
  labelEn: string;
}[] = [
  { id: 'Chó', labelVi: 'Chó', labelEn: 'Dog' },
  { id: 'Mèo', labelVi: 'Mèo', labelEn: 'Cat' },
  { id: 'Thỏ & chuột', labelVi: 'Thỏ & chuột', labelEn: 'Rabbit & rodent' },
  { id: 'Chim', labelVi: 'Chim', labelEn: 'Bird' },
  { id: 'Khác', labelVi: 'Khác', labelEn: 'Other' },
];

export const BOOKING_WEIGHT_RANGES: {
  id: BookingWeightRangeId;
  labelVi: string;
  labelEn: string;
  tableIndex: number;
}[] = [
  { id: 'under_5', labelVi: 'Dưới 5kg', labelEn: 'Under 5kg', tableIndex: 0 },
  { id: '5_to_10', labelVi: '5-10kg', labelEn: '5-10kg', tableIndex: 1 },
  { id: '10_to_20', labelVi: '10-20kg', labelEn: '10-20kg', tableIndex: 2 },
  { id: 'over_20', labelVi: 'Trên 20kg', labelEn: 'Over 20kg', tableIndex: 3 },
];

export const BOOKING_PREFERRED_CONTACTS: {
  id: BookingPreferredContact;
  labelVi: string;
  labelEn: string;
}[] = [
  { id: 'phone', labelVi: 'Điện thoại', labelEn: 'Phone' },
  { id: 'zalo', labelVi: 'Zalo', labelEn: 'Zalo' },
];

export function mapPetSpeciesToBookingPetType(species: PetSpecies | string): BookingPetTypeId {
  switch (species) {
    case 'Chó':
      return 'Chó';
    case 'Mèo':
      return 'Mèo';
    case 'Thỏ':
    case 'Hamster':
    case 'Thỏ & chuột':
      return 'Thỏ & chuột';
    case 'Chim':
      return 'Chim';
    default:
      return 'Khác';
  }
}

export function mapWeightStringToRangeId(weightStr?: string): BookingWeightRangeId {
  if (!weightStr) return 'under_5';
  const numMatch = weightStr.replace(',', '.').match(/(\d+(\.\d+)?)/);
  if (!numMatch) return 'under_5';
  const kg = parseFloat(numMatch[1]);
  if (isNaN(kg) || kg < 5) return 'under_5';
  if (kg <= 10) return '5_to_10';
  if (kg <= 20) return '10_to_20';
  return 'over_20';
}

export function getWeightRangeLabel(
  rangeId: BookingWeightRangeId | string | undefined,
  lang: Language
): string {
  const found = BOOKING_WEIGHT_RANGES.find((r) => r.id === rangeId);
  if (found) {
    return lang === 'vi' ? found.labelVi : found.labelEn;
  }
  return rangeId || (lang === 'vi' ? 'Dưới 5kg' : 'Under 5kg');
}

export function getPetTypeLabel(petType: BookingPetTypeId | string, lang: Language): string {
  const found = BOOKING_PET_TYPES.find((p) => p.id === petType);
  if (found) {
    return lang === 'vi' ? found.labelVi : found.labelEn;
  }
  return petType;
}

export function getPreferredContactLabel(
  contact: BookingPreferredContact | undefined,
  lang: Language
): string {
  const found = BOOKING_PREFERRED_CONTACTS.find((c) => c.id === (contact || 'phone'));
  if (!found) return lang === 'vi' ? 'Điện thoại' : 'Phone';
  return lang === 'vi' ? found.labelVi : found.labelEn;
}

export function resolveServiceBySlugOrName(query?: string | null): ServiceEntity {
  if (!query) return SERVICES_DATA[0];
  const clean = query.trim().toLowerCase();
  const matched = SERVICES_DATA.find(
    (s) =>
      s.slug.toLowerCase() === clean ||
      s.id.toLowerCase() === clean ||
      s.name.vi.toLowerCase() === clean ||
      s.name.en.toLowerCase() === clean
  );
  if (matched) return matched;
  if (clean.includes('tiêm') || clean.includes('vac')) {
    return SERVICES_DATA.find((s) => s.id === 'vaccine') || SERVICES_DATA[0];
  }
  if (clean.includes('giun') || clean.includes('deworm')) {
    return SERVICES_DATA.find((s) => s.id === 'deworm') || SERVICES_DATA[0];
  }
  if (clean.includes('khám')) {
    return SERVICES_DATA[0];
  }
  if (clean.includes('spa') || clean.includes('tắm')) {
    return SERVICES_DATA.find((s) => s.id === 'spa') || SERVICES_DATA[0];
  }
  if (clean.includes('răng') || clean.includes('nha')) {
    return SERVICES_DATA.find((s) => s.id === 'dental') || SERVICES_DATA[0];
  }
  return SERVICES_DATA[0];
}

export function estimateServicePrice(
  service: ServiceEntity,
  weightRange?: BookingWeightRangeId | string
): number {
  if (!service.dependsOnWeight || !weightRange) {
    return service.priceFrom;
  }
  const rangeObj = BOOKING_WEIGHT_RANGES.find((r) => r.id === weightRange);
  if (!rangeObj) return service.priceFrom;
  const row = service.priceTable[rangeObj.tableIndex];
  return row ? row.price : service.priceFrom;
}

export function formatEstimatedPriceText(
  service: ServiceEntity,
  weightRange: BookingWeightRangeId | string | undefined,
  lang: Language
): string {
  const amount = estimateServicePrice(service, weightRange);
  const priceStr = formatServicePrice(amount);
  const unit = service.priceUnit ? ` ${service.priceUnit[lang]}` : '';
  return lang === 'vi' ? `Từ ${priceStr}${unit}` : `From ${priceStr}${unit}`;
}

/**
 * Resolves duration in minutes for a given service slug or name.
 */
export function getServiceDurationMinutes(serviceSlugOrId?: string): number {
  if (!serviceSlugOrId) return 45;
  const srv = resolveServiceBySlugOrName(serviceSlugOrId);
  return srv?.durationMinutes || 45;
}

/**
 * Calculates end time (HH:mm) given a start time (HH:mm) and duration in minutes.
 * For overnight boarding (1440 min), returns standard checkout time 12:00.
 */
export function calculateServiceEndTime(startTime: string, durationMinutes: number): string {
  if (!startTime) return '';
  const cleanStart = startTime.split(' - ')[0].trim();
  const [hh, mm] = cleanStart.split(':').map(Number);
  if (isNaN(hh)) return startTime;

  if (durationMinutes >= 1440) {
    return '12:00';
  }

  const totalMinutes = hh * 60 + (mm || 0) + durationMinutes;
  const endH = Math.floor(totalMinutes / 60) % 24;
  const endM = totalMinutes % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

/**
 * Formats a clean time slot range: e.g. "09:00 – 09:45"
 * For overnight boarding, outputs check-in / check-out notation.
 */
export function formatServiceTimeRange(
  startTime: string,
  durationMinutes: number,
  lang: Language = 'vi'
): string {
  if (!startTime) return '';
  const cleanStart = startTime.split(' - ')[0].trim();
  if (durationMinutes >= 1440) {
    return lang === 'vi'
      ? `${cleanStart} (Nhận phòng) – 12:00 hôm sau (Trả phòng)`
      : `${cleanStart} (Check-in) – 12:00 next day (Check-out)`;
  }
  const endTime = calculateServiceEndTime(cleanStart, durationMinutes);
  return `${cleanStart} – ${endTime}`;
}

// ============================================================================
// DATE & TIME SLOT HELPERS
// ============================================================================

export function getTodayLocalIso(now: Date = getSafeNow()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysToIso(isoDate: string, days: number): string {
  const parts = isoDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return isoDate;
  const dt = new Date(parts[0], parts[1] - 1, parts[2]);
  dt.setDate(dt.getDate() + days);
  return getTodayLocalIso(dt);
}

export function formatIsoDateForDisplay(isoDate: string, lang: Language): string {
  if (!isoDate) return '';
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return isoDate;
  const [, yyyy, mm, dd] = match;
  if (lang === 'vi') {
    return `${dd}-${mm}-${yyyy}`;
  }
  const dt = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return dt.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

export function parseVietnameseDateInput(input: string): string | null {
  const clean = input.trim();
  // Match dd/mm/yyyy or dd-mm-yyyy
  const dmyMatch = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const dd = Number(dmyMatch[1]);
    const mm = Number(dmyMatch[2]);
    const yyyy = Number(dmyMatch[3]);
    if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
    const dt = new Date(yyyy, mm - 1, dd);
    if (
      dt.getFullYear() !== yyyy ||
      dt.getMonth() !== mm - 1 ||
      dt.getDate() !== dd
    ) {
      return null;
    }
    return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
  }
  // Match yyyy-mm-dd
  const isoMatch = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return clean;
  }
  return null;
}

export function isDateClosed(
  isoDate: string,
  todayIso: string = getTodayLocalIso(),
  config: TimeSlotConfig = TIME_SLOT_CONFIG
): boolean {
  const parts = isoDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return false;
  const dt = new Date(parts[0], parts[1] - 1, parts[2]);
  if (config.closedWeekdays.includes(dt.getDay())) {
    return true;
  }
  for (const offset of config.closedDateOffsets) {
    if (addDaysToIso(todayIso, offset) === isoDate) {
      return true;
    }
  }
  return false;
}

export function validateBookingDate(
  isoDate: string,
  todayIso: string = getTodayLocalIso(),
  config: TimeSlotConfig = TIME_SLOT_CONFIG
): { valid: boolean; reason?: 'empty' | 'past' | 'too_far' | 'closed' } {
  if (!isoDate) return { valid: false, reason: 'empty' };
  if (isoDate < todayIso) return { valid: false, reason: 'past' };
  const maxIso = addDaysToIso(todayIso, config.maxAdvanceDays);
  if (isoDate > maxIso) return { valid: false, reason: 'too_far' };
  if (isDateClosed(isoDate, todayIso, config)) return { valid: false, reason: 'closed' };
  return { valid: true };
}

export function generateDailyTimeSlots(config: TimeSlotConfig = TIME_SLOT_CONFIG): string[] {
  const slots: string[] = [];
  for (let h = config.openHour; h <= config.closeHour; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
  }
  return slots;
}

export interface TimeSlotAvailability {
  time: string;
  bookedCount: number;
  capacity: number;
  isFull: boolean;
  isPastToday: boolean;
  disabled: boolean;
  reasonVi?: string;
  reasonEn?: string;
}

export interface TimeSlotAvailabilityContext {
  petName?: string;
  doctorId?: string;
  userId?: string | null;
  minAdvanceHours?: number;
  durationMinutes?: number;
  excludeBookingId?: string;
  excludeBookingCode?: string;
  busySlotsFromApi?: Array<{ start_at: string; end_at: string; source: string }>;
}

function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr) return null;
  const clean = timeStr.split(' - ')[0].trim();
  const [h, m] = clean.split(':').map(Number);
  if (Number.isNaN(h)) return null;
  return h * 60 + (Number.isNaN(m) ? 0 : m);
}

function getBookingIntervalMinutes(b: Booking): { startMin: number; endMin: number } | null {
  const rawStart = b.startTime || (b.timeSlot || '').split(' - ')[0].trim();
  const startMin = parseTimeToMinutes(rawStart);
  if (startMin === null) return null;
  const rawEnd = b.endTime || (b.timeSlot || '').split(' - ')[1]?.trim();
  const parsedEnd = parseTimeToMinutes(rawEnd);
  const duration = b.durationMinutes || getServiceDurationMinutes(b.serviceSlug || b.service) || 60;
  const endMin = parsedEnd !== null && parsedEnd > startMin ? parsedEnd : startMin + duration;
  return { startMin, endMin };
}

function isExpiredUnpaidPrepaidBooking(b: Booking, now: Date): boolean {
  const maybeExpires = (b as Booking & { paymentExpiresAt?: string }).paymentExpiresAt;
  if (b.paymentTiming !== 'prepaid' || b.paymentState !== 'unpaid' || !maybeExpires) {
    return false;
  }
  const expMs = new Date(maybeExpires).getTime();
  return !Number.isNaN(expMs) && expMs < now.getTime();
}

export function getTimeSlotsForDate(
  isoDate: string,
  bookings: Booking[],
  now: Date = getSafeNow(),
  config: TimeSlotConfig = TIME_SLOT_CONFIG,
  context?: TimeSlotAvailabilityContext
): TimeSlotAvailability[] {
  const todayIso = getTodayLocalIso(now);
  if (!isoDate || isDateClosed(isoDate, todayIso, config)) {
    return [];
  }

  const allSlots = generateDailyTimeSlots(config);
  const isToday = isoDate === todayIso;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const normalizedPetName = context?.petName?.trim().toLowerCase() || '';
  const minAdvanceHours = context?.minAdvanceHours ?? 0;
  const requestedDuration = Math.max(15, Math.min(context?.durationMinutes ?? 60, 240));
  const [isoYear, isoMonth, isoDay] = isoDate.split('-').map(Number);

  const apiIntervals = (context?.busySlotsFromApi || [])
    .map((s) => {
      const st = new Date(s.start_at);
      const en = new Date(s.end_at);
      if (Number.isNaN(st.getTime()) || Number.isNaN(en.getTime())) return null;
      return {
        startMs: st.getTime(),
        endMs: en.getTime(),
        source: s.source,
      };
    })
    .filter((x): x is { startMs: number; endMs: number; source: string } => Boolean(x));

  return allSlots.map((time) => {
    const [hh, mm] = time.split(':').map(Number);
    const slotMinutes = hh * 60 + (mm || 0);
    const slotEndMinutes = slotMinutes + requestedDuration;
    const isPastToday = isToday && slotMinutes <= currentMinutes;
    const slotDateTime = new Date(
      isoYear,
      (isoMonth || 1) - 1,
      isoDay || 1,
      hh,
      mm || 0,
      0,
      0
    );
    const slotStartMs = slotDateTime.getTime();
    const slotEndMs = slotStartMs + requestedDuration * 60_000;
    const diffMs = slotStartMs - now.getTime();
    const isTooSoon =
      minAdvanceHours > 0 && diffMs > 0 && diffMs < minAdvanceHours * 3_600_000;

    const activeAtSlot = bookings.filter((b) => {
      if (b.date !== isoDate || b.status === 'Đã hủy' || b.status === 'Không đến') return false;
      if (context?.excludeBookingId && b.id === context.excludeBookingId) return false;
      if (context?.excludeBookingCode && b.code === context.excludeBookingCode) return false;
      if (isExpiredUnpaidPrepaidBooking(b, now)) return false;

      const interval = getBookingIntervalMinutes(b);
      if (!interval) return false;
      return interval.startMin < slotEndMinutes && interval.endMin > slotMinutes;
    });
    const bookedCount = activeAtSlot.length;

    const hasApiPetConflict = apiIntervals.some(
      (iv) =>
        (iv.source === 'pet_appointment' || iv.source === 'adoption_handover') &&
        iv.startMs < slotEndMs &&
        iv.endMs > slotStartMs
    );
    const hasApiDoctorConflict = apiIntervals.some(
      (iv) =>
        iv.source === 'expert_appointment' &&
        iv.startMs < slotEndMs &&
        iv.endMs > slotStartMs
    );

    const hasPetConflict =
      hasApiPetConflict ||
      Boolean(
        normalizedPetName &&
          activeAtSlot.some((b) => {
            const samePet = (b.petName || '').trim().toLowerCase() === normalizedPetName;
            if (!samePet) return false;
            if (context?.userId && b.userId) {
              return b.userId === context.userId;
            }
            return true;
          })
      );

    const hasDoctorConflict =
      hasApiDoctorConflict ||
      Boolean(
        context?.doctorId &&
          activeAtSlot.some((b) => b.doctorId === context.doctorId)
      );

    const isFull = bookedCount >= config.capacityPerSlot;
    const disabled =
      isFull || isPastToday || isTooSoon || hasPetConflict || hasDoctorConflict;

    let reasonVi: string | undefined;
    let reasonEn: string | undefined;
    if (hasPetConflict) {
      reasonVi = 'Bé đã có lịch';
      reasonEn = 'Pet already booked';
    } else if (hasDoctorConflict) {
      reasonVi = 'Bác sĩ bận';
      reasonEn = 'Doctor busy';
    } else if (isFull) {
      reasonVi = 'Hết chỗ';
      reasonEn = 'Full';
    } else if (isPastToday) {
      reasonVi = 'Đã qua giờ';
      reasonEn = 'Passed';
    } else if (isTooSoon) {
      reasonVi = `Cần đặt trước ${minAdvanceHours}h`;
      reasonEn = `Requires ${minAdvanceHours}h notice`;
    }

    return {
      time,
      bookedCount,
      capacity: config.capacityPerSlot,
      isFull,
      isPastToday,
      disabled,
      reasonVi,
      reasonEn,
    };
  });
}

export function findNextAvailableDate(
  fromIsoDate: string,
  bookings: Booking[],
  now: Date = getSafeNow(),
  config: TimeSlotConfig = TIME_SLOT_CONFIG,
  context?: TimeSlotAvailabilityContext
): string {
  const todayIso = getTodayLocalIso(now);
  const startIso = fromIsoDate < todayIso ? todayIso : fromIsoDate;
  for (let i = 1; i <= config.maxAdvanceDays; i++) {
    const candidate = addDaysToIso(startIso, i);
    if (isDateClosed(candidate, todayIso, config)) continue;
    const slots = getTimeSlotsForDate(candidate, bookings, now, config, context);
    if (slots.some((s) => !s.disabled)) {
      return candidate;
    }
  }
  return addDaysToIso(todayIso, 1);
}

// ============================================================================
// SEEDED BOOKINGS (SO SOME SLOTS SHOW AS FULL & ONE DAY IS FULLY BOOKED)
// ============================================================================

export function getUpcomingWithin24hSlot(
  todayIso: string = getTodayLocalIso(),
  now: Date = getSafeNow()
): { date: string; timeSlot: string } {
  const hour = now.getHours();
  if (hour <= 11) {
    return { date: todayIso, timeSlot: '18:00' };
  }
  return { date: addDaysToIso(todayIso, 1), timeSlot: '08:00' };
}

export function createSeededServiceBookings(
  todayIso: string = getTodayLocalIso(),
  now: Date = getSafeNow()
): Booking[] {
  const tomorrow = addDaysToIso(todayIso, 1);
  const dayAfter = addDaysToIso(todayIso, 2);
  const fullyBookedDay = addDaysToIso(todayIso, 3);
  const upcoming4Days = addDaysToIso(todayIso, 4);
  const within24h = getUpcomingWithin24hSlot(todayIso, now);
  const past10Days = addDaysToIso(todayIso, -10);
  const past24Days = addDaysToIso(todayIso, -24);
  const past5Days = addDaysToIso(todayIso, -5);
  const past14Days = addDaysToIso(todayIso, -14);
  const allSlots = generateDailyTimeSlots(TIME_SLOT_CONFIG);

  const ownerBookings: Booking[] = [
    // 1. Upcoming #1 (> 24 hours away — can reschedule and cancel)
    {
      id: 'seed-owner-1',
      code: 'DL-2026-0001',
      userId: 'user-demo-owner',
      serviceSlug: 'kham-tong-quat',
      service: 'Khám tổng quát',
      petType: 'Mèo',
      petName: 'Mây Mây',
      petBreed: 'Scottish Fold · 2 tuổi',
      weightRange: 'under_5',
      date: upcoming4Days,
      timeSlot: '09:00',
      fullName: 'Phan Thị Đình Thùy',
      phone: '0337 203 332',
      email: 'phanthidinhthuy6@gmail.com',
      preferredContact: 'phone',
      note: 'Bé hơi nhát người lạ, nhờ bác sĩ khám nhẹ nhàng giúp gia đình.',
      status: 'Đã xác nhận',
      confirmedAt: `${addDaysToIso(todayIso, -1)}T10:30:00.000Z`,
      createdAt: `${addDaysToIso(todayIso, -2)}T08:15:00.000Z`,
    },
    // 2. Upcoming #2 (Within 24 hours — reschedule and cancel disabled with 24h notice)
    {
      id: 'seed-owner-2',
      code: 'DL-2026-0002',
      userId: 'user-demo-owner',
      serviceSlug: 'spa-tam',
      service: 'Spa & tắm',
      petType: 'Chó',
      petName: 'Bơ',
      petBreed: 'Golden Retriever · 1.5 tuổi',
      weightRange: 'over_20',
      date: within24h.date,
      timeSlot: within24h.timeSlot,
      fullName: 'Phan Thị Đình Thùy',
      phone: '0337 203 332',
      email: 'phanthidinhthuy6@gmail.com',
      preferredContact: 'zalo',
      note: 'Tắm thảo dược dịu nhẹ và cắt móng kỹ cho bé Bơ.',
      vaccinatedConfirmed: true,
      status: 'Mới',
      createdAt: `${todayIso}T01:00:00.000Z`,
    },
    // 3. Completed #1 (Past — vaccination / checkup for saved pet Mây Mây -> can add to pet profile)
    {
      id: 'seed-owner-3',
      code: 'DL-2026-0003',
      userId: 'user-demo-owner',
      serviceSlug: 'kham-tong-quat',
      service: 'Khám tổng quát',
      petType: 'Mèo',
      petName: 'Mây Mây',
      petBreed: 'Scottish Fold · 2 tuổi',
      weightRange: 'under_5',
      date: past10Days,
      timeSlot: '10:00',
      fullName: 'Phan Thị Đình Thùy',
      phone: '0337 203 332',
      email: 'phanthidinhthuy6@gmail.com',
      preferredContact: 'phone',
      note: 'Kiểm tra sức khỏe định kỳ và tiêm nhắc vắc-xin phòng bệnh.',
      status: 'Hoàn thành',
      confirmedAt: `${addDaysToIso(todayIso, -12)}T09:00:00.000Z`,
      completedAt: `${past10Days}T11:00:00.000Z`,
      createdAt: `${addDaysToIso(todayIso, -13)}T14:20:00.000Z`,
    },
    // 4. Completed #2 (Past — dental & small pet checkup for saved pet Bơ)
    {
      id: 'seed-owner-4',
      code: 'DL-2026-0004',
      userId: 'user-demo-owner',
      serviceSlug: 'nha-khoa-thu-nho',
      service: 'Nha khoa',
      petType: 'Chó',
      petName: 'Bơ',
      petBreed: 'Golden Retriever · 1.5 tuổi',
      weightRange: 'over_20',
      date: past24Days,
      timeSlot: '15:00',
      fullName: 'Phan Thị Đình Thùy',
      phone: '0337 203 332',
      email: 'phanthidinhthuy6@gmail.com',
      preferredContact: 'email',
      note: 'Lấy cao răng siêu âm và kiểm tra nướu định kỳ.',
      status: 'Hoàn thành',
      confirmedAt: `${addDaysToIso(todayIso, -26)}T10:00:00.000Z`,
      completedAt: `${past24Days}T16:00:00.000Z`,
      createdAt: `${addDaysToIso(todayIso, -27)}T09:30:00.000Z`,
    },
    // 5. Cancelled #1
    {
      id: 'seed-owner-5',
      code: 'DL-2026-0005',
      userId: 'user-demo-owner',
      serviceSlug: 'huan-luyen',
      service: 'Huấn luyện',
      petType: 'Chó',
      petName: 'Mochi',
      petBreed: 'Toy Poodle · 10 tháng',
      weightRange: 'under_5',
      date: past5Days,
      timeSlot: '14:00',
      fullName: 'Phan Thị Đình Thùy',
      phone: '0337 203 332',
      email: 'phanthidinhthuy6@gmail.com',
      preferredContact: 'phone',
      note: 'Lớp kỹ năng giao tiếp cơ bản cho cún con.',
      status: 'Đã hủy',
      cancelledAt: `${addDaysToIso(todayIso, -7)}T16:45:00.000Z`,
      cancelReason: 'Đổi kế hoạch',
      createdAt: `${addDaysToIso(todayIso, -9)}T11:00:00.000Z`,
    },
    // 6. No-show #1
    {
      id: 'seed-owner-6',
      code: 'DL-2026-0006',
      userId: 'user-demo-owner',
      serviceSlug: 'luu-tru',
      service: 'Lưu trú',
      petType: 'Thỏ & chuột',
      petName: 'Bông Gòn',
      petBreed: 'Thỏ Holland Lop · 9 tháng',
      weightRange: 'under_5',
      date: past14Days,
      timeSlot: '09:00',
      fullName: 'Phan Thị Đình Thùy',
      phone: '0337 203 332',
      email: 'phanthidinhthuy6@gmail.com',
      preferredContact: 'zalo',
      note: 'Phòng tiêu chuẩn có lót cỏ Timothy tươi.',
      vaccinatedConfirmed: true,
      status: 'Không đến',
      confirmedAt: `${addDaysToIso(todayIso, -16)}T10:15:00.000Z`,
      createdAt: `${addDaysToIso(todayIso, -17)}T08:00:00.000Z`,
    },
  ];

  const slotFixtureBookings: Booking[] = [
    // Tomorrow: 09:00 is FULL (2 bookings), 14:00 is FULL (2 bookings), 10:00 is available
    {
      id: 'seed-slot-1',
      code: 'DL-2026-0191',
      serviceSlug: 'kham-tong-quat',
      service: 'Khám tổng quát',
      petType: 'Chó',
      petName: 'Lucky',
      weightRange: 'over_20',
      date: tomorrow,
      timeSlot: '09:00',
      fullName: 'Nguyễn Thị Minh Châu',
      phone: '0908 112 345',
      email: 'minhchau.nguyen@gmail.com',
      preferredContact: 'phone',
      status: 'Đã xác nhận',
      createdAt: '2026-10-28T08:00:00.000Z',
    },
    {
      id: 'seed-slot-2',
      code: 'DL-2026-0192',
      serviceSlug: 'spa-tam',
      service: 'Spa & tắm',
      petType: 'Mèo',
      petName: 'Miu',
      weightRange: 'under_5',
      date: tomorrow,
      timeSlot: '09:00',
      fullName: 'Trần Hoàng Phúc',
      phone: '0913 445 678',
      email: 'hoangphuc.tran@gmail.com',
      preferredContact: 'zalo',
      status: 'Đã xác nhận',
      createdAt: '2026-10-28T09:15:00.000Z',
    },
    {
      id: 'seed-slot-3',
      code: 'DL-2026-0193',
      serviceSlug: 'spa-tam',
      service: 'Spa & tắm',
      petType: 'Chó',
      petName: 'Lu',
      weightRange: 'under_5',
      date: tomorrow,
      timeSlot: '14:00',
      fullName: 'Lê Thanh Thảo',
      phone: '0938 776 543',
      email: 'thanhthao.le@gmail.com',
      preferredContact: 'phone',
      status: 'Đã xác nhận',
      createdAt: '2026-10-29T10:00:00.000Z',
    },
    {
      id: 'seed-slot-4',
      code: 'DL-2026-0194',
      serviceSlug: 'nha-khoa-thu-nho',
      service: 'Nha khoa',
      petType: 'Thỏ & chuột',
      petName: 'Kem',
      weightRange: 'under_5',
      date: tomorrow,
      timeSlot: '14:00',
      fullName: 'Phạm Hữu Đạt',
      phone: '0977 223 891',
      email: 'huudat.pham@gmail.com',
      preferredContact: 'zalo',
      status: 'Mới',
      createdAt: '2026-10-29T11:20:00.000Z',
    },
    // Day after tomorrow: 10:00 is FULL (2 bookings)
    {
      id: 'seed-slot-5',
      code: 'DL-2026-0195',
      serviceSlug: 'huan-luyen',
      service: 'Huấn luyện',
      petType: 'Chó',
      petName: 'Đậu Đậu',
      weightRange: '5_to_10',
      date: dayAfter,
      timeSlot: '10:00',
      fullName: 'Võ Ngọc Quỳnh Anh',
      phone: '0989 654 321',
      email: 'quynhanh.vo@gmail.com',
      preferredContact: 'phone',
      status: 'Đã xác nhận',
      createdAt: '2026-10-30T08:00:00.000Z',
    },
    {
      id: 'seed-slot-6',
      code: 'DL-2026-0196',
      serviceSlug: 'luu-tru',
      service: 'Lưu trú',
      petType: 'Mèo',
      petName: 'Búp Bê',
      weightRange: 'under_5',
      date: dayAfter,
      timeSlot: '10:00',
      fullName: 'Đặng Tuấn Khang',
      phone: '0904 998 112',
      email: 'tuankhang.dang@gmail.com',
      preferredContact: 'email',
      status: 'Đã xác nhận',
      createdAt: '2026-10-30T09:00:00.000Z',
    },
  ];

  const seeded: Booking[] = [...ownerBookings, ...slotFixtureBookings];

  const fullSlotCustomers = [
    { fullName: 'Bùi Hải Yến', phone: '0912 887 654', petName: 'Milu', email: 'haiyen.bui@gmail.com' },
    { fullName: 'Hoàng Gia Khánh', phone: '0935 332 109', petName: 'Tôm', email: 'giakhanh.hoang@gmail.com' },
    { fullName: 'Ngô Phương Linh', phone: '0968 554 221', petName: 'Bánh Mì', email: 'phuonglinh.ngo@gmail.com' },
    { fullName: 'Đỗ Mạnh Cường', phone: '0974 119 887', petName: 'Gạo', email: 'manhcuong.do@gmail.com' },
  ];

  // Make `fullyBookedDay` (today + 3 days) completely full across all slots so empty-slot state can be tested
  allSlots.forEach((slot, idx) => {
    for (let c = 0; c < TIME_SLOT_CONFIG.capacityPerSlot; c++) {
      const sample = fullSlotCustomers[(idx * TIME_SLOT_CONFIG.capacityPerSlot + c) % fullSlotCustomers.length];
      seeded.push({
        id: `seed-full-${idx}-${c}`,
        code: `DL-2026-01${idx}${c}`,
        serviceSlug: 'kham-tong-quat',
        service: 'Khám tổng quát',
        petType: 'Chó',
        petName: sample.petName,
        weightRange: '5_to_10',
        date: fullyBookedDay,
        timeSlot: slot,
        fullName: sample.fullName,
        phone: sample.phone,
        email: sample.email,
        status: 'Đã xác nhận',
        createdAt: '2026-10-30T12:00:00.000Z',
      });
    }
  });

  return seeded;
}

/**
 * Generates seeded bookings relative to the current client wall-clock time.
 * Call only inside useEffect or event handlers to stay SSR/hydration safe.
 */
export function createLiveSeededServiceBookings(): Booking[] {
  const now = new Date();
  return createSeededServiceBookings(getTodayLocalIso(now), now);
}

// ============================================================================
// PHONE FIELD LOGIC (SINGLE SOURCE OF TRUTH: RAW DIGITS <= 10 CHARS)
// ============================================================================

export function cleanBookingPhoneDigits(raw: string): string {
  const trimmed = raw.trim();
  let digits = trimmed.replace(/\D/g, '');
  if (trimmed.startsWith('+84') && digits.startsWith('84')) {
    digits = '0' + digits.slice(2);
  } else if (digits.startsWith('84')) {
    digits = '0' + digits.slice(2);
  }
  return digits.slice(0, 10);
}

export function formatBookingPhoneOnBlur(rawDigits: string): string {
  const digits = cleanBookingPhoneDigits(rawDigits);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
}

export function validateBookingPhoneDigits(
  rawDigits: string,
  lang: Language
): string | null {
  const digits = cleanBookingPhoneDigits(rawDigits);
  if (digits.length === 0) {
    return lang === 'vi'
      ? 'Vui lòng nhập số điện thoại'
      : 'Please enter your phone number';
  }
  if (digits.length < 10) {
    return lang === 'vi'
      ? `Số điện thoại cần đủ 10 số (bạn đã nhập ${digits.length})`
      : `Phone number must be 10 digits (you entered ${digits.length})`;
  }
  if (!/^(03|05|07|08|09)\d{8}$/.test(digits)) {
    return lang === 'vi'
      ? 'Số điện thoại phải bắt đầu bằng 03, 05, 07, 08 hoặc 09'
      : 'Phone number must start with 03, 05, 07, 08, or 09';
  }
  return null;
}

export function validateBookingEmail(email: string, lang: Language): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return lang === 'vi' ? 'Vui lòng nhập địa chỉ email' : 'Please enter your email address';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return lang === 'vi'
      ? 'Địa chỉ email không đúng định dạng'
      : 'Please enter a valid email address';
  }
  return null;
}

export function validateBookingFullName(name: string, lang: Language): string | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return lang === 'vi' ? 'Vui lòng nhập họ và tên' : 'Please enter your full name';
  }
  if (trimmed.length < 2) {
    return lang === 'vi'
      ? 'Họ và tên cần ít nhất 2 ký tự'
      : 'Full name must be at least 2 characters';
  }
  return null;
}

export function validateBookingPetName(petName: string, lang: Language): string | null {
  const trimmed = petName.trim();
  if (!trimmed) {
    return lang === 'vi' ? 'Vui lòng nhập tên của bé' : "Please enter your pet's name";
  }
  return null;
}

export function validateBookingPetType(petType: string, lang: Language): string | null {
  if (!petType || !petType.trim()) {
    return lang === 'vi' ? 'Vui lòng chọn loài thú cưng' : 'Please select pet species';
  }
  return null;
}

const PET_PROFILES_STORAGE_KEY = 'animora_pet_profiles_v3';
const PET_WEIGHTS_STORAGE_KEY = 'animora_pet_weights_v3';

/**
 * Resolves full pet profile attributes (breed, age, weight, allergies) for a saved pet,
 * checking localStorage pet profiles first and falling back to INITIAL_PET_PROFILES.
 */
export function resolveSavedPetProfileDetails(
  pet: Pet,
  lang: Language
): {
  petType: BookingPetTypeId;
  breed: string;
  age: string;
  weight: string;
  allergies: string;
  note: string;
} {
  let storedProfiles: PetProfileEntity[] = INITIAL_PET_PROFILES;
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(PET_PROFILES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          storedProfiles = parsed as PetProfileEntity[];
        }
      }
    } catch {
      // ignore storage errors
    }
  }

  const normalizedName = pet.name.trim().toLowerCase();
  const matchedProfile =
    storedProfiles.find((p) => p.id === pet.id) ||
    storedProfiles.find((p) => p.name.trim().toLowerCase() === normalizedName);

  const rawAllergies =
    pet.allergies ||
    (lang === 'en' && matchedProfile?.allergiesEn
      ? matchedProfile.allergiesEn
      : matchedProfile?.allergies) ||
    '';

  const normalizedAllergies = ['không có', 'none', 'chưa ghi nhận'].includes(
    rawAllergies.trim().toLowerCase()
  )
    ? ''
    : rawAllergies.trim();

  const ageValue =
    (lang === 'en' && matchedProfile?.ageEn ? matchedProfile.ageEn : matchedProfile?.age) ||
    pet.age ||
    '';

  const breedValue =
    (lang === 'en' && matchedProfile?.breedEn
      ? matchedProfile.breedEn
      : matchedProfile?.breed) ||
    pet.breed ||
    '';

  return {
    petType: mapPetSpeciesToBookingPetType(matchedProfile?.species || pet.species),
    breed: breedValue,
    age: ageValue,
    weight: matchedProfile?.weight || pet.weight || '',
    allergies: normalizedAllergies,
    note: '',
  };
}

/**
 * Persists a newly created pet profile + initial weight log into pet-profiles storage
 * when created inline from the booking wizard.
 */
export function saveNewPetProfileToStorage(
  created: PetProfileEntity,
  initialWeightLog: WeightLog
): void {
  if (typeof window === 'undefined') return;
  try {
    const rawProfiles = window.localStorage.getItem(PET_PROFILES_STORAGE_KEY);
    const currentProfiles: PetProfileEntity[] = rawProfiles
      ? (JSON.parse(rawProfiles) as PetProfileEntity[])
      : INITIAL_PET_PROFILES;
    const nextProfiles = [...currentProfiles.filter((p) => p.id !== created.id), created];
    window.localStorage.setItem(PET_PROFILES_STORAGE_KEY, JSON.stringify(nextProfiles));

    const rawWeights = window.localStorage.getItem(PET_WEIGHTS_STORAGE_KEY);
    const currentWeights: WeightLog[] = rawWeights
      ? (JSON.parse(rawWeights) as WeightLog[])
      : INITIAL_WEIGHT_LOGS;
    const nextWeights = [...currentWeights, initialWeightLog];
    window.localStorage.setItem(PET_WEIGHTS_STORAGE_KEY, JSON.stringify(nextWeights));
  } catch {
    // ignore storage errors
  }
}

// ============================================================================
// BOOKING CODE & ICS CALENDAR GENERATOR
// ============================================================================

export function generateServiceBookingCode(existingBookingsCount = 0): string {
  const seq = String(Math.max(1, existingBookingsCount + 1)).padStart(4, '0');
  const randSuffix = Math.floor(1000 + Math.random() * 9000);
  // Format like DL-2026-0001 or DL-2026-XXXX
  return existingBookingsCount >= 0 && existingBookingsCount < 9999
    ? `DL-2026-${seq}`
    : `DL-2026-${randSuffix}`;
}

export function generateBookingIcsContent(booking: Booking, lang: Language): string {
  const dateParts = (booking.date || getTodayLocalIso()).split('-').map(Number);
  const rawStart = booking.startTime || (booking.timeSlot || '09:00').split(' - ')[0].trim();
  const timeParts = rawStart.split(':').map(Number);
  const year = dateParts[0] || 2026;
  const month = (dateParts[1] || 1) - 1;
  const day = dateParts[2] || 1;
  const hour = timeParts[0] ?? 9;
  const minute = timeParts[1] ?? 0;

  const durationMs = (booking.durationMinutes || 60) * 60 * 1000;
  const startDt = new Date(year, month, day, hour, minute, 0);
  const endDt = new Date(startDt.getTime() + durationMs);

  const toIcsTimestamp = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
      `T${pad(d.getHours())}${pad(d.getMinutes())}00`
    );
  };

  const summary =
    lang === 'vi'
      ? `Animora: ${booking.service} cho bé ${booking.petName || booking.petType}`
      : `Animora: ${booking.service} for ${booking.petName || booking.petType}`;

  const description = [
    `Mã lịch hẹn / Booking Code: ${booking.code || booking.id}`,
    `Dịch vụ / Service: ${booking.service}`,
    `Thú cưng / Pet: ${booking.petName || ''} (${booking.petType})`,
    `Khách hàng / Customer: ${booking.fullName} - ${booking.phone}`,
    `Hotline Animora: 0337 203 332`,
  ].join('\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Animora Pet Care//Service Booking//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${booking.code || booking.id}@animora.vn`,
    `DTSTAMP:${toIcsTimestamp(new Date())}`,
    `DTSTART:${toIcsTimestamp(startDt)}`,
    `DTEND:${toIcsTimestamp(endDt)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    'LOCATION:Animora Veterinary & Holistic Spa Center',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

// ============================================================================
// URL PARSER FOR /dat-lich AND /dat-lich/thanh-cong
// ============================================================================

export interface ServiceBookingUrlState {
  isBookingRoute: boolean;
  isSuccessRoute: boolean;
  preselectedServiceSlug: string | null;
}

export function parseServiceBookingUrl(
  pathname: string,
  search: string = ''
): ServiceBookingUrlState {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(search);
  const serviceParam = params.get('service');

  if (cleanPath === '/dat-lich/thanh-cong') {
    return {
      isBookingRoute: true,
      isSuccessRoute: true,
      preselectedServiceSlug: serviceParam ? resolveServiceBySlugOrName(serviceParam).slug : null,
    };
  }

  if (cleanPath === '/dat-lich') {
    return {
      isBookingRoute: true,
      isSuccessRoute: false,
      preselectedServiceSlug: serviceParam ? resolveServiceBySlugOrName(serviceParam).slug : null,
    };
  }

  return {
    isBookingRoute: false,
    isSuccessRoute: false,
    preselectedServiceSlug: null,
  };
}
