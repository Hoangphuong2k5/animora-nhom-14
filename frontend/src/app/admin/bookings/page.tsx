"use client";

import React from "react";
import {
  BookingsWorkspace,
  type ExtendedBooking,
} from "@/components/shared/operations/bookings/BookingsWorkspace";

export type { ExtendedBooking };

export default function AdminBookingsPage() {
  return <BookingsWorkspace mode="readonly" />;
}
