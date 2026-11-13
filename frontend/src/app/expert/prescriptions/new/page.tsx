"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Pill, ShieldCheck } from "lucide-react";
import { useExpert } from "@/components/expert/ExpertProvider";
import { VetRouteGuard } from "@/components/expert/VetOnly";
import { ClinicalWorkflowHeader } from "@/components/expert/ClinicalWorkflowHeader";
import { usePrescriptionForm } from "@/hooks/expert/usePrescriptionForm";
import { PharmacyCatalogPanel } from "@/components/expert/prescriptions/PharmacyCatalogPanel";
import { InteractiveRxPad } from "@/components/expert/prescriptions/InteractiveRxPad";
import { ROUTES } from "@/constants/config.constant";
import { toast } from "sonner";

function NewPrescriptionWorkstationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryApptId = searchParams.get("appointmentId");
  const queryPetId = searchParams.get("petId");
  const fromExam = searchParams.get("fromExam") === "1";

  const { profile, allPets, allOwners, store } = useExpert();

  const {
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
    handleAddMedicineFromCatalog,
    handleRemoveLine,
    handleUpdateLine,
    loading,
    pet,
    owner,
    latestMedicalRecord,
    applyLatestMedicalRecord,
    handleSubmit,
  } = usePrescriptionForm(
    {
      appointmentId: queryApptId,
      petId: queryPetId,
      autoApplyLatestRecord: fromExam,
    },
    () => {
      toast.success("Đã ký số & phát hành đơn thuốc điện tử thành công!");
      router.push(ROUTES.EXPERT_PRESCRIPTIONS);
    }
  );

  return (
    <div className="space-y-5 pb-8">
      {/* Top Breadcrumb & Page Header (Pharmacy Wine/Coral Theme) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <Link
            href={ROUTES.EXPERT_PRESCRIPTIONS}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-[#6B1F2E] dark:hover:text-[#FF7F6B] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Danh sách đơn thuốc</span>
          </Link>

          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-extrabold font-heading text-zinc-900 dark:text-zinc-100">
              Quầy Dược Nội Bộ &amp; Tờ Đơn Thuốc Điện Tử
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#6B1F2E]/10 dark:bg-[#FF7F6B]/20 text-[#6B1F2E] dark:text-[#FF7F6B]">
              <Pill className="w-3.5 h-3.5" />
              <span>Đơn thuốc Bác sĩ</span>
            </span>
          </div>
        </div>

        {/* Vet License Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-[#6B1F2E]/25 dark:border-[#FF7F6B]/30 bg-[#6B1F2E]/5 dark:bg-[#FF7F6B]/10 text-xs text-[#6B1F2E] dark:text-[#FF7F6B] self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
              Chữ ký số hành nghề thú y
            </div>
            <div className="font-mono font-extrabold text-xs">
              {profile.licenseNumber || "CCHN-TY-2019-0842"}
            </div>
          </div>
        </div>
      </div>

      {/* Shared 2-Stage Stepper + Compact 1-Row Patient Strip */}
      <ClinicalWorkflowHeader
        activeStage="prescription"
        pets={allPets}
        owners={allOwners}
        appointments={store.appointments}
        selectedPetId={selectedPetId}
        onSelectPet={setSelectedPetId}
        selectedApptId={selectedApptId}
        onSelectAppt={setSelectedApptId}
      />

      {/* 5/7 Pharmacy Split Layout: Left = Medicine Catalog Shelf | Right = Official ℞ Prescription Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5/12): Animora Pharmacy Catalog Shelf */}
        <div className="lg:col-span-5 lg:sticky lg:top-20">
          <PharmacyCatalogPanel
            selectedPet={pet}
            lines={lines}
            onAddMedicine={handleAddMedicineFromCatalog}
          />
        </div>

        {/* Right Column (7/12): Official Interactive ℞ Prescription Pad */}
        <div className="lg:col-span-7">
          <InteractiveRxPad
            profile={profile}
            pet={pet}
            owner={owner}
            latestMedicalRecord={latestMedicalRecord}
            onApplyLatestRecord={applyLatestMedicalRecord}
            diagnosis={diagnosis}
            onChangeDiagnosis={setDiagnosis}
            severity={severity}
            onChangeSeverity={setSeverity}
            refillsAllowed={refillsAllowed}
            onChangeRefills={setRefillsAllowed}
            lines={lines}
            onAddLine={handleAddLine}
            onRemoveLine={handleRemoveLine}
            onUpdateLine={handleUpdateLine}
            note={note}
            onChangeNote={setNote}
            loading={loading}
            onSubmit={handleSubmit}
            onCancel={() => router.push(ROUTES.EXPERT_PRESCRIPTIONS)}
          />
        </div>
      </div>
    </div>
  );
}

export default function NewPrescriptionPage() {
  return (
    <VetRouteGuard>
      <Suspense
        fallback={
          <div className="p-8 text-center text-xs text-zinc-400">
            Đang mở quầy dược &amp; tờ đơn thuốc điện tử...
          </div>
        }
      >
        <NewPrescriptionWorkstationContent />
      </Suspense>
    </VetRouteGuard>
  );
}
