import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeVietnamPhone,
  isValidVietnamPhone,
  findOrCreateWalkInCustomer,
  upgradeWalkInToWebAccount,
  createWalkInPetProfile,
  getActivePetsForBooking,
  evaluateCustomerViolationStatus,
  checkInCustomerBooking,
  delayBookingBy30Minutes,
  markBookingNoShow,
  undoBookingNoShow,
  evaluateWeightPriceAdjustment,
  applyWeightPriceDecision,
  collectBookingPaymentAndIssueInvoice,
  createManualRefundOrCompensation,
  INITIAL_WALK_IN_CUSTOMERS,
  INITIAL_WALK_IN_PETS,
} from "./receptionistOpsData";
import type { Booking } from "@/types";

test("1. Chuẩn hóa SĐT, tìm trước khi tạo khách vãng lai chống trùng và nâng cấp lên tài khoản Web", () => {
  assert.equal(normalizeVietnamPhone("+84 915 888 999"), "0915888999");
  assert.equal(isValidVietnamPhone("0915 888 999"), true);
  assert.equal(isValidVietnamPhone("012345"), false);

  // Tìm khách đã tồn tại (Cô Nguyễn Thị Bạch Tuyết - 0915888999) -> không tạo trùng
  const existingRes = findOrCreateWalkInCustomer({
    fullName: "Tên Khác",
    phone: "+84 915-888-999",
    existingCustomers: INITIAL_WALK_IN_CUSTOMERS,
    actorName: "LT. Trần Ngọc Bảo Trâm",
  });
  assert.equal(existingRes.created, false);
  assert.equal(existingRes.customer.id, "cus-walkin-3");

  // Tạo khách vãng lai mới không cần mật khẩu
  const newRes = findOrCreateWalkInCustomer({
    fullName: "Bác Trần Văn Bình",
    phone: "0909 123 456",
    existingCustomers: INITIAL_WALK_IN_CUSTOMERS,
    actorName: "LT. Trần Ngọc Bảo Trâm",
  });
  assert.equal(newRes.created, true);
  assert.equal(newRes.customer.isWalkInGuest, true);
  assert.equal(newRes.customer.hasWebAccount, false);
  assert.ok(newRes.auditLog);

  // Nâng cấp khách vãng lai lên tài khoản Web bằng OTP
  const upg = upgradeWalkInToWebAccount({
    customerId: newRes.customer.id,
    email: "tranvanbinh@gmail.com",
    authMethod: "otp",
    otpCode: "123456",
    existingCustomers: newRes.customers,
    actorName: "LT. Trần Ngọc Bảo Trâm",
  });
  assert.equal(upg.updatedCustomer.hasWebAccount, true);
  assert.equal(upg.webUserAccount.id, newRes.customer.id);
  assert.equal(upg.webUserAccount.phone, "0909123456");
});

test("2. Giới hạn 4 loài (Chó, Mèo, Chuột, Thỏ), đánh dấu 'Do khách khai' và lọc thú cưng đã ẩn", () => {
  // Tạo thú cưng thuộc 4 loài hợp lệ
  const created = createWalkInPetProfile({
    customerId: "cus-walkin-3",
    ownerName: "Cô Nguyễn Thị Bạch Tuyết",
    ownerPhone: "0915888999",
    name: "Jerry",
    species: "Chuột",
    weightKg: 0.4,
    allergies: "Dị ứng mùn cưa thông",
    existingPets: INITIAL_WALK_IN_PETS,
    actorName: "LT. Trần Ngọc Bảo Trâm",
  });
  assert.equal(created.pet.species, "Chuột");
  assert.equal(created.pet.declarationSource, "customer_declared");
  assert.equal(created.pet.lockedByVet, false);

  // Chặn loài ngoài phạm vi (Chim, Bò sát...)
  assert.throws(
    () =>
      createWalkInPetProfile({
        customerId: "cus-walkin-3",
        ownerName: "Cô Nguyễn Thị Bạch Tuyết",
        ownerPhone: "0915888999",
        name: "Rio",
        species: "Chim",
        existingPets: INITIAL_WALK_IN_PETS,
        actorName: "LT. Trần Ngọc Bảo Trâm",
      }),
    /chỉ nhận 4 loài: Chó, Mèo, Chuột, Thỏ/
  );

  // Hàm dùng chung getActivePetsForBooking ẩn các thú cưng có isHidden = true
  const activeOnly = getActivePetsForBooking([
    { id: "1", name: "A", isHidden: false },
    { id: "2", name: "B", isHidden: true },
  ]);
  assert.equal(activeOnly.length, 1);
  assert.equal(activeOnly[0].id, "1");
});

test("3. Đếm violation trong 90 ngày, khóa trả sau khi đạt 2 lỗi và mở khóa sau 2 ca trả trước hoàn thành", () => {
  const now = new Date("2026-11-22T10:00:00.000Z");
  const phone = "0977888999";

  const bookings: Booking[] = [
    {
      id: "v1",
      code: "DL-V1",
      service: "Khám tổng quát",
      petType: "Chó",
      date: "2026-11-01",
      timeSlot: "09:00",
      fullName: "Khách Vi Phạm",
      phone,
      paymentTiming: "postpaid",
      status: "Không đến",
      noShowMarkedAt: "2026-11-01T09:20:00.000Z",
      createdAt: "2026-10-30T08:00:00.000Z",
    },
    {
      id: "v2",
      code: "DL-V2",
      service: "Spa & tắm",
      petType: "Chó",
      date: "2026-11-10",
      timeSlot: "10:00",
      fullName: "Khách Vi Phạm",
      phone,
      paymentTiming: "postpaid",
      status: "Đã hủy",
      cancelledAt: "2026-11-10T01:30:00.000Z",
      cancellationFee: 100000,
      createdAt: "2026-11-08T08:00:00.000Z",
    },
  ];

  const lockedState = evaluateCustomerViolationStatus(phone, bookings, now);
  assert.equal(lockedState.violationCount, 2);
  assert.equal(lockedState.isPostpaidLocked, true);
  assert.ok(lockedState.lockReasonMessage?.includes("khóa lựa chọn"));

  // ver1.4.1 (🔴2): Đơn online hẹn "counter" hoặc chưa thanh toán (unpaid) KHÔNG được tính mở khóa
  const bookingsWithLoopholeAttempt: Booking[] = [
    ...bookings,
    {
      id: "p-unpaid",
      code: "DL-P-UNPAID",
      service: "Khám tổng quát",
      petType: "Chó",
      date: "2026-11-12",
      timeSlot: "09:00",
      fullName: "Khách Vi Phạm",
      phone,
      bookingChannel: "online",
      paymentTiming: "prepaid",
      paymentState: "unpaid",
      paymentMethod: "online",
      status: "Hoàn thành",
      completedAt: "2026-11-12T10:00:00.000Z",
      createdAt: "2026-11-11T08:00:00.000Z",
    },
    {
      id: "p-online-counter",
      code: "DL-P-COUNTER",
      service: "Khám tổng quát",
      petType: "Chó",
      date: "2026-11-13",
      timeSlot: "09:00",
      fullName: "Khách Vi Phạm",
      phone,
      bookingChannel: "online",
      paymentTiming: "prepaid",
      paymentState: "paid",
      paymentMethod: "counter",
      status: "Hoàn thành",
      completedAt: "2026-11-13T10:00:00.000Z",
      createdAt: "2026-11-12T08:00:00.000Z",
    },
  ];
  const stillLocked = evaluateCustomerViolationStatus(phone, bookingsWithLoopholeAttempt, now);
  assert.equal(stillLocked.isPostpaidLocked, true);
  assert.equal(stillLocked.prepaidCompletedSinceLock, 0);

  // Khách hoàn thành 2 ca trả trước thực tế sau thời điểm bị khóa -> mở lại quyền trả sau & ghi postpaidUnlockedAt
  const bookingsWith2Prepaid: Booking[] = [
    ...bookings,
    {
      id: "p1",
      code: "DL-P1",
      service: "Khám tổng quát",
      petType: "Chó",
      date: "2026-11-15",
      timeSlot: "09:00",
      fullName: "Khách Vi Phạm",
      phone,
      bookingChannel: "online",
      paymentTiming: "prepaid",
      paymentState: "paid",
      paymentMethod: "vnpay",
      status: "Hoàn thành",
      completedAt: "2026-11-15T10:00:00.000Z",
      createdAt: "2026-11-14T08:00:00.000Z",
    },
    {
      id: "p2",
      code: "DL-P2",
      service: "Spa & tắm",
      petType: "Chó",
      date: "2026-11-18",
      timeSlot: "14:00",
      fullName: "Khách Vi Phạm",
      phone,
      bookingChannel: "counter",
      paymentTiming: "prepaid",
      paymentState: "paid",
      paymentMethod: "counter",
      status: "Hoàn thành",
      completedAt: "2026-11-18T15:30:00.000Z",
      createdAt: "2026-11-17T08:00:00.000Z",
    },
  ];

  const unlockedState = evaluateCustomerViolationStatus(phone, bookingsWith2Prepaid, now);
  assert.equal(unlockedState.isPostpaidLocked, false);
  assert.equal(unlockedState.violationCount, 0);
  assert.ok(unlockedState.postpaidUnlockedAt);
});

test("4. Check-in, Dời 30 phút (chặn tràn giờ nghỉ trưa 12:00-13:00), Không đến & Hoàn tác Không đến", () => {
  const sampleBooking: Booking = {
    id: "bk-test-1",
    code: "DL-2026-0888",
    serviceSlug: "kham-tong-quat",
    service: "Khám tổng quát",
    doctorId: "exp-vet-01",
    doctorName: "BS. Lê Huy Hoàng",
    petType: "Chó",
    petName: "Milo",
    date: "2026-11-22",
    timeSlot: "09:00 - 09:45",
    startTime: "09:00",
    endTime: "09:45",
    durationMinutes: 45,
    fullName: "Trần Quốc Bảo",
    phone: "0918234562",
    status: "Đã xác nhận",
    createdAt: "2026-11-20T08:00:00.000Z",
  };

  // Dời 30 phút hợp lệ lần 1 (09:00 -> 09:30 - 10:15)
  const delayOk = delayBookingBy30Minutes({
    booking: sampleBooking,
    allBookings: [sampleBooking],
    actorName: "LT. Trần Ngọc Bảo Trâm",
  });
  assert.equal(delayOk.ok, true);
  assert.equal(delayOk.updatedBooking?.startTime, "09:30");
  assert.equal(delayOk.updatedBooking?.endTime, "10:15");

  // ver1.4.1 (🟠5): Chặn dời 30 phút lần thứ 2 trên cùng một đơn
  const secondDelayBlocked = delayBookingBy30Minutes({
    booking: delayOk.updatedBooking!,
    allBookings: [delayOk.updatedBooking!],
    actorName: "LT. Trần Ngọc Bảo Trâm",
  });
  assert.equal(secondDelayBlocked.ok, false);
  assert.ok(secondDelayBlocked.error?.includes("tối đa 1 lần"));

  // Chặn dời 30 phút nếu tràn vào khung Nghỉ trưa 12:00-13:00 (11:00 + 30p = 11:30 - 12:15)
  const lunchConflict = delayBookingBy30Minutes({
    booking: { ...sampleBooking, startTime: "11:00", timeSlot: "11:00 - 11:45" },
    allBookings: [sampleBooking],
    actorName: "LT. Trần Ngọc Bảo Trâm",
  });
  assert.equal(lunchConflict.ok, false);
  assert.ok(lunchConflict.error?.includes("Nghỉ trưa cố định"));

  // Check-in
  const checkedIn = checkInCustomerBooking({
    booking: sampleBooking,
    actorName: "LT. Trần Ngọc Bảo Trâm",
  });
  assert.equal(checkedIn.updatedBooking.status, "Đã đến");

  // Đánh dấu Không đến & Hoàn tác Không đến (bắt buộc có lý do; đơn trả trước phải khôi phục paymentState = paid)
  const prepaidSample: Booking = {
    ...sampleBooking,
    paymentTiming: "prepaid",
    paymentState: "paid",
    estimatedPrice: 590000,
  };
  const noShowRes = markBookingNoShow({
    booking: prepaidSample,
    actorName: "LT. Trần Ngọc Bảo Trâm",
  });
  assert.equal(noShowRes.updatedBooking.status, "Không đến");
  assert.equal(noShowRes.updatedBooking.cancellationFee, 590000);

  const undoFail = undoBookingNoShow({
    booking: noShowRes.updatedBooking,
    reason: "",
    allBookings: [noShowRes.updatedBooking],
    actorName: "LT. Trần Ngọc Bảo Trâm",
  });
  assert.equal(undoFail.ok, false);

  const undoOk = undoBookingNoShow({
    booking: noShowRes.updatedBooking,
    reason: "Khách đến đúng giờ nhưng ngồi nhầm sảnh chờ tầng 1",
    allBookings: [noShowRes.updatedBooking],
    actorName: "LT. Trần Ngọc Bảo Trâm",
  });
  assert.equal(undoOk.ok, true);
  assert.equal(undoOk.updatedBooking?.status, "Đã đến");
  assert.equal(undoOk.updatedBooking?.paymentState, "paid");
  assert.equal(undoOk.updatedBooking?.cancellationFee, 0);
  assert.ok(undoOk.auditLog?.reason?.includes("sảnh chờ"));
});

test("5. Điều chỉnh giá theo cân nặng thực tế: Tự tính giá mới, Khách đồng ý vs. Khách từ chối (0đ, 0 violation)", () => {
  const spaBooking: Booking = {
    id: "bk-spa-1",
    code: "DL-2026-0999",
    serviceSlug: "spa-tam",
    service: "Spa & tắm",
    petType: "Chó",
    petName: "Bơ",
    weightRange: "under_5",
    declaredWeightKg: 4.2,
    estimatedPrice: 490000,
    paymentTiming: "prepaid",
    paymentState: "paid",
    date: "2026-11-22",
    timeSlot: "10:00",
    fullName: "Phan Thị Đinh Thùy",
    phone: "0337203332",
    status: "Đã đến",
    createdAt: "2026-11-21T08:00:00.000Z",
  };

  // Cân thực tế tăng lên 12.5kg (hạng 10_to_20 -> giá 790.000đ, chênh +300.000đ)
  const quote = evaluateWeightPriceAdjustment(spaBooking, 12.5);
  assert.equal(quote.oldPrice, 490000);
  assert.equal(quote.newPrice, 790000);
  assert.equal(quote.differenceAmount, 300000);
  assert.equal(quote.financialAction, "prepaid_surcharge");

  // Nhánh 1: Khách đồng ý -> tạo phiếu thu bù 300.000đ
  const accepted = applyWeightPriceDecision({
    booking: spaBooking,
    actualWeightKg: 12.5,
    weightSource: "counter_measured",
    customerAccepted: true,
    actorName: "LT. Trần Ngọc Bảo Trâm",
  });
  assert.equal(accepted.updatedBooking.estimatedPrice, 790000);
  assert.equal(accepted.manualLedgerEntry?.kind, "surcharge");
  assert.equal(accepted.manualLedgerEntry?.amount, 300000);

  // Nhánh 2: Khách không đồng ý -> trả bé lại, 0đ, cancelWithoutPenalty = true, hoàn 100% tiền trả trước (490.000đ)
  const declined = applyWeightPriceDecision({
    booking: spaBooking,
    actualWeightKg: 12.5,
    weightSource: "vet_measured",
    customerAccepted: false,
    actorName: "LT. Trần Ngọc Bảo Trâm",
  });
  assert.equal(declined.updatedBooking.status, "Đã hủy");
  assert.equal(declined.updatedBooking.cancelWithoutPenalty, true);
  assert.equal(declined.updatedBooking.cancellationFee, 0);
  assert.equal(declined.updatedBooking.refundAmount, 490000);
  assert.equal(declined.manualLedgerEntry?.kind, "refund");
  assert.equal(declined.manualLedgerEntry?.amount, 490000);

  // Kiểm tra đơn hủy do từ chối giá cân mới KHÔNG bị tính vào violation_count
  const violationCheck = evaluateCustomerViolationStatus(
    spaBooking.phone,
    [declined.updatedBooking],
    new Date("2026-11-22T12:00:00.000Z")
  );
  assert.equal(violationCheck.violationCount, 0);
});

test("6. Thu tiền ('Đã thu'), Xuất hóa đơn và Ghi nhận Hoàn/Bù tiền thủ công", () => {
  const booking: Booking = {
    id: "bk-pay-1",
    code: "DL-2026-0777",
    serviceSlug: "kham-tong-quat",
    service: "Khám tổng quát",
    petType: "Mèo",
    petName: "Mây Mây",
    weightRange: "under_5",
    estimatedPrice: 590000,
    paymentTiming: "postpaid",
    paymentState: "unpaid",
    date: "2026-11-22",
    timeSlot: "14:00",
    fullName: "Nguyễn Minh Anh",
    phone: "0901234567",
    status: "Đã đến",
    createdAt: "2026-11-22T08:00:00.000Z",
  };

  const collected = collectBookingPaymentAndIssueInvoice({
    booking,
    paymentMethod: "cash",
    actorName: "LT. Trần Ngọc Bảo Trâm",
  });
  assert.equal(collected.updatedBooking.paymentState, "paid");
  assert.equal(collected.updatedBooking.status, "Hoàn thành");
  assert.ok(collected.invoice.invoiceCode.startsWith("INV-"));
  assert.equal(collected.invoice.finalAmount, 590000);

  const manualRef = createManualRefundOrCompensation({
    bookingId: booking.id,
    bookingCode: booking.code!,
    customerName: booking.fullName,
    customerPhone: booking.phone,
    kind: "refund",
    amount: 100000,
    method: "vnpay",
    reason: "Hoàn tiền chênh lệch hạng cân cho khách",
    actorName: "LT. Trần Ngọc Bảo Trâm",
  });
  assert.equal(manualRef.entry.amount, 100000);
  assert.equal(manualRef.auditLog.action, "manual_refund_compensation");
});

