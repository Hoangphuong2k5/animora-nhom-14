"use client";

import React from "react";
import {
  AlertTriangle,
  CreditCard,
  Info,
  Phone,
  Send,
  ShieldAlert,
  Stethoscope,
  UserCheck,
} from "lucide-react";
import {
  ExpertAppointment,
  ExpertPet,
  ExpertPetOwner,
  ExpertServiceDef,
  MedicalRecord,
} from "@/types/expert.type";

export interface CancellationFeeSummary {
  feeVnd: number;
  feePercentage: number;
  isUnder3Hours: boolean;
}

interface AppointmentOverviewAndPetSectionProps {
  currentAppt: ExpertAppointment;
  pet?: ExpertPet;
  owner?: ExpertPetOwner;
  service?: ExpertServiceDef;
  isVet: boolean;
  isPaid: boolean;
  isCancelled: boolean;
  hasPendingCancelRequest: boolean;
  cancelFee: CancellationFeeSummary;
  latestVetRecord?: MedicalRecord;
  onAcceptReschedule: (apptId: string) => void;
}

export function AppointmentOverviewAndPetSection({
  currentAppt,
  pet,
  owner,
  service,
  isVet,
  isPaid,
  isCancelled,
  hasPendingCancelRequest,
  cancelFee,
  latestVetRecord,
  onAcceptReschedule,
}: AppointmentOverviewAndPetSectionProps) {
  return (
    <>
      {/* 1. Pending Admin Reassignment / Cancellation Banner */}
      {hasPendingCancelRequest && currentAppt.cancelRequest && (
        <div className="p-3.5 rounded-2xl border border-amber-300 dark:border-amber-800/70 bg-amber-50/90 dark:bg-amber-950/30 space-y-1.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-extrabold text-amber-900 dark:text-amber-200">
              <Send className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Đang chờ Admin điều phối / duyệt hủy ca</span>
            </div>
            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">
              {currentAppt.cancelRequest.requestedAt
                .replace("T", " ")
                .slice(0, 16)}
            </span>
          </div>
          <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-snug">
            Lý do đã gửi:{" "}
            <strong className="italic">
              &ldquo;{currentAppt.cancelRequest.reason}&rdquo;
            </strong>
          </p>
          <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80">
            * Lịch hẹn của khách hàng vẫn được giữ nguyên trên hệ thống cho đến
            khi Admin phân công nhân sự thay thế hoặc duyệt hủy chính thức.
          </p>
        </div>
      )}

      {/* 2. Reschedule Request Notice (Only when customer requested reschedule) */}
      {currentAppt.rescheduleRequest && (
        <div className="p-3.5 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/90 dark:bg-amber-950/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Khách yêu cầu dời lịch hẹn</span>
          </div>
          <div className="text-xs text-amber-900 dark:text-amber-200">
            Khách đề xuất chuyển sang:{" "}
            <strong className="underline">
              {currentAppt.rescheduleRequest.requestedStartAt.replace("T", " ")}
            </strong>
          </div>
          <div className="text-[11px] text-amber-700 dark:text-amber-400 italic">
            &ldquo;{currentAppt.rescheduleRequest.reason}&rdquo;
          </div>
          <button
            type="button"
            onClick={() => onAcceptReschedule(currentAppt.id)}
            className="mt-1 w-full py-1.5 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition-colors cursor-pointer"
          >
            Đồng ý đổi sang giờ này
          </button>
        </div>
      )}

      {/* 3. Cancelled Appointment Banner (ONLY shown when status === 'cancelled') */}
      {isCancelled && (
        <div className="p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/80 dark:bg-rose-950/20 space-y-1.5 text-xs text-rose-900 dark:text-rose-200">
          <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              Ca hẹn đã hủy (
              {currentAppt.cancelledBy === "customer"
                ? "Khách hàng hủy"
                : "Quản lý đã duyệt hủy"}
              )
            </span>
          </div>
          {currentAppt.cancelReason && (
            <p className="text-[11px] font-medium text-rose-800 dark:text-rose-300">
              Lý do hủy: &ldquo;{currentAppt.cancelReason}&rdquo;
            </p>
          )}
          {cancelFee.feeVnd > 0 && (
            <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80">
              Phí áp dụng:{" "}
              <strong>{cancelFee.feeVnd.toLocaleString("vi-VN")}đ</strong>
            </p>
          )}
        </div>
      )}

      {/* 4. Unified Patient & Clinical Intake Card */}
      {pet && (
        <div className="p-3.5 rounded-2xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/60 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
              {isVet
                ? "Hồ sơ Bệnh nhân & Tiếp nhận"
                : "Hồ sơ Thú cưng & Tiếp nhận"}
            </span>
            <a
              href={`/expert/health-records?petId=${pet.id}`}
              className="text-xs font-bold text-[#6B1F2E] dark:text-[#FF7F6B] hover:underline flex items-center gap-1"
            >
              <span>Xem sổ sức khỏe</span>
              <span>→</span>
            </a>
          </div>

          {/* Pet Avatar + Core Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-zinc-200 dark:border-border shrink-0">
              <img
                src={pet.photo}
                alt={pet.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-heading font-extrabold text-base text-zinc-900 dark:text-foreground flex items-center gap-1.5 flex-wrap">
                <span>{pet.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-muted text-zinc-600 dark:text-foreground/80">
                  {pet.gender === "male" ? "Đực" : "Cái"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FBE3E3]/80 dark:bg-[#FF7F6B]/15 text-[#6B1F2E] dark:text-[#FF7F6B]">
                  {pet.weightKg} kg
                </span>
              </div>
              <div className="text-xs text-zinc-500 font-medium truncate mt-0.5">
                {pet.breed}
              </div>
            </div>
          </div>

          {/* Critical Medical Allergy Alert (High-contrast Red Badge) */}
          {pet.allergies && (
            <div className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>Cảnh báo dị ứng: {pet.allergies}</span>
            </div>
          )}

          {/* Clinical Collaboration: Doctor's Clinical Note for Care Staff */}
          {!isVet && latestVetRecord && (
            <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                <Stethoscope className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Lưu ý Y khoa từ Bác sĩ Thú y</span>
              </div>
              <div className="text-[11px] text-zinc-700 dark:text-foreground/90 space-y-1">
                <div>
                  <strong>Chẩn đoán:</strong> {latestVetRecord.diagnosis}
                </div>
                {latestVetRecord.note && (
                  <div>
                    <strong>Lưu ý chăm sóc:</strong> {latestVetRecord.note}
                  </div>
                )}
                {latestVetRecord.symptoms && (
                  <div>
                    <strong>Triệu chứng ghi nhận:</strong>{" "}
                    {latestVetRecord.symptoms}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chief Complaint / Booking Symptoms (Placed right inside intake card) */}
          {currentAppt.customerNote && (
            <div className="p-2.5 rounded-xl bg-[#FFF4E8]/90 dark:bg-[#4D1B2A]/45 border-l-3 border-[#FF7F6B] text-xs space-y-0.5">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B1F2E] dark:text-[#FF7F6B]">
                {isVet
                  ? "Triệu chứng / Yêu cầu lúc đặt lịch"
                  : "Yêu cầu & Lưu ý lúc đặt lịch"}
              </div>
              <p className="text-zinc-800 dark:text-foreground/90 font-medium leading-snug">
                {currentAppt.customerNote}
              </p>
            </div>
          )}

          {/* Owner Behavioral Note */}
          {pet.ownerNote && (
            <div className="px-2.5 py-2 rounded-xl bg-zinc-50 dark:bg-muted/70 text-[11px] text-zinc-600 dark:text-foreground/80 leading-snug">
              <strong className="text-zinc-800 dark:text-foreground">
                Lưu ý tính cách:
              </strong>{" "}
              {pet.ownerNote}
            </div>
          )}
        </div>
      )}

      {/* 5. Owner & Service + Payment Status (2 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        {owner && (
          <div className="p-3 rounded-2xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/60 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <UserCheck className="w-3 h-3" />
              <span>Khách hàng</span>
            </span>
            <div className="font-bold text-zinc-900 dark:text-foreground truncate">
              {owner.fullName}
            </div>
            <div className="text-zinc-500 flex items-center gap-1 text-[11px]">
              <Phone className="w-3 h-3 text-zinc-400" />
              <span>{owner.phone}</span>
            </div>
          </div>
        )}

        {service && (
          <div className="p-3 rounded-2xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/60 space-y-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Dịch vụ ({service.durationMin}p)
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase flex items-center gap-0.5 ${
                  isPaid
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                }`}
              >
                <CreditCard className="w-2.5 h-2.5" />
                {isPaid ? "Đã trả" : "Chờ thu"}
              </span>
            </div>
            <div
              className="font-bold text-zinc-900 dark:text-foreground truncate"
              title={service.name.vi}
            >
              {service.name.vi}
            </div>
            <div className="text-[#6B1F2E] dark:text-[#FF7F6B] font-extrabold">
              {service.price.toLocaleString("vi-VN")}đ
            </div>
          </div>
        )}
      </div>
    </>
  );
}

interface AppointmentTimelineAndPolicySectionProps {
  currentAppt: ExpertAppointment;
  isPending: boolean;
  isUpcoming: boolean;
  cancelFee: CancellationFeeSummary;
}

export function AppointmentTimelineAndPolicySection({
  currentAppt,
  isPending,
  isUpcoming,
  cancelFee,
}: AppointmentTimelineAndPolicySectionProps) {
  return (
    <>
      {/* 7. Compact Appointment Timeline History */}
      <div className="pt-1 space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          Lịch sử tiến trình ({currentAppt.history.length} mốc)
        </span>
        <div className="space-y-1.5 border-l-2 border-zinc-200 dark:border-border pl-3 text-xs">
          {currentAppt.history.map((h, i) => (
            <div
              key={i}
              className="relative flex items-baseline justify-between gap-2"
            >
              <span className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-[#6B1F2E] dark:bg-[#FF7F6B]" />
              <span className="font-semibold text-zinc-800 dark:text-foreground/90 text-[11px] leading-snug">
                {h.note.vi}
              </span>
              <span className="text-[10px] text-zinc-400 shrink-0">
                {h.at.replace("T", " ").slice(0, 16)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Subtle Schedule Note ONLY when Pending or Upcoming (Never during in_progress/completed) */}
      {(isPending || isUpcoming) && cancelFee.isUnder3Hours && (
        <div className="px-3 py-2 rounded-xl border border-amber-200/70 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Lưu ý lịch hẹn sát giờ: Ca hẹn diễn ra trong vòng dưới 3 giờ tới. Nếu
            cần thay đổi người thực hiện, vui lòng gửi yêu cầu tới Quản lý nghiệp vụ để điều phối.
          </span>
        </div>
      )}
    </>
  );
}
