"use client";

import { useState, useMemo } from "react";
import { ExpertAppointment } from "@/types/expert.type";
import { getTodayLocalIso } from "@/utils/dateFormat";

export function useAppointmentFilters(
  appointments: ExpertAppointment[],
  queryCode?: string | null
) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [filterService, setFilterService] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all");
  const [filterDateRange, setFilterDateRange] = useState<string>("all");

  const [selectedAppt, setSelectedAppt] = useState<ExpertAppointment | null>(() => {
    if (queryCode) {
      return appointments.find((a) => a.code === queryCode) || null;
    }
    return null;
  });

  const [todayIso] = useState<string>(() =>
    typeof window !== "undefined" ? getTodayLocalIso() : "2026-11-17"
  );

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      // Tab filter
      if (activeTab !== "all" && a.status !== activeTab) return false;

      // Service filter
      if (filterService !== "all" && a.serviceId !== filterService) return false;

      // Payment timing filter
      if (filterPayment !== "all" && a.paymentTiming !== filterPayment) return false;

      // Date range filter
      if (filterDateRange === "today") {
        if (!a.startAt.startsWith(todayIso)) return false;
      } else if (filterDateRange === "week") {
        if (a.startAt < todayIso) return false;
      }

      return true;
    });
  }, [appointments, activeTab, filterService, filterPayment, filterDateRange, todayIso]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: appointments.length,
      pending: 0,
      upcoming: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    };
    appointments.forEach((a) => {
      if (counts[a.status] !== undefined) counts[a.status]++;
    });
    return counts;
  }, [appointments]);

  return {
    activeTab,
    setActiveTab,
    filterService,
    setFilterService,
    filterPayment,
    setFilterPayment,
    filterDateRange,
    setFilterDateRange,
    selectedAppt,
    setSelectedAppt,
    filteredAppointments,
    tabCounts,
    todayIso,
  };
}

