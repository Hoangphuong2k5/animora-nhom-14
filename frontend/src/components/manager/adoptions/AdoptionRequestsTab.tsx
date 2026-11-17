"use client";

import React, { useRef } from "react";
import { HeartHandshake, Clock, CheckCircle2, Calendar, History, RotateCcw } from "lucide-react";
import { AdoptionRequest } from "@/types";
import { formatDateDdMmYyyy, formatDateTimeDdMmYyyy, getTomorrowIso } from "@/utils/dateFormat";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import {
  getRequestStatusBadgeClass,
  getRequestStatusLabel,
} from "./managerAdoptionsData";

interface AdoptionRequestsTabProps {
  readOnly?: boolean;
  requests: AdoptionRequest[];
  selectedReq: AdoptionRequest | null;
  setSelectedReq: React.Dispatch<React.SetStateAction<AdoptionRequest | null>>;
  isReviewModalOpen: boolean;
  setIsReviewModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  interviewDate: string;
  setInterviewDate: React.Dispatch<React.SetStateAction<string>>;
  reviewNote: string;
  setReviewNote: React.Dispatch<React.SetStateAction<string>>;
  handleProcessRequest: (
    requestId: string,
    nextStatus: "pending" | "reviewing" | "approved" | "completed" | "rejected",
    extraNote?: string
  ) => void;
  handleResetRequestHistory?: (requestId: string) => void;
}

function parseRequestNotes(notes?: string): {
  commitment: string;
  historyLogs: Array<{ date: string; message: string }>;
} {
  if (!notes) return { commitment: "", historyLogs: [] };
  const logRegex = /\[((?:TCH\s*·\s*)?\d{2}-\d{2}-\d{4})\]:\s*/g;
  const matches = [...notes.matchAll(logRegex)];
  if (matches.length === 0) {
    return { commitment: notes.trim(), historyLogs: [] };
  }
  const commitment = notes.slice(0, matches[0].index).trim();
  const historyLogs = matches.map((m, idx) => {
    const start = (m.index ?? 0) + m[0].length;
    const end = idx + 1 < matches.length ? matches[idx + 1].index : notes.length;
    return {
      date: m[1].trim(),
      message: notes.slice(start, end).trim(),
    };
  });
  return { commitment, historyLogs };
}

export function AdoptionRequestsTab({
  readOnly = false,
  requests,
  selectedReq,
  setSelectedReq,
  isReviewModalOpen,
  setIsReviewModalOpen,
  interviewDate,
  setInterviewDate,
  reviewNote,
  setReviewNote,
  handleProcessRequest,
  handleResetRequestHistory,
}: AdoptionRequestsTabProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const openRequestDrawer = (req: AdoptionRequest) => {
    setSelectedReq(req);
    setInterviewDate(getTomorrowIso());
    setReviewNote("");
    setIsReviewModalOpen(true);
  };

  return (
    <>
      {/* TAB 3: HỒ SƠ XIN NHẬN NUÔI */}
      <TabsContent value="requests" className="space-y-4">
        <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
          <h3 className="text-base font-bold text-zinc-900 dark:text-foreground mb-4">
            Danh Sách Hồ Sơ Xin Nhận Nuôi Cần Phê Duyệt
          </h3>

          <Table className="w-full text-left text-xs">
            <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
              <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Mã hồ sơ</TableHead>
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Người nộp đơn</TableHead>
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Bé cưng muốn nhận</TableHead>
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Điều kiện & Cam kết</TableHead>
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Ngày gửi</TableHead>
                <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Trạng thái</TableHead>
                <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                  {readOnly ? "Chi tiết" : "Phê duyệt"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
              {requests.map((r) => {
                const { commitment } = parseRequestNotes(r.notes);
                return (
                <TableRow
                  key={r.id}
                  onClick={() => openRequestDrawer(r)}
                  className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors cursor-pointer"
                >
                  <TableCell className="py-3.5 px-3 font-mono font-bold text-zinc-900 dark:text-foreground whitespace-nowrap">
                    {r.requestCode || `REQ-${r.id.slice(0, 5)}`}
                  </TableCell>
                  <TableCell className="py-3.5 px-3 whitespace-nowrap">
                    <div className="font-bold text-zinc-900 dark:text-foreground">{r.applicantName}</div>
                    <div className="text-[11px] text-zinc-400">{r.phone}</div>
                  </TableCell>
                  <TableCell className="py-3.5 px-3 font-bold text-[#6B1F2E] dark:text-[#FF7F6B] whitespace-nowrap">
                    {r.petName}
                  </TableCell>
                  <TableCell className="py-3.5 px-3 max-w-[260px] whitespace-normal text-zinc-600 dark:text-muted-foreground italic">
                    <span className="line-clamp-2">"{commitment || r.notes}"</span>
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-zinc-500 dark:text-muted-foreground font-medium font-mono whitespace-nowrap">
                    {formatDateTimeDdMmYyyy(r.createdAt)}
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${getRequestStatusBadgeClass(
                        r.status
                      )}`}
                    >
                      {getRequestStatusLabel(r.status)}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-right whitespace-nowrap">
                    {readOnly ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openRequestDrawer(r);
                        }}
                        className="px-3 py-1.5 rounded-xl font-bold cursor-pointer text-xs transition-colors whitespace-nowrap bg-zinc-100 hover:bg-zinc-200 dark:bg-muted dark:hover:bg-muted/80 text-zinc-700 dark:text-foreground/90"
                      >
                        Xem chi tiết
                      </button>
                    ) : (() => {
                      const st = r.status ?? "pending";
                      const actionLabel =
                        st === "pending"
                          ? "Xét duyệt"
                          : st === "reviewing"
                          ? "Cập nhật KQ"
                          : st === "approved"
                          ? "Bàn giao bé"
                          : "Xem chi tiết";
                      const actionStyle =
                        st === "approved"
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : st === "reviewing"
                          ? "bg-sky-600 hover:bg-sky-700 text-white"
                          : st === "pending"
                          ? "bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white"
                          : "bg-zinc-100 hover:bg-zinc-200 dark:bg-muted dark:hover:bg-muted/80 text-zinc-700 dark:text-foreground/90";
                      return (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openRequestDrawer(r);
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer text-xs transition-colors whitespace-nowrap ${actionStyle}`}
                        >
                          {actionLabel}
                        </button>
                      );
                    })()}
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      {/* Slide-over Drawer Chi Tiết & Thẩm Định Hồ Sơ Nhận Nuôi */}
      <Sheet
        open={Boolean(isReviewModalOpen && selectedReq)}
        onOpenChange={(open) => setIsReviewModalOpen(open)}
      >
        <SheetContent
          side="right"
          showCloseButton={true}
          initialFocus={false}
          className="w-full data-[side=right]:w-full data-[side=right]:sm:max-w-lg p-0 gap-0 flex flex-col h-full bg-popover text-popover-foreground border-l border-border shadow-2xl"
        >
          {selectedReq &&
            (() => {
              const currentStatus = selectedReq.status ?? "pending";
              const isPending = currentStatus === "pending";
              const isReviewing = currentStatus === "reviewing";
              const isApproved = currentStatus === "approved";
              const isTerminal =
                currentStatus === "completed" || currentStatus === "rejected";
              const { commitment, historyLogs } = parseRequestNotes(selectedReq.notes);
              const steps = [
                { id: "pending", label: "Chờ duyệt" },
                { id: "reviewing", label: "Phỏng vấn" },
                { id: "approved", label: "Đạt yêu cầu" },
                { id: "completed", label: "Đã bàn giao" },
              ] as const;
              const activeIdx =
                currentStatus === "rejected"
                  ? -1
                  : steps.findIndex((s) => s.id === currentStatus);

              return (
                <>
                  <SheetHeader className="px-6 py-4 border-b border-border shrink-0 pr-12">
                    <SheetTitle className="text-lg font-bold flex items-center gap-2">
                      <HeartHandshake className="w-5 h-5 text-[#6B1F2E] dark:text-[#FF7F6B]" />
                      Thẩm Định Hồ Sơ &amp; Bàn Giao Thú Cưng
                    </SheetTitle>
                    <SheetDescription className="text-xs text-muted-foreground">
                      Mã hồ sơ: <strong>{selectedReq.requestCode || selectedReq.id}</strong> · Thú cưng:{" "}
                      <strong className="text-[#6B1F2E] dark:text-[#FF7F6B]">
                        {selectedReq.petName}
                      </strong>
                    </SheetDescription>
                  </SheetHeader>

                  <ScrollArea className="flex-1 overflow-y-auto px-6 py-5">
                    <div className="space-y-4 text-xs pb-4">
                      {/* Thanh tiến trình trạng thái */}
                      {currentStatus === "rejected" ? (
                        <div className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold text-center">
                          Hồ sơ đã bị từ chối — Không thể thao tác thêm
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-1.5">
                          {steps.map((step, idx) => {
                            const done = idx < activeIdx || currentStatus === "completed";
                            const current = idx === activeIdx && currentStatus !== "completed";
                            return (
                              <div
                                key={step.id}
                                className={`px-2 py-1.5 rounded-xl text-center text-[10px] font-bold border transition-colors ${
                                  done
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                                    : current
                                    ? "bg-[#6B1F2E] text-white border-[#6B1F2E]"
                                    : "bg-muted/40 text-muted-foreground border-border/60"
                                }`}
                              >
                                {idx + 1}. {step.label}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Applicant Profile */}
                      <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border space-y-2">
                        <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-foreground">
                          <span>Người đăng ký: {selectedReq.applicantName}</span>
                          <span className="text-[11px] text-zinc-500 font-normal">
                            {formatDateTimeDdMmYyyy(selectedReq.createdAt)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-zinc-600 dark:text-muted-foreground">
                          <div>
                            SĐT:{" "}
                            <span className="font-semibold text-zinc-800 dark:text-foreground">
                              {selectedReq.phone}
                            </span>
                          </div>
                          <div>
                            Email:{" "}
                            <span className="font-semibold text-zinc-800 dark:text-foreground">
                              {selectedReq.email}
                            </span>
                          </div>
                          <div>
                            Nơi ở:{" "}
                            <span className="font-semibold text-zinc-800 dark:text-foreground">
                              {selectedReq.housingType === "house" ? "Nhà riêng" : "Căn hộ"}
                            </span>
                          </div>
                          <div>
                            Thời gian ở nhà:{" "}
                            <span className="font-semibold text-zinc-800 dark:text-foreground">
                              {selectedReq.hoursAtHome || "Linh hoạt"}
                            </span>
                          </div>
                        </div>
                        {commitment && (
                          <div className="pt-2 border-t border-zinc-200/60 dark:border-border/60">
                            <span className="text-zinc-400 block mb-0.5 font-semibold">
                              Cam kết ban đầu từ ứng viên:
                            </span>
                            <p className="italic text-zinc-700 dark:text-foreground/80">
                              "{commitment}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Lịch sử xử lý hồ sơ (Timeline) */}
                      <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-foreground flex items-center gap-1.5">
                            <History className="w-4 h-4 text-[#FF7F6B]" />
                            <span>Lịch sử xử lý hồ sơ ({historyLogs.length + 1})</span>
                          </h4>
                          {!readOnly && handleResetRequestHistory && historyLogs.length > 0 && (
                            <button
                              type="button"
                              onClick={() => handleResetRequestHistory(selectedReq.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Xóa lịch sử</span>
                            </button>
                          )}
                        </div>

                        <div className="relative pl-4 space-y-3 before:absolute before:left-[5px] before:top-1.5 before:bottom-1.5 before:w-px before:bg-border">
                          <div className="relative">
                            <span className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-zinc-400 ring-4 ring-popover" />
                            <div className="text-[10px] font-mono text-muted-foreground">
                              {formatDateTimeDdMmYyyy(selectedReq.createdAt)}
                            </div>
                            <div className="font-semibold text-foreground/90 mt-0.5">
                              Ứng viên {selectedReq.applicantName} đã gửi hồ sơ xin nhận nuôi bé{" "}
                              {selectedReq.petName}.
                            </div>
                          </div>

                          {historyLogs.map((log, idx) => (
                            <div key={idx} className="relative">
                              <span className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-[#FF7F6B] ring-4 ring-popover" />
                              <div className="text-[10px] font-mono text-[#FF7F6B] font-semibold">
                                {log.date}
                              </div>
                              <div className="text-foreground/85 mt-0.5 leading-relaxed">
                                {log.message}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Chỉ chọn ngày phỏng vấn khi hồ sơ đang chờ duyệt (Manager) */}
                      {!readOnly && isPending && (
                        <div>
                          <label className="font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                            Lên lịch hẹn phỏng vấn trực tiếp:
                          </label>
                          <div
                            onClick={() => dateInputRef.current?.showPicker?.()}
                            className="relative flex items-center justify-between w-full p-2.5 px-3 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted cursor-pointer hover:border-[#FF7F6B]/60 transition-colors"
                          >
                            <span className="text-xs font-medium text-zinc-900 dark:text-foreground">
                              {interviewDate ? formatDateDdMmYyyy(interviewDate) : "Chọn ngày hẹn"}
                            </span>
                            <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
                            <input
                              ref={dateInputRef}
                              type="date"
                              min={getTomorrowIso()}
                              value={interviewDate}
                              onChange={(e) => setInterviewDate(e.target.value)}
                              aria-label="Lên lịch hẹn phỏng vấn trực tiếp"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                            />
                          </div>
                        </div>
                      )}

                      {/* Ghi chú thẩm định chỉ hiện khi hồ sơ chưa chốt (Manager) */}
                      {!readOnly && !isTerminal && (
                        <div>
                          <label className="font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                            Ghi chú thẩm định / Biên bản phỏng vấn:
                          </label>
                          <Textarea
                            rows={2}
                            placeholder="Ứng viên có kiến thức chăm sóc tốt, đã chuẩn bị rào chắn an toàn..."
                            value={reviewNote}
                            onChange={(e) => setReviewNote(e.target.value)}
                            className="w-full rounded-xl"
                          />
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Action footer cố định cuối Drawer */}
                  <div className="px-6 py-4 border-t border-border shrink-0 bg-popover space-y-2 text-xs">
                    {readOnly ? (
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-muted-foreground italic">
                          Chế độ chỉ xem (Read-Only) — Thao tác xét duyệt thuộc quyền Quản lý.
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsReviewModalOpen(false)}
                          className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs cursor-pointer"
                        >
                          Đóng
                        </button>
                      </div>
                    ) : (
                      <>
                    {isPending && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleProcessRequest(
                              selectedReq.id,
                              "reviewing",
                              `Lên lịch hẹn phỏng vấn: ${
                                interviewDate
                                  ? formatDateDdMmYyyy(interviewDate)
                                  : "Chờ xác nhận"
                              }. ${reviewNote}`
                            )
                          }
                          className="py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Clock className="w-4 h-4" />
                          <span>Hẹn Phỏng Vấn</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleProcessRequest(
                              selectedReq.id,
                              "approved",
                              `Duyệt đạt yêu cầu. ${reviewNote}`
                            )
                          }
                          className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Duyệt Đạt Yêu Cầu</span>
                        </button>
                      </div>
                    )}

                    {isReviewing && (
                      <button
                        type="button"
                        onClick={() =>
                          handleProcessRequest(
                            selectedReq.id,
                            "approved",
                            `Duyệt đạt phỏng vấn. ${reviewNote}`
                          )
                        }
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Duyệt Đạt Yêu Cầu Sau Phỏng Vấn</span>
                      </button>
                    )}

                    {isApproved && (
                      <button
                        type="button"
                        onClick={() =>
                          handleProcessRequest(
                            selectedReq.id,
                            "completed",
                            `Đã ký cam kết bảo trợ và bàn giao bé cưng. ${reviewNote}`
                          )
                        }
                        className="w-full py-2.5 px-3 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <HeartHandshake className="w-4 h-4" />
                        <span>Xác Nhận Bàn Giao Bé Cưng Cho Chủ Mới</span>
                      </button>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      {!isTerminal ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleProcessRequest(
                              selectedReq.id,
                              "rejected",
                              `Từ chối hồ sơ: ${reviewNote || "Không đáp ứng tiêu chí"}`
                            )
                          }
                          className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs cursor-pointer"
                        >
                          {isApproved ? "Hủy bàn giao / Từ chối" : "Từ chối hồ sơ"}
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          {currentStatus === "completed"
                            ? "Bé cưng đã được bàn giao cho chủ mới."
                            : "Hồ sơ đã đóng."}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsReviewModalOpen(false)}
                        className="px-3 py-1.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-muted font-bold text-xs cursor-pointer"
                      >
                        Đóng
                      </button>
                    </div>
                      </>
                    )}
                  </div>
                </>
              );
            })()}
        </SheetContent>
      </Sheet>
    </>
  );
}
