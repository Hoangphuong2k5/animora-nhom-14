"use client";

import React from "react";
import {
  Calendar,
  Check,
  CheckCircle2,
  CreditCard,
  Dog,
  User,
  XCircle,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatDateDdMmYyyy, formatDateTimeDdMmYyyy } from "@/utils/dateFormat";
import { getWeightRangeLabel } from "@/data/serviceBookingData";
import type { BookingStatus } from "@/types";
import {
  ASSIGNABLE_STAFF_OPTIONS,
  type ExtendedBooking,
  getBookingPaymentMeta,
  isBookingFinalized,
  isBookingPaid,
} from "./bookingsTypesAndData";

interface BookingDetailDrawerProps {
  readOnly?: boolean;
  selectedBooking: ExtendedBooking | null;
  onClose: () => void;
  onReassignStaff?: (id: string, staffId: string) => void;
  onConfirmCounterPayment?: (id: string) => void;
  onUpdateStatus?: (id: string, nextStatus: BookingStatus) => void;
  onOpenReschedule?: (booking: ExtendedBooking) => void;
  onOpenCancel?: (booking: ExtendedBooking) => void;
}

/** Shared slide-over booking detail drawer supporting Manager operations and Admin read-only lookup. */
export function BookingDetailDrawer({
  readOnly = false,
  selectedBooking,
  onClose,
  onReassignStaff,
  onConfirmCounterPayment,
  onUpdateStatus,
  onOpenReschedule,
  onOpenCancel,
}: BookingDetailDrawerProps) {
  return (
    <Sheet
      open={Boolean(selectedBooking)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="right"
        showCloseButton={true}
        className="w-full data-[side=right]:w-full data-[side=right]:sm:max-w-lg p-0 gap-0 flex flex-col h-full bg-popover text-popover-foreground border-l border-border shadow-2xl"
      >
        {selectedBooking && (
          <>
            <SheetHeader className="px-6 py-4 border-b border-border shrink-0 pr-12">
              <span className="text-xs font-mono font-bold text-[#FF7F6B]">
                {selectedBooking.code || `BK-${selectedBooking.id?.slice(0, 5)}`}
              </span>
              <SheetTitle className="text-base font-bold text-zinc-900 dark:text-foreground">
                Hồ Sơ Chi Tiết Lịch Hẹn
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Thông tin khách hàng, thú cưng, thanh toán và tiến trình phục vụ
              </SheetDescription>
            </SheetHeader>

            <ScrollArea className="flex-1 min-h-0 overflow-hidden">
              <div className="p-6 space-y-5 text-xs">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border space-y-3">
                  <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-foreground text-sm">
                    <User className="w-4 h-4 text-[#FF7F6B]" />
                    <span>Khách hàng: {selectedBooking.fullName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-zinc-600 dark:text-muted-foreground">
                    <div>
                      <span className="text-[11px] text-zinc-400 block">Số điện thoại:</span>
                      <span className="font-semibold text-zinc-800 dark:text-foreground/90">
                        {selectedBooking.phone}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-400 block">Email:</span>
                      <span className="font-semibold text-zinc-800 dark:text-foreground/90 truncate block">
                        {selectedBooking.email || "Chưa cung cấp"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-200/60 dark:border-border/60">
                    <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-foreground">
                      <Dog className="w-4 h-4 text-[#FF7F6B]" />
                      <span>Thú cưng: {selectedBooking.petName || "Bé cưng"}</span>
                    </div>
                    {(() => {
                      const rawBreed = selectedBooking.petBreed || "Lai";
                      const breedParts = rawBreed
                        .split("·")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      const parsedBreed = breedParts[0] || "Lai";
                      const parsedAge =
                        (selectedBooking as ExtendedBooking & { petAge?: string }).petAge ||
                        breedParts.find((part) => /tuổi|tháng|năm/i.test(part)) ||
                        "Chưa rõ";
                      return (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-zinc-600 dark:text-muted-foreground mt-1.5">
                          <div>
                            <span className="text-[11px] text-zinc-400 block">Loài:</span>
                            <span className="font-semibold text-zinc-800 dark:text-foreground/90">
                              {selectedBooking.petType}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-zinc-400 block">Giống:</span>
                            <span className="font-semibold text-zinc-800 dark:text-foreground/90">
                              {parsedBreed}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-zinc-400 block">Tuổi:</span>
                            <span className="font-semibold text-zinc-800 dark:text-foreground/90">
                              {parsedAge}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-zinc-400 block">Cân nặng:</span>
                            <span className="font-semibold text-zinc-800 dark:text-foreground/90">
                              {getWeightRangeLabel(selectedBooking.weightRange, "vi")}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Dịch vụ yêu cầu:</span>
                    <span className="font-bold text-zinc-900 dark:text-foreground">
                      {selectedBooking.service}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-zinc-400 shrink-0">Chuyên viên phụ trách:</span>
                    {!readOnly && onReassignStaff && !isBookingFinalized(selectedBooking) ? (
                      (() => {
                        const currentStaff =
                          ASSIGNABLE_STAFF_OPTIONS.find(
                            (s) =>
                              s.id === selectedBooking.doctorId ||
                              (selectedBooking.staffName || "").includes(
                                s.name.split(" ").slice(-1)[0].replace(/[()]/g, "")
                              )
                          ) || ASSIGNABLE_STAFF_OPTIONS[0];
                        return (
                          <Select
                            value={currentStaff.id}
                            onValueChange={(val) => {
                              if (val) onReassignStaff(selectedBooking.id, val);
                            }}
                          >
                            <SelectTrigger className="h-8 w-auto min-w-[225px] px-3 text-xs font-bold text-[#6B1F2E] dark:text-[#FF7F6B] bg-white dark:bg-card border-zinc-200 dark:border-border rounded-xl">
                              <SelectValue>{currentStaff.name}</SelectValue>
                            </SelectTrigger>
                            <SelectContent className="min-w-[240px] rounded-2xl">
                              {ASSIGNABLE_STAFF_OPTIONS.map((staff) => (
                                <SelectItem
                                  key={staff.id}
                                  value={staff.id}
                                  className="text-xs font-medium"
                                >
                                  {staff.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        );
                      })()
                    ) : (
                      <span className="font-bold text-[#6B1F2E] dark:text-[#FF7F6B]">
                        {selectedBooking.staffName || "BS. Lê Huy Hoàng"}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Thời gian hẹn:</span>
                    <span className="font-semibold text-zinc-800 dark:text-foreground/90">
                      {formatDateDdMmYyyy(selectedBooking.date)} lúc{" "}
                      {selectedBooking.timeSlot || "09:00"}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-zinc-200/60 dark:border-border/60">
                    <span className="text-zinc-400">Tổng chi phí:</span>
                    <span className="font-extrabold text-sm text-[#6B1F2E] dark:text-[#FF7F6B]">
                      {(selectedBooking.price || 350000).toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-zinc-400">Hình thức thanh toán:</span>
                    <span className="font-semibold text-zinc-800 dark:text-foreground/90 text-right">
                      {getBookingPaymentMeta(selectedBooking).badgeLabel}
                    </span>
                  </div>
                  {!isBookingPaid(selectedBooking) &&
                    !isBookingFinalized(selectedBooking) && (
                      <div className="pt-2">
                        {!readOnly && onConfirmCounterPayment ? (
                          <button
                            type="button"
                            onClick={() => onConfirmCounterPayment(selectedBooking.id)}
                            className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Xác nhận đã thu tiền tại quầy</span>
                          </button>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-[11px] font-medium">
                            Phân quyền quầy: Việc <strong>Check-in, Thu tiền tại quầy &amp; Xuất hóa đơn</strong> do <strong>Lễ tân (/receptionist)</strong> thực hiện. Quản lý chỉ xem và điều phối nhân sự nghỉ đột xuất.
                          </div>
                        )}
                      </div>
                    )}
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border space-y-3">
                  <span className="font-bold text-zinc-900 dark:text-foreground block">
                    Tiến Trình Đổi Trạng Thái
                  </span>
                  <div className="space-y-2 relative pl-4 border-l-2 border-zinc-200 dark:border-border">
                    <div className="relative">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -left-[21px] top-1" />
                      <div className="font-bold text-zinc-800 dark:text-foreground/90">
                        Đặt lịch hẹn
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {formatDateTimeDdMmYyyy(selectedBooking.createdAt)}
                      </div>
                    </div>

                    {(selectedBooking.confirmedAt ||
                      selectedBooking.status === "Đã xác nhận" ||
                      selectedBooking.status === "Hoàn thành") && (
                      <div className="relative">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-500 absolute -left-[21px] top-1" />
                        <div className="font-bold text-zinc-800 dark:text-foreground/90">
                          Quản lý đã xác nhận
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {formatDateTimeDdMmYyyy(
                            selectedBooking.confirmedAt || selectedBooking.createdAt
                          )}
                        </div>
                      </div>
                    )}

                    {(selectedBooking.completedAt ||
                      selectedBooking.status === "Hoàn thành") && (
                      <div className="relative">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -left-[21px] top-1" />
                        <div className="font-bold text-zinc-800 dark:text-foreground/90">
                          Hoàn thành dịch vụ
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {formatDateTimeDdMmYyyy(
                            selectedBooking.completedAt ||
                              selectedBooking.confirmedAt ||
                              selectedBooking.createdAt
                          )}
                        </div>
                      </div>
                    )}

                    {selectedBooking.cancelledAt && (
                      <div className="relative">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute -left-[21px] top-1" />
                        <div className="font-bold text-rose-600 dark:text-rose-400">
                          Đã hủy lịch
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {formatDateTimeDdMmYyyy(selectedBooking.cancelledAt)}
                        </div>
                        {selectedBooking.cancelReason && (
                          <div className="text-[11px] text-rose-500 mt-0.5">
                            Lý do: {selectedBooking.cancelReason}
                          </div>
                        )}
                        {selectedBooking.cancellationFee ? (
                          <div className="text-[11px] font-bold text-rose-600 mt-0.5">
                            Khoản phí phạt áp dụng (50%):{" "}
                            {selectedBooking.cancellationFee.toLocaleString("vi-VN")}₫
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>

                {selectedBooking.prescription && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                    <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">
                      Đơn Kê Đơn &amp; Chỉ Định Lâm Sàng:
                    </span>
                    <p className="text-zinc-700 dark:text-foreground/80 text-[11px]">
                      {selectedBooking.prescription}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="px-6 py-4 border-t border-border shrink-0 flex flex-wrap items-center gap-2">
              {readOnly ? (
                <div className="w-full flex items-center justify-between text-xs">
                  <span className="text-muted-foreground italic">
                    Chế độ chỉ xem (Read-Only)
                  </span>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              ) : isBookingFinalized(selectedBooking) ? (
                <div className="w-full py-2.5 px-3.5 rounded-xl bg-zinc-50 dark:bg-muted/60 border border-zinc-200/80 dark:border-border text-xs font-medium text-zinc-600 dark:text-muted-foreground flex items-center justify-center gap-2 text-center">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    {selectedBooking.status === "Hoàn thành"
                      ? "Lịch hẹn đã hoàn thành"
                      : "Lịch hẹn đã kết thúc — không thể đổi hoặc hủy lịch."}
                  </span>
                </div>
              ) : (
                <>
                  {selectedBooking.status !== "Đã xác nhận" && onUpdateStatus && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(selectedBooking.id, "Đã xác nhận")}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Xác nhận lịch</span>
                    </button>
                  )}

                  {selectedBooking.status === "Đã xác nhận" && onUpdateStatus && (
                    <button
                      type="button"
                      disabled={!isBookingPaid(selectedBooking)}
                      title={
                        isBookingPaid(selectedBooking)
                          ? "Hoàn thành và bàn giao cho chủ"
                          : "Vui lòng xác nhận thu tiền tại quầy trước khi hoàn thành"
                      }
                      onClick={() => onUpdateStatus(selectedBooking.id, "Hoàn thành")}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Hoàn thành ca</span>
                    </button>
                  )}

                  {onOpenReschedule && (
                    <button
                      type="button"
                      onClick={() => onOpenReschedule(selectedBooking)}
                      className="py-2.5 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-muted dark:hover:bg-muted text-zinc-700 dark:text-foreground/80 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Đổi lịch</span>
                    </button>
                  )}

                  {onOpenCancel && (
                    <button
                      type="button"
                      onClick={() => onOpenCancel(selectedBooking)}
                      className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Hủy lịch</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
