"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { formatDateDdMmYyyy } from "@/utils/dateFormat";
import type { ExpertAppointment } from "@/types/expert.type";

interface ImpactedAppointmentsBannerProps {
  staffName: string;
  date: string;
  appointments: ExpertAppointment[];
  onDismiss: () => void;
}

export function ImpactedAppointmentsBanner({
  staffName,
  date,
  appointments,
  onDismiss,
}: ImpactedAppointmentsBannerProps) {
  return (
    <div className="p-3.5 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/30 text-xs space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Đã khóa lịch nghỉ đột xuất của {staffName} ngày{" "}
            {formatDateDdMmYyyy(date)} — {appointments.length} lịch hẹn bị ảnh hưởng cần điều phối
          </span>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-[11px] font-bold text-amber-700 hover:underline cursor-pointer"
        >
          Đóng
        </button>
      </div>
      {appointments.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {appointments.map((a) => (
              <span
                key={a.id}
                className="px-2 py-0.5 rounded-lg bg-white dark:bg-card border border-amber-200 dark:border-amber-800 font-mono text-[11px] font-bold text-zinc-800 dark:text-zinc-200"
              >
                {a.code} ({a.startAt.slice(11, 16)})
              </span>
            ))}
          </div>
          <Link
            href="/manager/bookings"
            className="px-3 py-1.5 rounded-xl bg-[#6B1F2E] text-white font-bold text-[11px] hover:bg-[#521723] transition-colors"
          >
            Mở Lịch hẹn để đổi nhân sự →
          </Link>
        </div>
      ) : (
        <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
          Ngày này chưa có lịch khách đặt, không cần đổi nhân sự.
        </p>
      )}
    </div>
  );
}

