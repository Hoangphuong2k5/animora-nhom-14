import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkShiftConflict, INITIAL_SHIFTS } from "./scheduleData";

describe("checkShiftConflict", () => {
  it("detects conflict when staff already has a shift at the same day and slot", () => {
    const conflict = checkShiftConflict(
      INITIAL_SHIFTS,
      0,
      "08:30 - 10:00",
      "st-1"
    );
    assert.ok(conflict && conflict.includes("Có khách"));
  });

  it("returns null when staff is free at the requested day and slot", () => {
    const ok = checkShiftConflict(INITIAL_SHIFTS, 0, "16:30 - 18:00", "st-1");
    assert.equal(ok, null);
  });
});
