"use client";

import React from "react";
import {
  AdoptionsWorkspace,
  type ExtendedAdoptionPet,
  type ShelterPartner,
} from "@/components/shared/operations/adoptions/AdoptionsWorkspace";

export type { ShelterPartner, ExtendedAdoptionPet };

export default function ManagerAdoptionsPage() {
  return <AdoptionsWorkspace mode="manager" />;
}
