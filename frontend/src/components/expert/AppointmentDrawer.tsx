"use client";

import React, { useState } from "react";
import { Clock } from "lucide-react";
import { ExpertAppointment } from "@/types/expert.type";
import { useExpert } from "./ExpertProvider";
import { StatusBadge } from "./StatusBadge";
import { computeCancellationFee } from "@/utils/expertPolicy";
import { getLatestVetMedicalRecordForPet } from "@/utils/clinicalSync";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AppointmentOverviewAndPetSection,
  AppointmentTimelineAndPolicySection,
} from "./drawer/AppointmentOverviewAndPetSection";
import { AppointmentCareAndActionForms } from "./drawer/AppointmentCareAndActionForms";
import { AppointmentDrawerFooter } from "./drawer/AppointmentDrawerFooter";

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
    confirmAppointment,
    startAppointment,
    advanceCareStage,
    completeAppointment,
    rejectAppointment,
    acceptReschedule,
  } = useExpert();

  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [completeMode, setCompleteMode] = useState(false);
  const [completionNote, setCompletionNote] = useState("");
  const [petCondition, setPetCondition] = useState("");
  const [followUpDate] = useState("");
  const [careStepNote, setCareStepNote] = useState("");

  return (
    <Sheet
      open={Boolean(appointment)}
      onOpenChange={(open) => {
        if (!open) {
          setRejectMode(false);
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
            const latestVetRecord = !isVet
              ? getLatestVetMedicalRecordForPet(currentAppt.petId)
              : undefined;

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
                        Chờ Quản lý điều phối (Nghỉ đột xuất)
                      </span>
                    )}
                    {currentAppt.checkedInAt && !isCancelled && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800">
                        Đã check-in tại quầy ({currentAppt.checkedInAt.slice(11, 16) || "Lễ tân"})
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
                    <AppointmentOverviewAndPetSection
                      currentAppt={currentAppt}
                      pet={pet}
                      owner={owner}
                      service={service}
                      isVet={isVet}
                      isPaid={isPaid}
                      isCancelled={isCancelled}
                      hasPendingCancelRequest={hasPendingCancelRequest}
                      cancelFee={cancelFee}
                      latestVetRecord={latestVetRecord}
                      onAcceptReschedule={acceptReschedule}
                    />

                    <AppointmentCareAndActionForms
                      currentAppt={currentAppt}
                      isVet={isVet}
                      isExamStarted={isExamStarted}
                      isCompleted={isCompleted}
                      linkedMedicalRecord={linkedMedicalRecord}
                      linkedPrescription={linkedPrescription}
                      careStepNote={careStepNote}
                      onCareStepNoteChange={setCareStepNote}
                      onAdvanceCareStage={advanceCareStage}
                      onOpenMedicalModal={onOpenMedicalModal}
                      onOpenPrescriptionWizard={onOpenPrescriptionWizard}
                    />

                    <AppointmentTimelineAndPolicySection
                      currentAppt={currentAppt}
                      isPending={isPending}
                      isUpcoming={isUpcoming}
                      cancelFee={cancelFee}
                    />
                  </div>
                </ScrollArea>

                {/* Drawer Actions Footer */}
                <AppointmentDrawerFooter
                  currentAppt={currentAppt}
                  isVet={isVet}
                  isPending={isPending}
                  isUpcoming={isUpcoming}
                  isExamStarted={isExamStarted}
                  hasPendingCancelRequest={hasPendingCancelRequest}
                  rejectMode={rejectMode}
                  setRejectMode={setRejectMode}
                  rejectReason={rejectReason}
                  setRejectReason={setRejectReason}
                  onRejectAppointment={rejectAppointment}
                  completeMode={completeMode}
                  setCompleteMode={setCompleteMode}
                  completionNote={completionNote}
                  setCompletionNote={setCompletionNote}
                  petCondition={petCondition}
                  setPetCondition={setPetCondition}
                  followUpDate={followUpDate}
                  onCompleteAppointment={completeAppointment}
                  onConfirmAppointment={confirmAppointment}
                  onStartAppointment={startAppointment}
                  onClose={onClose}
                />
              </>
            );
          })()}
      </SheetContent>
    </Sheet>
  );
}
