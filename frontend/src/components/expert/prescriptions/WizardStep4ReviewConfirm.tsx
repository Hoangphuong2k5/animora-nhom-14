"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";
import { DiseaseSeverity, ExpertPet, ExpertPetOwner, PrescriptionLine } from "@/types/expert.type";
import { useExpert } from "@/components/expert/ExpertProvider";
import { useLivePrescriptionCatalog } from "@/hooks/expert/useLivePrescriptionCatalog";

interface WizardStep4ReviewConfirmProps {
  pet: ExpertPet | undefined;
  owner: ExpertPetOwner | null | undefined;
  diagnosis: string;
  severity: DiseaseSeverity;
  refillsAllowed: number;
  lines: PrescriptionLine[];
  note: string;
}

export function WizardStep4ReviewConfirm({
  pet,
  owner,
  diagnosis,
  severity,
  refillsAllowed,
  lines,
  note,
}: WizardStep4ReviewConfirmProps) {
  const { profile } = useExpert();
  const catalog = useLivePrescriptionCatalog(profile.id);
  const estimatedTotal = lines.reduce((sum, l) => {
    const med = catalog.find((m) => m.id === l.medicineId);
    const units = Math.max(1, Math.ceil((l.days || 1) / 7));
    return sum + (med ? med.price * units : 0);
  }, 0);

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className="p-4 rounded-2xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-card space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-border pb-2">
          <div>
            <div className="font-extrabold text-sm text-zinc-900 dark:text-foreground">
              Bệnh nhân: {pet?.name} ({pet?.breed})
            </div>
            <div className="text-[11px] text-zinc-500">
              Chủ nuôi: {owner?.fullName} • SĐT: {owner?.phone}
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full font-bold text-xs ${
              severity === "mild"
                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                : "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
            }`}
          >
            {severity === "mild"
              ? `Bệnh nhẹ (${refillsAllowed} lần mua lại)`
              : "Bệnh nặng (Khóa mua lại)"}
          </span>
        </div>

        <div>
          <div className="text-[11px] text-zinc-400">Chẩn đoán:</div>
          <div className="font-extrabold text-xs text-zinc-800 dark:text-foreground/90">
            {diagnosis}
          </div>
        </div>

        {note && (
          <div className="text-[11px] text-zinc-500 italic">
            Lời dặn: &ldquo;{note}&rdquo;
          </div>
        )}

        <div className="space-y-1.5 pt-2 border-t border-zinc-200/80 dark:border-border">
          <div className="text-[11px] font-bold text-zinc-400">
            Thuốc chỉ định ({lines.length}):
          </div>
          {lines.map((l, i) => {
            const med = catalog.find((m) => m.id === l.medicineId);
            return (
              <div
                key={i}
                className="flex items-center justify-between text-[11px] bg-white dark:bg-muted p-2 rounded-xl"
              >
                <div>
                  <span className="font-bold">{med?.name}</span>
                  <span className="text-zinc-400 ml-1.5">
                    ({l.dosage} x {l.days} ngày)
                  </span>
                </div>
                <span className="font-bold text-[#6B1F2E] dark:text-[#FF7F6B]">
                  {med?.price.toLocaleString("vi-VN")}đ
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-border font-bold">
          <span>Ước tính giá trị đơn thuốc:</span>
          <span className="text-base text-[#6B1F2E] dark:text-[#FF7F6B]">
            {estimatedTotal.toLocaleString("vi-VN")} VND
          </span>
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-[#6B1F2E]/5 dark:bg-[#FF7F6B]/10 border border-[#6B1F2E]/20 text-[11px] text-zinc-600 dark:text-foreground/80 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-[#6B1F2E] dark:text-[#FF7F6B] shrink-0 mt-0.5" />
        <span>
          Bác sĩ chịu trách nhiệm chuyên môn về tính an toàn của đơn thuốc. Hệ thống sẽ ký số chứng
          chỉ hành nghề tự động khi bấm &quot;Xác nhận & Ký phát hành&quot;.
        </span>
      </div>
    </div>
  );
}

