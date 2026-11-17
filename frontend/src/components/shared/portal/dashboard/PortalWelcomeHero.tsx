"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface PortalWelcomeHeroProps {
  badgeText?: string;
  title: string;
  subtitle: React.ReactNode;
  actions?: React.ReactNode;
}

/** Shared gradient welcome hero banner for Admin & Manager dashboards. */
export function PortalWelcomeHero({
  badgeText = "Animora Management Center",
  title,
  subtitle,
  actions,
}: PortalWelcomeHeroProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#6B1F2E] via-[#7B2435] to-[#8C2B3E] dark:from-[#261722] dark:via-[#211A26] dark:to-[#1B1F2B] dark:border dark:border-white/10 text-white shadow-xl shadow-[#6B1F2E]/15 dark:shadow-none relative overflow-hidden">
      <div className="absolute -right-8 -bottom-10 w-64 h-64 rounded-full bg-white/[0.07] pointer-events-none blur-2xl" />
      <div className="absolute right-40 -top-12 w-48 h-48 rounded-full bg-[#FF7F6B]/15 pointer-events-none blur-3xl" />

      <div className="relative z-10 space-y-1.5 flex-1 min-w-0">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-[#FFF4E8]">
          <Sparkles className="w-3.5 h-3.5 text-[#FF7F6B]" />
          {badgeText}
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight !text-white">
          {title}
        </h1>
        <p className="text-xs sm:text-sm !text-white/90 max-w-xl">{subtitle}</p>
      </div>

      {actions && (
        <div className="relative z-10 flex flex-wrap items-center justify-start lg:justify-end gap-2.5 shrink-0 lg:ml-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
