"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  CreditCard,
  FileHeart,
  Info,
  Phone,
  Pill,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  UserCheck,
} from "lucide-react";
import { ExpertAppointment } from "@/types/expert.type";
import { useExpert } from "./ExpertProvider";
import { StatusBadge } from "./StatusBadge";
import { computeCancellationFee } from "@/data/expertPortalData";
import {
  CompleteSlotForm,
  ProposeTimeForm,
  RejectForm,
} from "./appointments/AppointmentActionForms";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AppointmentDrawerProps {
  appointment: ExpertAppointment | null;
  onClose: () => void;
  onOpenMedicalModal?: (appt: ExpertAppointment) => void;
  onOpenPrescriptionWizard?: (appt: ExpertAppointment) => void;
}

export function AppointmentDrawer({
  appointment,
  onClose,
  onOpenMedicalModal,
  onOpenPrescriptionWizard,
}: AppointmentDrawerProps) {
  const {
    store,
    allPets,
    allOwners,
    allServices,
    isVet,
    startAppointment,
    completeAppointment,
    rejectAppointment,
    proposeAppointmentTime,
    acceptReschedule,
  } = useExpert();

  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [proposeMode, setProposeMode] = useState(false);
  const [proposedDateTime, setProposedDateTime] = useState("");

  const [completeMode, setCompleteMode] = useState(false);
  const [completionNote, setCompletionNote] = useState("");
  const [petCondition, setPetCondition] = useState("");
  const [followUpDate] = useState("");

  return (
    <Sheet
      open={Boolean(appointment)}
      onOpenChange={(open) => {
        if (!open) {
          setRejectMode(false);
          setProposeMode(false);
          setCompleteMode(false);
          onClose();
        }
      }}
    >
      <SheetContent
        side="right"
        showCloseButton={true}
        className="w-full data-[side=right]:w-full data-[side=right]:sm:max-w-lg p-0 gap-0 flex flex-col h-full bg-white dark:bg-background text-zinc-900 dark:text-foreground border-l border-zinc-200 dark:border-border shadow-2xl"
      >
        {appointment &&
          (() => {
            // Always read the latest state from store.appointments so updates reflect live
            const currentAppt =
              store.appointments.find((a) => a.id === appointment.id) ||
              appointment;

            const pet = allPets.find((p) => p.id === currentAppt.petId);
            const owner = allOwners.find((o) => o.id === currentAppt.ownerId);
            const service = allServices.find(
              (s) => s.id === currentAppt.serviceId
            );

            const price = service?.price ?? 250000;
            const cancelFee = computeCancellationFee(
              currentAppt,
              price,
              currentAppt.cancelledAt
            );

            const isExamStarted = currentAppt.status === "in_progress";
            const isPending = currentAppt.status === "pending";
            const isUpcoming = currentAppt.status === "upcoming";
            const isCompleted = currentAppt.status === "completed";
            const isCancelled = currentAppt.status === "cancelled";

            const hasPendingCancelRequest =
              currentAppt.cancelRequest?.status === "pending_admin";

            // Check if this appointment already has a saved medical record or prescription
            const linkedMedicalRecord = store.medicalRecords.find(
              (r) =>
                r.appointmentId === currentAppt.id ||
                r.id === currentAppt.medicalRecordId
            );
            const linkedPrescription = store.prescriptions.find(
              (rx) =>
                rx.appointmentId === currentAppt.id ||
                rx.id === currentAppt.prescriptionId
            );

            const isPaid = currentAppt.paymentState === "paid";

            return (
              <>
                {/* Header */}
                <SheetHeader className="p-5 pr-12 border-b border-zinc-200/80 dark:border-border bg-zinc-50/50 dark:bg-card/50 shrink-0 gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <SheetTitle className="font-heading font-extrabold text-base text-zinc-900 dark:text-foreground">
                      {currentAppt.code}
                    </SheetTitle>
                    <StatusBadge status={currentAppt.status} />
                    {hasPendingCancelRequest && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800">
                        Chờ Admin điều phối / duyệt hủy
                      </span>
                    )}
                  </div>
                  <SheetDescription className="text-xs text-zinc-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Thời gian hẹn:</span>
                    <span className="font-bold text-zinc-800 dark:text-foreground/90">
                      {currentAppt.startAt.replace("T", " ")}
                    </span>
                  </SheetDescription>
                </SheetHeader>

                {/* Drawer Body Scrollable */}
                <ScrollArea className="flex-1 min-h-0 overflow-hidden">
                  <div className="p-5 space-y-3.5">
                    {/* 1. Pending Admin Reassignment / Cancellation Banner */}
                    {hasPendingCancelRequest && currentAppt.cancelRequest && (
                      <div className="p-3.5 rounded-2xl border border-amber-300 dark:border-amber-800/70 bg-amber-50/90 dark:bg-amber-950/30 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-extrabold text-amber-900 dark:text-amber-200">
                            <Send className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Đang chờ Admin điều phối / duyệt hủy ca</span>
                          </div>
                          <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                            {currentAppt.cancelRequest.requestedAt
                              .replace("T", " ")
                              .slice(0, 16)}
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-snug">
                          Lý do đã gửi:{" "}
                          <strong className="italic">
                            &ldquo;{currentAppt.cancelRequest.reason}&rdquo;
                          </strong>
                        </p>
                        <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80">
                          * Lịch hẹn của khách hàng vẫn được giữ nguyên trên hệ
                          thống cho đến khi Admin phân công nhân sự thay thế
                          hoặc duyệt hủy chính thức.
                        </p>
                      </div>
                    )}

                    {/* 2. Reschedule Request Notice (Only when customer requested reschedule) */}
                    {currentAppt.rescheduleRequest && (
                      <div className="p-3.5 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/90 dark:bg-amber-950/20 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Khách yêu cầu dời lịch hẹn</span>
                        </div>
                        <div className="text-xs text-amber-900 dark:text-amber-200">
                          Khách đề xuất chuyển sang:{" "}
                          <strong className="underline">
                            {currentAppt.rescheduleRequest.requestedStartAt.replace(
                              "T",
                              " "
                            )}
                          </strong>
                        </div>
                        <div className="text-[11px] text-amber-700 dark:text-amber-400 italic">
                          &ldquo;{currentAppt.rescheduleRequest.reason}&rdquo;
                        </div>
                        <button
                          type="button"
                          onClick={() => acceptReschedule(currentAppt.id)}
                          className="mt-1 w-full py-1.5 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition-colors cursor-pointer"
                        >
                          Đồng ý đổi sang giờ này
                        </button>
                      </div>
                    )}

                    {/* 3. Cancelled Appointment Banner (ONLY shown when status === 'cancelled') */}
                    {isCancelled && (
                      <div className="p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/80 dark:bg-rose-950/20 space-y-1.5 text-xs text-rose-900 dark:text-rose-200">
                        <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400">
                          <ShieldAlert className="w-4 h-4 shrink-0" />
                          <span>
                            Ca hẹn đã hủy (
                            {currentAppt.cancelledBy === "customer"
                              ? "Khách hàng hủy"
                              : "Admin đã duyệt hủy"}
                            )
                          </span>
                        </div>
                        {currentAppt.cancelReason && (
                          <p className="text-[11px] font-medium text-rose-800 dark:text-rose-300">
                            Lý do hủy: &ldquo;{currentAppt.cancelReason}&rdquo;
                          </p>
                        )}
                        <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80">
                          Phí hủy áp dụng:{" "}
                          <strong>
                            {cancelFee.feeVnd.toLocaleString("vi-VN")}đ
                          </strong>{" "}
                          ({cancelFee.feePercentage}% giá dịch vụ)
                        </p>
                      </div>
                    )}

                    {/* 4. Unified Patient & Clinical Intake Card */}
                    {pet && (
                      <div className="p-3.5 rounded-2xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/60 space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                            Hồ sơ Bệnh nhân & Tiếp nhận
                          </span>
                          <a
                            href={`/expert/health-records?petId=${pet.id}`}
                            className="text-xs font-bold text-[#6B1F2E] dark:text-[#FF7F6B] hover:underline flex items-center gap-1"
                          >
                            <span>Xem sổ sức khỏe</span>
                            <span>→</span>
                          </a>
                        </div>

                        {/* Pet Avatar + Core Info */}
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-zinc-200 dark:border-border shrink-0">
                            <img
                              src={pet.photo}
                              alt={pet.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-heading font-extrabold text-base text-zinc-900 dark:text-foreground flex items-center gap-1.5 flex-wrap">
                              <span>{pet.name}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-muted text-zinc-600 dark:text-foreground/80">
                                {pet.gender === "male" ? "Đực" : "Cái"}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FBE3E3]/80 dark:bg-[#FF7F6B]/15 text-[#6B1F2E] dark:text-[#FF7F6B]">
                                {pet.weightKg} kg
                              </span>
                            </div>
                            <div className="text-xs text-zinc-500 font-medium truncate mt-0.5">
                              {pet.breed}
                            </div>
                          </div>
                        </div>

                        {/* Critical Medical Allergy Alert (High-contrast Red Badge) */}
                        {pet.allergies && (
                          <div className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 font-bold">
                            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                            <span>Cảnh báo dị ứng: {pet.allergies}</span>
                          </div>
                        )}

                        {/* Chief Complaint / Booking Symptoms (Placed right inside intake card) */}
                        {currentAppt.customerNote && (
                          <div className="p-2.5 rounded-xl bg-[#FFF4E8]/90 dark:bg-[#4D1B2A]/45 border-l-3 border-[#FF7F6B] text-xs space-y-0.5">
                            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B1F2E] dark:text-[#FF7F6B]">
                              Triệu chứng / Yêu cầu lúc đặt lịch
                            </div>
                            <p className="text-zinc-800 dark:text-foreground/90 font-medium leading-snug">
                              {currentAppt.customerNote}
                            </p>
                          </div>
                        )}

                        {/* Owner Behavioral Note */}
                        {pet.ownerNote && (
                          <div className="px-2.5 py-2 rounded-xl bg-zinc-50 dark:bg-muted/70 text-[11px] text-zinc-600 dark:text-foreground/80 leading-snug">
                            <strong className="text-zinc-800 dark:text-foreground">
                              Lưu ý tính cách:
                            </strong>{" "}
                            {pet.ownerNote}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 5. Owner & Service + Payment Status (2 Columns) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      {owner && (
                        <div className="p-3 rounded-2xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/60 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            <span>Khách hàng</span>
                          </span>
                          <div className="font-bold text-zinc-900 dark:text-foreground truncate">
                            {owner.fullName}
                          </div>
                          <div className="text-zinc-500 flex items-center gap-1 text-[11px]">
                            <Phone className="w-3 h-3 text-zinc-400" />
                            <span>{owner.phone}</span>
                          </div>
                        </div>
                      )}

                      {service && (
                        <div className="p-3 rounded-2xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/60 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                              Dịch vụ ({service.durationMin}p)
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase flex items-center gap-0.5 ${
                                isPaid
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                              }`}
                            >
                              <CreditCard className="w-2.5 h-2.5" />
                              {isPaid ? "Đã trả" : "Chờ thu"}
                            </span>
                          </div>
                          <div
                            className="font-bold text-zinc-900 dark:text-foreground truncate"
                            title={service.name.vi}
                          >
                            {service.name.vi}
                          </div>
                          <div className="text-[#6B1F2E] dark:text-[#FF7F6B] font-extrabold">
                            {service.price.toLocaleString("vi-VN")}đ
                          </div>
                        </div>
                      )}
                    </div>

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
                              onOpenMedicalModal &&
                              onOpenMedicalModal(currentAppt)
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
                              Ghi bệnh án lâm sàng
                            </div>
                            <div className="text-[10px] text-[#7A4A55] dark:text-[#E5BFC4] mt-0.5 flex items-center gap-1">
                              {linkedMedicalRecord ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                  <span>Đã lưu bệnh án</span>
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
                                  <span>
                                    Đã phát hành ({linkedPrescription.code})
                                  </span>
                                </>
                              ) : (
                                <span>Chọn dược phẩm & Liều dùng</span>
                              )}
                            </div>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 7. Compact Appointment Timeline History */}
                    <div className="pt-1 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Lịch sử tiến trình ({currentAppt.history.length} mốc)
                      </span>
                      <div className="space-y-1.5 border-l-2 border-zinc-200 dark:border-border pl-3 text-xs">
                        {currentAppt.history.map((h, i) => (
                          <div
                            key={i}
                            className="relative flex items-baseline justify-between gap-2"
                          >
                            <span className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-[#6B1F2E] dark:bg-[#FF7F6B]" />
                            <span className="font-semibold text-zinc-800 dark:text-foreground/90 text-[11px] leading-snug">
                              {h.note.vi}
                            </span>
                            <span className="text-[10px] text-zinc-400 shrink-0">
                              {h.at.replace("T", " ").slice(0, 16)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 8. Subtle Cancellation Rule Note ONLY when Pending or Upcoming (Never during in_progress/completed) */}
                    {(isPending || isUpcoming) && cancelFee.isUnder3Hours && (
                      <div className="px-3 py-2 rounded-xl border border-amber-200/70 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
                        <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          Lưu ý chính sách khách hàng: Lịch hẹn cách hiện tại
                          dưới 3 giờ. Nếu khách tự hủy muộn sẽ áp dụng phí 50% (
                          <strong>
                            {cancelFee.feeVnd.toLocaleString("vi-VN")}đ
                          </strong>
                          ).
                        </span>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Drawer Actions Footer */}
                <div className="p-4 border-t border-zinc-200/80 dark:border-border bg-zinc-50/50 dark:bg-card/50 space-y-2 shrink-0">
                  {/* If pending: Accept, Propose time, Request Admin Reassignment/Cancel */}
                  {isPending && !rejectMode && !proposeMode && (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => startAppointment(currentAppt.id)}
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
                          {hasPendingCancelRequest
                            ? "Đã gửi Admin"
                            : "Báo bận (Admin)"}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* If upcoming: Start slot button + Secondary Request Admin Reassignment/Cancel */}
                  {isUpcoming && !rejectMode && !proposeMode && (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => startAppointment(currentAppt.id)}
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
                            <span>Nhờ Admin điều phối / hủy</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Request Admin Reassignment / Cancellation Form */}
                  {rejectMode && (
                    <RejectForm
                      reason={rejectReason}
                      onReasonChange={setRejectReason}
                      isVet={isVet}
                      onConfirm={() => {
                        if (!rejectReason.trim()) return;
                        rejectAppointment(currentAppt.id, rejectReason.trim());
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
                        proposeAppointmentTime(
                          currentAppt.id,
                          proposedDateTime
                        );
                        setProposeMode(false);
                      }}
                      onCancel={() => setProposeMode(false)}
                    />
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

                  {/* Complete Slot Form Sub-Component */}
                  {completeMode && (
                    <CompleteSlotForm
                      completionNote={completionNote}
                      onNoteChange={setCompletionNote}
                      petCondition={petCondition}
                      onConditionChange={setPetCondition}
                      isVet={isVet}
                      onConfirm={() => {
                        completeAppointment(
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
                </div>
              </>
            );
          })()}
      </SheetContent>
    </Sheet>
  );
}
