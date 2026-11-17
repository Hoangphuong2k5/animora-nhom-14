"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Archive,
  Ban,
  BriefcaseMedical,
  Clock,
  History,
  Minus,
  Package,
  Pill,
  Plus,
  Search,
  Sparkles,
  Syringe,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import { useExpert } from "@/components/expert/ExpertProvider";
import { VetRouteGuard } from "@/components/expert/VetOnly";
import { StatusBadge } from "@/components/expert/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  MedicineBoxCategory,
  MedicineBoxItem,
  MedicineBoxLogAction,
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
  submitMedicineBoxRequest,
} from "@/utils/medicineBoxSync";

type ShelfFilter = "all" | "low" | "new_in_warehouse" | "safe";
type CategoryFilter = "all" | MedicineBoxCategory;

const LOG_ACTION_META: Record<
  MedicineBoxLogAction,
  { label: string; cls: string }
> = {
  po_allocation: {
    label: "Phân bổ nhập kho (PO)",
    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
  request_add: {
    label: "QL duyệt thêm từ kho",
    cls: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  },
  usage: {
    label: "Sử dụng điều trị",
    cls: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  },
  remove_return: {
    label: "Hoàn trả về kho",
    cls: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  },
  remove_dispose: {
    label: "Xuất hủy / Hết hạn",
    cls: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
  },
  discontinue: {
    label: "Ngừng kinh doanh Shop",
    cls: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  },
};

export default function ExpertMedicineBoxPage() {
  const { profile } = useExpert();

  const [items, setItems] = useState<MedicineBoxItem[]>([]);
  const [requests, setRequests] = useState<MedicineBoxRequest[]>([]);
  const [logs, setLogs] = useState<MedicineBoxLogEntry[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [shelfFilter, setShelfFilter] = useState<ShelfFilter>("all");
  const [logActionFilter, setLogActionFilter] = useState<
    "all" | MedicineBoxLogAction
  >("all");
  const [showAllLogs, setShowAllLogs] = useState(false);

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
  const [quantity, setQuantity] = useState<number>(5);
  const [removeAll, setRemoveAll] = useState(false);
  const [returnToWarehouse, setReturnToWarehouse] = useState(true);
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
    const nextLogs = readMedicineBoxLogs(profile.id);
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
    const onShelfTypes = items.filter((i) => i.shelfStock > 0).length;
    const totalShelfUnits = items.reduce((s, i) => s + i.shelfStock, 0);
    const totalWarehouseUnits = items.reduce((s, i) => s + i.warehouseStock, 0);
    const lowShelfCount = items.filter(
      (i) => !i.isHidden && i.shelfStock < i.minShelfThreshold
    ).length;
    const pendingRequestsCount = requests.filter(
      (r) => r.status === "pending"
    ).length;
    const medicineCount = items.filter((i) => i.itemType === "medicine").length;
    const vaccineCount = items.filter((i) => i.itemType === "vaccine").length;
    return {
      onShelfTypes,
      totalShelfUnits,
      totalWarehouseUnits,
      lowShelfCount,
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
        if (shelfFilter === "low") {
          return !it.isHidden && it.shelfStock < it.minShelfThreshold;
        }
        if (shelfFilter === "new_in_warehouse") return Boolean(it.isNewInWarehouse);
        if (shelfFilter === "safe") return it.shelfStock >= it.minShelfThreshold;
        return true;
      });
  }, [items, search, categoryFilter, shelfFilter]);

  const selectedItem = useMemo(
    () => items.find((i) => i.shopProductId === selectedProductId) || items[0],
    [items, selectedProductId]
  );

  const openRequestModal = (
    type: MedicineBoxRequestType,
    item?: MedicineBoxItem,
    proposeNew = false
  ) => {
    setReqType(type);
    setIsNewProposal(type === "add" && proposeNew);
    setRemoveAll(false);
    setReturnToWarehouse(true);
    setReason("");
    if (item) {
      setSelectedProductId(item.shopProductId);
      setQuantity(
        type === "add"
          ? Math.min(5, Math.max(1, item.warehouseStock))
          : type === "remove"
          ? Math.min(1, Math.max(1, item.shelfStock))
          : 1
      );
    } else if (items.length > 0) {
      const first = items[0];
      setSelectedProductId(first.shopProductId);
      setQuantity(type === "add" ? 5 : 1);
    }
    setModalOpen(true);
  };

  const handleSwitchReqType = (nextType: MedicineBoxRequestType) => {
    setReqType(nextType);
    setIsNewProposal(false);
    setRemoveAll(false);
    if (selectedItem) {
      if (nextType === "add") {
        setQuantity(Math.min(5, Math.max(1, selectedItem.warehouseStock)));
      } else if (nextType === "remove") {
        setQuantity(Math.min(1, Math.max(1, selectedItem.shelfStock)));
      }
    }
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();

    const targetItem = !isNewProposal ? selectedItem : undefined;
    const finalQty =
      reqType === "discontinue"
        ? 0
        : reqType === "remove" && removeAll && targetItem
        ? targetItem.shelfStock
        : Math.trunc(quantity);

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
      removeAll: reqType === "remove" ? removeAll : undefined,
      returnToWarehouse: reqType === "remove" ? returnToWarehouse : undefined,
      discontinueAction: reqType === "discontinue" ? "hide" : undefined,
      reason,
    });

    if (!result.ok) {
      toast.error(result.error || "Không thể gửi yêu cầu.");
      return;
    }

    toast.success(
      reqType === "add"
        ? "Đã gửi yêu cầu thêm / đề xuất thuốc tới Quản lý duyệt!"
        : reqType === "remove"
        ? "Đã gửi yêu cầu xóa thuốc khỏi kệ tới Quản lý duyệt!"
        : "Đã gửi đề xuất ngừng kinh doanh / xóa thuốc khỏi Shop tới Quản lý!"
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

  const handleConfirmUsage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usageTarget) return;
    const res = recordDoctorMedicineUsage({
      expertId: profile.id,
      expertName: profile.fullName,
      shopProductId: usageTarget.shopProductId,
      quantity: Math.trunc(usageQty),
      referenceCode: usageRefCode,
      note: usageNote,
    });
    if (!res.ok) {
      toast.error(res.error || "Không thể ghi nhận sử dụng thuốc.");
      return;
    }
    toast.success(
      `Đã ghi nhận sử dụng ${Math.trunc(usageQty)} ${usageTarget.unit} ${usageTarget.name}. Tồn trên kệ còn ${res.afterShelfStock} ${usageTarget.unit}.`
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
                Hộp Thuốc Cá Nhân ({profile.fullName})
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#6B1F2E]/10 text-[#6B1F2E] dark:bg-[#FF7F6B]/20 dark:text-[#FF7F6B]">
                Kệ riêng • Tự động phân bổ từ Kho
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Theo dõi số lượng thuốc &amp; vắc-xin trên kệ cá nhân của bạn, ghi nhận sử dụng khi điều trị, đối chiếu tồn kho chung và gửi yêu cầu tới Quản lý.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openRequestModal("add", undefined, true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#6B1F2E] hover:bg-[#521723] text-white cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#FF7F6B]" />
              <span>Đề xuất thuốc mới / Xin bổ sung</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md space-y-1">
            <div className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1.5">
              <BriefcaseMedical className="w-3.5 h-3.5 text-[#6B1F2E] dark:text-[#FF7F6B]" />
              <span>Đầu thuốc trên kệ cá nhân</span>
            </div>
            <div className="text-2xl font-extrabold font-heading text-zinc-900 dark:text-foreground">
              {stats.onShelfTypes} / {items.length}
            </div>
            <div className="text-[10px] text-zinc-400">
              Tổng {stats.totalShelfUnits} đơn vị trên kệ của bạn
            </div>
          </div>

          <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md space-y-1">
            <div className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1.5">
              <Archive className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kho chung chưa phân bổ</span>
            </div>
            <div className="text-2xl font-extrabold font-heading text-emerald-600 dark:text-emerald-400">
              {stats.totalWarehouseUnits}
            </div>
            <div className="text-[10px] text-zinc-400">
              Tồn tại kho trung tâm (không cộng trùng kệ)
            </div>
          </div>

          <div
            className={`p-4 rounded-3xl border backdrop-blur-md space-y-1 ${
              stats.lowShelfCount > 0
                ? "border-rose-300 bg-rose-50/70 dark:border-rose-900/60 dark:bg-rose-950/20"
                : "border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80"
            }`}
          >
            <div className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Sắp hết trên kệ (&lt; 5)</span>
            </div>
            <div className="text-2xl font-extrabold font-heading text-rose-600 dark:text-rose-400">
              {stats.lowShelfCount}
            </div>
            <div className="text-[10px] text-rose-600/80 dark:text-rose-300/80">
              Cần xin bổ sung hoặc chờ đợt nhập PO
            </div>
          </div>

          <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md space-y-1">
            <div className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Yêu cầu của bạn chờ QL</span>
            </div>
            <div className="text-2xl font-extrabold font-heading text-amber-600 dark:text-amber-400">
              {stats.pendingRequestsCount}
            </div>
            <div className="text-[10px] text-zinc-400">
              Thêm / xóa kệ / ngừng kinh doanh
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md p-4 sm:p-5 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tên thuốc, vắc-xin, hoạt chất hoặc mã..."
                className="w-full h-9.5 pl-9 pr-3 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted/40 text-xs text-zinc-900 dark:text-foreground focus:outline-none focus:border-[#6B1F2E]"
              />
            </div>

            <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-zinc-100/80 dark:bg-muted/50 p-1 border border-zinc-200/70 dark:border-border/60 text-xs w-fit">
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                  categoryFilter === "all"
                    ? "bg-[#6B1F2E] text-white shadow-xs"
                    : "text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground"
                }`}
              >
                <span>Tất cả ({items.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter("medicine")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                  categoryFilter === "medicine"
                    ? "bg-teal-700 text-white shadow-xs"
                    : "text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground"
                }`}
              >
                <Pill className="w-3.5 h-3.5" />
                <span>Thuốc ({stats.medicineCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter("vaccine")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                  categoryFilter === "vaccine"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground"
                }`}
              >
                <Syringe className="w-3.5 h-3.5" />
                <span>Vắc-xin ({stats.vaccineCount})</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-border/60">
            <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-zinc-100/80 dark:bg-muted/50 p-1 border border-zinc-200/70 dark:border-border/60 text-xs">
              {(
                [
                  { id: "all", label: `Mọi trạng thái (${items.length})` },
                  {
                    id: "low",
                    label: `Sắp hết / Hết trên kệ (${stats.lowShelfCount})`,
                  },
                  {
                    id: "new_in_warehouse",
                    label: `Mới trong kho (${items.filter((i) => i.isNewInWarehouse).length})`,
                  },
                  {
                    id: "safe",
                    label: `Đủ trên kệ (${items.filter((i) => i.shelfStock >= i.minShelfThreshold).length})`,
                  },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setShelfFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                    shelfFilter === f.id
                      ? "bg-white dark:bg-card text-[#6B1F2E] dark:text-[#FF7F6B] shadow-xs"
                      : "text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Medicine & Vaccine Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-border text-[11px] uppercase tracking-wider text-zinc-500">
                  <th className="py-3 px-3 font-semibold">Thuốc / Vắc-xin &amp; Hoạt chất</th>
                  <th className="py-3 px-3 font-semibold">Dạng &amp; Đơn vị</th>
                  <th className="py-3 px-3 text-center font-semibold">Kệ cá nhân</th>
                  <th className="py-3 px-3 text-center font-semibold">Kho chung</th>
                  <th className="py-3 px-3 text-center font-semibold">Trạng thái kệ</th>
                  <th className="py-3 px-3 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-border/60">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-zinc-400">
                      Không tìm thấy thuốc hoặc vắc-xin nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((it) => {
                    const isEmptyShelf = it.shelfStock <= 0;
                    const isLowShelf =
                      it.shelfStock > 0 && it.shelfStock < it.minShelfThreshold;
                    const isVaccine = it.itemType === "vaccine";

                    return (
                      <tr
                        key={it.shopProductId}
                        className={`hover:bg-zinc-50/80 dark:hover:bg-muted/30 transition-colors ${
                          it.isHidden ? "opacity-75" : ""
                        }`}
                      >
                        <td className="py-3.5 px-3 max-w-[300px]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold shrink-0 ${
                                isVaccine
                                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                                  : "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"
                              }`}
                            >
                              {isVaccine ? (
                                <>
                                  <Syringe className="w-2.5 h-2.5" />
                                  Vắc-xin
                                </>
                              ) : (
                                <>
                                  <Pill className="w-2.5 h-2.5" />
                                  Thuốc
                                </>
                              )}
                            </span>
                            <span className="font-bold text-zinc-900 dark:text-foreground">
                              {it.name}
                            </span>
                            {it.isHidden && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                Ngừng KD
                              </span>
                            )}
                            {it.isNewInWarehouse && !it.isHidden && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                                <Sparkles className="w-2.5 h-2.5" />
                                Mới trong kho
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">
                            {it.activeIngredient}
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-zinc-600 dark:text-zinc-300">
                          <div>{it.form}</div>
                          <div className="text-[10px] text-zinc-400">
                            ĐVT: {it.unit}
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`text-sm font-extrabold ${
                              isEmptyShelf
                                ? "text-rose-600"
                                : isLowShelf
                                ? "text-amber-600"
                                : "text-[#6B1F2E] dark:text-[#FF7F6B]"
                            }`}
                          >
                            {it.shelfStock}
                          </span>
                          <span className="text-[10px] text-zinc-400 ml-1">
                            {it.unit}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`text-sm font-extrabold ${
                              it.warehouseStock <= 0
                                ? "text-rose-600"
                                : it.warehouseStock < 5
                                ? "text-amber-600"
                                : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {it.warehouseStock}
                          </span>
                          <span className="text-[10px] text-zinc-400 ml-1">
                            {it.unit}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              it.isHidden
                                ? "bg-zinc-200/70 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                                : isEmptyShelf
                                ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                : isLowShelf
                                ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            }`}
                          >
                            {it.isHidden
                              ? "Ngừng kinh doanh"
                              : isEmptyShelf
                              ? "Hết trên kệ"
                              : isLowShelf
                              ? "Sắp hết (<5)"
                              : "Đủ trên kệ"}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              disabled={it.shelfStock <= 0}
                              onClick={() => {
                                setUsageTarget(it);
                                setUsageQty(1);
                                setUsageRefCode("");
                                setUsageNote("");
                              }}
                              title={
                                it.shelfStock <= 0
                                  ? "Trên kệ không còn thuốc để ghi nhận sử dụng"
                                  : "Ghi nhận sử dụng thuốc trực tiếp từ kệ cá nhân"
                              }
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                                it.shelfStock <= 0
                                  ? "bg-zinc-100 dark:bg-muted text-zinc-400 cursor-not-allowed"
                                  : "bg-[#6B1F2E] hover:bg-[#521723] text-white cursor-pointer"
                              }`}
                            >
                              <TrendingDown className="w-3 h-3 text-[#FF7F6B]" />
                              Sử dụng
                            </button>
                            <button
                              type="button"
                              disabled={it.warehouseStock <= 0 || Boolean(it.isHidden)}
                              onClick={() => openRequestModal("add", it)}
                              title={
                                it.isHidden
                                  ? "Sản phẩm đã ngừng kinh doanh"
                                  : it.warehouseStock <= 0
                                  ? "Kho chung đã hết thuốc này"
                                  : "Gửi yêu cầu xin thêm từ kho lên kệ"
                              }
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                                it.warehouseStock <= 0 || it.isHidden
                                  ? "bg-zinc-100 dark:bg-muted text-zinc-400 cursor-not-allowed"
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                              }`}
                            >
                              <Plus className="w-3 h-3" />
                              Thêm
                            </button>
                            <button
                              type="button"
                              disabled={it.shelfStock <= 0 && Boolean(it.isHidden)}
                              onClick={() =>
                                openRequestModal(
                                  it.shelfStock > 0 ? "remove" : "discontinue",
                                  it
                                )
                              }
                              title="Gửi yêu cầu xóa khỏi kệ hoặc ngừng kinh doanh khỏi Shop"
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                                it.shelfStock <= 0 && it.isHidden
                                  ? "border-zinc-200 dark:border-border text-zinc-400 cursor-not-allowed"
                                  : "border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                              }`}
                            >
                              <Minus className="w-3 h-3" />
                              Xóa / Đề xuất
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Request History */}
        <div className="rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md p-5 space-y-4">
          <h3 className="font-heading font-extrabold text-sm text-zinc-900 dark:text-foreground flex items-center gap-2">
            <Package className="w-4 h-4 text-[#6B1F2E] dark:text-[#FF7F6B]" />
            Lịch Sử Yêu Cầu Của Bạn Gửi Quản Lý
          </h3>

          {requests.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-400">
              Bạn chưa gửi yêu cầu nào tới Quản lý.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-border">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          req.type === "add"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                            : req.type === "discontinue"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                        }`}
                      >
                        {req.type === "add"
                          ? req.isNewMedicineProposal
                            ? "Đề xuất thuốc mới"
                            : "Thêm lên kệ"
                          : req.type === "discontinue"
                          ? "Đề xuất ngừng KD / Xóa khỏi Shop"
                          : req.removeAll
                          ? "Xóa toàn bộ khỏi kệ"
                          : "Xóa khỏi kệ"}
                      </span>
                      <span className="font-bold text-zinc-900 dark:text-foreground">
                        {req.medicineName}
                      </span>
                      {req.type !== "discontinue" && (
                        <span className="font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                          • {req.quantity} {req.unit}
                        </span>
                      )}
                      {req.type === "remove" && (
                        <span className="text-[10px] text-zinc-500">
                          ({req.returnToWarehouse ? "Hoàn trả về kho" : "Xuất hủy / Hết hạn"})
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-500 italic">&ldquo;{req.reason}&rdquo;</p>
                    {req.adminNote && (
                      <p className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                        Phản hồi Quản lý: {req.adminNote}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {req.isNewMedicineProposal && req.status === "approved" ? (
                      (() => {
                        const isFulfilled =
                          logs.some(
                            (l) =>
                              l.action === "po_allocation" &&
                              (l.shopProductId === req.shopProductId ||
                                l.medicineName.toLowerCase() ===
                                  req.medicineName.toLowerCase())
                          ) ||
                          items.some(
                            (it) =>
                              it.name.toLowerCase() ===
                                req.medicineName.toLowerCase() &&
                              it.shelfStock > 0
                          );
                        return (
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              isFulfilled
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                                : "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300"
                            }`}
                          >
                            {isFulfilled
                              ? "Hoàn tất • Đã cộng tồn tủ"
                              : "Đã duyệt • Đang xử lý chờ nhập PO"}
                          </span>
                        );
                      })()
                    ) : (
                      <StatusBadge status={req.status} size="sm" />
                    )}
                    {req.status === "pending" && req.expertId === profile.id && (
                      <button
                        type="button"
                        onClick={() => handleCancelRequest(req.id)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-zinc-200 dark:border-border text-zinc-600 dark:text-zinc-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      >
                        Hủy đơn
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Allocation & Usage Audit Logs */}
        <div className="rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-heading font-extrabold text-sm text-zinc-900 dark:text-foreground flex items-center gap-2">
              <History className="w-4 h-4 text-[#6B1F2E] dark:text-[#FF7F6B]" />
              Lịch Sử Biến Động Kệ Thuốc (Phân Bổ &amp; Sử Dụng)
            </h3>

            <div className="flex items-center gap-2">
              <Select
                value={logActionFilter}
                onValueChange={(val) => {
                  if (val !== null) {
                    setLogActionFilter(val as "all" | MedicineBoxLogAction);
                    setShowAllLogs(false);
                  }
                }}
                items={{
                  all: "Tất cả thao tác",
                  po_allocation: "Phân bổ nhập kho (PO)",
                  request_add: "QL duyệt thêm từ kho",
                  usage: "Sử dụng điều trị",
                  remove_return: "Hoàn trả về kho",
                  remove_dispose: "Xuất hủy / Hết hạn",
                  discontinue: "Ngừng kinh doanh Shop",
                }}
              >
                <SelectTrigger className="h-8! min-w-[180px] rounded-xl border-zinc-200 dark:border-border bg-white dark:bg-card text-xs font-semibold cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thao tác</SelectItem>
                  <SelectItem value="po_allocation">Phân bổ nhập kho (PO)</SelectItem>
                  <SelectItem value="request_add">QL duyệt thêm từ kho</SelectItem>
                  <SelectItem value="usage">Sử dụng điều trị</SelectItem>
                  <SelectItem value="remove_return">Hoàn trả về kho</SelectItem>
                  <SelectItem value="remove_dispose">Xuất hủy / Hết hạn</SelectItem>
                  <SelectItem value="discontinue">Ngừng kinh doanh Shop</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(() => {
            const filteredLogs = logs.filter((l) =>
              logActionFilter === "all" ? true : l.action === logActionFilter
            );
            const visibleLogs = showAllLogs
              ? filteredLogs
              : filteredLogs.slice(0, 15);

            if (filteredLogs.length === 0) {
              return (
                <div className="p-6 text-center text-xs text-zinc-400">
                  Chưa có lịch sử phân bổ hay sử dụng thuốc phù hợp bộ lọc.
                </div>
              );
            }

            return (
              <div className="space-y-3">
                <div className="divide-y divide-zinc-100 dark:divide-border">
                  {visibleLogs.map((log) => {
                    const meta = LOG_ACTION_META[log.action];
                    return (
                      <div
                        key={log.id}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${meta.cls}`}
                            >
                              {meta.label}
                            </span>
                            <span className="font-bold text-zinc-900 dark:text-foreground">
                              {log.medicineName}
                            </span>
                            {log.referenceCode && (
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-muted text-zinc-600 dark:text-zinc-300">
                                {log.referenceCode}
                              </span>
                            )}
                          </div>
                          {log.note && (
                            <p className="text-[11px] text-zinc-500">{log.note}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0 text-right">
                          <span
                            className={`font-extrabold ${
                              log.quantityDelta > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : log.quantityDelta < 0
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-zinc-500"
                            }`}
                          >
                            {log.quantityDelta > 0
                              ? `+${log.quantityDelta}`
                              : log.quantityDelta}{" "}
                            {log.unit}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            ({log.beforeShelfStock} → {log.afterShelfStock})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredLogs.length > 15 && (
                  <div className="pt-2 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setShowAllLogs((v) => !v)}
                      className="px-4 py-1.5 rounded-xl border border-zinc-200 dark:border-border text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-muted transition-colors cursor-pointer"
                    >
                      {showAllLogs
                        ? "Thu gọn danh sách"
                        : `Xem thêm (${filteredLogs.length - 15} dòng nữa)`}
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Modal Ghi Nhận Sử Dụng Thuốc */}
        <Dialog
          open={Boolean(usageTarget)}
          onOpenChange={(open) => {
            if (!open) setUsageTarget(null);
          }}
        >
          <DialogContent
            showCloseButton={true}
            className="sm:max-w-md rounded-2xl border border-zinc-200 dark:border-border bg-white dark:bg-background text-zinc-900 dark:text-foreground p-6 gap-4 shadow-2xl"
          >
            <DialogHeader className="pb-2 border-b border-zinc-100 dark:border-border">
              <DialogTitle className="font-heading font-extrabold text-base flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-[#6B1F2E] dark:text-[#FF7F6B]" />
                Ghi Nhận Sử Dụng Thuốc Trên Kệ
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">
                {usageTarget?.name} — Hiện có trên kệ của bạn:{" "}
                <strong>
                  {usageTarget?.shelfStock} {usageTarget?.unit}
                </strong>
              </DialogDescription>
            </DialogHeader>
            {usageTarget && (
              <form onSubmit={handleConfirmUsage} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-foreground/80">
                    Số lượng đã sử dụng ({usageTarget.unit}) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={usageTarget.shelfStock}
                    step={1}
                    required
                    value={usageQty}
                    onChange={(e) =>
                      setUsageQty(
                        Math.min(
                          usageTarget.shelfStock,
                          Math.max(1, Math.trunc(Number(e.target.value) || 1))
                        )
                      )
                    }
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-foreground/80">
                    Mã đơn thuốc / Ca khám liên quan (nếu có)
                  </label>
                  <input
                    type="text"
                    value={usageRefCode}
                    onChange={(e) => setUsageRefCode(e.target.value)}
                    placeholder="VD: RX-2026-014 hoặc BK-102"
                    className="w-full h-9.5 px-3 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-foreground/80">
                    Ghi chú sử dụng
                  </label>
                  <Textarea
                    rows={2}
                    value={usageNote}
                    onChange={(e) => setUsageNote(e.target.value)}
                    placeholder="VD: Tiêm phòng cho bé Bơ / Cấp thuốc trực tiếp tại phòng khám..."
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setUsageTarget(null)}
                    className="px-4 py-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-muted cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl font-bold text-white bg-[#6B1F2E] hover:bg-[#521723] cursor-pointer"
                  >
                    Xác nhận trừ kệ
                  </button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal Thêm / Xóa khỏi kệ / Ngừng kinh doanh */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent
            showCloseButton={true}
            className="sm:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin rounded-2xl border border-zinc-200 dark:border-border bg-white dark:bg-background text-zinc-900 dark:text-foreground p-6 gap-4 shadow-2xl"
          >
            <DialogHeader className="pb-3 pr-8 border-b border-zinc-100 dark:border-border">
              <DialogTitle className="font-heading font-extrabold text-base">
                {reqType === "add"
                  ? "Gửi Yêu Cầu Thêm / Đề Xuất Thuốc"
                  : reqType === "remove"
                  ? "Gửi Yêu Cầu Xóa Thuốc Khỏi Kệ Cá Nhân"
                  : "Đề Xuất Ngừng Kinh Doanh / Xóa Khỏi Danh Mục Shop"}
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">
                Yêu cầu sẽ được gửi tới Quản lý cửa hàng &amp; kho để kiểm tra ràng buộc và phê duyệt.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
              {/* Toggle 3 chế độ */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSwitchReqType("add")}
                  className={`py-2 px-2 rounded-xl font-bold border text-[11px] transition-colors cursor-pointer ${
                    reqType === "add"
                      ? "bg-[#6B1F2E] text-white border-transparent"
                      : "border-zinc-200 dark:border-border text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  Thêm / Đề xuất
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchReqType("remove")}
                  className={`py-2 px-2 rounded-xl font-bold border text-[11px] transition-colors cursor-pointer ${
                    reqType === "remove"
                      ? "bg-rose-600 text-white border-transparent"
                      : "border-zinc-200 dark:border-border text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  Xóa khỏi kệ
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchReqType("discontinue")}
                  className={`py-2 px-2 rounded-xl font-bold border text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    reqType === "discontinue"
                      ? "bg-amber-600 text-white border-transparent"
                      : "border-zinc-200 dark:border-border text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  <Ban className="w-3 h-3" />
                  <span>Ngừng KD Shop</span>
                </button>
              </div>

              {reqType === "add" && (
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNewProposal}
                    onChange={(e) => setIsNewProposal(e.target.checked)}
                    className="rounded border-zinc-300 accent-[#6B1F2E]"
                  />
                  <span>Đề xuất thuốc / vắc-xin mới chưa có trong kho</span>
                </label>
              )}

              {isNewProposal && reqType === "add" ? (
                <div className="space-y-3 p-3 rounded-xl border border-sky-200 dark:border-sky-900/50 bg-sky-50/40 dark:bg-sky-950/20">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomItemType("medicine");
                        setCustomUnit("viên");
                      }}
                      className={`py-1.5 px-2.5 rounded-lg font-bold border text-[11px] cursor-pointer ${
                        customItemType === "medicine"
                          ? "bg-teal-700 text-white border-transparent"
                          : "border-zinc-200 dark:border-border bg-white dark:bg-card text-zinc-600"
                      }`}
                    >
                      Loại: Thuốc
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomItemType("vaccine");
                        setCustomUnit("liều");
                      }}
                      className={`py-1.5 px-2.5 rounded-lg font-bold border text-[11px] cursor-pointer ${
                        customItemType === "vaccine"
                          ? "bg-indigo-600 text-white border-transparent"
                          : "border-zinc-200 dark:border-border bg-white dark:bg-card text-zinc-600"
                      }`}
                    >
                      Loại: Vắc-xin
                    </button>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700 dark:text-foreground/80">
                      Tên {customItemType === "vaccine" ? "vắc-xin" : "thuốc"} mới *
                    </label>
                    <input
                      type="text"
                      required
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="VD: Thuốc nhỏ mắt Tobramycin Vet..."
                      className="w-full h-9.5 px-3 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card text-xs font-semibold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 dark:text-foreground/80">
                        Hoạt chất
                      </label>
                      <input
                        type="text"
                        value={customIngredient}
                        onChange={(e) => setCustomIngredient(e.target.value)}
                        placeholder="VD: Tobramycin"
                        className="w-full h-9.5 px-3 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 dark:text-foreground/80">
                        Đơn vị tính *
                      </label>
                      <input
                        type="text"
                        required
                        value={customUnit}
                        onChange={(e) => setCustomUnit(e.target.value)}
                        placeholder="viên / lọ / tuýp"
                        className="w-full h-9.5 px-3 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card text-xs"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="font-bold text-zinc-700 dark:text-foreground/80">
                    Chọn thuốc *
                  </label>
                  <Select
                    value={selectedProductId}
                    onValueChange={(val) => {
                      if (val !== null) {
                        setSelectedProductId(val);
                        if (reqType === "remove" && removeAll) {
                          const found = items.find((i) => i.shopProductId === val);
                          if (found) setQuantity(found.shelfStock);
                        }
                      }
                    }}
                    items={Object.fromEntries(
                      items.map((it) => [it.shopProductId, it.name])
                    )}
                  >
                    <SelectTrigger className="w-full h-10! px-3 rounded-xl border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-xs font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((it) => (
                        <SelectItem key={it.shopProductId} value={it.shopProductId}>
                          [{it.itemType === "vaccine" ? "Vắc-xin" : "Thuốc"}] {it.name} (Kệ: {it.shelfStock} • Kho: {it.warehouseStock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedItem && (
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-muted/40 border border-zinc-200/60 dark:border-border text-[11px]">
                      <div>
                        <span className="text-zinc-500">Hiện có trên kệ bạn: </span>
                        <strong className="text-[#6B1F2E] dark:text-[#FF7F6B]">
                          {selectedItem.shelfStock} {selectedItem.unit}
                        </strong>
                      </div>
                      <div>
                        <span className="text-zinc-500">Tồn kho chung: </span>
                        <strong className="text-emerald-600 dark:text-emerald-400">
                          {selectedItem.warehouseStock} {selectedItem.unit}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {reqType === "discontinue" && (
                <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 text-[11px] text-amber-800 dark:text-amber-200">
                  Yêu cầu này đề nghị Quản lý <strong>ngừng kinh doanh / xóa khỏi danh mục Shop</strong> (không tác động trực tiếp lên kệ cá nhân). Quản lý sẽ kiểm tra đơn thuốc, đơn hàng và tồn kho trước khi quyết định.
                </div>
              )}

              {reqType === "remove" && selectedItem && (
                <div className="space-y-2 p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/15">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={removeAll}
                      onChange={(e) => {
                        setRemoveAll(e.target.checked);
                        if (e.target.checked && selectedItem) {
                          setQuantity(selectedItem.shelfStock);
                        }
                      }}
                      className="rounded border-zinc-300 accent-rose-600"
                    />
                    <span>
                      Xóa toàn bộ thuốc này khỏi kệ ({selectedItem.shelfStock}{" "}
                      {selectedItem.unit})
                    </span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={returnToWarehouse}
                      onChange={(e) => setReturnToWarehouse(e.target.checked)}
                      className="rounded border-zinc-300 accent-[#6B1F2E]"
                    />
                    <span>Hoàn trả số lượng xóa về lại Kho (bỏ chọn nếu xuất hủy / hết hạn)</span>
                  </label>
                </div>
              )}

              {reqType !== "discontinue" && (
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-foreground/80">
                    Số lượng ({isNewProposal ? customUnit : selectedItem?.unit || "đơn vị"}) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    required
                    disabled={reqType === "remove" && removeAll}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, Math.trunc(Number(e.target.value) || 1)))
                    }
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-xs font-bold"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-foreground/80">
                  Lý do gửi Quản lý *
                </label>
                <Textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    reqType === "add"
                      ? "VD: Thuốc trên kệ sắp hết, cần bổ sung phục vụ khám chữa bệnh..."
                      : reqType === "remove"
                      ? "VD: Thuốc hết hạn sử dụng / ít dùng, cần thu hồi khỏi kệ..."
                      : "VD: Đã có hoạt chất thế hệ mới an toàn hơn, đề nghị ngừng kinh doanh trên Shop..."
                  }
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-muted cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl font-bold text-white cursor-pointer ${
                    reqType === "add"
                      ? "bg-[#6B1F2E] hover:bg-[#521723]"
                      : reqType === "remove"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  Gửi Quản lý duyệt
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </VetRouteGuard>
  );
}
