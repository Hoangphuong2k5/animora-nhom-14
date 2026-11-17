"use client";

import React from "react";
import {
  StaffWorkspace,
  type StaffItem,
} from "@/components/shared/operations/staff/StaffWorkspace";

export type { StaffItem };

export default function AdminStaffPage() {
  return <StaffWorkspace mode="readonly" />;
}
