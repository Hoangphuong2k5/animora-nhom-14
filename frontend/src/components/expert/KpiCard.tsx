"use client";

import React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  changePercent?: number;
  changePeriodLabel?: string;
  icon: React.ReactNode;
  variant?: "primary" | "coral" | "emerald" | "amber" | "indigo";
}

export function KpiCard({
  label,
  value,
  subValue,
  changePercent,
  changePeriodLabel = "so với kỳ trước",
  icon,
  variant = "primary",
}: KpiCardProps) {
  const isPositive = (changePercent ?? 0) >= 0;

  const colorConfig = {
    primary: {
      bgIcon: "bg-[#6B1F2E]/10 dark:bg-[#FF7F6B]/15 text-[#6B1F2E] dark:text-[#FF7F6B]",
      ring: "hover:border-[#6B1F2E]/30 dark:hover:border-[#FF7F6B]/40",
    },
    coral: {
      bgIcon: "bg-[#FF7F6B]/15 text-[#FF7F6B]",
      ring: "hover:border-[#FF7F6B]/40",
    },
    emerald: {
      bgIcon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      ring: "hover:border-emerald-500/30",
    },
    amber: {
      bgIcon: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      ring: "hover:border-amber-500/30",
    },
    indigo: {
      bgIcon: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
      ring: "hover:border-indigo-500/30",
    },
  }[variant];

  return (
    <div
      className={`rounded-2xl border border-zinc-200/80 dark:border-border bg-white/90 dark:bg-card/90 backdrop-blur-md p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${colorConfig.ring}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-zinc-500 dark:text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-zinc-900 dark:text-foreground">
              {value}
            </span>
            {subValue && (
              <span className="text-xs font-medium text-zinc-400 dark:text-muted-foreground">{subValue}</span>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-2xl shrink-0 ${colorConfig.bgIcon}`}>{icon}</div>
      </div>

      {changePercent !== undefined && (
        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-border/80 flex items-center gap-1.5 text-xs">
          <span
            className={`inline-flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded-md ${
              isPositive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {Math.abs(changePercent)}%
          </span>
          <span className="text-zinc-400 dark:text-muted-foreground text-[11px] truncate">{changePeriodLabel}</span>
        </div>
      )}
    </div>
  );
}

