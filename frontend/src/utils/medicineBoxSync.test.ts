import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  MEDICINE_BOX_SHELF_STORAGE_KEY,
  SHOP_PRODUCTS_STORAGE_KEY,
  cancelMedicineBoxRequest,
  checkProductDeletionConstraints,
  computeEvenDoctorAllocations,
  readAllDoctorsShelfMap,
  readMedicineBoxItems,
  readMedicineBoxLogs,
  readMedicineBoxRequests,
  readWarehouseProducts,
  recordDoctorMedicineUsage,
  recordWarehousePoImport,
  reportOutOfStockToManager,
  reviewMedicineBoxRequest,
  submitMedicineBoxRequest,
} from "./medicineBoxSync";
import {
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

describe("Shared Medicine Warehouse v1.4 Constraints & Workflow Tests", () => {
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

  it("splits integer quantities deterministically with computeEvenDoctorAllocations", () => {
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
  });

  it("migrates legacy flat shelf store safely without throwing", () => {
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
  });

  it("adds PO medicine import directly into shared warehouse so all doctors see increased stock", () => {
    const beforeVet1 = readMedicineBoxItems("exp-vet-01").find(
      (i) => i.shopProductId === "prod-rx-02"
    )!;
    const beforeVet2 = readMedicineBoxItems("exp-vet-02").find(
      (i) => i.shopProductId === "prod-rx-02"
    )!;
    assert.strictEqual(beforeVet1.warehouseStock, beforeVet2.warehouseStock);
    const beforeWarehouse = beforeVet1.warehouseStock;

    const poRes = recordWarehousePoImport({
      shopProductId: "prod-rx-02",
      medicineName: beforeVet1.name,
      unit: beforeVet1.unit,
      receivedQty: 15,
      poCode: "PO-TEST-V14",
    });

    assert.strictEqual(poRes.ok, true);
    assert.strictEqual(poRes.afterWarehouseStock, beforeWarehouse + 15);

    const afterVet1 = readMedicineBoxItems("exp-vet-01").find(
      (i) => i.shopProductId === "prod-rx-02"
    )!;
    const afterVet2 = readMedicineBoxItems("exp-vet-02").find(
      (i) => i.shopProductId === "prod-rx-02"
    )!;

    // Tất cả bác sĩ cùng nhìn thấy tồn kho chung tăng +15
    assert.strictEqual(afterVet1.warehouseStock, beforeWarehouse + 15);
    assert.strictEqual(afterVet2.warehouseStock, beforeWarehouse + 15);
    assert.strictEqual(afterVet1.shelfStock, beforeWarehouse + 15);

    const logs = readMedicineBoxLogs();
    assert.ok(
      logs.some(
        (l) =>
          l.action === "po_allocation" &&
          l.referenceCode === "PO-TEST-V14" &&
          l.quantityDelta === 15
      )
    );
  });

  it("deducts doctor usage from shared warehouse, blocks negative stock, prevents duplicate reference, and reports out-of-stock", () => {
    const target = readMedicineBoxItems("exp-vet-01").find(
      (i) => i.shopProductId === "prod-rx-01"
    )!;
    const beforeStock = target.warehouseStock;

    // Chặn số thập phân
    const decimalRes = recordDoctorMedicineUsage({
      expertId: "exp-vet-01",
      expertName: "BS. Lê Huy Hoàng",
      shopProductId: "prod-rx-01",
      quantity: 1.5,
      referenceCode: "ANM-TEST-01",
    });
    assert.strictEqual(decimalRes.ok, false);

    // Chặn xuất âm vượt quá tồn kho chung
    const overRes = recordDoctorMedicineUsage({
      expertId: "exp-vet-01",
      expertName: "BS. Lê Huy Hoàng",
      shopProductId: "prod-rx-01",
      quantity: beforeStock + 5,
      referenceCode: "ANM-TEST-01",
    });
    assert.strictEqual(overRes.ok, false);
    assert.strictEqual(overRes.insufficientStock, true);
    assert.strictEqual(overRes.availableStock, beforeStock);

    // Báo Quản lý bổ sung kho ngay khi thiếu tồn (1-click)
    const alertRes = reportOutOfStockToManager({
      expertId: "exp-vet-01",
      expertName: "BS. Lê Huy Hoàng",
      shopProductId: "prod-rx-01",
      requestedQty: beforeStock + 5,
      availableQty: beforeStock,
      referenceCode: "ANM-TEST-01",
    });
    assert.strictEqual(alertRes.ok, true);
    assert.ok(alertRes.request);

    // Quản lý duyệt đề xuất bổ sung kho KHÔNG bị chặn và KHÔNG trừ kho chung
    const approveAlert = reviewMedicineBoxRequest(
      alertRes.request!.id,
      "approved"
    );
    assert.strictEqual(approveAlert.ok, true);
    const afterApproveStock = readWarehouseProducts().find(
      (p) => p.id === "prod-rx-01"
    )!.stock;
    assert.strictEqual(afterApproveStock, beforeStock);

    // Xuất dùng hợp lệ -> trừ thẳng kho chung & tăng usedByDoctorCount
    const validUsage = recordDoctorMedicineUsage({
      expertId: "exp-vet-01",
      expertName: "BS. Lê Huy Hoàng",
      shopProductId: "prod-rx-01",
      quantity: 2,
      referenceCode: "ANM-TEST-01",
      preventDuplicateForReference: true,
    });
    assert.strictEqual(validUsage.ok, true);
    assert.strictEqual(validUsage.afterWarehouseStock, beforeStock - 2);

    // Chặn xuất đúp cùng thuốc trên cùng 1 mã lịch hẹn
    const dupUsage = recordDoctorMedicineUsage({
      expertId: "exp-vet-01",
      expertName: "BS. Lê Huy Hoàng",
      shopProductId: "prod-rx-01",
      quantity: 1,
      referenceCode: "ANM-TEST-01",
      preventDuplicateForReference: true,
    });
    assert.strictEqual(dupUsage.ok, false);

    const updatedItem = readMedicineBoxItems("exp-vet-01").find(
      (i) => i.shopProductId === "prod-rx-01"
    )!;
    assert.strictEqual(updatedItem.warehouseStock, beforeStock - 2);
    assert.strictEqual(updatedItem.usedByDoctorCount, 2);
  });

  it("allows Manager to approve replenishment request even when warehouse stock is 0", () => {
    // Đặt tồn kho của prod-rx-02 về 0
    const products = readWarehouseProducts().map((p) =>
      p.id === "prod-rx-02" ? { ...p, stock: 0 } : p
    );
    storageRef.set(SHOP_PRODUCTS_STORAGE_KEY, JSON.stringify(products));

    const reqRes = submitMedicineBoxRequest({
      expertId: "exp-vet-02",
      expertName: "BS. Trần Minh Tú",
      type: "add",
      shopProductId: "prod-rx-02",
      medicineName: "Metacam Oral Suspension 15ml (Meloxicam)",
      unit: "lọ 15ml",
      quantity: 10,
      reason: "Kho đã hết sạch, đề nghị QL duyệt và tạo PO nhập gấp.",
    });
    assert.strictEqual(reqRes.ok, true);

    const approved = reviewMedicineBoxRequest(reqRes.request!.id, "approved");
    assert.strictEqual(approved.ok, true);
    assert.strictEqual(approved.request?.status, "approved");

    // Kho chung vẫn là 0 (không bị âm, chờ QL nhập PO)
    const stockAfter = readWarehouseProducts().find(
      (p) => p.id === "prod-rx-02"
    )!.stock;
    assert.strictEqual(stockAfter, 0);
  });

  it("prevents cancelling another doctor's pending request and blocks decimal requests", () => {
    const badDecimal = submitMedicineBoxRequest({
      expertId: "exp-vet-01",
      expertName: "BS. Lê Huy Hoàng",
      type: "add",
      shopProductId: "prod-rx-01",
      medicineName: "Synulox",
      unit: "viên",
      quantity: 2.5,
      reason: "Test decimal",
    });
    assert.strictEqual(badDecimal.ok, false);

    const goodReq = submitMedicineBoxRequest({
      expertId: "exp-vet-01",
      expertName: "BS. Lê Huy Hoàng",
      type: "add",
      shopProductId: "prod-rx-01",
      medicineName: "Synulox",
      unit: "viên",
      quantity: 5,
      reason: "Bổ sung kho chung",
    });
    assert.strictEqual(goodReq.ok, true);

    const wrongDoctorCancel = cancelMedicineBoxRequest(
      goodReq.request!.id,
      "exp-vet-02"
    );
    assert.strictEqual(wrongDoctorCancel, false);

    const ownerCancel = cancelMedicineBoxRequest(
      goodReq.request!.id,
      "exp-vet-01"
    );
    assert.strictEqual(ownerCancel, true);
  });

  it("assigns Vemedim for medicine category & handles new proposal + discontinue constraints", () => {
    assert.strictEqual(
      defaultSupplierForCategory("medicine"),
      "Công ty CP Dược Thú Y Vemedim"
    );

    const prop = submitMedicineBoxRequest({
      expertId: "exp-vet-02",
      expertName: "BS. Trần Minh Tú",
      type: "add",
      itemType: "medicine",
      medicineName: "Thuốc nhỏ mắt Tobramycin Vet 5ml",
      activeIngredient: "Tobramycin",
      unit: "lọ 5ml",
      quantity: 12,
      isNewMedicineProposal: true,
      reason: "Bổ sung phác đồ điều trị viêm kết mạc",
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

    const products = readWarehouseProducts();
    assert.ok(
      products.some(
        (p) =>
          p.id === approved.createdProductId &&
          p.stock === 0 &&
          p.requiresPrescription === true
      )
    );

    const disc = submitMedicineBoxRequest({
      expertId: "exp-vet-01",
      expertName: "BS. Lê Huy Hoàng",
      type: "discontinue",
      shopProductId: "prod-rx-01",
      medicineName: "Amoxicillin Clavulanate",
      unit: "viên",
      quantity: 0,
      reason: "Chuyển sang phác đồ mới",
    });
    assert.strictEqual(disc.ok, true);

    const constraints = checkProductDeletionConstraints("prod-rx-01");
    assert.strictEqual(constraints.canHardDelete, false);
    assert.ok(constraints.reasons.length > 0);

    const discApproved = reviewMedicineBoxRequest(disc.request!.id, "approved");
    assert.strictEqual(discApproved.ok, true);
    const updatedProd = readWarehouseProducts().find(
      (p) => p.id === "prod-rx-01"
    )!;
    assert.strictEqual(updatedProd.isHidden, true);

    const reqs = readMedicineBoxRequests();
    assert.ok(
      reqs.some((r) => r.id === disc.request!.id && r.status === "approved")
    );
  });
});
