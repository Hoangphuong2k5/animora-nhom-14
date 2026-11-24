import React from "react";
import { AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";
import type { AggregatedShiftRequest } from "@/utils/clinicalSync";

interface StaffShiftApprovalListProps {
  staffRequests: AggregatedShiftRequest[];
  requestRoleFilter: "all" | "care" | "vet" | "pending";
  onChangeRoleFilter: (filter: "all" | "care" | "vet" | "pending") => void;
  reviewNotes?: Record<string, string>;
  onChangeReviewNote?: (reqId: string, note: string) => void;
  onReviewRequest?: (
    expertId: string,
    reqId: string,
    staffName: string,
    decision: "approved" | "rejected"
  ) => void;
}

/** List of doctor and care staff leave, extra shift, and swap requests. */
export function StaffShiftApprovalList({
  staffRequests,
  requestRoleFilter,
  onChangeRoleFilter,
  reviewNotes,
  onChangeReviewNote,
  onReviewRequest,
}: StaffShiftApprovalListProps) {
  const filteredRequests = staffRequests.filter(({ profile, request }) => {
    if (requestRoleFilter === "care") return profile.expertType !== "vet";
    if (requestRoleFilter === "vet") return profile.expertType === "vet";
    if (requestRoleFilter === "pending") return request.status === "pending";
    return true;
  });

  return (
    <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading font-extrabold text-base text-zinc-900 dark:text-foreground">
            Duyệt Đơn Xin Nghỉ Phép Thường (Bác Sĩ &amp; NV Chăm Sóc)
          </h2>
          <p className="text-xs text-zinc-500">
            Manager duyệt đơn xin nghỉ phép thường (nghỉ cả ngày, quỹ 4 ngày/tháng, chỉ áp dụng khi ngày đó chưa có khách đặt lịch).
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(
            [
              { id: "all", label: "Tất cả" },
              { id: "care", label: "NV Chăm sóc" },
              { id: "vet", label: "Bác sĩ" },
              { id: "pending", label: "Chờ duyệt" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onChangeRoleFilter(f.id)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
                requestRoleFilter === f.id
                  ? "bg-[#6B1F2E] text-white border-transparent"
                  : "border-zinc-200 dark:border-border text-zinc-600 dark:text-zinc-300"
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
            {staffRequests.filter((item) => item.request.status === "pending").length}{" "}
            đơn chờ duyệt
          </span>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="p-6 text-center text-xs text-zinc-400">
          Không có yêu cầu nào khớp bộ lọc.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map(({ expertId, profile, request: req }) => (
            <div
              key={`${expertId}-${req.id}`}
              className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                req.policyWarnings && req.policyWarnings.length > 0
                  ? "border-amber-300 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/20"
                  : "border-zinc-200 dark:border-border bg-zinc-50/60 dark:bg-muted/30"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="font-bold text-zinc-900 dark:text-foreground flex items-center gap-2 flex-wrap">
                  <span className="text-[#6B1F2E] dark:text-[#FF7F6B]">
                    {profile.fullName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-zinc-200/80 text-zinc-700 dark:bg-muted dark:text-zinc-200">
                    {profile.expertType === "vet"
                      ? "Bác sĩ (Full-time)"
                      : "NV Chăm sóc (Full-time)"}
                  </span>
                  <span>Xin nghỉ phép thường</span>
                  <span className="text-zinc-500 font-medium">
                    • Ngày {req.date} ({!req.shift ? "Cả ngày" : req.shift})
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      req.status === "approved"
                        ? "bg-emerald-100 text-emerald-700"
                        : req.status === "rejected"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {req.status === "approved"
                      ? "Đã duyệt"
                      : req.status === "rejected"
                      ? "Đã từ chối"
                      : "Chờ duyệt"}
                  </span>
                </div>
              </div>

              <p className="text-zinc-600 dark:text-zinc-300 italic">
                Lý do: &ldquo;{req.reason}&rdquo;
              </p>

              {req.policyWarnings && req.policyWarnings.length > 0 && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 space-y-1">
                  {req.policyWarnings.map((w, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-1.5 font-bold text-[11px]"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}

              {req.status === "pending" ? (
                onReviewRequest ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-zinc-200/60 dark:border-border/60">
                    <input
                      type="text"
                      value={reviewNotes?.[req.id] || ""}
                      onChange={(e) =>
                        onChangeReviewNote?.(req.id, e.target.value)
                      }
                      placeholder="Ghi chú phản hồi cho chuyên viên (tùy chọn)..."
                      className="flex-1 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card text-xs focus:outline-none focus:ring-1 focus:ring-[#FF7F6B]"
                    />
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          onReviewRequest(
                            expertId,
                            req.id,
                            profile.fullName,
                            "approved"
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Phê duyệt</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onReviewRequest(
                            expertId,
                            req.id,
                            profile.fullName,
                            "rejected"
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Từ chối</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-500">
                    <Clock className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                    <span>Đang chờ Quản lý nghiệp vụ phê duyệt (Chế độ chỉ xem)</span>
                  </div>
                )
              ) : (
                req.adminNote && (
                  <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    Phản hồi đã lưu: {req.adminNote}
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
