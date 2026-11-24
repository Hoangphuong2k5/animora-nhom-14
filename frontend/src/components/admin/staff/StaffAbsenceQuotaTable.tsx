import React from "react";
import { AlertTriangle, CalendarOff } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type { ExpertProfile } from "@/types/expert.type";

interface AbsenceQuotaRow {
  expertId: string;
  profile: ExpertProfile;
  quota: {
    rotationalDays: number;
    sickDays: number;
    unpaidDays: number;
    absenceCount: number;
    usedDays: number;
    maxDays: number;
    isAtOrOverLimit: boolean;
  };
  overLimitDays: number;
}

interface StaffAbsenceQuotaTableProps {
  todayIso: string;
  rows: AbsenceQuotaRow[];
}

/** Tab 2 table tracking monthly absences and the 4-day leave quota per staff member. */
export function StaffAbsenceQuotaTable({
  todayIso,
  rows,
}: StaffAbsenceQuotaTableProps) {
  return (
    <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-foreground flex items-center gap-2">
            <CalendarOff className="w-5 h-5 text-[#6B1F2E] dark:text-[#FF7F6B]" />
            Tổng Hợp Ca Vắng &amp; Quỹ Nghỉ Phép Tháng ({todayIso.slice(0, 7)})
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Mỗi Bác sĩ &amp; NV Chăm sóc (Full-time) có tối đa 4 ngày
            nghỉ/tháng (reset đầu tháng, không cộng dồn; gồm nghỉ luân phiên, nghỉ ốm
            và nghỉ không lương).
          </p>
        </div>
      </div>

      <Table className="w-full text-left text-xs">
        <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
          <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
            <TableHead className="py-3 px-3 text-zinc-500 uppercase font-semibold text-[11px]">
              Nhân sự
            </TableHead>
            <TableHead className="py-3 px-3 text-zinc-500 uppercase font-semibold text-[11px]">
              Loại hình
            </TableHead>
            <TableHead className="py-3 px-3 text-center text-zinc-500 uppercase font-semibold text-[11px]">
              Nghỉ luân phiên
            </TableHead>
            <TableHead className="py-3 px-3 text-center text-zinc-500 uppercase font-semibold text-[11px]">
              Nghỉ ốm / K.lương
            </TableHead>
            <TableHead className="py-3 px-3 text-center text-zinc-500 uppercase font-semibold text-[11px]">
              Tổng ca vắng
            </TableHead>
            <TableHead className="py-3 px-3 text-center text-zinc-500 uppercase font-semibold text-[11px]">
              Quỹ đã dùng
            </TableHead>
            <TableHead className="py-3 px-3 text-right text-zinc-500 uppercase font-semibold text-[11px]">
              Cảnh báo
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-zinc-100 dark:divide-border/60">
          {rows.map(({ expertId, profile, quota, overLimitDays }) => (
            <TableRow
              key={expertId}
              className="hover:bg-zinc-50 dark:hover:bg-muted/40"
            >
              <TableCell className="py-3 px-3 font-bold text-zinc-900 dark:text-foreground">
                <div>{profile.fullName}</div>
                <div className="text-[11px] font-normal text-zinc-400">
                  {profile.expertType === "vet"
                    ? "Bác sĩ thú y"
                    : "NV Chăm sóc thú cưng"}
                </div>
              </TableCell>
              <TableCell className="py-3 px-3">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-zinc-100 text-zinc-700 dark:bg-muted dark:text-zinc-300">
                  Full-time
                </span>
              </TableCell>
              <TableCell className="py-3 px-3 text-center font-semibold">
                {quota.rotationalDays} ngày
              </TableCell>
              <TableCell className="py-3 px-3 text-center font-semibold">
                {quota.sickDays + quota.unpaidDays} ngày
              </TableCell>
              <TableCell className="py-3 px-3 text-center font-extrabold text-zinc-900 dark:text-foreground">
                {quota.absenceCount} ca
              </TableCell>
              <TableCell className="py-3 px-3 text-center font-extrabold">
                <span
                  className={
                    quota.usedDays > quota.maxDays
                      ? "text-rose-600"
                      : quota.isAtOrOverLimit
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }
                >
                  {quota.usedDays} / {quota.maxDays} ngày
                </span>
              </TableCell>
              <TableCell className="py-3 px-3 text-right">
                {overLimitDays > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700">
                    <AlertTriangle className="w-3 h-3" />
                    Vượt {overLimitDays} ngày
                  </span>
                ) : quota.isAtOrOverLimit ? (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                    Chạm trần 4 ngày
                  </span>
                ) : (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    Trong hạn mức
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
