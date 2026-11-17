"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AdminReadOnlyBannerProps {
  moduleName: string;
  managerHref: string;
  description?: string;
}

export function AdminReadOnlyBanner({
  moduleName,
  managerHref,
  description,
}: AdminReadOnlyBannerProps) {
  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/25 p-4 mb-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950 dark:text-amber-200 animate-in fade-in">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5 sm:mt-0 flex items-center justify-center">
          <img
            src="/read-only.svg"
            alt="Chế độ chỉ xem"
            className="w-5 h-5 object-contain dark:invert"
          />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-sm text-amber-900 dark:text-amber-100">
              Chế độ Tra Cứu (Chỉ Xem) • Phân hệ {moduleName}
            </span>
            <Badge
              variant="outline"
              className="text-[10px] px-2 py-0 bg-amber-200/50 dark:bg-amber-900/60 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-bold"
            >
              Read-Only
            </Badge>
          </div>
          <p className="text-xs text-amber-800/90 dark:text-amber-300/80 mt-0.5 leading-relaxed">
            {description ||
              "Theo chuẩn phân tích nghiệp vụ, Admin chỉ xem dữ liệu vận hành. Mọi thao tác phê duyệt, can thiệp và xử lý trực tiếp do Manager phụ trách."}
          </p>
        </div>
      </div>

      <Link
        href={managerHref}
        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white dark:bg-amber-600 dark:hover:bg-amber-700 shadow-sm transition-all hover:scale-[1.02] shrink-0"
      >
        <span>Chuyển sang Cổng Quản Lý để thao tác</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

