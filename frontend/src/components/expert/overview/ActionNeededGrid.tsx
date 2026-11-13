"use client";

import React from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Clock,
  FileHeart,
  Pill,
  Stethoscope,
  UserCheck,
} from "lucide-react";
import { VetOnly } from "@/components/expert/VetOnly";
import { ROUTES } from "@/constants/config.constant";

interface ActionNeededGridProps {
  pendingCount: number;
  rescheduleCount: number;
  completedNoRecordCount: number;
  pendingShiftCount: number;
  exhaustedRxCount: number;
  revisitDueCount: number;
}

export function ActionNeededGrid({
  pendingCount,
  rescheduleCount,
  completedNoRecordCount,
  pendingShiftCount,
  exhaustedRxCount,
  revisitDueCount,
}: ActionNeededGridProps) {
  return (
    <div className="space-y-3">
      <h2 className="font-heading font-extrabold text-sm sm:text-base text-zinc-900 dark:text-foreground flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-[#FF7F6B]" />
        <span>Hạng Mục Cần Xử Lý Ngay</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Lịch mới chờ xác nhận */}
        <Link
          href={ROUTES.EXPERT_APPOINTMENTS}
          className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all space-y-1 block"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Chờ xác nhận
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          </div>
          <div className="text-xl font-extrabold font-heading text-amber-900 dark:text-amber-200">
            {pendingCount} lịch hẹn
          </div>
          <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
            Khách mới đặt, cần chuyên viên tiếp nhận
          </p>
        </Link>

        {/* 2. Yêu cầu đổi lịch từ khách */}
        <Link
          href={ROUTES.EXPERT_APPOINTMENTS}
          className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all space-y-1 block"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Đổi lịch hẹn
            </span>
            <Clock className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-xl font-extrabold font-heading text-blue-900 dark:text-blue-200">
            {rescheduleCount} yêu cầu
          </div>
          <p className="text-[11px] text-blue-700/80 dark:text-blue-400/80">
            Khách xin dời sang khung giờ khác
          </p>
        </Link>

        {/* 3. Ca hoàn thành chưa ghi kết quả */}
        <Link
          href={ROUTES.EXPERT_APPOINTMENTS}
          className="p-4 rounded-2xl border border-purple-200 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all space-y-1 block"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
              Chưa ghi kết quả
            </span>
            <FileHeart className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-xl font-extrabold font-heading text-purple-900 dark:text-purple-200">
            {completedNoRecordCount} ca
          </div>
          <p className="text-[11px] text-purple-700/80 dark:text-purple-400/80">
            Ca đã xong, cần cập nhật sổ sức khỏe
          </p>
        </Link>

        {/* 4. Ca hoặc nghỉ chờ Admin duyệt */}
        <Link
          href={ROUTES.EXPERT_SCHEDULE}
          className="p-4 rounded-2xl border border-zinc-200 dark:border-border bg-white dark:bg-card hover:border-zinc-300 transition-all space-y-1 block"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Đăng ký ca / Xin nghỉ
            </span>
            <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-extrabold font-heading text-zinc-900 dark:text-foreground">
            {pendingShiftCount} đơn chờ
          </div>
          <p className="text-[11px] text-zinc-400">Đang chờ Quản trị viên xét duyệt</p>
        </Link>
      </div>

      {/* [Bác sĩ] Warning: Đơn thuốc sắp hết lượt & Tái khám */}
      <VetOnly>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <Link
            href={ROUTES.EXPERT_PRESCRIPTIONS}
            className="p-3.5 rounded-2xl border border-orange-200 dark:border-orange-900/40 bg-orange-50/60 dark:bg-orange-950/20 hover:bg-orange-100/60 transition-all flex items-center justify-between"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-900 dark:text-orange-200">
                <Pill className="w-3.5 h-3.5 text-orange-600" />
                <span>[Bác sĩ] Đơn thuốc sắp hết lượt mua lại ({exhaustedRxCount})</span>
              </div>
              <p className="text-[11px] text-orange-700 dark:text-orange-300">
                Hệ thống tự động nhắc chủ nuôi đưa bé đến tái khám trực tiếp.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-orange-600 shrink-0" />
          </Link>

          <Link
            href={ROUTES.EXPERT_HEALTH_RECORDS}
            className="p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/20 hover:bg-emerald-100/60 transition-all flex items-center justify-between"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                <span>[Bác sĩ] Thú cưng đến lịch hẹn tái khám ({revisitDueCount})</span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                Theo dõi diễn tiến lành bệnh sau đợt thuốc.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
          </Link>
        </div>
      </VetOnly>
    </div>
  );
}

