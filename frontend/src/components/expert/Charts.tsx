"use client";

import React, { useState } from "react";

// ==========================================
// 1. BIỂU ĐỒ CỘT (BAR CHART) - SỐ CA THEO NGÀY
// ==========================================
export interface BarDataPoint {
  label: string;
  subLabel?: string;
  value: number;
}

interface BarChartProps {
  data: BarDataPoint[];
  title?: string;
  unit?: string;
  height?: number;
  barColor?: string;
}

export function BarChart({
  data,
  title,
  unit = "ca",
  height = 220,
  barColor = "var(--primary)",
}: BarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const chartHeight = height - 60;

  return (
    <div className="w-full space-y-3">
      {title && (
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-muted-foreground">
          {title}
        </h4>
      )}
      <div className="relative w-full" style={{ height: `${height}px` }}>
        {/* Background Grid Lines */}
        <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="border-b border-dashed border-zinc-400 dark:border-border" />
          <div className="border-b border-dashed border-zinc-400 dark:border-border" />
          <div className="border-b border-dashed border-zinc-400 dark:border-border" />
        </div>

        {/* Bars Container */}
        <div className="absolute inset-x-0 bottom-8 top-2 flex items-end justify-between gap-1 sm:gap-2 px-2">
          {data.map((item, idx) => {
            const barH = (item.value / maxValue) * chartHeight;
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="relative flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-9 z-20 px-2 py-1 rounded-md bg-zinc-900 dark:bg-popover text-white dark:text-popover-foreground border border-transparent dark:border-border text-[10px] font-bold whitespace-nowrap shadow-md pointer-events-none">
                    {item.value} {unit}
                  </div>
                )}

                {/* Bar */}
                <div
                  style={{
                    height: `${Math.max(4, barH)}px`,
                    backgroundColor: isHovered ? "#FF7F6B" : barColor,
                  }}
                  className="w-full max-w-[36px] rounded-t-lg transition-all duration-200 group-hover:scale-y-[1.02]"
                />
              </div>
            );
          })}
        </div>

        {/* X-Axis Labels */}
        <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 px-2 text-[10px] text-zinc-400 dark:text-muted-foreground font-semibold">
          {data.map((item, idx) => (
            <div key={idx} className="flex-1 text-center truncate">
              <div>{item.label}</div>
              {item.subLabel && <div className="text-[9px] text-zinc-400/80 dark:text-muted-foreground/80">{item.subLabel}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. BIỂU ĐỒ TRÒN (DONUT CHART) - TỶ LỆ DỊCH VỤ
// ==========================================
export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  slices: DonutSlice[];
  title?: string;
  centerText?: { value: string | number; label: string };
  size?: number;
  layout?: "vertical" | "horizontal";
  unit?: string;
}

export function DonutChart({
  slices,
  title,
  centerText,
  size = 140,
  layout = "vertical",
  unit = "ca",
}: DonutChartProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const rawTotal = slices.reduce((sum, s) => sum + s.value, 0);
  const total = rawTotal || 1;
  const radius = size / 2;
  const strokeWidth = 22;
  const chartRadius = radius - strokeWidth / 2 - 4;
  const circumference = 2 * Math.PI * chartRadius;

  const computedSlices = slices.reduce<
    Array<DonutSlice & { percent: number; offset: number }>
  >((acc, slice) => {
    const prevEnd =
      acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].percent : 0;
    return [
      ...acc,
      {
        ...slice,
        percent: slice.value / total,
        offset: prevEnd,
      },
    ];
  }, []);

  return (
    <div className="space-y-3 w-full">
      {title && (
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-muted-foreground">
          {title}
        </h4>
      )}
      <div
        className={
          layout === "horizontal"
            ? "flex flex-col sm:flex-row items-center justify-center gap-6"
            : "flex flex-col items-center justify-center gap-3"
        }
      >
        {/* SVG Donut */}
        <div
          className="relative shrink-0 flex items-center justify-center my-1"
          style={{ width: size, height: size }}
        >
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90"
          >
            {computedSlices.map((slice, idx) => {
              const strokeDasharray = `${slice.percent * circumference} ${circumference}`;
              const strokeDashoffset = -slice.offset * circumference;

              const isHovered = activeIdx === idx;
              const isOtherHovered = activeIdx !== null && !isHovered;

              return (
                <circle
                  key={idx}
                  cx={radius}
                  cy={radius}
                  r={chartRadius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  opacity={isOtherHovered ? 0.45 : 1}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onMouseLeave={() => setActiveIdx(null)}
                  className="transition-all duration-200 cursor-pointer"
                />
              );
            })}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            {centerText ? (
              <>
                <span className="text-xl font-heading font-extrabold text-[#6B1F2E] dark:text-primary">
                  {centerText.value}
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-muted-foreground font-semibold tracking-wide">
                  {centerText.label}
                </span>
              </>
            ) : (
              <>
                <span className="text-xl font-heading font-extrabold text-[#6B1F2E] dark:text-primary">
                  {rawTotal}
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-muted-foreground font-semibold tracking-wide">
                  Tổng {unit}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="w-full space-y-1.5 pt-2.5 border-t border-zinc-200 dark:border-border text-xs">
          {slices.map((slice, idx) => {
            const percent = Math.round((slice.value / total) * 100);
            const isHovered = activeIdx === idx;
            return (
              <div
                key={idx}
                onMouseEnter={() => setActiveIdx(idx)}
                onMouseLeave={() => setActiveIdx(null)}
                className={`flex items-center justify-between gap-3 px-2 py-1.5 rounded-xl transition-all cursor-pointer ${
                  isHovered
                    ? "bg-zinc-100 dark:bg-muted shadow-xs"
                    : "hover:bg-zinc-50 dark:hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform"
                    style={{
                      backgroundColor: slice.color,
                      transform: isHovered ? "scale(1.2)" : "scale(1)",
                    }}
                  />
                  <span className="truncate text-zinc-700 dark:text-foreground/80 font-medium text-xs">
                    {slice.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-bold text-zinc-900 dark:text-foreground text-xs">
                    {slice.value} {unit}
                  </span>
                  <span className="text-[11px] font-semibold text-zinc-400 dark:text-muted-foreground/80 min-w-[38px] text-right">
                    ({percent}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. BIỂU ĐỒ ĐƯỜNG (LINE CHART) - CÂN NẶNG / XU HƯỚNG
// ==========================================
export interface LinePoint {
  label: string;
  value: number;
}

interface LineChartProps {
  points: LinePoint[];
  title?: string;
  unit?: string;
  height?: number;
  strokeColor?: string;
}

export function LineChart({
  points,
  title,
  unit = "kg",
  height = 180,
  strokeColor = "#6B1F2E",
}: LineChartProps) {
  if (points.length === 0) return null;

  const width = 400;
  const paddingX = 30;
  const paddingY = 25;

  const values = points.map((p) => p.value);
  const minVal = Math.min(...values) * 0.95;
  const maxVal = Math.max(...values) * 1.05;
  const range = maxVal - minVal || 1;

  const getX = (idx: number) =>
    paddingX + (idx / Math.max(1, points.length - 1)) * (width - 2 * paddingX);
  const getY = (val: number) =>
    height - paddingY - ((val - minVal) / range) * (height - 2 * paddingY);

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(p.value)}`)
    .join(" ");

  const areaD = `${pathD} L ${getX(points.length - 1)} ${height - paddingY} L ${getX(
    0
  )} ${height - paddingY} Z`;

  return (
    <div className="w-full space-y-2">
      {title && (
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-muted-foreground">
          {title}
        </h4>
      )}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
        >
          {/* Subtle Grid */}
          <line
            x1={paddingX}
            y1={getY(minVal)}
            x2={width - paddingX}
            y2={getY(minVal)}
            stroke="currentColor"
            className="text-zinc-200 dark:text-border"
            strokeDasharray="2 2"
          />
          <line
            x1={paddingX}
            y1={getY(maxVal)}
            x2={width - paddingX}
            y2={getY(maxVal)}
            stroke="currentColor"
            className="text-zinc-200 dark:text-border"
            strokeDasharray="2 2"
          />

          {/* Area under curve */}
          <path d={areaD} fill={strokeColor} fillOpacity="0.08" />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots */}
          {points.map((p, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle
                cx={getX(idx)}
                cy={getY(p.value)}
                r="4"
                fill={strokeColor}
                className="transition-transform group-hover:scale-150"
              />
              <text
                x={getX(idx)}
                y={getY(p.value) - 10}
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                className="fill-zinc-700 dark:fill-muted-foreground pointer-events-none"
              >
                {p.value} {unit}
              </text>
              <text
                x={getX(idx)}
                y={height - 8}
                textAnchor="middle"
                fontSize="9"
                className="fill-zinc-400 dark:fill-muted-foreground/80 pointer-events-none"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

