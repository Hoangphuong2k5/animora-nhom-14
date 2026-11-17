"use client";

import React from "react";
import {
  VouchersWorkspace,
  type AdminVoucher,
} from "@/components/shared/operations/vouchers/VouchersWorkspace";

export type { AdminVoucher };

export default function AdminVouchersPage() {
  return <VouchersWorkspace mode="readonly" />;
}
