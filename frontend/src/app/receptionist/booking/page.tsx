"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarPlus,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
} from "lucide-react";
import { CounterPosCustomerPetSection } from "@/components/receptionist/pos/CounterPosCustomerPetSection";
import { CounterPosServiceScheduleSection } from "@/components/receptionist/pos/CounterPosServiceScheduleSection";
import { CounterPosSummaryTicket } from "@/components/receptionist/pos/CounterPosSummaryTicket";
import { ROUTES } from "@/constants/config.constant";
import { useCounterPosBooking } from "@/hooks/receptionist/useCounterPosBooking";

export default function ReceptionistBookingHelpPage() {
  const router = useRouter();
  const pos = useCounterPosBooking();

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Compact POS Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2">
            <CalendarPlus className="w-6 h-6 text-[#6B1F2E] dark:text-[#FF7F6B]" />
            <span>Đặt Lịch Nhanh Tại Quầy (POS)</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Thao tác 1 màn hình: Tra cứu SĐT → Chọn bé → Chọn dịch vụ → Làm ngay
            hoặc Hẹn giờ. Dùng chung bảng giá &amp; lịch nhân sự với kênh Online.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={ROUTES.RECEPTIONIST}
            className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card text-xs font-bold text-zinc-700 dark:text-foreground hover:bg-zinc-50 inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Quầy Tiếp Nhận
          </Link>
          <Link
            href="/dat-lich"
            className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card text-xs font-bold text-[#6B1F2E] dark:text-[#FF7F6B] hover:bg-zinc-50 inline-flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Trang đặt lịch KH
          </Link>
        </div>
      </div>

      {/* Quick Success Banner after creating an order */}
      {pos.lastCreatedBooking && (
        <div className="p-4 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5 text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-extrabold text-sm">
                Đã tạo thành công lịch hẹn {pos.lastCreatedBooking.code} (
                {pos.lastCreatedBooking.status})
                {pos.lastCreatedBooking.invoiceCode
                  ? ` • Hóa đơn ${pos.lastCreatedBooking.invoiceCode}`
                  : ""}
              </div>
              <div className="opacity-85 mt-0.5">
                Khách: <strong>{pos.lastCreatedBooking.fullName}</strong> • Bé:{" "}
                <strong>{pos.lastCreatedBooking.petName}</strong> • Dịch vụ:{" "}
                <strong>{pos.lastCreatedBooking.service}</strong> •{" "}
                <strong>
                  {(pos.lastCreatedBooking.price || 0).toLocaleString("vi-VN")}đ
                </strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => pos.setLastCreatedBooking(null)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-card border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Tạo đơn mới
            </button>
            <button
              type="button"
              onClick={() => router.push(ROUTES.RECEPTIONIST)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
            >
              Về Quầy Tiếp Nhận
            </button>
          </div>
        </div>
      )}

      {/* Main 2-Column POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8 space-y-4">
          <CounterPosCustomerPetSection
            customers={pos.customers}
            selectedCustomer={pos.selectedCustomer}
            customerPets={pos.customerPets}
            selectedPetId={pos.selectedPetId}
            violationAssessment={pos.violationAssessment}
            phoneSearch={pos.phoneSearch}
            newCustomerName={pos.newCustomerName}
            showQuickPetForm={pos.showQuickPetForm}
            quickPetName={pos.quickPetName}
            quickPetSpecies={pos.quickPetSpecies}
            quickPetWeight={pos.quickPetWeight}
            quickPetAllergies={pos.quickPetAllergies}
            onChangePhoneSearch={pos.setPhoneSearch}
            onChangeNewCustomerName={pos.setNewCustomerName}
            onLookupPhone={pos.handleLookupPhone}
            onCreateWalkInCustomer={pos.handleCreateWalkInCustomer}
            onSelectCustomer={(c) => {
              pos.setSelectedCustomer(c);
              pos.setPhoneSearch(c.phone);
            }}
            onSelectPetId={pos.setSelectedPetId}
            onToggleQuickPetForm={() =>
              pos.setShowQuickPetForm((prev) => !prev)
            }
            onChangeQuickPetName={pos.setQuickPetName}
            onChangeQuickPetSpecies={pos.setQuickPetSpecies}
            onChangeQuickPetWeight={pos.setQuickPetWeight}
            onChangeQuickPetAllergies={pos.setQuickPetAllergies}
            onCreateQuickPet={pos.handleCreateQuickPet}
          />

          <CounterPosServiceScheduleSection
            services={pos.services}
            selectedServiceIds={pos.selectedServiceIds}
            weightRange={pos.weightRange}
            bookingMode={pos.bookingMode}
            date={pos.date}
            todayIso={pos.todayIso}
            dateValidationError={pos.dateValidationError}
            timeSlots={pos.timeSlots}
            selectedTimeSlot={pos.selectedTimeSlot}
            eligibleStaff={pos.availableStaffForSlot}
            selectedStaffId={pos.selectedStaffId}
            autoAssignedStaff={pos.autoAssignedStaff}
            onToggleService={pos.handleToggleService}
            onChangeBookingMode={pos.setBookingMode}
            onChangeDate={pos.setDate}
            onSelectTimeSlot={pos.setSelectedTimeSlot}
            onSelectStaffId={pos.setSelectedStaffId}
          />
        </div>

        <div className="lg:col-span-4">
          <CounterPosSummaryTicket
            selectedCustomer={pos.selectedCustomer}
            selectedPet={pos.selectedPet}
            weightRange={pos.weightRange}
            selectedServices={pos.selectedServices}
            totalDurationMinutes={pos.totalDurationMinutes}
            totalPrice={pos.totalPrice}
            bookingMode={pos.bookingMode}
            date={pos.date}
            timeSlot={pos.selectedTimeSlot}
            assignedStaff={pos.resolvedStaff}
            isAutoAssigned={!pos.selectedStaffId}
            violationAssessment={pos.violationAssessment}
            paymentOption={pos.paymentOption}
            note={pos.note}
            canSubmit={pos.canSubmit}
            onChangePaymentOption={pos.setPaymentOption}
            onChangeNote={pos.setNote}
            onSubmit={pos.handleSubmitCounterBooking}
          />
        </div>
      </div>
    </div>
  );
}
