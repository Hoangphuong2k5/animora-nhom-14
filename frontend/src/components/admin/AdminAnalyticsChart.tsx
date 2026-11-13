"use client";

import React, { useState } from "react";
import { TrendingUp, BarChart3, PieChart, Filter } from "lucide-react";

type PeriodMode = "day" | "week" | "month";

interface PeriodDataPoint {
  label: string;
  subLabel: string;
  revenue: number; // in thousand VND
  bookings: number;
}

const DAY_DATA: PeriodDataPoint[] = [
  { label: "T2", subLabel: "28/10", revenue: 5200, bookings: 8 },
  { label: "T3", subLabel: "29/10", revenue: 7800, bookings: 12 },
  { label: "T4", subLabel: "30/10", revenue: 6400, bookings: 10 },
  { label: "T5", subLabel: "31/10", revenue: 9600, bookings: 15 },
  { label: "T6", subLabel: "01/11", revenue: 13200, bookings: 19 },
  { label: "T7", subLabel: "02/11", revenue: 18500, bookings: 26 },
  { label: "CN", subLabel: "03/11", revenue: 15900, bookings: 22 },
];

const WEEK_DATA: PeriodDataPoint[] = [
  { label: "Tuần 1", subLabel: "01-07", revenue: 42500, bookings: 68 },
  { label: "Tuần 2", subLabel: "08-14", revenue: 56000, bookings: 84 },
  { label: "Tuần 3", subLabel: "15-21", revenue: 61200, bookings: 92 },
  { label: "Tuần 4", subLabel: "22-28", revenue: 76600, bookings: 114 },
];

const MONTH_DATA: PeriodDataPoint[] = [
  { label: "T6", subLabel: "Tháng 6", revenue: 180000, bookings: 280 },
  { label: "T7", subLabel: "Tháng 7", revenue: 210000, bookings: 320 },
  { label: "T8", subLabel: "Tháng 8", revenue: 245000, bookings: 375 },
  { label: "T9", subLabel: "Tháng 9", revenue: 280000, bookings: 410 },
  { label: "T10", subLabel: "Tháng 10", revenue: 310000, bookings: 465 },
  { label: "T11", subLabel: "Tháng 11", revenue: 345000, bookings: 512 },
];

interface ServiceShare {
  name: string;
  percent: number;
  revenue: number;
  color: string;
  count: number;
}

const SERVICE_SHARES: ServiceShare[] = [
  { name: "Spa & Grooming", percent: 42, revenue: 144900000, color: "var(--primary)", count: 215 },
  { name: "Khám thú y & Cấp cứu", percent: 28, revenue: 96600000, color: "#FF7F6B", count: 143 },
  { name: "Tiêm phòng & Vaccine", percent: 18, revenue: 62100000, color: "#10B981", count: 92 },
  { name: "Khách sạn thú cưng", percent: 12, revenue: 41400000, color: "#F59E0B", count: 62 },
];

export function AdminAnalyticsChart() {
  const [period, setPeriod] = useState<PeriodMode>("day");
  const [hoveredPoint, setHoveredPoint] = useState<PeriodDataPoint | null>(null);

  const currentDataset =
    period === "day" ? DAY_DATA : period === "week" ? WEEK_DATA : MONTH_DATA;

  const maxVal = Math.max(...currentDataset.map((d) => d.revenue)) * 1.15;
  const totalRev = currentDataset.reduce((acc, d) => acc + d.revenue, 0) * 1000;
  const totalBks = currentDataset.reduce((acc, d) => acc + d.bookings, 0);

  // SVG dimensions
  const svgWidth = 560;
  const svgHeight = 200;
  const padX = 40;
  const padY = 25;
  const chartW = svgWidth - padX * 2;
  const chartH = svgHeight - padY * 2;

  const points = currentDataset.map((d, i) => {
    const x = padX + (i / (currentDataset.length - 1)) * chartW;
    const y = svgHeight - padY - (d.revenue / maxVal) * chartH;
    return { ...d, x, y };
  });

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cpX1 = prev.x + (p.x - prev.x) / 2;
    const cpX2 = cpX1;
    return `${acc} C ${cpX1} ${prev.y}, ${cpX2} ${p.y}, ${p.x} ${p.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - padY} L ${points[0].x} ${svgHeight - padY} Z`;

  // Donut SVG parameters
  const donutSize = 180;
  const radius = 64;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Biểu đồ đường Doanh thu theo Ngày / Tuần / Tháng (Chiếm 2 cột) */}
      <div className="lg:col-span-2 p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm flex flex-col justify-between space-y-5">
        {/* Header & Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#FF7F6B]" />
              <h2 className="text-base font-bold text-zinc-900 dark:text-foreground">
                Xu Hướng Doanh Thu
              </h2>
            </div>
            <p className="text-xs text-zinc-400 dark:text-muted-foreground mt-0.5">
              Theo dõi biến động dòng tiền theo chu kỳ được chọn
            </p>
          </div>

          {/* Period selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-muted self-start sm:self-auto">
            {(
              [
                { id: "day", label: "Theo Ngày" },
                { id: "week", label: "Theo Tuần" },
                { id: "month", label: "Theo Tháng" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPeriod(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  period === tab.id
                    ? "bg-white dark:bg-card text-[#6B1F2E] dark:text-primary shadow-sm"
                    : "text-zinc-500 dark:text-muted-foreground hover:text-zinc-800 dark:hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Metric Ribbon */}
        <div className="flex items-center gap-6 p-3.5 rounded-2xl bg-[#6B1F2E]/5 dark:bg-primary/10 border border-[#6B1F2E]/10 dark:border-primary/20">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 dark:text-muted-foreground uppercase tracking-wider block">
              Tổng doanh thu kỳ
            </span>
            <span className="text-xl font-heading font-extrabold text-[#6B1F2E] dark:text-primary">
              {totalRev.toLocaleString("vi-VN")}₫
            </span>
          </div>
          <div className="h-8 w-[1px] bg-zinc-200 dark:bg-border" />
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 dark:text-muted-foreground uppercase tracking-wider block">
              Lượt phục vụ
            </span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{totalBks} ca hẹn (+18.4%)</span>
            </span>
          </div>
        </div>

        {/* Line SVG Chart */}
        <div className="relative w-full overflow-hidden">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-48 overflow-visible">
            <defs>
              <linearGradient id="adminChartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF7F6B" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#FF7F6B" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid horizontal guidelines */}
            {[0.25, 0.5, 0.75, 1].map((pct) => {
              const y = svgHeight - padY - pct * chartH;
              return (
                <line
                  key={pct}
                  x1={padX}
                  y1={y}
                  x2={svgWidth - padX}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  className="text-zinc-200 dark:text-border"
                  strokeWidth="1"
                />
              );
            })}

            {/* Shaded Area */}
            <path d={areaD} fill="url(#adminChartGrad)" />

            {/* Stroke line */}
            <path
              d={pathD}
              fill="none"
              stroke="#6B1F2E"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="dark:stroke-[#FF7F6B]"
            />

            {/* Data points */}
            {points.map((p, idx) => (
              <g
                key={idx}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  className="fill-white dark:fill-card stroke-[#6B1F2E] dark:stroke-primary group-hover:scale-125 transition-transform"
                  strokeWidth="2.5"
                />
                {/* X Axis Label */}
                <text
                  x={p.x}
                  y={svgHeight - 6}
                  textAnchor="middle"
                  className="text-[11px] font-semibold fill-zinc-400 dark:fill-muted-foreground group-hover:fill-zinc-800 dark:group-hover:fill-foreground transition-colors"
                >
                  {p.label}
                </text>
              </g>
            ))}
          </svg>

          {/* Floating Tooltip */}
          {hoveredPoint && (
            <div className="absolute top-2 right-4 px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-popover text-white dark:text-popover-foreground border border-transparent dark:border-border text-xs shadow-lg animate-in fade-in zoom-in-95 pointer-events-none">
              <span className="font-bold">{hoveredPoint.label} ({hoveredPoint.subLabel}): </span>
              <span className="text-[#FF7F6B] dark:text-primary font-extrabold">
                {(hoveredPoint.revenue * 1000).toLocaleString("vi-VN")}₫
              </span>
              <span className="text-zinc-400 dark:text-muted-foreground text-[11px] ml-1.5">({hoveredPoint.bookings} ca)</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Biểu đồ tròn Tỷ lệ theo loại Dịch vụ (Chiếm 1 cột) */}
      <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#FF7F6B]" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-foreground">
              Cơ Cấu Dịch Vụ
            </h2>
          </div>
          <p className="text-xs text-zinc-400 dark:text-muted-foreground mt-0.5">
            Tỷ lệ doanh thu theo 4 nhóm dịch vụ cốt lõi
          </p>
        </div>

        {/* Donut Chart Visual */}
        <div className="flex flex-col items-center justify-center my-auto py-2">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 180 180">
              {SERVICE_SHARES.map((s, i) => {
                const strokeDasharray = `${(s.percent / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -accumulatedOffset;
                accumulatedOffset += (s.percent / 100) * circumference;

                return (
                  <circle
                    key={i}
                    cx="90"
                    cy="90"
                    r={radius}
                    fill="transparent"
                    stroke={s.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500 hover:opacity-85"
                  />
                );
              })}
            </svg>

            {/* Donut Center Info */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-muted-foreground uppercase tracking-widest">
                Dịch vụ
              </span>
              <span className="text-2xl font-extrabold font-heading text-[#6B1F2E] dark:text-primary">
                100%
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-muted-foreground font-semibold">512 lượt</span>
            </div>
          </div>
        </div>

        {/* Legend List */}
        <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-border">
          {SERVICE_SHARES.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-zinc-700 dark:text-foreground">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 dark:text-muted-foreground text-[11px] font-mono">
                  {(item.revenue / 1000000).toFixed(1)}Tr
                </span>
                <span className="font-bold text-zinc-900 dark:text-foreground w-8 text-right">
                  {item.percent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
