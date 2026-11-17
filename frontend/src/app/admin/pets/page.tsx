"use client";

import React from "react";
import { AdminPetsPage } from "@/components/admin/pets/AdminPetsPage";
import type {
  AdminPetItem,
  VaccineRecord,
  DewormRecord,
  MedicalHistoryRecord,
  ReminderItem,
} from "@/components/admin/pets/petsData";

export type {
  AdminPetItem,
  VaccineRecord,
  DewormRecord,
  MedicalHistoryRecord,
  ReminderItem,
};

export default function Page() {
  return <AdminPetsPage />;
}
