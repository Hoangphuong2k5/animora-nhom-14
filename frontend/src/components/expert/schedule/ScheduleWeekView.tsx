"use client";

import React from "react";
import { AlertTriangle, CalendarOff, CheckCircle2 } from "lucide-react";
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
  isVet?: boolean;
}

function getShiftLabel(shift: ExpertShift["shift"]) {
  if (shift === "morning") return "Ca sáng (08:00 - 12:00)";
  return "Ca chiều (13:00 - 17:00)";
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
  isVet = true,
}: ScheduleWeekViewProps) {
  return (
    <div className="rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md overflow-hidden shadow-xs">
      <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-zinc-200/80 dark:divide-border min-h-[500px]">
        {weekDays.map((day) => {
          const hasConflict = conflictsByDate[day.iso];
          const dayAppts = appointments.filter((a) =>
            a.startAt.startsWith(day.iso)
          );
          const assignedShifts = shifts.filter((s) => s.date === day.iso);
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
                  <span>{isVet ? "Cảnh báo: Trùng giờ khám!" : "Cảnh báo: Trùng lịch dịch vụ!"}</span>
                </div>
              )}

              {/* Shift status badge */}
              <div className="space-y-1">
                {assignedShifts.length > 0 ? (
                  assignedShifts.map((s) => {
                    if (s.shiftType === "rotational_off") {
                      return (
                        <div
                          key={s.id}
                          className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"
                        >
                          <CalendarOff className="w-3 h-3 shrink-0 text-slate-500" />
                          <span>Nghỉ luân phiên (QL xếp)</span>
                        </div>
                      );
                    }
                    if (s.shiftType === "extra_shift") {
                      return (
                        <div
                          key={s.id}
                          className="px-2 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-[10px] font-bold text-teal-700 dark:text-teal-300"
                        >
                          Ca làm thêm: {getShiftLabel(s.shift)}
                        </div>
                      );
                    }
                    const isOffByApprovedLeave =
                      (s.shiftType === "fixed" || s.shiftType === "extra_shift") &&
                      dayRequests.some(
                        (r) =>
                          r.kind === "leave" &&
                          r.status === "approved" &&
                          (!r.shift || r.shift === s.shift)
                      );

                    if (isOffByApprovedLeave) {
                      return (
                        <div
                          key={s.id}
                          className="px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 text-[10px] font-bold text-rose-700 dark:text-rose-300 flex items-center justify-between gap-1.5"
                        >
                          <span className="flex items-center gap-1 min-w-0">
                            <CalendarOff className="w-3 h-3 shrink-0" />
                            <span className="line-through opacity-75 truncate">{getShiftLabel(s.shift)}</span>
                          </span>
                          <span className="text-[9px] font-extrabold uppercase shrink-0">Nghỉ cả ngày</span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={s.id}
                        className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-muted text-[10px] font-bold text-zinc-700 dark:text-foreground/80 flex items-center justify-between"
                      >
                        <span>{getShiftLabel(s.shift)}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-[10px] text-zinc-400 italic">
                    Chưa có ca cố định
                  </div>
                )}

                {/* Requests on this day */}
                {dayRequests.map((r) => {
                  const hasWarning =
                    (r.policyWarnings && r.policyWarnings.length > 0) ||
                    r.exceedsMonthlyLeaveLimit;

                  const statusStyle =
                    r.status === "approved"
                      ? "border-emerald-300/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                      : r.status === "rejected"
                      ? "border-rose-300/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300"
                      : hasWarning
                      ? "border-rose-300/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300"
                      : "border-amber-300/40 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400";

                  const shiftText =
                    r.kind === "leave" && !r.shift
                      ? "Cả ngày"
                      : r.shift === "morning"
                      ? "Ca sáng"
                      : r.shift === "afternoon"
                      ? "Ca chiều"
                      : "";

                  return (
                    <div
                      key={r.id}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${statusStyle}`}
                    >
                      <div className="flex items-center gap-1">
                        {r.status === "approved" && (
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                        )}
                        <span>
                          {r.kind === "leave"
                            ? "Xin nghỉ"
                            : r.kind === "shift_swap"
                            ? "Xin đổi ca"
                            : "Ca làm thêm"}
                          {shiftText ? ` • ${shiftText}` : ""}{" "}
                          ({r.status === "pending" ? "Chờ QL" : r.status === "approved" ? "Đã duyệt" : "Từ chối"})
                        </span>
                      </div>
                      {hasWarning && (
                        <div className="text-[9px] font-extrabold mt-0.5 flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                          <span>Có cờ cảnh báo</span>
                        </div>
                      )}
                    </div>
                  );
                })}
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
