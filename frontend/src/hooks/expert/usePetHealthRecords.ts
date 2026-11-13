"use client";

import { useState, useMemo } from "react";
import {
  ExpertPet,
  ExpertStoreState,
  HealthEntry,
  MedicalRecord,
  WeightLog,
} from "@/types/expert.type";
import { LinePoint } from "@/components/expert/Charts";

export function usePetHealthRecords(
  scopedPets: ExpertPet[],
  store: ExpertStoreState,
  initialPetId?: string | null
) {
  const [selectedPetId, setSelectedPetId] = useState<string>(() => {
    if (initialPetId && scopedPets.some((p) => p.id === initialPetId)) {
      return initialPetId;
    }
    return scopedPets[0]?.id || "";
  });

  const selectedPet = useMemo(
    () => scopedPets.find((p) => p.id === selectedPetId),
    [scopedPets, selectedPetId]
  );

  const petHealthEntries = useMemo(() => {
    return store.healthEntries.filter((h) => h.petId === selectedPetId);
  }, [store.healthEntries, selectedPetId]);

  const petWeightLogs = useMemo(() => {
    return store.weightLogs.filter((w) => w.petId === selectedPetId);
  }, [store.weightLogs, selectedPetId]);

  const petMedicalRecords = useMemo(() => {
    return store.medicalRecords.filter((m) => m.petId === selectedPetId);
  }, [store.medicalRecords, selectedPetId]);

  const weightPoints: LinePoint[] = useMemo(() => {
    return petWeightLogs.map((w) => ({
      label: w.date.slice(5),
      value: w.weightKg,
    }));
  }, [petWeightLogs]);

  return {
    selectedPetId,
    setSelectedPetId,
    selectedPet,
    petHealthEntries,
    petWeightLogs,
    petMedicalRecords,
    weightPoints,
  };
}

