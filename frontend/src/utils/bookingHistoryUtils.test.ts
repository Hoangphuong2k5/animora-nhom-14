import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CANCEL_HOURS,
  LATE_CANCEL_FEE_HOURS,
  LATE_CANCEL_FEE_PERCENT,
  maskBookingPhone,
  maskBookingEmail,
  getHoursUntilBooking,
  canModifyBooking,
  getBookingModificationPolicy,
  getUpcomingCountdownText,
  formatBookingDateWithWeekday,
  getBookingTabCategory,
  isOverdueBooking,
  getCancellationOutcome,
  doesBookingBelongToUser,
  filterAndSortBookings,
  lookupSingleBooking,
  checkLookupRateLimit,
  evaluateAddBookingToPetProfile,
  createCareRecordFromBooking,
  buildRebookUrl,
  parseMyBookingsUrl,
} from './bookingHistoryUtils';
import { createSeededServiceBookings, getTimeSlotsForDate } from '@/data/serviceBookingData';
import { initialPets } from '@/data/mockData';
import { Booking, UserAccount } from '@/types';

test('maskBookingPhone and maskBookingEmail mask sensitive owner contact details', () => {
  assert.equal(maskBookingPhone('0337 203 332'), '0337 *** 332');
  assert.equal(maskBookingPhone('+84337203332'), '0337 *** 332');
  assert.equal(maskBookingEmail('phanthidinhthuy6@gmail.com'), 'p***@gmail.com');
  assert.equal(maskBookingEmail('minhanh@animora.vn'), 'm***@animora.vn');
});

test('canModifyBooking enforces status rules and allows modification before appointment', () => {
  assert.equal(CANCEL_HOURS, 0);
  const now = new Date(2026, 10, 2, 9, 0, 0); // 2026-11-02 09:00

  // 4 days away, status "Đã xác nhận" -> allowed
  const farBooking: Booking = {
    id: 'bk-far',
    code: 'DL-2026-0001',
    service: 'Khám tổng quát',
    petType: 'Mèo',
    date: '2026-11-06',
    timeSlot: '09:00',
    fullName: 'Phan Thị Đình Thùy',
    phone: '0337 203 332',
    status: 'Đã xác nhận',
    createdAt: '2026-11-01T00:00:00Z',
  };
  const farCheck = canModifyBooking(farBooking, now);
  assert.equal(farCheck.allowed, true);
  assert.ok(farCheck.hoursRemaining >= 96);

  // 9 hours away, status "Mới" -> allowed (no longer locked within 24h)
  const nearBooking: Booking = {
    ...farBooking,
    id: 'bk-near',
    code: 'DL-2026-0002',
    date: '2026-11-02',
    timeSlot: '18:00',
    status: 'Mới',
  };
  const nearCheck = canModifyBooking(nearBooking, now);
  assert.equal(nearCheck.allowed, true);
  assert.equal(getHoursUntilBooking(nearBooking, now), 9);

  // Completed booking -> disallowed with reason status
  const completedBooking: Booking = {
    ...farBooking,
    id: 'bk-done',
    status: 'Hoàn thành',
  };
  const doneCheck = canModifyBooking(completedBooking, now);
  assert.equal(doneCheck.allowed, false);
  assert.equal(doneCheck.reason, 'status');
});

test('seeded bookings contain 6 owner bookings (2 upcoming with 1 within 24h, 2 completed, 1 cancelled, 1 no-show)', () => {
  const now = new Date(2026, 10, 2, 2, 0, 0);
  const todayIso = '2026-11-02';
  const allSeeded = createSeededServiceBookings(todayIso, now);

  const demoUser: UserAccount = {
    id: 'user-demo-owner',
    fullName: 'Phan Thị Đình Thùy',
    email: 'phanthidinhthuy6@gmail.com',
    phone: '0337203332',
    passwordHash: '123456',
    role: 'owner',
    createdAt: '2026-01-15',
    addresses: [],
  };

  const userBookings = allSeeded.filter((b) => doesBookingBelongToUser(b, demoUser));
  assert.equal(userBookings.length, 6);

  const upcoming = filterAndSortBookings(userBookings, { tab: 'upcoming', now });
  const past = filterAndSortBookings(userBookings, { tab: 'past', now });
  const cancelled = filterAndSortBookings(userBookings, { tab: 'cancelled', now });

  assert.equal(upcoming.length, 2);
  assert.equal(past.length, 3); // 2 completed + 1 no-show
  assert.equal(cancelled.length, 1);

  // Verify upcoming bookings are allowed to be modified before appointment
  const modStates = upcoming.map((b) => canModifyBooking(b, now));
  assert.equal(modStates.every((m) => m.allowed), true);
});

test('past tab only holds finalized bookings; overdue unfinished bookings stay in upcoming and remain modifiable', () => {
  const now = new Date(2026, 10, 16, 9, 0, 0);
  const base: Booking = {
    id: 'bk-overdue',
    code: 'DL-2026-0037',
    service: 'Khám tổng quát',
    petType: 'Chó',
    date: '2026-11-13',
    timeSlot: '10:00',
    fullName: 'Animora User',
    phone: '0900 000 000',
    status: 'Mới',
    createdAt: '2026-11-12T00:00:00Z',
  };

  assert.equal(getBookingTabCategory(base, now), 'upcoming');
  assert.equal(isOverdueBooking(base, now), true);
  const overduePolicy = getBookingModificationPolicy(base, now);
  assert.equal(overduePolicy.canReschedule, true);
  assert.equal(overduePolicy.canCancel, true);
  assert.equal(overduePolicy.reason, 'overdue');
  assert.equal(overduePolicy.feePercent, 0);

  const done: Booking = { ...base, id: 'bk-done', status: 'Hoàn thành' };
  assert.equal(getBookingTabCategory(done, now), 'past');
  assert.equal(isOverdueBooking(done, now), false);
  const donePolicy = getBookingModificationPolicy(done, now);
  assert.equal(donePolicy.canReschedule, false);
  assert.equal(donePolicy.canCancel, false);

  const cancelled: Booking = { ...base, id: 'bk-cx', status: 'Đã hủy' };
  assert.equal(getBookingTabCategory(cancelled, now), 'cancelled');
  assert.equal(getBookingModificationPolicy(cancelled, now).canCancel, false);
});

test('getCancellationOutcome computes fee and refund for postpaid and prepaid-paid bookings', () => {
  const base: Booking = {
    id: 'bk-out',
    code: 'DL-2026-0050',
    service: 'Khám tổng quát',
    petType: 'Chó',
    date: '2026-11-20',
    timeSlot: '10:00',
    fullName: 'Animora User',
    phone: '0900 000 000',
    status: 'Mới',
    createdAt: '2026-11-10T00:00:00Z',
  };
  const price = getBookingModificationPolicy(base, new Date(2026, 10, 16, 9, 0, 0))
    .estimatedPrice;

  // >= 24h, postpaid -> free
  const now24 = new Date(2026, 10, 16, 9, 0, 0);
  assert.equal(getCancellationOutcome(base, now24).kind, 'free');

  // >= 24h, prepaid & paid -> full refund
  const prepaid: Booking = {
    ...base,
    paymentTiming: 'prepaid',
    paymentState: 'paid',
  };
  const full = getCancellationOutcome(prepaid, now24);
  assert.equal(full.kind, 'refund_full');
  assert.equal(full.refundAmount, price);
  assert.equal(full.feeAmount, 0);

  // 2h before, postpaid -> free cancellation (no fee due)
  const now2h = new Date(2026, 10, 20, 8, 0, 0);
  const feeDue = getCancellationOutcome(base, now2h);
  assert.equal(feeDue.kind, 'free');
  assert.equal(feeDue.feeAmount, 0);
  assert.equal(feeDue.refundAmount, 0);

  // 2h before, prepaid & paid -> 100% full refund
  const partial = getCancellationOutcome(prepaid, now2h);
  assert.equal(partial.kind, 'refund_full');
  assert.equal(partial.feeAmount, 0);
  assert.equal(partial.refundAmount, price);

  // prepaid but unpaid -> no refund
  const unpaid = getCancellationOutcome(
    { ...base, paymentTiming: 'prepaid', paymentState: 'unpaid' },
    now24
  );
  assert.equal(unpaid.kind, 'free');
  assert.equal(unpaid.refundAmount, 0);

  // overdue unfinished -> free
  const overdueNow = new Date(2026, 10, 25, 9, 0, 0);
  assert.equal(getCancellationOutcome(base, overdueNow).kind, 'free');
});

test('lookupSingleBooking matches case-insensitive code and normalized phone with or without spaces/+84, and returns generic error on mismatch', () => {
  const now = new Date(2026, 10, 2, 9, 0, 0);
  const seeded = createSeededServiceBookings('2026-11-02', now);

  // Exact match with spaces
  const res1 = lookupSingleBooking(seeded, '  dl-2026-0001 ', '0337 203 332', 'vi');
  assert.ok(res1.found);
  assert.equal(res1.found?.code, 'DL-2026-0001');
  assert.equal(res1.error, null);

  // Exact match with +84
  const res2 = lookupSingleBooking(seeded, 'DL-2026-0001', '+84337203332', 'vi');
  assert.ok(res2.found);
  assert.equal(res2.found?.code, 'DL-2026-0001');

  // Wrong code -> generic error
  const wrongCode = lookupSingleBooking(seeded, 'DL-2026-9999', '0337 203 332', 'vi');
  assert.equal(wrongCode.found, null);
  assert.equal(
    wrongCode.error,
    'Không tìm thấy lịch hẹn. Vui lòng kiểm tra lại mã và số điện thoại.'
  );

  // Wrong phone -> exact same generic error
  const wrongPhone = lookupSingleBooking(seeded, 'DL-2026-0001', '0912 345 678', 'vi');
  assert.equal(wrongPhone.found, null);
  assert.equal(wrongPhone.error, wrongCode.error);

  // Honeypot filled -> rejected
  const botAttempt = lookupSingleBooking(
    seeded,
    'DL-2026-0001',
    '0337 203 332',
    'vi',
    'spam-bot'
  );
  assert.equal(botAttempt.found, null);
});

test('checkLookupRateLimit allows up to 5 attempts per minute and blocks the 6th', () => {
  const baseTime = 1_700_000_000_000;
  let timestamps: number[] = [];

  for (let i = 0; i < 5; i++) {
    const res = checkLookupRateLimit(timestamps, baseTime + i * 1000);
    assert.equal(res.allowed, true);
    timestamps = res.updatedTimestamps;
  }

  // 6th attempt within the same minute is blocked
  const sixth = checkLookupRateLimit(timestamps, baseTime + 10_000);
  assert.equal(sixth.allowed, false);

  // After 61 seconds, allowed again
  const afterWindow = checkLookupRateLimit(timestamps, baseTime + 61_000);
  assert.equal(afterWindow.allowed, true);
});

test('countdown text, weekday formatting, CareRecord eligibility, and URL parsing work accurately', () => {
  const now = new Date(2026, 10, 2, 9, 0, 0); // 2026-11-02
  assert.equal(
    getUpcomingCountdownText({ date: '2026-11-02', timeSlot: '18:00' }, 'vi', now),
    'Hôm nay'
  );
  assert.equal(
    getUpcomingCountdownText({ date: '2026-11-03', timeSlot: '09:00' }, 'vi', now),
    'Ngày mai'
  );
  assert.equal(
    getUpcomingCountdownText({ date: '2026-11-05', timeSlot: '09:00' }, 'vi', now),
    'Còn 3 ngày'
  );

  // 20/11/2026 is Friday (Thứ Sáu)
  assert.equal(
    formatBookingDateWithWeekday('2026-11-20', '09:00', 'vi'),
    'Thứ Sáu, 20/11/2026 · 09:00'
  );

  const seeded = createSeededServiceBookings('2026-11-02', now);
  const completedMayMay = seeded.find((b) => b.code === 'DL-2026-0003')!;
  const evalResult = evaluateAddBookingToPetProfile(completedMayMay, initialPets);
  assert.equal(evalResult.eligible, true);
  assert.equal(evalResult.matchedPet?.name, 'Mây Mây');
  assert.ok(evalResult.careType);

  const record = createCareRecordFromBooking(
    completedMayMay,
    evalResult.matchedPet!,
    evalResult.careType!
  );
  assert.equal(record.pet, 'pet-1');
  assert.equal(record.status, 'done');

  assert.equal(
    buildRebookUrl(completedMayMay),
    '/dat-lich?service=kham-tong-quat&pet=M%C3%A2y+M%C3%A2y'
  );

  assert.deepEqual(parseMyBookingsUrl('/lich-hen', '?code=dl-2026-0001'), {
    isMyBookingsRoute: true,
    detailCode: null,
    queryCode: 'DL-2026-0001',
    action: 'list',
  });
  assert.deepEqual(parseMyBookingsUrl('/lich-hen/dl-2026-0002', ''), {
    isMyBookingsRoute: true,
    detailCode: 'DL-2026-0002',
    queryCode: 'DL-2026-0002',
    action: 'detail',
  });
  assert.equal(
    parseMyBookingsUrl('/lich-hen/dl-2026-0002/doi-lich', '').action,
    'reschedule'
  );
  assert.deepEqual(parseMyBookingsUrl('/lich-hen/dl-2026-0002/huy/', ''), {
    isMyBookingsRoute: true,
    detailCode: 'DL-2026-0002',
    queryCode: 'DL-2026-0002',
    action: 'cancel',
  });
});

test('getBookingModificationPolicy and getCancellationOutcome enforce free cancellation and 100% refund for prepaid', () => {
  assert.equal(LATE_CANCEL_FEE_HOURS, 0);
  assert.equal(LATE_CANCEL_FEE_PERCENT, 0);
  const now = new Date(2026, 10, 2, 9, 0, 0); // 2026-11-02 09:00

  const baseBooking: Booking = {
    id: 'bk-policy',
    code: 'DL-2026-0099',
    serviceSlug: 'kham-tong-quat',
    service: 'Khám tổng quát',
    petType: 'Mèo',
    weightRange: 'under_5',
    date: '2026-11-04',
    timeSlot: '09:00',
    fullName: 'Test User',
    phone: '0337203332',
    status: 'Đã xác nhận',
    createdAt: '2026-11-01T00:00:00Z',
  };

  // 48h away -> reschedule & cancel free
  const pFar = getBookingModificationPolicy(baseBooking, now);
  assert.equal(pFar.canReschedule, true);
  assert.equal(pFar.canCancel, true);
  assert.equal(pFar.feePercent, 0);
  assert.equal(pFar.feeAmount, 0);

  // 9h away -> reschedule & cancel free
  const pMid = getBookingModificationPolicy(
    { ...baseBooking, date: '2026-11-02', timeSlot: '18:00' },
    now
  );
  assert.equal(pMid.canReschedule, true);
  assert.equal(pMid.canCancel, true);
  assert.equal(pMid.feePercent, 0);
  assert.equal(pMid.feeAmount, 0);

  // 2h away (< 3h) -> free cancellation with 0 VND fee (no more 50% penalty)
  const pLate = getBookingModificationPolicy(
    { ...baseBooking, date: '2026-11-02', timeSlot: '11:00' },
    now
  );
  assert.equal(pLate.canReschedule, true);
  assert.equal(pLate.canCancel, true);
  assert.equal(pLate.feePercent, 0);
  assert.equal(pLate.feeAmount, 0);

  // Prepaid & paid booking -> 100% full refund
  const prepaidBooking: Booking = {
    ...baseBooking,
    date: '2026-11-02',
    timeSlot: '11:00',
    paymentTiming: 'prepaid',
    paymentState: 'paid',
  };
  const outcomePrepaid = getCancellationOutcome(prepaidBooking, now);
  assert.equal(outcomePrepaid.kind, 'refund_full');
  assert.equal(outcomePrepaid.feeAmount, 0);
  assert.equal(outcomePrepaid.refundAmount, 590000);

  // Postpaid booking -> free cancellation (0 VND)
  const postpaidBooking: Booking = {
    ...baseBooking,
    date: '2026-11-02',
    timeSlot: '11:00',
    paymentTiming: 'postpaid',
    paymentState: 'unpaid',
  };
  const outcomePostpaid = getCancellationOutcome(postpaidBooking, now);
  assert.equal(outcomePostpaid.kind, 'free');
  assert.equal(outcomePostpaid.feeAmount, 0);
  assert.equal(outcomePostpaid.refundAmount, 0);
});

test('getTimeSlotsForDate detects overlapping duration intervals and ignores expired Prepaid_Pending bookings', () => {
  const now = new Date('2026-11-10T08:00:00.000Z');
  const existing: Booking[] = [
    {
      id: 'bk-90min',
      code: 'DL-90',
      userId: 'u1',
      serviceSlug: 'spa-tam',
      service: 'Spa & tắm',
      doctorId: 'doc-1',
      petType: 'Chó',
      petName: 'Milo',
      date: '2026-11-12',
      timeSlot: '09:00 - 10:30',
      startTime: '09:00',
      endTime: '10:30',
      durationMinutes: 90,
      fullName: 'Test User',
      phone: '0901234567',
      status: 'Đã xác nhận',
      createdAt: '2026-11-10T07:00:00.000Z',
    },
    {
      id: 'bk-expired-prepaid',
      code: 'DL-EXP',
      userId: 'u1',
      serviceSlug: 'kham-tong-quat',
      service: 'Khám tổng quát',
      doctorId: 'doc-1',
      petType: 'Chó',
      petName: 'Milo',
      date: '2026-11-12',
      timeSlot: '14:00 - 14:45',
      startTime: '14:00',
      endTime: '14:45',
      durationMinutes: 45,
      fullName: 'Test User',
      phone: '0901234567',
      paymentTiming: 'prepaid',
      paymentState: 'unpaid',
      status: 'Mới',
      createdAt: '2026-11-10T07:00:00.000Z',
      paymentExpiresAt: '2026-11-10T07:30:00.000Z',
    } as Booking & { paymentExpiresAt?: string },
  ];

  const slots = getTimeSlotsForDate('2026-11-12', existing, now, undefined, {
    petName: 'Milo',
    doctorId: 'doc-1',
    userId: 'u1',
    durationMinutes: 60,
  });

  const slot09 = slots.find((s) => s.time === '09:00');
  const slot10 = slots.find((s) => s.time === '10:00');
  const slot14 = slots.find((s) => s.time === '14:00');

  assert.equal(slot09?.disabled, true);
  assert.equal(slot10?.disabled, true); // overlaps 09:00-10:30
  assert.equal(slot14?.disabled, false); // expired prepaid_pending released
});
