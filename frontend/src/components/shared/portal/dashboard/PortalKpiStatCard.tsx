"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

export interface PortalKpiCardConfig {
  title: string;
  value: string | number;
  unit?: string;
  Icon: LucideIcon;
  iconBg: string;
  // Interactive pill variant (used in Manager Dashboard)
  href?: string;
  onClick?: () => void;
  badgeText?: string;
  accentBar?: string;
  badgeStyle?: string;
  dotColor?: string;
  hoverBorder?: string;
  // Trend delta variant (used in Admin Dashboard)
  trend?: {
    Icon: LucideIcon;
    value: string;
    label: string;
    colorClass: string;
  };
}

/** Shared KPI stat card supporting trend deltas, deep links, and modal triggers. */
export function PortalKpiStatCard({
  title,
  value,
  unit,
  Icon,
  iconBg,
  href,
  onClick,
  badgeText,
  accentBar,
  badgeStyle,
  dotColor,
  hoverBorder = "",
  trend,
}: PortalKpiCardConfig) {
  if (trend) {
    return (
      <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-500 dark:text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
          <span className={`p-2 rounded-xl ${iconBg}`}>
            <Icon className="w-4 h-4" />
          </span>
        </div>
        <div>
          <div className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground">
            {value}{" "}
            {unit && (
              <span className="text-sm font-semibold text-zinc-400 dark:text-muted-foreground">
                {unit}
              </span>
            )}
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-semibold mt-1 ${trend.colorClass}`}>
            <trend.Icon className="w-3.5 h-3.5" />
            <span>{trend.value}</span>
            <span className="text-zinc-400 dark:text-muted-foreground font-normal">
              {trend.label}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const cardInner = (
    <>
      {accentBar && (
        <div
          className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentBar} opacity-80 group-hover:opacity-100 transition-opacity`}
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <span className="block min-h-8 text-[11px] leading-4 font-bold text-zinc-500 dark:text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-heading font-extrabold tracking-tight text-zinc-900 dark:text-foreground">
              {value}
            </span>
            {unit && (
              <span className="text-xs font-semibold text-zinc-400 dark:text-muted-foreground">
                {unit}
              </span>
            )}
          </div>
        </div>
        <span
          className={`p-2.5 rounded-xl shrink-0 ${iconBg} group-hover:scale-105 transition-transform`}
        >
          <Icon className="w-4 h-4" />
        </span>
      </div>

      {badgeText && (
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-border/60">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border truncate ${badgeStyle ?? ""}`}
          >
            {dotColor && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />}
            <span className="truncate">{badgeText}</span>
          </span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
        </div>
      )}
    </>
  );

  const sharedClass = `group relative overflow-hidden p-5 rounded-2xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5 ${hoverBorder} transition-all duration-200 flex flex-col justify-between gap-4`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`text-left cursor-pointer ${sharedClass}`}>
        {cardInner}
      </button>
    );
  }

  return (
    <Link href={href ?? "#"} className={sharedClass}>
      {cardInner}
    </Link>
  );
}
