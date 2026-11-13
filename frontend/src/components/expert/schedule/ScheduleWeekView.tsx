"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  ExpertAppointment,
  ExpertPet,
  ExpertServiceDef,
  ExpertShift,
  ShiftRequest,
} from "@/types/expert.type";

interface ScheduleWeekViewProps {
  weekDays: Array<{
    date: Date;
    iso: string;
    dayName: string;
    dayNum: number;
    isToday: boolean;
  }>;
  appointments: ExpertAppointment[];
  shifts: ExpertShift[];
  shiftRequests: ShiftRequest[];
  pets: ExpertPet[];
  services: ExpertServiceDef[];
  conflictsByDate: Record<string, boolean>;
  onSelectAppt: (appt: ExpertAppointment) => void;
}

export function ScheduleWeekView({
  weekDays,
  appointments,
  shifts,
  shiftRequests,
  pets,
  services,
  conflictsByDate,
  onSelectAppt,
}: ScheduleWeekViewProps) {
  return (
    <div className="rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md overflow-hidden shadow-xs">
      <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-zinc-200/80 dark:divide-border min-h-[500px]">
        {weekDays.map((day) => {
          const hasConflict = conflictsByDate[day.iso];

          // Appointments for this day
          const dayAppts = appointments.filter((a) =>
            a.startAt.startsWith(day.iso)
          );

          // Shift assigned for this day
          const assignedShifts = shifts.filter((s) => s.date === day.iso);

          // Shift request for this day
          const dayRequests = shiftRequests.filter((r) => r.date === day.iso);

          return (
            <div
              key={day.iso}
              className={`p-3 space-y-3 flex flex-col transition-colors ${
                day.isToday
                  ? "bg-[#6B1F2E]/5 dark:bg-[#FF7F6B]/5"
                  : "hover:bg-zinc-50/50 dark:hover:bg-muted/50"
              } ${hasConflict ? "border-2 border-rose-500 rounded-xl" : ""}`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-border">
                <span className="text-xs font-extrabold text-zinc-500 dark:text-muted-foreground">
                  {day.dayName}
                </span>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold ${
                    day.isToday
                      ? "bg-[#6B1F2E] text-white shadow-xs"
                      : "text-zinc-800 dark:text-foreground/90"
                  }`}
                >
                  {day.dayNum}
                </div>
              </div>

              {/* Conflict Alert Warning */}
              {hasConflict && (
                <div className="p-2 rounded-xl bg-rose-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Cảnh báo: Trùng giờ khám!</span>
                </div>
              )}

              {/* Shift status badge */}
              <div className="space-y-1">
                {assignedShifts.length > 0 ? (
                  assignedShifts.map((s) => (
                    <div
                      key={s.id}
                      className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-muted text-[10px] font-bold text-zinc-700 dark:text-foreground/80 flex items-center justify-between"
                    >
                      <span>
                        {s.shift === "morning"
                          ? "Ca sáng (08:00 - 12:00)"
                          : s.shift === "afternoon"
                          ? "Ca chiều (13:30 - 17:30)"
                          : "Ca tối (18:00 - 21:00)"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-[10px] text-zinc-400 italic">Không có ca cố định</div>
                )}

                {/* Requests on this day */}
                {dayRequests.map((r) => (
                  <div
                    key={r.id}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold border border-amber-300/40 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400"
                  >
                    {r.kind === "leave" ? "Xin nghỉ" : "Đăng ký ca"} ({r.status})
                  </div>
                ))}
              </div>

              {/* Booked Appointments on this day */}
              <div className="space-y-2 flex-1 pt-1">
                {dayAppts.map((appt) => {
                  const pet = pets.find((p) => p.id === appt.petId);
                  const service = services.find((s) => s.id === appt.serviceId);

                  return (
                    <div
                      key={appt.id}
                      onClick={() => onSelectAppt(appt)}
                      className={`p-2.5 rounded-xl border text-xs space-y-1 cursor-pointer transition-all hover:scale-[1.02] shadow-2xs ${
                        appt.status === "in_progress"
                          ? "border-purple-300 bg-purple-50 dark:bg-purple-950/40 dark:border-purple-800"
                          : appt.status === "completed"
                          ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900"
                          : appt.status === "cancelled"
                          ? "border-zinc-200 bg-zinc-100 dark:bg-muted opacity-60 line-through"
                          : "border-[#6B1F2E]/20 bg-white dark:bg-card hover:border-[#6B1F2E]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B] text-[11px]">
                          {appt.startAt.split("T")[1]?.slice(0, 5)}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-black/5 dark:bg-white/10">
                          {appt.code}
                        </span>
                      </div>
                      <div className="font-bold text-zinc-900 dark:text-foreground truncate text-[11px]">
                        {pet?.name} ({pet?.breed})
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate">
                        {service?.name.vi}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
