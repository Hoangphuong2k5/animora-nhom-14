"use client";

import { useState, useMemo } from "react";
import { ExpertPet, ExpertStoreState } from "@/types/expert.type";
import { LinePoint } from "@/components/expert/Charts";

export function usePetHealthRecords(
  scopedPets: ExpertPet[],
  store: ExpertStoreState,
  initialPetId?: string | null
) {
  const [manualSelection, setManualSelection] = useState<{
    petId: string;
    forInitialPetId: string | null | undefined;
  } | null>(null);

  const selectedPetId = useMemo(() => {
    if (
      manualSelection &&
      manualSelection.forInitialPetId === initialPetId &&
      scopedPets.some((p) => p.id === manualSelection.petId)
    ) {
      return manualSelection.petId;
    }
    if (initialPetId && scopedPets.some((p) => p.id === initialPetId)) {
      return initialPetId;
    }
    return scopedPets[0]?.id || "";
  }, [manualSelection, initialPetId, scopedPets]);

  const setSelectedPetId = (petId: string) => {
    setManualSelection({ petId, forInitialPetId: initialPetId });
  };

  const selectedPet = useMemo(
    () => scopedPets.find((p) => p.id === selectedPetId),
    [scopedPets, selectedPetId]
  );

  const petHealthEntries = useMemo(() => {
    return store.healthEntries.filter((h) => h.petId === selectedPetId);
  }, [store.healthEntries, selectedPetId]);

  const petWeightLogs = useMemo(() => {
    return store.weightLogs
      .filter((w) => w.petId === selectedPetId)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [store.weightLogs, selectedPetId]);

  const petMedicalRecords = useMemo(() => {
    return store.medicalRecords
      .filter((m) => m.petId === selectedPetId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [store.medicalRecords, selectedPetId]);

  const latestWeightKg = useMemo(() => {
    const lastLog = petWeightLogs[petWeightLogs.length - 1];
    const latestRec = petMedicalRecords[0];
    if (lastLog && latestRec) {
      return latestRec.date >= lastLog.date
        ? latestRec.weightKg
        : lastLog.weightKg;
    }
    if (lastLog) return lastLog.weightKg;
    if (latestRec) return latestRec.weightKg;
    return selectedPet?.weightKg ?? 0;
  }, [petWeightLogs, petMedicalRecords, selectedPet]);

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
    latestWeightKg,
    weightPoints,
  };
}

