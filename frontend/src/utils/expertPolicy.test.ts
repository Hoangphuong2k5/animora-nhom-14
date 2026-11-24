import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CARE_SERVICE_STAGES,
  applyDoctorPetMedicalUpdate,
  canCancelShiftRequest,
  canRequestRegularLeaveOnDate,
  confirmPetCustomerNoteByDoctor,
  evaluateMonthlyLeaveQuota,
  evaluateWorkingHoursPolicy,
  getCareStageMeta,
  getNextCareStage,
  validateShiftRequestKindForEmployment,
} from "./expertPolicy";
import {
  readMedicineBoxItems,
  recordDoctorMedicineUsage,
  reportOutOfStockToManager,
} from "./medicineBoxSync";
import {
  createEmergencyLeaveByManager,
  getDoctorCareRecordsForCustomerPet,
  readExpertStore,
  reviewExpertCertificate,
  syncCustomerBookingToExpertStore,
  updateExpertShiftRequestDecision,
  writeExpertStore,
} from "./clinicalSync";
import { MEDICINE_CATALOG } from "@/data/medicineCatalog";
import { SHOP_PRODUCTS } from "@/data/shopData";
import { resolveExpertIdentityFromSession } from "@/components/expert/provider/sessionResolver";
import type { ExpertAppointment, ExpertShift, ShiftRequest } from "@/types/expert.type";

describe("Doctor Leave, Overtime Policy & Shop Medicine Catalog Tests", () => {
  const expertId = "exp-vet-01";

  it("enforces max 4 leave days per month with no rollover and flags over-limit requests", () => {
    const shifts: ExpertShift[] = [
      { id: "s1", expertId, date: "2026-11-02", shift: "morning", shiftType: "rotational_off" },
      { id: "s2", expertId, date: "2026-11-09", shift: "morning", shiftType: "rotational_off" },
      // Tháng trước không được cộng dồn sang tháng 11
      { id: "s-prev", expertId, date: "2026-10-15", shift: "morning", shiftType: "rotational_off" },
    ];
    const requests: ShiftRequest[] = [
      {
        id: "r1",
        expertId,
        kind: "leave",
        leaveType: "sick",
        date: "2026-11-12",
        reason: "Nghỉ ốm",
        status: "approved",
        createdAt: "2026-11-10T08:00:00Z",
      },
      {
        id: "r2",
        expertId,
        kind: "leave",
        leaveType: "unpaid",
        date: "2026-11-19",
        reason: "Việc gia đình",
        status: "pending",
        createdAt: "2026-11-11T08:00:00Z",
      },
    ];

    const novSummary = evaluateMonthlyLeaveQuota(requests, shifts, expertId, "2026-11-25");
    assert.strictEqual(novSummary.usedDays, 4);
    assert.strictEqual(novSummary.remainingDays, 0);
    assert.strictEqual(novSummary.isAtOrOverLimit, true);
    assert.strictEqual(novSummary.exceedsOnNewRequest, true);
    assert.ok(novSummary.warningMessage?.includes("4 ngày nghỉ/tháng"));

    // Sang tháng 12 reset lại từ đầu (0/4 ngày)
    const decSummary = evaluateMonthlyLeaveQuota(requests, shifts, expertId, "2026-12-01");
    assert.strictEqual(decSummary.usedDays, 0);
    assert.strictEqual(decSummary.remainingDays, 4);
    assert.strictEqual(decSummary.exceedsOnNewRequest, false);
  });

  it("forbids cancelling an approved leave request while allowing pending requests", () => {
    const approvedLeave: ShiftRequest = {
      id: "r-app",
      expertId,
      kind: "leave",
      leaveType: "sick",
      date: "2026-11-12",
      reason: "Nghỉ ốm",
      status: "approved",
      createdAt: "2026-11-10T08:00:00Z",
    };
    const pendingLeave: ShiftRequest = {
      ...approvedLeave,
      id: "r-pend",
      status: "pending",
    };

    assert.strictEqual(canCancelShiftRequest(approvedLeave), false);
    assert.strictEqual(canCancelShiftRequest(pendingLeave), true);
  });

  it("enforces normal working hours (<= 8h/day, <= 48h/week) and Art. 107 12h/day cap for Full-time & Vet", () => {
    const shifts: ExpertShift[] = [
      { id: "f1", expertId, date: "2026-11-16", shift: "morning", shiftType: "fixed" },
      { id: "f2", expertId, date: "2026-11-16", shift: "afternoon", shiftType: "fixed" },
      { id: "f3", expertId, date: "2026-11-17", shift: "morning", shiftType: "fixed" },
      { id: "f4", expertId, date: "2026-11-17", shift: "afternoon", shiftType: "fixed" },
      { id: "f5", expertId, date: "2026-11-18", shift: "morning", shiftType: "fixed" },
      { id: "f6", expertId, date: "2026-11-18", shift: "afternoon", shiftType: "fixed" },
      { id: "f7", expertId, date: "2026-11-19", shift: "morning", shiftType: "fixed" },
      { id: "f8", expertId, date: "2026-11-19", shift: "afternoon", shiftType: "fixed" },
      { id: "f9", expertId, date: "2026-11-20", shift: "morning", shiftType: "fixed" },
      { id: "f10", expertId, date: "2026-11-20", shift: "afternoon", shiftType: "fixed" },
      { id: "f11", expertId, date: "2026-11-21", shift: "morning", shiftType: "fixed" },
      { id: "f12", expertId, date: "2026-11-21", shift: "afternoon", shiftType: "fixed" },
    ];

    // 6 ngày x 8h = 48h/tuần, 8h/ngày -> hợp lệ hoàn toàn
    const normalRes = evaluateWorkingHoursPolicy(shifts, expertId, "2026-11-16");
    assert.strictEqual(normalRes.dailyHours, 8);
    assert.strictEqual(normalRes.weeklyHours, 48);
    assert.strictEqual(normalRes.exceedsNormalDaily, false);
    assert.strictEqual(normalRes.exceedsNormalWeekly, false);
    assert.strictEqual(normalRes.exceedsArt107DailyCap, false);

    // Thêm 1 ca Chủ Nhật -> 52h/tuần > 48h/tuần
    const overWeekRes = evaluateWorkingHoursPolicy(
      [...shifts, { id: "f13", expertId, date: "2026-11-22", shift: "morning", shiftType: "fixed" }],
      expertId,
      "2026-11-22"
    );
    assert.strictEqual(overWeekRes.weeklyHours, 52);
    assert.strictEqual(overWeekRes.exceedsNormalWeekly, true);
    assert.ok(overWeekRes.warnings.length > 0);
  });

  it("sources all prescription medicines strictly from the Shop catalog", () => {
    assert.ok(MEDICINE_CATALOG.length > 0);
    for (const med of MEDICINE_CATALOG) {
      const shopProduct = SHOP_PRODUCTS.find((p) => p.id === med.shopProductId);
      assert.ok(shopProduct, `Missing Shop product for medicine ${med.id}`);
      assert.strictEqual(shopProduct.requiresPrescription, true);
      assert.strictEqual(shopProduct.category, "medicine");
    }
  });

  it("removes overtime, extra_shift, shift_swap and enforces Full-time leave-only with no-booking check", () => {
    assert.strictEqual(
      validateShiftRequestKindForEmployment("overtime", "full_time").allowed,
      false
    );
    assert.strictEqual(
      validateShiftRequestKindForEmployment("extra_shift", "full_time").allowed,
      false
    );
    assert.strictEqual(
      validateShiftRequestKindForEmployment("shift_swap", "full_time", "groomer").allowed,
      false
    );
    assert.strictEqual(
      validateShiftRequestKindForEmployment("leave", "full_time", "vet").allowed,
      true
    );
    assert.strictEqual(
      validateShiftRequestKindForEmployment("leave", "full_time", "groomer").allowed,
      true
    );

    const sampleAppts: ExpertAppointment[] = [
      {
        id: "apt-1",
        code: "ANM-SPA-1001",
        expertId: "exp-spa-01",
        petId: "pet-001",
        ownerId: "own-001",
        serviceId: "srv-spa-01",
        startAt: "2026-11-18T09:00",
        status: "upcoming",
        paymentTiming: "prepaid",
        paymentState: "paid",
        isPreferredStaff: true,
        createdAt: "2026-11-16T08:00",
        history: [],
      },
      {
        id: "apt-2",
        code: "ANM-SPA-1002",
        expertId: "exp-spa-01",
        petId: "pet-002",
        ownerId: "own-002",
        serviceId: "srv-spa-01",
        startAt: "2026-11-20T10:00",
        status: "upcoming",
        paymentTiming: "postpaid",
        paymentState: "unpaid",
        isPreferredStaff: false,
        createdAt: "2026-11-16T08:00",
        history: [],
      },
    ];

    // Ngày đã có lịch khách CHỌN ĐÍCH DANH -> chặn xin nghỉ phép thường
    const blockedLeave = canRequestRegularLeaveOnDate(
      "2026-11-18",
      sampleAppts,
      "exp-spa-01",
      "2026-11-16"
    );
    assert.strictEqual(blockedLeave.allowed, false);
    assert.strictEqual(blockedLeave.conflictingAppointments.length, 1);

    // ver1.4.1 (🔴8): Ngày chỉ có lịch hệ thống TỰ GÁN -> vẫn cho phép gửi đơn nghỉ phép thường kèm danh sách ca cần chuyển giao
    const reassignableLeave = canRequestRegularLeaveOnDate(
      "2026-11-20",
      sampleAppts,
      "exp-spa-01",
      "2026-11-16"
    );
    assert.strictEqual(reassignableLeave.allowed, true);
    assert.strictEqual(reassignableLeave.conflictingAppointments.length, 0);
    assert.strictEqual(reassignableLeave.reassignableAppointments.length, 1);

    // Ngày chưa có khách đặt lịch (T5) -> được phép gửi đơn xin nghỉ phép thường
    const allowedLeave = canRequestRegularLeaveOnDate(
      "2026-11-19",
      sampleAppts,
      "exp-spa-01",
      "2026-11-16"
    );
    assert.strictEqual(allowedLeave.allowed, true);
    assert.strictEqual(allowedLeave.conflictingAppointments.length, 0);
    assert.strictEqual(allowedLeave.reassignableAppointments.length, 0);

    // Ngày Chủ Nhật (2026-11-22) -> bị chặn vì là ngày nghỉ cố định (T2–T7)
    const sundayLeave = canRequestRegularLeaveOnDate(
      "2026-11-22",
      sampleAppts,
      "exp-spa-01",
      "2026-11-16"
    );
    assert.strictEqual(sundayLeave.allowed, false);
    assert.ok(sundayLeave.reason?.includes("Chủ Nhật"));
  });

  it("defines the 4 standard care service stages in exact order", () => {
    assert.deepStrictEqual(
      CARE_SERVICE_STAGES.map((s) => s.id),
      ["checked_in", "performing", "finishing", "ready_handover"]
    );
    assert.strictEqual(getCareStageMeta("checked_in").stepNumber, 1);
    assert.strictEqual(getNextCareStage("checked_in"), "performing");
    assert.strictEqual(getNextCareStage("performing"), "finishing");
    assert.strictEqual(getNextCareStage("finishing"), "ready_handover");
    assert.strictEqual(getNextCareStage("ready_handover"), null);
  });

  it("syncs certificate approval, full-time leave approval, and care service notes across stores", () => {
    const storageMap = new Map<string, string>();
    const prevWindow = (globalThis as { window?: unknown }).window;
    (globalThis as { window?: unknown }).window = {
      localStorage: {
        getItem: (k: string) => storageMap.get(k) ?? null,
        setItem: (k: string, v: string) => {
          storageMap.set(k, v);
        },
        removeItem: (k: string) => {
          storageMap.delete(k);
        },
      },
      dispatchEvent: () => true,
    };

    try {
      // 1. Duyệt chứng chỉ pending của NV chăm sóc Full-time (exp-spa-01)
      const resCert = reviewExpertCertificate("exp-spa-01", "c-06", "approved");
      assert.ok(resCert);
      const updatedCert = readExpertStore("exp-spa-01").profile.certificates.find(
        (c) => c.id === "c-06"
      );
      assert.strictEqual(updatedCert?.status, "approved");

      // 2. Duyệt đơn xin nghỉ phép của NV chăm sóc Full-time (exp-spa-02)
      const careStoreBefore = readExpertStore("exp-spa-02");
      const pendingLeave = careStoreBefore.shiftRequests.find(
        (r) => r.kind === "leave" && r.status === "pending"
      );
      assert.ok(pendingLeave);
      updateExpertShiftRequestDecision("exp-spa-02", pendingLeave.id, "approved", "OK");
      const careStoreAfter = readExpertStore("exp-spa-02");
      const approvedLeave = careStoreAfter.shiftRequests.find((r) => r.id === pendingLeave.id);
      assert.strictEqual(approvedLeave?.status, "approved");

      // 3. Ghi chú dịch vụ của exp-spa-01 đồng bộ sang Sổ sức khỏe phía Khách hàng
      const spaStore = readExpertStore("exp-spa-01");
      writeExpertStore("exp-spa-01", {
        ...spaStore,
        healthEntries: [
          {
            id: "he-spa-sync-test",
            petId: "pet-001",
            kind: "service_note",
            date: "2026-11-12",
            title: "Hoàn tất tắm thảo mộc & cắt tỉa",
            detail: "Da sạch, bé hợp tác tốt",
            authorName: "Phan Thị Đình Thùy",
          },
          ...spaStore.healthEntries,
        ],
      });
      const customerRecords = getDoctorCareRecordsForCustomerPet("pet-2", "Bơ");
      assert.ok(
        customerRecords.some((r) => r.id === "vet-sync-he-spa-sync-test")
      );

      // 4. Lễ tân check-in ("Đã đến") đồng bộ sang NVCS vẫn giữ upcoming + checkedInAt (không tụt về pending)
      syncCustomerBookingToExpertStore(
        {
          id: "bk-checkin-test",
          code: "ANM-CHK-001",
          service: "Spa & tắm",
          serviceSlug: "spa-tam",
          doctorId: "exp-spa-01",
          petType: "Chó",
          petName: "Bơ",
          date: "2026-11-25",
          timeSlot: "09:00",
          fullName: "Trần Anh Tuấn",
          phone: "0903112233",
          status: "Đã đến",
          createdAt: "2026-11-22T08:00:00Z",
        },
        "LT. Trần Ngọc Bảo Trâm"
      );
      const syncedCheckin = readExpertStore("exp-spa-01").appointments.find(
        (a) => a.code === "ANM-CHK-001"
      );
      assert.strictEqual(syncedCheckin?.status, "upcoming");
      assert.ok(syncedCheckin?.checkedInAt);

      // 5. Manager tạo nghỉ đột xuất cho exp-spa-01 ngày 2026-11-25 -> khóa ca & liệt kê lịch bị ảnh hưởng
      const emgRes = createEmergencyLeaveByManager(
        "exp-spa-01",
        "2026-11-25",
        "NVCS báo ốm đột xuất qua video call"
      );
      assert.strictEqual(emgRes.ok, true);
      assert.strictEqual(emgRes.request?.leaveType, "emergency");
      assert.ok(emgRes.impactedAppointments.some((a) => a.code === "ANM-CHK-001"));

      // 6. Quỹ nghỉ phép tháng phải đếm chính xác emergencyDays khớp với usedDays
      const afterEmgStore = readExpertStore("exp-spa-01");
      const emgQuota = evaluateMonthlyLeaveQuota(
        afterEmgStore.shiftRequests,
        afterEmgStore.shifts,
        "exp-spa-01",
        "2026-11-25"
      );
      assert.strictEqual(emgQuota.emergencyDays, 1);
      assert.strictEqual(
        emgQuota.usedDays,
        emgQuota.rotationalDays + emgQuota.sickDays + emgQuota.unpaidDays + emgQuota.emergencyDays
      );
    } finally {
      if (prevWindow === undefined) {
        delete (globalThis as { window?: unknown }).window;
      } else {
        (globalThis as { window?: unknown }).window = prevWindow;
      }
    }
  });

  it("resolves demo and custom backend specialist identities consistently", () => {
    assert.deepStrictEqual(resolveExpertIdentityFromSession({ email: "spa@animora.vn" }), {
      expertId: "exp-spa-01",
      identityOverride: null,
    });
    assert.deepStrictEqual(resolveExpertIdentityFromSession({ email: "care2@animora.vn" }), {
      expertId: "exp-spa-02",
      identityOverride: null,
    });
    assert.deepStrictEqual(resolveExpertIdentityFromSession({ email: "vet.toan@animora.vn" }), {
      expertId: "exp-vet-02",
      identityOverride: null,
    });
    const customCare = resolveExpertIdentityFromSession({
      email: "nvcs.new@animora.vn",
      fullName: "Nguyễn Thị Hoa",
      role: "care_staff",
    });
    assert.strictEqual(customCare?.expertId, "exp-spa-01");
    assert.strictEqual(customCare?.identityOverride?.fullName, "Nguyễn Thị Hoa");
    assert.strictEqual(customCare?.identityOverride?.expertType, "groomer");
  });

  it("locks pet medical fields on doctor update, logs old/new values, and merges customer notes (v1.4 Mục 3)", () => {
    const initialPet = {
      id: "pet-test-v14",
      name: "Milo",
      species: "dog" as const,
      breed: "Corgi",
      gender: "male" as const,
      birthDate: "2024-03-10",
      weightKg: 4.5,
      photo: "/pet.jpg",
      ownerId: "own-001",
      allergies: "Không rõ",
      behaviors: "Hiền lành",
      isNeutered: false,
      medicalLocked: false,
      customerNotes: [
        {
          id: "cn-1",
          content: "Bé mới bị nổi mẩn đỏ khi ăn tôm biển",
          createdAt: "2026-11-20 09:00",
        },
      ],
    };

    const { updatedPet, logEntry, weightChanged } = applyDoctorPetMedicalUpdate(
      initialPet,
      {
        weightKg: 5.2,
        isNeutered: true,
        behaviors: "Sợ tiếng máy sấy công suất lớn",
      },
      {
        expertId: "exp-vet-01",
        expertName: "BS. Lê Huy Hoàng",
        source: "clinical_exam",
        timestampIso: "2026-11-22T10:00:00Z",
      }
    );

    assert.strictEqual(weightChanged, true);
    assert.strictEqual(updatedPet.weightKg, 5.2);
    assert.strictEqual(updatedPet.isNeutered, true);
    assert.strictEqual(updatedPet.medicalLocked, true);
    assert.ok(logEntry);
    assert.strictEqual(logEntry.changes.length, 3);
    assert.strictEqual(updatedPet.medicalUpdateLogs?.length, 1);

    // Bác sĩ xác nhận đưa ghi chú bổ sung từ khách vào trường Dị ứng chính thức
    const { updatedPet: afterConfirm } = confirmPetCustomerNoteByDoctor(
      updatedPet,
      "cn-1",
      "allergies",
      {
        expertId: "exp-vet-01",
        expertName: "BS. Lê Huy Hoàng",
        timestampIso: "2026-11-22T10:05:00Z",
      }
    );

    assert.ok(afterConfirm.allergies?.includes("Bé mới bị nổi mẩn đỏ khi ăn tôm biển"));
    assert.strictEqual(afterConfirm.customerNotes?.[0].confirmedByExpert, true);
    assert.strictEqual(afterConfirm.customerNotes?.[0].confirmedTarget, "allergies");
    assert.strictEqual(afterConfirm.medicalUpdateLogs?.length, 2);
  });

  it("dispenses medicine directly from shared warehouse, guards duplicate slot dispensing, and blocks negative stock (v1.4 Mục 4 & 8)", () => {
    const storageMap = new Map<string, string>();
    const prevWindow = (globalThis as { window?: unknown }).window;
    (globalThis as { window?: unknown }).window = {
      localStorage: {
        getItem: (k: string) => storageMap.get(k) ?? null,
        setItem: (k: string, v: string) => {
          storageMap.set(k, v);
        },
        removeItem: (k: string) => {
          storageMap.delete(k);
        },
      },
      dispatchEvent: () => true,
    };

    try {
      const beforeItems = readMedicineBoxItems("exp-vet-01");
      const target = beforeItems[0];
      assert.ok(target);
      const initialWarehouse = target.warehouseStock;

      // 1. Xuất dùng 2 đơn vị cho ca ANM-RX-101 -> trừ trực tiếp kho chung
      const res1 = recordDoctorMedicineUsage({
        expertId: "exp-vet-01",
        expertName: "BS. Lê Huy Hoàng",
        shopProductId: target.shopProductId,
        quantity: 2,
        referenceCode: "ANM-RX-101",
        preventDuplicateForReference: true,
      });
      assert.strictEqual(res1.ok, true);
      assert.strictEqual(res1.afterWarehouseStock, initialWarehouse - 2);

      // 2. Chống xuất trùng cùng mã ca khám + cùng thuốc
      const dupRes = recordDoctorMedicineUsage({
        expertId: "exp-vet-01",
        expertName: "BS. Lê Huy Hoàng",
        shopProductId: target.shopProductId,
        quantity: 1,
        referenceCode: "ANM-RX-101",
        preventDuplicateForReference: true,
      });
      assert.strictEqual(dupRes.ok, false);
      assert.ok(dupRes.error?.includes("mỗi dòng dịch vụ chỉ xuất 1 lần"));

      // 3. Chặn xuất âm khi nhập vượt tồn kho chung hiện có
      const negRes = recordDoctorMedicineUsage({
        expertId: "exp-vet-01",
        expertName: "BS. Lê Huy Hoàng",
        shopProductId: target.shopProductId,
        quantity: initialWarehouse + 50,
        referenceCode: "ANM-RX-102",
      });
      assert.strictEqual(negRes.ok, false);
      assert.strictEqual(negRes.insufficientStock, true);

      // 4. Báo Quản lý bổ sung kho ngay khi bị chặn xuất âm
      const reportRes = reportOutOfStockToManager({
        expertId: "exp-vet-01",
        expertName: "BS. Lê Huy Hoàng",
        shopProductId: target.shopProductId,
        requestedQty: initialWarehouse + 10,
        availableQty: initialWarehouse - 2,
        referenceCode: "ANM-RX-102",
      });
      assert.strictEqual(reportRes.ok, true);
      assert.strictEqual(reportRes.request?.type, "add");
    } finally {
      if (prevWindow === undefined) {
        delete (globalThis as { window?: unknown }).window;
      } else {
        (globalThis as { window?: unknown }).window = prevWindow;
      }
    }
  });
});
