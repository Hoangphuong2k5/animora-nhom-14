"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Info,
  Lock,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { formatDateDdMmYyyy } from "@/utils/dateFormat";
import { getLeaveTypeLabel } from "@/utils/expertPolicy";
import {
  EXPERT_SYNC_EVENT,
  readAllExpertProfiles,
  readAllExpertShiftRequests,
  updateExpertShiftRequestDecision,
  type AggregatedShiftRequest,
} from "@/utils/clinicalSync";
import {
  RECEPTIONIST_SYNC_EVENT,
  readReceptionistLeaveRequests,
  reviewReceptionistLeaveRequest,
  type ReceptionistLeaveRequest,
} from "@/data/receptionistOpsData";
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
import { EmergencyLeaveDialog } from "./EmergencyLeaveDialog";
import { ImpactedAppointmentsBanner } from "./ImpactedAppointmentsBanner";
import type {
  ExpertAppointment,
  ExpertProfile,
  LeaveReasonType,
  ShiftRequestKind,
} from "@/types/expert.type";

type UnifiedRole = "vet" | "care" | "receptionist";
type LeaveCategoryFilter = "all" | "regular" | "emergency";

interface UnifiedLeaveRow {
  source: "expert" | "receptionist";
  staffId: string;
  staffName: string;
  role: UnifiedRole;
  reqId: string;
  kind: ShiftRequestKind | "leave";
  leaveType?: LeaveReasonType;
  date: string;
  shift?: "morning" | "afternoon";
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  exceedsMonthlyLeaveLimit?: boolean;
  policyWarnings?: string[];
  adminNote?: string;
}

/**
 * Mục 5, 6 & 7 (Animora v1.4) – Xem và duyệt đơn xin nghỉ phép thường & tạo nghỉ đột xuất:
 * Đồng bộ trực tiếp 2 chiều với Bác sĩ, NV Chăm sóc (clinicalSync) & Lễ tân (receptionistOpsData).
 */
export function LeaveRequestsPanel() {
  const { user: currentManager } = useAuth();
  const managerDisplayName =
    currentManager?.fullName?.trim() || "Quản lý phòng khám";
  const [expertItems, setExpertItems] = useState<AggregatedShiftRequest[]>(() =>
    typeof window !== "undefined" ? readAllExpertShiftRequests() : []
  );
  const [recItems, setRecItems] = useState<ReceptionistLeaveRequest[]>(() =>
    typeof window !== "undefined" ? readReceptionistLeaveRequests() : []
  );
  const [expertProfiles, setExpertProfiles] = useState<ExpertProfile[]>(() =>
    typeof window !== "undefined" ? readAllExpertProfiles() : []
  );
  const [leaveCategoryFilter, setLeaveCategoryFilter] =
    useState<LeaveCategoryFilter>("all");
  const [roleFilter, setRoleFilter] = useState<"all" | UnifiedRole>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  const [rejectTarget, setRejectTarget] = useState<{
    source: "expert" | "receptionist";
    staffId: string;
    reqId: string;
  } | null>(null);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [lastImpactedAppts, setLastImpactedAppts] = useState<{
    staffName: string;
    date: string;
    appointments: ExpertAppointment[];
  } | null>(null);

  const refreshRequests = useCallback(() => {
    setExpertItems(readAllExpertShiftRequests());
    setRecItems(readReceptionistLeaveRequests());
    setExpertProfiles(readAllExpertProfiles());
  }, []);

  useEffect(() => {
    window.addEventListener(EXPERT_SYNC_EVENT, refreshRequests);
    window.addEventListener(RECEPTIONIST_SYNC_EVENT, refreshRequests);
    return () => {
      window.removeEventListener(EXPERT_SYNC_EVENT, refreshRequests);
      window.removeEventListener(RECEPTIONIST_SYNC_EVENT, refreshRequests);
    };
  }, [refreshRequests]);

  const unifiedItems = useMemo<UnifiedLeaveRow[]>(() => {
    const fromExperts: UnifiedLeaveRow[] = expertItems.map((item) => ({
      source: "expert",
      staffId: item.expertId,
      staffName: item.profile.fullName,
      role: item.profile.expertType === "vet" ? "vet" : "care",
      reqId: item.request.id,
      kind: item.request.kind,
      leaveType: item.request.leaveType,
      date: item.request.date,
      shift: item.request.shift,
      reason: item.request.reason,
      status: item.request.status,
      createdAt: item.request.createdAt,
      exceedsMonthlyLeaveLimit: item.request.exceedsMonthlyLeaveLimit,
      policyWarnings: item.request.policyWarnings,
      adminNote: item.request.adminNote,
    }));

    const fromReceptionists: UnifiedLeaveRow[] = recItems.map((r) => ({
      source: "receptionist",
      staffId: r.staffId,
      staffName: r.staffName,
      role: "receptionist",
      reqId: r.id,
      kind: "leave",
      leaveType: r.leaveType,
      date: r.date,
      reason: r.reason,
      status: r.status,
      createdAt: r.createdAt,
      exceedsMonthlyLeaveLimit: r.exceedsMonthlyLeaveLimit,
      policyWarnings: r.policyWarnings,
      adminNote: r.managerNote,
    }));

    return [...fromExperts, ...fromReceptionists];
  }, [expertItems, recItems]);

  const filtered = useMemo(() => {
    return unifiedItems
      .filter((item) => {
        if (leaveCategoryFilter === "emergency") {
          return item.leaveType === "emergency";
        }
        if (leaveCategoryFilter === "regular") {
          return item.leaveType !== "emergency";
        }
        return true;
      })
      .filter((item) => roleFilter === "all" || item.role === roleFilter)
      .filter((item) => statusFilter === "all" || item.status === statusFilter)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [unifiedItems, leaveCategoryFilter, roleFilter, statusFilter]);

  const regularPendingCount = unifiedItems.filter(
    (i) => i.leaveType !== "emergency" && i.status === "pending"
  ).length;
  const emergencyCount = unifiedItems.filter(
    (i) => i.leaveType === "emergency"
  ).length;

  const handleReview = (
    source: "expert" | "receptionist",
    staffId: string,
    reqId: string,
    decision: "approved" | "rejected",
    reason?: string
  ) => {
    if (source === "receptionist") {
      const res = reviewReceptionistLeaveRequest(
        reqId,
        decision,
        managerDisplayName,
        reason
      );
      if (!res) {
        toast.error("Không tìm thấy đơn xin nghỉ phép của Lễ tân.");
        return;
      }
      refreshRequests();
      toast.success(
        decision === "approved"
          ? "Đã phê duyệt đơn nghỉ phép Lễ tân (không khóa slot đặt lịch khách hàng)!"
          : "Đã từ chối đơn nghỉ phép Lễ tân kèm lý do."
      );
      return;
    }

    const res = updateExpertShiftRequestDecision(staffId, reqId, decision, reason);
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
            Duyệt Đơn Xin Nghỉ Phép &amp; Nghỉ Đột Xuất
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
                Đồng bộ từ Bác sĩ, NV Chăm sóc &amp; Lễ tân. Quỹ nghỉ tối đa{" "}
                <strong className="text-zinc-900 dark:text-foreground">4 ngày/tháng</strong> (nghỉ cả ngày). Đơn đã duyệt sẽ khóa slot ngay và không thể hủy.
              </p>
              <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-900 text-[11px] text-sky-800 dark:text-sky-300">
                Quy định lịch làm việc: Toàn bộ Bác sĩ &amp; NV Chăm sóc đều làm việc Full-time (Thứ 2 – Thứ 7, 08:00–17:00, nghỉ trưa cố định 12:00–13:00). Nhân sự chỉ gửi nghỉ phép thường khi ngày đó chưa có khách đặt; nếu bận đột xuất, Quản lý tạo Nghỉ đột xuất để khóa slot và đổi nhân sự.
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setEmergencyModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo nghỉ đột xuất</span>
          </button>

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
      </div>

      {lastImpactedAppts && (
        <ImpactedAppointmentsBanner
          staffName={lastImpactedAppts.staffName}
          date={lastImpactedAppts.date}
          appointments={lastImpactedAppts.appointments}
          onDismiss={() => setLastImpactedAppts(null)}
        />
      )}

      {/* Filter Bar: Regular vs Emergency Leave + Role Select */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-zinc-100 dark:border-border/60">
        <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-zinc-100/80 dark:bg-muted/50 p-1 border border-zinc-200/70 dark:border-border/60">
          {(
            [
              { id: "all", label: "Tất cả đơn" },
              { id: "regular", label: `Nghỉ phép thường (${regularPendingCount} chờ)` },
              { id: "emergency", label: `Nghỉ đột xuất (${emergencyCount})` },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              data-testid={`req-type-${t.id}`}
              onClick={() => setLeaveCategoryFilter(t.id)}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                leaveCategoryFilter === t.id
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
              if (val) setRoleFilter(val as "all" | UnifiedRole);
            }}
            items={{
              all: "Tất cả vai trò",
              vet: "Bác sĩ thú y",
              care: "NV Chăm sóc",
              receptionist: "Lễ tân",
            }}
          >
            <SelectTrigger className="w-40 h-9! rounded-xl bg-zinc-100/80 dark:bg-muted/50 border-zinc-200/70 dark:border-border/60 text-xs font-semibold px-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="vet">Bác sĩ thú y</SelectItem>
              <SelectItem value="care">NV Chăm sóc</SelectItem>
              <SelectItem value="receptionist">Lễ tân</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full text-left text-xs">
          <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60">
            <TableRow className="hover:bg-transparent">
              <TableHead className={thClass}>Nhân sự</TableHead>
              <TableHead className={thClass}>Loại nghỉ</TableHead>
              <TableHead className={thClass}>Ngày nghỉ</TableHead>
              <TableHead className={thClass}>Thời lượng</TableHead>
              <TableHead className={thClass}>Lý do &amp; Cảnh báo chính sách</TableHead>
              <TableHead className={`${thClass} text-center`}>Trạng thái</TableHead>
              <TableHead className={`${thClass} text-center`}>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-zinc-400">
                  Không có đơn xin nghỉ phép nào phù hợp bộ lọc.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((item) => {
              const roleLabel =
                item.role === "vet"
                  ? "Bác sĩ thú y"
                  : item.role === "care"
                  ? "NV Chăm sóc"
                  : "Lễ tân";

              return (
                <TableRow
                  key={`${item.source}-${item.staffId}-${item.reqId}`}
                  data-testid={`req-row-${item.reqId}`}
                >
                  <TableCell className="py-3 px-3">
                    <div className="font-bold text-zinc-900 dark:text-foreground">
                      {item.staffName}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      {roleLabel} •{" "}
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        Full-time
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="py-3 px-3">
                    <div className="font-bold text-zinc-900 dark:text-foreground">
                      {item.leaveType === "emergency"
                        ? "Nghỉ đột xuất (QL tạo)"
                        : "Nghỉ phép thường"}
                    </div>
                    {item.leaveType && (
                      <div className="text-[10px] text-zinc-500">
                        Loại: {getLeaveTypeLabel(item.leaveType)}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="py-3 px-3 font-mono text-[11px] whitespace-nowrap">
                    <div>{formatDateDdMmYyyy(item.date)}</div>
                    <div className="text-[10px] text-rose-600 dark:text-rose-400 font-sans font-semibold">
                      {item.shift
                        ? `Ca: ${item.shift === "morning" ? "Sáng" : "Chiều"}`
                        : "Nghỉ cả ngày"}
                    </div>
                  </TableCell>

                  <TableCell className="py-3 px-3 font-semibold">1 ngày</TableCell>

                  <TableCell className="py-3 px-3 max-w-[260px] whitespace-normal space-y-1">
                    <div className="text-zinc-700 dark:text-zinc-300">{item.reason}</div>

                    {item.exceedsMonthlyLeaveLimit && (
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>Vượt quỹ 4 ngày/tháng (Nghỉ không lương)</span>
                      </div>
                    )}

                    {item.policyWarnings && item.policyWarnings.length > 0 && (
                      <div className="text-[9px] text-amber-700 dark:text-amber-400 italic">
                        {item.policyWarnings[0]}
                      </div>
                    )}

                    {item.adminNote && (
                      <div className="text-[10px] text-zinc-500 bg-zinc-100 dark:bg-muted px-2 py-0.5 rounded">
                        Ghi chú QL: {item.adminNote}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="py-3 px-3 text-center">
                    <StatusPill status={item.status} />
                  </TableCell>

                  <TableCell className="py-3 px-3 text-center whitespace-nowrap">
                    {item.status === "pending" ? (
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          className={approveBtn}
                          data-testid={`req-approve-${item.reqId}`}
                          onClick={() =>
                            handleReview(item.source, item.staffId, item.reqId, "approved")
                          }
                        >
                          Duyệt
                        </button>
                        <button
                          type="button"
                          className={rejectBtn}
                          onClick={() =>
                            setRejectTarget({
                              source: item.source,
                              staffId: item.staffId,
                              reqId: item.reqId,
                            })
                          }
                        >
                          Từ chối
                        </button>
                      </div>
                    ) : item.status === "approved" && item.kind === "leave" ? (
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
        title="Từ chối đơn xin nghỉ phép"
        defaultReason="Ca trực cần đảm bảo đủ nhân sự phục vụ khách hàng."
        presetReasons={[
          "Ca trực cần đảm bảo đủ nhân sự phục vụ khách hàng.",
          "Quầy lễ tân chưa có người trực thay trong ngày này.",
          "Trùng lịch hẹn khách hàng đã xác nhận trong khung giờ này.",
          "Cần nộp đơn trước thời gian quy định để sắp xếp nhân sự thay thế.",
        ]}
        onCancel={() => setRejectTarget(null)}
        onConfirm={(reason) => {
          if (rejectTarget) {
            handleReview(
              rejectTarget.source,
              rejectTarget.staffId,
              rejectTarget.reqId,
              "rejected",
              reason
            );
          }
          setRejectTarget(null);
        }}
      />

      <EmergencyLeaveDialog
        open={emergencyModalOpen}
        onOpenChange={setEmergencyModalOpen}
        expertProfiles={expertProfiles}
        onCreated={(result) => {
          setLastImpactedAppts(result);
          setStatusFilter("approved");
          setLeaveCategoryFilter("all");
          refreshRequests();
        }}
      />
    </div>
  );
}
