"use client";

import React from "react";
import {
  StaffWorkspace,
  type StaffItem,
} from "@/components/shared/operations/staff/StaffWorkspace";

export type { StaffItem };

export default function ManagerStaffPage() {
  return <StaffWorkspace mode="manager" />;
}
