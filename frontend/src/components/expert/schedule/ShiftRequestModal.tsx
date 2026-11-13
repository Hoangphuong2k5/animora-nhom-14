"use client";

import React, { useState } from "react";
import { ShiftCode } from "@/types/expert.type";
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
  morning: "Ca sáng (08:00 - 12:00)",
  afternoon: "Ca chiều (13:30 - 17:30)",
  evening: "Ca tối (18:00 - 21:00)",
};

interface ShiftRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    kind: "shift" | "leave";
    date: string;
    shift?: ShiftCode;
    reason: string;
  }) => void;
  initialDate?: string;
}

export function ShiftRequestModal({
  isOpen,
  onClose,
  onSubmit,
  initialDate = "2026-11-04",
}: ShiftRequestModalProps) {
  const [reqKind, setReqKind] = useState<"shift" | "leave">("shift");
  const [reqDate, setReqDate] = useState<string>(initialDate);
  const [reqShift, setReqShift] = useState<ShiftCode>("morning");
  const [reqReason, setReqReason] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqReason.trim()) return;

    onSubmit({
      kind: reqKind,
      date: reqDate,
      shift: reqKind === "shift" ? reqShift : undefined,
      reason: reqReason,
    });
    setReqReason("");
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-md max-h-[90vh] overflow-y-auto scrollbar-thin rounded-2xl border border-zinc-200 dark:border-border bg-white dark:bg-background text-zinc-900 dark:text-foreground p-6 gap-4 shadow-2xl"
      >
        <DialogHeader className="pb-3 pr-8 border-b border-zinc-100 dark:border-border">
          <DialogTitle className="font-heading font-extrabold text-base text-zinc-900 dark:text-foreground">
            Gửi Đơn Đăng Ký Ca / Xin Nghỉ
          </DialogTitle>
          <DialogDescription className="sr-only">
            Đăng ký tăng ca hoặc xin nghỉ phép gửi Admin phê duyệt
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setReqKind("shift")}
              className={`py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                reqKind === "shift"
                  ? "bg-[#6B1F2E] text-white border-transparent"
                  : "border-zinc-200 dark:border-border text-zinc-600"
              }`}
            >
              Đăng ký tăng ca
            </button>
            <button
              type="button"
              onClick={() => setReqKind("leave")}
              className={`py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                reqKind === "leave"
                  ? "bg-rose-600 text-white border-transparent"
                  : "border-zinc-200 dark:border-border text-zinc-600"
              }`}
            >
              Xin nghỉ phép
            </button>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-zinc-700 dark:text-foreground/80">Chọn ngày *</label>
            <input
              type="date"
              required
              value={reqDate}
              onChange={(e) => setReqDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-zinc-900 dark:text-foreground"
            />
          </div>

          {reqKind === "shift" && (
            <div className="space-y-1">
              <label className="font-bold text-zinc-700 dark:text-foreground/80">
                Khung ca làm việc *
              </label>
              <Select
                value={reqShift}
                onValueChange={(val) => {
                  if (val !== null) setReqShift(val as ShiftCode);
                }}
                items={SHIFT_ITEMS}
              >
                <SelectTrigger className="w-full h-10! px-3 rounded-xl border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-xs font-bold text-zinc-900 dark:text-foreground cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Ca sáng (08:00 - 12:00)</SelectItem>
                  <SelectItem value="afternoon">Ca chiều (13:30 - 17:30)</SelectItem>
                  <SelectItem value="evening">Ca tối (18:00 - 21:00)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-bold text-zinc-700 dark:text-foreground/80">Lý do *</label>
            <Textarea
              required
              rows={3}
              value={reqReason}
              onChange={(e) => setReqReason(e.target.value)}
              placeholder="Nhập lý do cụ thể gửi Admin phê duyệt..."
              className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-zinc-900 dark:text-foreground text-xs"
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
              className="px-5 py-2 rounded-xl font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] cursor-pointer"
            >
              Gửi yêu cầu
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

