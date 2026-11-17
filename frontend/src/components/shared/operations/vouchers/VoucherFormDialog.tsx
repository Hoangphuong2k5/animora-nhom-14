"use client";

import React from "react";
import { Calendar, Ticket } from "lucide-react";
import { formatDateDdMmYyyy } from "@/utils/dateFormat";
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

export interface VoucherFormState {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number;
  applicableTo: string;
  startDate: string;
  endDate: string;
  maxUsage: number;
}

interface VoucherFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  todayIso: string;
  form: VoucherFormState;
  setForm: React.Dispatch<React.SetStateAction<VoucherFormState>>;
  onSubmit: (e: React.FormEvent) => void;
}

/** Modal form for creating promotional vouchers in Manager portal. */
export function VoucherFormDialog({
  open,
  onOpenChange,
  todayIso,
  form,
  setForm,
  onSubmit,
}: VoucherFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl"
      >
        <DialogHeader className="pr-8">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#FF7F6B]" />
            Tạo Mã Voucher Khuyến Mãi Mới
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Thiết lập mã giảm giá, hạn mức đơn hàng tối thiểu và thời hạn hiệu lực.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-zinc-500 block mb-1">Mã Code:</label>
            <input
              type="text"
              required
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="ANIMORA_XMAS..."
              className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted font-mono font-bold uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-zinc-500 block mb-1">Loại giảm:</label>
              <Select
                value={form.discountType}
                onValueChange={(val) => {
                  if (val !== null) {
                    setForm((f) => ({ ...f, discountType: val as "percent" | "fixed" }));
                  }
                }}
                items={{
                  percent: "Giảm theo %",
                  fixed: "Giảm số tiền cố định (VNĐ)",
                }}
              >
                <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-medium px-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Giảm theo %</SelectItem>
                  <SelectItem value="fixed">Giảm số tiền cố định (VNĐ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="font-semibold text-zinc-500 block mb-1">Mức giảm:</label>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) =>
                  setForm((f) => ({ ...f, discountValue: Number(e.target.value) }))
                }
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-zinc-500 block mb-1">Đơn tối thiểu:</label>
              <input
                type="number"
                value={form.minOrderValue}
                onChange={(e) =>
                  setForm((f) => ({ ...f, minOrderValue: Number(e.target.value) }))
                }
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
              />
            </div>
            <div>
              <label className="font-semibold text-zinc-500 block mb-1">Lượt dùng tối đa:</label>
              <input
                type="number"
                value={form.maxUsage}
                onChange={(e) => setForm((f) => ({ ...f, maxUsage: Number(e.target.value) }))}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-zinc-500 block mb-1">Phạm vi áp dụng:</label>
            <input
              type="text"
              value={form.applicableTo}
              onChange={(e) => setForm((f) => ({ ...f, applicableTo: e.target.value }))}
              placeholder="Tất cả dịch vụ / Thức ăn thú cưng..."
              className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-zinc-500 block mb-1">Từ ngày:</label>
              <div className="relative flex items-center justify-between w-full p-2.5 px-3 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted cursor-pointer hover:border-[#FF7F6B]/60 transition-colors">
                <span className="text-xs font-medium text-zinc-900 dark:text-foreground">
                  {form.startDate ? formatDateDdMmYyyy(form.startDate) : "Chọn ngày"}
                </span>
                <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
                <input
                  type="date"
                  min={todayIso || undefined}
                  value={form.startDate}
                  onChange={(e) => {
                    const nextStart = e.target.value;
                    setForm((f) => ({
                      ...f,
                      startDate: nextStart,
                      endDate: f.endDate && nextStart > f.endDate ? nextStart : f.endDate,
                    }));
                  }}
                  aria-label="Từ ngày"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              </div>
            </div>
            <div>
              <label className="font-semibold text-zinc-500 block mb-1">Đến ngày:</label>
              <div className="relative flex items-center justify-between w-full p-2.5 px-3 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted cursor-pointer hover:border-[#FF7F6B]/60 transition-colors">
                <span className="text-xs font-medium text-zinc-900 dark:text-foreground">
                  {form.endDate ? formatDateDdMmYyyy(form.endDate) : "Chọn ngày"}
                </span>
                <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
                <input
                  type="date"
                  min={form.startDate || undefined}
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  aria-label="Đến ngày"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-3 py-1.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-muted font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold cursor-pointer"
            >
              Phát hành Voucher
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
