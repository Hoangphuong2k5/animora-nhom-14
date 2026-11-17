"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  Info,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { formatDateDdMmYyyy } from "@/utils/dateFormat";
import {
  EXPERT_SYNC_EVENT,
  readAllExpertShiftRequests,
  updateExpertShiftRequestDecision,
  type AggregatedShiftRequest,
} from "@/utils/clinicalSync";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  StatusPill,
  approveBtn,
  panelCard,
  rejectBtn,
  thClass,
} from "./useStaffOps";
import { RejectReasonDialog } from "./RejectReasonDialog";
import type { ShiftRequestKind } from "@/types/expert.type";

const SHIFT_KIND_LABELS: Record<string, string> = {
  leave: "Nghỉ phép",
  extra_shift: "Ca làm thêm (Part-time)",
  shift_swap: "Xin đổi ca",
};

/**
 * Mục 5 & 9 – Xem và duyệt lịch làm việc:
 * Đồng bộ trực tiếp 2 chiều với Bác sĩ & NV Chăm sóc qua clinicalSync.
 */
export function LeaveRequestsPanel() {
  const [items, setItems] = useState<AggregatedShiftRequest[]>(() =>
    typeof window !== "undefined" ? readAllExpertShiftRequests() : []
  );
  const [kindFilter, setKindFilter] = useState<"all" | ShiftRequestKind>("all");
  const [roleFilter, setRoleFilter] = useState<"all" | "vet" | "care">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [rejectTarget, setRejectTarget] = useState<{ expertId: string; reqId: string } | null>(null);

  const refreshRequests = useCallback(() => {
    setItems(readAllExpertShiftRequests());
  }, []);

  useEffect(() => {
    window.addEventListener(EXPERT_SYNC_EVENT, refreshRequests);
    return () => window.removeEventListener(EXPERT_SYNC_EVENT, refreshRequests);
  }, [refreshRequests]);

  const filtered = useMemo(() => {
    return items
      .filter((item) => kindFilter === "all" || item.request.kind === kindFilter)
      .filter((item) => {
        if (roleFilter === "all") return true;
        if (roleFilter === "vet") return item.profile.expertType === "vet";
        return item.profile.expertType !== "vet";
      })
      .filter((item) => statusFilter === "all" || item.request.status === statusFilter)
      .sort((a, b) => b.request.createdAt.localeCompare(a.request.createdAt));
  }, [items, kindFilter, roleFilter, statusFilter]);

  const pendingCountByKind = (k: ShiftRequestKind) =>
    items.filter((i) => i.request.kind === k && i.request.status === "pending").length;

  const handleReview = (
    expertId: string,
    reqId: string,
    decision: "approved" | "rejected",
    reason?: string
  ) => {
    const res = updateExpertShiftRequestDecision(expertId, reqId, decision, reason);
    if (!res) {
      toast.error("Không tìm thấy đơn đăng ký hoặc đơn đã bị hủy.");
      return;
    }
    refreshRequests();
    toast.success(
      decision === "approved"
        ? "Đã phê duyệt đơn và đồng bộ ca làm việc vào lịch chuyên viên!"
        : "Đã từ chối đơn kèm lý do phản hồi cho chuyên viên."
    );
  };

  return (
    <div className={`${panelCard} space-y-4`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <h3 className="text-base font-bold text-zinc-900 dark:text-foreground flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-[#6B1F2E] dark:text-[#FF7F6B]" />
            Duyệt Nghỉ Phép, Đổi Ca &amp; Ca Làm Thêm
          </h3>
          <Popover>
            <PopoverTrigger
              type="button"
              aria-label="Thông tin quy tắc duyệt đơn"
              title="Xem quy tắc duyệt đơn"
              className="inline-flex items-center justify-center rounded-full p-1 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 transition-colors cursor-pointer"
            >
              <Info className="w-4 h-4" />
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-80 sm:w-96 p-3.5 rounded-2xl text-xs space-y-2.5 leading-relaxed"
            >
              <p className="text-zinc-600 dark:text-zinc-300">
                Đồng bộ từ Bác sĩ &amp; NV Chăm sóc. Quỹ nghỉ tối đa{" "}
                <strong className="text-zinc-900 dark:text-foreground">4 ngày/tháng</strong> (nghỉ cả ngày). Đơn đã duyệt không thể hủy.
              </p>
              <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-900 text-[11px] text-sky-800 dark:text-sky-300">
                Quy định giờ hành chính (08:00–17:00, không làm ca đêm): Full-time &amp; Bác sĩ bình thường ≤ <strong>8h/ngày, 48h/tuần</strong> (trần Điều 107 ≤ <strong>12h/ngày</strong>) và chỉ gửi đơn nghỉ phép. Part-time có thể đăng ký ca làm thêm, nghỉ ca hoặc đổi ca.
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Status Segmented Switcher */}
        <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-zinc-100/80 dark:bg-muted/50 p-1 border border-zinc-200/70 dark:border-border/60 text-xs w-fit">
          {(["pending", "approved", "rejected", "all"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                statusFilter === s
                  ? "bg-[#6B1F2E] text-white shadow-xs"
                  : "text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground"
              }`}
            >
              {{ pending: "Chờ duyệt", approved: "Đã duyệt", rejected: "Từ chối", all: "Tất cả" }[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Bar: Kind Tabs + Role Select */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-zinc-100 dark:border-border/60">
        <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-zinc-100/80 dark:bg-muted/50 p-1 border border-zinc-200/70 dark:border-border/60">
          {(
            [
              { id: "all", label: "Tất cả loại" },
              { id: "leave", label: `Nghỉ phép (${pendingCountByKind("leave")})` },
              { id: "extra_shift", label: `Ca làm thêm (${pendingCountByKind("extra_shift")})` },
              { id: "shift_swap", label: `Đổi ca (${pendingCountByKind("shift_swap")})` },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              data-testid={`req-type-${t.id}`}
              onClick={() => setKindFilter(t.id as "all" | ShiftRequestKind)}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                kindFilter === t.id
                  ? "bg-white dark:bg-card text-[#6B1F2E] dark:text-[#FF7F6B] shadow-xs"
                  : "text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-zinc-400 font-semibold">Vai trò:</span>
          <Select
            value={roleFilter}
            onValueChange={(val) => {
              if (val) setRoleFilter(val as "all" | "vet" | "care");
            }}
            items={{
              all: "Tất cả vai trò",
              vet: "Bác sĩ thú y",
              care: "NV Chăm sóc",
            }}
          >
            <SelectTrigger className="w-40 h-9! rounded-xl bg-zinc-100/80 dark:bg-muted/50 border-zinc-200/70 dark:border-border/60 text-xs font-semibold px-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="vet">Bác sĩ thú y</SelectItem>
              <SelectItem value="care">NV Chăm sóc</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full text-left text-xs">
          <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60">
            <TableRow className="hover:bg-transparent">
              <TableHead className={thClass}>Chuyên viên</TableHead>
              <TableHead className={thClass}>Loại đơn</TableHead>
              <TableHead className={thClass}>Ngày &amp; Ca</TableHead>
              <TableHead className={thClass}>Số ca / Giờ</TableHead>
              <TableHead className={thClass}>Lý do &amp; Cảnh báo chính sách</TableHead>
              <TableHead className={`${thClass} text-center`}>Trạng thái</TableHead>
              <TableHead className={`${thClass} text-center`}>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-zinc-400">
                  Không có đơn đăng ký ca nào phù hợp bộ lọc.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((item) => {
              const r = item.request;
              const p = item.profile;
              const isVet = p.expertType === "vet";

              return (
                <TableRow key={`${item.expertId}-${r.id}`} data-testid={`req-row-${r.id}`}>
                  <TableCell className="py-3 px-3">
                    <div className="font-bold text-zinc-900 dark:text-foreground">{p.fullName}</div>
                    <div className="text-[10px] text-zinc-500">
                      {isVet ? "Bác sĩ thú y" : "NV Chăm sóc"} •{" "}
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        {p.employmentType === "part_time" ? "Part-time" : "Full-time"}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="py-3 px-3">
                    <div className="font-bold text-zinc-900 dark:text-foreground">
                      {SHIFT_KIND_LABELS[r.kind] || r.kind}
                    </div>
                    {r.leaveType && (
                      <div className="text-[10px] text-zinc-500">
                        Loại: {r.leaveType === "rotational" ? "Nghỉ luân phiên" : r.leaveType === "sick" ? "Nghỉ ốm" : "Nghỉ phép"}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="py-3 px-3 font-mono text-[11px] whitespace-nowrap">
                    <div>{formatDateDdMmYyyy(r.date)}</div>
                    {r.kind === "leave" && !r.shift ? (
                      <div className="text-[10px] text-rose-600 dark:text-rose-400 font-sans font-semibold">
                        Ca: Cả ngày
                      </div>
                    ) : r.shift ? (
                      <div className="text-[10px] text-zinc-500 font-sans">
                        Ca: {r.shift === "morning" ? "Sáng" : "Chiều"}
                      </div>
                    ) : null}
                    {r.targetSwapDate && (
                      <div className="text-[10px] text-sky-600 font-sans">
                        ➔ Đổi sang: {formatDateDdMmYyyy(r.targetSwapDate)} ({r.targetSwapShift === "morning" ? "Sáng" : "Chiều"})
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="py-3 px-3 font-semibold">
                    {r.kind === "extra_shift" ? (
                      <span className="text-emerald-700 dark:text-emerald-400">
                        {r.extraShiftHours ? `1 ca (${r.extraShiftHours}h)` : "1 ca làm thêm"}
                      </span>
                    ) : (
                      "1 ngày"
                    )}
                  </TableCell>

                  <TableCell className="py-3 px-3 max-w-[260px] whitespace-normal space-y-1">
                    <div className="text-zinc-700 dark:text-zinc-300">{r.reason}</div>

                    {/* Policy warning badges */}
                    {r.exceedsMonthlyLeaveLimit && (
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>Vượt quỹ 4 ngày/tháng (Nghỉ không lương)</span>
                      </div>
                    )}

                    {r.policyWarnings && r.policyWarnings.length > 0 && (
                      <div className="text-[9px] text-amber-700 dark:text-amber-400 italic">
                        {r.policyWarnings[0]}
                      </div>
                    )}

                    {r.adminNote && (
                      <div className="text-[10px] text-zinc-500 bg-zinc-100 dark:bg-muted px-2 py-0.5 rounded">
                        Ghi chú QL: {r.adminNote}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="py-3 px-3 text-center">
                    <StatusPill status={r.status} />
                  </TableCell>

                  <TableCell className="py-3 px-3 text-center whitespace-nowrap">
                    {r.status === "pending" ? (
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          className={approveBtn}
                          data-testid={`req-approve-${r.id}`}
                          onClick={() => handleReview(item.expertId, r.id, "approved")}
                        >
                          Duyệt
                        </button>
                        <button
                          type="button"
                          className={rejectBtn}
                          onClick={() => setRejectTarget({ expertId: item.expertId, reqId: r.id })}
                        >
                          Từ chối
                        </button>
                      </div>
                    ) : r.status === "approved" && r.kind === "leave" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 italic">
                        <Lock className="w-3 h-3" /> Đã duyệt – không thể hủy
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-400 italic">Đã xử lý</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <RejectReasonDialog
        open={Boolean(rejectTarget)}
        title="Từ chối đơn ca trực của chuyên viên"
        defaultReason="Ca trực cần đảm bảo đủ nhân sự phục vụ khách hàng."
        presetReasons={[
          "Ca trực cần đảm bảo đủ nhân sự phục vụ khách hàng.",
          "Trùng lịch hẹn khách hàng đã xác nhận trong khung giờ này.",
          "Vượt giới hạn giờ làm việc / tăng ca theo Điều 107 BLLĐ.",
          "Cần nộp đơn trước thời gian quy định để sắp xếp nhân sự thay thế.",
        ]}
        onCancel={() => setRejectTarget(null)}
        onConfirm={(reason) => {
          if (rejectTarget) {
            handleReview(rejectTarget.expertId, rejectTarget.reqId, "rejected", reason);
          }
          setRejectTarget(null);
        }}
      />
    </div>
  );
}
