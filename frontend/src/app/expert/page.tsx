"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Pill,
  Sparkles,
  Star,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";
import { useExpert } from "@/components/expert/ExpertProvider";
import { KpiCard } from "@/components/expert/KpiCard";
import { AppointmentDrawer } from "@/components/expert/AppointmentDrawer";
import { AppointmentTimeline } from "@/components/expert/overview/AppointmentTimeline";
import { ActionNeededGrid } from "@/components/expert/overview/ActionNeededGrid";
import { OverviewChartsSection } from "@/components/expert/overview/OverviewChartsSection";
import { RecentReviewsCard } from "@/components/expert/overview/RecentReviewsCard";
import { ExpertPageBanner } from "@/components/expert/ExpertPageBanner";
import { useExpertOverviewMetrics } from "@/hooks/expert/useExpertOverviewMetrics";
import { useExpertAppointmentNavigation } from "@/hooks/expert/useExpertAppointmentNavigation";
import { formatExpertDisplayName } from "@/data/expertPortalData";
import { getTodayLocalIso } from "@/utils/dateFormat";
import { ROUTES } from "@/constants/config.constant";
import type { ExpertAppointment } from "@/types/expert.type";

function DeniedQueryHandler() {
  const searchParams = useSearchParams();
  useEffect(() => {
    const denied = searchParams.get("denied");
    if (denied === "rx") {
      toast.error(
        "Quyền truy cập bị từ chối: Chức năng Kê đơn thuốc điện tử chỉ dành cho Bác sĩ thú y có chứng chỉ hành nghề!"
      );
    } else if (denied === "medicine-box") {
      toast.error(
        "Quyền truy cập bị từ chối: Chức năng Kho thuốc chung & Xuất dùng chỉ dành riêng cho Bác sĩ thú y!"
      );
    } else if (denied === "health-records") {
      toast.error(
        "Quyền truy cập bị từ chối: Chức năng Sổ sức khỏe & Bệnh án chỉ dành cho Bác sĩ thú y (Nhân viên chăm sóc chỉ xem hồ sơ thú cưng)!"
      );
    }
  }, [searchParams]);
  return null;
}

export default function ExpertOverviewPage() {
  const {
    profile,
    isVet,
    store,
    allPets,
    allOwners,
    allServices,
    startAppointment,
  } = useExpert();

  const [chartPeriod, setChartPeriod] = useState<"week" | "month">("week");
  const [activeAppointment, setActiveAppointment] = useState<ExpertAppointment | null>(null);
  const [todayStr] = useState<string>(() =>
    typeof window !== "undefined" ? getTodayLocalIso() : "2026-11-17"
  );

  const {
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
    latestReviews,
  } = useExpertOverviewMetrics(store, allServices, isVet, todayStr);

  const { openMedicalModal, openPrescriptionWizard } =
    useExpertAppointmentNavigation(activeAppointment);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <Suspense fallback={null}>
        <DeniedQueryHandler />
      </Suspense>

      <ExpertPageBanner
        systemBadge={
          isVet
            ? "Animora Veterinary Clinical Center"
            : "Animora Pet Care & Grooming Center"
        }
        title={`Xin chào, ${formatExpertDisplayName(
          profile.fullName,
          profile.expertType
        )}!`}
        roleBadge={isVet ? "Bác sĩ Thú y" : "NV Chăm sóc Thú cưng"}
        employmentBadge="Full-time"
        description={
          isVet ? (
            <>
              Tổng quan ca khám &amp; lâm sàng: hôm nay bạn có{" "}
              <span className="font-bold text-[#FF7F6B]">
                {todayAppointments.length} ca khám
              </span>
              ,{" "}
              <span className="font-bold text-[#FF7F6B]">
                {pendingAppointments.length} ca
              </span>{" "}
              chờ tiếp nhận và{" "}
              <span className="font-bold text-[#FF7F6B]">
                {exhaustedPrescriptions.length} đơn thuốc
              </span>{" "}
              cần tái khám.
            </>
          ) : (
            <>
              Tổng quan ca chăm sóc &amp; spa: hôm nay bạn có{" "}
              <span className="font-bold text-[#FF7F6B]">
                {todayAppointments.length} ca dịch vụ
              </span>
              ,{" "}
              <span className="font-bold text-[#FF7F6B]">
                {pendingAppointments.length} lịch
              </span>{" "}
              chờ tiếp nhận và{" "}
              <span className="font-bold text-[#FF7F6B]">
                {pendingShifts.length} đơn xin nghỉ phép
              </span>{" "}
              chờ duyệt.
            </>
          )
        }
        actions={
          isVet ? (
            <>
              <Link
                href={
                  todayAppointments[0]
                    ? `${ROUTES.EXPERT_PRESCRIPTIONS_NEW}?appointmentId=${todayAppointments[0].id}&petId=${todayAppointments[0].petId}`
                    : ROUTES.EXPERT_PRESCRIPTIONS_NEW
                }
                className="px-4 py-2.5 rounded-xl bg-white text-[#6B1F2E] font-bold text-xs hover:bg-[#FFF4E8] transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Pill className="w-4 h-4 text-[#FF7F6B]" />
                <span>Kê đơn thuốc mới</span>
              </Link>
              <Link
                href={ROUTES.EXPERT_SCHEDULE}
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-all border border-white/20 flex items-center gap-2 cursor-pointer backdrop-blur-sm"
              >
                <Calendar className="w-4 h-4 text-[#FFD166]" />
                <span>Xem lịch tuần</span>
              </Link>
              <Link
                href={ROUTES.EXPERT_HEALTH_RECORDS}
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-all border border-white/20 flex items-center gap-2 cursor-pointer backdrop-blur-sm"
              >
                <Stethoscope className="w-4 h-4 text-[#A7F3D0]" />
                <span>Sổ sức khỏe</span>
              </Link>
              <Link
                href={ROUTES.EXPERT_SCHEDULE}
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-all border border-white/20 flex items-center gap-2 cursor-pointer backdrop-blur-sm"
              >
                <CalendarCheck className="w-4 h-4 text-[#F4B6C2]" />
                <span>Xin nghỉ phép</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href={ROUTES.EXPERT_APPOINTMENTS}
                className="px-4 py-2.5 rounded-xl bg-white text-[#6B1F2E] font-bold text-xs hover:bg-[#FFF4E8] transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4 text-[#FF7F6B]" />
                <span>Tiếp nhận ca dịch vụ</span>
              </Link>
              <Link
                href={ROUTES.EXPERT_SCHEDULE}
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-all border border-white/20 flex items-center gap-2 cursor-pointer backdrop-blur-sm"
              >
                <Calendar className="w-4 h-4 text-[#FFD166]" />
                <span>Xem lịch tuần</span>
              </Link>
              <Link
                href={ROUTES.EXPERT_SCHEDULE}
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-all border border-white/20 flex items-center gap-2 cursor-pointer backdrop-blur-sm"
              >
                <Clock className="w-4 h-4 text-[#A7F3D0]" />
                <span>Xin nghỉ phép</span>
              </Link>
              <Link
                href={ROUTES.EXPERT_CLIENTS}
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-all border border-white/20 flex items-center gap-2 cursor-pointer backdrop-blur-sm"
              >
                <Sparkles className="w-4 h-4 text-[#F4B6C2]" />
                <span>Khách &amp; Thú cưng</span>
              </Link>
            </>
          )
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label={isVet ? "Lịch khám hôm nay" : "Lịch hẹn hôm nay"}
          value={todayAppointments.length}
          subValue={isVet ? "ca khám" : "ca dịch vụ"}
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
          label="Ca đã hoàn thành"
          value={completedAppointmentsCount}
          subValue="ca phục vụ"
          changePercent={12}
          changePeriodLabel="so với tháng trước"
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="emerald"
        />
      </div>

      <ActionNeededGrid
        isVet={isVet}
        pendingCount={pendingAppointments.length}
        rescheduleCount={rescheduleRequests.length}
        completedNoRecordCount={completedNoRecord.length}
        pendingShiftCount={pendingShifts.length}
        exhaustedRxCount={exhaustedPrescriptions.length}
        revisitDueCount={revisitDueAppointments.length}
      />

      <AppointmentTimeline
        appointments={sortedToday}
        pets={allPets}
        owners={allOwners}
        services={allServices}
        onStart={(id) => startAppointment(id)}
        onViewDetail={(appt) => setActiveAppointment(appt)}
      />

      <OverviewChartsSection
        period={chartPeriod}
        onPeriodChange={setChartPeriod}
        weekData={weekData}
        monthData={monthData}
        slices={serviceSlices}
      />

      <RecentReviewsCard reviews={latestReviews} owners={allOwners} />

      <AppointmentDrawer
        appointment={activeAppointment}
        onClose={() => setActiveAppointment(null)}
        onOpenMedicalModal={openMedicalModal}
        onOpenPrescriptionWizard={openPrescriptionWizard}
      />
    </div>
  );
}
