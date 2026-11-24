"use client";

import { useState, useMemo } from "react";
import {
  DiseaseSeverity,
  ExpertAppointment,
  PrescriptionLine,
} from "@/types/expert.type";
import { useExpert } from "@/components/expert/ExpertProvider";
import { MEDICINE_CATALOG } from "@/data/medicineCatalog";
import { readLivePrescriptionCatalog } from "@/utils/medicineBoxSync";
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
  const { profile, allPets, allOwners, store, addPrescription } = useExpert();

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

  const [manualPetId, setManualPetId] = useState<string | null>(null);
  const [manualApptId, setManualApptId] = useState<string | null>(null);

  const selectedPetId = manualPetId ?? resolvedInit.petId;
  const selectedApptId = manualApptId ?? resolvedInit.appointmentId;

  const pet = allPets.find((p) => p.id === selectedPetId);
  const owner = pet ? allOwners.find((o) => o.id === pet.ownerId) : null;

  // Latest medical record for this pet (sorted by date descending)
  const latestMedicalRecord = useMemo(() => {
    if (!selectedPetId) return undefined;
    const records = store.medicalRecords.filter((r) => r.petId === selectedPetId);
    if (records.length === 0) return undefined;
    if (selectedApptId) {
      const apptRecord = records.find((r) => r.appointmentId === selectedApptId);
      if (apptRecord) return apptRecord;
    }
    return [...records].sort((a, b) => b.date.localeCompare(a.date))[0];
  }, [selectedPetId, selectedApptId, store.medicalRecords]);

  const shouldAutoApplyRecord = Boolean(
    initialAppointmentOrInit &&
      !("code" in initialAppointmentOrInit) &&
      initialAppointmentOrInit.autoApplyLatestRecord &&
      latestMedicalRecord
  );

  const [diagnosisOverride, setDiagnosisOverride] = useState<string | null>(null);
  const [severityOverride, setSeverityOverride] = useState<DiseaseSeverity | null>(null);
  const [refillsOverride, setRefillsOverride] = useState<number | null>(null);
  const [refillInstruction, setRefillInstruction] = useState<string>("");
  const [noteOverride, setNoteOverride] = useState<string | null>(null);

  const diagnosis =
    diagnosisOverride ??
    (shouldAutoApplyRecord ? latestMedicalRecord?.diagnosis ?? "" : "");
  const severity: DiseaseSeverity =
    severityOverride ??
    (shouldAutoApplyRecord ? latestMedicalRecord?.severity ?? "mild" : "mild");
  const refillsAllowed =
    refillsOverride ??
    (shouldAutoApplyRecord && latestMedicalRecord?.severity === "severe" ? 0 : 1);
  const note =
    noteOverride ?? (shouldAutoApplyRecord ? latestMedicalRecord?.note ?? "" : "");

  const setDiagnosis = (val: string) => setDiagnosisOverride(val);
  const setSeverity = (val: DiseaseSeverity) => setSeverityOverride(val);
  const setRefillsAllowed = (val: number) =>
    setRefillsOverride(Math.max(0, Math.floor(Number.isFinite(val) ? val : 0)));
  const setNote = (val: string) => setNoteOverride(val);

  const [lines, setLines] = useState<PrescriptionLine[]>(() => {
    const firstInStock =
      MEDICINE_CATALOG.find((m) => m.stock > 0) || MEDICINE_CATALOG[0];
    return [
      {
        medicineId: firstInStock.id,
        dosage: "1 viên",
        days: 7,
        instruction: "Uống 2 lần/ngày sau bữa ăn",
      },
    ];
  });

  const [loading, setLoading] = useState(false);

  const handleSelectPet = (newPetId: string) => {
    setManualPetId(newPetId);
    if (selectedApptId) {
      const currentAppt = store.appointments.find((a) => a.id === selectedApptId);
      if (currentAppt && currentAppt.petId !== newPetId) {
        setManualApptId("");
      }
    }
  };

  const handleSelectAppt = (newApptId: string) => {
    setManualApptId(newApptId);
    if (newApptId) {
      const matched = store.appointments.find((a) => a.id === newApptId);
      if (matched && matched.petId !== selectedPetId) {
        setManualPetId(matched.petId);
      }
    }
  };

  const applyLatestMedicalRecord = () => {
    if (!latestMedicalRecord) return;
    setDiagnosisOverride(latestMedicalRecord.diagnosis);
    setSeverityOverride(latestMedicalRecord.severity);
    setRefillsOverride(latestMedicalRecord.severity === "severe" ? 0 : 1);
    if (latestMedicalRecord.note) {
      setNoteOverride(latestMedicalRecord.note);
    }
    toast.success("Đã nạp thông tin chẩn đoán từ bệnh án gần nhất!");
  };

  const handleAddLine = () => {
    const liveCatalog = readLivePrescriptionCatalog(profile.id);
    const defaultMed =
      liveCatalog.find((m) => m.stock > 0) ||
      liveCatalog[0] ||
      MEDICINE_CATALOG[0];
    setLines((prev) => [
      ...prev,
      {
        medicineId: defaultMed.id,
        dosage: "1 viên",
        days: 5,
        instruction: "Dùng theo chỉ định",
      },
    ]);
  };

  const handleAddMedicineFromCatalog = (medicineId: string) => {
    const liveCatalog = readLivePrescriptionCatalog(profile.id);
    const med =
      liveCatalog.find((m) => m.id === medicineId) ||
      MEDICINE_CATALOG.find((m) => m.id === medicineId);
    if (!med) return;
    if (med.stock <= 0) {
      toast.error(`Thuốc "${med.name}" hiện đã hết tồn kho trong Kho thuốc chung!`);
      return;
    }

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
    const liveCatalog = readLivePrescriptionCatalog(profile.id);
    const outOfStockLine = lines.find((l) => {
      const m =
        liveCatalog.find((item) => item.id === l.medicineId) ||
        MEDICINE_CATALOG.find((item) => item.id === l.medicineId);
      return !m || m.stock <= 0;
    });
    if (outOfStockLine) {
      toast.error("Đơn thuốc có dược phẩm đã hết tồn kho trong Shop. Vui lòng chọn thuốc khác!");
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
        refillInstruction: refillInstruction.trim() || undefined,
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
    refillInstruction,
    setRefillInstruction,
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
