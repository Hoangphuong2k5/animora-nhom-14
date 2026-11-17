"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface RejectFormProps {
  reason: string;
  onReasonChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isVet?: boolean;
}

export function RejectForm({
  reason,
  onReasonChange,
  onConfirm,
  onCancel,
  isVet = false,
}: RejectFormProps) {
  const quickReasons = isVet
    ? [
        "Đang xử lý ca cấp cứu / phẫu thuật kéo dài, nhờ Quản lý điều phối BS khác",
        "Thiết bị khám chuyên sâu đang bảo trì đột xuất",
        "Trùng lịch hội chẩn nội viện khẩn cấp",
      ]
    : [
        "Ca Spa trước phát sinh gỡ rối lông nặng kéo dài, nhờ Quản lý điều phối CV khác",
        "Sức khỏe cá nhân đột xuất không đảm bảo phục vụ",
        "Bồn tắm / máy sấy chuyên dụng đang bảo trì",
      ];

  return (
    <div className="space-y-2.5 text-xs p-3 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/25">
      <div className="flex items-start gap-2 text-[11px] text-amber-900 dark:text-amber-200 leading-snug">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold">Quy định vận hành Animora:</span>{" "}
          {isVet ? "Bác sĩ" : "Chuyên viên"} không đơn phương hủy lịch của khách. Yêu cầu sẽ được gửi tới{" "}
          <strong>Manager</strong> để chuyển ca cho nhân sự khác hoặc duyệt hủy.
        </div>
      </div>

      {/* Quick preset reason chips */}
      <div className="flex flex-wrap gap-1">
        {quickReasons.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onReasonChange(preset)}
            className="px-2 py-1 rounded-lg text-[10px] font-medium bg-white dark:bg-card border border-amber-200/80 dark:border-amber-800/60 text-zinc-700 dark:text-foreground/80 hover:border-amber-500 transition-colors cursor-pointer text-left"
          >
            + {preset.slice(0, 48)}...
          </button>
        ))}
      </div>

      <Textarea
        value={reason}
        onChange={(e) => onReasonChange(e.target.value)}
        placeholder="Nhập lý do cụ thể Gửi Manager duyệt điều phối / hủy ca..."
        className="w-full p-2.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-card text-zinc-900 dark:text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40"
        rows={2}
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!reason.trim()}
          onClick={onConfirm}
          className="flex-1 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Gửi yêu cầu lên Quản lý duyệt
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-3 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-muted cursor-pointer"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}

interface ProposeTimeFormProps {
  dateTime: string;
  onDateTimeChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ProposeTimeForm({
  dateTime,
  onDateTimeChange,
  onConfirm,
  onCancel,
}: ProposeTimeFormProps) {
  return (
    <div className="space-y-2 text-xs">
      <label className="block text-[11px] font-semibold text-zinc-500">
        Chọn giờ đề xuất mới cho khách:
      </label>
      <input
        type="datetime-local"
        value={dateTime}
        onChange={(e) => onDateTimeChange(e.target.value)}
        className="w-full p-2 rounded-xl border border-zinc-300 dark:border-border bg-white dark:bg-card"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] transition-colors cursor-pointer"
        >
          Gửi đề xuất
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-3 rounded-xl text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-muted cursor-pointer"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}

interface CompleteSlotFormProps {
  completionNote: string;
  onNoteChange: (v: string) => void;
  petCondition: string;
  onConditionChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isVet?: boolean;
}

export function CompleteSlotForm({
  completionNote,
  onNoteChange,
  petCondition,
  onConditionChange,
  onConfirm,
  onCancel,
  isVet = false,
}: CompleteSlotFormProps) {
  return (
    <div className="space-y-2 text-xs">
      <div className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
        {isVet
          ? "Xác nhận bàn giao & đóng ca khám (bệnh án chi tiết lưu ở Bước 1):"
          : "Ghi nhận kết quả dịch vụ & tình trạng thú cưng trước khi bàn giao:"}
      </div>
      <Textarea
        value={completionNote}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder={
          isVet
            ? "Ghi chú bàn giao nhanh cho quầy lễ tân / chủ nuôi (tùy chọn)..."
            : "Ghi chú kết quả thực hiện dịch vụ (đã tắm sạch, cắt tỉa gọn...)"
        }
        className="w-full p-2 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card text-xs"
        rows={2}
      />
      <input
        type="text"
        value={petCondition}
        onChange={(e) => onConditionChange(e.target.value)}
        placeholder="Tình trạng thú cưng khi bàn giao (tỉnh táo, vui vẻ, ổn định...)"
        className="w-full p-2 rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
        >
          {isVet ? "Xác nhận đóng ca khám" : "Lưu & Hoàn tất dịch vụ"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-3 rounded-xl text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}
