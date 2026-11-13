"use client";

import React, { useState } from "react";
import { AlertCircle, Send } from "lucide-react";
import { ExpertReview } from "@/types/expert.type";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ReviewReportModalProps {
  review: ExpertReview | null;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export function ReviewReportModal({
  review,
  onClose,
  onSubmit,
}: ReviewReportModalProps) {
  const [reportReason, setReportReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    onSubmit(reportReason);
    setReportReason("");
  };

  return (
    <Dialog
      open={Boolean(review)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-md max-h-[90vh] overflow-y-auto scrollbar-thin rounded-2xl border border-zinc-200 dark:border-border bg-white dark:bg-background text-zinc-900 dark:text-foreground p-6 gap-4 shadow-2xl text-xs"
      >
        {review && (
          <>
            <DialogHeader className="pb-2 pr-8 border-b border-zinc-100 dark:border-border">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <DialogTitle className="font-heading font-extrabold text-sm text-zinc-900 dark:text-foreground">
                  Báo Cáo Nhận Xét Sai Phạm
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-zinc-500 pt-1">
                Chuyên viên không có quyền trực tiếp xóa đánh giá của khách hàng. Yêu cầu của bạn
                sẽ được gửi tới Admin để kiểm duyệt tính trung thực.
              </DialogDescription>
            </DialogHeader>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-card italic border border-zinc-200 dark:border-border text-zinc-600 dark:text-foreground/80">
              &ldquo;{review.comment}&rdquo;
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-foreground/80">
                  Lý do báo cáo vi phạm *
                </label>
                <Textarea
                  required
                  rows={3}
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Ngôn từ xúc phạm, sai sự thật, spam hoặc nhầm lẫn dịch vụ..."
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card text-zinc-900 dark:text-foreground text-xs"
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
                  className="px-4 py-2 rounded-xl font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi báo cáo cho Admin</span>
                </button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

