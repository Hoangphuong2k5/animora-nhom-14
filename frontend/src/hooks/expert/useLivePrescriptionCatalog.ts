"use client";

import { useEffect, useState } from "react";
import { MEDICINE_CATALOG } from "@/data/medicineCatalog";
import type { MedicineItem } from "@/types/expert.type";
import {
  MEDICINE_BOX_SYNC_EVENT,
  readLivePrescriptionCatalog,
} from "@/utils/medicineBoxSync";

/**
 * React hook returning the live prescription catalog synced with Shop products
 * and the logged-in doctor's personal medicine shelf.
 */
export function useLivePrescriptionCatalog(expertId?: string): MedicineItem[] {
  const [catalog, setCatalog] = useState<MedicineItem[]>(MEDICINE_CATALOG);

  useEffect(() => {
    let cancelled = false;
    const sync = () => {
      if (cancelled) return;
      setCatalog(readLivePrescriptionCatalog(expertId));
    };
    Promise.resolve().then(sync);
    window.addEventListener(MEDICINE_BOX_SYNC_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      cancelled = true;
      window.removeEventListener(MEDICINE_BOX_SYNC_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [expertId]);

  return catalog;
}
