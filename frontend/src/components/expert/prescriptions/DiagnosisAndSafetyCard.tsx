"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, Lock, RefreshCw } from "lucide-react";
import { DiseaseSeverity } from "@/types/expert.type";

const COMMON_DIAGNOSIS_SUGGESTIONS = [
  "Viêm tai ngoài cấp tính do nấm men Malassezia",
  "Viêm da dị ứng bội nhiễm vi khuẩn",
  "Rối loạn tiêu hóa & loạn khuẩn đường ruột",
  "Viêm kết mạc mắt cấp tính",
  "Nhiễm ký sinh trùng nội/ngoại (Ve, bọ chét, giun sán)",
];

interface DiagnosisAndSafetyCardProps {
  diagnosis: string;
  onChangeDiagnosis: (d: string) => void;
  severity: DiseaseSeverity;
  onChangeSeverity: (s: DiseaseSeverity) => void;
  refillsAllowed: number;
  onChangeRefills: (r: number) => void;
  note: string;
  onChangeNote: (n: string) => void;
}

export function DiagnosisAndSafetyCard({
  diagnosis,
  onChangeDiagnosis,
  severity,
  onChangeSeverity,
  refillsAllowed,
  onChangeRefills,
  note,
  onChangeNote,
}: DiagnosisAndSafetyCardProps) {
  return (
    <div className="p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-xs space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <span className="w-7 h-7 rounded-xl bg-[#6B1F2E] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
          2
        </span>
        <div>
          <h2 className="font-heading font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
            Chẩn Đoán Lâm Sàng & Quy Chuẩn Mua Lại (Refill Safety)
          </h2>
          <p className="text-[11px] text-zinc-500">
            Phân loại mức độ bệnh để hệ thống tự động cấp hoặc khóa quyền mua lại đơn thuốc trực tuyến của khách.
          </p>
        </div>
      </div>

      {/* Diagnosis Input + Quick Suggestions */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
          Chẩn đoán xác định bệnh <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={diagnosis}
          onChange={(e) => onChangeDiagnosis(e.target.value)}
          placeholder="VD: Viêm tai ngoài cấp tính do nấm men Malassezia..."
          className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-semibold text-zinc-900 dark:text-zinc-100 outline-none focus:border-[#6B1F2E] dark:focus:border-[#FF7F6B]"
        />
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] font-bold text-zinc-400">Gợi ý nhanh:</span>
          {COMMON_DIAGNOSIS_SUGGESTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onChangeDiagnosis(item)}
              className="px-2 py-0.5 rounded-lg text-[10px] font-semibold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:border-[#6B1F2E] hover:text-[#6B1F2E] dark:hover:text-[#FF7F6B] transition-colors cursor-pointer"
            >
              + {item}
            </button>
          ))}
        </div>
      </div>

      {/* Severity & Refill Rules */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
          Mức độ bệnh tật & Quyền mua lại trực tuyến <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Mild */}
          <div
            onClick={() => {
              onChangeSeverity("mild");
              if (refillsAllowed === 0) onChangeRefills(1);
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
              severity === "mild"
                ? "border-amber-500 bg-amber-50/80 dark:bg-amber-950/25 shadow-xs"
                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 bg-zinc-50/40 dark:bg-zinc-950/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-extrabold text-xs text-amber-800 dark:text-amber-300">
                <RefreshCw className="w-3.5 h-3.5" />
                Bệnh nhẹ / Điều trị duy trì
              </span>
              {severity === "mild" && (
                <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Cho phép khách tự đặt mua lại đơn thuốc từ <strong>1 – 3 lượt</strong> trên Animora Shop trước khi cần tái khám.
            </p>
          </div>

          {/* Severe */}
          <div
            onClick={() => {
              onChangeSeverity("severe");
              onChangeRefills(0);
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
              severity === "severe"
                ? "border-rose-500 bg-rose-50/80 dark:bg-rose-950/25 shadow-xs"
                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 bg-zinc-50/40 dark:bg-zinc-950/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-extrabold text-xs text-rose-800 dark:text-rose-300">
                <Lock className="w-3.5 h-3.5" />
                Bệnh nặng / Cấp tính
              </span>
              {severity === "severe" && (
                <CheckCircle2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              )}
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Tự động <strong>khóa mua lại (0 lượt)</strong>. Khách bắt buộc phải đưa thú cưng tái khám trực tiếp.
            </p>
          </div>
        </div>
      </div>

      {/* Refill Count Selector or Locked Notice */}
      {severity === "mild" ? (
        <div className="p-3.5 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/15 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Số lượt cho phép mua lại trực tuyến:
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => onChangeRefills(count)}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    refillsAllowed === count
                      ? "bg-[#6B1F2E] text-white shadow-xs"
                      : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-[#6B1F2E]"
                  }`}
                >
                  {count} lượt {count === 1 ? "(Khuyên dùng)" : ""}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-amber-800 dark:text-amber-300">
            Khi khách sử dụng hết <strong>{refillsAllowed} lượt</strong> mua lại, hệ thống sẽ tự động chuyển trạng thái đơn sang <em>Hết lượt</em> và nhắc khách đặt lịch tái khám.
          </p>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            <strong>Quy định an toàn dược Animora:</strong> Ca bệnh nặng được khóa cố định ở mức <strong>0 lượt mua lại trực tuyến</strong> để tránh việc chủ nuôi tự ý dùng lại kháng sinh/thuốc đặc trị khi chưa đánh giá lại lâm sàng.
          </span>
        </div>
      )}

      {/* Doctor Note */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
          Chỉ định chăm sóc & Lời dặn của Bác sĩ
        </label>
        <textarea
          rows={2}
          value={note}
          onChange={(e) => onChangeNote(e.target.value)}
          placeholder="VD: Vệ sinh sạch hốc tai bằng nước muối sinh lý trước khi nhỏ thuốc 15 phút. Đeo loa chống liếm trong 5 ngày đầu..."
          className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-800 dark:text-zinc-200 outline-none focus:border-[#6B1F2E] dark:focus:border-[#FF7F6B]"
        />
      </div>
    </div>
  );
}

