"use client";

import React from "react";
import {
  CustomersWorkspace,
  type CustomerBookingHistory,
  type CustomerOrderHistory,
  type CustomerPet,
  type CustomerProfile,
  type CustomerReview,
} from "@/components/shared/operations/customers/CustomersWorkspace";

export type {
  CustomerBookingHistory,
  CustomerOrderHistory,
  CustomerPet,
  CustomerProfile,
  CustomerReview,
};

export default function Page() {
  return <CustomersWorkspace />;
}
