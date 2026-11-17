"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { useExpert } from "@/components/expert/ExpertProvider";
import { KpiCard } from "@/components/expert/KpiCard";
import { BarDataPoint, DonutSlice } from "@/components/expert/Charts";
import { AppointmentDrawer } from "@/components/expert/AppointmentDrawer";
import { AppointmentTimeline } from "@/components/expert/overview/AppointmentTimeline";
import { ActionNeededGrid } from "@/components/expert/overview/ActionNeededGrid";
import { OverviewChartsSection } from "@/components/expert/overview/OverviewChartsSection";
import { RecentReviewsCard } from "@/components/expert/overview/RecentReviewsCard";
import { ExpertPageBanner } from "@/components/expert/ExpertPageBanner";
import { ExpertAppointment } from "@/types/expert.type";
import { formatExpertDisplayName } from "@/data/expertPortalData";
import { getTodayLocalIso } from "@/utils/dateFormat";
import { toast } from "sonner";
import { ROUTES } from "@/constants/config.constant";

const CHART_COLORS = [
  "var(--primary)",
  "#FF7F6B",
  "#4C7380",
  "#D97706",
  "#10B981",
];

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
        "Quyền truy cập bị từ chối: Chức năng Tủ thuốc cá nhân (Medicine Box) chỉ dành riêng cho Bác sĩ thú y!"
      );
    }
  }, [searchParams]);
  return null;
}

export default function ExpertOverviewPage() {
  const router = useRouter();
  const {
    profile,
    isVet,
    isPartTime,
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

  const completedAppointmentsCount = store.appointments.filter(
    (a) => a.status === "completed"
  ).length;

  // 2. Ca hôm nay timeline
  const sortedToday = [...todayAppointments].sort((a, b) =>
    a.startAt.localeCompare(b.startAt)
  );

  // 3. Cần xử lý counts
  const pendingAppointments = store.appointments.filter((a) => a.status === "pending");
  const rescheduleRequests = store.appointments.filter((a) => !!a.rescheduleRequest);
  const completedNoRecord = store.appointments.filter((a) =>
    isVet
      ? a.status === "completed" && !a.medicalRecordId
      : a.status === "in_progress" ||
        (a.status === "completed" && !a.managerConfirmedAt)
  );
  const pendingShifts = store.shiftRequests.filter((r) => r.status === "pending");

  // [Bác sĩ] Đơn thuốc sắp hết lượt & thú cưng cần tái khám
  const exhaustedPrescriptions = store.prescriptions.filter(
    (p) => p.refillsAllowed > 0 && p.refillsUsed >= p.refillsAllowed
  );
  const revisitDueAppointments = store.appointments.filter(
    (a) => a.status === "completed" && a.followUpDate
  );

  // 4. Biểu đồ dữ liệu động trực tiếp từ store.appointments + store.medicalRecords
  const activeAppointments = store.appointments.filter(
    (a) => a.status !== "cancelled"
  );
  const activeApptIdSet = new Set(activeAppointments.map((a) => a.id));
  const standaloneRecords = isVet
    ? store.medicalRecords.filter(
        (r) => !r.appointmentId || !activeApptIdSet.has(r.appointmentId)
      )
    : [];

  const todayDateObj = new Date(`${todayStr}T00:00:00`);
  const mondayOffset = todayDateObj.getDay() === 0 ? -6 : 1 - todayDateObj.getDay();
  const weekMonday = new Date(todayDateObj);
  weekMonday.setDate(todayDateObj.getDate() + mondayOffset);
  const weekDayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

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
      label: weekDayNames[d.getDay()],
      subLabel,
      value: apptCount + recCount,
    };
  });

  const currentMonthPrefix = todayStr.slice(0, 7);
  const monthBuckets = [
    { label: "Tuần 1", subLabel: "01-07", minDay: 1, maxDay: 7 },
    { label: "Tuần 2", subLabel: "08-14", minDay: 8, maxDay: 14 },
    { label: "Tuần 3", subLabel: "15-21", minDay: 15, maxDay: 21 },
    { label: "Tuần 4", subLabel: "22-31", minDay: 22, maxDay: 31 },
  ];

  const monthData: BarDataPoint[] = monthBuckets.map((bucket) => {
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

  const latestReviews = store.reviews.slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <Suspense fallback={null}>
        <DeniedQueryHandler />
      </Suspense>

      {/* 1. Header Hero Banner - Matching Image 2 */}
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
        employmentBadge={
          !isVet ? (isPartTime ? "Part-time" : "Full-time") : undefined
        }
        description={
          isVet ? (
            <>
              Tổng quan ca khám & lâm sàng: hôm nay bạn có{" "}
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
              Tổng quan ca chăm sóc & spa: hôm nay bạn có{" "}
              <span className="font-bold text-[#FF7F6B]">
                {todayAppointments.length} ca dịch vụ
              </span>
              ,{" "}
              <span className="font-bold text-[#FF7F6B]">
                {pendingAppointments.length} lịch
              </span>{" "}
              chờ tiếp nhận và{" "}
              <span className="font-bold text-[#FF7F6B]">
                {pendingShifts.length} yêu cầu
              </span>{" "}
              ca trực chờ duyệt.
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
                <span>{isPartTime ? "Đăng ký ca làm thêm" : "Đăng ký lịch"}</span>
              </Link>
              <Link
                href={ROUTES.EXPERT_CLIENTS}
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-all border border-white/20 flex items-center gap-2 cursor-pointer backdrop-blur-sm"
              >
                <Sparkles className="w-4 h-4 text-[#F4B6C2]" />
                <span>Khách & Thú cưng</span>
              </Link>
            </>
          )
        }
      />

      {/* 2. Hàng 1: 4 THẺ KPI HOẠT ĐỘNG */}
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

      {/* 3. Hàng 2: KHỐI HÀNH ĐỘNG CẦN XỬ LÝ NGAY (Chuẩn vị trí & giao diện như Ảnh 2) */}
      <ActionNeededGrid
        isVet={isVet}
        pendingCount={pendingAppointments.length}
        rescheduleCount={rescheduleRequests.length}
        completedNoRecordCount={completedNoRecord.length}
        pendingShiftCount={pendingShifts.length}
        exhaustedRxCount={exhaustedPrescriptions.length}
        revisitDueCount={revisitDueAppointments.length}
      />

      {/* 4. Hàng 3: DÒNG THỜI GIAN CA HÔM NAY (SUB-COMPONENT) */}
      <AppointmentTimeline
        appointments={sortedToday}
        pets={allPets}
        owners={allOwners}
        services={allServices}
        onStart={(id) => startAppointment(id)}
        onViewDetail={(appt) => setActiveAppointment(appt)}
      />

      {/* 5. Hàng 4: BIỂU ĐỒ & NHẬN XÉT (SUB-COMPONENTS) */}
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
          if (!target) {
            router.push(ROUTES.EXPERT_HEALTH_RECORDS_NEW);
            return;
          }
          if (target.medicalRecordId) {
            router.push(`${ROUTES.EXPERT_HEALTH_RECORDS}?petId=${target.petId}`);
            return;
          }
          router.push(
            `${ROUTES.EXPERT_HEALTH_RECORDS_NEW}?appointmentId=${target.id}&petId=${target.petId}`
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
