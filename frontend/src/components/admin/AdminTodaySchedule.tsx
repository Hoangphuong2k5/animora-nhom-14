"use client";

import React, { useState } from "react";
import { Clock, CheckCircle2, Play, User, Phone, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface TodayAppointment {
  id: string;
  time: string;
  period: "morning" | "afternoon";
  petName: string;
  petType: "Chó" | "Mèo";
  ownerName: string;
  phone: string;
  service: string;
  staff: string;
  status: "waiting" | "in_progress" | "completed";
}

const INITIAL_TODAY_SLOTS: TodayAppointment[] = [
  {
    id: "today-1",
    time: "08:30",
    period: "morning",
    petName: "Mochi (Corgi)",
    petType: "Chó",
    ownerName: "Phan Thị Đinh Thùy",
    phone: "0337203332",
    service: "Spa & Tắm sấy thảo mộc",
    staff: "Bác sĩ Lan Anh",
    status: "completed",
  },
  {
    id: "today-2",
    time: "10:00",
    period: "morning",
    petName: "Bông (Mèo Anh)",
    petType: "Mèo",
    ownerName: "Nguyễn Minh Anh",
    phone: "0901234567",
    service: "Khám tổng quát & Tiêm phòng",
    staff: "Bác sĩ Minh Tuấn",
    status: "in_progress",
  },
  {
    id: "today-3",
    time: "14:00",
    period: "afternoon",
    petName: "Lu (Golden)",
    petType: "Chó",
    ownerName: "Hoàng Văn Tuấn",
    phone: "0912345678",
    service: "Cắt tỉa tạo kiểu lông VIP",
    staff: "Groomer Tiến Dũng",
    status: "waiting",
  },
  {
    id: "today-4",
    time: "16:30",
    period: "afternoon",
    petName: "Mimi (Mèo Ba Tư)",
    petType: "Mèo",
    ownerName: "Trần Thị Mai",
    phone: "0988776655",
    service: "Vệ sinh răng miệng & Tai",
    staff: "Bác sĩ Lan Anh",
    status: "waiting",
  },
];

export function AdminTodaySchedule() {
  const [appointments, setAppointments] = useState<TodayAppointment[]>(INITIAL_TODAY_SLOTS);

  const handleUpdateStatus = (id: string, nextStatus: "in_progress" | "completed") => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: nextStatus } : a))
    );
    toast.success(
      nextStatus === "in_progress"
        ? "Đã bắt đầu ca chăm sóc bé cưng!"
        : "Đã hoàn thành ca chăm sóc!"
    );
  };

  const completedCount = appointments.filter((a) => a.status === "completed").length;

  return (
    <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#6B1F2E] dark:text-[#FF7F6B]" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-foreground">
              Lịch Trình Ca Chăm Sóc Hôm Nay
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Phân bổ bác sĩ và tình trạng tiếp nhận bé cưng tại phòng khám
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
          Đã xong: {completedCount}/{appointments.length} ca
        </span>
      </div>

      <div className="space-y-3">
        {appointments.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              item.status === "in_progress"
                ? "bg-[#FF7F6B]/5 border-[#FF7F6B]/30 dark:bg-[#FF7F6B]/10"
                : item.status === "completed"
                ? "bg-zinc-50 dark:bg-muted/40 border-zinc-200/60 dark:border-border opacity-80"
                : "bg-white dark:bg-card border-zinc-200/80 dark:border-border"
            }`}
          >
            {/* Left: Time & Pet Info */}
            <div className="flex items-start gap-3.5">
              <div className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-muted font-mono font-bold text-xs text-zinc-800 dark:text-foreground/90 shrink-0">
                <span>{item.time}</span>
                <span className="text-[9px] font-sans text-zinc-400 uppercase font-semibold">
                  {item.period === "morning" ? "Sáng" : "Chiều"}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-zinc-900 dark:text-foreground">
                    {item.petName}
                  </span>
                  <span className="text-xs">{item.petType === "Chó" ? "🐶" : "🐱"}</span>
                  {item.status === "in_progress" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF7F6B] text-white animate-pulse">
                      <Sparkles className="w-2.5 h-2.5" /> Đang phục vụ
                    </span>
                  )}
                </div>

                <div className="text-xs text-zinc-600 dark:text-foreground/80 font-medium mt-0.5">
                  {item.service}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-400 mt-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" /> {item.ownerName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {item.phone}
                  </span>
                  <span className="text-zinc-400">• Phụ trách: {item.staff}</span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              {item.status === "waiting" && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(item.id, "in_progress")}
                  className="px-3 py-1.5 rounded-xl bg-[#6B1F2E] text-white hover:bg-[#8C2B3E] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Tiếp nhận</span>
                </button>
              )}

              {item.status === "in_progress" && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(item.id, "completed")}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Hoàn tất ca</span>
                </button>
              )}

              {item.status === "completed" && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đã xong
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

