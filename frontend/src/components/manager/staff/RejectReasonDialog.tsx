"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { inputClass, primaryBtn } from "./useStaffOps";

interface RejectReasonDialogProps {
  open: boolean;
  title: string;
  description?: string;
  defaultReason?: string;
  presetReasons?: string[];
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

/** Hộp thoại nhập lý do từ chối dùng chung cho các nghiệp vụ duyệt của Manager. */
export function RejectReasonDialog({
  open,
  title,
  description,
  defaultReason = "",
  presetReasons = [],
  onCancel,
  onConfirm,
}: RejectReasonDialogProps) {
  const [reason, setReason] = useState(defaultReason);

  useEffect(() => {
    if (open) setReason(defaultReason);
  }, [open, defaultReason]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-lg rounded-2xl bg-popover text-popover-foreground border border-border p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-xs text-muted-foreground">{description}</DialogDescription>
          )}
        </DialogHeader>
        {presetReasons.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-zinc-400">
              Chọn nhanh lý do từ chối:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {presetReasons.map((preset) => {
                const isSelected = reason.trim() === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setReason(preset)}
                    className={`text-left px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-colors cursor-pointer ${
                      isSelected
                        ? "border-[#6B1F2E] bg-[#6B1F2E]/10 text-[#6B1F2E] dark:border-[#FF7F6B] dark:bg-[#FF7F6B]/15 dark:text-[#FF7F6B]"
                        : "border-zinc-200 dark:border-border bg-zinc-50/70 dark:bg-muted/40 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-muted"
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Nhập lý do từ chối..."
          data-testid="reject-reason-input"
          className={inputClass}
        />
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-border text-xs font-bold cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={!reason.trim()}
            data-testid="reject-reason-confirm"
            onClick={() => onConfirm(reason.trim())}
            className={primaryBtn}
          >
            Xác nhận từ chối
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

