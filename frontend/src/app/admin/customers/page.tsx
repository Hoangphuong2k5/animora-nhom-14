"use client";

import React from "react";
import { AdminCustomersPage } from "@/components/admin/customers/AdminCustomersPage";
import type {
  CustomerBookingHistory,
  CustomerOrderHistory,
  CustomerPet,
  CustomerProfile,
  CustomerReview,
} from "@/components/admin/customers/customersData";

export type {
  CustomerBookingHistory,
  CustomerOrderHistory,
  CustomerPet,
  CustomerProfile,
  CustomerReview,
};

export default function Page() {
  return <AdminCustomersPage />;
}
