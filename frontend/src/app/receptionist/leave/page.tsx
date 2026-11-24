"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarOff,
  CheckCircle2,
  Clock,
  Info,
  Lock,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  RECEPTIONIST_LEAVE_TYPE_LABELS,
  RECEPTIONIST_SYNC_EVENT,
  cancelReceptionistLeaveRequest,
  evaluateReceptionistMonthlyLeaveQuota,
  readReceptionistLeaveRequests,
  submitReceptionistLeaveRequest,
  type ReceptionistLeaveRequest,
  type ReceptionistLeaveType,
} from "@/data/receptionistOpsData";
import { useReceptionistActor } from "@/hooks/receptionist/useReceptionistActor";
import { getTodayLocalIso } from "@/data/serviceBookingData";
import {
  getCurrentWeekMondayIso,
  isDateInPastWeek,
} from "@/utils/expertPolicy";
import { formatDateDdMmYyyy } from "@/utils/dateFormat";

export default function ReceptionistLeavePage() {
  const actor = useReceptionistActor();
  const todayIso = useMemo(() => getTodayLocalIso(), []);
  const minAllowedDate = useMemo(
    () => getCurrentWeekMondayIso(todayIso),
    [todayIso]
  );

  const [requests, setRequests] = useState<ReceptionistLeaveRequest[]>(() =>
    typeof window !== "undefined" ? readReceptionistLeaveRequests() : []
  );
  const [date, setDate] = useState<string>(todayIso);
  const [leaveType, setLeaveType] =
    useState<ReceptionistLeaveType>("rotational");
  const [reason, setReason] = useState<string>("");

  const reload = useCallback(() => {
    setRequests(readReceptionistLeaveRequests());
  }, []);

  useEffect(() => {
    window.addEventListener(RECEPTIONIST_SYNC_EVENT, reload);
    window.addEventListener("storage", reload);
    return () => {
      window.removeEventListener(RECEPTIONIST_SYNC_EVENT, reload);
      window.removeEventListener("storage", reload);
    };
  }, [reload]);

  const myRequests = useMemo(
    () =>
      requests
        .filter((r) => r.staffId === actor.actorId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [requests, actor.actorId]
  );

  const targetMonthIso = date || todayIso;
  const quota = useMemo(
    () =>
      evaluateReceptionistMonthlyLeaveQuota(
        requests,
        actor.actorId,
        targetMonthIso
      ),
    [requests, actor.actorId, targetMonthIso]
  );

  const isPastWeek = isDateInPastWeek(date, todayIso);
  const isSunday = Boolean(date && new Date(`${date}T00:00:00`).getDay() === 0);
  const isDuplicateDate = myRequests.some(
    (r) => r.date === date && r.status !== "rejected"
  );
  const usedPercent = Math.min(
    100,
    Math.round((quota.usedDays / quota.maxDays) * 100)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = submitReceptionistLeaveRequest({
      staffId: actor.actorId,
      staffName: actor.actorName,
      staffEmail: actor.actorEmail,
      date,
      leaveType,
      reason,
      referenceDateIso: todayIso,
    });
    if (!res.ok) {
      toast.error(res.error || "Không thể gửi đơn xin nghỉ phép.");
      return;
    }
    toast.success(
      "Đã gửi đơn xin nghỉ phép tới Quản lý (không ảnh hưởng lịch hẹn khách hàng)."
    );
    setReason("");
    reload();
  };

  const handleCancel = (reqId: string) => {
    const res = cancelReceptionistLeaveRequest(reqId, {
      id: actor.actorId,
      name: actor.actorName,
    });
    if (!res.ok) {
      toast.error(res.error || "Không thể hủy đơn.");
      return;
    }
    toast.success("Đã hủy đơn xin nghỉ phép.");
    reload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
            <CalendarOff className="w-6 h-6 text-[#6B1F2E] dark:text-[#FF7F6B]" />
            Xin Nghỉ Phép (Lễ Tân)
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-muted-foreground mt-1">
            Gửi đơn nghỉ nguyên ngày lên Quản lý để theo dõi chấm công &amp; bố
            trí người trực quầy.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-muted text-xs font-semibold text-zinc-700 dark:text-zinc-300 w-fit">
          <span>Nhân sự:</span>
          <span className="font-bold text-zinc-900 dark:text-foreground">
            {actor.actorName}
          </span>
        </div>
      </div>

      {/* Quota Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-card border border-zinc-200/80 dark:border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span className="font-semibold">Quỹ nghỉ tháng {quota.month}</span>
            <Clock className="w-4 h-4 text-[#6B1F2E] dark:text-[#FF7F6B]" />
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 dark:text-foreground">
            {quota.usedDays} / {quota.maxDays}{" "}
            <span className="text-xs font-semibold text-zinc-500">ngày</span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-muted overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all ${
                quota.isAtOrOverLimit
                  ? "bg-rose-500"
                  : quota.usedDays === quota.maxDays - 1
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${usedPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-zinc-400">
            Còn lại {quota.remainingDays} ngày • Reset ngày 01 hàng tháng
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-card border border-zinc-200/80 dark:border-border shadow-xs">
          <div className="text-xs font-semibold text-zinc-500">
            Nghỉ luân phiên
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 dark:text-foreground mt-1">
            {quota.rotationalDays}{" "}
            <span className="text-xs font-semibold text-zinc-500">ngày</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Nghỉ định kỳ ~1 ngày/tuần
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-card border border-zinc-200/80 dark:border-border shadow-xs">
          <div className="text-xs font-semibold text-zinc-500">Nghỉ ốm</div>
          <div className="text-2xl font-extrabold text-zinc-900 dark:text-foreground mt-1">
            {quota.sickDays}{" "}
            <span className="text-xs font-semibold text-zinc-500">ngày</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Tính chung vào quỹ 4 ngày/tháng
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-card border border-zinc-200/80 dark:border-border shadow-xs">
          <div className="text-xs font-semibold text-zinc-500">
            Nghỉ không lương
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 dark:text-foreground mt-1">
            {quota.unpaidDays}{" "}
            <span className="text-xs font-semibold text-zinc-500">ngày</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Vượt 4 ngày tự gắn cờ không lương
          </p>
        </div>
      </div>

      {/* Main 2-column layout: Form + History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Submit Leave Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-card border border-zinc-200/80 dark:border-border shadow-xs space-y-4 h-fit"
        >
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-foreground">
              Tạo Đơn Xin Nghỉ Phép
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Chỉ áp dụng nghỉ nguyên ngày (Thứ 2 – Thứ 7).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200/70 dark:border-sky-900 text-xs text-sky-800 dark:text-sky-300 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Đơn nghỉ của Lễ tân <strong>không khóa slot đặt lịch</strong> của
              khách hàng và không bị chặn bởi lịch khám. Khi gửi đơn, Quản lý sẽ
              nhận cảnh báo <strong>bố trí người trực quầy thay thế</strong>.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Ngày xin nghỉ (nguyên ngày)
            </label>
            <input
              type="date"
              value={date}
              min={minAllowedDate}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-background text-sm font-medium"
            />
            {isPastWeek && (
              <p className="text-[11px] text-rose-600 font-semibold">
                Không thể tạo đơn cho các tuần đã qua (tối thiểu từ{" "}
                {formatDateDdMmYyyy(minAllowedDate)}).
              </p>
            )}
            {isSunday && (
              <p className="text-[11px] text-rose-600 font-semibold">
                Chủ Nhật là ngày nghỉ cố định của phòng khám (Thứ 2 – Thứ 7),
                không cần gửi đơn xin nghỉ.
              </p>
            )}
            {isDuplicateDate && (
              <p className="text-[11px] text-rose-600 font-semibold">
                Bạn đã có đơn xin nghỉ phép cho ngày {formatDateDdMmYyyy(date)}.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Loại nghỉ phép
            </label>
            <select
              value={leaveType}
              onChange={(e) =>
                setLeaveType(e.target.value as ReceptionistLeaveType)
              }
              className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-background text-sm font-medium"
            >
              {(
                Object.entries(RECEPTIONIST_LEAVE_TYPE_LABELS) as [
                  ReceptionistLeaveType,
                  string
                ][]
              ).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Lý do xin nghỉ <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
              placeholder="Ví dụ: Việc gia đình, khám sức khỏe định kỳ, đăng ký ngày nghỉ luân phiên..."
              className="w-full p-3 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-background text-sm resize-none"
            />
          </div>

          {quota.exceedsOnNewRequest && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{quota.warningMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={
              isPastWeek || isSunday || isDuplicateDate || reason.trim().length < 4
            }
            className="w-full h-10 rounded-xl bg-[#6B1F2E] hover:bg-[#581825] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Gửi Đơn Xin Nghỉ Phép
          </button>
        </form>

        {/* Request History Table */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-card border border-zinc-200/80 dark:border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900 dark:text-foreground">
              Lịch Sử Đơn Xin Nghỉ ({myRequests.length})
            </h2>
            <span className="text-xs text-zinc-400">
              Đồng bộ 2 chiều với Quản lý
            </span>
          </div>

          {myRequests.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-400 border border-dashed border-zinc-200 dark:border-border rounded-xl">
              Chưa có đơn xin nghỉ phép nào.
            </div>
          ) : (
            <div className="space-y-3">
              {myRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-zinc-200/80 dark:border-border bg-zinc-50/50 dark:bg-muted/20 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-extrabold text-zinc-900 dark:text-foreground">
                        {formatDateDdMmYyyy(req.date)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-zinc-200/70 dark:bg-muted text-zinc-700 dark:text-zinc-300">
                        Cả ngày •{" "}
                        {req.leaveType === "rotational"
                          ? "Nghỉ luân phiên"
                          : req.leaveType === "sick"
                          ? "Nghỉ ốm"
                          : "Nghỉ không lương"}
                      </span>
                      {req.status === "pending" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          <Clock className="w-3 h-3" /> Chờ duyệt
                        </span>
                      )}
                      {req.status === "approved" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" /> Đã duyệt
                        </span>
                      )}
                      {req.status === "rejected" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                          <XCircle className="w-3 h-3" /> Từ chối
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-700 dark:text-zinc-300">
                      {req.reason}
                    </p>

                    {req.exceedsMonthlyLeaveLimit && (
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Vượt quỹ 4 ngày/tháng (Nghỉ không lương)
                      </div>
                    )}

                    {req.managerNote && (
                      <div className="text-xs text-zinc-600 dark:text-zinc-300 bg-white dark:bg-card border border-zinc-200/80 dark:border-border px-2.5 py-1.5 rounded-lg">
                        <span className="font-bold">Phản hồi Quản lý:</span>{" "}
                        {req.managerNote}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0">
                    {req.status === "pending" ? (
                      <button
                        type="button"
                        onClick={() => handleCancel(req.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hủy đơn
                      </button>
                    ) : req.status === "approved" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 italic">
                        <Lock className="w-3 h-3" /> Đã chốt lịch
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
