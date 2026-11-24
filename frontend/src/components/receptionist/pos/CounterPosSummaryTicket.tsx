"use client";

import React from "react";
import {
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  Lock,
  PawPrint,
  Receipt,
  UserCheck,
  Zap,
} from "lucide-react";
import type { ServiceEntity } from "@/data/servicesData";
import type { DoctorDirectoryItem } from "@/data/doctorsDirectory";
import type {
  CustomerViolationAssessment,
  WalkInCustomerRecord,
  WalkInPetRecord,
} from "@/data/receptionistOpsData";
import {
  calculateServiceEndTime,
  estimateServicePrice,
  getWeightRangeLabel,
} from "@/data/serviceBookingData";
import { formatDateDdMmYyyy } from "@/utils/dateFormat";
import type { BookingWeightRangeId } from "@/types";

export type CounterPaymentOption =
  | "postpaid_cash"
  | "prepaid_cash"
  | "prepaid_bank";

interface CounterPosSummaryTicketProps {
  selectedCustomer: WalkInCustomerRecord | null;
  selectedPet: WalkInPetRecord | null;
  weightRange: BookingWeightRangeId;
  selectedServices: ServiceEntity[];
  totalDurationMinutes: number;
  totalPrice: number;
  bookingMode: "walk_in_now" | "scheduled";
  date: string;
  timeSlot: string;
  assignedStaff: DoctorDirectoryItem | null;
  isAutoAssigned: boolean;
  violationAssessment: CustomerViolationAssessment | null;
  paymentOption: CounterPaymentOption;
  note: string;
  canSubmit: boolean;
  onChangePaymentOption: (opt: CounterPaymentOption) => void;
  onChangeNote: (val: string) => void;
  onSubmit: () => void;
}

export function CounterPosSummaryTicket({
  selectedCustomer,
  selectedPet,
  weightRange,
  selectedServices,
  totalDurationMinutes,
  totalPrice,
  bookingMode,
  date,
  timeSlot,
  assignedStaff,
  isAutoAssigned,
  violationAssessment,
  paymentOption,
  note,
  canSubmit,
  onChangePaymentOption,
  onChangeNote,
  onSubmit,
}: CounterPosSummaryTicketProps) {
  const isPostpaidLocked = Boolean(violationAssessment?.isPostpaidLocked);
  const endTime = timeSlot
    ? calculateServiceEndTime(timeSlot, totalDurationMinutes || 45)
    : "";

  return (
    <aside className="rounded-2xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden sticky top-20">
      {/* Ticket Header */}
      <div className="bg-linear-to-r from-[#6B1F2E] to-[#8C2B3E] px-5 py-4 text-white">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#FFD166]" />
            <span className="text-xs font-extrabold uppercase tracking-wider">
              Phiếu Đặt Tại Quầy
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              bookingMode === "walk_in_now"
                ? "bg-emerald-400 text-emerald-950"
                : "bg-white/20 text-white"
            }`}
          >
            {bookingMode === "walk_in_now"
              ? "Làm ngay • Đã đến"
              : "Hẹn giờ • Đã xác nhận"}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4 text-xs">
        {/* Customer & Pet Summary */}
        <div className="space-y-2 pb-3 border-b border-dashed border-zinc-200 dark:border-border">
          <div className="flex items-center justify-between gap-2">
            <span className="text-zinc-500 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" /> Khách hàng
            </span>
            <span className="font-bold text-zinc-900 dark:text-foreground text-right">
              {selectedCustomer
                ? `${selectedCustomer.fullName} (${selectedCustomer.phone})`
                : "Chưa chọn khách"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-zinc-500 flex items-center gap-1.5">
              <PawPrint className="w-3.5 h-3.5" /> Thú cưng
            </span>
            <span className="font-bold text-zinc-900 dark:text-foreground text-right">
              {selectedPet
                ? `${selectedPet.name} • ${selectedPet.species} (${getWeightRangeLabel(weightRange, "vi")})`
                : "Chưa chọn bé"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-zinc-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Thời gian
            </span>
            <span className="font-bold text-zinc-900 dark:text-foreground text-right">
              {date ? formatDateDdMmYyyy(date) : "—"}
              {timeSlot ? ` • ${timeSlot}–${endTime}` : " • Chưa chọn giờ"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-zinc-500">Nhân sự</span>
            <span className="font-bold text-zinc-900 dark:text-foreground text-right">
              {assignedStaff
                ? `${assignedStaff.name}${isAutoAssigned ? " (Tự gán)" : ""}`
                : "Hệ thống tự gán"}
            </span>
          </div>
        </div>

        {/* Selected Services List */}
        <div className="space-y-2 pb-3 border-b border-dashed border-zinc-200 dark:border-border">
          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500 uppercase">
            <span>Dịch vụ ({selectedServices.length})</span>
            <span>{totalDurationMinutes} phút</span>
          </div>

          {selectedServices.length === 0 ? (
            <p className="text-zinc-400 italic">
              Chọn ít nhất 1 dịch vụ ở cột bên trái.
            </p>
          ) : (
            <div className="space-y-1.5">
              {selectedServices.map((srv) => {
                const p = estimateServicePrice(srv, weightRange);
                return (
                  <div
                    key={srv.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="text-zinc-700 dark:text-zinc-300 truncate">
                      • {srv.name.vi}
                    </span>
                    <span className="font-bold text-zinc-900 dark:text-foreground shrink-0">
                      {p.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2 flex items-center justify-between text-sm font-extrabold">
            <span className="text-zinc-900 dark:text-foreground">
              Tổng tạm tính
            </span>
            <span className="text-lg text-[#6B1F2E] dark:text-[#FF7F6B]">
              {totalPrice.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>

        {/* Counter Payment Options */}
        <div className="space-y-2">
          <div className="font-bold text-zinc-700 dark:text-zinc-300">
            Thanh toán tại quầy
          </div>

          <div className="space-y-1.5">
            <button
              type="button"
              disabled={isPostpaidLocked}
              onClick={() => onChangePaymentOption("postpaid_cash")}
              className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                isPostpaidLocked
                  ? "bg-zinc-100 dark:bg-muted/40 border-zinc-200 dark:border-border text-zinc-400 cursor-not-allowed"
                  : paymentOption === "postpaid_cash"
                  ? "border-[#6B1F2E] bg-[#6B1F2E]/5 dark:border-[#FF7F6B] dark:bg-[#FF7F6B]/10 font-bold cursor-pointer"
                  : "border-zinc-200 dark:border-border hover:border-[#6B1F2E]/40 cursor-pointer"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {isPostpaidLocked ? (
                  <Lock className="w-3.5 h-3.5 text-rose-500" />
                ) : (
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>Trả sau tại quầy (Thu sau khi làm)</span>
              </span>
              {isPostpaidLocked && (
                <span className="text-[10px] font-bold text-rose-600">
                  Bị khóa
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onChangePaymentOption("prepaid_cash")}
              className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                paymentOption === "prepaid_cash"
                  ? "border-[#6B1F2E] bg-[#6B1F2E]/5 dark:border-[#FF7F6B] dark:bg-[#FF7F6B]/10 font-bold"
                  : "border-zinc-200 dark:border-border hover:border-[#6B1F2E]/40"
              }`}
            >
              <Banknote className="w-3.5 h-3.5 text-[#6B1F2E] dark:text-[#FF7F6B]" />
              <span>Trả trước — Tiền mặt nộp tại quầy</span>
            </button>

            <button
              type="button"
              onClick={() => onChangePaymentOption("prepaid_bank")}
              className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                paymentOption === "prepaid_bank"
                  ? "border-[#6B1F2E] bg-[#6B1F2E]/5 dark:border-[#FF7F6B] dark:bg-[#FF7F6B]/10 font-bold"
                  : "border-zinc-200 dark:border-border hover:border-[#6B1F2E]/40"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-sky-600" />
              <span>Trả trước — Chuyển khoản / QR</span>
            </button>
          </div>
        </div>

        {/* Ghi chú nhanh */}
        <div className="space-y-1">
          <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
            Ghi chú tại quầy (tùy chọn)
          </label>
          <textarea
            value={note}
            onChange={(e) => onChangeNote(e.target.value)}
            rows={2}
            placeholder="Ví dụ: Bé hơi nhát máy sấy, khách đợi lấy liền..."
            className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-xs resize-none"
          />
        </div>

        {/* 1-Click Submit Button */}
        <button
          type="button"
          disabled={!canSubmit}
          onClick={onSubmit}
          className={`w-full h-11 rounded-xl text-white font-extrabold text-sm inline-flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
            bookingMode === "walk_in_now"
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-[#6B1F2E] hover:bg-[#581825]"
          }`}
        >
          {bookingMode === "walk_in_now" ? (
            <>
              <Zap className="w-4 h-4" />
              Tạo Lịch &amp; Check-in Ngay
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Xác Nhận Hẹn Giờ Tại Quầy
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

