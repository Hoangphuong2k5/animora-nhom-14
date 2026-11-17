"use client";

import React from "react";
import {
  AlertTriangle,
  PackageCheck,
  Pill,
  Plus,
  Trash2,
} from "lucide-react";
import {
  ExpertPet,
  PetSpeciesCode,
  PrescriptionLine,
} from "@/types/expert.type";
import { useExpert } from "@/components/expert/ExpertProvider";
import { useLivePrescriptionCatalog } from "@/hooks/expert/useLivePrescriptionCatalog";

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
  "Bôi mỏng lên vùng da tổn thương 2 lần/ngày",
];

interface MedicineBuilderCardProps {
  lines: PrescriptionLine[];
  selectedPet?: ExpertPet;
  onAddLine: () => void;
  onRemoveLine: (idx: number) => void;
  onUpdateLine: (idx: number, patch: Partial<PrescriptionLine>) => void;
}

export function MedicineBuilderCard({
  lines,
  selectedPet,
  onAddLine,
  onRemoveLine,
  onUpdateLine,
}: MedicineBuilderCardProps) {
  const { profile } = useExpert();
  const catalog = useLivePrescriptionCatalog(profile.id);
  return (
    <div className="p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-xs space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-xl bg-[#6B1F2E] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
            3
          </span>
          <div>
            <h2 className="font-heading font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              Danh Mục Thuốc Chỉ Định Từ Kho Dược Animora ({lines.length})
            </h2>
            <p className="text-[11px] text-zinc-500">
              Chọn dược phẩm Rx nội bộ, đối chiếu loài & cân nặng của bé để kê liều lượng chính xác.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddLine}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-[#FF7F6B]" />
          <span>Thêm dòng thuốc</span>
        </button>
      </div>

      {/* Medicine Lines List */}
      <div className="space-y-3.5">
        {lines.map((line, idx) => {
          const selectedMed = catalog.find(
            (m) => m.id === line.medicineId
          );
          const isSpeciesMismatch =
            selectedPet &&
            selectedMed &&
            !selectedMed.speciesHint.includes(selectedPet.species);

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                isSpeciesMismatch
                  ? "border-amber-400 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/15"
                  : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50"
              }`}
            >
              {/* Top Row: Badge + Stock/Price Info + Remove Button */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-[#6B1F2E]/10 dark:bg-[#FF7F6B]/20 text-[#6B1F2E] dark:text-[#FF7F6B]">
                    <Pill className="w-3 h-3" />
                    Thuốc #{idx + 1}
                  </span>
                  {selectedMed && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      <PackageCheck className="w-3.5 h-3.5" />
                      Tồn kho: {selectedMed.stock} {selectedMed.unit} •{" "}
                      {selectedMed.price.toLocaleString("vi-VN")}đ/{selectedMed.unit}
                    </span>
                  )}
                </div>

                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveLine(idx)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Xóa dòng thuốc này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa</span>
                  </button>
                )}
              </div>

              {/* Medicine Select */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block">
                  Tên dược phẩm (Kho Rx nội bộ Animora)
                </label>
                <select
                  value={line.medicineId}
                  onChange={(e) =>
                    onUpdateLine(idx, { medicineId: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-900 dark:text-zinc-100 outline-none focus:border-[#6B1F2E] cursor-pointer"
                >
                  {catalog.map((m) => {
                    const speciesText = m.speciesHint
                      .map((sp) => SPECIES_LABELS[sp])
                      .join(", ");
                    return (
                      <option key={m.id} value={m.id}>
                        {m.name} — {m.activeIngredient} ({m.price.toLocaleString("vi-VN")}đ/{m.unit} | Loài: {speciesText})
                      </option>
                    );
                  })}
                </select>

                {selectedMed && (
                  <div className="flex items-center justify-between flex-wrap gap-2 text-[11px] text-zinc-500">
                    <span>
                      Dạng bào chế: <strong>{selectedMed.form}</strong> • Hoạt chất:{" "}
                      <strong>{selectedMed.activeIngredient}</strong>
                    </span>
                    <span>
                      Chỉ định loài:{" "}
                      <strong>
                        {selectedMed.speciesHint
                          .map((sp) => SPECIES_LABELS[sp])
                          .join(", ")}
                      </strong>
                    </span>
                  </div>
                )}

                {/* Species mismatch clinical warning */}
                {isSpeciesMismatch && selectedPet && selectedMed && (
                  <div className="p-2.5 rounded-xl bg-amber-100/80 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-[11px] flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Cảnh báo tương thích loài:</strong> Dược phẩm{" "}
                      <em>{selectedMed.name}</em> được khuyến cáo cho{" "}
                      <strong>
                        {selectedMed.speciesHint
                          .map((sp) => SPECIES_LABELS[sp])
                          .join(", ")}
                      </strong>
                      , trong khi bệnh nhân <strong>{selectedPet.name}</strong> là{" "}
                      <strong>{SPECIES_LABELS[selectedPet.species]}</strong>. Vui lòng kiểm tra kỹ chống chỉ định trước khi kê!
                    </span>
                  </div>
                )}
              </div>

              {/* Dosage & Days */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block">
                    Liều dùng mỗi lần <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={line.dosage}
                    onChange={(e) =>
                      onUpdateLine(idx, { dosage: e.target.value })
                    }
                    placeholder="VD: 1 viên, 1/2 viên, 3 giọt..."
                    className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-900 dark:text-zinc-100 outline-none focus:border-[#6B1F2E]"
                  />
                  <div className="flex items-center gap-1 flex-wrap">
                    {QUICK_DOSAGES.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => onUpdateLine(idx, { dosage: d })}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-[#6B1F2E] hover:text-white transition-colors cursor-pointer"
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block">
                    Số ngày điều trị <span className="text-rose-500">*</span>
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
                    className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-900 dark:text-zinc-100 outline-none focus:border-[#6B1F2E]"
                  />
                  <div className="flex items-center gap-1 flex-wrap">
                    {[3, 5, 7, 10, 14].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => onUpdateLine(idx, { days: d })}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                          line.days === d
                            ? "bg-[#6B1F2E] text-white"
                            : "bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-[#6B1F2E] hover:text-white"
                        }`}
                      >
                        {d} ngày
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detailed Instruction */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block">
                  Hướng dẫn sử dụng chi tiết <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={line.instruction}
                  onChange={(e) =>
                    onUpdateLine(idx, { instruction: e.target.value })
                  }
                  placeholder="VD: Uống 2 lần/ngày sau bữa ăn..."
                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-[#6B1F2E]"
                />
                <div className="flex items-center gap-1 flex-wrap">
                  {QUICK_INSTRUCTIONS.map((inst) => (
                    <button
                      key={inst}
                      type="button"
                      onClick={() => onUpdateLine(idx, { instruction: inst })}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-[#6B1F2E] hover:text-white transition-colors cursor-pointer"
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

