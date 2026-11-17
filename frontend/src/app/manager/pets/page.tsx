"use client";

import React from "react";
import {
  PetsWorkspace,
  type AdminPetItem,
  type DewormRecord,
  type MedicalHistoryRecord,
  type ReminderItem,
  type VaccineRecord,
} from "@/components/shared/operations/pets/PetsWorkspace";

export type {
  AdminPetItem,
  VaccineRecord,
  DewormRecord,
  MedicalHistoryRecord,
  ReminderItem,
};

export default function Page() {
  return <PetsWorkspace />;
}
