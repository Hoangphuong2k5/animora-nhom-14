"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface ExpertPageBannerProps {
  systemBadge?: string;
  title: string;
  roleBadge?: string;
  roleBadgeColor?: string;
  employmentBadge?: string;
  description: React.ReactNode;
  actions?: React.ReactNode;
  compact?: boolean;
}

export function ExpertPageBanner({
  systemBadge = "Animora Specialist Portal",
  title,
  roleBadge,
  roleBadgeColor = "bg-white/20 text-white",
  employmentBadge,
  description,
  actions,
  compact = false,
}: ExpertPageBannerProps) {
  return (
    <div
      className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#6B1F2E] via-[#7B2435] to-[#8C2B3E] text-white shadow-xl shadow-[#6B1F2E]/15 relative overflow-hidden ${
        compact ? "p-5 sm:p-6" : "p-6 sm:p-7"
      }`}
    >
      {/* Ambient Decorative Accents */}
      <div className="absolute -right-8 -bottom-10 w-64 h-64 rounded-full bg-white/[0.07] pointer-events-none blur-2xl" />
      <div className="absolute right-40 -top-12 w-48 h-48 rounded-full bg-[#FF7F6B]/15 pointer-events-none blur-3xl" />

      {/* Left Info Column */}
      <div className="relative z-10 space-y-1.5 flex-1 min-w-0">
        {systemBadge && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-[#FFF4E8]">
            <Sparkles className="w-3.5 h-3.5 text-[#FF7F6B]" />
            <span>{systemBadge}</span>
          </div>
        )}

        <div className="flex items-center gap-2.5 flex-wrap">
          <h1
            className={`font-heading font-extrabold tracking-tight !text-white ${
              compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
            }`}
          >
            {title}
          </h1>

          {roleBadge && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-sm ${roleBadgeColor}`}
            >
              {roleBadge}
            </span>
          )}

          {employmentBadge && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-teal-400/25 text-teal-100 border border-teal-300/30">
              {employmentBadge}
            </span>
          )}
        </div>

        <div className="text-xs sm:text-sm !text-white/90 max-w-2xl leading-relaxed">
          {description}
        </div>
      </div>

      {/* Right Actions Slot */}
      {actions && (
        <div className="relative z-10 flex flex-wrap items-center justify-start lg:justify-end gap-2.5 shrink-0 lg:ml-auto">
          {actions}
        </div>
      )}
    </div>
  );
}

