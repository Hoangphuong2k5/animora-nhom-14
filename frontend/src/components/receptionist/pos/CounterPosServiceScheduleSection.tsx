"use client";

import React, { useMemo, useState } from "react";
import {
  Calendar,
  Check,
  Clock,
  Coffee,
  Search,
  Sparkles,
  Stethoscope,
  UserCog,
  Zap,
} from "lucide-react";
import type { ServiceCategoryId, ServiceEntity } from "@/data/servicesData";
import type { DoctorDirectoryItem } from "@/data/doctorsDirectory";
import {
  estimateServicePrice,
  type TimeSlotAvailability,
} from "@/data/serviceBookingData";
import type { BookingWeightRangeId } from "@/types";

interface CounterPosServiceScheduleSectionProps {
  services: ServiceEntity[];
  selectedServiceIds: string[];
  weightRange: BookingWeightRangeId;
  bookingMode: "walk_in_now" | "scheduled";
  date: string;
  todayIso: string;
  dateValidationError: string | null;
  timeSlots: TimeSlotAvailability[];
  selectedTimeSlot: string;
  eligibleStaff: DoctorDirectoryItem[];
  selectedStaffId: string; // "" = tự gán
  autoAssignedStaff: DoctorDirectoryItem | null;
  onToggleService: (serviceId: string) => void;
  onChangeBookingMode: (mode: "walk_in_now" | "scheduled") => void;
  onChangeDate: (isoDate: string) => void;
  onSelectTimeSlot: (slot: string) => void;
  onSelectStaffId: (staffId: string) => void;
}

const CATEGORY_TABS: { id: ServiceCategoryId; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "vet", label: "Khám & Thú y" },
  { id: "spa", label: "Spa & Chăm sóc" },
  { id: "training", label: "Huấn luyện" },
];

export function CounterPosServiceScheduleSection({
  services,
  selectedServiceIds,
  weightRange,
  bookingMode,
  date,
  todayIso,
  dateValidationError,
  timeSlots,
  selectedTimeSlot,
  eligibleStaff,
  selectedStaffId,
  autoAssignedStaff,
  onToggleService,
  onChangeBookingMode,
  onChangeDate,
  onSelectTimeSlot,
  onSelectStaffId,
}: CounterPosServiceScheduleSectionProps) {
  const [category, setCategory] = useState<ServiceCategoryId>("all");
  const [serviceSearch, setServiceSearch] = useState("");

  const filteredServices = useMemo(() => {
    const q = serviceSearch.trim().toLowerCase();
    return services.filter((s) => {
      if (category !== "all" && s.category !== category) return false;
      if (!q) return true;
      return (
        s.name.vi.toLowerCase().includes(q) ||
        s.categoryLabel.vi.toLowerCase().includes(q)
      );
    });
  }, [services, category, serviceSearch]);

  return (
    <div className="space-y-4">
      {/* KHỐI 3: CHỌN DỊCH VỤ (POS COMPACT GRID) */}
      <section className="p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#6B1F2E] text-white dark:bg-[#FF7F6B] dark:text-zinc-950 text-xs font-extrabold inline-flex items-center justify-center">
              3
            </span>
            <h2 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-foreground">
              Chọn Dịch Vụ ({selectedServiceIds.length} đã chọn)
            </h2>
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              placeholder="Tìm nhanh dịch vụ..."
              className="w-full h-8 pl-8 pr-3 rounded-xl text-xs border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground"
            />
          </div>
        </div>

        {/* Tabs lọc nhóm dịch vụ */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORY_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setCategory(t.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                category === t.id
                  ? "bg-[#6B1F2E] text-white dark:bg-[#FF7F6B] dark:text-zinc-950"
                  : "bg-zinc-100 dark:bg-muted text-zinc-600 dark:text-muted-foreground hover:bg-zinc-200/80"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Lưới dịch vụ POS gọn 2 cột */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredServices.map((srv) => {
            const isSelected = selectedServiceIds.includes(srv.id);
            const price = estimateServicePrice(srv, weightRange);
            const Icon = srv.category === "vet" ? Stethoscope : Sparkles;

            return (
              <button
                key={srv.id}
                type="button"
                onClick={() => onToggleService(srv.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2.5 ${
                  isSelected
                    ? "border-[#6B1F2E] bg-[#6B1F2E]/5 dark:border-[#FF7F6B] dark:bg-[#FF7F6B]/10 ring-1 ring-[#6B1F2E]/30 dark:ring-[#FF7F6B]/30"
                    : "border-zinc-200/80 dark:border-border bg-zinc-50/50 dark:bg-muted/20 hover:border-[#6B1F2E]/40"
                }`}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-[#6B1F2E] dark:text-[#FF7F6B] shrink-0" />
                    <span className="font-bold text-xs text-zinc-900 dark:text-foreground truncate">
                      {srv.name.vi}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-muted text-zinc-700 dark:text-zinc-300 font-semibold">
                      {srv.durationMinutes} phút
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded font-semibold ${
                        srv.dependsOnWeight
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                          : "bg-sky-500/10 text-sky-700 dark:text-sky-300"
                      }`}
                    >
                      {srv.dependsOnWeight ? "Theo hạng cân" : "Giá cố định"}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <span className="text-xs font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B] whitespace-nowrap">
                    {price.toLocaleString("vi-VN")}đ
                  </span>
                  <span
                    className={`w-5 h-5 rounded-md border inline-flex items-center justify-center ${
                      isSelected
                        ? "bg-[#6B1F2E] border-[#6B1F2E] text-white dark:bg-[#FF7F6B] dark:border-[#FF7F6B] dark:text-zinc-950"
                        : "border-zinc-300 dark:border-border bg-white dark:bg-card"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* KHỐI 4: CHẾ ĐỘ, NGÀY GIỜ & NHÂN SỰ */}
      <section className="p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#6B1F2E] text-white dark:bg-[#FF7F6B] dark:text-zinc-950 text-xs font-extrabold inline-flex items-center justify-center">
            4
          </span>
          <h2 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-foreground">
            Chế Độ Tiếp Nhận, Khung Giờ &amp; Nhân Sự
          </h2>
        </div>

        {/* Toggle Làm ngay vs Hẹn giờ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onChangeBookingMode("walk_in_now")}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
              bookingMode === "walk_in_now"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-zinc-50 dark:bg-muted text-zinc-700 dark:text-foreground border-zinc-200 dark:border-border hover:border-emerald-400"
            }`}
          >
            <Zap className="w-4 h-4 shrink-0" />
            <div>
              <div className="text-xs font-extrabold">Làm ngay tại quầy</div>
              <div
                className={`text-[10px] ${
                  bookingMode === "walk_in_now"
                    ? "text-white/85"
                    : "text-zinc-500"
                }`}
              >
                Không cần đặt trước 2h • Trạng thái đầu: Đã đến
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onChangeBookingMode("scheduled")}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
              bookingMode === "scheduled"
                ? "bg-[#6B1F2E] text-white border-[#6B1F2E] shadow-sm"
                : "bg-zinc-50 dark:bg-muted text-zinc-700 dark:text-foreground border-zinc-200 dark:border-border hover:border-[#6B1F2E]/40"
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <div>
              <div className="text-xs font-extrabold">Hẹn giờ trước</div>
              <div
                className={`text-[10px] ${
                  bookingMode === "scheduled"
                    ? "text-white/85"
                    : "text-zinc-500"
                }`}
              >
                Không giữ chỗ 10p • Trạng thái đầu: Đã xác nhận
              </div>
            </div>
          </button>
        </div>

        {/* Chọn ngày + Nhân sự */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#6B1F2E] dark:text-[#FF7F6B]" />
              Ngày thực hiện
            </label>
            <input
              type="date"
              value={date}
              min={todayIso}
              disabled={bookingMode === "walk_in_now"}
              onChange={(e) => onChangeDate(e.target.value)}
              className="w-full h-9 px-3 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted disabled:opacity-65"
            />
            {dateValidationError && (
              <p className="text-[11px] text-rose-600 font-semibold">
                {dateValidationError}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <UserCog className="w-3.5 h-3.5 text-[#6B1F2E] dark:text-[#FF7F6B]" />
              Nhân sự thực hiện
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => onSelectStaffId(e.target.value)}
              disabled={eligibleStaff.length === 0}
              className="w-full h-9 px-3 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted disabled:opacity-60"
            >
              {eligibleStaff.length === 0 ? (
                <option value="">
                  Hết nhân sự rảnh cho khung giờ này (không ghi đè)
                </option>
              ) : (
                <>
                  <option value="">
                    Tự gán rảnh ít ca nhất
                    {autoAssignedStaff ? ` (${autoAssignedStaff.name})` : ""}
                  </option>
                  {eligibleStaff.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} — {st.roleTitleVi}
                    </option>
                  ))}
                </>
              )}
            </select>
            {selectedTimeSlot && eligibleStaff.length === 0 && (
              <p className="text-[11px] text-rose-600 font-semibold">
                Không còn nhân sự rảnh phù hợp tại khung {selectedTimeSlot}. Vui
                lòng chọn khung giờ khác.
              </p>
            )}
          </div>
        </div>

        {/* Lưới khung giờ (Khóa 12:00 Nghỉ trưa) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-700 dark:text-zinc-300">
              Chọn khung giờ (08:00 – 17:00 • Nghỉ trưa cố định 12:00–13:00)
            </span>
          </div>

          {timeSlots.length === 0 ? (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
              Ngày này phòng khám tạm đóng cửa / khử khuẩn định kỳ. Vui lòng chọn
              ngày khác.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {timeSlots
                .filter((s) => {
                  const hr = parseInt(s.time.split(":")[0], 10);
                  return hr >= 8 && hr <= 17;
                })
                .map((slot) => {
                  const isLunch = slot.time === "12:00";
                  const isSelected = selectedTimeSlot === slot.time && !slot.disabled;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={slot.disabled}
                      title={slot.reasonVi}
                      onClick={() => onSelectTimeSlot(slot.time)}
                      className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                        isLunch
                          ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400 cursor-not-allowed opacity-85"
                          : slot.disabled
                          ? "bg-zinc-100 dark:bg-muted/40 border-zinc-200/70 dark:border-border text-zinc-400 cursor-not-allowed line-through"
                          : isSelected
                          ? "bg-[#6B1F2E] text-white border-[#6B1F2E] dark:bg-[#FF7F6B] dark:text-zinc-950 dark:border-[#FF7F6B] shadow-sm cursor-pointer"
                          : "bg-white dark:bg-card border-zinc-200 dark:border-border text-zinc-800 dark:text-foreground hover:border-[#6B1F2E]/50 cursor-pointer"
                      }`}
                    >
                      <span>{slot.time}</span>
                      {isLunch ? (
                        <span className="text-[9px] font-extrabold inline-flex items-center gap-0.5">
                          <Coffee className="w-2.5 h-2.5" /> Nghỉ trưa
                        </span>
                      ) : slot.disabled ? (
                        <span className="text-[9px] font-semibold no-underline">
                          {slot.reasonVi || (slot.isFull ? "Hết chỗ" : "Đã qua")}
                        </span>
                      ) : (
                        <span
                          className={`text-[9px] ${
                            isSelected ? "opacity-85" : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          Còn {Math.max(0, slot.capacity - slot.bookedCount)} chỗ
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

