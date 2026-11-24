import { ensureSupplierCatalogMetaForProduct } from "@/data/supplierPortalData";
import type {
  ExpertNotification,
  MedicineBoxCategory,
  MedicineBoxItem,
  MedicineBoxLogAction,
  MedicineBoxRequest,
  MedicineBoxRequestType,
} from "@/types/expert.type";
import {
  EXPERT_SYNC_EVENT,
  pushManagerNotification,
  readExpertStore,
  writeExpertStore,
} from "@/utils/clinicalSync";
import { checkProductDeletionConstraints } from "./constraints";
import {
  appendMedicineBoxLogs,
  emitMedicineBoxSync,
  readMedicineBoxRequests,
  readWarehouseProducts,
  writeMedicineBoxRequests,
  writeWarehouseProducts,
  type StoredShopProduct,
} from "./storage";
import { readMedicineBoxItems } from "./warehouseLedger";

export interface SubmitMedicineBoxRequestInput {
  expertId: string;
  expertName: string;
  type: MedicineBoxRequestType;
  itemType?: MedicineBoxCategory;
  medicineId?: string;
  shopProductId?: string;
  medicineName: string;
  activeIngredient?: string;
  unit: string;
  quantity: number;
  isNewMedicineProposal?: boolean;
  removeAll?: boolean;
  returnToWarehouse?: boolean;
  discontinueAction?: "hide" | "delete";
  reason: string;
}

export function validateMedicineBoxRequest(
  input: SubmitMedicineBoxRequestInput,
  items: MedicineBoxItem[],
  existingRequests: MedicineBoxRequest[]
): { valid: boolean; error?: string } {
  if (!input.medicineName.trim()) {
    return { valid: false, error: "Vui lòng chọn hoặc nhập tên thuốc." };
  }
  if (!input.reason.trim()) {
    return { valid: false, error: "Vui lòng nhập lý do gửi Quản lý duyệt." };
  }

  const matchedItem = items.find(
    (it) =>
      (input.shopProductId && it.shopProductId === input.shopProductId) ||
      (input.medicineId && it.id === input.medicineId)
  );

  if (input.type === "discontinue") {
    if (!matchedItem) {
      return {
        valid: false,
        error: "Không tìm thấy thuốc này trong danh mục Kho thuốc chung.",
      };
    }
    if (matchedItem.isHidden) {
      return {
        valid: false,
        error: "Sản phẩm này đã ở trạng thái ngừng kinh doanh.",
      };
    }
    const alreadyPendingDiscontinue = existingRequests.some(
      (r) =>
        r.status === "pending" &&
        r.type === "discontinue" &&
        ((input.shopProductId && r.shopProductId === input.shopProductId) ||
          (input.medicineId && r.medicineId === input.medicineId))
    );
    if (alreadyPendingDiscontinue) {
      return {
        valid: false,
        error:
          "Đã có yêu cầu ngừng kinh doanh đang chờ Quản lý duyệt cho thuốc này.",
      };
    }
    return { valid: true };
  }

  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    return {
      valid: false,
      error: "Số lượng yêu cầu phải là số nguyên lớn hơn 0.",
    };
  }

  if (input.type === "add" && !input.isNewMedicineProposal) {
    if (!matchedItem) {
      return {
        valid: false,
        error: "Không tìm thấy thuốc này trong danh mục Kho thuốc chung.",
      };
    }
    if (matchedItem.isHidden) {
      return {
        valid: false,
        error:
          "Thuốc này đã ngừng kinh doanh, không thể gửi đề xuất nhập bổ sung.",
      };
    }
  }

  if (input.type === "remove") {
    if (!matchedItem) {
      return {
        valid: false,
        error: "Không tìm thấy thuốc này trong Kho thuốc chung.",
      };
    }
    const ownPendingRemove = existingRequests.filter(
      (r) =>
        r.status === "pending" &&
        r.type === "remove" &&
        r.expertId === input.expertId &&
        ((input.shopProductId && r.shopProductId === input.shopProductId) ||
          (input.medicineId && r.medicineId === input.medicineId))
    );
    const pendingRemoveQty = ownPendingRemove.reduce(
      (sum, r) => sum + r.quantity,
      0
    );

    if (input.quantity + pendingRemoveQty > matchedItem.warehouseStock) {
      return {
        valid: false,
        error: `Số lượng xuất hủy (${input.quantity}) + đang chờ duyệt (${pendingRemoveQty}) vượt quá tồn kho chung (${matchedItem.warehouseStock} ${matchedItem.unit}).`,
      };
    }
  }

  return { valid: true };
}

export function submitMedicineBoxRequest(
  input: SubmitMedicineBoxRequestInput
): { ok: boolean; error?: string; request?: MedicineBoxRequest } {
  const items = readMedicineBoxItems(input.expertId, { includeHidden: true });
  const existing = readMedicineBoxRequests();
  const validation = validateMedicineBoxRequest(input, items, existing);
  if (!validation.valid) {
    return { ok: false, error: validation.error };
  }

  const normalizedQuantity =
    input.type === "discontinue" ? 0 : Math.trunc(input.quantity);

  const newReq: MedicineBoxRequest = {
    id: `mbr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    expertId: input.expertId,
    expertName: input.expertName,
    type: input.type,
    itemType: input.itemType,
    medicineId: input.medicineId,
    shopProductId: input.shopProductId,
    medicineName: input.medicineName.trim(),
    activeIngredient: input.activeIngredient?.trim(),
    unit: input.unit.trim() || "đơn vị",
    quantity: normalizedQuantity,
    isNewMedicineProposal: input.isNewMedicineProposal,
    removeAll: input.removeAll,
    returnToWarehouse: input.returnToWarehouse,
    discontinueAction:
      input.type === "discontinue"
        ? input.discontinueAction ?? "hide"
        : undefined,
    reason: input.reason.trim(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  writeMedicineBoxRequests([newReq, ...existing]);
  emitMedicineBoxSync();
  return { ok: true, request: newReq };
}

/**
 * Nghiệp vụ v1.4 Mục 8: Khi bác sĩ nhập số lượng xuất dùng vượt quá tồn kho chung (bị chặn xuất âm),
 * bác sĩ bấm "Báo Quản lý bổ sung kho" để gửi yêu cầu nhập bổ sung khẩn cấp và thông báo ngay cho QL.
 */
export function reportOutOfStockToManager(params: {
  expertId: string;
  expertName: string;
  shopProductId: string;
  requestedQty: number;
  availableQty: number;
  referenceCode?: string;
}): { ok: boolean; error?: string; request?: MedicineBoxRequest } {
  const items = readMedicineBoxItems(params.expertId, { includeHidden: true });
  const matched = items.find((it) => it.shopProductId === params.shopProductId);
  if (!matched) {
    return { ok: false, error: "Không tìm thấy thuốc trong danh mục kho." };
  }

  const deficitQty = Math.max(
    5,
    Math.trunc(params.requestedQty) - Math.max(0, Math.trunc(params.availableQty))
  );
  const reason = `Cảnh báo thiếu tồn kho khi khám${
    params.referenceCode ? ` (Ca ${params.referenceCode})` : ""
  }: Bác sĩ cần xuất dùng ${params.requestedQty} ${matched.unit} nhưng kho chung chỉ còn ${
    params.availableQty
  } ${matched.unit} (đã chặn xuất âm). Đề nghị Quản lý nhập bổ sung khẩn cấp.`;

  const res = submitMedicineBoxRequest({
    expertId: params.expertId,
    expertName: params.expertName,
    type: "add",
    itemType: matched.itemType,
    medicineId: matched.id,
    shopProductId: matched.shopProductId,
    medicineName: matched.name,
    activeIngredient: matched.activeIngredient,
    unit: matched.unit,
    quantity: deficitQty,
    isNewMedicineProposal: false,
    reason,
  });

  if (res.ok) {
    pushManagerNotification({
      type: "stock",
      title: `Cảnh báo thiếu thuốc tại phòng khám: ${matched.name}`,
      desc: `${params.expertName} báo thiếu tồn kho chung (cần ${params.requestedQty} ${matched.unit}, kho còn ${params.availableQty} ${matched.unit}).`,
      href: "/manager/shop?tab=medicine-box",
    });
  }

  return res;
}

export function cancelMedicineBoxRequest(
  reqId: string,
  expertId?: string
): boolean {
  const existing = readMedicineBoxRequests();
  const target = existing.find((r) => r.id === reqId);
  if (!target || target.status !== "pending") return false;
  if (expertId && target.expertId !== expertId) return false;

  const next = existing.filter((r) => r.id !== reqId);
  writeMedicineBoxRequests(next);
  emitMedicineBoxSync();
  return true;
}

/**
 * Phê duyệt / từ chối đề xuất thuốc từ Bác sĩ theo Animora v1.4 (Kho thuốc chung):
 * - Đề xuất SKU thuốc mới (isNewMedicineProposal): tạo SKU mới stock = 0 để Quản lý tạo PO nhập NCC.
 * - Đề xuất bổ sung kho chung (type === "add"): duyệt ghi nhận nhu cầu bổ sung (KHÔNG trừ kho chung, KHÔNG chặn khi kho = 0) để Quản lý tạo PO NCC.
 * - Đề xuất ngừng kinh doanh (type === "discontinue"): chuyển isHidden = true (ẩn khỏi Shop, giữ lịch sử nếu có ràng buộc).
 */
export function reviewMedicineBoxRequest(
  reqId: string,
  decision: "approved" | "rejected",
  adminNote?: string
): {
  ok: boolean;
  error?: string;
  request?: MedicineBoxRequest;
  createdProductId?: string;
} {
  const existing = readMedicineBoxRequests();
  const target = existing.find((r) => r.id === reqId);
  if (!target) {
    return { ok: false, error: "Không tìm thấy yêu cầu này." };
  }
  if (target.status !== "pending") {
    return { ok: false, error: "Yêu cầu này đã được xử lý trước đó." };
  }

  const nowIso = new Date().toISOString();
  let createdProductId: string | undefined;
  let finalNote =
    adminNote?.trim() ||
    (decision === "approved"
      ? "Quản lý đã phê duyệt đề xuất."
      : "Quản lý từ chối yêu cầu.");

  if (decision === "approved") {
    const warehouse = readWarehouseProducts();

    if (target.type === "add") {
      if (target.isNewMedicineProposal) {
        const prefix = target.itemType === "vaccine" ? "vac" : "med";
        const stamp = Date.now();
        const newProdId = `prod-${prefix}-${stamp}`;
        const newMedId = `${prefix}-${String(stamp).slice(-4)}`;
        const newProd: StoredShopProduct = {
          id: newProdId,
          medicineId: newMedId,
          name: target.medicineName,
          description: target.reason || `Thuốc đề xuất bởi ${target.expertName}`,
          category: "medicine",
          petTypes: ["dog", "cat"],
          price: 150000,
          stock: 0, // Chờ đặt PO & nhập hàng từ NCC vào Kho thuốc chung
          rating: 5,
          reviewCount: 0,
          image: "/assets/products/gallery-nutrition-detail.jpg",
          images: ["/assets/products/gallery-nutrition-detail.jpg"],
          spec: target.unit,
          ingredientsVi: target.activeIngredient || target.medicineName,
          requiresPrescription: true,
          isHidden: false,
          costPrice: 95000,
        };
        writeWarehouseProducts([newProd, ...warehouse]);
        ensureSupplierCatalogMetaForProduct(newProdId, "medicine");

        createdProductId = newProdId;
        if (!adminNote?.trim()) {
          finalNote = `Đã duyệt tạo SKU mới (${newProdId}) ở trạng thái chờ nhập PO từ NCC Dược (${target.quantity} ${target.unit}).`;
        }
      } else {
        const prodIdx = warehouse.findIndex(
          (p) =>
            (target.shopProductId && p.id === target.shopProductId) ||
            (target.medicineId && p.medicineId === target.medicineId)
        );
        if (prodIdx < 0) {
          return {
            ok: false,
            error: "Không tìm thấy thuốc này trong Kho thuốc chung.",
          };
        }
        if (warehouse[prodIdx].isHidden) {
          return {
            ok: false,
            error: "Sản phẩm đã ngừng kinh doanh, không thể bổ sung kho.",
          };
        }

        const prod = warehouse[prodIdx];
        const currentWarehouse = prod.stock ?? 0;

        // v1.4 Kho chung: Duyệt đề xuất bổ sung KHÔNG trừ kho chung và KHÔNG lỗi khi kho = 0;
        // ghi nhận duyệt để Quản lý bấm "Tạo PO NCC" nhập hàng về Kho chung.
        appendMedicineBoxLogs([
          {
            id: `mblog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            expertId: target.expertId,
            expertName: target.expertName,
            shopProductId: prod.id,
            medicineName: target.medicineName,
            unit: target.unit,
            action: "request_add",
            quantityDelta: 0,
            beforeShelfStock: currentWarehouse,
            afterShelfStock: currentWarehouse,
            actorLabel: "Đã xử lý bởi Quản lý",
            referenceCode: target.id,
            note: `QL đã duyệt đề xuất nhập bổ sung ${target.quantity} ${target.unit} vào Kho chung — chờ tạo/nhận PO từ NCC.`,
            createdAt: nowIso,
          },
        ]);

        if (!adminNote?.trim()) {
          finalNote = `Đã duyệt đề xuất nhập bổ sung ${target.quantity} ${target.unit} vào Kho chung. Vui lòng tạo đơn PO nhập từ NCC Dược.`;
        }
      }
    } else if (target.type === "remove") {
      // Hỗ trợ xuất hủy hàng hỏng / hết hạn trực tiếp từ Kho thuốc chung
      const prodIdx = warehouse.findIndex(
        (p) =>
          (target.shopProductId && p.id === target.shopProductId) ||
          (target.medicineId && p.medicineId === target.medicineId)
      );
      if (prodIdx < 0) {
        return {
          ok: false,
          error: "Không tìm thấy thuốc này trong Kho thuốc chung.",
        };
      }
      const prod = warehouse[prodIdx];
      const beforeStock = prod.stock ?? 0;
      const qtyToDispose = target.removeAll
        ? beforeStock
        : Math.min(beforeStock, target.quantity);

      if (qtyToDispose < target.quantity && !target.removeAll) {
        return {
          ok: false,
          error: `Tồn kho chung chỉ còn ${beforeStock} ${target.unit}, không đủ để xuất hủy ${target.quantity} ${target.unit}.`,
        };
      }

      const afterStock = Math.max(0, beforeStock - qtyToDispose);
      const updatedWarehouse = warehouse.map((p, idx) =>
        idx === prodIdx ? { ...p, stock: afterStock } : p
      );
      writeWarehouseProducts(updatedWarehouse);

      const action: MedicineBoxLogAction = "remove_dispose";
      appendMedicineBoxLogs([
        {
          id: `mblog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          expertId: target.expertId,
          expertName: target.expertName,
          shopProductId: prod.id,
          medicineName: target.medicineName,
          unit: target.unit,
          action,
          quantityDelta: -qtyToDispose,
          beforeShelfStock: beforeStock,
          afterShelfStock: afterStock,
          actorLabel: "Đã xử lý bởi Quản lý",
          referenceCode: target.id,
          note: `QL duyệt xuất hủy / hết hạn ${qtyToDispose} ${target.unit} khỏi Kho chung`,
          createdAt: nowIso,
        },
      ]);
    } else if (target.type === "discontinue") {
      const prodIdx = warehouse.findIndex(
        (p) =>
          (target.shopProductId && p.id === target.shopProductId) ||
          (target.medicineId && p.medicineId === target.medicineId)
      );
      if (prodIdx < 0) {
        return {
          ok: false,
          error: "Không tìm thấy sản phẩm này trong danh mục Kho thuốc chung.",
        };
      }
      const targetProd = warehouse[prodIdx];
      const report = checkProductDeletionConstraints(targetProd.id);

      const updatedWarehouse = warehouse.map((p, idx) =>
        idx === prodIdx ? { ...p, isHidden: true } : p
      );
      writeWarehouseProducts(updatedWarehouse);

      const currentStock = targetProd.stock ?? 0;
      appendMedicineBoxLogs([
        {
          id: `mblog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          expertId: target.expertId,
          expertName: target.expertName,
          shopProductId: targetProd.id,
          medicineName: target.medicineName,
          unit: target.unit,
          action: "discontinue",
          quantityDelta: 0,
          beforeShelfStock: currentStock,
          afterShelfStock: currentStock,
          actorLabel: "Đã xử lý bởi Quản lý",
          referenceCode: target.id,
          note:
            report.reasons.length > 0
              ? `Ngừng kinh doanh (ẩn khỏi Shop, giữ lịch sử do: ${report.reasons.join("; ")})`
              : "Ngừng kinh doanh khỏi danh mục Shop",
          createdAt: nowIso,
        },
      ]);

      if (!adminNote?.trim()) {
        finalNote =
          report.reasons.length > 0
            ? `Đã chuyển thuốc sang Ngừng kinh doanh (giữ dữ liệu lịch sử do: ${report.reasons.join("; ")}).`
            : "Quản lý đã phê duyệt ngừng kinh doanh thuốc khỏi danh mục Shop.";
      }
    }
  }

  const updatedTarget: MedicineBoxRequest = {
    ...target,
    status: decision,
    shopProductId: target.shopProductId || createdProductId,
    reviewedAt: nowIso,
    adminNote: finalNote,
  };
  const updatedList = existing.map((r) => (r.id === reqId ? updatedTarget : r));
  writeMedicineBoxRequests(updatedList);

  try {
    const store = readExpertStore(target.expertId);
    const actionLabelVi =
      target.type === "add"
        ? target.isNewMedicineProposal
          ? "thêm thuốc mới"
          : "bổ sung kho chung"
        : target.type === "remove"
        ? "xuất hủy thuốc"
        : "ngừng kinh doanh";
    const notif: ExpertNotification = {
      id: `notif-mb-${Date.now()}`,
      expertId: target.expertId,
      type: "medicine_box_result",
      title: {
        vi:
          decision === "approved"
            ? `Đã duyệt đề xuất ${actionLabelVi}`
            : `Từ chối đề xuất ${actionLabelVi}`,
        en:
          decision === "approved"
            ? "Medicine warehouse request approved"
            : "Medicine warehouse request rejected",
      },
      body: {
        vi:
          target.type === "discontinue"
            ? `${target.medicineName}: ${finalNote}`
            : `${target.medicineName} (${target.quantity} ${target.unit}): ${finalNote}`,
        en: `${target.medicineName}: ${finalNote}`,
      },
      at: "Vừa xong",
      unread: true,
      href: "/expert/medicine-box",
    };
    writeExpertStore(target.expertId, {
      ...store,
      notifications: [notif, ...store.notifications],
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(EXPERT_SYNC_EVENT));
    }
  } catch {
    // ignore notification errors
  }

  emitMedicineBoxSync(true);
  return { ok: true, request: updatedTarget, createdProductId };
}

