"use client";

import React from "react";
import { PayrollMonth } from "@/types/expert.type";

interface EarningsSummaryCardsProps {
  currentPayroll: PayrollMonth;
  commissionRate: number;
  netEarnings: number;
}

export function EarningsSummaryCards({
  currentPayroll,
  commissionRate,
  netEarnings,
}: EarningsSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          Lương cơ bản
        </span>
        <div className="text-xl font-extrabold font-heading text-zinc-900 dark:text-foreground">
          {currentPayroll.baseSalary.toLocaleString("vi-VN")}đ
        </div>
        <span className="text-[10px] text-zinc-400">Cố định theo hợp đồng</span>
      </div>

      <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          Hoa hồng booking ({commissionRate * 100}%)
        </span>
        <div className="text-xl font-extrabold font-heading text-[#6B1F2E] dark:text-[#FF7F6B]">
          +{currentPayroll.commission.toLocaleString("vi-VN")}đ
        </div>
        <span className="text-[10px] text-zinc-400">
          Từ {currentPayroll.completedBookings} ca hoàn thành
        </span>
      </div>

      <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          Thưởng đánh giá 5★
        </span>
        <div className="text-xl font-extrabold font-heading text-emerald-600 dark:text-emerald-400">
          +{currentPayroll.ratingBonus.toLocaleString("vi-VN")}đ
        </div>
        <span className="text-[10px] text-zinc-400">
          Điểm TB: {currentPayroll.avgRating}★
        </span>
      </div>

      <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          Giảm trừ / Bảo hiểm
        </span>
        <div className="text-xl font-extrabold font-heading text-rose-600 dark:text-rose-400">
          -{currentPayroll.deductions.toLocaleString("vi-VN")}đ
        </div>
        <span className="text-[10px] text-zinc-400">Đóng BHXH / Phạt muộn</span>
      </div>

      <div className="p-4 rounded-2xl border-2 border-[#6B1F2E] dark:border-[#FF7F6B] bg-[#6B1F2E]/5 dark:bg-[#FF7F6B]/10 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B1F2E] dark:text-[#FF7F6B]">
            Tổng thực nhận
          </span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase ${
              currentPayroll.status === "paid"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {currentPayroll.status === "paid" ? "Đã chi" : "Tạm tính"}
          </span>
        </div>
        <div className="text-2xl font-extrabold font-heading text-[#6B1F2E] dark:text-[#F4B6C2]">
          {netEarnings.toLocaleString("vi-VN")}đ
        </div>
        <span className="text-[10px] text-zinc-500">
          {currentPayroll.status === "paid"
            ? `Chuyển khoản ngày ${currentPayroll.paidAt}`
            : "Dự kiến chi vào 05 tháng sau"}
        </span>
      </div>
    </div>
  );
}

