"use client";

import React from "react";
import { BarChart, BarDataPoint, DonutChart, DonutSlice } from "@/components/expert/Charts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OverviewChartsSectionProps {
  period: "week" | "month";
  onPeriodChange: (p: "week" | "month") => void;
  weekData: BarDataPoint[];
  monthData: BarDataPoint[];
  slices: DonutSlice[];
}

export function OverviewChartsSection({
  period,
  onPeriodChange,
  weekData,
  monthData,
  slices,
}: OverviewChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Biểu đồ cột: Số ca theo ngày */}
      <div className="lg:col-span-2 rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md p-5 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="font-heading font-extrabold text-sm text-zinc-900 dark:text-foreground">
            Số Ca Phục Vụ Theo Ngày
          </h3>
          <Tabs
            value={period}
            onValueChange={(val) => {
              if (val === "week" || val === "month") onPeriodChange(val);
            }}
          >
            <TabsList className="h-auto! flex-wrap items-center gap-1 p-1 rounded-full bg-[#f1f3f6] dark:bg-muted/90 border border-zinc-200/80 dark:border-border shadow-xs">
              <TabsTrigger
                value="week"
                className="h-auto! px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer text-zinc-500 hover:text-zinc-900 dark:text-muted-foreground dark:hover:text-foreground data-active:bg-white data-active:text-[#6B1F2E] dark:data-active:bg-primary dark:data-active:text-primary-foreground data-active:shadow-xs transition-all"
              >
                Tuần này
              </TabsTrigger>
              <TabsTrigger
                value="month"
                className="h-auto! px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer text-zinc-500 hover:text-zinc-900 dark:text-muted-foreground dark:hover:text-foreground data-active:bg-white data-active:text-[#6B1F2E] dark:data-active:bg-primary dark:data-active:text-primary-foreground data-active:shadow-xs transition-all"
              >
                Tháng này
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <BarChart
          data={period === "week" ? weekData : monthData}
          height={200}
          barColor="var(--primary)"
        />
      </div>

      {/* Biểu đồ tròn: Tỷ lệ theo dịch vụ */}
      <div className="rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md p-5 space-y-3 overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-extrabold text-sm text-zinc-900 dark:text-foreground">
            Tỷ Lệ Dịch Vụ Thực Hiện
          </h3>
          <span className="text-[11px] font-medium text-zinc-400">
            {slices.length} nhóm dịch vụ
          </span>
        </div>
        <DonutChart slices={slices} size={140} unit="ca" />
      </div>
    </div>
  );
}

