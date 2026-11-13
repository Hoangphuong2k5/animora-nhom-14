"use client";

import React from "react";
import { AlertTriangle, Info } from "lucide-react";
import { DiseaseSeverity } from "@/types/expert.type";
import { Textarea } from "@/components/ui/textarea";

interface WizardStep2DiagnosisProps {
  diagnosis: string;
  onChangeDiagnosis: (d: string) => void;
  severity: DiseaseSeverity;
  onChangeSeverity: (s: DiseaseSeverity) => void;
  refillsAllowed: number;
  onChangeRefills: (r: number) => void;
  note: string;
  onChangeNote: (n: string) => void;
}

export function WizardStep2Diagnosis({
  diagnosis,
  onChangeDiagnosis,
  severity,
  onChangeSeverity,
  refillsAllowed,
  onChangeRefills,
  note,
  onChangeNote,
}: WizardStep2DiagnosisProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="font-bold text-zinc-700 dark:text-foreground/80">
          Chẩn đoán xác định bệnh *
        </label>
        <input
          type="text"
          value={diagnosis}
          onChange={(e) => onChangeDiagnosis(e.target.value)}
          placeholder="VD: Viêm tai ngoài cấp tính do nấm men Malassezia"
          className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-zinc-800 dark:text-foreground/90"
        />
      </div>

      <div className="space-y-1">
        <label className="font-bold text-zinc-700 dark:text-foreground/80">
          Mức độ bệnh tật & Quyền mua lại (Quy chuẩn an toàn Animora) *
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => {
              onChangeSeverity("mild");
              if (refillsAllowed === 0) onChangeRefills(1);
            }}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              severity === "mild"
                ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20 shadow-xs"
                : "border-zinc-200 dark:border-border hover:border-zinc-300"
            }`}
          >
            <div className="font-bold text-amber-800 dark:text-amber-300">Bệnh nhẹ</div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Cho phép khách mua lại trực tuyến 1 - 3 lần trước khi cần tái khám.
            </p>
          </div>

          <div
            onClick={() => {
              onChangeSeverity("severe");
              onChangeRefills(0);
            }}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              severity === "severe"
                ? "border-rose-500 bg-rose-50 dark:bg-rose-950/20 shadow-xs"
                : "border-zinc-200 dark:border-border hover:border-zinc-300"
            }`}
          >
            <div className="font-bold text-rose-800 dark:text-rose-300">Bệnh nặng</div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Khóa mua lại (0 lượt). Bắt buộc phải tái khám trực tiếp tại phòng khám.
            </p>
          </div>
        </div>
      </div>

      {severity === "mild" ? (
        <div className="space-y-1">
          <label className="font-bold text-zinc-700 dark:text-foreground/80 flex items-center justify-between">
            <span>Số lượt cho phép mua lại đơn thuốc (1 - 3 lượt)</span>
            <span className="text-[#6B1F2E] dark:text-[#FF7F6B] font-extrabold text-sm">
              {refillsAllowed} lượt
            </span>
          </label>
          <input
            type="range"
            min={1}
            max={3}
            value={refillsAllowed}
            onChange={(e) => onChangeRefills(parseInt(e.target.value) || 1)}
            className="w-full accent-[#6B1F2E] dark:accent-[#FF7F6B]"
          />
          <div className="flex justify-between text-[10px] text-zinc-400">
            <span>1 lượt (Khuyên dùng)</span>
            <span>2 lượt</span>
            <span>3 lượt (Tối đa)</span>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            Theo quy định an toàn dược: Ca bệnh nặng bị khóa 0 lượt mua lại trực tuyến.
          </span>
        </div>
      )}

      <div className="space-y-1">
        <label className="font-bold text-zinc-700 dark:text-foreground/80">
          Chỉ định / Lời dặn của bác sĩ
        </label>
        <Textarea
          rows={2}
          value={note}
          onChange={(e) => onChangeNote(e.target.value)}
          placeholder="Lưu ý vệ sinh sạch tai trước khi nhỏ thuốc, không để nước vào tai..."
          className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card text-zinc-800 dark:text-foreground/90 text-xs"
        />
      </div>
    </div>
  );
}

