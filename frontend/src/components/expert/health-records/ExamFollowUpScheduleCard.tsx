"use client";

import React from "react";
import { CalendarClock, ShieldPlus, Syringe } from "lucide-react";

interface ExamFollowUpScheduleCardProps {
  revisitDate: string;
  onChangeRevisitDate: (d: string) => void;
  nextVaccineDate: string;
  onChangeNextVaccineDate: (d: string) => void;
  nextDewormDate: string;
  onChangeNextDewormDate: (d: string) => void;
}

function computeFutureDateString(daysToAdd: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysToAdd);
  return d.toISOString().slice(0, 10);
}

export function ExamFollowUpScheduleCard({
  revisitDate,
  onChangeRevisitDate,
  nextVaccineDate,
  onChangeNextVaccineDate,
  nextDewormDate,
  onChangeNextDewormDate,
}: ExamFollowUpScheduleCardProps) {
  return (
    <div className="p-5 rounded-3xl border border-[#EBCFC6]/90 dark:border-[#6E2E40] bg-white dark:bg-card/90 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-[#EBCFC6]/50 dark:border-[#6E2E40]/60">
        <span className="px-2.5 py-1 rounded-[10px] border border-[#EBCFC6] dark:border-[#FF7F6B]/30 bg-[#FBE3E3] dark:bg-[#FF7F6B]/20 text-[#6B1F2E] dark:text-[#FF7F6B] font-extrabold text-[11px] tracking-wider uppercase shrink-0">
          Lịch Hẹn
        </span>
        <div>
          <h2 className="font-heading font-extrabold text-sm sm:text-base text-[#6B1F2E] dark:text-[#FFF4E8]">
            Hẹn Ngày Tái Khám &amp; Nhắc Lịch Y Tế Dự Phòng
          </h2>
          <p className="text-[11px] text-zinc-500 dark:text-[#E5BFC4]/80">
            Thiết lập mốc tái khám hoặc nhắc lịch tiêm phòng / tẩy giun định kỳ cho chủ nuôi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Revisit Date */}
        <div className="p-3.5 rounded-2xl border border-[#EBCFC6]/80 dark:border-[#6E2E40] bg-[#FFF4E8]/45 dark:bg-[#2A0C14]/50 space-y-2">
          <label className="text-xs font-bold text-[#3B1520] dark:text-[#FFF4E8] flex items-center gap-1.5">
            <CalendarClock className="w-3.5 h-3.5 text-[#6B1F2E] dark:text-[#FF7F6B]" />
            <span>Hẹn ngày tái khám</span>
          </label>
          <input
            type="date"
            value={revisitDate}
            onChange={(e) => onChangeRevisitDate(e.target.value)}
            className="w-full p-2 rounded-[12px] border border-[#EBCFC6]/90 dark:border-[#6E2E40] bg-white dark:bg-[#2A0C14]/85 text-xs font-semibold text-zinc-800 dark:text-[#FFF4E8] outline-none focus:border-[#6B1F2E] dark:focus:border-[#FF7F6B]"
          />
          <div className="flex items-center gap-1 flex-wrap">
            {[
              { label: "+3 ngày", days: 3 },
              { label: "+7 ngày", days: 7 },
              { label: "+14 ngày", days: 14 },
            ].map((item) => (
              <button
                key={item.days}
                type="button"
                onClick={() =>
                  onChangeRevisitDate(computeFutureDateString(item.days))
                }
                className="px-2 py-0.5 rounded-[8px] text-[10px] font-semibold bg-[#FBE3E3]/70 dark:bg-[#5A2031] text-[#6B1F2E] dark:text-[#E5BFC4] hover:bg-[#6B1F2E] hover:text-white dark:hover:bg-[#FF7F6B] dark:hover:text-[#2A0C14] transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
            {revisitDate && (
              <button
                type="button"
                onClick={() => onChangeRevisitDate("")}
                className="px-2 py-0.5 rounded-[8px] text-[10px] font-semibold text-rose-500 hover:underline cursor-pointer"
              >
                Xóa
              </button>
            )}
          </div>
        </div>

        {/* Next Vaccine Date */}
        <div className="p-3.5 rounded-2xl border border-[#EBCFC6]/80 dark:border-[#6E2E40] bg-[#FFF4E8]/45 dark:bg-[#2A0C14]/50 space-y-2">
          <label className="text-xs font-bold text-[#3B1520] dark:text-[#FFF4E8] flex items-center gap-1.5">
            <Syringe className="w-3.5 h-3.5 text-[#FF7F6B]" />
            <span>Lịch tiêm chủng tiếp</span>
          </label>
          <input
            type="date"
            value={nextVaccineDate}
            onChange={(e) => onChangeNextVaccineDate(e.target.value)}
            className="w-full p-2 rounded-[12px] border border-[#EBCFC6]/90 dark:border-[#6E2E40] bg-white dark:bg-[#2A0C14]/85 text-xs font-semibold text-zinc-800 dark:text-[#FFF4E8] outline-none focus:border-[#6B1F2E] dark:focus:border-[#FF7F6B]"
          />
          <div className="flex items-center gap-1 flex-wrap">
            {[
              { label: "+21 ngày", days: 21 },
              { label: "+1 tháng", days: 30 },
              { label: "+1 năm", days: 365 },
            ].map((item) => (
              <button
                key={item.days}
                type="button"
                onClick={() =>
                  onChangeNextVaccineDate(computeFutureDateString(item.days))
                }
                className="px-2 py-0.5 rounded-[8px] text-[10px] font-semibold bg-[#FBE3E3]/70 dark:bg-[#5A2031] text-[#6B1F2E] dark:text-[#E5BFC4] hover:bg-[#6B1F2E] hover:text-white dark:hover:bg-[#FF7F6B] dark:hover:text-[#2A0C14] transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
            {nextVaccineDate && (
              <button
                type="button"
                onClick={() => onChangeNextVaccineDate("")}
                className="px-2 py-0.5 rounded-[8px] text-[10px] font-semibold text-rose-500 hover:underline cursor-pointer"
              >
                Xóa
              </button>
            )}
          </div>
        </div>

        {/* Next Deworm Date */}
        <div className="p-3.5 rounded-2xl border border-[#EBCFC6]/80 dark:border-[#6E2E40] bg-[#FFF4E8]/45 dark:bg-[#2A0C14]/50 space-y-2">
          <label className="text-xs font-bold text-[#3B1520] dark:text-[#FFF4E8] flex items-center gap-1.5">
            <ShieldPlus className="w-3.5 h-3.5 text-[#7A4A55] dark:text-[#F4B6C2]" />
            <span>Lịch tẩy giun định kỳ</span>
          </label>
          <input
            type="date"
            value={nextDewormDate}
            onChange={(e) => onChangeNextDewormDate(e.target.value)}
            className="w-full p-2 rounded-[12px] border border-[#EBCFC6]/90 dark:border-[#6E2E40] bg-white dark:bg-[#2A0C14]/85 text-xs font-semibold text-zinc-800 dark:text-[#FFF4E8] outline-none focus:border-[#6B1F2E] dark:focus:border-[#FF7F6B]"
          />
          <div className="flex items-center gap-1 flex-wrap">
            {[
              { label: "+1 tháng", days: 30 },
              { label: "+3 tháng", days: 90 },
              { label: "+6 tháng", days: 180 },
            ].map((item) => (
              <button
                key={item.days}
                type="button"
                onClick={() =>
                  onChangeNextDewormDate(computeFutureDateString(item.days))
                }
                className="px-2 py-0.5 rounded-[8px] text-[10px] font-semibold bg-[#FBE3E3]/70 dark:bg-[#5A2031] text-[#6B1F2E] dark:text-[#E5BFC4] hover:bg-[#6B1F2E] hover:text-white dark:hover:bg-[#FF7F6B] dark:hover:text-[#2A0C14] transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
            {nextDewormDate && (
              <button
                type="button"
                onClick={() => onChangeNextDewormDate("")}
                className="px-2 py-0.5 rounded-[8px] text-[10px] font-semibold text-rose-500 hover:underline cursor-pointer"
              >
                Xóa
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
