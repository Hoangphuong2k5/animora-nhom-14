"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, Plus, Sparkles, UserCheck } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAdminSchedule } from "@/hooks/admin/useAdminSchedule";
import { DAYS_OF_WEEK, type ShiftSlot } from "@/components/admin/schedule/scheduleData";
import { AssignShiftDialog } from "@/components/admin/schedule/AssignShiftDialog";
import { ScheduleWeeklyMatrix } from "@/components/admin/schedule/ScheduleWeeklyMatrix";
import { StaffShiftApprovalList } from "@/components/admin/schedule/StaffShiftApprovalList";
import { ScheduleMonthCalendar } from "./ScheduleMonthCalendar";

export interface ScheduleWorkspaceProps {
  mode?: "manager" | "readonly";
}

/** Shared Staff Schedule Matrix, Month Calendar & Shift Requests workspace. */
export function ScheduleWorkspace({ mode = "manager" }: ScheduleWorkspaceProps) {
  const isReadOnly = mode === "readonly";
  const schedule = useAdminSchedule();
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDayNum, setSelectedDayNum] = useState<number | null>(null);
  const [isDayDrawerOpen, setIsDayDrawerOpen] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [selectedShift, setSelectedShift] = useState<{
    shift: ShiftSlot;
    dayLabel?: string;
    dayDate?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setNow(new Date());
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const { weekDays, weekLabel } = useMemo(() => {
    if (!now) {
      return { weekDays: DAYS_OF_WEEK, weekLabel: "Tuần này" };
    }
    const dow = now.getDay();
    const mondayOffset = dow === 0 ? -6 : 1 - dow;
    const baseMonday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + mondayOffset + weekOffset * 7
    );
    const dayLabels = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
    const pad = (n: number) => String(n).padStart(2, "0");

    const days = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(baseMonday);
      d.setDate(baseMonday.getDate() + idx);
      return {
        label: dayLabels[idx],
        date: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`,
        fullDate: d,
      };
    });

    const start = days[0].fullDate;
    const end = days[6].fullDate;
    const startShort = `${pad(start.getDate())}/${pad(start.getMonth() + 1)}`;
    const endShort = `${pad(end.getDate())}/${pad(end.getMonth() + 1)}`;

    let label =
      start.getFullYear() === end.getFullYear()
        ? `${startShort} – ${endShort}/${end.getFullYear()}`
        : `${startShort}/${start.getFullYear()} – ${endShort}/${end.getFullYear()}`;
    if (weekOffset === 0) label = `Tuần này (${startShort} – ${endShort})`;
    else if (weekOffset === 1) label = `Tuần sau (${startShort} – ${endShort})`;
    else if (weekOffset === -1) label = `Tuần trước (${startShort} – ${endShort})`;

    return { weekDays: days, weekLabel: label };
  }, [now, weekOffset]);

  const monthMeta = useMemo(() => {
    if (!now) return { month: 1, year: 2026 };
    const mDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    return {
      month: mDate.getMonth() + 1,
      year: mDate.getFullYear(),
    };
  }, [now, monthOffset]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-[#6B1F2E] dark:text-[#FF7F6B] shrink-0" />
            <span>
              {isReadOnly
                ? "Tra Cứu Lịch Làm Việc & Ca Trực"
                : "Lịch Làm Việc & Xếp Ca Chuyên Viên"}
            </span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            {isReadOnly
              ? "Tra cứu ma trận ca làm chuyên viên và trạng thái yêu cầu nghỉ phép / đổi ca"
              : "Ma trận điều phối ca làm theo màu sắc chuyên viên, phát hiện xung đột lịch và phân bổ ca trống"}
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
          {schedule.viewMode === "week" ? (
            <div className="flex items-center gap-1.5">
              <div className="inline-flex h-9 items-center rounded-xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card px-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setWeekOffset((p) => p - 1)}
                  title="Tuần trước"
                  aria-label="Tuần trước"
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-muted cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-zinc-600 dark:text-foreground/80" />
                </button>
                <span className="px-2.5 text-xs font-bold text-zinc-800 dark:text-foreground/90 whitespace-nowrap">
                  {weekLabel}
                </span>
                <button
                  type="button"
                  onClick={() => setWeekOffset((p) => p + 1)}
                  title="Tuần sau"
                  aria-label="Tuần sau"
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-muted cursor-pointer transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-zinc-600 dark:text-foreground/80" />
                </button>
              </div>
              {weekOffset !== 0 && (
                <button
                  type="button"
                  onClick={() => setWeekOffset(0)}
                  className="inline-flex h-9 items-center px-3 rounded-xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card text-xs font-bold text-zinc-700 dark:text-foreground/85 hover:bg-zinc-100 dark:hover:bg-muted transition-colors cursor-pointer whitespace-nowrap"
                >
                  Tuần này
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="inline-flex h-9 items-center rounded-xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card px-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMonthOffset((m) => m - 1);
                    setSelectedDayNum(null);
                  }}
                  title="Tháng trước"
                  aria-label="Tháng trước"
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-muted cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-zinc-600 dark:text-foreground/80" />
                </button>
                <span className="px-2.5 text-xs font-bold text-zinc-800 dark:text-foreground/90 whitespace-nowrap">
                  Tháng {monthMeta.month} / {monthMeta.year}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMonthOffset((m) => m + 1);
                    setSelectedDayNum(null);
                  }}
                  title="Tháng sau"
                  aria-label="Tháng sau"
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-muted cursor-pointer transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-zinc-600 dark:text-foreground/80" />
                </button>
              </div>
              {monthOffset !== 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setMonthOffset(0);
                    setSelectedDayNum(null);
                  }}
                  className="inline-flex h-9 items-center px-3 rounded-xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card text-xs font-bold text-zinc-700 dark:text-foreground/85 hover:bg-zinc-100 dark:hover:bg-muted transition-colors cursor-pointer whitespace-nowrap"
                >
                  Tháng này
                </button>
              )}
            </div>
          )}

          <Tabs
            value={schedule.viewMode}
            onValueChange={(val) => {
              if (val) schedule.setViewMode(val as "week" | "month");
            }}
          >
            <TabsList className="h-auto! flex-wrap gap-1.5 bg-[#FBF6F7] dark:bg-muted/80 p-1 rounded-2xl">
              <TabsTrigger
                value="week"
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
              >
                Theo Tuần
              </TabsTrigger>
              <TabsTrigger
                value="month"
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
              >
                Theo Tháng
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {!isReadOnly && (
            <button
              type="button"
              onClick={() => {
                schedule.setConflictWarning(null);
                schedule.setIsAddModalOpen(true);
              }}
              className="px-4 py-2 rounded-2xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Phân ca mới</span>
            </button>
          )}
        </div>
      </div>

      {schedule.viewMode === "week" ? (
        <ScheduleWeeklyMatrix
          shifts={schedule.shifts}
          filterStaff={schedule.filterStaff}
          onSelectFilterStaff={schedule.setFilterStaff}
          daysOfWeek={weekDays}
          onSelectShift={(shift, dayInfo) =>
            setSelectedShift({
              shift,
              dayLabel: dayInfo?.label ?? DAYS_OF_WEEK[shift.dayIndex]?.label,
              dayDate: dayInfo?.date,
            })
          }
        />
      ) : (
        <ScheduleMonthCalendar
          readOnly={isReadOnly}
          now={now}
          shifts={schedule.shifts}
          filterStaff={schedule.filterStaff}
          monthOffset={monthOffset}
          selectedDayNum={selectedDayNum}
          onSelectDay={setSelectedDayNum}
          isDayDrawerOpen={isDayDrawerOpen}
          onOpenDayDrawerChange={setIsDayDrawerOpen}
          onAssignShiftForDay={
            isReadOnly
              ? undefined
              : (dayIdx) => {
                  schedule.setTargetDay(dayIdx);
                  schedule.setConflictWarning(null);
                  schedule.setIsAddModalOpen(true);
                }
          }
        />
      )}

      <StaffShiftApprovalList
        staffRequests={schedule.staffRequests}
        requestRoleFilter={schedule.requestRoleFilter}
        onChangeRoleFilter={schedule.setRequestRoleFilter}
        reviewNotes={isReadOnly ? undefined : schedule.reviewNotes}
        onChangeReviewNote={
          isReadOnly
            ? undefined
            : (reqId, note) =>
                schedule.setReviewNotes((prev) => ({ ...prev, [reqId]: note }))
        }
        onReviewRequest={isReadOnly ? undefined : schedule.handleReviewStaffRequest}
      />

      {!isReadOnly && (
        <AssignShiftDialog
          open={schedule.isAddModalOpen}
          onOpenChange={schedule.setIsAddModalOpen}
          conflictWarning={schedule.conflictWarning}
          onClearConflict={() => schedule.setConflictWarning(null)}
          targetStaff={schedule.targetStaff}
          onChangeTargetStaff={schedule.setTargetStaff}
          targetDay={schedule.targetDay}
          onChangeTargetDay={schedule.setTargetDay}
          targetSlot={schedule.targetSlot}
          onChangeTargetSlot={schedule.setTargetSlot}
          targetType={schedule.targetType}
          onChangeTargetType={schedule.setTargetType}
          onSubmit={schedule.handleCreateShift}
        />
      )}

      <Sheet
        open={Boolean(selectedShift)}
        onOpenChange={(open) => {
          if (!open) setSelectedShift(null);
        }}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-popover text-popover-foreground border-l border-border p-6 overflow-y-auto"
        >
          {selectedShift && (
            <>
              <SheetHeader className="pb-4 border-b border-border/70 pr-6">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      selectedShift.shift.type === "booked"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : selectedShift.shift.type === "free"
                        ? "bg-sky-500/15 text-sky-600 dark:text-sky-400"
                        : "bg-zinc-500/15 text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {selectedShift.shift.type === "booked"
                      ? "Ca có khách"
                      : selectedShift.shift.type === "free"
                      ? "Ca trống sẵn sàng"
                      : "Nghỉ phép"}
                  </span>
                  {selectedShift.shift.bookingCode && (
                    <span className="font-mono text-xs font-bold text-[#6B1F2E] dark:text-[#FF7F6B]">
                      {selectedShift.shift.bookingCode}
                    </span>
                  )}
                </div>
                <SheetTitle className="text-lg font-heading font-bold mt-2">
                  Chi tiết ca làm việc
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Thông tin chuyên viên, khung giờ và lịch hẹn thuộc ca trực.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-5 space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/70 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5" />
                      Chuyên viên
                    </span>
                    <span className="font-bold text-foreground flex items-center gap-1.5 text-right">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: selectedShift.shift.staffColor }}
                      />
                      {selectedShift.shift.staffName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Ngày trực
                    </span>
                    <span className="font-semibold text-foreground">
                      {selectedShift.dayLabel || DAYS_OF_WEEK[selectedShift.shift.dayIndex]?.label}
                      {selectedShift.dayDate ? ` (${selectedShift.dayDate})` : ""}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Khung giờ
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {selectedShift.shift.timeSlot}
                    </span>
                  </div>
                </div>

                {selectedShift.shift.type === "booked" ? (
                  <div className="p-4 rounded-2xl bg-[#6B1F2E]/5 dark:bg-[#FF7F6B]/10 border border-[#6B1F2E]/20 dark:border-[#FF7F6B]/25 space-y-2.5">
                    <div className="font-bold text-[#6B1F2E] dark:text-[#FF7F6B] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Thông tin ca hẹn</span>
                    </div>
                    {selectedShift.shift.petName && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Thú cưng</span>
                        <span className="font-bold text-foreground">
                          {selectedShift.shift.petName}
                        </span>
                      </div>
                    )}
                    {selectedShift.shift.service && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Dịch vụ</span>
                        <span className="font-semibold text-foreground text-right">
                          {selectedShift.shift.service}
                        </span>
                      </div>
                    )}
                  </div>
                ) : selectedShift.shift.type === "free" ? (
                  <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/25 text-sky-700 dark:text-sky-300 font-medium">
                    Chuyên viên đang sẵn sàng nhận lịch hẹn mới trong khung giờ này.
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-muted/60 border border-border text-muted-foreground font-medium">
                    Chuyên viên đã đăng ký nghỉ phép trong khung giờ này.
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
