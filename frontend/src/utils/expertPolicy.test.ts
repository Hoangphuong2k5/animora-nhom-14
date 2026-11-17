import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CARE_SERVICE_STAGES,
  canCancelShiftRequest,
  canRequestExtraShift,
  evaluateMonthlyLeaveQuota,
  evaluateWorkingHoursPolicy,
  getCareStageMeta,
  getNextCareStage,
  summarizePartTimeExtraShifts,
  validateShiftRequestKindForEmployment,
} from "./expertPolicy";
import {
  getDoctorCareRecordsForCustomerPet,
  readExpertStore,
  reviewExpertCertificate,
  updateExpertShiftRequestDecision,
  writeExpertStore,
} from "./clinicalSync";
import { MEDICINE_CATALOG } from "@/data/medicineCatalog";
import { SHOP_PRODUCTS } from "@/data/shopData";
import type { ExpertShift, ShiftRequest } from "@/types/expert.type";

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

  it("removes overtime completely and enforces Vet/Full-time leave-only vs Part-time extra_shift", () => {
    assert.strictEqual(canRequestExtraShift("part_time"), true);
    assert.strictEqual(canRequestExtraShift("full_time"), false);

    // Nghiệp vụ tăng ca bị chặn hoàn toàn
    assert.strictEqual(
      validateShiftRequestKindForEmployment("overtime" as unknown as ShiftRequest["kind"], "full_time").allowed,
      false
    );
    assert.strictEqual(
      validateShiftRequestKindForEmployment("extra_shift", "part_time").allowed,
      true
    );
    assert.strictEqual(
      validateShiftRequestKindForEmployment("extra_shift", "full_time").allowed,
      false
    );
    assert.strictEqual(
      validateShiftRequestKindForEmployment("leave", "full_time", "vet").allowed,
      true
    );
    assert.strictEqual(
      validateShiftRequestKindForEmployment("shift_swap", "full_time", "groomer").allowed,
      false
    );

    const ptId = "exp-spa-02";
    const shifts: ExpertShift[] = [
      { id: "sh-pt-1", expertId: ptId, date: "2026-11-10", shift: "morning", shiftType: "fixed" },
      { id: "sh-pt-2", expertId: ptId, date: "2026-11-12", shift: "afternoon", shiftType: "extra_shift" },
    ];
    const requests: ShiftRequest[] = [
      {
        id: "req-ext-1",
        expertId: ptId,
        kind: "extra_shift",
        date: "2026-11-12",
        shift: "afternoon",
        extraShiftHours: 4,
        reason: "Đăng ký ca làm thêm giờ hành chính",
        status: "approved",
        createdAt: "2026-11-05T08:00:00Z",
      },
      {
        id: "req-ext-2",
        expertId: ptId,
        kind: "extra_shift",
        date: "2026-11-15",
        shift: "afternoon",
        extraShiftHours: 4,
        reason: "Nhận thêm ca chiều",
        status: "pending",
        createdAt: "2026-11-06T08:00:00Z",
      },
    ];

    const summary = summarizePartTimeExtraShifts(requests, shifts, ptId, "2026-11-20");
    assert.strictEqual(summary.approvedShifts, 1);
    assert.strictEqual(summary.approvedHours, 4);
    assert.strictEqual(summary.pendingShifts, 1);
    assert.strictEqual(summary.pendingHours, 4);
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

  it("syncs certificate approval, part-time extra_shift approval, and care service notes across stores", () => {
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

      // 2. Duyệt đơn đăng ký ca làm thêm của NV chăm sóc Part-time (exp-spa-02)
      const ptStoreBefore = readExpertStore("exp-spa-02");
      const pendingExtra = ptStoreBefore.shiftRequests.find(
        (r) => r.kind === "extra_shift" && r.status === "pending"
      );
      assert.ok(pendingExtra);
      updateExpertShiftRequestDecision("exp-spa-02", pendingExtra.id, "approved", "OK");
      const ptStoreAfter = readExpertStore("exp-spa-02");
      assert.ok(
        ptStoreAfter.shifts.some(
          (s) => s.date === pendingExtra.date && s.shiftType === "extra_shift"
        )
      );

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
            authorName: "Nguyễn Thu Hà",
          },
          ...spaStore.healthEntries,
        ],
      });
      const customerRecords = getDoctorCareRecordsForCustomerPet("pet-2", "Bơ");
      assert.ok(
        customerRecords.some((r) => r.id === "vet-sync-he-spa-sync-test")
      );
    } finally {
      if (prevWindow === undefined) {
        delete (globalThis as { window?: unknown }).window;
      } else {
        (globalThis as { window?: unknown }).window = prevWindow;
      }
    }
  });
});
