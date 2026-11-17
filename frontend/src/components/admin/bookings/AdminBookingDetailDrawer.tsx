import React, { useState } from "react";
import {
  Calendar,
  Check,
  CheckCircle2,
  Dog,
  ShieldAlert,
  Sparkles,
  User,
  XCircle,
} from "lucide-react";
import { CARE_SERVICE_STAGES, getCareStageMeta } from "@/utils/expertPolicy";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookingStatus } from "@/types";
import { getWeightRangeLabel } from "@/data/serviceBookingData";
import { ExtendedBooking } from "@/hooks/admin/useAdminBookings";
import { formatDateDdMmYyyy } from "@/utils/dateFormat";

interface AdminBookingDetailDrawerProps {
  selectedBooking: ExtendedBooking | null;
  onClose: () => void;
  onUpdateStatus?: (id: string, status: BookingStatus) => void;
  onConfirmCareService?: (id: string, note?: string) => void;
  onOpenReschedule?: () => void;
  onOpenCancel?: () => void;
}

export const AdminBookingDetailDrawer = ({
  selectedBooking,
  onClose,
}: AdminBookingDetailDrawerProps) => {
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
                {selectedBooking.code ||
                  `BK-${selectedBooking.id?.slice(0, 5)}`}
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
                      <span className="text-[11px] text-zinc-400 block">
                        Số điện thoại:
                      </span>
                      <span className="font-semibold text-zinc-800 dark:text-foreground/90">
                        {selectedBooking.phone}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-400 block">
                        Email:
                      </span>
                      <span className="font-semibold text-zinc-800 dark:text-foreground/90 truncate block">
                        {selectedBooking.email || "Chưa cung cấp"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-200/60 dark:border-border/60">
                    <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-foreground">
                      <Dog className="w-4 h-4 text-[#FF7F6B]" />
                      <span>
                        Thú cưng: {selectedBooking.petName || "Bé cưng"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-zinc-600 dark:text-muted-foreground mt-1">
                      <div>
                        <span className="text-[11px] text-zinc-400 block">
                          Loài:
                        </span>
                        <span className="font-semibold text-zinc-800 dark:text-foreground/90">
                          {selectedBooking.petType}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-zinc-400 block">
                          Giống:
                        </span>
                        <span className="font-semibold text-zinc-800 dark:text-foreground/90">
                          {selectedBooking.petBreed || "Lai"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-zinc-400 block">
                          Cân nặng:
                        </span>
                        <span className="font-semibold text-zinc-800 dark:text-foreground/90">
                          {getWeightRangeLabel(selectedBooking.weightRange, "vi")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Dịch vụ yêu cầu:</span>
                    <span className="font-bold text-zinc-900 dark:text-foreground">
                      {selectedBooking.service}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Chuyên viên phụ trách:</span>
                    <span className="font-bold text-[#6B1F2E] dark:text-[#FF7F6B]">
                      {selectedBooking.staffName || "BS. Lê Huy Hoàng"}
                    </span>
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
                      {(selectedBooking.price || 350000).toLocaleString("vi-VN")}
                      ₫
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Hình thức thanh toán:</span>
                    <span className="font-semibold text-zinc-800 dark:text-foreground/90">
                      {selectedBooking.paymentMethod === "online"
                        ? "Đã trả trước qua VNPAY"
                        : "Thanh toán sau tại quầy"}
                    </span>
                  </div>
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
                        {selectedBooking.createdAt}
                      </div>
                    </div>

                    {selectedBooking.confirmedAt && (
                      <div className="relative">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-500 absolute -left-[21px] top-1" />
                        <div className="font-bold text-zinc-800 dark:text-foreground/90">
                          Admin đã xác nhận
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {selectedBooking.confirmedAt}
                        </div>
                      </div>
                    )}

                    {selectedBooking.completedAt && (
                      <div className="relative">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -left-[21px] top-1" />
                        <div className="font-bold text-zinc-800 dark:text-foreground/90">
                          Hoàn thành dịch vụ
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {selectedBooking.completedAt}
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
                          {selectedBooking.cancelledAt}
                        </div>
                        {selectedBooking.cancelReason && (
                          <div className="text-[11px] text-rose-500 mt-0.5">
                            Lý do: {selectedBooking.cancelReason}
                          </div>
                        )}
                        {selectedBooking.cancellationFee ? (
                          <div className="text-[11px] font-bold text-rose-600 mt-0.5">
                            Khoản phí phạt áp dụng (50%):{" "}
                            {selectedBooking.cancellationFee.toLocaleString(
                              "vi-VN"
                            )}
                            ₫
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tiến trình 4 bước chăm sóc & Xác nhận của Manager */}
                {selectedBooking.status !== "Đã hủy" && (
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-zinc-900 dark:text-foreground flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#FF7F6B]" />
                        <span>Tiến Trình Thực Hiện Dịch Vụ (4 Bước)</span>
                      </span>
                      {selectedBooking.managerConfirmedAt ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700">
                          QL đã xác nhận
                        </span>
                      ) : selectedBooking.careStage ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                          Bước {getCareStageMeta(selectedBooking.careStage).stepNumber}/4
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-400">
                          Chưa bắt đầu ca
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {CARE_SERVICE_STAGES.map((st) => {
                        const currentStep = selectedBooking.careStage
                          ? getCareStageMeta(selectedBooking.careStage).stepNumber
                          : 0;
                        const reached = currentStep >= st.stepNumber;
                        return (
                          <div
                            key={st.id}
                            className={`p-2 rounded-xl border text-[11px] ${
                              reached
                                ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 font-semibold"
                                : "border-zinc-200/70 bg-white dark:border-border dark:bg-card/50 text-zinc-400"
                            }`}
                          >
                            {st.stepNumber}. {st.shortLabel}
                          </div>
                        );
                      })}
                    </div>

                    {selectedBooking.careProgressLog &&
                      selectedBooking.careProgressLog.length > 0 && (
                        <div className="space-y-1 text-[11px] text-zinc-600 dark:text-zinc-300 border-t border-zinc-200/60 dark:border-border/60 pt-2">
                          {selectedBooking.careProgressLog.map((entry, idx) => (
                            <div key={idx} className="flex items-start justify-between gap-2">
                              <span>
                                <strong>{getCareStageMeta(entry.stage).shortLabel}:</strong>{" "}
                                {entry.note || getCareStageMeta(entry.stage).description}
                              </span>
                              <span className="text-[10px] text-zinc-400 shrink-0">
                                {entry.updatedAt.replace("T", " ").slice(0, 16)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                    {selectedBooking.managerConfirmedAt && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-[11px] text-emerald-800 dark:text-emerald-300">
                        <strong>
                          {selectedBooking.managerConfirmedBy || "Manager"}
                        </strong>{" "}
                        đã xác nhận kết quả lúc{" "}
                        {selectedBooking.managerConfirmedAt.replace("T", " ")}
                        {selectedBooking.managerConfirmNote
                          ? ` — "${selectedBooking.managerConfirmNote}"`
                          : ""}
                      </div>
                    )}
                  </div>
                )}

                <div className="p-3.5 rounded-2xl bg-[#6B1F2E]/5 dark:bg-[#6B1F2E]/20 border border-[#6B1F2E]/15 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-[#6B1F2E] dark:text-[#FF7F6B]">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Quy Tắc Hủy Lịch Animora</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-muted-foreground">
                    • Báo trước <strong>24h</strong>: Miễn phí hoàn tiền 100%.
                    <br />• Hủy <strong>dưới 3h</strong> trước giờ hẹn: Áp dụng
                    khấu trừ <strong>50% phí dịch vụ</strong> để bù đắp ca làm
                    của chuyên viên.
                  </p>
                </div>

                {selectedBooking.prescription && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                    <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">
                      Đơn Kê Đơn & Chỉ Định Lâm Sàng:
                    </span>
                    <p className="text-zinc-700 dark:text-foreground/80 text-[11px]">
                      {selectedBooking.prescription}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="px-6 py-3.5 border-t border-border shrink-0 flex items-center gap-2 text-xs text-zinc-500">
              <img src="/read-only.svg" alt="" className="w-3.5 h-3.5 shrink-0" />
              <span>Chế độ Chỉ Xem — Thao tác điều phối lịch hẹn do Quản lý nghiệp vụ phụ trách</span>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

