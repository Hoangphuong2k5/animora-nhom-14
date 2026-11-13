"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useExpertT } from "./expertI18n";

export type StatusBadgeVariant =
  | "pending"
  | "upcoming"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "paid"
  | "unpaid"
  | "refunded"
  | "partial_fee"
  | "approved"
  | "rejected"
  | "mild"
  | "severe"
  | "active"
  | "exhausted"
  | "needs_revisit";

interface StatusBadgeProps {
  status: StatusBadgeVariant | string;
  label?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, label, size = "md" }: StatusBadgeProps) {
  const { t } = useExpertT();

  const getStyle = (s: string) => {
    switch (s) {
      case "completed":
      case "approved":
      case "paid":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "pending":
      case "mild":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "cancelled":
      case "rejected":
      case "severe":
      case "unpaid":
      case "partial_fee":
      case "exhausted":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "in_progress":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 animate-pulse";
      case "upcoming":
      case "active":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "needs_revisit":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
      default:
        return "bg-zinc-100 dark:bg-muted text-zinc-600 dark:text-foreground/80 border-zinc-200 dark:border-border";
    }
  };

  const displayLabel =
    label ||
    (t.status as Record<string, string>)[status] ||
    status;

  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <Badge
      variant="secondary"
      className={cn(
        "h-auto inline-flex items-center gap-1.5 font-bold rounded-full border",
        sizeClasses,
        getStyle(status)
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      <span>{displayLabel}</span>
    </Badge>
  );
}

