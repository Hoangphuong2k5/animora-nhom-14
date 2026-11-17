import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { filterCustomers, INITIAL_CUSTOMERS } from "./customersData";

describe("filterCustomers", () => {
  it("filters by account status (all / active / locked)", () => {
    const all = filterCustomers(INITIAL_CUSTOMERS, "all", "");
    const active = filterCustomers(INITIAL_CUSTOMERS, "active", "");
    const locked = filterCustomers(INITIAL_CUSTOMERS, "locked", "");

    assert.equal(all.length, INITIAL_CUSTOMERS.length);
    assert.ok(active.every((c) => c.status === "active"));
    assert.ok(locked.every((c) => c.status === "locked"));
    assert.equal(active.length + locked.length, all.length);
  });

  it("matches case-insensitive name, email, or phone substring", () => {
    assert.equal(filterCustomers(INITIAL_CUSTOMERS, "all", "MINH ANH").length, 1);
    assert.equal(
      filterCustomers(INITIAL_CUSTOMERS, "all", "quocbao.do@outlook.com").length,
      1
    );
    assert.equal(filterCustomers(INITIAL_CUSTOMERS, "all", "0337203332").length, 1);
    assert.equal(filterCustomers(INITIAL_CUSTOMERS, "all", "not-found").length, 0);
  });
});
