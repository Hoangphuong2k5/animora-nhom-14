"use client";

import { useState, useMemo } from "react";
import { Prescription } from "@/types/expert.type";

export function usePrescriptionFilters(prescriptions: Prescription[]) {
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  const filteredList = useMemo(() => {
    return prescriptions.filter((p) => {
      if (filterSeverity !== "all" && p.severity !== filterSeverity) return false;

      // Status check
      if (filterStatus === "active") {
        if (p.severity === "severe" || p.refillsUsed >= p.refillsAllowed) return false;
      } else if (filterStatus === "exhausted") {
        if (p.refillsAllowed === 0 || p.refillsUsed < p.refillsAllowed) return false;
      } else if (filterStatus === "needs_revisit") {
        if (p.severity !== "severe") return false;
      }

      return true;
    });
  }, [prescriptions, filterSeverity, filterStatus]);

  return {
    filterSeverity,
    setFilterSeverity,
    filterStatus,
    setFilterStatus,
    selectedRx,
    setSelectedRx,
    showWizard,
    setShowWizard,
    filteredList,
  };
}

