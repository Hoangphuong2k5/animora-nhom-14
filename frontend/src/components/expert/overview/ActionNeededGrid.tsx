"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { ROUTES } from "@/constants/config.constant";

interface ActionNeededGridProps {
  isVet?: boolean;
  pendingCount: number;
  rescheduleCount: number;
  completedNoRecordCount: number;
  pendingShiftCount: number;
  exhaustedRxCount: number;
  revisitDueCount: number;
}

export function ActionNeededGrid({
  isVet = true,
  pendingCount,
  rescheduleCount,
  completedNoRecordCount,
  pendingShiftCount,
  exhaustedRxCount,
  revisitDueCount,
}: ActionNeededGridProps) {
  const rxActionCount = exhaustedRxCount + revisitDueCount;
  const totalActions =
    pendingCount +
    rescheduleCount +
    completedNoRecordCount +
    pendingShiftCount +
    (isVet ? rxActionCount : 0);

  if (totalActions === 0) {
    return (
      <div className="p-4 sm:p-5 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Hệ thống vận hành thông suốt: Bạn không có hành động khẩn cấp nào cần xử lý ngay lúc này.</span>
        </div>
        <Link
          href={ROUTES.EXPERT_SCHEDULE}
          className="text-[#6B1F2E] dark:text-[#FF7F6B] font-bold hover:underline"
        >
          Xem lịch làm việc →
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-3xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400 text-sm">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>Hành Động Cần Xử Lý Ngay ({totalActions})</span>
      </div>

      {/* Grid of Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Card 1: Lịch hẹn mới */}
        <Link
          href={ROUTES.EXPERT_APPOINTMENTS}
          className="p-3.5 rounded-2xl bg-white dark:bg-card border border-amber-200/80 dark:border-amber-900/50 hover:border-amber-400 dark:hover:border-amber-500 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="min-w-0 pr-2">
            <div className="font-bold text-xs text-zinc-900 dark:text-foreground flex items-center gap-1.5 truncate">
              <span>Lịch hẹn ({pendingCount})</span>
              {pendingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
              )}
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-muted-foreground truncate mt-0.5">
              {pendingCount > 0
                ? "Lịch mới cần tiếp nhận ca"
                : "Không có ca mới chờ nhận"}
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform shrink-0" />
        </Link>

        {/* Card 2: Bệnh án cần ghi (Doctor) hoặc Tiến trình 4 bước (Staff) */}
        {isVet ? (
          <Link
            href={ROUTES.EXPERT_HEALTH_RECORDS}
            className="p-3.5 rounded-2xl bg-white dark:bg-card border border-amber-200/80 dark:border-amber-900/50 hover:border-amber-400 dark:hover:border-amber-500 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="min-w-0 pr-2">
              <div className="font-bold text-xs text-zinc-900 dark:text-foreground truncate">
                Bệnh án cần ghi ({completedNoRecordCount})
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-muted-foreground truncate mt-0.5">
                {completedNoRecordCount > 0
                  ? "Đã khám chưa cập nhật hồ sơ"
                  : "Hồ sơ bệnh án đã đầy đủ"}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>
        ) : (
          <Link
            href={ROUTES.EXPERT_APPOINTMENTS}
            className="p-3.5 rounded-2xl bg-white dark:bg-card border border-amber-200/80 dark:border-amber-900/50 hover:border-amber-400 dark:hover:border-amber-500 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="min-w-0 pr-2">
              <div className="font-bold text-xs text-zinc-900 dark:text-foreground truncate">
                Tiến trình dịch vụ ({completedNoRecordCount})
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-muted-foreground truncate mt-0.5">
                {completedNoRecordCount > 0
                  ? "Quy trình 4 bước chờ nghiệm thu"
                  : "Các ca đều đã bàn giao"}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>
        )}

        {/* Card 3: Yêu cầu đổi lịch */}
        <Link
          href={ROUTES.EXPERT_APPOINTMENTS}
          className="p-3.5 rounded-2xl bg-white dark:bg-card border border-amber-200/80 dark:border-amber-900/50 hover:border-amber-400 dark:hover:border-amber-500 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="min-w-0 pr-2">
            <div className="font-bold text-xs text-zinc-900 dark:text-foreground truncate">
              Đổi lịch hẹn ({rescheduleCount})
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-muted-foreground truncate mt-0.5">
              {rescheduleCount > 0
                ? "Khách xin dời khung giờ"
                : "Không có yêu cầu đổi lịch"}
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform shrink-0" />
        </Link>

        {/* Card 4: Tái khám & Kê đơn (Doctor) hoặc Yêu cầu ca trực (Staff) */}
        {isVet ? (
          <Link
            href={ROUTES.EXPERT_PRESCRIPTIONS}
            className="p-3.5 rounded-2xl bg-white dark:bg-card border border-amber-200/80 dark:border-amber-900/50 hover:border-amber-400 dark:hover:border-amber-500 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="min-w-0 pr-2">
              <div className="font-bold text-xs text-zinc-900 dark:text-foreground truncate">
                Tái khám & Kê đơn ({rxActionCount})
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-muted-foreground truncate mt-0.5">
                {rxActionCount > 0
                  ? "Đơn thuốc hết lượt / cần tái khám"
                  : "Không có ca cần tái khám"}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>
        ) : (
          <Link
            href={ROUTES.EXPERT_SCHEDULE}
            className="p-3.5 rounded-2xl bg-white dark:bg-card border border-amber-200/80 dark:border-amber-900/50 hover:border-amber-400 dark:hover:border-amber-500 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="min-w-0 pr-2">
              <div className="font-bold text-xs text-zinc-900 dark:text-foreground truncate">
                Yêu cầu ca trực ({pendingShiftCount})
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-muted-foreground truncate mt-0.5">
                {pendingShiftCount > 0
                  ? "Đơn nghỉ / ca làm chờ duyệt"
                  : "Lịch trực đã đồng bộ"}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>
        )}
      </div>
    </div>
  );
}
