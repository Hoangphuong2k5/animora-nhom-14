"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BriefcaseMedical, Plus } from "lucide-react";
import { toast } from "sonner";
import { useExpert } from "@/components/expert/ExpertProvider";
import { VetRouteGuard } from "@/components/expert/VetOnly";
import { MedicineWarehouseStats } from "@/components/expert/medicine-box/MedicineWarehouseStats";
import {
  MedicineWarehouseTable,
  type CategoryFilter,
  type WarehouseFilter,
} from "@/components/expert/medicine-box/MedicineWarehouseTable";
import { MedicineRequestHistoryCard } from "@/components/expert/medicine-box/MedicineRequestHistoryCard";
import { MedicineUsageLedgerCard } from "@/components/expert/medicine-box/MedicineUsageLedgerCard";
import { MedicineUsageModal } from "@/components/expert/medicine-box/MedicineUsageModal";
import { MedicineRequestModal } from "@/components/expert/medicine-box/MedicineRequestModal";
import type {
  MedicineBoxCategory,
  MedicineBoxItem,
  MedicineBoxLogEntry,
  MedicineBoxRequest,
  MedicineBoxRequestType,
} from "@/types/expert.type";
import {
  MEDICINE_BOX_SYNC_EVENT,
  cancelMedicineBoxRequest,
  readMedicineBoxItems,
  readMedicineBoxLogs,
  readMedicineBoxRequests,
  recordDoctorMedicineUsage,
  reportOutOfStockToManager,
  submitMedicineBoxRequest,
} from "@/utils/medicineBoxSync";

export default function ExpertMedicineBoxPage() {
  const { profile, store, allPets } = useExpert();

  const [items, setItems] = useState<MedicineBoxItem[]>([]);
  const [requests, setRequests] = useState<MedicineBoxRequest[]>([]);
  const [logs, setLogs] = useState<MedicineBoxLogEntry[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [warehouseFilter, setWarehouseFilter] =
    useState<WarehouseFilter>("all");

  // Request Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [reqType, setReqType] = useState<MedicineBoxRequestType>("add");
  const [isNewProposal, setIsNewProposal] = useState(false);
  const [customItemType, setCustomItemType] =
    useState<MedicineBoxCategory>("medicine");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [customName, setCustomName] = useState("");
  const [customIngredient, setCustomIngredient] = useState("");
  const [customUnit, setCustomUnit] = useState("viên");
  const [quantity, setQuantity] = useState<number>(10);
  const [reason, setReason] = useState("");

  // Usage Modal state
  const [usageTarget, setUsageTarget] = useState<MedicineBoxItem | null>(null);
  const [usageQty, setUsageQty] = useState<number>(1);
  const [usageRefCode, setUsageRefCode] = useState("");
  const [usageNote, setUsageNote] = useState("");

  const syncData = useCallback(() => {
    const nextItems = readMedicineBoxItems(profile.id);
    const nextReqs = readMedicineBoxRequests().filter(
      (r) => r.expertId === profile.id
    );
    // Đọc sổ cái xuất dùng của bác sĩ kèm các bản ghi nhập PO kho chung để bác sĩ đối chiếu
    const nextLogs = readMedicineBoxLogs().filter(
      (l) => l.expertId === profile.id || l.expertId === "warehouse"
    );
    setItems(nextItems);
    setRequests(nextReqs);
    setLogs(nextLogs);
    if (!selectedProductId && nextItems.length > 0) {
      setSelectedProductId(nextItems[0].shopProductId);
    }
  }, [profile.id, selectedProductId]);

  useEffect(() => {
    const id = window.setTimeout(syncData, 0);
    window.addEventListener(MEDICINE_BOX_SYNC_EVENT, syncData);
    window.addEventListener("storage", syncData);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener(MEDICINE_BOX_SYNC_EVENT, syncData);
      window.removeEventListener("storage", syncData);
    };
  }, [syncData]);

  const stats = useMemo(() => {
    const inStockTypes = items.filter((i) => i.warehouseStock > 0).length;
    const totalWarehouseUnits = items.reduce((s, i) => s + i.warehouseStock, 0);
    const totalUsedByMe = items.reduce(
      (s, i) => s + (i.usedByDoctorCount ?? 0),
      0
    );
    const usedTypesByMe = items.filter(
      (i) => (i.usedByDoctorCount ?? 0) > 0
    ).length;
    const lowWarehouseCount = items.filter(
      (i) => !i.isHidden && i.warehouseStock < i.minShelfThreshold
    ).length;
    const safeWarehouseCount = items.filter(
      (i) => !i.isHidden && i.warehouseStock >= i.minShelfThreshold
    ).length;
    const pendingRequestsCount = requests.filter(
      (r) => r.status === "pending"
    ).length;
    const medicineCount = items.filter((i) => i.itemType === "medicine").length;
    const vaccineCount = items.filter((i) => i.itemType === "vaccine").length;
    return {
      inStockTypes,
      totalTypes: items.length,
      totalWarehouseUnits,
      totalUsedByMe,
      usedTypesByMe,
      lowWarehouseCount,
      safeWarehouseCount,
      pendingRequestsCount,
      medicineCount,
      vaccineCount,
    };
  }, [items, requests]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((it) => {
        if (categoryFilter !== "all" && it.itemType !== categoryFilter) {
          return false;
        }
        if (!q) return true;
        return (
          it.name.toLowerCase().includes(q) ||
          it.activeIngredient.toLowerCase().includes(q) ||
          it.id.toLowerCase().includes(q)
        );
      })
      .filter((it) => {
        if (warehouseFilter === "my_used") {
          return (it.usedByDoctorCount ?? 0) > 0;
        }
        if (warehouseFilter === "low") {
          return !it.isHidden && it.warehouseStock < it.minShelfThreshold;
        }
        if (warehouseFilter === "safe") {
          return !it.isHidden && it.warehouseStock >= it.minShelfThreshold;
        }
        return true;
      });
  }, [items, search, categoryFilter, warehouseFilter]);

  const selectedItem = useMemo(
    () => items.find((i) => i.shopProductId === selectedProductId) || items[0],
    [items, selectedProductId]
  );

  const activeDoctorAppointments = useMemo(
    () =>
      store.appointments.filter(
        (a) =>
          a.status === "in_progress" ||
          a.status === "upcoming" ||
          a.status === "completed"
      ),
    [store.appointments]
  );

  const openRequestModal = (
    type: "add" | "discontinue",
    item?: MedicineBoxItem,
    proposeNew = false
  ) => {
    setReqType(type);
    setIsNewProposal(type === "add" && proposeNew);
    setReason("");
    if (item) {
      setSelectedProductId(item.shopProductId);
      setQuantity(type === "add" ? 10 : 1);
    } else if (items.length > 0) {
      setSelectedProductId(items[0].shopProductId);
      setQuantity(type === "add" ? 10 : 1);
    }
    setModalOpen(true);
  };

  const handleSwitchReqType = (nextType: "add" | "discontinue") => {
    setReqType(nextType);
    setIsNewProposal(false);
    setQuantity(nextType === "add" ? 10 : 1);
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const targetItem = !isNewProposal ? selectedItem : undefined;
    const finalQty = reqType === "discontinue" ? 0 : Math.trunc(quantity);

    const result = submitMedicineBoxRequest({
      expertId: profile.id,
      expertName: profile.fullName,
      type: reqType,
      itemType: isNewProposal ? customItemType : targetItem?.itemType,
      medicineId: targetItem?.id,
      shopProductId: targetItem?.shopProductId,
      medicineName: isNewProposal ? customName : targetItem?.name || "",
      activeIngredient: isNewProposal
        ? customIngredient
        : targetItem?.activeIngredient,
      unit: isNewProposal ? customUnit : targetItem?.unit || "đơn vị",
      quantity: finalQty,
      isNewMedicineProposal: reqType === "add" && isNewProposal,
      discontinueAction: reqType === "discontinue" ? "hide" : undefined,
      reason,
    });

    if (!result.ok) {
      toast.error(result.error || "Không thể gửi yêu cầu.");
      return;
    }

    toast.success(
      reqType === "add"
        ? "Đã gửi yêu cầu bổ sung / đề xuất thuốc mới tới Quản lý duyệt!"
        : "Đã gửi đề xuất ngừng kinh doanh thuốc khỏi Shop tới Quản lý!"
    );
    setModalOpen(false);
    setCustomName("");
    setCustomIngredient("");
    setReason("");
    syncData();
  };

  const handleCancelRequest = (reqId: string) => {
    const ok = cancelMedicineBoxRequest(reqId, profile.id);
    if (ok) {
      toast.success("Đã hủy yêu cầu đang chờ duyệt.");
      syncData();
    } else {
      toast.error("Chỉ có thể hủy yêu cầu của chính bạn khi đang chờ duyệt.");
    }
  };

  const handleOpenUsage = (item: MedicineBoxItem) => {
    setUsageTarget(item);
    setUsageQty(1);
    setUsageRefCode(activeDoctorAppointments[0]?.code || "");
    setUsageNote("");
  };

  const handleConfirmUsage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usageTarget) return;
    if (!usageRefCode.trim()) {
      toast.error(
        "Vui lòng chọn hoặc nhập mã lịch hẹn / ca khám để ghi sổ cái kho chung!"
      );
      return;
    }
    const res = recordDoctorMedicineUsage({
      expertId: profile.id,
      expertName: profile.fullName,
      shopProductId: usageTarget.shopProductId,
      quantity: Math.trunc(usageQty),
      referenceCode: usageRefCode.trim(),
      note: usageNote,
      preventDuplicateForReference: true,
    });
    if (!res.ok) {
      toast.error(res.error || "Không thể ghi nhận xuất dùng thuốc.");
      return;
    }
    toast.success(
      `Đã xuất dùng ${Math.trunc(usageQty)} ${usageTarget.unit} ${usageTarget.name} cho ca ${usageRefCode.trim()}. Tồn kho chung còn ${res.afterWarehouseStock ?? res.afterShelfStock} ${usageTarget.unit}.`
    );
    setUsageTarget(null);
    setUsageRefCode("");
    setUsageNote("");
    syncData();
  };

  const handleReportOutOfStock = () => {
    if (!usageTarget) return;
    const res = reportOutOfStockToManager({
      expertId: profile.id,
      expertName: profile.fullName,
      shopProductId: usageTarget.shopProductId,
      requestedQty: Math.trunc(usageQty),
      availableQty: usageTarget.warehouseStock,
      referenceCode: usageRefCode.trim() || undefined,
    });
    if (!res.ok) {
      toast.error(res.error || "Không thể gửi cảnh báo cho Quản lý.");
      return;
    }
    toast.success(
      `Đã chặn xuất âm & gửi cảnh báo thiếu thuốc "${usageTarget.name}" tới Quản lý nghiệp vụ ngay lập tức!`
    );
    setUsageTarget(null);
    setUsageRefCode("");
    setUsageNote("");
    syncData();
  };

  return (
    <VetRouteGuard>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="min-w-0 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-extrabold font-heading text-zinc-900 dark:text-foreground flex items-center gap-2.5">
                <BriefcaseMedical className="w-6 h-6 text-[#6B1F2E] dark:text-[#FF7F6B]" />
                Kho Thuốc Chung &amp; Sổ Xuất Dùng ({profile.fullName})
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#6B1F2E]/10 text-[#6B1F2E] dark:bg-[#FF7F6B]/20 dark:text-[#FF7F6B]">
                Kho chung v1.4 • Ghi mã bác sĩ &amp; lịch hẹn mỗi lần xuất dùng
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Mọi thuốc và vắc-xin nằm trong một kho chung duy nhất (bỏ kệ riêng
              bác sĩ). Xem tồn thuốc (chỉ đọc), lọc &ldquo;Thuốc tôi đã
              dùng&rdquo;, ghi nhận thuốc xuất dùng tại phòng khám (chặn xuất âm
              &amp; báo Quản lý ngay khi thiếu tồn).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openRequestModal("add", undefined, true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#6B1F2E] hover:bg-[#521723] text-white cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#FF7F6B]" />
              <span>Yêu cầu bổ sung kho / Đề xuất thuốc mới</span>
            </button>
          </div>
        </div>

        <MedicineWarehouseStats doctorName={profile.fullName} stats={stats} />

        <MedicineWarehouseTable
          items={items}
          filteredItems={filteredItems}
          search={search}
          onChangeSearch={setSearch}
          categoryFilter={categoryFilter}
          onChangeCategoryFilter={setCategoryFilter}
          warehouseFilter={warehouseFilter}
          onChangeWarehouseFilter={setWarehouseFilter}
          counts={stats}
          onOpenUsage={handleOpenUsage}
          onOpenRequest={(type, it) => openRequestModal(type, it)}
        />

        <MedicineRequestHistoryCard
          expertId={profile.id}
          requests={requests}
          onCancelRequest={handleCancelRequest}
        />

        <MedicineUsageLedgerCard doctorName={profile.fullName} logs={logs} />

        <MedicineUsageModal
          usageTarget={usageTarget}
          usageQty={usageQty}
          onChangeQty={setUsageQty}
          usageRefCode={usageRefCode}
          onChangeRefCode={setUsageRefCode}
          usageNote={usageNote}
          onChangeNote={setUsageNote}
          activeAppointments={activeDoctorAppointments}
          allPets={allPets}
          onClose={() => setUsageTarget(null)}
          onConfirm={handleConfirmUsage}
          onReportOutOfStock={handleReportOutOfStock}
        />

        <MedicineRequestModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          reqType={reqType}
          onSwitchReqType={handleSwitchReqType}
          isNewProposal={isNewProposal}
          onChangeIsNewProposal={setIsNewProposal}
          customItemType={customItemType}
          onChangeCustomItemType={setCustomItemType}
          customName={customName}
          onChangeCustomName={setCustomName}
          customIngredient={customIngredient}
          onChangeCustomIngredient={setCustomIngredient}
          customUnit={customUnit}
          onChangeCustomUnit={setCustomUnit}
          items={items}
          selectedProductId={selectedProductId}
          onChangeSelectedProductId={setSelectedProductId}
          selectedItem={selectedItem}
          quantity={quantity}
          onChangeQuantity={setQuantity}
          reason={reason}
          onChangeReason={setReason}
          onSubmit={handleSubmitRequest}
        />
      </div>
    </VetRouteGuard>
  );
}
