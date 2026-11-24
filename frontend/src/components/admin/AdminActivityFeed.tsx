"use client";

import React from "react";
import {
  CalendarCheck,
  ShoppingBag,
  Sparkles,
  UserCheck,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: "booking" | "order" | "user" | "system";
  title: string;
  description: string;
  timeAgo: string;
  badge?: string;
}

const mockActivities: ActivityItem[] = [
  {
    id: "act-1",
    type: "booking",
    title: "Lịch hẹn Spa mới",
    description: "Khách hàng Nguyễn Văn An đặt lịch Spa Combo 5 bước cho bé Corgi Lu.",
    timeAgo: "5 phút trước",
    badge: "Chờ tiếp nhận",
  },
  {
    id: "act-3",
    type: "order",
    title: "Đơn hàng cửa hàng mới",
    description: "Đơn #ANM-8924: 2x Hạt dinh dưỡng hữu cơ Royal Canin (Tổng 1.120.000₫).",
    timeAgo: "45 phút trước",
    badge: "Đang đóng gói",
  },
  {
    id: "act-4",
    type: "user",
    title: "Khách hàng đăng ký tài khoản",
    description: "Phạm Hải Đăng vừa đăng ký tài khoản và thêm hồ sơ cho 2 bé cưng.",
    timeAgo: "1 giờ trước",
  },
  {
    id: "act-5",
    type: "system",
    title: "Tự động tối ưu hóa Cache",
    description: "Hệ thống PPR Static Shell đã hoàn tất tái xác thực cache danh mục định kỳ.",
    timeAgo: "2 giờ trước",
    badge: "Hệ thống",
  },
];

export function AdminActivityFeed() {
  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "booking":
        return <CalendarCheck className="w-4 h-4 text-[#6B1F2E] dark:text-[#FF7F6B]" />;
      case "order":
        return <ShoppingBag className="w-4 h-4 text-amber-500" />;
      case "user":
        return <UserCheck className="w-4 h-4 text-emerald-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-sky-500" />;
    }
  };

  const getBg = (type: ActivityItem["type"]) => {
    switch (type) {
      case "booking":
        return "bg-[#6B1F2E]/10 dark:bg-[#6B1F2E]/20";
      case "order":
        return "bg-amber-500/10 dark:bg-amber-500/20";
      case "user":
        return "bg-emerald-500/10 dark:bg-emerald-500/20";
      default:
        return "bg-sky-500/10 dark:bg-sky-500/20";
    }
  };

  return (
    <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-foreground flex items-center gap-2">
            <span>Dòng Hoạt Động Thời Gian Thực</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Nhật ký hoạt động từ khách hàng, lịch hẹn và đơn hàng
          </p>
        </div>
        <span className="text-xs font-mono text-zinc-400">Live Feed</span>
      </div>

      <div className="space-y-3.5 relative before:absolute before:top-2 before:bottom-2 before:left-[19px] before:w-[2px] before:bg-zinc-100 dark:before:bg-muted">
        {mockActivities.map((act) => (
          <div key={act.id} className="relative flex items-start gap-3.5">
            <div
              className={`relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-zinc-100 dark:border-border ${getBg(
                act.type
              )}`}
            >
              {getIcon(act.type)}
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <div className="font-bold text-xs sm:text-sm text-zinc-800 dark:text-foreground/90 truncate">
                  {act.title}
                </div>
                <span className="text-[11px] text-zinc-400 whitespace-nowrap">
                  {act.timeAgo}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-muted-foreground mt-0.5 leading-relaxed">
                {act.description}
              </p>
              {act.badge && (
                <div className="mt-1.5">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-muted text-zinc-600 dark:text-foreground/80">
                    {act.badge}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

