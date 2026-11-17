import React from "react";
import { Star } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type { ExpertStoreState } from "@/types/expert.type";
import type { StaffItem } from "./staffData";

interface StaffDirectoryTableProps {
  staffList: StaffItem[];
  expertStores: Record<string, ExpertStoreState>;
  onSelectStaff: (staff: StaffItem) => void;
}

/** Tab 1 table showing all doctors and care staff with pending certificate badges. */
export function StaffDirectoryTable({
  staffList,
  expertStores,
  onSelectStaff,
}: StaffDirectoryTableProps) {
  return (
    <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
      <Table className="w-full text-left text-xs">
        <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
          <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
            <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
              Chuyên viên
            </TableHead>
            <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
              Vị trí &amp; Hình thức
            </TableHead>
            <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
              Kinh nghiệm
            </TableHead>
            <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
              Đánh giá TB
            </TableHead>
            <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
              Số ca tháng này
            </TableHead>
            <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
              Trạng thái
            </TableHead>
            <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
              Chi tiết
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
          {staffList.map((st) => (
            <TableRow
              key={st.id}
              className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors group"
            >
              <TableCell className="py-3.5 px-3">
                <div className="flex items-center gap-3">
                  <img
                    src={st.avatar}
                    alt={st.name}
                    className="w-11 h-11 rounded-2xl object-cover border border-zinc-200 dark:border-border shrink-0"
                  />
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-foreground text-sm">
                      {st.name}
                    </div>
                    <div className="text-[11px] text-zinc-400">{st.phone}</div>
                  </div>
                </div>
              </TableCell>

              <TableCell className="py-3.5 px-3 max-w-[260px] whitespace-normal">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-[#6B1F2E] dark:text-[#FF7F6B]">
                    {st.roleType}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      st.employmentType === "part_time"
                        ? "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300"
                        : "bg-zinc-100 text-zinc-700 dark:bg-muted dark:text-zinc-300"
                    }`}
                  >
                    {st.employmentType === "part_time" ? "Part-time" : "Full-time"}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5">
                  {st.specialty}
                </div>
                {st.linkedExpertId &&
                  (() => {
                    const liveCerts =
                      expertStores[st.linkedExpertId]?.profile?.certificates || [];
                    const pendingCount = liveCerts.filter(
                      (c) => c.status === "pending"
                    ).length;
                    if (pendingCount === 0) return null;
                    return (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                        {pendingCount} chứng chỉ chờ duyệt
                      </span>
                    );
                  })()}
              </TableCell>

              <TableCell className="py-3.5 px-3 text-zinc-600 dark:text-muted-foreground font-medium">
                {st.experience}
              </TableCell>

              <TableCell className="py-3.5 px-3 text-center">
                <div className="inline-flex items-center gap-1 font-extrabold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{st.rating}</span>
                  <span className="text-[10px] text-zinc-400 font-normal">
                    ({st.reviewCount})
                  </span>
                </div>
              </TableCell>

              <TableCell className="py-3.5 px-3 text-center font-bold text-zinc-900 dark:text-foreground">
                {st.monthlyCases} ca
              </TableCell>

              <TableCell className="py-3.5 px-3 text-center">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    st.status === "active"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : st.status === "busy"
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "bg-zinc-100 dark:bg-muted text-zinc-400"
                  }`}
                >
                  {st.status === "active"
                    ? "Đang nhận lịch"
                    : st.status === "busy"
                    ? "Đang làm ca"
                    : "Nghỉ phép"}
                </span>
              </TableCell>

              <TableCell className="py-3.5 px-3 text-right">
                <button
                  type="button"
                  onClick={() => onSelectStaff(st)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-muted dark:hover:bg-muted font-bold text-zinc-700 dark:text-foreground/80 transition-colors cursor-pointer"
                >
                  Hồ sơ & Đánh giá
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
