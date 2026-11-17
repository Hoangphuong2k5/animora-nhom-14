"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Award, Star } from "lucide-react";
import {
  TOP_SERVICES_DATA,
  TOP_STAFFS_DATA,
  type TopService,
  type TopStaff,
} from "./dashboardData";

interface PortalLeaderboardsSectionProps {
  staffLinkHref: string;
  topServices?: TopService[];
  topStaffs?: TopStaff[];
}

/** Shared Top Services and Top Staff leaderboard cards for Admin & Manager dashboards. */
export function PortalLeaderboardsSection({
  staffLinkHref,
  topServices = TOP_SERVICES_DATA,
  topStaffs = TOP_STAFFS_DATA,
}: PortalLeaderboardsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-900 dark:text-foreground flex items-center gap-2">
            <Award className="w-4 h-4 text-[#FF7F6B]" />
            Top Dịch Vụ Tháng Này
          </h3>
          <span className="text-[11px] font-semibold text-zinc-400 dark:text-muted-foreground">
            Lượt / Doanh thu
          </span>
        </div>

        <div className="space-y-3.5">
          {topServices.map((svc, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3 text-xs py-1">
              <div className="min-w-0">
                <div className="font-bold text-zinc-800 dark:text-foreground/90 truncate">
                  {svc.name}
                </div>
                <div className="text-[11px] text-zinc-400 dark:text-muted-foreground">
                  {svc.category}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                  {svc.bookingsCount} lượt
                </div>
                <div className="text-[11px] text-zinc-400 dark:text-muted-foreground">
                  {(svc.revenue / 1000000).toFixed(1)}M
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-900 dark:text-foreground flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            Top Chuyên Viên Xuất Sắc
          </h3>
          <Link
            href={staffLinkHref}
            className="text-xs font-bold text-[#6B1F2E] dark:text-[#FF7F6B] hover:underline flex items-center gap-1"
          >
            <span>Nhân sự</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3.5">
          {topStaffs.map((staff, idx) => (
            <div key={idx} className="flex items-center gap-3 py-1">
              <img
                src={staff.avatar}
                alt={staff.name}
                className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-border shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-zinc-900 dark:text-foreground truncate">
                  {staff.name}
                </div>
                <div className="text-[11px] text-zinc-400 dark:text-muted-foreground truncate">
                  {staff.role}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-xs font-extrabold text-amber-600 dark:text-amber-400 justify-end">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>{staff.rating}</span>
                </div>
                <div className="text-[11px] text-zinc-400 dark:text-muted-foreground">
                  {staff.casesCount} ca
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
