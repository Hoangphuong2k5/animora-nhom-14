"use client";

import React from "react";
import {
  CheckCircle2,
  FileCheck2,
  Lock,
  Pill,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  DiseaseSeverity,
  ExpertPet,
  ExpertPetOwner,
  ExpertProfile,
  PrescriptionLine,
} from "@/types/expert.type";
import { MEDICINE_CATALOG } from "@/data/medicineCatalog";
import { formatExpertDisplayName } from "@/data/expertPortalData";

interface LivePrescriptionPreviewSidebarProps {
  profile: ExpertProfile;
  pet?: ExpertPet;
  owner?: ExpertPetOwner | null;
  diagnosis: string;
  severity: DiseaseSeverity;
  refillsAllowed: number;
  lines: PrescriptionLine[];
  note: string;
  loading: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export function LivePrescriptionPreviewSidebar({
  profile,
  pet,
  owner,
  diagnosis,
  severity,
  refillsAllowed,
  lines,
  note,
  loading,
  onSubmit,
  onCancel,
}: LivePrescriptionPreviewSidebarProps) {
  const estimatedTotal = lines.reduce((sum, l) => {
    const med = MEDICINE_CATALOG.find((m) => m.id === l.medicineId);
    return sum + (med ? med.price : 0);
  }, 0);

  const doctorDisplayName = formatExpertDisplayName(
    profile.fullName,
    profile.expertType
  );
  const licenseNumber = profile.licenseNumber || "CCHN-TY-2019-0842";

  return (
    <div className="p-5 rounded-3xl border-2 border-[#6B1F2E]/25 dark:border-[#FF7F6B]/30 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#6B1F2E] text-white flex items-center justify-center shrink-0">
            <FileCheck2 className="w-4 h-4 text-[#FF7F6B]" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
              Tờ Đơn Thuốc Điện Tử (Live Rx)
            </h3>
            <p className="text-[10px] text-zinc-500">
              Xem trước thông tin trước khi ký số phát hành
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#6B1F2E]/10 dark:bg-[#FF7F6B]/20 text-[#6B1F2E] dark:text-[#FF7F6B]">
          Rx Điện Tử
        </span>
      </div>

      {/* Patient & Severity Summary */}
      <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 space-y-2.5 text-xs">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] text-zinc-400 font-semibold">Bệnh nhân:</div>
            <div className="font-extrabold text-zinc-900 dark:text-zinc-100">
              {pet ? `${pet.name} (${pet.weightKg}kg)` : "Chưa chọn thú cưng"}
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-extrabold text-[10px] ${
              severity === "mild"
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                : "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300"
            }`}
          >
            {severity === "mild" ? (
              <>
                <RefreshCw className="w-3 h-3" />
                <span>Mua lại: {refillsAllowed} lượt</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" />
                <span>Khóa mua lại (0 lượt)</span>
              </>
            )}
          </span>
        </div>

        {owner && (
          <div className="text-[11px] text-zinc-500">
            Chủ nuôi: <strong className="text-zinc-700 dark:text-zinc-300">{owner.fullName}</strong> • {owner.phone}
          </div>
        )}

        <div className="pt-2 border-t border-zinc-200/70 dark:border-zinc-800">
          <div className="text-[10px] text-zinc-400 font-semibold">Chẩn đoán lâm sàng:</div>
          <div
            className={`font-extrabold mt-0.5 ${
              diagnosis.trim()
                ? "text-zinc-900 dark:text-zinc-100"
                : "text-zinc-400 italic font-normal"
            }`}
          >
            {diagnosis.trim() || "Chưa nhập chẩn đoán xác định..."}
          </div>
        </div>

        {note.trim() && (
          <div className="text-[11px] text-zinc-600 dark:text-zinc-400 italic pt-1 border-t border-zinc-200/50 dark:border-zinc-800">
            Lời dặn: &ldquo;{note.trim()}&rdquo;
          </div>
        )}
      </div>

      {/* Prescribed Medicines Summary */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500">
          <span>Danh mục thuốc ({lines.length} loại)</span>
          <span>Đơn giá tham khảo</span>
        </div>

        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {lines.map((line, i) => {
            const med = MEDICINE_CATALOG.find((m) => m.id === line.medicineId);
            return (
              <div
                key={i}
                className="p-2.5 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/70 flex items-start justify-between gap-2 text-xs"
              >
                <div className="min-w-0">
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                    <Pill className="w-3 h-3 text-[#6B1F2E] dark:text-[#FF7F6B] shrink-0" />
                    <span className="truncate">{med?.name}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    Liều: <strong>{line.dosage || "..."}</strong> ×{" "}
                    <strong>{line.days} ngày</strong>
                  </div>
                  {line.instruction && (
                    <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                      {line.instruction}
                    </div>
                  )}
                </div>
                <span className="font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B] shrink-0 text-[11px]">
                  {med?.price.toLocaleString("vi-VN")}đ
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2.5 border-t border-zinc-200 dark:border-zinc-800 text-xs">
          <span className="font-bold text-zinc-600 dark:text-zinc-300">
            Tổng tạm tính (1 liệu trình):
          </span>
          <span className="text-base font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
            {estimatedTotal.toLocaleString("vi-VN")} VND
          </span>
        </div>
      </div>

      {/* Digital Signature & Vet License Stamp */}
      <div className="p-3 rounded-2xl bg-[#6B1F2E]/5 dark:bg-[#FF7F6B]/10 border border-[#6B1F2E]/20 dark:border-[#FF7F6B]/20 space-y-1 text-[11px]">
        <div className="flex items-center justify-between font-bold text-[#6B1F2E] dark:text-[#FF7F6B]">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Chữ ký số Bác sĩ thú y
          </span>
          <span className="font-mono text-[10px]">{licenseNumber}</span>
        </div>
        <div className="text-zinc-600 dark:text-zinc-300">
          Người kê đơn: <strong>{doctorDisplayName}</strong>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="w-full py-3 px-4 rounded-2xl text-xs font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {loading
              ? "Đang ký số & phát hành đơn..."
              : "Xác nhận & Ký phát hành đơn thuốc"}
          </span>
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          Hủy & Quay lại danh sách đơn thuốc
        </button>
      </div>
    </div>
  );
}

