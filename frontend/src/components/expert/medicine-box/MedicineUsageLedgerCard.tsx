"use client";

import React, { useState } from "react";
import { History } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  MedicineBoxLogAction,
  MedicineBoxLogEntry,
} from "@/types/expert.type";

const LOG_ACTION_META: Record<
  MedicineBoxLogAction,
  { label: string; cls: string }
> = {
  po_allocation: {
    label: "Nhập kho từ đơn PO (+)",
    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
  request_add: {
    label: "QL duyệt đề xuất bổ sung",
    cls: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  },
  usage: {
    label: "Xuất dùng tại phòng khám (−)",
    cls: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  },
  remove_return: {
    label: "Điều chỉnh hoàn kho (+)",
    cls: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  },
  remove_dispose: {
    label: "Điều chỉnh hao hụt / hết hạn (−)",
    cls: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
  },
  discontinue: {
    label: "Ngừng kinh doanh Shop",
    cls: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  },
};

interface MedicineUsageLedgerCardProps {
  doctorName: string;
  logs: MedicineBoxLogEntry[];
}

export function MedicineUsageLedgerCard({
  doctorName,
  logs,
}: MedicineUsageLedgerCardProps) {
  const [logActionFilter, setLogActionFilter] = useState<
    "all" | MedicineBoxLogAction
  >("all");
  const [showAllLogs, setShowAllLogs] = useState(false);

  const filteredLogs = logs.filter((l) =>
    logActionFilter === "all" ? true : l.action === logActionFilter
  );
  const visibleLogs = showAllLogs ? filteredLogs : filteredLogs.slice(0, 15);

  return (
    <div className="rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="font-heading font-extrabold text-sm text-zinc-900 dark:text-foreground flex items-center gap-2">
          <History className="w-4 h-4 text-[#6B1F2E] dark:text-[#FF7F6B]" />
          Sổ Cái Xuất Dùng Thuốc Của Bác Sĩ ({doctorName})
        </h3>

        <div className="flex items-center gap-2">
          <Select
            value={logActionFilter}
            onValueChange={(val) => {
              if (val !== null) {
                setLogActionFilter(val as "all" | MedicineBoxLogAction);
                setShowAllLogs(false);
              }
            }}
            items={{
              all: "Tất cả giao dịch",
              usage: "Thuốc tôi đã xuất dùng (−)",
              po_allocation: "Nhập kho từ đơn PO (+)",
              request_add: "QL duyệt đề xuất bổ sung",
              discontinue: "Ngừng kinh doanh Shop",
            }}
          >
            <SelectTrigger className="h-8! min-w-[200px] rounded-xl border-zinc-200 dark:border-border bg-white dark:bg-card text-xs font-semibold cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả giao dịch</SelectItem>
              <SelectItem value="usage">Thuốc tôi đã xuất dùng (−)</SelectItem>
              <SelectItem value="po_allocation">
                Nhập kho từ đơn PO (+)
              </SelectItem>
              <SelectItem value="request_add">
                QL duyệt đề xuất bổ sung
              </SelectItem>
              <SelectItem value="discontinue">Ngừng kinh doanh Shop</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="p-6 text-center text-xs text-zinc-400">
          Chưa có bản ghi sổ cái xuất dùng thuốc nào phù hợp bộ lọc.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="divide-y divide-zinc-100 dark:divide-border">
            {visibleLogs.map((log) => {
              const meta = LOG_ACTION_META[log.action] ?? LOG_ACTION_META.usage;
              return (
                <div
                  key={log.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${meta.cls}`}
                      >
                        {meta.label}
                      </span>
                      <span className="font-bold text-zinc-900 dark:text-foreground">
                        {log.medicineName}
                      </span>
                      <span className="text-[10px] font-semibold text-[#6B1F2E] dark:text-[#FF7F6B]">
                        {log.expertId === "warehouse"
                          ? "Kho chung"
                          : `BS: ${log.expertName}`}
                      </span>
                      {log.referenceCode && (
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-muted text-zinc-700 dark:text-zinc-300 font-bold">
                          Mã tham chiếu: {log.referenceCode}
                        </span>
                      )}
                    </div>
                    {log.note && (
                      <p className="text-[11px] text-zinc-500">{log.note}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <span
                      className={`font-extrabold ${
                        log.quantityDelta > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : log.quantityDelta < 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-zinc-500"
                      }`}
                    >
                      {log.quantityDelta > 0
                        ? `+${log.quantityDelta}`
                        : log.quantityDelta}{" "}
                      {log.unit}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      (Tồn kho: {log.beforeShelfStock} → {log.afterShelfStock})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredLogs.length > 15 && (
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAllLogs((v) => !v)}
                className="px-4 py-1.5 rounded-xl border border-zinc-200 dark:border-border text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-muted transition-colors cursor-pointer"
              >
                {showAllLogs
                  ? "Thu gọn danh sách"
                  : `Xem thêm (${filteredLogs.length - 15} dòng nữa)`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

