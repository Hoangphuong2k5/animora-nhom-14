"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useExpert } from "@/components/expert/ExpertProvider";
import { DataTable, ColumnDef } from "@/components/expert/DataTable";
import { AppointmentDrawer } from "@/components/expert/AppointmentDrawer";
import { AppointmentTabs } from "@/components/expert/appointments/AppointmentTabs";
import { AppointmentFilterBar } from "@/components/expert/appointments/AppointmentFilterBar";
import { useAppointmentFilters } from "@/hooks/expert/useAppointmentFilters";
import { ExpertAppointment } from "@/types/expert.type";
import { ROUTES } from "@/constants/config.constant";

function AppointmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryCode = searchParams.get("code");

  const { store, allPets, allOwners, allServices, startAppointment } = useExpert();

  const {
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
  } = useAppointmentFilters(store.appointments, queryCode);

  const columns: ColumnDef<ExpertAppointment>[] = [
    {
      key: "code",
      header: "Mã lịch",
      sortable: true,
      sortValue: (a) => a.code,
      render: (a) => (
        <div>
          <span className="font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
            {a.code}
          </span>
          {a.cancelRequest?.status === "pending_admin" && (
            <div className="mt-0.5">
              <span className="inline-block px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/60">
                Chờ Quản lý điều phối
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "client",
      header: "Khách hàng",
      sortable: true,
      sortValue: (a) => {
        const o = allOwners.find((ow) => ow.id === a.ownerId);
        return o?.fullName || "";
      },
      render: (a) => {
        const o = allOwners.find((ow) => ow.id === a.ownerId);
        return (
          <div>
            <div className="font-bold text-zinc-900 dark:text-foreground">
              {o?.fullName || "Chưa rõ"}
            </div>
            <div className="text-[11px] text-zinc-400">{o?.phone}</div>
          </div>
        );
      },
    },
    {
      key: "pet",
      header: "Thú cưng",
      sortable: true,
      sortValue: (a) => {
        const p = allPets.find((pet) => pet.id === a.petId);
        return p?.name || "";
      },
      render: (a) => {
        const p = allPets.find((pet) => pet.id === a.petId);
        return (
          <div className="flex items-center gap-2">
            <img
              src={p?.photo}
              alt={p?.name}
              className="w-8 h-8 rounded-lg object-cover shrink-0 border border-zinc-200 dark:border-border"
            />
            <div>
              <div className="font-bold text-zinc-900 dark:text-foreground">
                {p?.name}
              </div>
              <div className="text-[11px] text-zinc-400">
                {p?.breed} ({p?.weightKg}kg)
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "service",
      header: "Dịch vụ",
      render: (a) => {
        const s = allServices.find((srv) => srv.id === a.serviceId);
        return (
          <div className="max-w-[180px] truncate">
            <div className="font-bold text-zinc-900 dark:text-foreground truncate">
              {s?.name.vi}
            </div>
            <div className="text-[11px] text-[#6B1F2E] dark:text-[#FF7F6B] font-semibold">
              {s?.price.toLocaleString("vi-VN")}đ
            </div>
          </div>
        );
      },
    },
    {
      key: "time",
      header: "Giờ hẹn",
      sortable: true,
      sortValue: (a) => a.startAt,
      render: (a) => (
        <div>
          <div className="font-bold text-zinc-900 dark:text-foreground">
            {a.startAt.split("T")[1]?.slice(0, 5)}
          </div>
          <div className="text-[11px] text-zinc-400">
            {a.startAt.split("T")[0]}
          </div>
        </div>
      ),
    },
    {
      key: "payment",
      header: "Thanh toán",
      render: (a) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
            a.paymentState === "paid"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
              : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
          }`}
        >
          {a.paymentTiming === "prepaid" ? "Trả trước" : "Trả sau"} (
          {a.paymentState === "paid" ? "Đã trả" : "Chờ thu"})
        </span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (a) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {a.status === "upcoming" ? (
            <button
              type="button"
              onClick={() => startAppointment(a.id)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] transition-colors cursor-pointer"
            >
              Bắt đầu ca
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSelectedAppt(a)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold border border-zinc-200 dark:border-border hover:bg-zinc-100 dark:hover:bg-muted transition-colors cursor-pointer"
            >
              Chi tiết
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold font-heading text-zinc-900 dark:text-foreground">
          Quản Lý Lịch Hẹn & Dịch Vụ
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Theo dõi, tiếp nhận và hoàn tất các ca phục vụ của khách hàng dành riêng cho bạn.
        </p>
      </div>

      {/* Tabs */}
      <AppointmentTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabCounts={tabCounts}
      />

      {/* Main Table with Filters */}
      <DataTable
        data={filteredAppointments}
        columns={columns}
        keyExtractor={(a) => a.id}
        searchPlaceholder="Tìm theo mã lịch, tên khách hoặc ghi chú..."
        searchFilter={(a, q) => {
          const o = allOwners.find((ow) => ow.id === a.ownerId);
          const p = allPets.find((pet) => pet.id === a.petId);
          return (
            a.code.toLowerCase().includes(q) ||
            (o?.fullName || "").toLowerCase().includes(q) ||
            (p?.name || "").toLowerCase().includes(q) ||
            (a.customerNote || "").toLowerCase().includes(q)
          );
        }}
        onRowClick={(a) => setSelectedAppt(a)}
        extraFilters={
          <AppointmentFilterBar
            filterDateRange={filterDateRange}
            onDateRangeChange={setFilterDateRange}
            filterService={filterService}
            onServiceChange={setFilterService}
            filterPayment={filterPayment}
            onPaymentChange={setFilterPayment}
            services={allServices}
          />
        }
      />

      {/* Appointment Drawer */}
      <AppointmentDrawer
        appointment={selectedAppt}
        onClose={() => setSelectedAppt(null)}
        onOpenMedicalModal={(appt) => {
          const target = appt || selectedAppt;
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
          const target = appt || selectedAppt;
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

export default function ExpertAppointmentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-400">Đang tải lịch hẹn...</div>}>
      <AppointmentsContent />
    </Suspense>
  );
}
