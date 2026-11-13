"use client";

import React from "react";
import { BarChart, BarDataPoint } from "@/components/expert/Charts";

interface EarningsTrendChartProps {
  data: BarDataPoint[];
}

export function EarningsTrendChart({ data }: EarningsTrendChartProps) {
  return (
    <div className="rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-extrabold text-sm text-zinc-900 dark:text-foreground">
          Xu Hướng Thu Nhập Các Tháng Gần Nhất (Triệu VNĐ)
        </h3>
        <span className="text-xs text-zinc-400 dark:text-muted-foreground">5 tháng gần nhất</span>
      </div>
      <BarChart
        data={data}
        unit="triệu"
        height={200}
        barColor="var(--primary)"
      />
    </div>
  );
}

