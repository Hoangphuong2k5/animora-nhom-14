"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/expert/StatusBadge";
import { ShiftRequest } from "@/types/expert.type";
import { canCancelShiftRequest, getLeaveRequestTitle } from "@/utils/expertPolicy";
import { formatDateDdMmYyyy } from "@/utils/dateFormat";

interface ShiftRequestHistoryCardProps {
  requests: ShiftRequest[];
  onCancelRequest?: (id: string) => void;
}

export function ShiftRequestHistoryCard({
  requests,
  onCancelRequest,
}: ShiftRequestHistoryCardProps) {
  return (
    <div className="rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md p-5 space-y-4">
      <h3 className="font-heading font-extrabold text-sm text-zinc-900 dark:text-foreground">
        Lịch Sử Đơn Xin Nghỉ Phép &amp; Nghỉ Đột Xuất
      </h3>

      {requests.length === 0 ? (
        <div className="p-6 text-center text-xs text-zinc-400">
          Bạn chưa gửi yêu cầu nào.
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-border">
          {requests.map((req) => {
            const cancellable = canCancelShiftRequest(req);

            return (
              <div
                key={req.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-zinc-900 dark:text-foreground">
                      {getLeaveRequestTitle(req.leaveType)}
                    </span>
                    <span className="text-zinc-400">• Ngày: {formatDateDdMmYyyy(req.date)}</span>
                    {!req.shift ? (
                      <span className="text-zinc-500 font-semibold">(Cả ngày)</span>
                    ) : (
                      <span className="text-zinc-500">
                        ({req.shift === "morning" ? "Sáng" : "Chiều"})
                      </span>
                    )}
                  </div>

                  <p className="text-zinc-500 italic">&ldquo;{req.reason}&rdquo;</p>

                  {req.policyWarnings && req.policyWarnings.length > 0 && (
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300 space-y-0.5">
                      {req.policyWarnings.map((w, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {req.adminNote && (
                    <p className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                      Phản hồi từ Quản lý nghiệp vụ: {req.adminNote}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={req.status} size="sm" />
                  {cancellable && onCancelRequest && (
                    <button
                      type="button"
                      onClick={() => onCancelRequest(req.id)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-zinc-200 dark:border-border text-zinc-600 dark:text-zinc-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    >
                      Hủy đơn
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
