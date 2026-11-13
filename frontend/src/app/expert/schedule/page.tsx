"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useExpert } from "@/components/expert/ExpertProvider";
import { AppointmentDrawer } from "@/components/expert/AppointmentDrawer";
import { ScheduleWeekView } from "@/components/expert/schedule/ScheduleWeekView";
import { ShiftRequestModal } from "@/components/expert/schedule/ShiftRequestModal";
import { ShiftRequestHistoryCard } from "@/components/expert/schedule/ShiftRequestHistoryCard";
import { useScheduleWeek } from "@/hooks/expert/useScheduleWeek";
import { ExpertAppointment, ShiftCode } from "@/types/expert.type";

export default function ExpertSchedulePage() {
  const { store, allPets, allServices, submitShiftRequest } = useExpert();

  const {
    currentWeekOffset,
    setCurrentWeekOffset,
    weekDays,
    conflictsByDate,
    todayIso,
  } = useScheduleWeek(store.appointments);

  // Modal Đăng ký ca / Xin nghỉ
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Selected appointment for drawer
  const [selectedAppt, setSelectedAppt] = useState<ExpertAppointment | null>(null);

  const handleSendRequest = (data: {
    kind: "shift" | "leave";
    date: string;
    shift?: ShiftCode;
    reason: string;
  }) => {
    submitShiftRequest(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-zinc-900 dark:text-foreground">
            Lịch Làm Việc & Xếp Ca
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Lịch tuần cá nhân, phát hiện trùng ca và gửi yêu cầu đăng ký ca hoặc xin nghỉ tới Admin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Week offset navigation */}
          <div className="flex items-center rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card p-1">
            <button
              type="button"
              onClick={() => setCurrentWeekOffset((p) => p - 1)}
              className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-muted cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-zinc-600 dark:text-foreground/80" />
            </button>
            <span className="px-3 text-xs font-bold text-zinc-800 dark:text-foreground/90">
              {currentWeekOffset === 0
                ? "Tuần này"
                : currentWeekOffset > 0
                ? `+${currentWeekOffset} tuần`
                : `${currentWeekOffset} tuần`}
            </span>
            <button
              type="button"
              onClick={() => setCurrentWeekOffset((p) => p + 1)}
              className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-muted cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-zinc-600 dark:text-foreground/80" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowRequestModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] transition-colors cursor-pointer shadow-sm shadow-[#6B1F2E]/20"
          >
            <Plus className="w-3.5 h-3.5 text-[#FF7F6B]" />
            <span>Đăng ký ca / Xin nghỉ</span>
          </button>
        </div>
      </div>

      {/* Week Calendar Grid (Sub-Component) */}
      <ScheduleWeekView
        weekDays={weekDays}
        appointments={store.appointments}
        shifts={store.shifts}
        shiftRequests={store.shiftRequests}
        pets={allPets}
        services={allServices}
        conflictsByDate={conflictsByDate}
        onSelectAppt={setSelectedAppt}
      />

      {/* Danh sách yêu cầu đã gửi gần đây (Sub-Component) */}
      <ShiftRequestHistoryCard requests={store.shiftRequests} />

      {/* Modal Đăng Ký Ca / Xin Nghỉ (Sub-Component) */}
      <ShiftRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={handleSendRequest}
        initialDate={todayIso}
      />

      {/* Appointment Drawer */}
      <AppointmentDrawer
        appointment={selectedAppt}
        onClose={() => setSelectedAppt(null)}
      />
    </div>
  );
}
