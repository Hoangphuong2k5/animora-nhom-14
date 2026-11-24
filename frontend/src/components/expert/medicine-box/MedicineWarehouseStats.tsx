"use client";

import React from "react";
import {
  AlertTriangle,
  Archive,
  BriefcaseMedical,
  Clock,
} from "lucide-react";

export interface MedicineWarehouseStatsData {
  inStockTypes: number;
  totalTypes: number;
  totalWarehouseUnits: number;
  totalUsedByMe: number;
  usedTypesByMe: number;
  lowWarehouseCount: number;
  pendingRequestsCount: number;
}

interface MedicineWarehouseStatsProps {
  doctorName: string;
  stats: MedicineWarehouseStatsData;
}

export function MedicineWarehouseStats({
  doctorName,
  stats,
}: MedicineWarehouseStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md space-y-1">
        <div className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1.5">
          <Archive className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tồn Kho Thuốc Chung (Chỉ đọc)</span>
        </div>
        <div className="text-2xl font-extrabold font-heading text-emerald-600 dark:text-emerald-400">
          {stats.inStockTypes} / {stats.totalTypes}
        </div>
        <div className="text-[10px] text-zinc-400">
          Tổng {stats.totalWarehouseUnits} đơn vị khả dụng trong kho chung
        </div>
      </div>

      <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md space-y-1">
        <div className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1.5">
          <BriefcaseMedical className="w-3.5 h-3.5 text-[#6B1F2E] dark:text-[#FF7F6B]" />
          <span>Thuốc Tôi Đã Xuất Dùng</span>
        </div>
        <div className="text-2xl font-extrabold font-heading text-zinc-900 dark:text-foreground">
          {stats.totalUsedByMe}
        </div>
        <div className="text-[10px] text-zinc-400">
          Trên {stats.usedTypesByMe} đầu thuốc đã ghi mã {doctorName}
        </div>
      </div>

      <div
        className={`p-4 rounded-3xl border backdrop-blur-md space-y-1 ${
          stats.lowWarehouseCount > 0
            ? "border-rose-300 bg-rose-50/70 dark:border-rose-900/60 dark:bg-rose-950/20"
            : "border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80"
        }`}
      >
        <div className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          <span>Sắp hết / Hết trong kho (&lt; 5)</span>
        </div>
        <div className="text-2xl font-extrabold font-heading text-rose-600 dark:text-rose-400">
          {stats.lowWarehouseCount}
        </div>
        <div className="text-[10px] text-rose-600/80 dark:text-rose-300/80">
          Chặn xuất âm nếu không đủ tồn • Cần báo QL nhập PO
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
          Bổ sung nhập kho / Ngừng kinh doanh
        </div>
      </div>
    </div>
  );
}

