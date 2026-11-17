"use client";

import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Pill,
} from "lucide-react";
import { Prescription } from "@/types/expert.type";
import { useLivePrescriptionCatalog } from "@/hooks/expert/useLivePrescriptionCatalog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PrescriptionDetailModalProps {
  rx: Prescription;
  onClose: () => void;
}

export function PrescriptionDetailModal({
  rx,
  onClose,
}: PrescriptionDetailModalProps) {
  const catalog = useLivePrescriptionCatalog(rx.expertId);
  return (
    <Dialog
      open={Boolean(rx)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl border border-zinc-200 dark:border-border bg-white dark:bg-background text-zinc-900 dark:text-foreground shadow-2xl text-xs"
      >
        {rx && (
          <>
            <DialogHeader className="px-6 pt-5 pb-3 pr-12 border-b border-zinc-100 dark:border-border shrink-0">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-[#6B1F2E] dark:text-[#FF7F6B]" />
                <div className="space-y-0.5">
                  <DialogTitle className="font-heading font-extrabold text-base text-zinc-900 dark:text-foreground">
                    Chi Tiết Đơn Thuốc {rx.code}
                  </DialogTitle>
                  <DialogDescription className="text-[10px] text-zinc-400">
                    Ngày kê: {rx.issuedAt}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-6 py-4 space-y-4">
              {/* Basic Rx Info */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-card border border-zinc-200 dark:border-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 dark:text-foreground">
                    Chẩn đoán: {rx.diagnosis}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      rx.severity === "mild"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {rx.severity === "mild" ? "Bệnh nhẹ" : "Bệnh nặng"}
                  </span>
                </div>
                {rx.note && (
                  <p className="text-zinc-500 text-[11px] italic">&ldquo;{rx.note}&rdquo;</p>
                )}
                {rx.refillInstruction && (
                  <p className="text-[11px] text-[#6B1F2E] dark:text-[#FF7F6B] font-semibold">
                    Hướng dẫn tái mua: {rx.refillInstruction}
                  </p>
                )}
              </div>

              {/* Medicines List */}
              <div className="space-y-2">
                <span className="font-bold text-zinc-500 text-[10px] uppercase">
                  Thuốc chỉ định ({rx.lines.length})
                </span>
                <div className="space-y-1.5">
                  {rx.lines.map((l, i) => {
                    const med = catalog.find((m) => m.id === l.medicineId);
                    return (
                      <div
                        key={i}
                        className="p-3 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card flex items-start justify-between gap-2"
                      >
                        <div>
                          <div className="font-bold text-zinc-900 dark:text-foreground">
                            {med?.name || l.medicineId}
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            Liều: <strong>{l.dosage}</strong> • Số ngày uống:{" "}
                            <strong>{l.days} ngày</strong>
                          </div>
                          <div className="text-[11px] text-[#6B1F2E] dark:text-[#FF7F6B] mt-0.5 font-medium">
                            {l.instruction}
                          </div>
                        </div>
                        <span className="font-bold text-zinc-800 dark:text-foreground/90 shrink-0">
                          {med ? `${med.price.toLocaleString("vi-VN")}đ / ${med.unit}` : "Theo đơn"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Refill Log History */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-border">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-700 dark:text-foreground/80">
                    Lịch sử mua lại của khách hàng
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Đã dùng {rx.refillsUsed} / {rx.refillsAllowed} lượt
                  </span>
                </div>

                {rx.refillLog.length === 0 ? (
                  <div className="p-3 text-center text-[11px] text-zinc-400 bg-zinc-50 dark:bg-card rounded-xl">
                    Khách hàng chưa thực hiện lần mua lại nào từ đơn thuốc này.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {rx.refillLog.map((log, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-zinc-50 dark:bg-card flex items-center justify-between text-[11px]"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>
                            Đơn hàng: <strong>{log.orderCode}</strong>
                          </span>
                          <span className="text-zinc-400">({log.at})</span>
                        </div>
                        <span className="font-bold text-emerald-600">
                          +{log.amount.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Notice when exhausted */}
                {rx.refillsAllowed > 0 && rx.refillsUsed >= rx.refillsAllowed && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      Đơn thuốc đã hết lượt mua lại. Hệ thống đã tự động gửi thông báo nhắc khách
                      hàng đặt lịch tái khám mới.
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 border-t border-zinc-100 dark:border-border shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl font-bold bg-zinc-100 dark:bg-muted hover:bg-zinc-200 dark:hover:bg-muted text-zinc-800 dark:text-foreground/90 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

