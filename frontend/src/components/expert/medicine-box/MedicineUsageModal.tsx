"use client";

import React from "react";
import { AlertTriangle, Send, TrendingDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type {
  ExpertAppointment,
  ExpertPet,
  MedicineBoxItem,
} from "@/types/expert.type";

interface MedicineUsageModalProps {
  usageTarget: MedicineBoxItem | null;
  usageQty: number;
  onChangeQty: (qty: number) => void;
  usageRefCode: string;
  onChangeRefCode: (val: string) => void;
  usageNote: string;
  onChangeNote: (val: string) => void;
  activeAppointments: ExpertAppointment[];
  allPets: ExpertPet[];
  onClose: () => void;
  onConfirm: (e: React.FormEvent) => void;
  onReportOutOfStock: () => void;
}

export function MedicineUsageModal({
  usageTarget,
  usageQty,
  onChangeQty,
  usageRefCode,
  onChangeRefCode,
  usageNote,
  onChangeNote,
  activeAppointments,
  allPets,
  onClose,
  onConfirm,
  onReportOutOfStock,
}: MedicineUsageModalProps) {
  const isNegativeStockBlocked =
    usageTarget !== null && Math.trunc(usageQty) > usageTarget.warehouseStock;

  return (
    <Dialog
      open={Boolean(usageTarget)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-md rounded-2xl border border-zinc-200 dark:border-border bg-white dark:bg-background text-zinc-900 dark:text-foreground p-6 gap-4 shadow-2xl"
      >
        <DialogHeader className="pb-2 border-b border-zinc-100 dark:border-border">
          <DialogTitle className="font-heading font-extrabold text-base flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-[#6B1F2E] dark:text-[#FF7F6B]" />
            Ghi Nhận Xuất Dùng Thuốc Tại Phòng Khám
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            {usageTarget?.name} — Tồn kho chung hiện tại:{" "}
            <strong
              className={
                (usageTarget?.warehouseStock ?? 0) <= 0
                  ? "text-rose-600"
                  : "text-emerald-600"
              }
            >
              {usageTarget?.warehouseStock} {usageTarget?.unit}
            </strong>
          </DialogDescription>
        </DialogHeader>

        {usageTarget && (
          <form onSubmit={onConfirm} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-foreground/80">
                Số lượng xuất dùng tại phòng khám ({usageTarget.unit}) *
              </label>
              <input
                type="number"
                min={1}
                step={1}
                required
                value={usageQty}
                onChange={(e) =>
                  onChangeQty(
                    Math.max(1, Math.trunc(Number(e.target.value) || 1))
                  )
                }
                className={`w-full h-10 px-3 rounded-xl border text-xs font-extrabold ${
                  isNegativeStockBlocked
                    ? "border-rose-500 bg-rose-50/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300"
                    : "border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card"
                }`}
              />
            </div>

            {isNegativeStockBlocked && (
              <div className="p-3 rounded-2xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 space-y-2">
                <div className="flex items-start gap-2 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>
                    Chặn xuất âm: Số lượng cần xuất ({usageQty}{" "}
                    {usageTarget.unit}) vượt quá tồn kho chung hiện tại (
                    {usageTarget.warehouseStock} {usageTarget.unit})!
                  </span>
                </div>
                <p className="text-[11px] text-rose-700 dark:text-rose-300 leading-snug">
                  Theo quy tắc sổ cái kho chung v1.4, hệ thống khóa xuất âm. Bạn
                  có thể bấm nút bên dưới để báo ngay cho Quản lý bổ sung kho.
                </p>
                <button
                  type="button"
                  onClick={onReportOutOfStock}
                  className="w-full py-2 px-3 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Báo Quản lý bổ sung kho ngay</span>
                </button>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-bold text-zinc-700 dark:text-foreground/80">
                Mã lịch hẹn / Ca khám (Bắt buộc ghi kèm vào sổ cái) *
              </label>
              <input
                type="text"
                required
                value={usageRefCode}
                onChange={(e) => onChangeRefCode(e.target.value)}
                placeholder="VD: ANM-2411-01"
                className="w-full h-9.5 px-3 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-xs font-bold"
              />
              {activeAppointments.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] text-zinc-400">
                    Chọn nhanh ca khám:
                  </span>
                  {activeAppointments.slice(0, 4).map((appt) => {
                    const pet = allPets.find((p) => p.id === appt.petId);
                    return (
                      <button
                        key={appt.id}
                        type="button"
                        onClick={() => onChangeRefCode(appt.code)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border cursor-pointer ${
                          usageRefCode === appt.code
                            ? "bg-[#6B1F2E] text-white border-[#6B1F2E]"
                            : "bg-zinc-100 dark:bg-muted border-zinc-200 dark:border-border text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {appt.code} {pet ? `(${pet.name})` : ""}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-foreground/80">
                Ghi chú xuất dùng
              </label>
              <Textarea
                rows={2}
                value={usageNote}
                onChange={(e) => onChangeNote(e.target.value)}
                placeholder="VD: Tiêm phòng / Thuốc dùng trực tiếp tại phòng khám (tính vào giá dịch vụ)..."
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-muted cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isNegativeStockBlocked}
                className="px-5 py-2 rounded-xl font-bold text-white bg-[#6B1F2E] hover:bg-[#521723] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Xác nhận xuất dùng
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

