"use client";

import { useState, useMemo, useEffect } from "react";
import {
  DiseaseSeverity,
  ExpertAppointment,
  PrescriptionLine,
} from "@/types/expert.type";
import { useExpert } from "@/components/expert/ExpertProvider";
import { MEDICINE_CATALOG } from "@/data/medicineCatalog";
import { createPrescriptionAction } from "@/actions/expert.action";
import { toast } from "sonner";

export interface UsePrescriptionFormInit {
  appointmentId?: string | null;
  petId?: string | null;
  autoApplyLatestRecord?: boolean;
}

export function usePrescriptionForm(
  initialAppointmentOrInit?: ExpertAppointment | UsePrescriptionFormInit | null,
  onSuccess?: () => void
) {
  const { allPets, allOwners, store, addPrescription } = useExpert();

  // Resolve initial appointment & petId from either ExpertAppointment or UsePrescriptionFormInit
  const resolvedInit = useMemo(() => {
    if (!initialAppointmentOrInit) {
      return {
        petId: store.appointments[0]?.petId || allPets[0]?.id || "",
        appointmentId: "",
      };
    }
    if ("code" in initialAppointmentOrInit) {
      return {
        petId: initialAppointmentOrInit.petId,
        appointmentId: initialAppointmentOrInit.id,
      };
    }
    const queryApptId = initialAppointmentOrInit.appointmentId || "";
    const matchedAppt = queryApptId
      ? store.appointments.find((a) => a.id === queryApptId)
      : undefined;
    const queryPetId =
      initialAppointmentOrInit.petId ||
      matchedAppt?.petId ||
      store.appointments[0]?.petId ||
      allPets[0]?.id ||
      "";
    return {
      petId: queryPetId,
      appointmentId: matchedAppt ? matchedAppt.id : "",
    };
  }, [initialAppointmentOrInit, store.appointments, allPets]);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedPetId, setSelectedPetId] = useState<string>(resolvedInit.petId);
  const [selectedApptId, setSelectedApptId] = useState<string>(
    resolvedInit.appointmentId
  );

  // Sync if query params / store hydrate after initial mount
  useEffect(() => {
    if (resolvedInit.petId && !selectedPetId) {
      setSelectedPetId(resolvedInit.petId);
    }
    if (resolvedInit.appointmentId && !selectedApptId) {
      setSelectedApptId(resolvedInit.appointmentId);
      if (resolvedInit.petId) {
        setSelectedPetId(resolvedInit.petId);
      }
    }
  }, [resolvedInit.petId, resolvedInit.appointmentId, selectedPetId, selectedApptId]);

  const [diagnosis, setDiagnosis] = useState<string>("");
  const [severity, setSeverity] = useState<DiseaseSeverity>("mild");
  const [refillsAllowed, setRefillsAllowed] = useState<number>(1);
  const [note, setNote] = useState<string>("");

  const [lines, setLines] = useState<PrescriptionLine[]>([
    {
      medicineId: MEDICINE_CATALOG[0].id,
      dosage: "1 viên",
      days: 7,
      instruction: "Uống 2 lần/ngày sau bữa ăn",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const pet = allPets.find((p) => p.id === selectedPetId);
  const owner = pet ? allOwners.find((o) => o.id === pet.ownerId) : null;

  // Latest medical record for this pet (sorted by date descending)
  const latestMedicalRecord = useMemo(() => {
    if (!selectedPetId) return undefined;
    const records = store.medicalRecords.filter((r) => r.petId === selectedPetId);
    if (records.length === 0) return undefined;
    // Prefer record linked to selectedApptId if present
    if (selectedApptId) {
      const apptRecord = records.find((r) => r.appointmentId === selectedApptId);
      if (apptRecord) return apptRecord;
    }
    return [...records].sort((a, b) => b.date.localeCompare(a.date))[0];
  }, [selectedPetId, selectedApptId, store.medicalRecords]);

  // Auto-apply latest medical record when coming directly from Clinical Exam page (?fromExam=1)
  useEffect(() => {
    const shouldAutoApply =
      initialAppointmentOrInit &&
      !("code" in initialAppointmentOrInit) &&
      initialAppointmentOrInit.autoApplyLatestRecord;
    if (shouldAutoApply && latestMedicalRecord && !diagnosis.trim()) {
      setDiagnosis(latestMedicalRecord.diagnosis);
      setSeverity(latestMedicalRecord.severity);
      setRefillsAllowed(latestMedicalRecord.severity === "severe" ? 0 : 1);
      if (latestMedicalRecord.note) {
        setNote(latestMedicalRecord.note);
      }
    }
  }, [initialAppointmentOrInit, latestMedicalRecord, diagnosis]);

  const handleSelectPet = (newPetId: string) => {
    setSelectedPetId(newPetId);
    // Keep appointment only if it belongs to the new pet
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
      if (matched && matched.petId !== selectedPetId) {
        setSelectedPetId(matched.petId);
      }
    }
  };

  const applyLatestMedicalRecord = () => {
    if (!latestMedicalRecord) return;
    setDiagnosis(latestMedicalRecord.diagnosis);
    setSeverity(latestMedicalRecord.severity);
    setRefillsAllowed(latestMedicalRecord.severity === "severe" ? 0 : 1);
    if (latestMedicalRecord.note) {
      setNote(latestMedicalRecord.note);
    }
    toast.success("Đã nạp thông tin chẩn đoán từ bệnh án gần nhất!");
  };

  const handleAddLine = () => {
    setLines((prev) => [
      ...prev,
      {
        medicineId: MEDICINE_CATALOG[0].id,
        dosage: "1 viên",
        days: 5,
        instruction: "Dùng theo chỉ định",
      },
    ]);
  };

  const handleAddMedicineFromCatalog = (medicineId: string) => {
    const med = MEDICINE_CATALOG.find((m) => m.id === medicineId);
    if (!med) return;

    const alreadyExists = lines.some((l) => l.medicineId === medicineId);
    if (alreadyExists) {
      toast.info(`"${med.name}" đã có sẵn trong tờ đơn thuốc bên phải!`);
      return;
    }

    const defaultDosage =
      med.unit.includes("lọ")
        ? "3 giọt"
        : med.unit.includes("tuýp")
        ? "1 lớp mỏng"
        : med.unit.includes("ống")
        ? "1 ống"
        : "1 viên";

    const defaultInstruction =
      med.form.toLowerCase().includes("nhỏ tai")
        ? "Nhỏ vào ống tai 2 lần/ngày sau khi vệ sinh sạch"
        : med.form.toLowerCase().includes("tra mắt")
        ? "Tra mắt 2 - 3 lần/ngày"
        : med.form.toLowerCase().includes("ngoài da")
        ? "Nhỏ trực tiếp lên vùng da gáy (1 liều duy nhất)"
        : "Uống 2 lần/ngày (sáng - tối) sau bữa ăn";

    setLines((prev) => [
      ...prev,
      {
        medicineId: med.id,
        dosage: defaultDosage,
        days: med.unit.includes("ống") ? 1 : 7,
        instruction: defaultInstruction,
      },
    ]);
    toast.success(`Đã thêm "${med.name}" vào tờ đơn thuốc ℞`);
  };

  const handleRemoveLine = (idx: number) => {
    if (lines.length <= 1) return;
    setLines((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateLine = (idx: number, patch: Partial<PrescriptionLine>) => {
    setLines((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, ...patch } : l))
    );
  };

  const nextStep = () => {
    if (step === 1 && !selectedPetId) {
      toast.error("Vui lòng chọn thú cưng trước khi tiếp tục!");
      return;
    }
    if (step === 2 && !diagnosis.trim()) {
      toast.error("Vui lòng nhập chẩn đoán bệnh!");
      return;
    }
    if (step < 4) setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
  };

  const prevStep = () => {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
  };

  const handleSubmit = async () => {
    if (!pet || !owner) {
      toast.error("Vui lòng chọn thú cưng và chủ nuôi!");
      return;
    }
    if (!diagnosis.trim()) {
      toast.error("Vui lòng nhập chẩn đoán xác định bệnh!");
      return;
    }
    if (lines.length === 0 || lines.some((l) => !l.dosage.trim() || !l.instruction.trim())) {
      toast.error("Vui lòng nhập đầy đủ liều dùng và hướng dẫn sử dụng cho tất cả thuốc!");
      return;
    }

    setLoading(true);
    try {
      const res = await createPrescriptionAction({
        petId: pet.id,
        ownerId: owner.id,
        appointmentId: selectedApptId || undefined,
        diagnosis: diagnosis.trim(),
        severity,
        refillsAllowed: severity === "severe" ? 0 : refillsAllowed,
        lines,
        note: note.trim(),
      });

      if (res.success && res.data) {
        addPrescription(res.data);
        onSuccess?.();
      } else {
        toast.error(res.message || "Không thể phát hành đơn thuốc.");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi tạo đơn thuốc.");
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    setStep,
    nextStep,
    prevStep,
    selectedPetId,
    setSelectedPetId: handleSelectPet,
    selectedApptId,
    setSelectedApptId: handleSelectAppt,
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
  };
}
