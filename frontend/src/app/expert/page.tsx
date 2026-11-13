"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  CalendarCheck,
  Pill,
  Star,
  TrendingUp,
} from "lucide-react";
import { useExpert } from "@/components/expert/ExpertProvider";
import { useExpertT } from "@/components/expert/expertI18n";
import { KpiCard } from "@/components/expert/KpiCard";
import { BarDataPoint, DonutSlice } from "@/components/expert/Charts";
import { AppointmentDrawer } from "@/components/expert/AppointmentDrawer";
import { AppointmentTimeline } from "@/components/expert/overview/AppointmentTimeline";
import { ActionNeededGrid } from "@/components/expert/overview/ActionNeededGrid";
import { OverviewChartsSection } from "@/components/expert/overview/OverviewChartsSection";
import { RecentReviewsCard } from "@/components/expert/overview/RecentReviewsCard";
import { ExpertAppointment } from "@/types/expert.type";
import { toast } from "sonner";
import { ROUTES } from "@/constants/config.constant";

function DeniedQueryHandler() {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("denied") === "rx") {
      toast.error(
        "Quyền truy cập bị từ chối: Chức năng Kê đơn thuốc điện tử chỉ dành cho Bác sĩ thú y có chứng chỉ hành nghề!"
      );
    }
  }, [searchParams]);
  return null;
}

export default function ExpertOverviewPage() {
  const router = useRouter();
  const { profile, isVet, store, allPets, allOwners, allServices, startAppointment } =
    useExpert();
  const { t } = useExpertT();

  const [chartPeriod, setChartPeriod] = useState<"week" | "month">("week");
  const [activeAppointment, setActiveAppointment] = useState<ExpertAppointment | null>(null);
  const [todayStr, setTodayStr] = useState<string>("2026-11-04");

  useEffect(() => {
    setTodayStr(new Date().toISOString().slice(0, 10));
  }, []);

  // 1. Calculations for Row 1 KPIs
  const todayAppointments = store.appointments.filter((a) =>
    a.startAt.startsWith(todayStr)
  );
  const upcomingWeekAppointments = store.appointments.filter((a) => {
    return a.status !== "cancelled" && a.startAt >= todayStr;
  });

  const avgRating =
    store.reviews.length > 0
      ? (
          store.reviews.reduce((sum, r) => sum + r.rating, 0) / store.reviews.length
        ).toFixed(1)
      : "5.0";

  // Thu nhập tạm tính tháng này
  const estimatedMonthEarnings = 28400000;

  // 2. Ca hôm nay timeline
  const sortedToday = [...todayAppointments].sort((a, b) =>
    a.startAt.localeCompare(b.startAt)
  );

  // 3. Cần xử lý counts
  const pendingAppointments = store.appointments.filter((a) => a.status === "pending");
  const rescheduleRequests = store.appointments.filter((a) => !!a.rescheduleRequest);
  const completedNoRecord = store.appointments.filter(
    (a) => a.status === "completed" && isVet && !a.medicalRecordId
  );
  const pendingShifts = store.shiftRequests.filter((r) => r.status === "pending");

  // [Bác sĩ] Đơn thuốc sắp hết lượt & thú cưng cần tái khám
  const exhaustedPrescriptions = store.prescriptions.filter(
    (p) => p.refillsAllowed > 0 && p.refillsUsed >= p.refillsAllowed
  );
  const revisitDueAppointments = store.appointments.filter(
    (a) => a.status === "completed" && a.followUpDate
  );

  // 4. Biểu đồ dữ liệu
  const weekData: BarDataPoint[] = [
    { label: "T2", subLabel: "28/10", value: 4 },
    { label: "T3", subLabel: "29/10", value: 6 },
    { label: "T4", subLabel: "30/10", value: 5 },
    { label: "T5", subLabel: "31/10", value: 8 },
    { label: "T6", subLabel: "01/11", value: 9 },
    { label: "T7", subLabel: "02/11", value: 12 },
    { label: "CN", subLabel: "03/11", value: 10 },
  ];

  const monthData: BarDataPoint[] = [
    { label: "Tuần 1", subLabel: "01-07", value: 28 },
    { label: "Tuần 2", subLabel: "08-14", value: 34 },
    { label: "Tuần 3", subLabel: "15-21", value: 39 },
    { label: "Tuần 4", subLabel: "22-28", value: 45 },
  ];

  const serviceSlices: DonutSlice[] = isVet
    ? [
        { label: "Khám tổng quát", value: 38, color: "var(--primary)" },
        { label: "Da liễu & Tai", value: 24, color: "#FF7F6B" },
        { label: "Tiêm chủng vaccine", value: 18, color: "#4C7380" },
        { label: "Siêu âm / Xét nghiệm", value: 12, color: "#D97706" },
      ]
    : [
        { label: "Cắt tỉa tạo kiểu", value: 45, color: "var(--primary)" },
        { label: "Spa dưỡng thảo mộc", value: 35, color: "#FF7F6B" },
        { label: "Vệ sinh tai móng", value: 20, color: "#4C7380" },
      ];

  const latestReviews = store.reviews.slice(0, 3);

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <DeniedQueryHandler />
      </Suspense>

      {/* Page Title & Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold font-heading text-zinc-900 dark:text-foreground">
              {profile.fullName}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#6B1F2E]/10 dark:bg-[#FF7F6B]/20 text-[#6B1F2E] dark:text-[#FF7F6B] uppercase tracking-wide">
              {isVet ? t.vetRoleLabel : t.groomerRoleLabel}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Chào mừng trở lại! Bạn có{" "}
            <strong className="text-zinc-800 dark:text-foreground/90">
              {todayAppointments.length} ca hẹn
            </strong>{" "}
            trong ngày hôm nay.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isVet && (
            <Link
              href={
                todayAppointments[0]
                  ? `${ROUTES.EXPERT_PRESCRIPTIONS_NEW}?appointmentId=${todayAppointments[0].id}&petId=${todayAppointments[0].petId}`
                  : ROUTES.EXPERT_PRESCRIPTIONS_NEW
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] transition-colors cursor-pointer shadow-sm shadow-[#6B1F2E]/20"
            >
              <Pill className="w-3.5 h-3.5 text-[#FF7F6B]" />
              <span>Kê đơn thuốc mới</span>
            </Link>
          )}

          <Link
            href={ROUTES.EXPERT_SCHEDULE}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-zinc-200 dark:border-border bg-white dark:bg-card text-zinc-800 dark:text-foreground/90 hover:bg-zinc-50 dark:hover:bg-muted transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Xem lịch tuần</span>
          </Link>
        </div>
      </div>

      {/* HÀNG 1: 4 THẺ KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Lịch hẹn hôm nay"
          value={todayAppointments.length}
          subValue="ca khám"
          changePercent={14}
          changePeriodLabel="so với hôm qua"
          icon={<CalendarCheck className="w-5 h-5" />}
          variant="primary"
        />
        <KpiCard
          label="Lịch hẹn sắp tới trong tuần"
          value={upcomingWeekAppointments.length}
          subValue="ca"
          changePercent={8}
          changePeriodLabel="so với tuần trước"
          icon={<Calendar className="w-5 h-5" />}
          variant="coral"
        />
        <KpiCard
          label="Điểm đánh giá trung bình"
          value={avgRating}
          subValue={`/ 5.0 (${store.reviews.length} lượt)`}
          changePercent={2}
          changePeriodLabel="so với tháng trước"
          icon={<Star className="w-5 h-5 fill-amber-400 text-amber-400" />}
          variant="amber"
        />
        <KpiCard
          label="Thu nhập tạm tính tháng này"
          value={`${(estimatedMonthEarnings / 1000000).toFixed(1)}M`}
          subValue="VND"
          changePercent={18}
          changePeriodLabel="so với tháng 10"
          icon={<TrendingUp className="w-5 h-5" />}
          variant="emerald"
        />
      </div>

      {/* HÀNG 2: LỊCH HÔM NAY (SUB-COMPONENT) */}
      <AppointmentTimeline
        appointments={sortedToday}
        pets={allPets}
        owners={allOwners}
        services={allServices}
        onStart={(id) => startAppointment(id)}
        onViewDetail={(appt) => setActiveAppointment(appt)}
      />

      {/* HÀNG 3: CẦN XỬ LÝ (SUB-COMPONENT) */}
      <ActionNeededGrid
        pendingCount={pendingAppointments.length}
        rescheduleCount={rescheduleRequests.length}
        completedNoRecordCount={completedNoRecord.length}
        pendingShiftCount={pendingShifts.length}
        exhaustedRxCount={exhaustedPrescriptions.length}
        revisitDueCount={revisitDueAppointments.length}
      />

      {/* HÀNG 4: BIỂU ĐỒ & NHẬN XÉT (SUB-COMPONENTS) */}
      <OverviewChartsSection
        period={chartPeriod}
        onPeriodChange={setChartPeriod}
        weekData={weekData}
        monthData={monthData}
        slices={serviceSlices}
      />

      {/* 3 ĐÁNH GIÁ MỚI NHẤT (SUB-COMPONENT) */}
      <RecentReviewsCard reviews={latestReviews} owners={allOwners} />

      {/* Slide-over Drawer */}
      <AppointmentDrawer
        appointment={activeAppointment}
        onClose={() => setActiveAppointment(null)}
        onOpenMedicalModal={(appt) => {
          const target = appt || activeAppointment;
          router.push(
            target
              ? `${ROUTES.EXPERT_HEALTH_RECORDS_NEW}?appointmentId=${target.id}&petId=${target.petId}`
              : ROUTES.EXPERT_HEALTH_RECORDS_NEW
          );
        }}
        onOpenPrescriptionWizard={(appt) => {
          const target = appt || activeAppointment;
          router.push(
            target
              ? `${ROUTES.EXPERT_PRESCRIPTIONS_NEW}?appointmentId=${target.id}&petId=${target.petId}`
              : ROUTES.EXPERT_PRESCRIPTIONS_NEW
          );
        }}
      />
    </div>
  );
}
