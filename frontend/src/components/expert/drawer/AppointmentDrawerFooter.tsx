"use client";

import React from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  Send,
  Sparkles,
} from "lucide-react";
import {
  AppointmentInlineActionForms,
  AppointmentInlineActionFormsProps,
} from "./AppointmentCareAndActionForms";

interface AppointmentDrawerFooterProps
  extends AppointmentInlineActionFormsProps {
  isPending: boolean;
  isUpcoming: boolean;
  isExamStarted: boolean;
  hasPendingCancelRequest: boolean;
  onConfirmAppointment: (apptId: string) => void;
  onStartAppointment: (apptId: string) => void;
}

export function AppointmentDrawerFooter({
  currentAppt,
  isVet,
  isPending,
  isUpcoming,
  isExamStarted,
  hasPendingCancelRequest,
  rejectMode,
  setRejectMode,
  rejectReason,
  setRejectReason,
  onRejectAppointment,
  completeMode,
  setCompleteMode,
  completionNote,
  setCompletionNote,
  petCondition,
  setPetCondition,
  followUpDate,
  onCompleteAppointment,
  onConfirmAppointment,
  onStartAppointment,
  onClose,
}: AppointmentDrawerFooterProps) {
  return (
    <div className="p-4 border-t border-zinc-200/80 dark:border-border bg-zinc-50/50 dark:bg-card/50 space-y-2 shrink-0">
      {/* If pending: Accept or Request Manager Reassignment (Nghỉ đột xuất) */}
      {isPending && !rejectMode && (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onConfirmAppointment(currentAppt.id)}
            className="py-2.5 px-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer flex items-center justify-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isVet ? "Nhận lịch khám" : "Tiếp nhận ca"}</span>
          </button>
          <button
            type="button"
            disabled={hasPendingCancelRequest}
            onClick={() => setRejectMode(true)}
            className="py-2.5 px-2 rounded-xl text-xs font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 hover:bg-amber-200/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {hasPendingCancelRequest ? "Đã gửi Quản lý" : "Báo Quản lý điều phối"}
            </span>
          </button>
        </div>
      )}

      {/* If upcoming: Start slot button (Chờ -> Đang làm) + Secondary Request Manager Reassignment */}
      {isUpcoming && !rejectMode && (
        <div className="space-y-2">
          {!currentAppt.checkedInAt && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300">
              Chưa ghi nhận Lễ tân check-in tại quầy — vẫn có thể bấm bắt đầu nếu bé đã vào phòng.
            </div>
          )}
          <button
            type="button"
            onClick={() => onStartAppointment(currentAppt.id)}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-[#6B1F2E]/20"
          >
            <Sparkles className="w-4 h-4 text-[#FF7F6B]" />
            <span>
              {isVet
                ? "Bắt đầu ca khám này"
                : "Bắt đầu thực hiện dịch vụ (Chờ → Đang làm)"}
            </span>
          </button>

          {!hasPendingCancelRequest && (
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => setRejectMode(true)}
                className="py-2 px-2.5 rounded-xl text-[11px] font-bold border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100/80 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-amber-600" />
                <span>Báo Quản lý điều phối (Nghỉ đột xuất)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* If in_progress: Role-aware Complete Slot button (Đang làm -> Xong) */}
      {isExamStarted && !completeMode && (
        <button
          type="button"
          onClick={() => setCompleteMode(true)}
          className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>
            {isVet
              ? "Hoàn tất & Đóng ca khám này"
              : "Hoàn thành dịch vụ (Đang làm → Xong)"}
          </span>
        </button>
      )}

      <AppointmentInlineActionForms
        currentAppt={currentAppt}
        isVet={isVet}
        rejectMode={rejectMode}
        setRejectMode={setRejectMode}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        onRejectAppointment={onRejectAppointment}
        completeMode={completeMode}
        setCompleteMode={setCompleteMode}
        completionNote={completionNote}
        setCompletionNote={setCompletionNote}
        petCondition={petCondition}
        setPetCondition={setPetCondition}
        followUpDate={followUpDate}
        onCompleteAppointment={onCompleteAppointment}
        onClose={onClose}
      />
    </div>
  );
}
