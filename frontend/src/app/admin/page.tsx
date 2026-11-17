"use client";

import React from "react";
import Link from "next/link";
import {
  CalendarCheck,
  ShoppingBag,
  Users,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Package,
  HeartHandshake,
  DollarSign,
} from "lucide-react";
import { ROUTES } from "@/constants/config.constant";
import {
  PortalKpiStatCard,
  PortalLeaderboardsSection,
  PortalRevenueAnalyticsSection,
  PortalWelcomeHero,
  type PortalKpiCardConfig,
} from "@/components/shared/portal/dashboard";

interface AttentionAlertCard {
  href: string;
  tag: string;
  title: string;
  description: string;
  cta: string;
  Icon: typeof Package;
  containerClass: string;
  iconBgClass: string;
  tagClass: string;
  ctaClass: string;
}

const ATTENTION_ALERTS: AttentionAlertCard[] = [
  {
    href: `${ROUTES.ADMIN_SHOP}?tab=inventory`,
    tag: "Kho hàng",
    title: "3 sản phẩm sắp hết hàng",
    description:
      "Tồn kho dưới ngưỡng an toàn (dưới 5 đơn vị). Quản lý kho sẽ lập phiếu nhập hàng.",
    cta: "Kiểm tra kho",
    Icon: Package,
    containerClass:
      "border-rose-200/80 dark:border-rose-950/60 bg-rose-50/40 dark:bg-rose-950/20 hover:border-rose-400",
    iconBgClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    tagClass: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
    ctaClass: "text-rose-600 dark:text-rose-400",
  },
  {
    href: `${ROUTES.ADMIN_SHOP}?tab=returns`,
    tag: "Chờ duyệt",
    title: "2 yêu cầu hoàn tiền / trả hàng",
    description:
      "Khách hàng yêu cầu đổi trả thức ăn thú cưng do bao bì bị móp méo vận chuyển.",
    cta: "Xem yêu cầu hoàn tiền",
    Icon: DollarSign,
    containerClass:
      "border-amber-200/80 dark:border-amber-950/60 bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-400",
    iconBgClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    tagClass: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
    ctaClass: "text-amber-600 dark:text-amber-400",
  },
  {
    href: `${ROUTES.ADMIN_ADOPTIONS}?tab=requests`,
    tag: "Cứu hộ",
    title: "5 hồ sơ nhận nuôi chờ duyệt",
    description:
      "Các bé Mochi, Bắp và LuLu đang có người nộp đơn nhận nuôi và cam kết chăm sóc.",
    cta: "Xem hồ sơ nhận nuôi",
    Icon: HeartHandshake,
    containerClass:
      "border-emerald-200/80 dark:border-emerald-950/60 bg-emerald-50/40 dark:bg-emerald-950/20 hover:border-emerald-400",
    iconBgClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    tagClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    ctaClass: "text-emerald-600 dark:text-emerald-400",
  },
  {
    href: ROUTES.ADMIN_BOOKINGS,
    tag: "Quy tắc 50%",
    title: "1 đơn hủy lịch bị tính phí 50%",
    description:
      "Khách hủy ca Spa dưới 3 tiếng so với giờ hẹn. Áp dụng khấu trừ 50% theo quy chế.",
    cta: "Tra cứu lịch hẹn",
    Icon: AlertCircle,
    containerClass:
      "border-[#6B1F2E]/20 dark:border-[#6B1F2E]/40 bg-[#6B1F2E]/5 dark:bg-[#6B1F2E]/15 hover:border-[#6B1F2E]",
    iconBgClass: "bg-[#6B1F2E]/10 text-[#6B1F2E] dark:text-[#FF7F6B]",
    tagClass: "text-[#6B1F2E] dark:text-[#FF7F6B] bg-[#6B1F2E]/10",
    ctaClass: "text-[#6B1F2E] dark:text-[#FF7F6B]",
  },
];

export default function AdminDashboardPage() {
  const kpiCards: PortalKpiCardConfig[] = [
    {
      title: "Lịch hẹn hôm nay",
      value: 14,
      unit: "lịch",
      Icon: CalendarCheck,
      iconBg: "bg-[#6B1F2E]/10 text-[#6B1F2E] dark:bg-[#6B1F2E]/20 dark:text-[#FF7F6B]",
      trend: {
        Icon: TrendingUp,
        value: "+12.0%",
        label: "so với hôm qua",
        colorClass: "text-emerald-600 dark:text-emerald-400",
      },
    },
    {
      title: "Doanh thu tháng",
      value: "48.650.000₫",
      Icon: TrendingUp,
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      trend: {
        Icon: TrendingUp,
        value: "+18.4%",
        label: "so với tháng trước",
        colorClass: "text-emerald-600 dark:text-emerald-400",
      },
    },
    {
      title: "Khách hàng mới",
      value: 128,
      unit: "khách",
      Icon: Users,
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      trend: {
        Icon: TrendingUp,
        value: "+24.5%",
        label: "so với tháng trước",
        colorClass: "text-emerald-600 dark:text-emerald-400",
      },
    },
    {
      title: "Đơn hàng chờ xử lý",
      value: 9,
      unit: "đơn",
      Icon: ShoppingBag,
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      trend: {
        Icon: TrendingDown,
        value: "-5.2%",
        label: "so với tuần trước",
        colorClass: "text-rose-500",
      },
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <PortalWelcomeHero
        title="Xin chào, Animora Administrator!"
        subtitle="Bảng điều khiển quản trị trung tâm: Tra cứu dữ liệu hoạt động toàn hệ sinh thái và quản trị tài khoản 7 phân quyền (Admin, Manager, Staff, Customer, Supplier, Shelter, Guest)."
        actions={
          <>
            <Link
              href={ROUTES.ADMIN_USERS}
              className="px-4 py-2.5 rounded-xl bg-white text-[#6B1F2E] font-bold text-xs hover:bg-[#FFF4E8] transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4 text-[#FF7F6B]" />
              <span>Quản lý Người dùng</span>
            </Link>
            <Link
              href={ROUTES.ADMIN_SETTINGS}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-all border border-white/20 flex items-center gap-2 cursor-pointer backdrop-blur-sm"
            >
              <ShieldAlert className="w-4 h-4 text-[#FFD166]" />
              <span>Cài đặt & Bảo mật</span>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <PortalKpiStatCard key={kpi.title} {...kpi} />
        ))}
      </div>

      <PortalRevenueAnalyticsSection />

      <PortalLeaderboardsSection staffLinkHref={ROUTES.ADMIN_STAFF} />

      <div>
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-foreground">
            Sự Vụ Cần Chú Ý (Tra Cứu & Theo Dõi)
          </h2>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            4 sự vụ
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ATTENTION_ALERTS.map((alert) => {
            const Icon = alert.Icon;
            return (
              <Link
                key={alert.title}
                href={alert.href}
                className={`p-5 rounded-2xl border transition-all group flex flex-col justify-between space-y-3 cursor-pointer ${alert.containerClass}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`p-2 rounded-xl ${alert.iconBgClass}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${alert.tagClass}`}
                  >
                    {alert.tag}
                  </span>
                </div>
                <div>
                  <div className="text-lg font-bold text-zinc-900 dark:text-foreground">
                    {alert.title}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-muted-foreground mt-1">
                    {alert.description}
                  </p>
                </div>
                <div
                  className={`text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform ${alert.ctaClass}`}
                >
                  <span>{alert.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
