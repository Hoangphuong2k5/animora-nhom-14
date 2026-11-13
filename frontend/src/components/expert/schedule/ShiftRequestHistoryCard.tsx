"use client";

import React from "react";
import { StatusBadge } from "@/components/expert/StatusBadge";
import { ShiftRequest } from "@/types/expert.type";

interface ShiftRequestHistoryCardProps {
  requests: ShiftRequest[];
}

export function ShiftRequestHistoryCard({ requests }: ShiftRequestHistoryCardProps) {
  return (
    <div className="rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md p-5 space-y-4">
      <h3 className="font-heading font-extrabold text-sm text-zinc-900 dark:text-foreground">
        Lịch Sử Đăng Ký Ca / Xin Nghỉ Của Bạn
      </h3>

      {requests.length === 0 ? (
        <div className="p-6 text-center text-xs text-zinc-400">
          Bạn chưa gửi đơn đăng ký ca hay xin nghỉ nào.
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-border">
          {requests.map((req) => (
            <div
              key={req.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-900 dark:text-foreground">
                    {req.kind === "leave" ? "Đơn xin nghỉ" : "Đăng ký tăng ca"}
                  </span>
                  <span className="text-zinc-400">• Ngày: {req.date}</span>
                  {req.shift && (
                    <span className="text-zinc-500">
                      (
                      {req.shift === "morning"
                        ? "Sáng"
                        : req.shift === "afternoon"
                        ? "Chiều"
                        : "Tối"}
                      )
                    </span>
                  )}
                </div>
                <p className="text-zinc-500 italic">&ldquo;{req.reason}&rdquo;</p>
                {req.adminNote && (
                  <p className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                    Phản hồi từ Admin: {req.adminNote}
                  </p>
                )}
              </div>

              <StatusBadge status={req.status} size="sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

