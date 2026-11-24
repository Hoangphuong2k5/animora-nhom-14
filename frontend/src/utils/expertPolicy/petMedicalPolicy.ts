import type { ExpertPet, PetMedicalAuditLogEntry } from "@/types/expert.type";

/**
 * Nghiệp vụ Animora v1.4 (Mục 2 & Mục 3 - Hồ sơ thú cưng):
 * - Dữ liệu y tế (Cân nặng, Dị ứng, Hành vi, Triệt sản) do Bác sĩ làm chủ sau lần cập nhật đầu tiên (medicalLocked = true).
 * - Mọi lần đổi ghi Audit Log (giá trị cũ, giá trị mới, bác sĩ sửa, lúc nào).
 */
export function applyDoctorPetMedicalUpdate(
  pet: ExpertPet,
  patch: Partial<
    Pick<ExpertPet, "weightKg" | "allergies" | "behaviors" | "isNeutered">
  >,
  actor: {
    expertId: string;
    expertName: string;
    source?: "clinical_exam" | "profile_update" | "customer_note_confirm";
    timestampIso?: string;
  }
): {
  updatedPet: ExpertPet;
  logEntry: PetMedicalAuditLogEntry | null;
  weightChanged: boolean;
} {
  const nowIso = actor.timestampIso ?? new Date().toISOString();
  const changes: PetMedicalAuditLogEntry["changes"] = [];
  let weightChanged = false;

  const nextWeightKg =
    patch.weightKg !== undefined && Number(patch.weightKg) > 0
      ? Number(Number(patch.weightKg).toFixed(2))
      : pet.weightKg;

  if (nextWeightKg !== pet.weightKg) {
    weightChanged = true;
    changes.push({
      field: "weightKg",
      label: "Cân nặng thực tế",
      oldValue: `${pet.weightKg} kg`,
      newValue: `${nextWeightKg} kg`,
    });
  }

  const nextAllergies =
    patch.allergies !== undefined
      ? patch.allergies.trim() || undefined
      : pet.allergies;
  if ((nextAllergies ?? "") !== (pet.allergies ?? "")) {
    changes.push({
      field: "allergies",
      label: "Tiền sử dị ứng",
      oldValue: pet.allergies || "Không có",
      newValue: nextAllergies || "Không có",
    });
  }

  const nextBehaviors =
    patch.behaviors !== undefined
      ? patch.behaviors.trim() || undefined
      : pet.behaviors;
  if ((nextBehaviors ?? "") !== (pet.behaviors ?? "")) {
    changes.push({
      field: "behaviors",
      label: "Hành vi & lưu ý an toàn",
      oldValue: pet.behaviors || "Chưa ghi nhận",
      newValue: nextBehaviors || "Chưa ghi nhận",
    });
  }

  const nextIsNeutered =
    patch.isNeutered !== undefined ? patch.isNeutered : pet.isNeutered;
  if (
    patch.isNeutered !== undefined &&
    Boolean(nextIsNeutered) !== Boolean(pet.isNeutered)
  ) {
    changes.push({
      field: "isNeutered",
      label: "Tình trạng triệt sản",
      oldValue:
        pet.isNeutered === undefined
          ? "Chưa xác định"
          : pet.isNeutered
          ? "Đã triệt sản"
          : "Chưa triệt sản",
      newValue: nextIsNeutered ? "Đã triệt sản" : "Chưa triệt sản",
    });
  }

  // Nếu đây là lần đầu BS khóa hồ sơ y tế dù giá trị không đổi (BS xác nhận số khách khai là đúng)
  if (changes.length === 0 && !pet.medicalLocked) {
    changes.push({
      field: "weightKg",
      label: "Xác nhận & khóa cân nặng y tế",
      oldValue: `${pet.weightKg} kg (Khách khai)`,
      newValue: `${nextWeightKg} kg (BS xác nhận & khóa)`,
    });
  }

  const logEntry: PetMedicalAuditLogEntry | null =
    changes.length > 0
      ? {
          id: `med-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          petId: pet.id,
          updatedAt: nowIso,
          updatedByExpertId: actor.expertId,
          updatedByExpertName: actor.expertName,
          source: actor.source ?? "profile_update",
          changes,
        }
      : null;

  const updatedPet: ExpertPet = {
    ...pet,
    weightKg: nextWeightKg,
    allergies: nextAllergies,
    behaviors: nextBehaviors,
    isNeutered: nextIsNeutered,
    medicalLocked: true,
    medicalUpdateLogs: logEntry
      ? [logEntry, ...(pet.medicalUpdateLogs ?? [])]
      : pet.medicalUpdateLogs,
  };

  return { updatedPet, logEntry, weightChanged };
}

/**
 * Nghiệp vụ Animora v1.4 (Mục 3):
 * Ghi chú bổ sung từ khách: KH chỉ thêm dòng mới (có thời gian), không sửa hay xóa dòng cũ.
 * BS xem và đưa vào trường dị ứng (hoặc hành vi) chính thức khi xác nhận.
 */
export function confirmPetCustomerNoteByDoctor(
  pet: ExpertPet,
  noteId: string,
  targetField: "allergies" | "behaviors",
  actor: {
    expertId: string;
    expertName: string;
    timestampIso?: string;
  }
): {
  updatedPet: ExpertPet;
  logEntry: PetMedicalAuditLogEntry | null;
} {
  const targetNote = (pet.customerNotes ?? []).find((n) => n.id === noteId);
  if (!targetNote) {
    return { updatedPet: pet, logEntry: null };
  }

  const nowIso = actor.timestampIso ?? new Date().toISOString();
  const currentVal = (
    targetField === "allergies" ? pet.allergies : pet.behaviors
  )?.trim();
  const noteText = targetNote.content.trim();

  const mergedVal = !currentVal
    ? noteText
    : currentVal.toLowerCase().includes(noteText.toLowerCase())
    ? currentVal
    : `${currentVal}; ${noteText}`;

  const { updatedPet: baseUpdated, logEntry } = applyDoctorPetMedicalUpdate(
    pet,
    targetField === "allergies"
      ? { allergies: mergedVal }
      : { behaviors: mergedVal },
    {
      ...actor,
      source: "customer_note_confirm",
      timestampIso: nowIso,
    }
  );

  const updatedCustomerNotes = (baseUpdated.customerNotes ?? []).map((n) =>
    n.id === noteId
      ? {
          ...n,
          confirmedByExpert: true,
          confirmedTarget: targetField,
          confirmedAt: nowIso.replace("T", " ").slice(0, 16),
          confirmedByName: actor.expertName,
        }
      : n
  );

  return {
    updatedPet: {
      ...baseUpdated,
      customerNotes: updatedCustomerNotes,
    },
    logEntry,
  };
}

