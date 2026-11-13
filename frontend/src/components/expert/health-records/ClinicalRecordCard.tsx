"use client";

import React from "react";
import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { MedicalRecord } from "@/types/expert.type";
import { VetOnly } from "@/components/expert/VetOnly";
import { ROUTES } from "@/constants/config.constant";

interface ClinicalRecordCardProps {
  records: MedicalRecord[];
}

export function ClinicalRecordCard({ records }: ClinicalRecordCardProps) {
  return (
    <VetOnly>
      <div className="rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-[#6B1F2E] dark:text-[#FF7F6B]" />
            <h3 className="font-heading font-extrabold text-sm text-zinc-900 dark:text-foreground">
              Bệnh Án Lâm Sàng [Bác sĩ Thú Y] ({records.length})
            </h3>
          </div>
          <Link
            href={ROUTES.EXPERT_PRESCRIPTIONS}
            className="text-xs font-bold text-[#6B1F2E] dark:text-[#FF7F6B] hover:underline"
          >
            Xem đơn thuốc liên quan →
          </Link>
        </div>

        {records.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-400">
            Bé chưa có bản ghi khám bệnh lâm sàng nào được lưu.
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-2xl border border-zinc-200/80 dark:border-border bg-zinc-50/50 dark:bg-muted/50 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-zinc-900 dark:text-foreground text-sm">
                      {rec.diagnosis}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        rec.severity === "mild"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                      }`}
                    >
                      {rec.severity === "mild" ? "Mức độ nhẹ" : "Mức độ nặng (Cần khám lại)"}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-medium">{rec.date}</span>
                </div>

                <div className="text-zinc-600 dark:text-foreground/80">
                  <strong>Triệu chứng:</strong> {rec.symptoms}
                </div>

                <div className="flex items-center gap-4 text-[11px] text-zinc-500 pt-1">
                  <span>
                    Cân nặng: <strong>{rec.weightKg} kg</strong>
                  </span>
                  <span>
                    Thân nhiệt: <strong>{rec.temperatureC}°C</strong>
                  </span>
                  {rec.revisitDate && (
                    <span className="text-[#6B1F2E] dark:text-[#FF7F6B] font-bold">
                      Hẹn tái khám: {rec.revisitDate}
                    </span>
                  )}
                </div>

                {rec.note && (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-card text-[11px] text-zinc-600 dark:text-foreground/80 border border-zinc-100 dark:border-border">
                    <strong>Chỉ định:</strong> {rec.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </VetOnly>
  );
}

