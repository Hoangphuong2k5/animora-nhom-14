"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ShieldCheck, Stethoscope } from "lucide-react";
import { useExpert } from "@/components/expert/ExpertProvider";
import { VetRouteGuard } from "@/components/expert/VetOnly";
import { ClinicalWorkflowHeader } from "@/components/expert/ClinicalWorkflowHeader";
import { ExamVitalsAndSymptomsCard } from "@/components/expert/health-records/ExamVitalsAndSymptomsCard";
import { ExamFollowUpScheduleCard } from "@/components/expert/health-records/ExamFollowUpScheduleCard";
import { ExamHistoryReferenceSidebar } from "@/components/expert/health-records/ExamHistoryReferenceSidebar";
import { DiseaseSeverity } from "@/types/expert.type";
import { saveMedicalRecordAction } from "@/actions/expert.action";
import { ROUTES } from "@/constants/config.constant";
import { getTodayLocalIso } from "@/utils/dateFormat";
import { toast } from "sonner";

function NewClinicalExamRecordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryApptId = searchParams.get("appointmentId") || "";
  const queryPetId = searchParams.get("petId") || "";

  const {
    profile,
    allPets,
    allOwners,
    store,
    addMedicalRecord,
    addWeightLog,
  } = useExpert();

  const matchedQueryAppt = useMemo(
    () =>
      queryApptId
        ? store.appointments.find((a) => a.id === queryApptId)
        : undefined,
    [queryApptId, store.appointments]
  );

  const initialPetId =
    queryPetId ||
    matchedQueryAppt?.petId ||
    store.appointments[0]?.petId ||
    allPets[0]?.id ||
    "";

  const [selectedPetId, setSelectedPetId] = useState<string>(initialPetId);
  const [selectedApptId, setSelectedApptId] = useState<string>(
    matchedQueryAppt ? matchedQueryAppt.id : ""
  );

  const pet = useMemo(
    () => allPets.find((p) => p.id === selectedPetId),
    [allPets, selectedPetId]
  );
  const owner = useMemo(
    () => (pet ? allOwners.find((o) => o.id === pet.ownerId) : null),
    [pet, allOwners]
  );
  const selectedAppt = useMemo(
    () => store.appointments.find((a) => a.id === selectedApptId),
    [store.appointments, selectedApptId]
  );

  const [weightKgOverride, setWeightKgOverride] = useState<number | null>(null);
  const weightKg = weightKgOverride ?? pet?.weightKg ?? 5.0;
  const setWeightKg = (val: number) => setWeightKgOverride(val);
  const [temperatureC, setTemperatureC] = useState<number>(38.5);
  const [symptoms, setSymptoms] = useState<string>(
    matchedQueryAppt?.customerNote || ""
  );
  const [diagnosis, setDiagnosis] = useState<string>("");
  const [severity, setSeverity] = useState<DiseaseSeverity>("mild");
  const [note, setNote] = useState<string>("");
  const [revisitDate, setRevisitDate] = useState<string>("");
  const [nextVaccineDate, setNextVaccineDate] = useState<string>("");
  const [nextDewormDate, setNextDewormDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSelectPet = (newPetId: string) => {
    setSelectedPetId(newPetId);
    setWeightKgOverride(null);
    if (selectedApptId) {
      const currentAppt = store.appointments.find((a) => a.id === selectedApptId);
      if (currentAppt && currentAppt.petId !== newPetId) {
        setSelectedApptId("");
      }
    }
  };

  const handleSelectAppt = (newApptId: string) => {
    setSelectedApptId(newApptId);
    if (newApptId) {
      const matched = store.appointments.find((a) => a.id === newApptId);
      if (matched) {
        if (matched.petId !== selectedPetId) {
          setSelectedPetId(matched.petId);
          setWeightKgOverride(null);
        }
        if (matched.customerNote && !symptoms.trim()) {
          setSymptoms(matched.customerNote);
        }
      }
    }
  };

  const petMedicalRecords = useMemo(
    () =>
      store.medicalRecords
        .filter((r) => r.petId === selectedPetId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [store.medicalRecords, selectedPetId]
  );

  const petHealthEntries = useMemo(
    () =>
      store.healthEntries
        .filter((h) => h.petId === selectedPetId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [store.healthEntries, selectedPetId]
  );

  const handleSaveRecord = async (prescribeNext: boolean) => {
    if (!selectedPetId || !pet) {
      toast.error("Vui lòng chọn thú cưng cần khám!");
      return;
    }
    if (!symptoms.trim()) {
      toast.error("Vui lòng nhập triệu chứng lâm sàng ghi nhận!");
      return;
    }
    if (!diagnosis.trim()) {
      toast.error("Vui lòng nhập kết luận chẩn đoán bệnh án!");
      return;
    }

    setLoading(true);
    try {
      const res = await saveMedicalRecordAction({
        petId: selectedPetId,
        appointmentId: selectedApptId || undefined,
        symptoms: symptoms.trim(),
        diagnosis: diagnosis.trim(),
        severity,
        weightKg,
        temperatureC,
        note: note.trim(),
        revisitDate: revisitDate || undefined,
        nextVaccineDate: nextVaccineDate || undefined,
        nextDewormDate: nextDewormDate || undefined,
      });

      if (res.success && res.data) {
        addMedicalRecord(res.data);
        addWeightLog({
          petId: selectedPetId,
          date: getTodayLocalIso(),
          weightKg,
        });
        toast.success("Đã lưu phiếu khám bệnh án vào Sổ sức khỏe điện tử!");

        if (prescribeNext) {
          const query = new URLSearchParams();
          query.set("petId", selectedPetId);
          if (selectedApptId) query.set("appointmentId", selectedApptId);
          query.set("fromExam", "1");
          router.push(`${ROUTES.EXPERT_PRESCRIPTIONS_NEW}?${query.toString()}`);
        } else {
          router.push(`${ROUTES.EXPERT_HEALTH_RECORDS}?petId=${selectedPetId}`);
        }
      } else {
        toast.error(res.message || "Không thể lưu bệnh án.");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi lưu bệnh án.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Top Breadcrumb & Page Header (Warm Blush/Coral Clinical Chart Theme) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <Link
            href={
              selectedPetId
                ? `${ROUTES.EXPERT_HEALTH_RECORDS}?petId=${selectedPetId}`
                : ROUTES.EXPERT_HEALTH_RECORDS
            }
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 dark:text-[#E5BFC4]/80 hover:text-[#6B1F2E] dark:hover:text-[#FF7F6B] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Sổ sức khỏe &amp; Bệnh án</span>
          </Link>

          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-extrabold font-heading text-[#6B1F2E] dark:text-[#FFF4E8]">
              Phiếu Khám Lâm Sàng &amp; Ghi Bệnh Án (SOAP)
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold border border-[#EBCFC6] dark:border-[#FF7F6B]/30 bg-[#FBE3E3] dark:bg-[#FF7F6B]/15 text-[#6B1F2E] dark:text-[#FF7F6B]">
              <Stethoscope className="w-3.5 h-3.5 text-[#FF7F6B]" />
              <span>Hồ sơ Y khoa</span>
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-[#EBCFC6] dark:border-[#6E2E40] bg-[#FFF4E8]/85 dark:bg-[#4D1B2A]/60 text-xs text-[#3B1520] dark:text-[#FFF4E8] self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-[#FF7F6B] shrink-0" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B1F2E] dark:text-[#FF7F6B]">
              Bác sĩ khám lâm sàng
            </div>
            <div className="font-extrabold text-xs">
              {profile.fullName}
            </div>
          </div>
        </div>
      </div>

      {/* Shared 2-Stage Stepper + Compact 1-Row Patient Strip */}
      <ClinicalWorkflowHeader
        activeStage="exam"
        pets={allPets}
        owners={allOwners}
        appointments={store.appointments}
        selectedPetId={selectedPetId}
        onSelectPet={handleSelectPet}
        selectedApptId={selectedApptId}
        onSelectAppt={handleSelectAppt}
      />

      {/* 8/4 Clinical SOAP Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-5">
          {/* Vital Signs Monitor + SOAP Assessment */}
          <ExamVitalsAndSymptomsCard
            weightKg={weightKg}
            referenceWeightKg={pet?.weightKg}
            onChangeWeight={setWeightKg}
            temperatureC={temperatureC}
            onChangeTemperature={setTemperatureC}
            customerBookingNote={selectedAppt?.customerNote}
            symptoms={symptoms}
            onChangeSymptoms={setSymptoms}
            diagnosis={diagnosis}
            onChangeDiagnosis={setDiagnosis}
            severity={severity}
            onChangeSeverity={setSeverity}
            note={note}
            onChangeNote={setNote}
          />

          {/* Follow-up & Preventive Care Schedule */}
          <ExamFollowUpScheduleCard
            revisitDate={revisitDate}
            onChangeRevisitDate={setRevisitDate}
            nextVaccineDate={nextVaccineDate}
            onChangeNextVaccineDate={setNextVaccineDate}
            nextDewormDate={nextDewormDate}
            onChangeNextDewormDate={setNextDewormDate}
          />
        </div>

        {/* Right Sticky Column: Past Medical Records & Submit Actions */}
        <div className="lg:col-span-4 lg:sticky lg:top-20">
          <ExamHistoryReferenceSidebar
            pet={pet}
            owner={owner}
            medicalRecords={petMedicalRecords}
            healthEntries={petHealthEntries}
            loading={loading}
            onSaveOnly={() => handleSaveRecord(false)}
            onSaveAndPrescribe={() => handleSaveRecord(true)}
            onCancel={() =>
              router.push(
                selectedPetId
                  ? `${ROUTES.EXPERT_HEALTH_RECORDS}?petId=${selectedPetId}`
                  : ROUTES.EXPERT_HEALTH_RECORDS
              )
            }
          />
        </div>
      </div>
    </div>
  );
}

export default function NewClinicalExamRecordPage() {
  return (
    <VetRouteGuard>
      <Suspense
        fallback={
          <div className="p-8 text-center text-xs text-zinc-400">
            Đang mở phiếu khám lâm sàng...
          </div>
        }
      >
        <NewClinicalExamRecordContent />
      </Suspense>
    </VetRouteGuard>
  );
}
