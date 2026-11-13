"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FileText, Pill, Stethoscope } from "lucide-react";
import { useExpert } from "@/components/expert/ExpertProvider";
import { PetSelectorBar } from "@/components/expert/health-records/PetSelectorBar";
import { ClinicalRecordCard } from "@/components/expert/health-records/ClinicalRecordCard";
import { HealthCareTimeline } from "@/components/expert/health-records/HealthCareTimeline";
import { PetWeightTracker } from "@/components/expert/health-records/PetWeightTracker";
import { PetQuickProfileCard } from "@/components/expert/health-records/PetQuickProfileCard";
import { ServiceNoteModal } from "@/components/expert/health-records/ServiceNoteModal";
import { usePetHealthRecords } from "@/hooks/expert/usePetHealthRecords";
import { ROUTES } from "@/constants/config.constant";

function HealthRecordsContent() {
  const searchParams = useSearchParams();
  const queryPetId = searchParams.get("petId");

  const {
    profile,
    isVet,
    scopedPets,
    store,
    addHealthEntry,
  } = useExpert();

  const {
    selectedPetId,
    setSelectedPetId,
    selectedPet,
    petHealthEntries,
    petMedicalRecords,
    weightPoints,
  } = usePetHealthRecords(scopedPets, store, queryPetId);

  // Modal state for General Service Note
  const [showNoteModal, setShowNoteModal] = useState(false);

  // Submit General Service Note
  const handleSaveServiceNote = (title: string, detail: string) => {
    addHealthEntry({
      id: `he-${Date.now()}`,
      petId: selectedPetId,
      kind: "service_note",
      date: new Date().toISOString().slice(0, 10),
      title,
      detail,
      authorName: profile.fullName,
    });
    setShowNoteModal(false);
  };

  if (scopedPets.length === 0) {
    return (
      <div className="p-12 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-border rounded-3xl">
        Chưa có thú cưng nào được gán hoặc đã hoàn thành lịch với chuyên viên để mở sổ sức khỏe.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-zinc-900 dark:text-foreground">
            Sổ Sức Khỏe & Bệnh Án Thú Cưng
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Lịch sử tiêm chủng, tẩy giun, hồ sơ bệnh án lâm sàng và theo dõi cân nặng định kỳ.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* General service note for all specialists */}
          <button
            type="button"
            onClick={() => setShowNoteModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-zinc-200 dark:border-border bg-white dark:bg-card text-zinc-800 dark:text-foreground/90 hover:bg-zinc-50 dark:hover:bg-muted transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Thêm ghi chú dịch vụ</span>
          </button>

          {/* Doctor Exam Record & Quick Prescribe Buttons [Bác sĩ] */}
          {isVet && (
            <>
              <Link
                href={
                  selectedPet
                    ? `${ROUTES.EXPERT_HEALTH_RECORDS_NEW}?petId=${selectedPet.id}`
                    : ROUTES.EXPERT_HEALTH_RECORDS_NEW
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-[#6B1F2E]/30 dark:border-[#FF7F6B]/30 bg-white dark:bg-zinc-900 text-[#6B1F2E] dark:text-[#FF7F6B] hover:bg-[#6B1F2E]/5 transition-colors cursor-pointer"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Ghi bệnh án khám bệnh</span>
              </Link>

              {selectedPet && (
                <Link
                  href={`${ROUTES.EXPERT_PRESCRIPTIONS_NEW}?petId=${selectedPet.id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] transition-colors cursor-pointer shadow-sm shadow-[#6B1F2E]/20"
                >
                  <Pill className="w-3.5 h-3.5 text-[#FF7F6B]" />
                  <span>Kê đơn thuốc cho {selectedPet.name}</span>
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {/* Pet Selector Bar (Sub-Component) */}
      <PetSelectorBar
        pets={scopedPets}
        selectedPetId={selectedPetId}
        onSelect={setSelectedPetId}
      />

      {selectedPet && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 cols): [Bác sĩ] Bệnh án & Sổ tiêm chủng, tẩy giun */}
          <div className="lg:col-span-2 space-y-6">
            {/* [Bác sĩ] Danh Sách Bệnh Án Lâm Sàng (Sub-Component) */}
            <ClinicalRecordCard records={petMedicalRecords} />

            {/* Sổ Tiêm Chủng, Tẩy Giun, Bệnh Sử & Ghi Chú (Sub-Component) */}
            <HealthCareTimeline entries={petHealthEntries} />
          </div>

          {/* Right Column (1 col): Biểu đồ cân nặng & Thẻ hồ sơ nhanh */}
          <div className="space-y-6">
            {/* Biểu Đồ Cân Nặng (Sub-Component) */}
            <PetWeightTracker
              currentWeight={selectedPet.weightKg}
              points={weightPoints}
            />

            {/* Thẻ Hồ Sơ Nhanh (Sub-Component) */}
            <PetQuickProfileCard pet={selectedPet} />
          </div>
        </div>
      )}

      {/* Modal Thêm Ghi Chú Dịch Vụ (Sub-Component) */}
      <ServiceNoteModal
        petName={selectedPet?.name || "bé cưng"}
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        onSave={handleSaveServiceNote}
      />
    </div>
  );
}

export default function ExpertHealthRecordsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-400">Đang tải sổ sức khỏe...</div>}>
      <HealthRecordsContent />
    </Suspense>
  );
}
