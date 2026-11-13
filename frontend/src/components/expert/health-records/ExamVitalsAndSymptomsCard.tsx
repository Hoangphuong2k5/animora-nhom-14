"use client";

import React from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Scale,
  Stethoscope,
  Thermometer,
} from "lucide-react";
import { DiseaseSeverity } from "@/types/expert.type";

const QUICK_SYMPTOM_CHIPS = [
  "Chảy dịch tai màu nâu sẫm, ngứa, lắc đầu liên tục",
  "Ngứa gãi dữ dội, đỏ da, rụng lông cục bộ",
  "Nôn dịch vàng, đi ngoài phân lỏng, mệt mỏi",
  "Đỏ kết mạc mắt, chảy nước mắt và ghèn đặc",
  "Ăn uống kém, sốt nhẹ, thở khò khè",
];

const QUICK_DIAGNOSIS_CHIPS = [
  "Viêm tai ngoài cấp tính do nấm Malassezia",
  "Viêm da dị ứng bội nhiễm vi khuẩn",
  "Rối loạn tiêu hóa & viêm ruột cấp",
  "Viêm kết mạc mắt cấp tính",
  "Khám sức khỏe định kỳ & tiêm phòng",
];

interface ExamVitalsAndSymptomsCardProps {
  weightKg: number;
  referenceWeightKg?: number;
  onChangeWeight: (w: number) => void;
  temperatureC: number;
  onChangeTemperature: (t: number) => void;
  customerBookingNote?: string;
  symptoms: string;
  onChangeSymptoms: (s: string) => void;
  diagnosis: string;
  onChangeDiagnosis: (d: string) => void;
  severity: DiseaseSeverity;
  onChangeSeverity: (s: DiseaseSeverity) => void;
  note: string;
  onChangeNote: (n: string) => void;
}

export function ExamVitalsAndSymptomsCard({
  weightKg,
  referenceWeightKg,
  onChangeWeight,
  temperatureC,
  onChangeTemperature,
  customerBookingNote,
  symptoms,
  onChangeSymptoms,
  diagnosis,
  onChangeDiagnosis,
  severity,
  onChangeSeverity,
  note,
  onChangeNote,
}: ExamVitalsAndSymptomsCardProps) {
  const weightDiff =
    referenceWeightKg !== undefined
      ? Number((weightKg - referenceWeightKg).toFixed(1))
      : 0;

  const isFever = temperatureC > 39.2;
  const isHypothermia = temperatureC < 37.5;

  return (
    <div className="space-y-5">
      {/* SECTION 1: VITAL SIGNS MONITOR (BẢNG ĐO SINH HIỆU LÂM SÀNG) */}
      <div className="p-5 rounded-3xl border border-[#EBCFC6] dark:border-[#6E2E40] bg-white dark:bg-card/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#EBCFC6]/50 dark:border-[#6E2E40]/60">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-[10px] border border-[#EBCFC6] dark:border-[#FF7F6B]/30 bg-[#FBE3E3] dark:bg-[#FF7F6B]/20 text-[#6B1F2E] dark:text-[#FF7F6B] font-extrabold text-[11px] tracking-wider uppercase shrink-0">
              Vitals
            </span>
            <div>
              <h2 className="font-heading font-extrabold text-sm sm:text-base text-[#6B1F2E] dark:text-[#FFF4E8]">
                Bảng Đo Chỉ Số Sinh Tồn Lúc Khám
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-[#E5BFC4]/80">
                Ghi nhận cân nặng thực tế (tự động cập nhật vào biểu đồ cân nặng) và thân nhiệt lâm sàng.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border border-[#EBCFC6]/80 dark:border-[#6E2E40] bg-[#FFF4E8] dark:bg-[#5A2031]/60 text-[#7A4A55] dark:text-[#F4B6C2]">
            <Stethoscope className="w-3 h-3 text-[#FF7F6B]" />
            Khám thực thể
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Weight Monitor Card */}
          <div className="p-4 rounded-2xl border border-[#EBCFC6] dark:border-[#6E2E40] bg-[#FFF4E8]/65 dark:bg-[#2A0C14]/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-[#3B1520] dark:text-[#FFF4E8] flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-[#FF7F6B]" />
                <span>Cân nặng thực tế (kg) *</span>
              </label>
              {referenceWeightKg !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    weightDiff === 0
                      ? "bg-[#FBE3E3]/70 dark:bg-[#5A2031] text-[#7A4A55] dark:text-[#E5BFC4]"
                      : weightDiff > 0
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                  }`}
                >
                  {weightDiff === 0
                    ? `Không đổi (${referenceWeightKg}kg)`
                    : weightDiff > 0
                    ? `+${weightDiff}kg so với cũ (${referenceWeightKg}kg)`
                    : `${weightDiff}kg so với cũ (${referenceWeightKg}kg)`}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="120"
                value={weightKg}
                onChange={(e) => onChangeWeight(parseFloat(e.target.value) || 0)}
                className="w-full p-3 pr-12 rounded-[12px] border border-[#EBCFC6] dark:border-[#6E2E40] bg-white dark:bg-[#2A0C14]/85 text-lg font-extrabold text-[#3B1520] dark:text-[#FFF4E8] outline-none focus:border-[#6B1F2E] dark:focus:border-[#FF7F6B]"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-[#7A4A55]/70 dark:text-[#E5BFC4]/60">
                KG
              </span>
            </div>
          </div>

          {/* Temperature Monitor Card */}
          <div className="p-4 rounded-2xl border border-[#EBCFC6] dark:border-[#6E2E40] bg-[#FFF4E8]/65 dark:bg-[#2A0C14]/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-[#3B1520] dark:text-[#FFF4E8] flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-[#FF7F6B]" />
                <span>Thân nhiệt đo được (°C) *</span>
              </label>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isFever
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                    : isHypothermia
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                }`}
              >
                {isFever ? (
                  <>
                    <AlertTriangle className="w-3 h-3" />
                    <span>Sốt cao (&gt;39.2°C)</span>
                  </>
                ) : isHypothermia ? (
                  <>
                    <AlertTriangle className="w-3 h-3" />
                    <span>Hạ nhiệt (&lt;37.5°C)</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Bình thường (37.5–39.2°C)</span>
                  </>
                )}
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="34"
                max="43"
                value={temperatureC}
                onChange={(e) =>
                  onChangeTemperature(parseFloat(e.target.value) || 38.5)
                }
                className="w-full p-3 pr-12 rounded-[12px] border border-[#EBCFC6] dark:border-[#6E2E40] bg-white dark:bg-[#2A0C14]/85 text-lg font-extrabold text-[#3B1520] dark:text-[#FFF4E8] outline-none focus:border-[#6B1F2E] dark:focus:border-[#FF7F6B]"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-[#7A4A55]/70 dark:text-[#E5BFC4]/60">
                °C
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: SOAP CLINICAL ASSESSMENT (KHÁM LÂM SÀNG & KẾT LUẬN BỆNH ÁN) */}
      <div className="p-5 rounded-3xl border border-[#EBCFC6]/90 dark:border-[#6E2E40] bg-white dark:bg-card/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#EBCFC6]/50 dark:border-[#6E2E40]/60">
          <span className="px-2.5 py-1 rounded-[10px] border border-[#EBCFC6] dark:border-[#FF7F6B]/30 bg-[#FBE3E3] dark:bg-[#FF7F6B]/20 text-[#6B1F2E] dark:text-[#FF7F6B] font-extrabold text-[11px] tracking-wider uppercase shrink-0">
            SOAP
          </span>
          <div>
            <h2 className="font-heading font-extrabold text-sm sm:text-base text-[#6B1F2E] dark:text-[#FFF4E8]">
              Phiếu Ghi Nhận Triệu Chứng &amp; Kết Luận Bệnh Án
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-[#E5BFC4]/80">
              Ghi chép triệu chứng thực thể (Subjective/Objective), kết luận bệnh lý (Assessment) và hướng xử trí tại phòng khám (Plan).
            </p>
          </div>
        </div>

        {/* Customer Booking Note Banner */}
        {customerBookingNote && (
          <div className="p-3.5 rounded-2xl border border-[#FF7F6B]/40 dark:border-[#FF7F6B]/30 bg-[#FFF4E8]/85 dark:bg-[#FF7F6B]/10 flex items-center justify-between gap-3">
            <div className="space-y-0.5 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B1F2E] dark:text-[#FF7F6B] flex items-center gap-1">
                <ClipboardList className="w-3.5 h-3.5 text-[#FF7F6B]" />
                <span>Lý do khám / Triệu chứng khách báo lúc đặt lịch:</span>
              </div>
              <p className="text-[#3B1520] dark:text-[#FFF4E8] font-medium">
                &ldquo;{customerBookingNote}&rdquo;
              </p>
            </div>
            <button
              type="button"
              onClick={() => onChangeSymptoms(customerBookingNote)}
              className="px-3 py-1.5 rounded-[10px] text-[11px] font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] dark:bg-[#FF7F6B] dark:text-[#2A0C14] dark:hover:bg-[#ff9483] transition-colors cursor-pointer shrink-0 whitespace-nowrap"
            >
              Chép vào bệnh án
            </button>
          </div>
        )}

        {/* S/O: Symptoms */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-700 dark:text-[#FFF4E8]/90 block">
            [S/O] Triệu chứng lâm sàng &amp; Khám thực thể{" "}
            <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            value={symptoms}
            onChange={(e) => onChangeSymptoms(e.target.value)}
            placeholder="Mô tả biểu hiện khi khám: niêm mạc, da lông, tai, mắt, hô hấp, tiêu hóa..."
            className="w-full p-2.5 rounded-[12px] border border-[#EBCFC6] dark:border-[#6E2E40] bg-white dark:bg-[#2A0C14]/85 text-xs text-zinc-900 dark:text-[#FFF4E8] outline-none focus:border-[#6B1F2E] dark:focus:border-[#FF7F6B]"
          />
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-[#E5BFC4]/70">Chèn nhanh:</span>
            {QUICK_SYMPTOM_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() =>
                  onChangeSymptoms(
                    symptoms.trim() ? `${symptoms.trim()}; ${chip}` : chip
                  )
                }
                className="px-2 py-0.5 rounded-[8px] text-[10px] font-medium border border-[#EBCFC6]/80 dark:border-[#6E2E40] bg-[#FFF4E8]/50 dark:bg-[#2A0C14]/50 text-zinc-600 dark:text-[#E5BFC4] hover:border-[#FF7F6B] hover:bg-[#FBE3E3]/60 hover:text-[#6B1F2E] dark:hover:border-[#FF7F6B] dark:hover:text-[#FF7F6B] transition-colors cursor-pointer"
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>

        {/* A: Diagnosis & Severity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-zinc-700 dark:text-[#FFF4E8]/90 block">
              [A] Kết luận chẩn đoán bệnh án <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => onChangeDiagnosis(e.target.value)}
              placeholder="VD: Viêm tai ngoài cấp tính do nấm men Malassezia"
              className="w-full p-2.5 rounded-[12px] border border-[#EBCFC6] dark:border-[#6E2E40] bg-white dark:bg-[#2A0C14]/85 text-xs font-bold text-zinc-900 dark:text-[#FFF4E8] outline-none focus:border-[#6B1F2E] dark:focus:border-[#FF7F6B]"
            />
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-[#E5BFC4]/70">Mẫu bệnh lý:</span>
              {QUICK_DIAGNOSIS_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => onChangeDiagnosis(chip)}
                  className="px-2 py-0.5 rounded-[8px] text-[10px] font-medium border border-[#EBCFC6]/80 dark:border-[#6E2E40] bg-[#FFF4E8]/50 dark:bg-[#2A0C14]/50 text-zinc-600 dark:text-[#E5BFC4] hover:border-[#FF7F6B] hover:bg-[#FBE3E3]/60 hover:text-[#6B1F2E] dark:hover:border-[#FF7F6B] dark:hover:text-[#FF7F6B] transition-colors cursor-pointer"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700 dark:text-[#FFF4E8]/90 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-[#FF7F6B]" />
              <span>Tiên lượng / Mức độ bệnh *</span>
            </label>
            <select
              value={severity}
              onChange={(e) =>
                onChangeSeverity(e.target.value as DiseaseSeverity)
              }
              className="w-full p-2.5 rounded-[12px] border border-[#EBCFC6] dark:border-[#6E2E40] bg-white dark:bg-[#2A0C14] text-xs font-bold text-zinc-900 dark:text-[#FFF4E8] outline-none focus:border-[#6B1F2E] dark:focus:border-[#FF7F6B] cursor-pointer"
            >
              <option value="mild" className="bg-white dark:bg-[#2A0C14] text-zinc-900 dark:text-[#FFF4E8]">
                Mức độ Nhẹ / Theo dõi ngoại trú
              </option>
              <option value="severe" className="bg-white dark:bg-[#2A0C14] text-zinc-900 dark:text-[#FFF4E8]">
                Mức độ Nặng / Cần tái khám sát
              </option>
            </select>
            <p className="text-[10px] text-zinc-400 dark:text-[#E5BFC4]/70 leading-relaxed">
              Nếu chuyển sang kê đơn thuốc, mức độ này sẽ tự động đồng bộ sang quyền mua lại đơn thuốc.
            </p>
          </div>
        </div>

        {/* P: Clinical Procedure & Care Plan */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700 dark:text-[#FFF4E8]/90 block">
            [P] Thủ thuật đã xử trí tại phòng khám &amp; Hướng điều trị
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => onChangeNote(e.target.value)}
            placeholder="VD: Đã nội soi tai, vệ sinh dịch viêm bằng dung dịch sát khuẩn chuyên dụng. Hướng dẫn chủ nuôi đeo loa chống gãi..."
            className="w-full p-2.5 rounded-[12px] border border-[#EBCFC6] dark:border-[#6E2E40] bg-white dark:bg-[#2A0C14]/85 text-xs text-zinc-900 dark:text-[#FFF4E8] outline-none focus:border-[#6B1F2E] dark:focus:border-[#FF7F6B]"
          />
        </div>
      </div>
    </div>
  );
}
