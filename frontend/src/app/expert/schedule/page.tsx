"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarOff,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
} from "lucide-react";
import { useExpert } from "@/components/expert/ExpertProvider";
import { AppointmentDrawer } from "@/components/expert/AppointmentDrawer";
import { ScheduleWeekView } from "@/components/expert/schedule/ScheduleWeekView";
import { ShiftRequestModal } from "@/components/expert/schedule/ShiftRequestModal";
import { ShiftRequestHistoryCard } from "@/components/expert/schedule/ShiftRequestHistoryCard";
import { useScheduleWeek } from "@/hooks/expert/useScheduleWeek";
import {
  ExpertAppointment,
  LeaveReasonType,
  ShiftCode,
  ShiftRequestKind,
} from "@/types/expert.type";
import {
  evaluateMonthlyLeaveQuota,
  summarizePartTimeExtraShifts,
} from "@/utils/expertPolicy";

export default function ExpertSchedulePage() {
  const {
    profile,
    isVet,
    isPartTime,
    store,
    allPets,
    allServices,
    submitShiftRequest,
    cancelShiftRequest,
  } = useExpert();

  const {
    currentWeekOffset,
    setCurrentWeekOffset,
    weekDays,
    conflictsByDate,
    todayIso,
    goToCurrentWeek,
  } = useScheduleWeek(store.appointments);

  const weekLabel = useMemo(() => {
    if (weekDays.length < 7) return "Tuần này";
    const start = weekDays[0].date;
    const end = weekDays[6].date;
    const pad = (n: number) => String(n).padStart(2, "0");
    const startShort = `${pad(start.getDate())}/${pad(start.getMonth() + 1)}`;
    const endShort = `${pad(end.getDate())}/${pad(end.getMonth() + 1)}`;

    if (currentWeekOffset === 0) return `Tuần này (${startShort} – ${endShort})`;
    if (currentWeekOffset === 1) return `Tuần sau (${startShort} – ${endShort})`;
    if (currentWeekOffset === -1) return `Tuần trước (${startShort} – ${endShort})`;

    return start.getFullYear() === end.getFullYear()
      ? `${startShort} – ${endShort}/${end.getFullYear()}`
      : `${startShort}/${start.getFullYear()} – ${endShort}/${end.getFullYear()}`;
  }, [weekDays, currentWeekOffset]);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<ExpertAppointment | null>(null);

  const leaveQuota = useMemo(
    () =>
      evaluateMonthlyLeaveQuota(
        store.shiftRequests,
        store.shifts,
        profile.id,
        todayIso
      ),
    [store.shiftRequests, store.shifts, profile.id, todayIso]
  );

  const extraShiftSummary = useMemo(
    () =>
      summarizePartTimeExtraShifts(
        store.shiftRequests,
        store.shifts,
        profile.id,
        todayIso
      ),
    [store.shiftRequests, store.shifts, profile.id, todayIso]
  );

  const handleSendRequest = (data: {
    kind: ShiftRequestKind;
    leaveType?: LeaveReasonType;
    date: string;
    shift?: ShiftCode;
    targetSwapDate?: string;
    targetSwapShift?: ShiftCode;
    extraShiftHours?: number;
    reason: string;
    policyWarnings?: string[];
    exceedsMonthlyLeaveLimit?: boolean;
  }) => {
    submitShiftRequest(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="min-w-0 max-w-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-extrabold font-heading text-zinc-900 dark:text-foreground">
              Lịch Làm Việc &amp; Nghỉ Phép
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                isPartTime
                  ? "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300"
                  : "bg-[#6B1F2E]/10 text-[#6B1F2E] dark:bg-[#FF7F6B]/20 dark:text-[#FF7F6B]"
              }`}
            >
              {isPartTime ? "Nhân sự Part-time" : "Nhân sự Full-time"}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            {isPartTime
              ? "Xem lịch ca hành chính (08:00–17:00); đăng ký ca làm thêm, xin nghỉ ca hoặc đổi ca gửi Quản lý duyệt."
              : "Xem lịch làm việc hành chính (08:00–17:00) & ngày nghỉ luân phiên do Quản lý phân công; gửi đơn xin nghỉ phép (nghỉ cả ngày)."}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          {currentWeekOffset !== 0 && (
            <button
              type="button"
              onClick={goToCurrentWeek}
              className="inline-flex h-9 items-center px-3 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card text-xs font-bold text-zinc-700 dark:text-foreground/85 hover:bg-zinc-50 dark:hover:bg-muted transition-colors cursor-pointer whitespace-nowrap"
            >
              Tuần này
            </button>
          )}

          {/* Week offset navigation */}
          <div className="inline-flex h-9 items-center rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card px-1">
            <button
              type="button"
              onClick={() => setCurrentWeekOffset((p) => p - 1)}
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
              onClick={() => setCurrentWeekOffset((p) => p + 1)}
              title="Tuần sau"
              aria-label="Tuần sau"
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-muted cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-zinc-600 dark:text-foreground/80" />
            </button>
          </div>

          {currentWeekOffset < 0 ? (
            <button
              type="button"
              disabled
              title="Không thể tạo yêu cầu lịch cho các tuần đã qua trong tháng"
              className="inline-flex h-9 items-center gap-1.5 px-3.5 rounded-xl text-xs font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed whitespace-nowrap opacity-75"
            >
              <Plus className="w-3.5 h-3.5 text-zinc-400" />
              <span>Tuần đã qua</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowRequestModal(true)}
              className="inline-flex h-9 items-center gap-1.5 px-3.5 rounded-xl text-xs font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] transition-colors cursor-pointer shadow-sm shadow-[#6B1F2E]/20 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 text-[#FF7F6B]" />
              <span>
                {isVet || !isPartTime
                  ? "Xin nghỉ phép"
                  : "Đăng ký ca làm thêm / Xin nghỉ ca / Đổi ca"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Quỹ nghỉ phép tháng & Quy định giờ làm việc (BLLĐ 2019) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Leave Quota Card */}
        <div
          className={`p-4 rounded-3xl border backdrop-blur-md space-y-2.5 text-xs ${
            leaveQuota.isAtOrOverLimit
              ? "border-rose-300 bg-rose-50/70 dark:border-rose-900/60 dark:bg-rose-950/20"
              : "border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-heading font-extrabold text-sm text-zinc-900 dark:text-foreground">
              <CalendarOff className="w-4 h-4 text-[#6B1F2E] dark:text-[#FF7F6B]" />
              <span>Quỹ ngày nghỉ tháng {leaveQuota.month}</span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                leaveQuota.isAtOrOverLimit
                  ? "bg-rose-600 text-white"
                  : "bg-[#6B1F2E]/10 text-[#6B1F2E] dark:bg-[#FF7F6B]/20 dark:text-[#FF7F6B]"
              }`}
            >
              {leaveQuota.usedDays} / {leaveQuota.maxDays} ngày
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-0.5">
            <div className="p-2 rounded-xl bg-white/80 dark:bg-muted/50 border border-zinc-200/60 dark:border-border">
              <div className="text-[10px] text-zinc-500">Nghỉ luân phiên</div>
              <div className="font-extrabold text-zinc-900 dark:text-foreground">
                {leaveQuota.rotationalDays} ngày
              </div>
            </div>
            <div className="p-2 rounded-xl bg-white/80 dark:bg-muted/50 border border-zinc-200/60 dark:border-border">
              <div className="text-[10px] text-zinc-500">Nghỉ ốm / K.lương</div>
              <div className="font-extrabold text-zinc-900 dark:text-foreground">
                {leaveQuota.sickDays + leaveQuota.unpaidDays} ngày
              </div>
            </div>
            <div className="p-2 rounded-xl bg-white/80 dark:bg-muted/50 border border-zinc-200/60 dark:border-border">
              <div className="text-[10px] text-zinc-500">Còn lại trong tháng</div>
              <div className="font-extrabold text-emerald-600 dark:text-emerald-400">
                {leaveQuota.remainingDays} ngày
              </div>
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 dark:text-muted-foreground leading-relaxed">
            Mỗi tháng tối đa <strong>4 ngày nghỉ</strong> (reset đầu tháng, không cộng dồn; gồm nghỉ luân phiên, nghỉ ốm và nghỉ không lương). Đơn nghỉ phép đã duyệt không thể hủy.
          </p>

          {leaveQuota.isAtOrOverLimit && (
            <div className="flex items-start gap-1.5 text-[11px] font-bold text-rose-700 dark:text-rose-300">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Đã chạm hạn mức 4 ngày/tháng. Nếu gửi thêm đơn nghỉ sẽ được gắn cờ cảnh báo &ldquo;vượt hạn mức / nghỉ không lương&rdquo; cho Quản lý duyệt.
              </span>
            </div>
          )}
        </div>

        {/* Overtime Caps Card (Full-time) OR Extra Shift Card (Part-time) */}
        {isPartTime ? (
          <div className="p-4 rounded-3xl border border-teal-200/80 dark:border-teal-900/50 bg-teal-50/40 dark:bg-card/80 backdrop-blur-md space-y-2.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-heading font-extrabold text-sm text-zinc-900 dark:text-foreground">
                <CalendarPlus className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Ca làm thêm (Nhân viên Part-time)</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300">
                Tháng {extraShiftSummary.month}: {extraShiftSummary.approvedShifts} ca đã duyệt
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-0.5">
              <div className="p-2 rounded-xl bg-white/80 dark:bg-muted/50 border border-zinc-200/60 dark:border-border">
                <div className="text-[10px] text-zinc-500">Ca thêm đã duyệt</div>
                <div className="font-extrabold text-zinc-900 dark:text-foreground">
                  {extraShiftSummary.approvedShifts} ca ({extraShiftSummary.approvedHours}h)
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white/80 dark:bg-muted/50 border border-zinc-200/60 dark:border-border">
                <div className="text-[10px] text-zinc-500">Đang chờ QL duyệt</div>
                <div className="font-extrabold text-amber-600 dark:text-amber-400">
                  {extraShiftSummary.pendingShifts} ca ({extraShiftSummary.pendingHours}h)
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white/80 dark:bg-muted/50 border border-zinc-200/60 dark:border-border">
                <div className="text-[10px] text-zinc-500">Khung giờ làm</div>
                <div className="font-extrabold text-teal-700 dark:text-teal-400">08:00 – 17:00</div>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-muted-foreground leading-relaxed">
              Nhân viên part-time chỉ đăng ký <strong>ca làm thêm</strong> trong giờ hành chính (08:00–17:00). Khi bận đột xuất ở ca đã phân công, vui lòng gửi <strong>đơn xin nghỉ ca</strong> (trừ vào quỹ 4 ngày/tháng).
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md space-y-2.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-heading font-extrabold text-sm text-zinc-900 dark:text-foreground">
                <Clock className="w-4 h-4 text-[#6B1F2E] dark:text-[#FF7F6B]" />
                <span>Lịch Làm Việc Hành Chính &amp; Nghỉ Phép</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-zinc-100 dark:bg-muted text-zinc-700 dark:text-foreground/80">
                08:00 – 17:00
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div className="p-2 rounded-xl bg-zinc-50 dark:bg-muted/50 border border-zinc-200/60 dark:border-border">
                <div className="text-[10px] text-zinc-500">Khung giờ phục vụ</div>
                <div className="font-extrabold text-zinc-900 dark:text-foreground">
                  Ca sáng &amp; chiều cố định
                </div>
              </div>
              <div className="p-2 rounded-xl bg-zinc-50 dark:bg-muted/50 border border-zinc-200/60 dark:border-border">
                <div className="text-[10px] text-zinc-500">Hình thức điều chỉnh</div>
                <div className="font-extrabold text-zinc-900 dark:text-foreground">
                  Xin nghỉ phép theo ngày
                </div>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-muted-foreground leading-relaxed">
              {isVet
                ? "Bác sĩ thú y làm việc cố định theo ca hành chính (08:00–17:00) do Quản lý sắp xếp và chỉ sử dụng tính năng gửi đơn xin nghỉ phép cả ngày."
                : "Nhân sự Full-time làm việc cố định theo ca hành chính (08:00–17:00) và gửi đơn xin nghỉ phép cả ngày khi có nhu cầu nghỉ."}
            </p>
          </div>
        )}
      </div>

      {/* Thông báo khi duyệt tuần đã qua trong tháng */}
      {currentWeekOffset < 0 && (
        <div className="p-3 rounded-2xl border border-amber-200 bg-amber-50/70 dark:border-amber-900/40 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              {isVet || !isPartTime
                ? "Bạn đang xem lịch của tuần đã qua trong tháng. Theo quy định hệ thống: không thể tạo đơn xin nghỉ phép cho các tuần đã qua."
                : "Bạn đang xem lịch của tuần đã qua trong tháng. Theo quy định hệ thống: không tạo yêu cầu đổi ca, làm thêm hoặc xin nghỉ cho các tuần đã qua."}
            </span>
          </div>
          <button
            type="button"
            onClick={goToCurrentWeek}
            className="font-bold underline text-amber-900 dark:text-amber-200 hover:text-amber-700 cursor-pointer text-[11px] shrink-0"
          >
            Về tuần này
          </button>
        </div>
      )}

      {/* Week Calendar Grid */}
      <ScheduleWeekView
        weekDays={weekDays}
        appointments={store.appointments}
        shifts={store.shifts}
        shiftRequests={store.shiftRequests}
        pets={allPets}
        services={allServices}
        conflictsByDate={conflictsByDate}
        onSelectAppt={setSelectedAppt}
        isVet={isVet}
      />

      {/* Danh sách yêu cầu đã gửi gần đây */}
      <ShiftRequestHistoryCard
        requests={store.shiftRequests}
        onCancelRequest={cancelShiftRequest}
      />

      {/* Modal Xin nghỉ / Đổi ca / Tăng ca */}
      <ShiftRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={handleSendRequest}
        initialDate={weekDays[0]?.iso ?? todayIso}
        shifts={store.shifts}
        shiftRequests={store.shiftRequests}
        expertId={profile.id}
        employmentType={profile.employmentType}
        expertType={profile.expertType}
        isVet={isVet}
      />

      {/* Appointment Drawer */}
      <AppointmentDrawer
        appointment={selectedAppt}
        onClose={() => setSelectedAppt(null)}
      />
    </div>
  );
}
