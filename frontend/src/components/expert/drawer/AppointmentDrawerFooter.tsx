"use client";

import React from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  Clock,
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
  proposeMode,
  setProposeMode,
  proposedDateTime,
  setProposedDateTime,
  onProposeAppointmentTime,
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
      {/* If pending: Accept, Propose time, Request Admin Reassignment/Cancel */}
      {isPending && !rejectMode && !proposeMode && (
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onConfirmAppointment(currentAppt.id)}
            className="py-2.5 px-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer flex items-center justify-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Nhận lịch</span>
          </button>
          <button
            type="button"
            onClick={() => setProposeMode(true)}
            className="py-2.5 px-2 rounded-xl text-xs font-bold bg-zinc-200 dark:bg-muted text-zinc-800 dark:text-foreground/90 hover:bg-zinc-300 dark:hover:bg-muted/80 transition-colors cursor-pointer flex items-center justify-center gap-1"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Đổi giờ</span>
          </button>
          <button
            type="button"
            disabled={hasPendingCancelRequest}
            onClick={() => setRejectMode(true)}
            className="py-2.5 px-2 rounded-xl text-xs font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 hover:bg-amber-200/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {hasPendingCancelRequest ? "Đã gửi Quản lý" : "Báo bận (Quản lý)"}
            </span>
          </button>
        </div>
      )}

      {/* If upcoming: Start slot button + Secondary Request Admin Reassignment/Cancel */}
      {isUpcoming && !rejectMode && !proposeMode && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => onStartAppointment(currentAppt.id)}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-[#6B1F2E]/20"
          >
            <Sparkles className="w-4 h-4 text-[#FF7F6B]" />
            <span>Bắt đầu ca phục vụ này</span>
          </button>

          {!hasPendingCancelRequest && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProposeMode(true)}
                className="py-2 px-2.5 rounded-xl text-[11px] font-bold border border-zinc-200 dark:border-border bg-white dark:bg-card text-zinc-700 dark:text-foreground/80 hover:bg-zinc-100 dark:hover:bg-muted transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>Đề xuất dời giờ</span>
              </button>
              <button
                type="button"
                onClick={() => setRejectMode(true)}
                className="py-2 px-2.5 rounded-xl text-[11px] font-bold border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100/80 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-amber-600" />
                <span>Nhờ Quản lý điều phối / hủy</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* If in_progress: Role-aware Complete Slot button */}
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
              : "Hoàn tất dịch vụ & Ghi nhận tình trạng"}
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
        proposeMode={proposeMode}
        setProposeMode={setProposeMode}
        proposedDateTime={proposedDateTime}
        setProposedDateTime={setProposedDateTime}
        onProposeAppointmentTime={onProposeAppointmentTime}
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
