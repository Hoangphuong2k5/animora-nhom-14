"use client";

import React, { useMemo, useRef, useState } from "react";
import { AlertTriangle, Calendar } from "lucide-react";
import { formatDateDdMmYyyy, getTodayLocalIso } from "@/utils/dateFormat";
import {
  EmploymentType,
  ExpertAppointment,
  ExpertShift,
  ExpertType,
  LeaveReasonType,
  ShiftCode,
  ShiftRequest,
  ShiftRequestKind,
} from "@/types/expert.type";
import {
  canRequestRegularLeaveOnDate,
  evaluateMonthlyLeaveQuota,
  getCurrentWeekMondayIso,
  isDateInPastWeek,
  isSundayDateIso,
} from "@/utils/expertPolicy";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const LEAVE_TYPE_ITEMS: Record<Exclude<LeaveReasonType, "emergency">, string> = {
  sick: "Nghỉ ốm (Tính vào quỹ 4 ngày/tháng)",
  unpaid: "Nghỉ không lương (Tính vào quỹ 4 ngày/tháng)",
  rotational: "Đề xuất ngày nghỉ luân phiên (Tính vào quỹ 4 ngày/tháng)",
};

interface ShiftRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    kind: ShiftRequestKind;
    leaveType?: LeaveReasonType;
    date: string;
    shift?: ShiftCode;
    reason: string;
    policyWarnings?: string[];
    exceedsMonthlyLeaveLimit?: boolean;
  }) => void;
  initialDate?: string;
  shifts: ExpertShift[];
  shiftRequests: ShiftRequest[];
  appointments?: ExpertAppointment[];
  expertId: string;
  employmentType?: EmploymentType;
  expertType?: ExpertType;
  isVet?: boolean;
}

export function ShiftRequestModal({
  isOpen,
  onClose,
  onSubmit,
  initialDate,
  shifts,
  shiftRequests,
  appointments = [],
  expertId,
  expertType,
  isVet,
}: ShiftRequestModalProps) {
  const effectiveIsVet = isVet ?? expertType === "vet";
  const [todayIso] = useState<string>(() => getTodayLocalIso());

  const currentTodayIso = todayIso || "";
  const minAllowedDate = currentTodayIso ? getCurrentWeekMondayIso(currentTodayIso) : "";

  const effectiveInitialDate =
    currentTodayIso && initialDate && !isDateInPastWeek(initialDate, currentTodayIso)
      ? initialDate
      : currentTodayIso && minAllowedDate > currentTodayIso
      ? minAllowedDate
      : currentTodayIso;

  const [leaveType, setLeaveType] = useState<LeaveReasonType>("sick");
  const [customReqDate, setCustomReqDate] = useState<string | null>(null);
  const [reqReason, setReqReason] = useState<string>("");

  const reqDate = customReqDate ?? effectiveInitialDate;
  const setReqDate = (val: string) => setCustomReqDate(val);

  const isPastWeek = Boolean(currentTodayIso && isDateInPastWeek(reqDate, currentTodayIso));
  const isSunday = Boolean(reqDate && isSundayDateIso(reqDate));
  const hasDuplicateLeaveOnDate = shiftRequests.some(
    (r) => r.kind === "leave" && r.date === reqDate && r.status !== "rejected"
  );

  const bookingCheck = useMemo(
    () =>
      canRequestRegularLeaveOnDate(
        reqDate,
        appointments,
        expertId,
        currentTodayIso || undefined
      ),
    [reqDate, appointments, expertId, currentTodayIso]
  );

  const hasCustomerBookingOnDate = bookingCheck.conflictingAppointments.length > 0;

  const leaveQuota = useMemo(
    () => evaluateMonthlyLeaveQuota(shiftRequests, shifts, expertId, reqDate),
    [shiftRequests, shifts, expertId, reqDate]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqReason.trim()) return;
    if (isPastWeek || isSunday || hasDuplicateLeaveOnDate || hasCustomerBookingOnDate) return;

    const warnings: string[] = [];
    let exceedsMonthlyLeaveLimit = false;

    if (leaveQuota.exceedsOnNewRequest && leaveQuota.warningMessage) {
      exceedsMonthlyLeaveLimit = true;
      warnings.push(leaveQuota.warningMessage);
    }

    onSubmit({
      kind: "leave",
      leaveType,
      date: reqDate,
      shift: undefined,
      reason: reqReason.trim(),
      policyWarnings: warnings.length > 0 ? warnings : undefined,
      exceedsMonthlyLeaveLimit,
    });
    setReqReason("");
    setCustomReqDate(null);
    onClose();
  };

  const reqDateInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setCustomReqDate(null);
          onClose();
        }
      }}
    >
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin rounded-2xl border border-zinc-200 dark:border-border bg-white dark:bg-background text-zinc-900 dark:text-foreground p-6 gap-4 shadow-2xl"
      >
        <DialogHeader className="pb-3 pr-8 border-b border-zinc-100 dark:border-border">
          <DialogTitle className="font-heading font-extrabold text-base text-zinc-900 dark:text-foreground">
            Gửi Đơn Xin Nghỉ Phép Thường
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            {effectiveIsVet
              ? "Bác sĩ thú y (Full-time): gửi đơn xin nghỉ phép cả ngày (chỉ áp dụng khi ngày đó chưa có khách đặt lịch)."
              : "Nhân viên chăm sóc (Full-time): gửi đơn xin nghỉ phép cả ngày (chỉ áp dụng khi ngày đó chưa có khách đặt lịch)."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-2.5 rounded-xl bg-[#6B1F2E]/10 dark:bg-[#FF7F6B]/15 border border-[#6B1F2E]/20 text-[#6B1F2E] dark:text-[#FF7F6B] font-bold text-center">
            {effectiveIsVet
              ? "Đơn Xin Nghỉ Phép Thường (Bác sĩ thú y • Nghỉ cả ngày)"
              : "Đơn Xin Nghỉ Phép Thường (Nhân viên chăm sóc • Nghỉ cả ngày)"}
          </div>

          {/* Past week alert */}
          {isPastWeek && (
            <div className="p-3 rounded-xl border border-rose-300 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Không thể tạo yêu cầu cho các tuần đã qua trong tháng (chỉ chọn từ Thứ Hai tuần này: {formatDateDdMmYyyy(minAllowedDate)} trở đi).
              </span>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-bold text-zinc-700 dark:text-foreground/80">
              Ngày xin nghỉ (Cả ngày) *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  const el = reqDateInputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
                  el?.showPicker?.();
                  el?.focus();
                }}
                className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-zinc-900 dark:text-foreground flex items-center justify-between gap-2 text-left text-xs font-bold cursor-pointer hover:border-[#6B1F2E] dark:hover:border-[#FF7F6B] transition-colors"
              >
                <span>{reqDate ? formatDateDdMmYyyy(reqDate) : "dd-mm-yyyy"}</span>
                <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
              </button>
              <input
                ref={reqDateInputRef}
                type="date"
                required
                min={minAllowedDate}
                value={reqDate}
                onChange={(e) => setReqDate(e.target.value)}
                tabIndex={-1}
                aria-hidden="true"
                className="sr-only"
              />
            </div>
          </div>

          {/* Sunday alert */}
          {isSunday && !isPastWeek && (
            <div className="p-3 rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Chủ Nhật ({formatDateDdMmYyyy(reqDate)}) là ngày nghỉ cố định của trung tâm (lịch làm việc Thứ 2 – Thứ 7). Bạn không cần gửi đơn xin nghỉ để tránh bị trừ oan quỹ 4 ngày/tháng.
              </span>
            </div>
          )}

          {hasCustomerBookingOnDate && (
            <div className="p-3 rounded-xl border border-rose-300 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 text-[11px] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold">
                  Ngày {formatDateDdMmYyyy(reqDate)} đã có {bookingCheck.conflictingAppointments.length} lịch hẹn của khách!
                </div>
                <p>
                  Quy định nghỉ phép: Chỉ được xin nghỉ phép thường khi ngày đó chưa có khách đặt lịch cho nhân sự đó. Nếu bạn có việc đột xuất, vui lòng liên hệ trực tiếp Quản lý để điều phối theo quy trình <strong>Nghỉ đột xuất</strong>.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/20 text-[11px] text-rose-800 dark:text-rose-300 font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 shrink-0 text-rose-600" />
              <span>Chế độ nghỉ cả ngày: Khi Quản lý duyệt đơn, toàn bộ slot của ngày này sẽ được khóa ngay.</span>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-foreground/80">
                Loại nghỉ phép *
              </label>
              <Select
                value={leaveType}
                onValueChange={(val) => {
                  if (val !== null) setLeaveType(val as LeaveReasonType);
                }}
                items={LEAVE_TYPE_ITEMS}
              >
                <SelectTrigger className="w-full h-10! px-3 rounded-xl border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-xs font-bold text-zinc-900 dark:text-foreground cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sick">{LEAVE_TYPE_ITEMS.sick}</SelectItem>
                  <SelectItem value="unpaid">{LEAVE_TYPE_ITEMS.unpaid}</SelectItem>
                  <SelectItem value="rotational">{LEAVE_TYPE_ITEMS.rotational}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div
              className={`p-3 rounded-xl border text-[11px] flex items-start gap-2 ${
                leaveQuota.exceedsOnNewRequest
                  ? "border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200"
                  : "border-zinc-200 bg-zinc-50 dark:border-border dark:bg-muted/40 text-zinc-600 dark:text-zinc-300"
              }`}
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <div className="font-bold">
                  Quỹ nghỉ tháng {leaveQuota.month}: {leaveQuota.usedDays}/{leaveQuota.maxDays} ngày đã sử dụng
                </div>
                {leaveQuota.exceedsOnNewRequest ? (
                  <p className="mt-0.5 font-semibold text-rose-700 dark:text-rose-300">
                    Cảnh báo: {leaveQuota.warningMessage}
                  </p>
                ) : (
                  <p className="mt-0.5">
                    Còn lại {leaveQuota.remainingDays} ngày trong tháng. Đơn nghỉ đã duyệt sẽ không thể hủy.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-zinc-700 dark:text-foreground/80">Lý do *</label>
            <Textarea
              required
              rows={3}
              value={reqReason}
              onChange={(e) => setReqReason(e.target.value)}
              placeholder="Nhập lý do cụ thể gửi Manager phê duyệt..."
              className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-zinc-900 dark:text-foreground text-xs"
            />
          </div>

          {hasDuplicateLeaveOnDate && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-[11px] font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                Bạn đã có đơn xin nghỉ phép cho ngày {formatDateDdMmYyyy(reqDate)} (đang chờ duyệt hoặc đã duyệt). Vui lòng chọn ngày khác.
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setCustomReqDate(null);
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-muted cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={
                !reqReason.trim() ||
                isPastWeek ||
                isSunday ||
                hasDuplicateLeaveOnDate ||
                hasCustomerBookingOnDate
              }
              className={`px-5 py-2 rounded-xl font-bold text-white transition-colors cursor-pointer ${
                !reqReason.trim() ||
                isPastWeek ||
                isSunday ||
                hasDuplicateLeaveOnDate ||
                hasCustomerBookingOnDate
                  ? "bg-zinc-400 dark:bg-zinc-700 cursor-not-allowed opacity-60"
                  : "bg-[#6B1F2E] hover:bg-[#521723]"
              }`}
            >
              {isPastWeek
                ? "Không thể gửi (Tuần đã qua)"
                : isSunday
                ? "Chủ Nhật nghỉ cố định"
                : hasCustomerBookingOnDate
                ? "Ngày đã có khách đặt lịch"
                : hasDuplicateLeaveOnDate
                ? "Trùng ngày đã xin nghỉ"
                : "Gửi Quản lý duyệt"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
