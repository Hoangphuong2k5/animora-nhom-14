"use client";

import React from "react";
import { Package } from "lucide-react";
import { StatusBadge } from "@/components/expert/StatusBadge";
import type { MedicineBoxRequest } from "@/types/expert.type";

interface MedicineRequestHistoryCardProps {
  expertId: string;
  requests: MedicineBoxRequest[];
  onCancelRequest: (reqId: string) => void;
}

export function MedicineRequestHistoryCard({
  expertId,
  requests,
  onCancelRequest,
}: MedicineRequestHistoryCardProps) {
  return (
    <div className="rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md p-5 space-y-4">
      <h3 className="font-heading font-extrabold text-sm text-zinc-900 dark:text-foreground flex items-center gap-2">
        <Package className="w-4 h-4 text-[#6B1F2E] dark:text-[#FF7F6B]" />
        Lịch Sử Yêu Cầu Bổ Sung &amp; Đề Xuất Của Bạn Gửi Quản Lý
      </h3>

      {requests.length === 0 ? (
        <div className="p-6 text-center text-xs text-zinc-400">
          Bạn chưa gửi yêu cầu nào tới Quản lý.
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-border">
          {requests.map((req) => (
            <div
              key={req.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      req.type === "add"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                    }`}
                  >
                    {req.type === "add"
                      ? req.isNewMedicineProposal
                        ? "Đề xuất thuốc mới"
                        : "Yêu cầu bổ sung kho"
                      : "Đề xuất ngừng kinh doanh"}
                  </span>
                  <span className="font-bold text-zinc-900 dark:text-foreground">
                    {req.medicineName}
                  </span>
                  {req.type !== "discontinue" && (
                    <span className="font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                      • {req.quantity} {req.unit}
                    </span>
                  )}
                </div>
                <p className="text-zinc-500 italic">&ldquo;{req.reason}&rdquo;</p>
                {req.adminNote && (
                  <p className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                    Phản hồi Quản lý: {req.adminNote}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <StatusBadge status={req.status} size="sm" />
                {req.status === "pending" && req.expertId === expertId && (
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
          ))}
        </div>
      )}
    </div>
  );
}

