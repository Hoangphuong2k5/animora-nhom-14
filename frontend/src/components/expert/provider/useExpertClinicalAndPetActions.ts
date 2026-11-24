"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { writeExpertPetsRegistry } from "@/utils/clinicalSync";
import {
  applyDoctorPetMedicalUpdate,
  confirmPetCustomerNoteByDoctor,
} from "@/utils/expertPolicy";
import { getTodayLocalIso } from "@/utils/dateFormat";
import type {
  ExpertPet,
  ExpertProfile,
  ExpertStoreState,
  HealthEntry,
  MedicalRecord,
  Prescription,
  WeightLog,
} from "@/types/expert.type";

interface UseExpertClinicalAndPetActionsParams {
  profile: ExpertProfile;
  isVet: boolean;
  setStore: React.Dispatch<React.SetStateAction<ExpertStoreState>>;
  setPets: React.Dispatch<React.SetStateAction<ExpertPet[]>>;
}

export function useExpertClinicalAndPetActions({
  profile,
  isVet,
  setStore,
  setPets,
}: UseExpertClinicalAndPetActionsParams) {
  const addPrescription = useCallback(
    (prescription: Prescription) => {
      if (!isVet) {
        toast.error(
          "Quyền hạn bị từ chối: Nhân viên chăm sóc không có quyền kê đơn thuốc."
        );
        return;
      }
      setStore((prev) => {
        const targetRecordId =
          prescription.medicalRecordId ||
          prev.medicalRecords.find(
            (r) =>
              (prescription.appointmentId &&
                r.appointmentId === prescription.appointmentId) ||
              (r.petId === prescription.petId &&
                r.date === prescription.issuedAt)
          )?.id;

        const enrichedRx: Prescription = {
          ...prescription,
          medicalRecordId: targetRecordId,
        };

        return {
          ...prev,
          prescriptions: [enrichedRx, ...prev.prescriptions],
          appointments: prev.appointments.map((a) =>
            a.id === prescription.appointmentId
              ? { ...a, prescriptionId: prescription.id }
              : a
          ),
          medicalRecords: targetRecordId
            ? prev.medicalRecords.map((r) =>
                r.id === targetRecordId
                  ? { ...r, prescriptionId: prescription.id }
                  : r
              )
            : prev.medicalRecords,
        };
      });
      toast.success(`Đã lưu đơn thuốc ${prescription.code}!`);
    },
    [isVet, setStore]
  );

  const addMedicalRecord = useCallback(
    (record: MedicalRecord) => {
      if (!isVet) {
        toast.error(
          "Quyền hạn bị từ chối: Nhân viên chăm sóc không có quyền lập bệnh án hoặc sổ sức khỏe."
        );
        return;
      }
      const generatedEntries: HealthEntry[] = [
        {
          id: `he-ill-${Date.now()}`,
          petId: record.petId,
          kind: "illness",
          date: record.date,
          title: record.diagnosis,
          detail: `${record.symptoms}${record.note ? ` • Chỉ định: ${record.note}` : ""}`,
          nextDueDate: record.revisitDate || undefined,
          authorId: profile.id,
          authorName: profile.fullName,
        },
      ];

      if (record.nextVaccineDate) {
        generatedEntries.push({
          id: `he-vac-${Date.now() + 1}`,
          petId: record.petId,
          kind: "vaccine",
          date: record.date,
          title: "Nhắc lịch tiêm chủng theo chỉ định bác sĩ",
          detail: `Chẩn đoán liên quan: ${record.diagnosis}`,
          nextDueDate: record.nextVaccineDate,
          authorId: profile.id,
          authorName: profile.fullName,
        });
      }

      if (record.nextDewormDate) {
        generatedEntries.push({
          id: `he-dew-${Date.now() + 2}`,
          petId: record.petId,
          kind: "deworm",
          date: record.date,
          title: "Nhắc lịch tẩy giun định kỳ theo chỉ định bác sĩ",
          detail: `Chẩn đoán liên quan: ${record.diagnosis}`,
          nextDueDate: record.nextDewormDate,
          authorId: profile.id,
          authorName: profile.fullName,
        });
      }

      setStore((prev) => ({
        ...prev,
        medicalRecords: [record, ...prev.medicalRecords],
        healthEntries: [...generatedEntries, ...prev.healthEntries],
        appointments: prev.appointments.map((a) =>
          a.id === record.appointmentId
            ? { ...a, medicalRecordId: record.id }
            : a
        ),
      }));

      // Theo v1.4 Mục 3 & Mục 4: BS khám cập nhật cân nặng thực tế vào hồ sơ y tế, khóa với KH (medicalLocked = true) và ghi Audit Log
      if (record.weightKg && record.weightKg > 0) {
        setPets((prev) => {
          const next = prev.map((p) => {
            if (p.id !== record.petId) return p;
            const { updatedPet } = applyDoctorPetMedicalUpdate(
              p,
              { weightKg: record.weightKg },
              {
                expertId: profile.id,
                expertName: profile.fullName,
                source: "clinical_exam",
              }
            );
            return updatedPet;
          });
          writeExpertPetsRegistry(next);
          return next;
        });
      }

      toast.success(
        "Đã lưu bệnh án, cập nhật cân nặng & khóa dữ liệu y tế của thú cưng!"
      );
    },
    [isVet, profile.id, profile.fullName, setPets, setStore]
  );

  const addHealthEntry = useCallback(
    (entry: HealthEntry) => {
      if (!isVet) {
        toast.error(
          "Quyền hạn bị từ chối: Nhân viên chăm sóc không có quyền ghi sổ sức khỏe."
        );
        return;
      }
      setStore((prev) => ({
        ...prev,
        healthEntries: [entry, ...prev.healthEntries],
      }));
      toast.success("Đã thêm bản ghi vào sổ sức khỏe!");
    },
    [isVet, setStore]
  );

  const addWeightLog = useCallback(
    (log: WeightLog) => {
      if (!isVet) {
        toast.error(
          "Quyền hạn bị từ chối: Nhân viên chăm sóc chỉ có quyền xem thông tin thú cưng, không cập nhật cân nặng."
        );
        return;
      }
      setStore((prev) => ({
        ...prev,
        weightLogs: [...prev.weightLogs, log],
      }));
    },
    [isVet, setStore]
  );

  const updatePet = useCallback(
    (petId: string, patch: Partial<ExpertPet>) => {
      if (!isVet) {
        toast.error(
          "Nhân viên chăm sóc chỉ có quyền xem hồ sơ thú cưng, không có quyền chỉnh sửa."
        );
        return;
      }
      let newWeightForLog: number | null = null;
      setPets((prev) => {
        const next = prev.map((p) => {
          if (p.id !== petId) return p;
          const { updatedPet, weightChanged } = applyDoctorPetMedicalUpdate(
            p,
            {
              weightKg: patch.weightKg,
              allergies: patch.allergies,
              behaviors: patch.behaviors,
              isNeutered: patch.isNeutered,
            },
            {
              expertId: profile.id,
              expertName: profile.fullName,
              source: "profile_update",
            }
          );
          if (weightChanged) {
            newWeightForLog = updatedPet.weightKg;
          }
          return {
            ...p,
            ...patch,
            weightKg: updatedPet.weightKg,
            allergies: updatedPet.allergies,
            behaviors: updatedPet.behaviors,
            isNeutered: updatedPet.isNeutered,
            medicalLocked: true,
            medicalUpdateLogs: updatedPet.medicalUpdateLogs,
          };
        });
        writeExpertPetsRegistry(next);
        return next;
      });

      if (newWeightForLog !== null) {
        const confirmedWeight = newWeightForLog;
        setStore((prev) => ({
          ...prev,
          weightLogs: [
            ...prev.weightLogs,
            {
              petId,
              date: getTodayLocalIso(),
              weightKg: confirmedWeight,
            },
          ],
        }));
      }

      toast.success(
        "Đã cập nhật dữ liệu y tế, khóa với khách hàng và ghi Audit Log!"
      );
    },
    [isVet, profile.fullName, profile.id, setPets, setStore]
  );

  const confirmCustomerNoteToMedicalProfile = useCallback(
    (
      petId: string,
      noteId: string,
      targetField: "allergies" | "behaviors"
    ) => {
      if (!isVet) {
        toast.error(
          "Chỉ Bác sĩ thú y mới có quyền xác nhận ghi chú vào hồ sơ y tế chính thức."
        );
        return;
      }
      setPets((prev) => {
        const next = prev.map((p) => {
          if (p.id !== petId) return p;
          const { updatedPet } = confirmPetCustomerNoteByDoctor(
            p,
            noteId,
            targetField,
            {
              expertId: profile.id,
              expertName: profile.fullName,
            }
          );
          return updatedPet;
        });
        writeExpertPetsRegistry(next);
        return next;
      });
      toast.success(
        targetField === "allergies"
          ? "Đã xác nhận & đưa ghi chú của khách vào trường Dị ứng chính thức!"
          : "Đã xác nhận & đưa ghi chú của khách vào trường Hành vi chính thức!"
      );
    },
    [isVet, profile.fullName, profile.id, setPets]
  );

  return {
    addPrescription,
    addMedicalRecord,
    addHealthEntry,
    addWeightLog,
    updatePet,
    confirmCustomerNoteToMedicalProfile,
  };
}
