"use client";

import React, { useRef } from "react";
import { AlertTriangle, Calendar, ShieldAlert } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDateDdMmYyyy } from "@/utils/dateFormat";
import {
  CANCEL_REASON_OPTIONS,
  type ExtendedBooking,
  RESCHEDULE_SLOTS,
} from "./bookingsTypesAndData";

interface BookingsModalsProps {
  selectedBooking: ExtendedBooking | null;
  isRescheduleModalOpen: boolean;
  setIsRescheduleModalOpen: (open: boolean) => void;
  newDate: string;
  setNewDate: (date: string) => void;
  newTime: string;
  setNewTime: (time: string) => void;
  onConfirmReschedule: () => void;
  cancelModalOpen: boolean;
  setCancelModalOpen: (open: boolean) => void;
  cancelAssessmentNotice: string;
  cancelReasonOption: string;
  setCancelReasonOption: (val: string) => void;
  cancelReason: string;
  setCancelReason: (val: string) => void;
  isCancelFeeApplicable: boolean;
  applyHalfFee: boolean;
  setApplyHalfFee: (val: boolean) => void;
  onConfirmCancel: () => void;
}

/** Reschedule and 50%-penalty cancellation dialogs for Manager bookings. */
export function BookingsModals({
  selectedBooking,
  isRescheduleModalOpen,
  setIsRescheduleModalOpen,
  newDate,
  setNewDate,
  newTime,
  setNewTime,
  onConfirmReschedule,
  cancelModalOpen,
  setCancelModalOpen,
  cancelAssessmentNotice,
  cancelReasonOption,
  setCancelReasonOption,
  cancelReason,
  setCancelReason,
  isCancelFeeApplicable,
  applyHalfFee,
  setApplyHalfFee,
  onConfirmCancel,
}: BookingsModalsProps) {
  const rescheduleDateInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Dialog
        open={isRescheduleModalOpen}
        onOpenChange={(open) => setIsRescheduleModalOpen(open)}
      >
        <DialogContent
          showCloseButton={true}
          className="sm:max-w-md max-h-[90vh] overflow-y-auto scrollbar-thin rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl"
        >
          <DialogHeader className="pr-8">
            <DialogTitle className="text-lg font-bold">Đổi Thời Gian Hẹn</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Chọn ngày hẹn và khung giờ phục vụ mới cho khách hàng.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-zinc-500 dark:text-muted-foreground font-medium block mb-1">
                Ngày hẹn mới:
              </label>
              <div
                onClick={() => rescheduleDateInputRef.current?.showPicker?.()}
                className="relative w-full h-10 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted px-3 flex items-center justify-between text-xs font-medium cursor-pointer focus-within:ring-2 focus-within:ring-ring/50"
              >
                <span
                  className={
                    newDate
                      ? "text-zinc-900 dark:text-foreground"
                      : "text-zinc-400 dark:text-muted-foreground"
                  }
                >
                  {newDate ? formatDateDdMmYyyy(newDate) : "dd-MM-yyyy"}
                </span>
                <Calendar className="w-4 h-4 text-zinc-400 dark:text-muted-foreground shrink-0 pointer-events-none" />
                <input
                  ref={rescheduleDateInputRef}
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  aria-label="Ngày hẹn mới"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
            <div>
              <label className="text-zinc-500 font-medium block mb-1">Khung giờ mới:</label>
              <Select
                value={newTime || RESCHEDULE_SLOTS[0]}
                onValueChange={(val) => {
                  if (val !== null) setNewTime(val);
                }}
                items={Object.fromEntries(
                  (newTime && !(RESCHEDULE_SLOTS as readonly string[]).includes(newTime)
                    ? [newTime, ...RESCHEDULE_SLOTS]
                    : [...RESCHEDULE_SLOTS]
                  ).map((s) => [s, s])
                )}
              >
                <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-medium px-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(newTime && !(RESCHEDULE_SLOTS as readonly string[]).includes(newTime)
                    ? [newTime, ...RESCHEDULE_SLOTS]
                    : [...RESCHEDULE_SLOTS]
                  ).map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsRescheduleModalOpen(false)}
              className="px-3 py-1.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-muted font-bold text-xs cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onConfirmReschedule}
              className="px-4 py-2 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs cursor-pointer"
            >
              Xác nhận đổi lịch
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(cancelModalOpen && selectedBooking)}
        onOpenChange={(open) => setCancelModalOpen(open)}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-[calc(100%-2rem)] sm:max-w-md rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl gap-4"
        >
          {selectedBooking && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-2 w-full">
                  <DialogTitle className="text-lg font-bold flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                    Xác Nhận Hủy Lịch Hẹn
                  </DialogTitle>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-muted dark:hover:bg-muted/80 text-zinc-700 dark:text-foreground/90 border border-zinc-200 dark:border-border cursor-help transition-colors shrink-0"
                        />
                      }
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                      <span>Quy tắc</span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      align="end"
                      sideOffset={8}
                      hideArrow={true}
                      className="w-72 max-w-xs p-3.5 rounded-2xl bg-white dark:bg-[#1E2330] text-zinc-800 dark:text-[#F4F5F8] border border-zinc-200 dark:border-[#343B4F] shadow-2xl block text-left"
                    >
                      <div className="space-y-2 w-full">
                        <div className="font-bold text-xs flex items-center gap-1.5 text-zinc-900 dark:text-[#F4F5F8]">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-500 dark:text-[#FF8573] shrink-0" />
                          <span>Quy Tắc Hủy Lịch Animora</span>
                        </div>
                        <ul className="text-[11px] leading-relaxed text-zinc-600 dark:text-[#B8C0D0] space-y-1 list-disc pl-4">
                          <li>
                            Hủy trước giờ hẹn: Miễn phí hoàn tiền 100% đối với đơn thanh toán
                            trước.
                          </li>
                          <li>
                            Đơn thanh toán sau hủy trực tiếp 0đ, không phát sinh phí phạt.
                          </li>
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <DialogDescription className="text-xs text-muted-foreground">
                  Bạn đang hủy lịch hẹn của khách <strong>{selectedBooking.fullName}</strong> (
                  {selectedBooking.code}).
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-xs">
                {cancelAssessmentNotice && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300">
                    <span className="font-bold block mb-0.5">
                      Đánh giá thời gian hủy (Phân tích nghiệp vụ):
                    </span>
                    <span>{cancelAssessmentNotice}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-zinc-500 dark:text-muted-foreground font-medium block">
                    Lý do hủy lịch:
                  </label>
                  <Select
                    value={cancelReasonOption}
                    onValueChange={(val) => {
                      const next = val || CANCEL_REASON_OPTIONS[0];
                      setCancelReasonOption(next);
                      if (next !== "Khác") setCancelReason("");
                    }}
                  >
                    <SelectTrigger className="w-full h-10 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-xs">
                      <SelectValue placeholder="Chọn lý do hủy lịch" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {CANCEL_REASON_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option} className="text-xs">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {cancelReasonOption === "Khác" && (
                    <input
                      type="text"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Nhập lý do hủy lịch cụ thể..."
                      autoFocus
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                    />
                  )}
                </div>

                {isCancelFeeApplicable && (
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3">
                    <Checkbox
                      id="halfFee"
                      checked={applyHalfFee}
                      onCheckedChange={(checked) => setApplyHalfFee(Boolean(checked))}
                      className="mt-0.5 data-checked:bg-rose-600 data-checked:border-rose-600"
                    />
                    <label
                      htmlFor="halfFee"
                      className="text-zinc-700 dark:text-foreground/80 cursor-pointer"
                    >
                      <span className="font-bold text-rose-600 dark:text-rose-400 block">
                        Áp dụng giữ 30% giá trị đơn (Hủy trong vòng 3 giờ)
                      </span>
                      Số tiền giữ lại:{" "}
                      <strong>
                        {Math.round((selectedBooking.price || 350000) * 0.3).toLocaleString(
                          "vi-VN"
                        )}
                        ₫
                      </strong>{" "}
                      theo chính sách cam kết của Animora v1.4.
                    </label>
                  </div>
                )}
              </div>

              <DialogFooter className="bg-transparent border-t-0 p-0 mt-2 mx-0 mb-0 flex-row justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-border bg-transparent hover:bg-zinc-100 dark:hover:bg-muted font-bold text-xs cursor-pointer transition-colors"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={onConfirmCancel}
                  disabled={cancelReasonOption === "Khác" && !cancelReason.trim()}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs cursor-pointer transition-colors"
                >
                  Xác nhận hủy
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
