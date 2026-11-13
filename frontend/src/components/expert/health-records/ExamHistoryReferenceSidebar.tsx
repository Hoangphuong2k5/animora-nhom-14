"use client";

import React from "react";
import {
  History,
  Pill,
  Save,
  Stethoscope,
} from "lucide-react";
import {
  ExpertPet,
  ExpertPetOwner,
  HealthEntry,
  MedicalRecord,
} from "@/types/expert.type";

interface ExamHistoryReferenceSidebarProps {
  pet?: ExpertPet;
  owner?: ExpertPetOwner | null;
  medicalRecords: MedicalRecord[];
  healthEntries: HealthEntry[];
  loading: boolean;
  onSaveOnly: () => void;
  onSaveAndPrescribe: () => void;
  onCancel: () => void;
}

export function ExamHistoryReferenceSidebar({
  pet,
  medicalRecords,
  healthEntries,
  loading,
  onSaveOnly,
  onSaveAndPrescribe,
  onCancel,
}: ExamHistoryReferenceSidebarProps) {
  return (
    <div className="space-y-5">
      {/* 1. Past Clinical Records & Preventive History Reference */}
      <div className="p-5 rounded-3xl border border-[#EBCFC6] dark:border-[#6E2E40] bg-white dark:bg-card/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#EBCFC6]/50 dark:border-[#6E2E40]/60">
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#6B1F2E] dark:text-[#FF7F6B]">
            <Stethoscope className="w-4 h-4 text-[#FF7F6B]" />
            <span>Bệnh Sử &amp; Tiêm Chủng Đối Chiếu</span>
          </div>
          {pet && (
            <span className="text-[11px] font-bold text-[#7A4A55] dark:text-[#E5BFC4]">
              Bé {pet.name}
            </span>
          )}
        </div>

        {/* Past Clinical Records */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-zinc-700 dark:text-[#FFF4E8]/90">
            Các lần khám bệnh trước đây ({medicalRecords.length})
          </div>

          {medicalRecords.length === 0 ? (
            <div className="p-3.5 rounded-2xl border border-dashed border-[#EBCFC6] dark:border-[#6E2E40] text-[11px] text-zinc-400 dark:text-[#E5BFC4]/70 text-center">
              Đây là lần khám lâm sàng đầu tiên của bé tại Animora.
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {medicalRecords.slice(0, 3).map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-2xl border border-[#EBCFC6]/70 dark:border-[#6E2E40]/80 bg-[#FFF4E8]/55 dark:bg-[#2A0C14]/50 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-[#3B1520] dark:text-[#FFF4E8] truncate">
                      {rec.diagnosis}
                    </span>
                    <span className="text-[10px] font-semibold text-[#6B1F2E] dark:text-[#FF7F6B] shrink-0">
                      {rec.date}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-600 dark:text-[#E5BFC4]/85 line-clamp-2">
                    Triệu chứng: {rec.symptoms}
                  </div>
                  <div className="text-[10px] font-bold text-[#7A4A55]/85 dark:text-[#E5BFC4]/70 pt-0.5">
                    Sinh hiệu: {rec.weightKg}kg • {rec.temperatureC}°C
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Vaccines / Deworming */}
        <div className="space-y-2 pt-3 border-t border-[#EBCFC6]/50 dark:border-[#6E2E40]/60">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-700 dark:text-[#FFF4E8]/90">
            <History className="w-3.5 h-3.5 text-[#FF7F6B]" />
            <span>Nhật ký tiêm phòng &amp; tẩy giun ({healthEntries.length})</span>
          </div>

          {healthEntries.length === 0 ? (
            <div className="text-[11px] text-zinc-400 dark:text-[#E5BFC4]/70 italic">
              Chưa có bản ghi tiêm phòng / tẩy giun.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {healthEntries.slice(0, 4).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between text-[11px] p-2.5 rounded-xl bg-[#FFF4E8]/45 dark:bg-[#2A0C14]/50 border border-[#EBCFC6]/65 dark:border-[#6E2E40]/70"
                >
                  <span className="font-semibold text-[#3B1520] dark:text-[#FFF4E8] truncate">
                    {entry.title}
                  </span>
                  <span className="text-[10px] text-[#7A4A55]/85 dark:text-[#E5BFC4]/70 shrink-0 ml-2">
                    {entry.date}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Submit Actions Box (Primary Burgundy #6B1F2E + Soft Blush Secondary) */}
      <div className="p-5 rounded-3xl border-2 border-[#EBCFC6] dark:border-[#FF7F6B]/30 bg-white dark:bg-card shadow-sm space-y-3">
        <div className="space-y-0.5">
          <h3 className="font-heading font-extrabold text-sm text-[#6B1F2E] dark:text-[#F4B6C2]">
            Hoàn Tất Phiếu Khám Lâm Sàng
          </h3>
          <p className="text-[11px] text-zinc-500 dark:text-[#E5BFC4]/80">
            Lưu chỉ số sinh tồn và kết luận bệnh án vào Sổ sức khỏe điện tử của thú cưng.
          </p>
        </div>

        <button
          type="button"
          onClick={onSaveOnly}
          disabled={loading}
          className="w-full py-3 px-4 rounded-2xl text-xs font-extrabold bg-[#6B1F2E] text-white hover:bg-[#521723] disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-[#6B1F2E]/20"
        >
          <Save className="w-4 h-4 text-[#FF7F6B]" />
          <span>
            {loading
              ? "Đang lưu phiếu khám..."
              : "Lưu Bệnh Án Vào Sổ Sức Khỏe"}
          </span>
        </button>

        <button
          type="button"
          onClick={onSaveAndPrescribe}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-2xl text-xs font-extrabold border-2 border-[#EBCFC6] dark:border-[#FF7F6B]/40 bg-[#FBE3E3]/55 dark:bg-[#FF7F6B]/10 text-[#6B1F2E] dark:text-[#FF7F6B] hover:bg-[#6B1F2E] hover:text-white hover:border-[#6B1F2E] dark:hover:bg-[#FF7F6B] dark:hover:text-[#2A0C14] disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <Pill className="w-4 h-4" />
          <span>Lưu Bệnh Án &amp; Chuyển Sang Kê Đơn Thuốc →</span>
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="w-full py-2 px-4 rounded-xl text-xs font-bold border border-[#EBCFC6]/80 dark:border-[#6E2E40] text-zinc-600 dark:text-[#E5BFC4] hover:bg-[#FFF4E8] dark:hover:bg-[#5A2031]/50 transition-colors cursor-pointer"
        >
          Hủy &amp; Quay lại Sổ sức khỏe
        </button>
      </div>
    </div>
  );
}
