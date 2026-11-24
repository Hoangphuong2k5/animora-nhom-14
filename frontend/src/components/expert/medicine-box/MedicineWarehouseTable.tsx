"use client";

import React from "react";
import {
  Ban,
  Pill,
  Plus,
  Search,
  Sparkles,
  Syringe,
  TrendingDown,
} from "lucide-react";
import type { MedicineBoxCategory, MedicineBoxItem } from "@/types/expert.type";

export type WarehouseFilter = "all" | "my_used" | "low" | "safe";
export type CategoryFilter = "all" | MedicineBoxCategory;

interface MedicineWarehouseTableProps {
  items: MedicineBoxItem[];
  filteredItems: MedicineBoxItem[];
  search: string;
  onChangeSearch: (val: string) => void;
  categoryFilter: CategoryFilter;
  onChangeCategoryFilter: (val: CategoryFilter) => void;
  warehouseFilter: WarehouseFilter;
  onChangeWarehouseFilter: (val: WarehouseFilter) => void;
  counts: {
    medicineCount: number;
    vaccineCount: number;
    usedTypesByMe: number;
    lowWarehouseCount: number;
    safeWarehouseCount: number;
  };
  onOpenUsage: (item: MedicineBoxItem) => void;
  onOpenRequest: (type: "add" | "discontinue", item: MedicineBoxItem) => void;
}

export function MedicineWarehouseTable({
  items,
  filteredItems,
  search,
  onChangeSearch,
  categoryFilter,
  onChangeCategoryFilter,
  warehouseFilter,
  onChangeWarehouseFilter,
  counts,
  onOpenUsage,
  onOpenRequest,
}: MedicineWarehouseTableProps) {
  return (
    <div className="rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md p-4 sm:p-5 space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onChangeSearch(e.target.value)}
            placeholder="Tìm tên thuốc, vắc-xin, hoạt chất hoặc mã..."
            className="w-full h-9.5 pl-9 pr-3 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted/40 text-xs text-zinc-900 dark:text-foreground focus:outline-none focus:border-[#6B1F2E]"
          />
        </div>

        <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-zinc-100/80 dark:bg-muted/50 p-1 border border-zinc-200/70 dark:border-border/60 text-xs w-fit">
          <button
            type="button"
            onClick={() => onChangeCategoryFilter("all")}
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
            onClick={() => onChangeCategoryFilter("medicine")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
              categoryFilter === "medicine"
                ? "bg-teal-700 text-white shadow-xs"
                : "text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground"
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Thuốc ({counts.medicineCount})</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeCategoryFilter("vaccine")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
              categoryFilter === "vaccine"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground"
            }`}
          >
            <Syringe className="w-3.5 h-3.5" />
            <span>Vắc-xin ({counts.vaccineCount})</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-border/60">
        <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-zinc-100/80 dark:bg-muted/50 p-1 border border-zinc-200/70 dark:border-border/60 text-xs">
          {(
            [
              { id: "all", label: `Kho chung (${items.length})` },
              {
                id: "my_used",
                label: `Thuốc tôi đã dùng (${counts.usedTypesByMe})`,
              },
              {
                id: "low",
                label: `Sắp hết / Hết trong kho (${counts.lowWarehouseCount})`,
              },
              {
                id: "safe",
                label: `Đủ tồn kho (${counts.safeWarehouseCount})`,
              },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onChangeWarehouseFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                warehouseFilter === f.id
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
      <div className="overflow-x-auto rounded-2xl border border-zinc-200/70 dark:border-border/70">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FBF6F7]/90 dark:bg-muted/50 border-b border-zinc-200 dark:border-border text-[11px] uppercase tracking-wider text-zinc-500">
              <th className="py-3 px-4 font-semibold whitespace-nowrap">
                Thuốc / Vắc-xin &amp; Hoạt chất
              </th>
              <th className="py-3 px-3 font-semibold whitespace-nowrap">
                Dạng &amp; Đơn vị
              </th>
              <th className="py-3 px-3 text-center font-semibold whitespace-nowrap">
                Tồn kho chung
              </th>
              <th className="py-3 px-3 text-center font-semibold whitespace-nowrap">
                Đã xuất dùng
              </th>
              <th className="py-3 px-3 text-center font-semibold whitespace-nowrap">
                Trạng thái
              </th>
              <th className="py-3 px-4 text-right font-semibold whitespace-nowrap">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-border/60">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-zinc-400">
                  Không tìm thấy thuốc hoặc vắc-xin nào phù hợp bộ lọc.
                </td>
              </tr>
            ) : (
              filteredItems.map((it) => {
                const isEmptyWarehouse = it.warehouseStock <= 0;
                const isLowWarehouse =
                  it.warehouseStock > 0 &&
                  it.warehouseStock < it.minShelfThreshold;
                const isVaccine = it.itemType === "vaccine";
                const usedByMe = it.usedByDoctorCount ?? 0;

                return (
                  <tr
                    key={it.shopProductId}
                    className={`hover:bg-zinc-50/80 dark:hover:bg-muted/30 transition-colors ${
                      it.isHidden ? "opacity-75" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4 min-w-[240px] max-w-[320px] align-middle">
                      <div className="font-bold text-zinc-900 dark:text-foreground leading-snug">
                        {it.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold shrink-0 ${
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
                        {it.isHidden && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 shrink-0">
                            Ngừng KD
                          </span>
                        )}
                        {it.isNewInWarehouse && !it.isHidden && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 shrink-0">
                            <Sparkles className="w-2.5 h-2.5" />
                            Mới
                          </span>
                        )}
                        <span className="text-[11px] text-zinc-500 truncate max-w-[200px]">
                          {it.activeIngredient}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-zinc-600 dark:text-zinc-300 whitespace-nowrap align-middle">
                      <div className="font-medium text-zinc-800 dark:text-zinc-200">
                        {it.form}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        ĐVT: {it.unit}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-center whitespace-nowrap align-middle">
                      <span
                        className={`text-sm font-extrabold ${
                          isEmptyWarehouse
                            ? "text-rose-600"
                            : isLowWarehouse
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

                    <td className="py-3.5 px-3 text-center whitespace-nowrap align-middle">
                      <span
                        className={`text-sm font-extrabold ${
                          usedByMe > 0
                            ? "text-[#6B1F2E] dark:text-[#FF7F6B]"
                            : "text-zinc-400"
                        }`}
                      >
                        {usedByMe}
                      </span>
                      <span className="text-[10px] text-zinc-400 ml-1">
                        {it.unit}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center whitespace-nowrap align-middle">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                          it.isHidden
                            ? "bg-zinc-200/70 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                            : isEmptyWarehouse
                            ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                            : isLowWarehouse
                            ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        }`}
                      >
                        {it.isHidden
                          ? "Ngừng kinh doanh"
                          : isEmptyWarehouse
                          ? "Hết tồn kho (0)"
                          : isLowWarehouse
                          ? "Sắp hết (<5)"
                          : "Đủ tồn kho"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap align-middle">
                      <div className="inline-flex items-center justify-end gap-1.5 flex-nowrap">
                        <button
                          type="button"
                          disabled={Boolean(it.isHidden)}
                          onClick={() => onOpenUsage(it)}
                          title="Ghi nhận thuốc dùng tại phòng khám (trừ kho chung, chặn xuất âm)"
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap shrink-0 transition-colors ${
                            it.isHidden
                              ? "bg-zinc-100 dark:bg-muted text-zinc-400 cursor-not-allowed"
                              : "bg-[#6B1F2E] hover:bg-[#521723] text-white cursor-pointer"
                          }`}
                        >
                          <TrendingDown className="w-3 h-3 text-[#FF7F6B] shrink-0" />
                          <span>Xuất dùng</span>
                        </button>
                        <button
                          type="button"
                          disabled={Boolean(it.isHidden)}
                          onClick={() => onOpenRequest("add", it)}
                          title="Gửi yêu cầu bổ sung tồn kho cho Quản lý"
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap shrink-0 transition-colors ${
                            it.isHidden
                              ? "bg-zinc-100 dark:bg-muted text-zinc-400 cursor-not-allowed"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                          }`}
                        >
                          <Plus className="w-3 h-3 shrink-0" />
                          <span>Bổ sung</span>
                        </button>
                        <button
                          type="button"
                          disabled={Boolean(it.isHidden)}
                          onClick={() => onOpenRequest("discontinue", it)}
                          title="Đề xuất Quản lý ngừng kinh doanh thuốc này"
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap shrink-0 border transition-colors ${
                            it.isHidden
                              ? "border-zinc-200 dark:border-border text-zinc-400 cursor-not-allowed"
                              : "border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 cursor-pointer"
                          }`}
                        >
                          <Ban className="w-3 h-3 shrink-0" />
                          <span>Ngừng KD</span>
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
  );
}

