"use client";

import { useMemo } from "react";
import { getTodayLocalIso } from "@/utils/dateFormat";
import { getCurrentWeekMondayIso } from "@/utils/expertPolicy";
import type { BarDataPoint, DonutSlice } from "@/components/expert/Charts";
import type { ExpertServiceDef, ExpertStoreState } from "@/types/expert.type";

const CHART_COLORS = [
  "var(--primary)",
  "#FF7F6B",
  "#4C7380",
  "#D97706",
  "#10B981",
];

const WEEK_DAY_NAMES = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const MONTH_BUCKETS = [
  { label: "Tuần 1", subLabel: "01-07", minDay: 1, maxDay: 7 },
  { label: "Tuần 2", subLabel: "08-14", minDay: 8, maxDay: 14 },
  { label: "Tuần 3", subLabel: "15-21", minDay: 15, maxDay: 21 },
  { label: "Tuần 4", subLabel: "22-31", minDay: 22, maxDay: 31 },
];

export function useExpertOverviewMetrics(
  store: ExpertStoreState,
  allServices: ExpertServiceDef[],
  isVet: boolean,
  todayStr: string
) {
  return useMemo(() => {
    const todayAppointments = store.appointments.filter((a) =>
      a.startAt.startsWith(todayStr)
    );
    const upcomingWeekAppointments = store.appointments.filter(
      (a) => a.status !== "cancelled" && a.startAt >= todayStr
    );

    const avgRating =
      store.reviews.length > 0
        ? (
            store.reviews.reduce((sum, r) => sum + r.rating, 0) /
            store.reviews.length
          ).toFixed(1)
        : "5.0";

    const completedAppointmentsCount = store.appointments.filter(
      (a) => a.status === "completed"
    ).length;

    const sortedToday = [...todayAppointments].sort((a, b) =>
      a.startAt.localeCompare(b.startAt)
    );

    const pendingAppointments = store.appointments.filter(
      (a) => a.status === "pending"
    );
    const rescheduleRequests = store.appointments.filter(
      (a) => Boolean(a.rescheduleRequest)
    );
    const completedNoRecord = store.appointments.filter((a) =>
      isVet
        ? a.status === "completed" && !a.medicalRecordId
        : a.status === "in_progress"
    );
    const pendingShifts = store.shiftRequests.filter(
      (r) => r.status === "pending"
    );

    const exhaustedPrescriptions = store.prescriptions.filter(
      (p) => p.refillsAllowed > 0 && p.refillsUsed >= p.refillsAllowed
    );
    const revisitDueAppointments = store.appointments.filter(
      (a) => a.status === "completed" && a.followUpDate
    );

    const activeAppointments = store.appointments.filter(
      (a) => a.status !== "cancelled"
    );
    const activeApptIdSet = new Set(activeAppointments.map((a) => a.id));
    const standaloneRecords = isVet
      ? store.medicalRecords.filter(
          (r) => !r.appointmentId || !activeApptIdSet.has(r.appointmentId)
        )
      : [];

    const weekMonday = new Date(`${getCurrentWeekMondayIso(todayStr)}T00:00:00`);
    const weekData: BarDataPoint[] = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(weekMonday);
      d.setDate(weekMonday.getDate() + idx);
      const iso = getTodayLocalIso(d);
      const subLabel = `${String(d.getDate()).padStart(2, "0")}/${String(
        d.getMonth() + 1
      ).padStart(2, "0")}`;
      const apptCount = activeAppointments.filter((a) =>
        a.startAt.startsWith(iso)
      ).length;
      const recCount = standaloneRecords.filter((r) => r.date === iso).length;
      return {
        label: WEEK_DAY_NAMES[d.getDay()],
        subLabel,
        value: apptCount + recCount,
      };
    });

    const currentMonthPrefix = todayStr.slice(0, 7);
    const monthData: BarDataPoint[] = MONTH_BUCKETS.map((bucket) => {
      const apptCount = activeAppointments.filter((a) => {
        if (!a.startAt.startsWith(currentMonthPrefix)) return false;
        const day = Number(a.startAt.slice(8, 10));
        return day >= bucket.minDay && day <= bucket.maxDay;
      }).length;
      const recCount = standaloneRecords.filter((r) => {
        if (!r.date.startsWith(currentMonthPrefix)) return false;
        const day = Number(r.date.slice(8, 10));
        return day >= bucket.minDay && day <= bucket.maxDay;
      }).length;
      return {
        label: bucket.label,
        subLabel: bucket.subLabel,
        value: apptCount + recCount,
      };
    });

    const serviceCountMap = new Map<string, number>();
    for (const appt of activeAppointments) {
      const srvName =
        allServices.find((s) => s.id === appt.serviceId)?.name.vi || appt.serviceId;
      serviceCountMap.set(srvName, (serviceCountMap.get(srvName) ?? 0) + 1);
    }
    if (standaloneRecords.length > 0) {
      const clinicalLabel = "Khám lâm sàng (Bệnh án ngoài lịch)";
      serviceCountMap.set(
        clinicalLabel,
        (serviceCountMap.get(clinicalLabel) ?? 0) + standaloneRecords.length
      );
    }

    const sortedServices = Array.from(serviceCountMap.entries()).sort(
      (a, b) => b[1] - a[1]
    );
    const topServices = sortedServices.slice(0, 4);
    const otherServicesTotal = sortedServices
      .slice(4)
      .reduce((sum, [, count]) => sum + count, 0);
    if (otherServicesTotal > 0) {
      topServices.push(["Dịch vụ khác", otherServicesTotal]);
    }

    const serviceSlices: DonutSlice[] =
      topServices.length > 0
        ? topServices.map(([label, value], idx) => ({
            label,
            value,
            color: CHART_COLORS[idx % CHART_COLORS.length],
          }))
        : [
            {
              label: isVet ? "Chưa có ca khám" : "Chưa có ca dịch vụ",
              value: 0,
              color: "#94A3B8",
            },
          ];

    return {
      todayAppointments,
      upcomingWeekAppointments,
      avgRating,
      completedAppointmentsCount,
      sortedToday,
      pendingAppointments,
      rescheduleRequests,
      completedNoRecord,
      pendingShifts,
      exhaustedPrescriptions,
      revisitDueAppointments,
      weekData,
      monthData,
      serviceSlices,
      latestReviews: store.reviews.slice(0, 3),
    };
  }, [store, allServices, isVet, todayStr]);
}

