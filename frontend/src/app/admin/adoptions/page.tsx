"use client";

import React from "react";
import {
  AdoptionsWorkspace,
  type ShelterPartner,
} from "@/components/shared/operations/adoptions/AdoptionsWorkspace";

export type { ShelterPartner };

export default function AdminAdoptionsPage() {
  return <AdoptionsWorkspace mode="readonly" />;
}
