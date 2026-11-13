"use client";

import React from "react";
import Link from "next/link";
import { Clock, Sparkles } from "lucide-react";
import {
  ExpertAppointment,
  ExpertPet,
  ExpertPetOwner,
  ExpertServiceDef,
} from "@/types/expert.type";
import { StatusBadge } from "@/components/expert/StatusBadge";
import { ROUTES } from "@/constants/config.constant";

interface AppointmentTimelineProps {
  appointments: ExpertAppointment[];
  pets: ExpertPet[];
  owners: ExpertPetOwner[];
  services: ExpertServiceDef[];
  onStart: (id: string) => void;
  onViewDetail: (appt: ExpertAppointment) => void;
}

export function AppointmentTimeline({
  appointments,
  pets,
  owners,
  services,
  onStart,
  onViewDetail,
}: AppointmentTimelineProps) {
  return (
    <div className="rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#FF7F6B]" />
          <h2 className="font-heading font-extrabold text-sm sm:text-base text-zinc-900 dark:text-foreground">
            Dòng Thời Gian Ca Phục Vụ Hôm Nay ({appointments.length})
          </h2>
        </div>
        <Link
          href={ROUTES.EXPERT_APPOINTMENTS}
          className="text-xs font-bold text-[#6B1F2E] dark:text-[#FF7F6B] hover:underline"
        >
          Tất cả lịch hẹn →
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="p-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-border rounded-2xl">
          Hôm nay bạn không có ca khám hay lịch hẹn nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {appointments.map((appt) => {
            const pet = pets.find((p) => p.id === appt.petId);
            const owner = owners.find((o) => o.id === appt.ownerId);
            const service = services.find((s) => s.id === appt.serviceId);
            const isCurrent = appt.status === "in_progress";

            return (
              <div
                key={appt.id}
                className={`rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between space-y-3 border ${
                  isCurrent
                    ? "ring-2 ring-[#6B1F2E] dark:ring-[#FF7F6B] bg-[#6B1F2E]/5 dark:bg-[#FF7F6B]/10 border-transparent shadow-md"
                    : "bg-white/60 dark:bg-muted/60 border-zinc-200/80 dark:border-border hover:border-zinc-300"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-[#6B1F2E] dark:text-[#FF7F6B]">
                      {appt.startAt.split("T")[1]?.slice(0, 5)}
                    </span>
                    <StatusBadge status={appt.status} size="sm" />
                  </div>

                  {/* Pet & Owner Info */}
                  <div className="flex items-center gap-3">
                    <img
                      src={pet?.photo}
                      alt={pet?.name}
                      className="w-11 h-11 rounded-xl object-cover shrink-0 border border-zinc-200 dark:border-border"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-zinc-900 dark:text-foreground truncate">
                        {pet?.name} ({pet?.breed})
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate">
                        Chủ: {owner?.fullName} • {owner?.phone}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-zinc-600 dark:text-muted-foreground font-medium truncate pt-1 border-t border-zinc-100 dark:border-border">
                    {service?.name.vi}
                  </div>
                </div>

                {/* Actions for this slot */}
                <div className="flex items-center gap-2 pt-2">
                  {appt.status === "upcoming" ? (
                    <button
                      type="button"
                      onClick={() => onStart(appt.id)}
                      className="flex-1 py-1.5 rounded-xl text-xs font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#FF7F6B]" />
                      <span>Bắt đầu ca</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onViewDetail(appt)}
                      className="flex-1 py-1.5 rounded-xl text-xs font-bold border border-zinc-200 dark:border-border bg-white dark:bg-muted hover:bg-zinc-50 dark:hover:bg-muted text-zinc-800 dark:text-foreground/90 transition-colors cursor-pointer"
                    >
                      Xem chi tiết
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

