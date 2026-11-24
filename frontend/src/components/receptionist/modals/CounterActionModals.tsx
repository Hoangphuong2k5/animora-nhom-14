"use client";

import React from "react";
import {
  ArrowRightLeft,
  CheckCircle2,
  CreditCard,
  FileText,
  Printer,
  Scale,
  Undo2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTimeDdMmYyyy } from "@/utils/dateFormat";
import { getWeightRangeLabel } from "@/data/serviceBookingData";
import type { ExtendedBooking } from "@/components/shared/operations/bookings/bookingsTypesAndData";
import type {
  ServiceInvoiceRecord,
  WeightPriceAdjustmentQuote,
} from "@/data/receptionistOpsData";

export interface CounterActionModalsProps {
  // 1. Hoàn tác Không đến
  undoNoShowTarget: ExtendedBooking | null;
  undoNoShowReason: string;
  onChangeUndoReason: (val: string) => void;
  onCloseUndoNoShow: () => void;
  onConfirmUndoNoShow: () => void;

  // 2. Điều chỉnh giá theo cân nặng thực tế
  weightModalTarget: ExtendedBooking | null;
  actualWeightInput: string;
  weightSource: "vet_measured" | "counter_measured";
  weightDecisionReason: string;
  currentWeightQuote: WeightPriceAdjustmentQuote | null;
  onChangeActualWeight: (val: string) => void;
  onChangeWeightSource: (val: "vet_measured" | "counter_measured") => void;
  onChangeWeightReason: (val: string) => void;
  onCloseWeightModal: () => void;
  onApplyWeightDecision: (customerAccepted: boolean) => void;

  // 3. Thu tiền ("Đã thu") & Xuất hóa đơn
  collectTarget: ExtendedBooking | null;
  collectMethod: "cash" | "bank_transfer";
  collectNote: string;
  onChangeCollectMethod: (val: "cash" | "bank_transfer") => void;
  onChangeCollectNote: (val: string) => void;
  onCloseCollect: () => void;
  onConfirmCollect: () => void;

  // 4. Hoàn / Bù tiền thủ công
  manualLedgerTarget: ExtendedBooking | null;
  manualKind: "refund" | "surcharge";
  manualAmount: string;
  manualMethod: "cash" | "vnpay" | "payos";
  manualReason: string;
  onChangeManualKind: (val: "refund" | "surcharge") => void;
  onChangeManualAmount: (val: string) => void;
  onChangeManualMethod: (val: "cash" | "vnpay" | "payos") => void;
  onChangeManualReason: (val: string) => void;
  onCloseManualLedger: () => void;
  onConfirmManualLedger: () => void;

  // 5. Xem / In Hóa đơn
  previewInvoice: ServiceInvoiceRecord | null;
  onCloseInvoice: () => void;
}

export function CounterActionModals(props: CounterActionModalsProps) {
  return (
    <>
      {/* Modal 1: Hoàn tác Không đến */}
      <Dialog
        open={Boolean(props.undoNoShowTarget)}
        onOpenChange={(open) => {
          if (!open) props.onCloseUndoNoShow();
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Undo2 className="w-5 h-5 text-amber-500" />
              <span>Hoàn Tác Đánh Dấu &quot;Không Đến&quot;</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Lễ tân cần nhập lý do bắt buộc để sửa trường hợp đánh dấu oan. Hệ
              thống sẽ kiểm tra lại slot, trừ lại Violation cho khách và ghi Audit Log.
            </DialogDescription>
          </DialogHeader>

          {props.undoNoShowTarget && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-muted border border-zinc-200 dark:border-border">
                <div className="font-bold">
                  Đơn: {props.undoNoShowTarget.code} • Khách: {props.undoNoShowTarget.fullName} (
                  {props.undoNoShowTarget.phone})
                </div>
                <div className="text-zinc-500 mt-0.5">
                  Dịch vụ: {props.undoNoShowTarget.service} • Giờ hẹn:{" "}
                  {props.undoNoShowTarget.timeSlot}
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">
                  Lý do hoàn tác &quot;Không đến&quot; (Bắt buộc *):
                </label>
                <textarea
                  rows={3}
                  value={props.undoNoShowReason}
                  onChange={(e) => props.onChangeUndoReason(e.target.value)}
                  placeholder="Ví dụ: Khách đã đến đúng giờ nhưng ngồi chờ ở khu vực sảnh phụ..."
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-muted text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={props.onCloseUndoNoShow}
              className="px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={props.onConfirmUndoNoShow}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer"
            >
              Xác nhận hoàn tác &amp; Check-in
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Điều chỉnh giá theo cân nặng thực tế */}
      <Dialog
        open={Boolean(props.weightModalTarget)}
        onOpenChange={(open) => {
          if (!open) props.onCloseWeightModal();
        }}
      >
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Scale className="w-5 h-5 text-purple-600" />
              <span>Điều Chỉnh Giá Theo Cân Nặng Thực Tế</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Hệ thống tự động tính giá mới theo bảng giá và hạng cân. Lễ tân chỉ xác nhận theo ý
              kiến khách hàng, tuyệt đối không nhập giá tay.
            </DialogDescription>
          </DialogHeader>

          {props.weightModalTarget && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Nguồn số cân thực tế:</label>
                  <select
                    value={props.weightSource}
                    onChange={(e) =>
                      props.onChangeWeightSource(
                        e.target.value as "vet_measured" | "counter_measured"
                      )
                    }
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-xs font-semibold"
                  >
                    <option value="vet_measured">Bác sĩ cân &amp; cập nhật</option>
                    <option value="counter_measured">
                      Cân thực tế tại quầy (Ca Spa/Tắm không có BS)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Cân nặng thực tế (kg):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={props.actualWeightInput}
                    onChange={(e) => props.onChangeActualWeight(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-muted text-xs font-extrabold"
                  />
                </div>
              </div>

              {props.currentWeightQuote && (
                <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/25 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Dịch vụ:</span>
                    <span className="font-bold">{props.currentWeightQuote.serviceName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Cân nặng &amp; Hạng cân:</span>
                    <span className="font-bold">
                      {props.currentWeightQuote.oldWeightKg}kg (
                      {getWeightRangeLabel(props.currentWeightQuote.oldWeightRange, "vi")}) &rarr;{" "}
                      <strong className="text-purple-700 dark:text-purple-300">
                        {props.currentWeightQuote.newWeightKg}kg (
                        {getWeightRangeLabel(props.currentWeightQuote.newWeightRange, "vi")})
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-purple-500/20">
                    <span className="text-zinc-500">Giá hệ thống tự tính (Read-only):</span>
                    <span className="text-sm font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                      {props.currentWeightQuote.oldPrice.toLocaleString("vi-VN")}đ &rarr;{" "}
                      {props.currentWeightQuote.newPrice.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-card border border-zinc-200 dark:border-border font-semibold text-zinc-700 dark:text-foreground">
                    {props.currentWeightQuote.financialSummary}
                  </div>
                </div>
              )}

              <div>
                <label className="font-bold block mb-1">Ghi chú / Lý do ghi Audit Log:</label>
                <input
                  type="text"
                  value={props.weightDecisionReason}
                  onChange={(e) => props.onChangeWeightReason(e.target.value)}
                  placeholder="Ghi chú xác nhận với chủ thú cưng..."
                  className="w-full h-9 px-3 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-xs"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => props.onApplyWeightDecision(false)}
              className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/25 font-bold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>Khách không đồng ý — Trả bé (0đ, 0 Violation)</span>
            </button>
            <button
              type="button"
              onClick={() => props.onApplyWeightDecision(true)}
              className="px-4 py-2.5 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Khách đồng ý giá mới</span>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal 3: Thu tiền ("Đã thu") & Xuất hóa đơn */}
      <Dialog
        open={Boolean(props.collectTarget)}
        onOpenChange={(open) => {
          if (!open) props.onCloseCollect();
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span>Xác Nhận &quot;Đã Thu&quot; &amp; Xuất Hóa Đơn</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Thu tiền dịch vụ tại quầy cho khách và xuất phiếu hóa đơn dịch vụ chính thức.
            </DialogDescription>
          </DialogHeader>

          {props.collectTarget && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-muted border border-zinc-200 dark:border-border space-y-1">
                <div className="font-bold text-sm">
                  {props.collectTarget.fullName} • {props.collectTarget.phone}
                </div>
                <div className="text-zinc-500">
                  Dịch vụ: {props.collectTarget.service} (Bé{" "}
                  {props.collectTarget.petName || "cưng"})
                </div>
                <div className="text-base font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B] pt-1">
                  Số tiền thu:{" "}
                  {(
                    props.collectTarget.adjustedPrice ??
                    props.collectTarget.estimatedPrice ??
                    props.collectTarget.price ??
                    350000
                  ).toLocaleString("vi-VN")}
                  đ
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Hình thức thu tại quầy:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "cash" as const, label: "Tiền mặt tại quầy" },
                    { id: "bank_transfer" as const, label: "Chuyển khoản / QR" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => props.onChangeCollectMethod(m.id)}
                      className={`py-2.5 px-3 rounded-xl border font-bold text-xs cursor-pointer ${
                        props.collectMethod === m.id
                          ? "bg-[#6B1F2E] text-white border-[#6B1F2E]"
                          : "bg-white dark:bg-muted border-zinc-200 dark:border-border"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Ghi chú hóa đơn (Tùy chọn):</label>
                <input
                  type="text"
                  value={props.collectNote}
                  onChange={(e) => props.onChangeCollectNote(e.target.value)}
                  placeholder="Ví dụ: Khách thanh toán đủ tại quầy..."
                  className="w-full h-9 px-3 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-muted text-xs"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={props.onCloseCollect}
              className="px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={props.onConfirmCollect}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
            >
              Xác nhận Đã thu &amp; Xuất hóa đơn
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal 4: Ghi nhận Hoàn / Bù tiền thủ công */}
      <Dialog
        open={Boolean(props.manualLedgerTarget)}
        onOpenChange={(open) => {
          if (!open) props.onCloseManualLedger();
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-[#FF7F6B]" />
              <span>Ghi Nhận Hoàn / Bù Tiền Thủ Công</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Ghi nhận số tiền hoàn trả hoặc thu bù thủ công (Tiền mặt, VNPay, PayOS) kèm người làm
              và lý do vào Audit Log.
            </DialogDescription>
          </DialogHeader>

          {props.manualLedgerTarget && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => props.onChangeManualKind("refund")}
                  className={`py-2 px-3 rounded-xl border font-bold cursor-pointer ${
                    props.manualKind === "refund"
                      ? "bg-rose-600 text-white border-rose-600"
                      : "bg-zinc-50 dark:bg-muted"
                  }`}
                >
                  Hoàn tiền cho khách
                </button>
                <button
                  type="button"
                  onClick={() => props.onChangeManualKind("surcharge")}
                  className={`py-2 px-3 rounded-xl border font-bold cursor-pointer ${
                    props.manualKind === "surcharge"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-zinc-50 dark:bg-muted"
                  }`}
                >
                  Thu bù phần chênh
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold block mb-1">Số tiền (VNĐ *):</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={props.manualAmount}
                    onChange={(e) => props.onChangeManualAmount(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-muted font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Kênh thực hiện:</label>
                  <select
                    value={props.manualMethod}
                    onChange={(e) =>
                      props.onChangeManualMethod(
                        e.target.value as "cash" | "vnpay" | "payos"
                      )
                    }
                    className="w-full h-9 px-3 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-muted font-semibold"
                  >
                    <option value="cash">Tiền mặt tại quầy</option>
                    <option value="vnpay">VNPay</option>
                    <option value="payos">PayOS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Lý do hoàn / bù tiền (Bắt buộc *):</label>
                <textarea
                  rows={2}
                  value={props.manualReason}
                  onChange={(e) => props.onChangeManualReason(e.target.value)}
                  placeholder="Ví dụ: Hoàn chênh lệch do cân nặng thực tế thấp hơn lúc đặt trả trước..."
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-muted"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={props.onCloseManualLedger}
              className="px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={props.onConfirmManualLedger}
              className="px-4 py-2 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white text-xs font-bold cursor-pointer"
            >
              Lưu phiếu &amp; Ghi Audit Log
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal 5: Xem & In Hóa đơn dịch vụ */}
      <Dialog
        open={Boolean(props.previewInvoice)}
        onOpenChange={(open) => {
          if (!open) props.onCloseInvoice();
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#6B1F2E]" />
              <span>Hóa Đơn Dịch Vụ Animora</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Phiếu xác nhận đã thu tiền và hoàn tất thanh toán tại quầy Lễ tân.
            </DialogDescription>
          </DialogHeader>

          {props.previewInvoice && (
            <div className="p-4 rounded-2xl border border-dashed border-zinc-300 dark:border-border bg-zinc-50/70 dark:bg-muted/40 space-y-2.5 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="font-mono font-bold text-[#6B1F2E] dark:text-[#FF7F6B]">
                  {props.previewInvoice.invoiceCode}
                </span>
                <span className="text-zinc-500">
                  {formatDateTimeDdMmYyyy(props.previewInvoice.issuedAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Mã lịch hẹn:</span>
                <span className="font-bold">{props.previewInvoice.bookingCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Khách hàng:</span>
                <span className="font-bold">
                  {props.previewInvoice.customerName} ({props.previewInvoice.customerPhone})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Thú cưng:</span>
                <span className="font-bold">
                  {props.previewInvoice.petName} ({props.previewInvoice.petSpecies})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Dịch vụ:</span>
                <span className="font-bold">{props.previewInvoice.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Lễ tân thu ngân:</span>
                <span className="font-bold">{props.previewInvoice.issuedBy}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-extrabold text-sm text-[#6B1F2E] dark:text-[#FF7F6B]">
                <span>TỔNG ĐÃ THU:</span>
                <span>{props.previewInvoice.finalAmount.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={props.onCloseInvoice}
              className="px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={() => {
                toast.success(
                  `Đã gửi lệnh in hóa đơn ${props.previewInvoice?.invoiceCode}!`
                );
                props.onCloseInvoice();
              }}
              className="px-4 py-2 rounded-xl bg-[#6B1F2E] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In hóa đơn (PDF)</span>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
