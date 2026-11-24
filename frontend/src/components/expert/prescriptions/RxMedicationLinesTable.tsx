"use client";

import React from "react";
import { AlertTriangle, Pill, Plus, Trash2 } from "lucide-react";
import type {
  ExpertPet,
  MedicineItem,
  PrescriptionLine,
} from "@/types/expert.type";
import { PET_SPECIES_LABELS } from "@/constants/expert.constant";

const QUICK_DOSAGES = ["1/2 viên", "1 viên", "2 viên", "3 giọt", "5 ml"];
const QUICK_INSTRUCTIONS = [
  "Uống 2 lần/ngày (sáng - tối) sau bữa ăn",
  "Uống 1 lần/ngày vào buổi sáng",
  "Nhỏ 2 lần/ngày sau khi vệ sinh sạch",
  "Bôi mỏng vùng da tổn thương 2 lần/ngày",
];

interface RxMedicationLinesTableProps {
  pet?: ExpertPet;
  catalog: MedicineItem[];
  lines: PrescriptionLine[];
  onAddLine: () => void;
  onRemoveLine: (idx: number) => void;
  onUpdateLine: (idx: number, patch: Partial<PrescriptionLine>) => void;
}

export function RxMedicationLinesTable({
  pet,
  catalog,
  lines,
  onAddLine,
  onRemoveLine,
  onUpdateLine,
}: RxMedicationLinesTableProps) {
  return (
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
          const selectedMed = catalog.find((m) => m.id === line.medicineId);
          const isSpeciesMismatch =
            pet && selectedMed && !selectedMed.speciesHint.includes(pet.species);

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                isSpeciesMismatch
                  ? "border-amber-400 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/20"
                  : "border-[#EBCFC6] dark:border-[#6E2E40] bg-[#FFF4E8]/45 dark:bg-[#2A0C14]/50"
              }`}
            >
              {/* Row 1: Number + Select Medicine + Delete */}
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
                        .map((sp) => PET_SPECIES_LABELS[sp])
                        .join(", ")}
                    </strong>
                    , còn bệnh nhân hiện tại là{" "}
                    <strong>{PET_SPECIES_LABELS[pet.species]}</strong>.
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
                        days: Math.max(1, parseInt(e.target.value, 10) || 1),
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
                      onClick={() => onUpdateLine(idx, { instruction: inst })}
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
  );
}

