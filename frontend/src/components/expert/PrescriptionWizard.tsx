"use client";

import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  FileCheck,
  Pill,
} from "lucide-react";
import { ExpertAppointment } from "@/types/expert.type";
import { useExpert } from "./ExpertProvider";
import { usePrescriptionForm } from "@/hooks/expert/usePrescriptionForm";
import { WizardStep1PetSelect } from "./prescriptions/WizardStep1PetSelect";
import { WizardStep2Diagnosis } from "./prescriptions/WizardStep2Diagnosis";
import { WizardStep3MedicineLines } from "./prescriptions/WizardStep3MedicineLines";
import { WizardStep4ReviewConfirm } from "./prescriptions/WizardStep4ReviewConfirm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PrescriptionWizardProps {
  initialAppointment?: ExpertAppointment | null;
  onClose: () => void;
}

export function PrescriptionWizard({
  initialAppointment,
  onClose,
}: PrescriptionWizardProps) {
  const { allPets, allOwners, store } = useExpert();

  const {
    step,
    setStep,
    nextStep,
    prevStep,
    selectedPetId,
    setSelectedPetId,
    selectedApptId,
    setSelectedApptId,
    diagnosis,
    setDiagnosis,
    severity,
    setSeverity,
    refillsAllowed,
    setRefillsAllowed,
    note,
    setNote,
    lines,
    handleAddLine,
    handleRemoveLine,
    handleUpdateLine,
    loading,
    pet,
    owner,
    handleSubmit,
  } = usePrescriptionForm(initialAppointment, onClose);

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl border border-zinc-200 dark:border-border bg-white dark:bg-background text-zinc-900 dark:text-foreground shadow-2xl text-xs"
      >
        {/* Wizard Header */}
        <DialogHeader className="px-6 pt-5 pb-3 pr-12 border-b border-zinc-100 dark:border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#6B1F2E]/10 dark:bg-[#FF7F6B]/20 text-[#6B1F2E] dark:text-[#FF7F6B]">
              <Pill className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <DialogTitle className="font-heading font-extrabold text-base text-zinc-900 dark:text-foreground">
                Tạo Đơn Thuốc Điện Tử [Bác sĩ]
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">
                Bước {step} / 4:{" "}
                {step === 1 && "Chọn thú cưng & lịch khám"}
                {step === 2 && "Chẩn đoán & phân loại bệnh tật"}
                {step === 3 && "Chỉ định thuốc & liều dùng"}
                {step === 4 && "Xác nhận & ký phát hành"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Wizard Body */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-6 py-4 space-y-5">
          {/* Step Progress Indicators */}
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                onClick={() => i < step && setStep(i as 1 | 2 | 3 | 4)}
                className={`h-1.5 rounded-full transition-all ${
                  i <= step
                    ? "bg-[#6B1F2E] dark:bg-[#FF7F6B]"
                    : "bg-zinc-100 dark:bg-muted"
                } ${i < step ? "cursor-pointer" : ""}`}
              />
            ))}
          </div>

          {/* Step Content */}
          {step === 1 && (
            <WizardStep1PetSelect
              pets={allPets}
              owners={allOwners}
              appointments={store.appointments}
              selectedPetId={selectedPetId}
              onSelectPet={setSelectedPetId}
              selectedApptId={selectedApptId}
              onSelectAppt={setSelectedApptId}
            />
          )}

          {step === 2 && (
            <WizardStep2Diagnosis
              diagnosis={diagnosis}
              onChangeDiagnosis={setDiagnosis}
              severity={severity}
              onChangeSeverity={setSeverity}
              refillsAllowed={refillsAllowed}
              onChangeRefills={setRefillsAllowed}
              note={note}
              onChangeNote={setNote}
            />
          )}

          {step === 3 && (
            <WizardStep3MedicineLines
              lines={lines}
              onAddLine={handleAddLine}
              onRemoveLine={handleRemoveLine}
              onUpdateLine={handleUpdateLine}
            />
          )}

          {step === 4 && (
            <WizardStep4ReviewConfirm
              pet={pet}
              owner={owner}
              diagnosis={diagnosis}
              severity={severity}
              refillsAllowed={refillsAllowed}
              lines={lines}
              note={note}
            />
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 dark:border-border shrink-0">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold border border-zinc-200 dark:border-border hover:bg-zinc-50 dark:hover:bg-muted text-zinc-700 dark:text-foreground/80 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                Hủy bỏ
              </button>
            )}
          </div>

          <div>
            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] transition-colors cursor-pointer shadow-sm shadow-[#6B1F2E]/20"
              >
                <span>Tiếp tục</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50 shadow-sm shadow-emerald-600/20"
              >
                <FileCheck className="w-4 h-4" />
                <span>{loading ? "Đang phát hành..." : "Xác nhận & Ký phát hành"}</span>
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
