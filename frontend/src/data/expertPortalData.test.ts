import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  computeCancellationFee,
  getScopedPets,
  getScopedOwners,
  SEED_APPOINTMENTS,
  SEED_PETS,
  SEED_OWNERS,
} from "./expertPortalData";
import { ExpertAppointment } from "@/types/expert.type";

describe("Expert Portal Business Logic Tests", () => {
  it("computes 30% cancellation fee for prepaid bookings cancelled under 3 hours (v1.4)", () => {
    const dummyAppt: ExpertAppointment = {
      ...SEED_APPOINTMENTS[0],
      paymentTiming: "prepaid",
      startAt: "2026-11-04T14:00:00",
    };
    // Hủy lúc 12:30 (còn 1.5 giờ)
    const result = computeCancellationFee(dummyAppt, 300000, "2026-11-04T12:30:00");
    assert.strictEqual(result.isUnder3Hours, true);
    assert.strictEqual(result.feePercentage, 30);
    assert.strictEqual(result.feeVnd, 90000);

    // Đơn trả sau hủy dưới 3 giờ: không thu phí (0đ), xử lý qua violation
    const postpaidResult = computeCancellationFee(
      { ...dummyAppt, paymentTiming: "postpaid" },
      300000,
      "2026-11-04T12:30:00"
    );
    assert.strictEqual(postpaidResult.isUnder3Hours, true);
    assert.strictEqual(postpaidResult.feePercentage, 0);
    assert.strictEqual(postpaidResult.feeVnd, 0);
  });

  it("computes 0% cancellation fee when cancelled at or over 24 hours in advance", () => {
    const dummyAppt: ExpertAppointment = {
      ...SEED_APPOINTMENTS[0],
      startAt: "2026-11-06T14:00:00",
    };
    // Hủy trước 48 giờ
    const result = computeCancellationFee(dummyAppt, 500000, "2026-11-04T14:00:00");
    assert.strictEqual(result.isUnder3Hours, false);
    assert.strictEqual(result.feePercentage, 0);
    assert.strictEqual(result.feeVnd, 0);
  });

  it("computes 0% cancellation fee when cancelled between 3 and 24 hours", () => {
    const dummyAppt: ExpertAppointment = {
      ...SEED_APPOINTMENTS[0],
      startAt: "2026-11-04T20:00:00",
    };
    // Hủy trước 6 giờ
    const result = computeCancellationFee(dummyAppt, 400000, "2026-11-04T14:00:00");
    assert.strictEqual(result.isUnder3Hours, false);
    assert.strictEqual(result.feePercentage, 0);
    assert.strictEqual(result.feeVnd, 0);
  });

  it("scopes pets strictly to those who have bookings with the current expert", () => {
    const vetId = "exp-vet-01";
    const scopedPets = getScopedPets(vetId, SEED_APPOINTMENTS, SEED_PETS);
    assert.ok(scopedPets.length > 0);

    // Mọi pet trong scopedPets phải có ít nhất 1 appointment với exp-vet-01
    const vetPetIds = new Set(
      SEED_APPOINTMENTS.filter((a) => a.expertId === vetId).map((a) => a.petId)
    );
    scopedPets.forEach((pet) => {
      assert.ok(vetPetIds.has(pet.id));
    });
  });

  it("scopes owners strictly to those whose pets have bookings with the expert", () => {
    const spaId = "exp-spa-01";
    const scopedOwners = getScopedOwners(spaId, SEED_APPOINTMENTS, SEED_OWNERS);
    const spaOwnerIds = new Set(
      SEED_APPOINTMENTS.filter((a) => a.expertId === spaId).map((a) => a.ownerId)
    );
    scopedOwners.forEach((owner) => {
      assert.ok(spaOwnerIds.has(owner.id));
    });
  });
});
