"use client";

import React from "react";
import Link from "next/link";
import {
  BriefcaseMedical,
  CheckCircle2,
  Clock,
  FileHeart,
  Pill,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { ROUTES } from "@/constants/config.constant";
import {
  CareServiceStage,
  ExpertAppointment,
  MedicalRecord,
  Prescription,
} from "@/types/expert.type";
import { CARE_SERVICE_STAGES, getCareStageMeta } from "@/utils/expertPolicy";
import {
  CompleteSlotForm,
  ProposeTimeForm,
  RejectForm,
} from "../appointments/AppointmentActionForms";

interface AppointmentCareAndActionFormsProps {
  currentAppt: ExpertAppointment;
  isVet: boolean;
  isExamStarted: boolean;
  isCompleted: boolean;
  linkedMedicalRecord?: MedicalRecord;
  linkedPrescription?: Prescription;
  careStepNote: string;
  onCareStepNoteChange: (val: string) => void;
  onAdvanceCareStage: (
    apptId: string,
    stage: CareServiceStage,
    note: string
  ) => void;
  onOpenMedicalModal?: (appt: ExpertAppointment) => void;
  onOpenPrescriptionWizard?: (appt: ExpertAppointment) => void;
}

export function AppointmentCareAndActionForms({
  currentAppt,
  isVet,
  isExamStarted,
  isCompleted,
  linkedMedicalRecord,
  linkedPrescription,
  careStepNote,
  onCareStepNoteChange,
  onAdvanceCareStage,
  onOpenMedicalModal,
  onOpenPrescriptionWizard,
}: AppointmentCareAndActionFormsProps) {
  return (
    <>
      {/* 6. [Bác sĩ] 2-Step Clinical Workflow: Bước 1 (Ghi bệnh án SOAP) -> Bước 2 (Kê đơn thuốc) */}
      {isVet && (
        <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-border bg-zinc-50/80 dark:bg-card/50 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-zinc-800 dark:text-foreground">
              <Stethoscope className="w-4 h-4 text-[#6B1F2E] dark:text-[#FF7F6B]" />
              <span>Quy trình Lâm sàng Bác sĩ Thú Y</span>
            </div>
            {!isExamStarted && !isCompleted ? (
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                Mở khóa khi bắt đầu ca
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-zinc-400">
                Theo trình tự Bước 1 → Bước 2
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Step 1: Ghi bệnh án SOAP (Soft Blush / Warm Cream #FBE3E3) */}
            <button
              type="button"
              disabled={!isExamStarted && !isCompleted}
              onClick={() =>
                onOpenMedicalModal && onOpenMedicalModal(currentAppt)
              }
              className="flex flex-col items-start justify-between p-2.5 rounded-xl text-left border border-[#EBCFC6] dark:border-[#FF7F6B]/35 bg-[#FBE3E3]/80 hover:bg-[#FBE3E3] dark:bg-[#5A2031] dark:hover:bg-[#6E2E40] text-[#6B1F2E] dark:text-[#FFF4E8] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
            >
              <div className="flex items-center justify-between w-full">
                <span className="px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-[#FF7F6B]/20 text-[#6B1F2E] dark:text-[#FF7F6B] text-[9px] font-extrabold uppercase tracking-wider">
                  Bước 1 • Khám SOAP
                </span>
                <FileHeart className="w-3.5 h-3.5 text-[#FF7F6B]" />
              </div>
              <div className="font-bold text-xs mt-1.5">
                {linkedMedicalRecord
                  ? "Xem bệnh án đã lưu"
                  : "Ghi bệnh án lâm sàng"}
              </div>
              <div className="text-[10px] text-[#7A4A55] dark:text-[#E5BFC4] mt-0.5 flex items-center gap-1">
                {linkedMedicalRecord ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Đã lưu • Nhấn để xem hồ sơ</span>
                  </>
                ) : (
                  <span>Đo sinh tồn & Chẩn đoán</span>
                )}
              </div>
            </button>

            {/* Step 2: Kê đơn thuốc (Wine #6B1F2E) */}
            <button
              type="button"
              disabled={!isExamStarted && !isCompleted}
              onClick={() =>
                onOpenPrescriptionWizard &&
                onOpenPrescriptionWizard(currentAppt)
              }
              className="flex flex-col items-start justify-between p-2.5 rounded-xl text-left bg-[#6B1F2E] hover:bg-[#521723] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
            >
              <div className="flex items-center justify-between w-full">
                <span className="px-1.5 py-0.5 rounded-md bg-white/15 text-[9px] font-extrabold uppercase tracking-wider">
                  Bước 2 • Đơn thuốc
                </span>
                <Pill className="w-3.5 h-3.5 text-[#FF7F6B]" />
              </div>
              <div className="font-bold text-xs mt-1.5">
                Kê đơn thuốc điện tử
              </div>
              <div className="text-[10px] text-rose-100/90 mt-0.5 flex items-center gap-1">
                {linkedPrescription ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-300 shrink-0" />
                    <span>Đã phát hành ({linkedPrescription.code})</span>
                  </>
                ) : (
                  <span>Chọn dược phẩm & Liều dùng</span>
                )}
              </div>
            </button>
          </div>

          {isExamStarted && (
            <Link
              href={ROUTES.EXPERT_MEDICINE_BOX}
              className="w-full py-2 px-3 rounded-xl border border-[#6B1F2E]/25 dark:border-[#FF7F6B]/30 bg-white dark:bg-card/80 hover:bg-[#FFF4E8] dark:hover:bg-[#3A1620] text-[#6B1F2E] dark:text-[#FF7F6B] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <BriefcaseMedical className="w-3.5 h-3.5" />
              <span>Ghi nhận dùng thuốc tại phòng từ Tủ thuốc cá nhân</span>
            </Link>
          )}
        </div>
      )}

      {/* 6B. [NV Chăm sóc] Tiến trình 4 bước thực hiện dịch vụ chăm sóc */}
      {!isVet &&
        (isExamStarted || isCompleted) &&
        (() => {
          const activeStage: CareServiceStage =
            currentAppt.careStage ||
            (isCompleted ? "ready_handover" : "checked_in");
          const currentStepNum = getCareStageMeta(activeStage).stepNumber;

          return (
            <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-border bg-zinc-50/80 dark:bg-card/50 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-zinc-800 dark:text-foreground">
                  <Sparkles className="w-4 h-4 text-[#FF7F6B]" />
                  <span>Tiến trình dịch vụ chăm sóc (4 bước)</span>
                </div>
                {currentAppt.managerConfirmedAt ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>QL đã xác nhận</span>
                  </span>
                ) : activeStage === "ready_handover" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                    <Clock className="w-3 h-3" />
                    <span>Chờ Quản lý xác nhận</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-[#6B1F2E] dark:text-[#FF7F6B]">
                    Bước {currentStepNum}/4
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                {CARE_SERVICE_STAGES.map((st) => {
                  const isDone =
                    st.stepNumber < currentStepNum ||
                    (isCompleted && st.stepNumber <= currentStepNum);
                  const isCurrent = st.id === activeStage && !isCompleted;
                  const canAdvanceHere =
                    isExamStarted && st.stepNumber > currentStepNum;

                  return (
                    <div
                      key={st.id}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-colors ${
                        isCurrent
                          ? "border-[#6B1F2E] bg-[#6B1F2E]/5 dark:border-[#FF7F6B] dark:bg-[#FF7F6B]/10"
                          : isDone
                          ? "border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                          : "border-zinc-200/80 bg-white dark:border-border dark:bg-card/60"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-zinc-900 dark:text-foreground flex items-center gap-1.5">
                          <span
                            className={`w-4 h-4 rounded-full text-[10px] font-extrabold inline-flex items-center justify-center shrink-0 ${
                              isDone
                                ? "bg-emerald-600 text-white"
                                : isCurrent
                                ? "bg-[#6B1F2E] text-white"
                                : "bg-zinc-200 dark:bg-muted text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            {st.stepNumber}
                          </span>
                          <span className="truncate">{st.label}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-0.5 pl-5.5">
                          {st.description}
                        </p>
                      </div>

                      {canAdvanceHere && (
                        <button
                          type="button"
                          onClick={() => {
                            onAdvanceCareStage(
                              currentAppt.id,
                              st.id,
                              careStepNote
                            );
                            onCareStepNoteChange("");
                          }}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] shrink-0 cursor-pointer"
                        >
                          Cập nhật
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {isExamStarted && currentStepNum < 4 && (
                <input
                  type="text"
                  value={careStepNote}
                  onChange={(e) => onCareStepNoteChange(e.target.value)}
                  placeholder="Ghi chú nhanh cho bước sắp cập nhật (tùy chọn)..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card text-[11px]"
                />
              )}

              {currentAppt.managerConfirmedAt && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-[11px] text-emerald-800 dark:text-emerald-300">
                  <strong>
                    {currentAppt.managerConfirmedBy ||
                      "Manager"}
                  </strong>{" "}
                  đã xác nhận lúc{" "}
                  {currentAppt.managerConfirmedAt.replace("T", " ")}
                  {currentAppt.managerConfirmNote
                    ? ` — "${currentAppt.managerConfirmNote}"`
                    : ""}
                </div>
              )}
            </div>
          );
        })()}
    </>
  );
}

export interface AppointmentInlineActionFormsProps {
  currentAppt: ExpertAppointment;
  isVet: boolean;
  rejectMode: boolean;
  setRejectMode: (val: boolean) => void;
  rejectReason: string;
  setRejectReason: (val: string) => void;
  onRejectAppointment: (apptId: string, reason: string) => void;
  proposeMode: boolean;
  setProposeMode: (val: boolean) => void;
  proposedDateTime: string;
  setProposedDateTime: (val: string) => void;
  onProposeAppointmentTime: (apptId: string, dateTime: string) => void;
  completeMode: boolean;
  setCompleteMode: (val: boolean) => void;
  completionNote: string;
  setCompletionNote: (val: string) => void;
  petCondition: string;
  setPetCondition: (val: string) => void;
  followUpDate: string;
  onCompleteAppointment: (
    apptId: string,
    note: string,
    condition: string,
    followUpDate: string
  ) => void;
  onClose: () => void;
}

export function AppointmentInlineActionForms({
  currentAppt,
  isVet,
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
  onClose,
}: AppointmentInlineActionFormsProps) {
  return (
    <>
      {/* Request Admin Reassignment / Cancellation Form */}
      {rejectMode && (
        <RejectForm
          reason={rejectReason}
          onReasonChange={setRejectReason}
          isVet={isVet}
          onConfirm={() => {
            if (!rejectReason.trim()) return;
            onRejectAppointment(currentAppt.id, rejectReason.trim());
            setRejectReason("");
            setRejectMode(false);
          }}
          onCancel={() => setRejectMode(false)}
        />
      )}

      {/* Propose Time Form Sub-Component */}
      {proposeMode && (
        <ProposeTimeForm
          dateTime={proposedDateTime}
          onDateTimeChange={setProposedDateTime}
          onConfirm={() => {
            if (!proposedDateTime) return;
            onProposeAppointmentTime(currentAppt.id, proposedDateTime);
            setProposeMode(false);
          }}
          onCancel={() => setProposeMode(false)}
        />
      )}

      {/* Complete Slot Form Sub-Component */}
      {completeMode && (
        <CompleteSlotForm
          completionNote={completionNote}
          onNoteChange={setCompletionNote}
          petCondition={petCondition}
          onConditionChange={setPetCondition}
          isVet={isVet}
          onConfirm={() => {
            onCompleteAppointment(
              currentAppt.id,
              completionNote ||
                (isVet
                  ? "Đã hoàn tất khám lâm sàng và tư vấn cho chủ nuôi."
                  : ""),
              petCondition || "Tỉnh táo, ổn định",
              followUpDate
            );
            setCompleteMode(false);
            onClose();
          }}
          onCancel={() => setCompleteMode(false)}
        />
      )}
    </>
  );
}
