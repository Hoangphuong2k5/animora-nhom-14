"use client";

import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Lock,
  Pill,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  DiseaseSeverity,
  ExpertPet,
  ExpertPetOwner,
  ExpertProfile,
  MedicalRecord,
  PetSpeciesCode,
  PrescriptionLine,
} from "@/types/expert.type";
import { useLivePrescriptionCatalog } from "@/hooks/expert/useLivePrescriptionCatalog";
import { formatExpertDisplayName } from "@/data/expertPortalData";

const SPECIES_LABELS: Record<PetSpeciesCode, string> = {
  dog: "Chó",
  cat: "Mèo",
  rabbit: "Thỏ",
  hamster: "Hamster",
};

const QUICK_DOSAGES = ["1/2 viên", "1 viên", "2 viên", "3 giọt", "5 ml"];
const QUICK_INSTRUCTIONS = [
  "Uống 2 lần/ngày (sáng - tối) sau bữa ăn",
  "Uống 1 lần/ngày vào buổi sáng",
  "Nhỏ 2 lần/ngày sau khi vệ sinh sạch",
  "Bôi mỏng vùng da tổn thương 2 lần/ngày",
];

interface InteractiveRxPadProps {
  profile: ExpertProfile;
  pet?: ExpertPet;
  owner?: ExpertPetOwner | null;
  latestMedicalRecord?: MedicalRecord;
  onApplyLatestRecord?: () => void;
  diagnosis: string;
  onChangeDiagnosis: (d: string) => void;
  severity: DiseaseSeverity;
  onChangeSeverity: (s: DiseaseSeverity) => void;
  refillsAllowed: number;
  onChangeRefills: (r: number) => void;
  refillInstruction?: string;
  onChangeRefillInstruction?: (v: string) => void;
  lines: PrescriptionLine[];
  onAddLine: () => void;
  onRemoveLine: (idx: number) => void;
  onUpdateLine: (idx: number, patch: Partial<PrescriptionLine>) => void;
  note: string;
  onChangeNote: (n: string) => void;
  loading: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export function InteractiveRxPad({
  profile,
  pet,
  owner,
  latestMedicalRecord,
  onApplyLatestRecord,
  diagnosis,
  onChangeDiagnosis,
  severity,
  onChangeSeverity,
  refillsAllowed,
  onChangeRefills,
  refillInstruction = "",
  onChangeRefillInstruction,
  lines,
  onAddLine,
  onRemoveLine,
  onUpdateLine,
  note,
  onChangeNote,
  loading,
  onSubmit,
  onCancel,
}: InteractiveRxPadProps) {
  const catalog = useLivePrescriptionCatalog(profile.id);

  const estimatedTotal = lines.reduce((sum, l) => {
    const med = catalog.find((m) => m.id === l.medicineId);
    const units = Math.max(1, Math.ceil((l.days || 1) / 7));
    return sum + (med ? med.price * units : 0);
  }, 0);

  const doctorDisplayName = formatExpertDisplayName(
    profile.fullName,
    profile.expertType
  );
  const licenseNumber = profile.licenseNumber || "CCHN-TY-2019-0842";

  return (
    <div className="rounded-3xl border-2 border-[#6B1F2E]/35 dark:border-[#FF7F6B]/40 bg-white dark:bg-card/95 shadow-lg overflow-hidden">
      {/* 1. OFFICIAL PRESCRIPTION SHEET HEADER (ICON VIÊN THUỐC & PHÒNG KHÁM) */}
      <div className="bg-gradient-to-r from-[#6B1F2E] to-[#521723] text-white p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-[#FF7F6B] shrink-0">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF7F6B]">
              PHÒNG KHÁM THÚ Y ANIMORA • ĐƠN THUỐC ĐIỆN TỬ
            </div>
            <div className="font-heading font-extrabold text-lg text-white">
              Tờ Đơn Thuốc Chỉ Định Điều Trị
            </div>
            <p className="text-[11px] text-white/75">
              Bác sĩ kê đơn: <strong>{doctorDisplayName}</strong> • CCHN:{" "}
              <span className="font-mono">{licenseNumber}</span>
            </p>
          </div>
        </div>

        {/* Patient Stamp on the Rx Header */}
        {pet && (
          <div className="px-3.5 py-2 rounded-2xl bg-white/10 border border-white/15 text-xs space-y-0.5 self-start sm:self-auto">
            <div className="font-extrabold text-white">
              Bệnh nhân: {pet.name} ({SPECIES_LABELS[pet.species]} • {pet.weightKg}kg)
            </div>
            <div className="text-[11px] text-white/75">
              Chủ nuôi: {owner?.fullName} ({owner?.phone})
            </div>
          </div>
        )}
      </div>

      {/* 2. PRESCRIPTION BODY */}
      <div className="p-5 space-y-5">
        {/* ZONE A: COMPACT DIAGNOSIS & REFILL SAFETY BAR */}
        <div className="p-4 rounded-2xl bg-[#FFF4E8]/60 dark:bg-[#2A0C14]/55 border border-[#EBCFC6] dark:border-[#6E2E40] space-y-3.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-xs font-extrabold text-[#3B1520] dark:text-[#FFF4E8]">
              Chẩn đoán ghi trên đơn thuốc <span className="text-rose-500">*</span>
            </label>

            {latestMedicalRecord && onApplyLatestRecord && (
              <button
                type="button"
                onClick={onApplyLatestRecord}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] text-[11px] font-bold border border-[#EBCFC6] dark:border-[#FF7F6B]/30 bg-[#FBE3E3]/80 dark:bg-[#FF7F6B]/15 text-[#6B1F2E] dark:text-[#FF7F6B] hover:bg-[#6B1F2E] hover:text-white dark:hover:bg-[#FF7F6B] dark:hover:text-[#2A0C14] transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3 shrink-0" />
                <span>
                  Lấy từ Bệnh án ({latestMedicalRecord.date}: {latestMedicalRecord.diagnosis})
                </span>
              </button>
            )}
          </div>

          <input
            type="text"
            value={diagnosis}
            onChange={(e) => onChangeDiagnosis(e.target.value)}
            placeholder="Nhập chẩn đoán bệnh (hoặc bấm lấy tự động từ bệnh án vừa khám)..."
            className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#EBCFC6] dark:border-[#6E2E40] bg-white dark:bg-[#2A0C14]/90 text-xs font-bold text-[#3B1520] dark:text-[#FFF4E8] outline-none focus:border-[#6B1F2E] dark:focus:border-[#FF7F6B]"
          />

          {/* Structured 2-Row Refill Control Bar (No awkward mid-button wrapping) */}
          <div className="pt-3 border-t border-[#EBCFC6]/70 dark:border-[#6E2E40]/70 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <span className="text-xs font-bold text-[#3B1520] dark:text-[#FFF4E8]/90 whitespace-nowrap">
                Quyền mua lại trực tuyến:
              </span>

              <div className="inline-flex flex-wrap sm:flex-nowrap items-center gap-1 rounded-[12px] p-1 bg-[#FBE3E3]/65 dark:bg-[#4D1B2A] border border-[#EBCFC6]/80 dark:border-[#6E2E40]">
                <button
                  type="button"
                  onClick={() => {
                    onChangeSeverity("mild");
                    if (refillsAllowed === 0) onChangeRefills(1);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[11px] font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                    severity === "mild"
                      ? "bg-amber-100 text-amber-900 border border-amber-300/90 dark:bg-amber-500/25 dark:text-amber-200 dark:border-amber-400/40 shadow-2xs"
                      : "text-[#7A4A55] dark:text-[#E5BFC4] hover:text-[#6B1F2E] dark:hover:text-white"
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                  <span>Bệnh nhẹ (Cho mua lại)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChangeSeverity("severe");
                    onChangeRefills(0);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[11px] font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                    severity === "severe"
                      ? "bg-rose-600 text-white shadow-2xs"
                      : "text-[#7A4A55] dark:text-[#E5BFC4] hover:text-[#6B1F2E] dark:hover:text-white"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>Bệnh nặng (Khóa 0 lượt)</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {severity === "mild" ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-[#7A4A55] dark:text-[#E5BFC4] whitespace-nowrap">
                      Số lượt tái cấp theo chỉ định:
                    </span>
                    <div className="inline-flex items-center gap-1.5 flex-wrap">
                      {[0, 1, 2, 3].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => onChangeRefills(r)}
                          className={`px-2.5 py-1.5 rounded-[10px] text-[11px] font-extrabold whitespace-nowrap transition-colors cursor-pointer ${
                            refillsAllowed === r
                              ? "bg-[#6B1F2E] text-white dark:bg-[#FF7F6B] dark:text-[#2A0C14] shadow-2xs"
                              : "bg-white dark:bg-[#2A0C14]/85 border border-[#EBCFC6] dark:border-[#6E2E40] text-[#3B1520] dark:text-[#FFF4E8] hover:border-[#6B1F2E]/50"
                          }`}
                        >
                          {r} lượt
                        </button>
                      ))}
                      <input
                        type="number"
                        min={0}
                        value={refillsAllowed}
                        onChange={(e) =>
                          onChangeRefills(Math.max(0, parseInt(e.target.value, 10) || 0))
                        }
                        aria-label="Số lượt tái cấp tùy chỉnh"
                        className="w-16 px-2 py-1.5 rounded-[10px] border border-[#EBCFC6] dark:border-[#6E2E40] bg-white dark:bg-[#2A0C14]/85 text-center text-[11px] font-extrabold text-[#3B1520] dark:text-[#FFF4E8] outline-none focus:border-[#6B1F2E]"
                      />
                    </div>
                  </div>
                  {onChangeRefillInstruction && (
                    <input
                      type="text"
                      value={refillInstruction}
                      onChange={(e) => onChangeRefillInstruction(e.target.value)}
                      placeholder="Ghi chú hướng dẫn tái mua của bác sĩ (VD: Tái mua thêm 1 đợt nếu triệu chứng chưa dứt hoàn toàn)..."
                      className="w-full px-3 py-2 rounded-[10px] border border-[#EBCFC6] dark:border-[#6E2E40] bg-white dark:bg-[#2A0C14]/85 text-[11px] text-[#3B1520] dark:text-[#FFF4E8] outline-none focus:border-[#6B1F2E]"
                    />
                  )}
                </>
              ) : (
                <div className="w-full px-3 py-2 rounded-[10px] bg-rose-50 dark:bg-rose-950/35 border border-rose-200/80 dark:border-rose-900/50 text-[11px] font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>Ca bệnh nặng: Mặc định 0 lượt mua lại trực tuyến, khuyến cáo tái khám trực tiếp</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ZONE B: MEDICATION LINES ON THE PRESCRIPTION SHEET */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[10px] bg-[#FBE3E3] dark:bg-[#FF7F6B]/20 text-[#6B1F2E] dark:text-[#FF7F6B] flex items-center justify-center shrink-0">
                <Pill className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-extrabold text-sm text-[#6B1F2E] dark:text-[#F4B6C2]">
                Chỉ Định Thuốc Điều Trị ({lines.length} khoản)
              </h3>
            </div>

            <button
              type="button"
              onClick={onAddLine}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[10px] text-xs font-bold border border-[#EBCFC6] dark:border-[#FF7F6B]/30 bg-[#FFF4E8]/60 dark:bg-[#FF7F6B]/10 text-[#6B1F2E] dark:text-[#FF7F6B] hover:bg-[#6B1F2E] hover:text-white hover:border-[#6B1F2E] transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm dòng thuốc</span>
            </button>
          </div>

          <div className="space-y-3">
            {lines.map((line, idx) => {
              const selectedMed = catalog.find(
                (m) => m.id === line.medicineId
              );
              const isSpeciesMismatch =
                pet &&
                selectedMed &&
                !selectedMed.speciesHint.includes(pet.species);

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    isSpeciesMismatch
                      ? "border-amber-400 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/20"
                      : "border-[#EBCFC6] dark:border-[#6E2E40] bg-[#FFF4E8]/45 dark:bg-[#2A0C14]/50"
                  }`}
                >
                  {/* Row 1: Number + Select Medicine + Price + Delete */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-6 h-6 rounded-[8px] bg-[#6B1F2E] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <select
                        value={line.medicineId}
                        onChange={(e) =>
                          onUpdateLine(idx, { medicineId: e.target.value })
                        }
                        className="flex-1 p-2.5 rounded-[12px] border border-[#EBCFC6] dark:border-[#6E2E40] bg-white dark:bg-[#2A0C14] text-xs font-extrabold text-[#3B1520] dark:text-[#FFF4E8] outline-none focus:border-[#6B1F2E] dark:focus:border-[#FF7F6B] cursor-pointer min-w-0"
                      >
                        {catalog.map((m) => (
                          <option
                            key={m.id}
                            value={m.id}
                            className="bg-white dark:bg-[#2A0C14] text-zinc-900 dark:text-[#FFF4E8]"
                          >
                            {m.name} ({m.price.toLocaleString("vi-VN")}đ/{m.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    {lines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemoveLine(idx)}
                        className="p-1.5 rounded-[8px] text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                        title="Xóa thuốc này khỏi đơn"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Species Mismatch Warning */}
                  {isSpeciesMismatch && pet && selectedMed && (
                    <div className="p-2.5 rounded-[12px] bg-amber-100/80 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-[11px] flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Lưu ý loài:</strong> Thuốc này khuyến cáo cho{" "}
                        <strong>
                          {selectedMed.speciesHint
                            .map((sp) => SPECIES_LABELS[sp])
                            .join(", ")}
                        </strong>
                        , còn bệnh nhân hiện tại là{" "}
                        <strong>{SPECIES_LABELS[pet.species]}</strong>.
                      </span>
                    </div>
                  )}

                  {/* Row 2: Dosage & Days */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#7A4A55] dark:text-[#E5BFC4] block">
                        Liều dùng mỗi lần *
                      </label>
                      <input
                        type="text"
                        value={line.dosage}
                        onChange={(e) =>
                          onUpdateLine(idx, { dosage: e.target.value })
                        }
                        placeholder="VD: 1 viên, 3 giọt..."
                        className="w-full px-3 py-2 rounded-[12px] border border-[#EBCFC6] dark:border-[#6E2E40] bg-white dark:bg-[#2A0C14]/85 text-xs font-bold text-[#3B1520] dark:text-[#FFF4E8] outline-none focus:border-[#6B1F2E] dark:focus:border-[#FF7F6B]"
                      />
                      <div className="flex items-center gap-1 flex-wrap">
                        {QUICK_DOSAGES.map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => onUpdateLine(idx, { dosage: d })}
                            className="px-2 py-0.5 rounded-[8px] text-[10px] font-semibold bg-[#FBE3E3]/70 dark:bg-[#5A2031] text-[#6B1F2E] dark:text-[#E5BFC4] hover:bg-[#6B1F2E] hover:text-white dark:hover:bg-[#FF7F6B] dark:hover:text-[#2A0C14] transition-colors cursor-pointer"
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#7A4A55] dark:text-[#E5BFC4] block">
                        Số ngày dùng thuốc *
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={90}
                        value={line.days}
                        onChange={(e) =>
                          onUpdateLine(idx, {
                            days: Math.max(1, parseInt(e.target.value) || 1),
                          })
                        }
                        className="w-full px-3 py-2 rounded-[12px] border border-[#EBCFC6] dark:border-[#6E2E40] bg-white dark:bg-[#2A0C14]/85 text-xs font-bold text-[#3B1520] dark:text-[#FFF4E8] outline-none focus:border-[#6B1F2E] dark:focus:border-[#FF7F6B]"
                      />
                      <div className="flex items-center gap-1 flex-wrap">
                        {[3, 5, 7, 10, 14].map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => onUpdateLine(idx, { days: d })}
                            className={`px-2 py-0.5 rounded-[8px] text-[10px] font-semibold transition-colors cursor-pointer ${
                              line.days === d
                                ? "bg-[#6B1F2E] text-white dark:bg-[#FF7F6B] dark:text-[#2A0C14]"
                                : "bg-[#FBE3E3]/70 dark:bg-[#5A2031] text-[#6B1F2E] dark:text-[#E5BFC4] hover:bg-[#6B1F2E] hover:text-white dark:hover:bg-[#FF7F6B] dark:hover:text-[#2A0C14]"
                            }`}
                          >
                            {d} ngày
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Instruction */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#7A4A55] dark:text-[#E5BFC4] block">
                      Cách dùng chi tiết (ghi trên nhãn thuốc) *
                    </label>
                    <input
                      type="text"
                      value={line.instruction}
                      onChange={(e) =>
                        onUpdateLine(idx, { instruction: e.target.value })
                      }
                      placeholder="VD: Uống 2 lần/ngày sau bữa ăn..."
                      className="w-full px-3 py-2 rounded-[12px] border border-[#EBCFC6] dark:border-[#6E2E40] bg-white dark:bg-[#2A0C14]/85 text-xs text-[#3B1520] dark:text-[#FFF4E8] outline-none focus:border-[#6B1F2E] dark:focus:border-[#FF7F6B]"
                    />
                    <div className="flex items-center gap-1 flex-wrap">
                      {QUICK_INSTRUCTIONS.map((inst) => (
                        <button
                          key={inst}
                          type="button"
                          onClick={() =>
                            onUpdateLine(idx, { instruction: inst })
                          }
                          className="px-2 py-0.5 rounded-[8px] text-[10px] font-medium bg-[#FBE3E3]/70 dark:bg-[#5A2031] text-[#6B1F2E] dark:text-[#E5BFC4] hover:bg-[#6B1F2E] hover:text-white dark:hover:bg-[#FF7F6B] dark:hover:text-[#2A0C14] transition-colors cursor-pointer"
                        >
                          + {inst}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ZONE C: DOCTOR ADVICE, TOTAL & DIGITAL SIGNATURE STAMP */}
        <div className="pt-3 border-t border-[#EBCFC6]/70 dark:border-[#6E2E40]/70 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#3B1520] dark:text-[#FFF4E8]/90 block">
              Lời dặn của Bác sĩ trên tờ đơn thuốc
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => onChangeNote(e.target.value)}
              placeholder="VD: Đeo loa chống liếm trong suốt thời gian điều trị. Ngưng thuốc và liên hệ bác sĩ nếu bé có biểu hiện nôn ói..."
              className="w-full p-2.5 rounded-[12px] border border-[#EBCFC6] dark:border-[#6E2E40] bg-white dark:bg-[#2A0C14]/85 text-xs text-[#3B1520] dark:text-[#FFF4E8] outline-none focus:border-[#6B1F2E] dark:focus:border-[#FF7F6B]"
            />
          </div>

          {/* Total & Digital Signature Row */}
          <div className="p-4 rounded-2xl bg-[#FFF4E8]/75 dark:bg-[#FF7F6B]/10 border border-[#EBCFC6] dark:border-[#FF7F6B]/25 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-0.5 text-xs">
              <div className="flex items-center gap-1.5 font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                <ShieldCheck className="w-4 h-4" />
                <span>Xác thực chữ ký số Bác sĩ thú y ({licenseNumber})</span>
              </div>
              <p className="text-[11px] text-[#7A4A55] dark:text-[#E5BFC4]/80">
                Đơn thuốc sau khi ký số sẽ mở khóa quyền mua dược phẩm Rx cho tài khoản của chủ nuôi.
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#7A4A55]/80 dark:text-[#E5BFC4]/70">
                Tổng tạm tính (1 liệu trình)
              </div>
              <div className="text-lg font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                {estimatedTotal.toLocaleString("vi-VN")} VND
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-[12px] text-xs font-bold border border-[#EBCFC6] dark:border-[#6E2E40] text-zinc-600 dark:text-[#E5BFC4] hover:bg-[#FFF4E8] dark:hover:bg-[#5A2031]/50 transition-colors cursor-pointer"
            >
              Hủy &amp; Quay lại danh sách đơn
            </button>

            <button
              type="button"
              onClick={onSubmit}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 rounded-[14px] text-xs font-extrabold bg-[#6B1F2E] text-white hover:bg-[#521723] disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-[#6B1F2E]/25"
            >
              <CheckCircle2 className="w-4 h-4 text-[#FF7F6B]" />
              <span>
                {loading
                  ? "Đang ký số & phát hành..."
                  : "Ký Số & Phát Hành Đơn Thuốc Điện Tử"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

