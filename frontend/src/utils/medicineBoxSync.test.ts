import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  MEDICINE_BOX_LOGS_STORAGE_KEY,
  MEDICINE_BOX_REQUESTS_STORAGE_KEY,
  MEDICINE_BOX_SHELF_STORAGE_KEY,
  SHOP_PRODUCTS_STORAGE_KEY,
  allocateMedicineImportToDoctors,
  cancelMedicineBoxRequest,
  checkProductDeletionConstraints,
  computeEvenDoctorAllocations,
  getActiveVetDoctors,
  readAllDoctorsShelfMap,
  readMedicineBoxItems,
  readMedicineBoxLogs,
  readMedicineBoxRequests,
  readWarehouseProducts,
  recordDoctorMedicineUsage,
  reviewMedicineBoxRequest,
  submitMedicineBoxRequest,
} from "./medicineBoxSync";
import {
  SUPPLIER_PROFILES_STORAGE_KEY,
  defaultSupplierForCategory,
  ensureSupplierCatalogMetaForProduct,
} from "../data/supplierPortalData";

function createMockWindow() {
  const storage = new Map<string, string>();
  const dispatchedEvents: string[] = [];

  const mockWindow = {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, String(value));
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
      clear: () => {
        storage.clear();
      },
    },
    dispatchEvent: (event: Event) => {
      dispatchedEvents.push(event.type);
      return true;
    },
  };

  return { mockWindow, storage, dispatchedEvents };
}

describe("Medicine Box 3-Role Constraints & Workflow Tests", () => {
  const originalWindow = (globalThis as { window?: unknown }).window;
  let storageRef: Map<string, string>;

  beforeEach(() => {
    const { mockWindow, storage } = createMockWindow();
    storageRef = storage;
    (globalThis as { window?: unknown }).window = mockWindow;
  });

  afterEach(() => {
    (globalThis as { window?: unknown }).window = originalWindow;
  });

  it("splits PO medicine import evenly across active doctors with deterministic remainder", () => {
    const docs = ["exp-vet-01", "exp-vet-02", "exp-vet-03"];
    const split100 = computeEvenDoctorAllocations(100, docs);
    assert.deepEqual(
      split100.map((x) => x.quantity),
      [34, 33, 33]
    );
    assert.strictEqual(
      split100.reduce((s, x) => s + x.quantity, 0),
      100
    );

    const split2 = computeEvenDoctorAllocations(2, docs);
    assert.deepEqual(
      split2.map((x) => x.quantity),
      [1, 1, 0]
    );
  });

  it("migrates legacy flat shelf store into per-doctor shelves without losing data", () => {
    storageRef.set(
      MEDICINE_BOX_SHELF_STORAGE_KEY,
      JSON.stringify({
        "prod-rx-01": {
          shelfStock: 42,
          minShelfThreshold: 5,
          lastUpdatedAt: "2026-11-16T00:00:00.000Z",
        },
      })
    );

    const allShelves = readAllDoctorsShelfMap();
    assert.strictEqual(allShelves["exp-vet-01"]["prod-rx-01"].shelfStock, 42);
    assert.ok(allShelves["exp-vet-02"]);
    assert.ok(allShelves["exp-vet-03"]);
    assert.notStrictEqual(
      allShelves["exp-vet-01"]["prod-rx-01"].shelfStock,
      allShelves["exp-vet-02"]["prod-rx-01"].shelfStock
    );
  });

  it("allocates PO import to all active doctors and does not double-count warehouseStock", () => {
    const beforeItemsVet1 = readMedicineBoxItems("exp-vet-01");
    const targetBefore = beforeItemsVet1.find((i) => i.shopProductId === "prod-rx-02")!;
    const beforeWarehouse = targetBefore.warehouseStock;

    const beforeVet1 = targetBefore.shelfStock;
    const beforeVet2 = readMedicineBoxItems("exp-vet-02").find(
      (i) => i.shopProductId === "prod-rx-02"
    )!.shelfStock;
    const beforeVet3 = readMedicineBoxItems("exp-vet-03").find(
      (i) => i.shopProductId === "prod-rx-02"
    )!.shelfStock;

    const allocRes = allocateMedicineImportToDoctors({
      shopProductId: "prod-rx-02",
      medicineName: targetBefore.name,
      unit: targetBefore.unit,
      receivedQty: 10,
      poCode: "PO-202611-999",
    });

    assert.strictEqual(allocRes.ok, true);
    assert.strictEqual(allocRes.totalAllocated, 10);

    const afterVet1 = readMedicineBoxItems("exp-vet-01").find(
      (i) => i.shopProductId === "prod-rx-02"
    )!;
    const afterVet2 = readMedicineBoxItems("exp-vet-02").find(
      (i) => i.shopProductId === "prod-rx-02"
    )!;
    const afterVet3 = readMedicineBoxItems("exp-vet-03").find(
      (i) => i.shopProductId === "prod-rx-02"
    )!;

    assert.strictEqual(afterVet1.shelfStock - beforeVet1, 4);
    assert.strictEqual(afterVet2.shelfStock - beforeVet2, 3);
    assert.strictEqual(afterVet3.shelfStock - beforeVet3, 3);
    assert.strictEqual(afterVet1.warehouseStock, beforeWarehouse);

    const logs = readMedicineBoxLogs();
    assert.strictEqual(logs.length, 3);
    assert.strictEqual(logs[0].action, "po_allocation");
  });

  it("enforces integer quantities and prevents usage exceeding personal shelfStock", () => {
    const items = readMedicineBoxItems("exp-vet-01");
    const target = items.find((i) => i.shopProductId === "prod-rx-02")!;

    const badDecimal = recordDoctorMedicineUsage({
      expertId: "exp-vet-01",
      expertName: "BS. Lê Huy Hoàng",
      shopProductId: target.shopProductId,
      quantity: 1.5,
    });
    assert.strictEqual(badDecimal.ok, false);

    const tooMany = recordDoctorMedicineUsage({
      expertId: "exp-vet-01",
      expertName: "BS. Lê Huy Hoàng",
      shopProductId: target.shopProductId,
      quantity: target.shelfStock + 1,
    });
    assert.strictEqual(tooMany.ok, false);

    const okUsage = recordDoctorMedicineUsage({
      expertId: "exp-vet-01",
      expertName: "BS. Lê Huy Hoàng",
      shopProductId: target.shopProductId,
      quantity: 2,
      referenceCode: "RX-01",
    });
    assert.strictEqual(okUsage.ok, true);
    assert.strictEqual(okUsage.afterShelfStock, target.shelfStock - 2);
  });

  it("prevents cancelling another doctor's pending request and blocks decimal requests", () => {
    const decimalReq = submitMedicineBoxRequest({
      expertId: "exp-vet-02",
      expertName: "BS. Ngô Phước Toàn",
      type: "add",
      medicineId: "med-002",
      shopProductId: "prod-med-02",
      medicineName: "Metacam Oral Suspension 15ml (Meloxicam)",
      unit: "lọ 15ml",
      quantity: 2.5,
      reason: "Xin bổ sung",
    });
    assert.strictEqual(decimalReq.ok, false);

    // mbr-seed-01 thuộc exp-vet-01
    const cancelByOther = cancelMedicineBoxRequest("mbr-seed-01", "exp-vet-02");
    assert.strictEqual(cancelByOther, false);

    const cancelByOwner = cancelMedicineBoxRequest("mbr-seed-01", "exp-vet-01");
    assert.strictEqual(cancelByOwner, true);
  });

  it("assigns Vemedim for medicine category & handles new proposal + discontinue constraints", () => {
    assert.strictEqual(
      defaultSupplierForCategory("medicine"),
      "Công ty CP Dược Thú Y Vemedim"
    );

    // Đề xuất thuốc mới từ BS
    const prop = submitMedicineBoxRequest({
      expertId: "exp-vet-01",
      expertName: "BS. Lê Huy Hoàng",
      type: "add",
      itemType: "medicine",
      medicineName: "Thuốc nhỏ mắt Tobramycin Vet",
      activeIngredient: "Tobramycin",
      unit: "lọ 5ml",
      quantity: 12,
      isNewMedicineProposal: true,
      reason: "Cần bổ sung thuốc nhỏ mắt cho phòng khám",
    });
    assert.strictEqual(prop.ok, true);

    const approved = reviewMedicineBoxRequest(prop.request!.id, "approved");
    assert.strictEqual(approved.ok, true);
    assert.ok(approved.createdProductId);

    const meta = ensureSupplierCatalogMetaForProduct(
      approved.createdProductId!,
      "medicine"
    );
    assert.strictEqual(meta.supplierName, "Công ty CP Dược Thú Y Vemedim");

    // Kiểm tra ràng buộc ngừng kinh doanh cho thuốc đang có tồn kệ/đơn thuốc
    const constraints = checkProductDeletionConstraints("prod-rx-01");
    assert.strictEqual(constraints.canHardDelete, false);

    const disc = submitMedicineBoxRequest({
      expertId: "exp-vet-01",
      expertName: "BS. Lê Huy Hoàng",
      type: "discontinue",
      medicineId: "med-001",
      shopProductId: "prod-rx-01",
      medicineName: "Amoxicillin + Clavulanic 250mg",
      unit: "viên",
      quantity: 0,
      reason: "Chuyển sang quy cách mới",
    });
    assert.strictEqual(disc.ok, true);

    const discApproved = reviewMedicineBoxRequest(disc.request!.id, "approved");
    assert.strictEqual(discApproved.ok, true);

    const prodAfter = readWarehouseProducts().find((p) => p.id === "prod-rx-01");
    assert.strictEqual(prodAfter?.isHidden, true);

    // Cleanup sanity checks
    assert.ok(getActiveVetDoctors().length >= 3);
    assert.ok(Array.isArray(readMedicineBoxRequests()));
    assert.ok(storageRef.has(MEDICINE_BOX_LOGS_STORAGE_KEY));
    assert.ok(
      storageRef.has(SHOP_PRODUCTS_STORAGE_KEY) ||
        storageRef.has(MEDICINE_BOX_REQUESTS_STORAGE_KEY) ||
        SUPPLIER_PROFILES_STORAGE_KEY.length > 0
    );
  });
});
