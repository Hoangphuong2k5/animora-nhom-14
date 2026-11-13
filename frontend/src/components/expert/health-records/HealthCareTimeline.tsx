"use client";

import React from "react";
import { FileHeart } from "lucide-react";
import { HealthEntry } from "@/types/expert.type";

interface HealthCareTimelineProps {
  entries: HealthEntry[];
}

export function HealthCareTimeline({ entries }: HealthCareTimelineProps) {
  return (
    <div className="rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileHeart className="w-4 h-4 text-[#FF7F6B]" />
          <h3 className="font-heading font-extrabold text-sm text-zinc-900 dark:text-foreground">
            Nhật Ký Chăm Sóc & Tiêm Chủng ({entries.length})
          </h3>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="p-6 text-center text-xs text-zinc-400">
          Chưa có nhật ký tiêm chủng hoặc ghi chú nào.
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const kindBadge = {
              vaccine:
                "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
              deworm:
                "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
              illness:
                "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
              service_note:
                "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300",
            }[entry.kind];

            const kindLabel = {
              vaccine: "Tiêm phòng",
              deworm: "Tẩy giun",
              illness: "Bệnh sử",
              service_note: "Ghi chú spa",
            }[entry.kind];

            return (
              <div
                key={entry.id}
                className="p-3.5 rounded-2xl border border-zinc-200/80 dark:border-border bg-zinc-50/50 dark:bg-muted/50 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${kindBadge}`}
                    >
                      {kindLabel}
                    </span>
                    <span className="font-bold text-zinc-900 dark:text-foreground">
                      {entry.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400">{entry.date}</span>
                </div>

                {entry.detail && (
                  <p className="text-zinc-600 dark:text-foreground/80 leading-relaxed text-[11px]">
                    {entry.detail}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-400">
                  {entry.nextDueDate ? (
                    <span className="font-semibold text-[#6B1F2E] dark:text-[#FF7F6B]">
                      Lịch nhắc tiếp theo: {entry.nextDueDate}
                    </span>
                  ) : (
                    <span />
                  )}
                  {entry.authorName && <span>Ghi nhận bởi: {entry.authorName}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

