"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  ShieldAlert,
  Users,
} from "lucide-react";
import {
  EXPERT_IDS,
  EXPERT_SYNC_EVENT,
  readExpertStore,
} from "@/utils/clinicalSync";
import { evaluateMonthlyLeaveQuota } from "@/utils/expertPolicy";
import type { ExpertStoreState } from "@/types/expert.type";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { panelCard, thClass } from "./useStaffOps";

/**
 * Mục 9 – Quy tắc nghỉ phép của nhân sự (Bác sĩ & NV Chăm sóc):
 * - Mỗi chuyên viên được nghỉ tối đa 4 ngày mỗi tháng làm việc, không dồn sang tháng sau.
 * - Reset vào ngày 01 mỗi tháng.
 * - Tính cả nghỉ luân phiên (~1 ngày/tuần), nghỉ ốm và nghỉ không lương.
 * - Khi vượt 4 ngày: hệ thống gắn cờ cảnh báo vượt hạn mức / nghỉ không lương.
 */
export function LeaveQuotaPanel() {
  const [stores, setStores] = useState<Record<string, ExpertStoreState>>(() => {
    if (typeof window === "undefined") return {};
    const next: Record<string, ExpertStoreState> = {};
    for (const id of EXPERT_IDS) {
      next[id] = readExpertStore(id);
    }
    return next;
  });
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const currentMonthStr = useMemo(() => {
    const d = new Date();
    return `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
  }, []);

  const refreshStores = useCallback(() => {
    const next: Record<string, ExpertStoreState> = {};
    for (const id of EXPERT_IDS) {
      next[id] = readExpertStore(id);
    }
    setStores(next);
  }, []);

  useEffect(() => {
    window.addEventListener(EXPERT_SYNC_EVENT, refreshStores);
    return () => window.removeEventListener(EXPERT_SYNC_EVENT, refreshStores);
  }, [refreshStores]);

  const specialistQuotas = useMemo(() => {
    return EXPERT_IDS.map((id) => {
      const st = stores[id] || readExpertStore(id);
      const quota = evaluateMonthlyLeaveQuota(
        st.shiftRequests,
        st.shifts,
        id,
        todayIso
      );
      return {
        id,
        profile: st.profile,
        quota,
        overLimitDays: Math.max(0, quota.usedDays - quota.maxDays),
      };
    });
  }, [stores, todayIso]);

  const summary = useMemo(() => {
    const totalStaff = specialistQuotas.length;
    const overLimitCount = specialistQuotas.filter((s) => s.quota.usedDays >= s.quota.maxDays).length;
    const totalUsedDays = specialistQuotas.reduce((acc, s) => acc + s.quota.usedDays, 0);

    return {
      totalStaff,
      overLimitCount,
      withinLimitCount: totalStaff - overLimitCount,
      totalUsedDays,
    };
  }, [specialistQuotas]);

  return (
    <div className="space-y-4">
      {/* 1. Thẻ Thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-card border border-zinc-200/80 dark:border-border shadow-xs flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-muted text-zinc-700 dark:text-foreground">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wide">Tổng nhân sự theo dõi</div>
            <div className="text-base font-extrabold text-zinc-900 dark:text-foreground leading-tight">
              {summary.totalStaff} chuyên viên
            </div>
          </div>
        </div>

        <div className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-card border border-zinc-200/80 dark:border-border shadow-xs flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wide">Trong hạn mức (≤ 4 ngày)</div>
            <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 leading-tight">
              {summary.withinLimitCount} nhân sự
            </div>
          </div>
        </div>

        <div className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-card border border-zinc-200/80 dark:border-border shadow-xs flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wide">Chạm hoặc vượt hạn mức</div>
            <div className="text-base font-extrabold text-rose-600 dark:text-rose-400 leading-tight">
              {summary.overLimitCount} nhân sự
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bảng Chi tiết */}
      <div className={`${panelCard} space-y-3`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#6B1F2E] dark:text-[#FF7F6B]" />
              Bảng Theo Dõi Quỹ Ngày Nghỉ {currentMonthStr} Của Chuyên Viên
            </h4>
            <Popover>
              <PopoverTrigger
                type="button"
                aria-label="Thông tin quy tắc quỹ nghỉ phép"
                title="Xem quy tắc quỹ nghỉ phép"
                className="inline-flex items-center justify-center rounded-full p-1 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 transition-colors cursor-pointer"
              >
                <Info className="w-4 h-4" />
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-80 sm:w-96 p-3.5 rounded-2xl text-xs space-y-2.5 leading-relaxed"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-zinc-900 dark:text-foreground">
                    Giám Sát Quỹ Nghỉ Phép ({currentMonthStr})
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#6B1F2E]/10 dark:bg-[#FF7F6B]/10 text-[11px] font-bold text-[#6B1F2E] dark:text-[#FF7F6B] shrink-0">
                    4 ngày / tháng
                  </span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-300">
                  Quy tắc chuẩn Mục 9: Tối đa <strong>4 ngày nghỉ/tháng</strong> cho mỗi Bác sĩ và NV Chăm sóc (tương đương 1 ngày/tuần nghỉ luân phiên).
                  Quỹ nghỉ <strong>reset tự động vào ngày 01 đầu tháng</strong>, không bảo lưu/dồn sang tháng sau.
                </p>
              </PopoverContent>
            </Popover>
          </div>
          <span className="text-xs text-zinc-400">Tính cả ca nghỉ luân phiên, nghỉ ốm và nghỉ không lương</span>
        </div>

        <div>
          <Table className="w-full text-left text-xs">
            <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60">
              <TableRow className="hover:bg-transparent border-zinc-200/80 dark:border-border/60">
                <TableHead className={`${thClass} px-2.5 whitespace-normal leading-tight`}>Chuyên viên</TableHead>
                <TableHead className={`${thClass} px-2.5 whitespace-normal leading-tight`}>Vai trò &amp; Hợp đồng</TableHead>
                <TableHead className={`${thClass} px-2 text-center whitespace-normal leading-tight`}>Nghỉ luân phiên</TableHead>
                <TableHead className={`${thClass} px-2 text-center whitespace-normal leading-tight`}>Nghỉ ốm</TableHead>
                <TableHead className={`${thClass} px-2 text-center whitespace-normal leading-tight`}>Phép / K.lương</TableHead>
                <TableHead className={`${thClass} px-2 text-center whitespace-normal leading-tight`}>Tổng đã nghỉ</TableHead>
                <TableHead className={`${thClass} px-2 text-center whitespace-normal leading-tight`}>Tiến độ hạn mức</TableHead>
                <TableHead className={`${thClass} px-2.5 text-right whitespace-normal leading-tight`}>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {specialistQuotas.map((item) => {
                const p = item.profile;
                const q = item.quota;
                const percent = Math.min(100, Math.round((q.usedDays / q.maxDays) * 100));
                const isOver = q.usedDays > q.maxDays;
                const isAtOrOver = q.usedDays >= q.maxDays;
                const isNearLimit = q.usedDays === q.maxDays - 1;

                return (
                  <TableRow key={item.id} className="border-zinc-200/70 dark:border-border/60 hover:bg-zinc-50/60 dark:hover:bg-muted/40 transition-colors">
                    <TableCell className="py-3 px-2.5">
                      <div className="font-bold text-zinc-900 dark:text-foreground">{p.fullName}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{item.id}</div>
                    </TableCell>

                    <TableCell className="py-3 px-2.5">
                      <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {p.expertType === "vet" ? "Bác sĩ thú y" : "NV Chăm sóc"}
                      </div>
                      <span className={`inline-block px-2 py-0.2 rounded-full text-[10px] font-bold ${
                        p.employmentType === "part_time"
                          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      }`}>
                        {p.employmentType === "part_time" ? "Part-time" : "Full-time"}
                      </span>
                    </TableCell>

                    <TableCell className="py-3 px-2 text-center font-bold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                      {q.rotationalDays} ngày
                    </TableCell>

                    <TableCell className="py-3 px-2 text-center font-bold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                      {q.sickDays} ngày
                    </TableCell>

                    <TableCell className="py-3 px-2 text-center font-bold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                      {q.unpaidDays} ngày
                    </TableCell>

                    <TableCell className="py-3 px-2 text-center whitespace-nowrap">
                      <span
                        className={`font-extrabold text-sm ${
                          isAtOrOver
                            ? "text-rose-600 dark:text-rose-400"
                            : isNearLimit
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-zinc-900 dark:text-foreground"
                        }`}
                      >
                        {q.usedDays} / {q.maxDays} ngày
                      </span>
                    </TableCell>

                    <TableCell className="py-3 px-2 text-center w-28">
                      <div className="w-full bg-zinc-200 dark:bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isAtOrOver
                              ? "bg-rose-500"
                              : isNearLimit
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-1 whitespace-nowrap">
                        {isOver ? `Vượt ${item.overLimitDays} ngày` : `Còn lại ${q.remainingDays} ngày`}
                      </div>
                    </TableCell>

                    <TableCell className="py-3 px-2.5 text-right whitespace-nowrap">
                      {isAtOrOver ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>{isOver ? "Vượt hạn mức / Nghỉ không lương" : "Đã chạm hạn mức"}</span>
                        </span>
                      ) : isNearLimit ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>Sắp chạm hạn mức</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span>Trong hạn mức</span>
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
