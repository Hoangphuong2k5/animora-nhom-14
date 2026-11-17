"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { PrescriptionLine } from "@/types/expert.type";
import { useExpert } from "@/components/expert/ExpertProvider";
import { useLivePrescriptionCatalog } from "@/hooks/expert/useLivePrescriptionCatalog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WizardStep3MedicineLinesProps {
  lines: PrescriptionLine[];
  onAddLine: () => void;
  onRemoveLine: (idx: number) => void;
  onUpdateLine: (idx: number, patch: Partial<PrescriptionLine>) => void;
}

export function WizardStep3MedicineLines({
  lines,
  onAddLine,
  onRemoveLine,
  onUpdateLine,
}: WizardStep3MedicineLinesProps) {
  const { profile } = useExpert();
  const catalog = useLivePrescriptionCatalog(profile.id);
  const medicineItems: Record<string, string> = Object.fromEntries(
    catalog.map((m) => [
      m.id,
      `${m.name} - ${m.activeIngredient} (${m.price.toLocaleString("vi-VN")}đ/${m.unit})`,
    ])
  );
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="font-bold text-zinc-700 dark:text-foreground/80">
          Danh mục thuốc chỉ định từ kho Animora ({lines.length})
        </label>
        <button
          type="button"
          onClick={onAddLine}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-[#FF7F6B]" />
          <span>Thêm loại thuốc</span>
        </button>
      </div>

      <div className="space-y-3 max-h-60 overflow-y-auto p-1">
        {lines.map((l, idx) => {
          const selectedMed = catalog.find((m) => m.id === l.medicineId);

          return (
            <div
              key={idx}
              className="p-3.5 rounded-2xl border border-zinc-200 dark:border-border bg-zinc-50/50 dark:bg-card/50 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                  Thuốc #{idx + 1}
                </span>
                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveLine(idx)}
                    className="p-1 text-zinc-400 hover:text-rose-500 cursor-pointer"
                    title="Xóa dòng thuốc này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Medicine Select */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-500">
                  Tên dược phẩm (Kho nội bộ)
                </label>
                <Select
                  value={l.medicineId}
                  onValueChange={(val) => {
                    if (val !== null) onUpdateLine(idx, { medicineId: val });
                  }}
                  items={medicineItems}
                >
                  <SelectTrigger className="w-full h-9! px-3 rounded-xl border-zinc-200 dark:border-border bg-white dark:bg-card text-xs font-bold text-zinc-800 dark:text-foreground/90 cursor-pointer">
                    <SelectValue placeholder="-- Chọn dược phẩm --" />
                  </SelectTrigger>
                  <SelectContent>
                    {catalog.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} - {m.activeIngredient} ({m.price.toLocaleString("vi-VN")}đ/{m.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedMed && (
                  <div className="text-[10px] text-zinc-500 italic">
                    Dạng bào chế: {selectedMed.form} • Hoạt chất: {selectedMed.activeIngredient}
                  </div>
                )}
              </div>

              {/* Dosage & Days */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-500">Liều dùng</label>
                  <input
                    type="text"
                    value={l.dosage}
                    onChange={(e) => onUpdateLine(idx, { dosage: e.target.value })}
                    placeholder="VD: 1 viên, 2 giọt..."
                    className="w-full p-2 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-500">Số ngày uống</label>
                  <input
                    type="number"
                    min={1}
                    value={l.days}
                    onChange={(e) =>
                      onUpdateLine(idx, { days: parseInt(e.target.value) || 1 })
                    }
                    className="w-full p-2 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card"
                  />
                </div>
              </div>

              {/* Instruction */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-500">Cách dùng chi tiết</label>
                <input
                  type="text"
                  value={l.instruction}
                  onChange={(e) => onUpdateLine(idx, { instruction: e.target.value })}
                  placeholder="VD: Nhỏ 3 giọt vào hốc tai, 2 lần mỗi ngày sau ăn..."
                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
