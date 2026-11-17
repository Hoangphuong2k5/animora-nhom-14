"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Calendar, CalendarPlus } from "lucide-react";
import { formatDateDdMmYyyy } from "@/utils/dateFormat";
import {
  EmploymentType,
  ExpertShift,
  ExpertType,
  LeaveReasonType,
  ShiftCode,
  ShiftRequest,
  ShiftRequestKind,
} from "@/types/expert.type";
import {
  evaluateMonthlyLeaveQuota,
  getCurrentWeekMondayIso,
  getShiftDurationHours,
  isDateInPastWeek,
  isPartTimeOffShift,
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

const SHIFT_ITEMS: Record<ShiftCode, string> = {
  morning: "Ca sáng (08:00 - 12:00 • 4h)",
  afternoon: "Ca chiều (13:00 - 17:00 • 4h)",
};

const LEAVE_TYPE_ITEMS: Record<LeaveReasonType, string> = {
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
    targetSwapDate?: string;
    targetSwapShift?: ShiftCode;
    extraShiftHours?: number;
    reason: string;
    policyWarnings?: string[];
    exceedsMonthlyLeaveLimit?: boolean;
  }) => void;
  initialDate?: string;
  shifts: ExpertShift[];
  shiftRequests: ShiftRequest[];
  expertId: string;
  employmentType?: EmploymentType;
  expertType?: ExpertType;
  isVet?: boolean;
}

function getLocalTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function ShiftRequestModal({
  isOpen,
  onClose,
  onSubmit,
  initialDate,
  shifts,
  shiftRequests,
  expertId,
  employmentType = "full_time",
  expertType,
  isVet,
}: ShiftRequestModalProps) {
  const effectiveIsVet = isVet ?? expertType === "vet";
  const isPartTime = employmentType === "part_time";
  const isLeaveOnlyRole = effectiveIsVet || !isPartTime;
  // Ngày hôm nay chỉ đọc sau khi component đã mount ở trình duyệt
  // (gọi new Date() lúc render sẽ làm Next.js chặn prerender).
  const [todayIso, setTodayIso] = useState<string>("");
  useEffect(() => {
    setTodayIso(getLocalTodayIso());
  }, []);

  const minAllowedDate = todayIso ? getCurrentWeekMondayIso(todayIso) : "";

  const effectiveInitialDate = todayIso
    ? initialDate && !isDateInPastWeek(initialDate, todayIso)
      ? initialDate
      : minAllowedDate > todayIso
      ? minAllowedDate
      : todayIso
    : initialDate ?? "";

  // Bác sĩ & Full-time chỉ xin nghỉ phép; Part-time có ca làm thêm, nghỉ ca, đổi ca
  const defaultPrimaryKind: ShiftRequestKind = isLeaveOnlyRole
    ? "leave"
    : "extra_shift";

  const [rawReqKind, setReqKind] = useState<ShiftRequestKind>(defaultPrimaryKind);

  const reqKind: ShiftRequestKind = isLeaveOnlyRole
    ? "leave"
    : rawReqKind;

  const [leaveType, setLeaveType] = useState<LeaveReasonType>("sick");
  const [customReqDate, setCustomReqDate] = useState<string | null>(null);
  const [reqShift, setReqShift] = useState<ShiftCode>("morning");
  const [customTargetSwapDate, setCustomTargetSwapDate] = useState<string | null>(null);
  const [targetSwapShift, setTargetSwapShift] = useState<ShiftCode>("afternoon");
  const [extraShiftHours, setExtraShiftHours] = useState<number>(4);
  const [reqReason, setReqReason] = useState<string>("");

  const reqDate = customReqDate ?? effectiveInitialDate;
  const targetSwapDate = customTargetSwapDate ?? effectiveInitialDate;
  const setReqDate = (val: string) => setCustomReqDate(val);
  const setTargetSwapDate = (val: string) => setCustomTargetSwapDate(val);

  const isPastWeek = todayIso ? isDateInPastWeek(reqDate, todayIso) : false;
  const isOffShift = isPartTime && isPartTimeOffShift(shifts, expertId, reqDate, reqShift);
  const cannotSwapBecauseOffShift = isPartTime && reqKind === "shift_swap" && isOffShift;
  const hasDuplicateLeaveOnDate =
    reqKind === "leave" &&
    shiftRequests.some(
      (r) => r.kind === "leave" && r.date === reqDate && r.status !== "rejected"
    );

  const leaveQuota = useMemo(
    () => evaluateMonthlyLeaveQuota(shiftRequests, shifts, expertId, reqDate),
    [shiftRequests, shifts, expertId, reqDate]
  );

  const handleShiftChange = (val: ShiftCode) => {
    setReqShift(val);
    if (reqKind === "extra_shift") {
      setExtraShiftHours(getShiftDurationHours(val));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqReason.trim()) return;
    if (isPastWeek) return;
    if (cannotSwapBecauseOffShift) return;
    if (hasDuplicateLeaveOnDate) return;

    const warnings: string[] = [];
    let exceedsMonthlyLeaveLimit = false;

    if (reqKind === "leave" && leaveQuota.exceedsOnNewRequest && leaveQuota.warningMessage) {
      exceedsMonthlyLeaveLimit = true;
      warnings.push(leaveQuota.warningMessage);
    }

    onSubmit({
      kind: reqKind,
      leaveType: reqKind === "leave" ? leaveType : undefined,
      date: reqDate,
      // Xin nghỉ thì nghỉ cả ngày không cần tính buổi
      shift: reqKind === "leave" ? undefined : reqShift,
      targetSwapDate: reqKind === "shift_swap" ? targetSwapDate : undefined,
      targetSwapShift: reqKind === "shift_swap" ? targetSwapShift : undefined,
      extraShiftHours: reqKind === "extra_shift" ? extraShiftHours : undefined,
      reason: reqReason.trim(),
      policyWarnings: warnings.length > 0 ? warnings : undefined,
      exceedsMonthlyLeaveLimit,
    });
    setReqReason("");
    setCustomReqDate(null);
    setCustomTargetSwapDate(null);
    onClose();
  };

  const reqDateInputRef = useRef<HTMLInputElement | null>(null);
  const swapDateInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setCustomReqDate(null);
          setCustomTargetSwapDate(null);
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
            Gửi Yêu Cầu Lịch Làm Việc / Nghỉ Phép
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            {effectiveIsVet
              ? "Bác sĩ thú y: gửi đơn xin nghỉ phép (nghỉ cả ngày, trừ vào quỹ 4 ngày/tháng) tới Quản lý phê duyệt."
              : isPartTime
              ? "Nhân sự Part-time: đăng ký ca làm thêm (08:00–17:00), xin nghỉ ca hoặc đổi ca tới Quản lý."
              : "Nhân sự Full-time: gửi đơn xin nghỉ phép (nghỉ cả ngày, trừ vào quỹ 4 ngày/tháng) tới Quản lý phê duyệt."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Action Tabs / Indicator */}
          {isLeaveOnlyRole ? (
            <div className="p-2.5 rounded-xl bg-[#6B1F2E]/10 dark:bg-[#FF7F6B]/15 border border-[#6B1F2E]/20 text-[#6B1F2E] dark:text-[#FF7F6B] font-bold text-center">
              {effectiveIsVet
                ? "Đơn Xin Nghỉ Phép (Bác sĩ thú y • Nghỉ cả ngày)"
                : "Đơn Xin Nghỉ Phép (Nhân sự Full-time • Nghỉ cả ngày)"}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setReqKind("extra_shift")}
                className={`py-2 px-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                  reqKind === "extra_shift"
                    ? "bg-teal-700 text-white border-transparent"
                    : "border-zinc-200 dark:border-border text-zinc-600 dark:text-zinc-300"
                }`}
              >
                Đăng ký ca làm thêm
              </button>
              <button
                type="button"
                onClick={() => setReqKind("leave")}
                className={`py-2 px-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                  reqKind === "leave"
                    ? "bg-rose-600 text-white border-transparent"
                    : "border-zinc-200 dark:border-border text-zinc-600 dark:text-zinc-300"
                }`}
              >
                Xin nghỉ ca
              </button>
              <button
                type="button"
                onClick={() => setReqKind("shift_swap")}
                className={`py-2 px-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                  reqKind === "shift_swap"
                    ? "bg-amber-600 text-white border-transparent"
                    : "border-zinc-200 dark:border-border text-zinc-600 dark:text-zinc-300"
                }`}
              >
                Xin đổi ca
              </button>
            </div>
          )}

          {/* Past week alert */}
          {isPastWeek && (
            <div className="p-3 rounded-xl border border-rose-300 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Không thể tạo yêu cầu cho các tuần đã qua trong tháng (chỉ chọn từ Thứ Hai tuần này: {formatDateDdMmYyyy(minAllowedDate)} trở đi).
              </span>
            </div>
          )}

          <div className={`grid gap-3 ${reqKind === "leave" ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-foreground/80">
                {reqKind === "shift_swap" ? "Ngày ca hiện tại *" : reqKind === "leave" ? "Ngày xin nghỉ (Cả ngày) *" : "Chọn ngày *"}
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

            {/* Chỉ hiển thị chọn khung ca nếu KHÔNG phải xin nghỉ (vì xin nghỉ là nghỉ cả ngày) */}
            {reqKind !== "leave" && (
              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-foreground/80">
                  {reqKind === "shift_swap" ? "Ca hiện tại muốn đổi *" : "Khung ca *"}
                </label>
                <Select
                  value={reqShift}
                  onValueChange={(val) => {
                    if (val !== null) handleShiftChange(val as ShiftCode);
                  }}
                  items={SHIFT_ITEMS}
                >
                  <SelectTrigger className="w-full h-10! px-3 rounded-xl border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-xs font-bold text-zinc-900 dark:text-foreground cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">{SHIFT_ITEMS.morning}</SelectItem>
                    <SelectItem value="afternoon">{SHIFT_ITEMS.afternoon}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {reqKind === "leave" && (
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/20 text-[11px] text-rose-800 dark:text-rose-300 font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 shrink-0 text-rose-600" />
                <span>Chế độ nghỉ cả ngày: Không tính theo buổi, áp dụng cho tất cả các ca làm việc trong ngày đã chọn.</span>
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
          )}

          {isPartTime && reqKind === "extra_shift" && (
            <div className="p-3 rounded-xl border border-teal-200 bg-teal-50/70 dark:border-teal-900/50 dark:bg-teal-950/20 text-[11px] text-teal-900 dark:text-teal-200 flex items-start gap-2">
              <CalendarPlus className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold">
                  Đăng ký ca làm thêm ({getShiftDurationHours(reqShift)} giờ • Giờ hành chính 08:00–17:00) — Nhân viên Part-time
                </div>
                <p>
                  Nhân viên part-time đăng ký ca làm thêm trong giờ hành chính (Ca sáng hoặc Ca chiều). Ca sau khi được Manager duyệt sẽ hiển thị trên lịch tuần của bạn.
                </p>
              </div>
            </div>
          )}

          {isPartTime && reqKind === "shift_swap" && (
            <>
              {cannotSwapBecauseOffShift ? (
                <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold">Khung ca này là ca nghỉ có sẵn của bạn</div>
                    <p className="text-[11px] leading-relaxed">
                      Bạn không có lịch làm việc vào {SHIFT_ITEMS[reqShift]} ngày {formatDateDdMmYyyy(reqDate)}. Do đó không cần điền thông tin đổi ca. Nếu bạn muốn đi làm thêm vào ca này, vui lòng chuyển sang mục <strong>&ldquo;Đăng ký ca làm thêm&rdquo;</strong>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/15">
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700 dark:text-foreground/80">
                      Ngày muốn đổi sang *
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          const el = swapDateInputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
                          el?.showPicker?.();
                          el?.focus();
                        }}
                        className="w-full h-9.5 px-3 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card text-zinc-900 dark:text-foreground flex items-center justify-between gap-2 text-left text-xs font-bold cursor-pointer hover:border-[#6B1F2E] dark:hover:border-[#FF7F6B] transition-colors"
                      >
                        <span>{targetSwapDate ? formatDateDdMmYyyy(targetSwapDate) : "dd-mm-yyyy"}</span>
                        <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
                      </button>
                      <input
                        ref={swapDateInputRef}
                        type="date"
                        required
                        min={minAllowedDate}
                        value={targetSwapDate}
                        onChange={(e) => setTargetSwapDate(e.target.value)}
                        tabIndex={-1}
                        aria-hidden="true"
                        className="sr-only"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700 dark:text-foreground/80">
                      Ca muốn đổi sang *
                    </label>
                    <Select
                      value={targetSwapShift}
                      onValueChange={(val) => {
                        if (val !== null) setTargetSwapShift(val as ShiftCode);
                      }}
                      items={SHIFT_ITEMS}
                    >
                      <SelectTrigger className="w-full h-9.5! px-3 rounded-xl border-zinc-200 dark:border-border bg-white dark:bg-card text-xs font-bold text-zinc-900 dark:text-foreground cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">{SHIFT_ITEMS.morning}</SelectItem>
                        <SelectItem value="afternoon">{SHIFT_ITEMS.afternoon}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </>
          )}

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
                setCustomTargetSwapDate(null);
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
                cannotSwapBecauseOffShift ||
                hasDuplicateLeaveOnDate
              }
              className={`px-5 py-2 rounded-xl font-bold text-white transition-colors cursor-pointer ${
                !reqReason.trim() ||
                isPastWeek ||
                cannotSwapBecauseOffShift ||
                hasDuplicateLeaveOnDate
                  ? "bg-zinc-400 dark:bg-zinc-700 cursor-not-allowed opacity-60"
                  : "bg-[#6B1F2E] hover:bg-[#521723]"
              }`}
            >
              {isPastWeek
                ? "Không thể gửi (Tuần đã qua)"
                : hasDuplicateLeaveOnDate
                ? "Trùng ngày đã xin nghỉ"
                : cannotSwapBecauseOffShift
                ? "Không thể đổi ca (Ca nghỉ có sẵn)"
                : "Gửi Quản lý duyệt"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
