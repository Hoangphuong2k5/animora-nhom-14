"use client";

import React from "react";
import { ArrowUpRight, PieChart } from "lucide-react";
import type { PeriodFinanceConfig } from "./financeTypesAndData";

interface FinanceSummaryAndChartProps {
  activeConfig: PeriodFinanceConfig;
}

/** Shared financial KPI cards + Services vs Shop bar comparison chart. */
export function FinanceSummaryAndChart({
  activeConfig,
}: FinanceSummaryAndChartProps) {
  const { serviceRevenue, shopRevenue, cogsExpense, operatingExpense } = activeConfig;
  const totalRevenue = serviceRevenue + shopRevenue;
  const serviceShare = ((serviceRevenue / totalRevenue) * 100).toFixed(1);
  const shopShare = ((shopRevenue / totalRevenue) * 100).toFixed(1);
  const grossProfit = totalRevenue - cogsExpense - operatingExpense;
  const profitMargin = ((grossProfit / totalRevenue) * 100).toFixed(1);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
            Doanh thu Dịch vụ
          </span>
          <div className="text-xl font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
            {serviceRevenue.toLocaleString("vi-VN")}₫
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            {activeConfig.serviceGrowth} (Chiếm {serviceShare}%)
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
            Doanh thu Cửa hàng
          </span>
          <div className="text-xl font-extrabold text-zinc-900 dark:text-foreground">
            {shopRevenue.toLocaleString("vi-VN")}₫
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            {activeConfig.shopGrowth} (Chiếm {shopShare}%)
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
            Chi phí Nhập hàng (COGS)
          </span>
          <div className="text-xl font-extrabold text-rose-600">
            -{cogsExpense.toLocaleString("vi-VN")}₫
          </div>
          <span className="text-[11px] text-zinc-400 font-medium">{activeConfig.cogsNote}</span>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
            Chi phí Vận hành &amp; Vật tư
          </span>
          <div className="text-xl font-extrabold text-amber-600">
            -{operatingExpense.toLocaleString("vi-VN")}₫
          </div>
          <span className="text-[11px] text-zinc-400 font-medium">
            {activeConfig.operatingNote}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-950/60 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
            Lợi Nhuận Gộp
          </span>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {grossProfit.toLocaleString("vi-VN")}₫
          </div>
          <span className="text-[11px] font-bold text-emerald-600">
            Biên lợi nhuận: {profitMargin}%
          </span>
        </div>
      </div>

      <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-zinc-900 dark:text-foreground flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[#FF7F6B]" />
                So Sánh Tăng Trưởng Doanh Thu: Dịch Vụ vs Cửa Hàng
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#6B1F2E]/10 text-[#6B1F2E] dark:bg-[#FF7F6B]/15 dark:text-[#FF7F6B]">
                {activeConfig.label}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{activeConfig.chartSubtitle}</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#6B1F2E]" /> Dịch vụ Spa &amp; Khám
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FF7F6B]" /> Cửa hàng bán lẻ
            </span>
          </div>
        </div>

        <div
          className={`grid gap-3 pt-4 text-center text-xs ${
            activeConfig.bars.length === 3
              ? "grid-cols-3 max-w-2xl mx-auto"
              : activeConfig.bars.length === 4
                ? "grid-cols-2 sm:grid-cols-4 max-w-3xl mx-auto"
                : "grid-cols-3 sm:grid-cols-6"
          }`}
        >
          {activeConfig.bars.map((bar, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div className="w-full max-w-[72px] h-36 flex items-end justify-center gap-1.5 bg-zinc-50 dark:bg-muted/60 p-1.5 rounded-2xl">
                <div
                  className="w-1/2 bg-[#6B1F2E] rounded-xl transition-all duration-300"
                  style={{ height: `${Math.max(8, (bar.svc / activeConfig.maxBar) * 100)}%` }}
                  title={`Dịch vụ: ${bar.svc}M`}
                />
                <div
                  className="w-1/2 bg-[#FF7F6B] rounded-xl transition-all duration-300"
                  style={{ height: `${Math.max(8, (bar.shop / activeConfig.maxBar) * 100)}%` }}
                  title={`Cửa hàng: ${bar.shop}M`}
                />
              </div>
              <span className="font-bold text-zinc-700 dark:text-foreground/80">{bar.label}</span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {(bar.svc + bar.shop).toFixed(1).replace(/\.0$/, "")}M
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
