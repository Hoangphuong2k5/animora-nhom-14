import type { PurchaseOrder } from "@/data/managerOpsData";
import { readExpertStore } from "@/utils/clinicalSync";
import { readOrdersFromStorage } from "@/utils/orderSync";
import {
  getActiveVetDoctors,
  readMedicineBoxRequests,
  readWarehouseProducts,
} from "./storage";

export interface ProductConstraintReport {
  canHardDelete: boolean;
  canDiscontinue: boolean;
  warehouseStock: number;
  totalShelfStockAcrossDoctors: number;
  pendingMedBoxRequestsCount: number;
  activePrescriptionsCount: number;
  totalPrescriptionsCount: number;
  activeOrdersCount: number;
  activePurchaseOrdersCount: number;
  reasons: string[];
}

export function checkProductDeletionConstraints(
  productId: string
): ProductConstraintReport {
  const warehouse = readWarehouseProducts();
  const prod = warehouse.find((p) => p.id === productId);
  const warehouseStock = prod?.stock ?? 0;

  // Theo Animora v1.4 (Mục 8): bỏ kệ cá nhân, toàn bộ tồn nằm tại Kho thuốc chung
  const totalShelfStockAcrossDoctors = 0;

  const requests = readMedicineBoxRequests();
  const pendingMedBoxRequestsCount = requests.filter(
    (r) =>
      r.status === "pending" &&
      (r.shopProductId === productId ||
        (prod?.medicineId && r.medicineId === prod.medicineId))
  ).length;

  let activePrescriptionsCount = 0;
  let totalPrescriptionsCount = 0;
  const targetMedId = prod?.medicineId;
  if (targetMedId) {
    for (const doc of getActiveVetDoctors()) {
      const store = readExpertStore(doc.id);
      for (const rx of store.prescriptions) {
        if (rx.lines.some((l) => l.medicineId === targetMedId)) {
          totalPrescriptionsCount += 1;
          if (rx.severity !== "severe" && rx.refillsUsed < rx.refillsAllowed) {
            activePrescriptionsCount += 1;
          }
        }
      }
    }
  }

  let activeOrdersCount = 0;
  if (typeof window !== "undefined") {
    try {
      const orders = readOrdersFromStorage();
      const prodNameNorm = (prod?.name || "").trim().toLowerCase();
      activeOrdersCount = orders.filter((ord) => {
        if (
          ord.status !== "pending" &&
          ord.status !== "packing" &&
          ord.status !== "shipping"
        ) {
          return false;
        }
        return ord.items.some(
          (item) =>
            item.productId === productId ||
            (prodNameNorm &&
              item.productName.trim().toLowerCase() === prodNameNorm)
        );
      }).length;
    } catch {
      // ignore
    }
  }

  let activePurchaseOrdersCount = 0;
  if (typeof window !== "undefined") {
    try {
      const rawPo = window.localStorage.getItem(
        "animora_manager_purchase_orders_v1"
      );
      if (rawPo) {
        const pos = JSON.parse(rawPo) as PurchaseOrder[];
        if (Array.isArray(pos)) {
          activePurchaseOrdersCount = pos.filter(
            (po) =>
              po.status !== "received" &&
              po.status !== "received_partial" &&
              po.status !== "supplier_rejected" &&
              po.lines.some((l) => l.productId === productId)
          ).length;
        }
      }
    } catch {
      // ignore
    }
  }

  const reasons: string[] = [];
  if (warehouseStock > 0) {
    reasons.push(`Kho chung còn ${warehouseStock} đơn vị`);
  }
  if (pendingMedBoxRequestsCount > 0) {
    reasons.push(
      `Có ${pendingMedBoxRequestsCount} đề xuất kho thuốc đang chờ duyệt`
    );
  }
  if (totalPrescriptionsCount > 0) {
    reasons.push(
      `Đang được tham chiếu trong ${totalPrescriptionsCount} đơn thuốc (${activePrescriptionsCount} đơn còn lượt mua lại)`
    );
  }
  if (activeOrdersCount > 0) {
    reasons.push(`Có ${activeOrdersCount} đơn hàng khách đang xử lý/giao`);
  }
  if (activePurchaseOrdersCount > 0) {
    reasons.push(`Có ${activePurchaseOrdersCount} đơn nhập hàng PO đang mở`);
  }

  const hasReferences = reasons.length > 0;
  return {
    canHardDelete: !hasReferences,
    canDiscontinue: true,
    warehouseStock,
    totalShelfStockAcrossDoctors,
    pendingMedBoxRequestsCount,
    activePrescriptionsCount,
    totalPrescriptionsCount,
    activeOrdersCount,
    activePurchaseOrdersCount,
    reasons,
  };
}

