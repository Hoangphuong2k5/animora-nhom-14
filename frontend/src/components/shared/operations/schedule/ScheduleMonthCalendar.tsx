"use client";

import React from "react";
import { CalendarCheck, Clock, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DAYS_OF_WEEK, type ShiftSlot } from "@/components/admin/schedule/scheduleData";

interface ScheduleMonthCalendarProps {
  readOnly?: boolean;
  now?: Date | null;
  shifts: ShiftSlot[];
  filterStaff: string;
  monthOffset: number;
  selectedDayNum: number | null;
  onSelectDay: (dayNum: number) => void;
  isDayDrawerOpen: boolean;
  onOpenDayDrawerChange: (open: boolean) => void;
  onAssignShiftForDay?: (dayIndex: number) => void;
}

/** Shared Monthly Calendar grid & Day Detail Drawer for ScheduleWorkspace. */
export function ScheduleMonthCalendar({
  readOnly = false,
  now = null,
  shifts,
  filterStaff,
  monthOffset,
  selectedDayNum,
  onSelectDay,
  isDayDrawerOpen,
  onOpenDayDrawerChange,
  onAssignShiftForDay,
}: ScheduleMonthCalendarProps) {
  const refDate = now ?? new Date(2026, 0, 1);
  const baseDate = new Date(refDate.getFullYear(), refDate.getMonth() + monthOffset, 1);
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOffset = (baseDate.getDay() + 6) % 7;
  const totalCells = Math.ceil((firstDayOffset + daysInMonth) / 7) * 7;

  const activeDay = Math.min(selectedDayNum ?? refDate.getDate(), daysInMonth);
  const activeDayIndex = (new Date(year, month, activeDay).getDay() + 6) % 7;
  const activeDayShifts = shifts.filter(
    (s) =>
      s.dayIndex === activeDayIndex &&
      (filterStaff === "all" || s.staffId === filterStaff)
  );

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-4">
        <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold text-zinc-500 uppercase tracking-wider pb-2 border-b border-zinc-200/80 dark:border-border">
          {DAYS_OF_WEEK.map((d) => (
            <div key={d.label}>{d.label}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: totalCells }).map((_, idx) => {
            const dayNum = idx - firstDayOffset + 1;
            if (dayNum < 1 || dayNum > daysInMonth) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[104px] rounded-2xl bg-zinc-50/40 dark:bg-muted/20 border border-dashed border-zinc-100 dark:border-border/40"
                />
              );
            }

            const weekdayIdx = idx % 7;
            const dayShifts = shifts.filter(
              (s) =>
                s.dayIndex === weekdayIdx &&
                (filterStaff === "all" || s.staffId === filterStaff)
            );
            const isToday =
              now !== null &&
              year === now.getFullYear() &&
              month === now.getMonth() &&
              dayNum === now.getDate();
            const isPast =
              now !== null &&
              new Date(year, month, dayNum).getTime() <
                new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            const isSelected =
              selectedDayNum !== null ? dayNum === selectedDayNum : isToday;

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => {
                  onSelectDay(dayNum);
                  onOpenDayDrawerChange(true);
                }}
                className={`min-h-[104px] p-2 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#6B1F2E] bg-[#6B1F2E]/5 dark:border-[#FF7F6B] dark:bg-[#FF7F6B]/10 ring-1 ring-[#6B1F2E]/20"
                    : isPast
                      ? "border-zinc-100/70 bg-zinc-50/30 dark:border-border/40 dark:bg-card/20 opacity-45 hover:opacity-75"
                      : "border-zinc-100 bg-zinc-50/50 dark:border-border/60 dark:bg-card/40 hover:border-zinc-200"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs font-extrabold ${
                      isSelected
                        ? "text-[#6B1F2E] dark:text-[#FF7F6B]"
                        : "text-zinc-800 dark:text-foreground"
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayShifts.length > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-muted text-zinc-600 dark:text-muted-foreground">
                      {dayShifts.length} ca
                    </span>
                  )}
                </div>

                <div className="space-y-1 mt-1.5 w-full">
                  {dayShifts.slice(0, 2).map((sh) => (
                    <div
                      key={sh.id}
                      className={`px-1.5 py-0.5 rounded-lg text-[10px] font-semibold truncate flex items-center gap-1 ${
                        sh.type === "booked"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : sh.type === "free"
                            ? "bg-sky-500/10 text-sky-700 dark:text-sky-300"
                            : "bg-zinc-200/70 text-zinc-500 dark:bg-muted"
                      }`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: sh.staffColor }}
                      />
                      <span className="truncate">
                        {sh.timeSlot.split(" - ")[0]} {sh.staffName.split(" ").slice(-1)[0]}
                      </span>
                    </div>
                  ))}
                  {dayShifts.length > 2 && (
                    <div className="text-[10px] font-semibold text-zinc-400 pl-1">
                      +{dayShifts.length - 2} ca khác
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <Sheet open={isDayDrawerOpen} onOpenChange={onOpenDayDrawerChange}>
        <SheetContent
          side="right"
          showCloseButton={true}
          className="w-full data-[side=right]:w-full data-[side=right]:sm:max-w-lg p-0 gap-0 flex flex-col h-full bg-popover text-popover-foreground border-l border-border shadow-2xl"
        >
          <SheetHeader className="px-6 py-4 border-b border-border shrink-0 pr-12">
            <div className="text-[11px] font-mono font-bold text-[#6B1F2E] dark:text-[#FF7F6B] uppercase tracking-wider">
              {DAYS_OF_WEEK[activeDayIndex].label}
            </div>
            <SheetTitle className="text-base font-bold text-zinc-900 dark:text-foreground flex items-center gap-2 mt-0.5">
              <CalendarCheck className="w-4 h-4 text-[#6B1F2E] dark:text-[#FF7F6B]" />
              <span>
                Chi tiết ca trực ngày {String(activeDay).padStart(2, "0")}-
                {String(month + 1).padStart(2, "0")}-{year}
              </span>
            </SheetTitle>
            <SheetDescription className="text-xs text-zinc-500 mt-0.5">
              Danh sách ca trực, lịch hẹn khách và phân ca trong ngày
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 min-h-0 overflow-hidden">
            <div className="p-6 space-y-3 text-xs">
              {activeDayShifts.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-zinc-200 dark:border-border text-center text-zinc-400 italic">
                  Chưa có ca trực nào được phân bổ trong ngày này.
                </div>
              ) : (
                activeDayShifts.map((sh) => (
                  <div
                    key={sh.id}
                    className="p-3.5 rounded-2xl border border-zinc-200/80 dark:border-border bg-zinc-50/60 dark:bg-muted/30 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold text-zinc-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        {sh.timeSlot}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          sh.type === "booked"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : sh.type === "free"
                              ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                              : "bg-zinc-200 dark:bg-muted text-zinc-500"
                        }`}
                      >
                        {sh.type === "booked"
                          ? "Ca có khách"
                          : sh.type === "free"
                            ? "Sẵn sàng nhận ca"
                            : "Nghỉ phép"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-foreground">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: sh.staffColor }}
                      />
                      <span>{sh.staffName}</span>
                    </div>
                    {sh.type === "booked" && (
                      <div className="text-[11px] text-zinc-500 pt-1 border-t border-zinc-200/60 dark:border-border/60">
                        <span className="font-semibold text-[#6B1F2E] dark:text-[#FF7F6B]">
                          {sh.petName}
                        </span>{" "}
                        • {sh.service}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {!readOnly && onAssignShiftForDay && (
            <div className="px-6 py-4 border-t border-border bg-zinc-50/60 dark:bg-muted/20 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onOpenDayDrawerChange(false);
                  onAssignShiftForDay(activeDayIndex);
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Phân ca ngày này</span>
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
