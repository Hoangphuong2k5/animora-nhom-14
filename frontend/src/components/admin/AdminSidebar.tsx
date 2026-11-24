"use client";

import React from "react";
import {
  Calendar,
  CalendarCheck,
  Dog,
  LayoutDashboard,
  Settings,
  ShoppingBag,
  Ticket,
  TrendingUp,
  UserCheck,
  Users,
  ShieldCheck,
} from "lucide-react";
import { ROUTES } from "@/constants/config.constant";
import { PortalSidebar, PortalMenuItem } from "@/components/shared/portal";

const readOnlyBadge = (
  <span
    title="Chỉ xem (Read-Only)"
    aria-label="Chỉ xem"
    className="inline-block w-3 h-3 bg-current shrink-0"
    style={{
      maskImage: "url(/read-only.svg)",
      WebkitMaskImage: "url(/read-only.svg)",
      maskSize: "contain",
      WebkitMaskSize: "contain",
      maskRepeat: "no-repeat",
      WebkitMaskRepeat: "no-repeat",
      maskPosition: "center",
      WebkitMaskPosition: "center",
    }}
  />
);

export default function AdminSidebar() {
  const menuItems: PortalMenuItem[] = [
    // 1. Quản trị hệ thống cốt lõi (Core Admin)
    {
      href: ROUTES.ADMIN,
      label: "Tổng quan KPI",
      icon: LayoutDashboard,
      exact: true,
      badge: null,
    },
    {
      href: ROUTES.ADMIN_USERS,
      label: "Người dùng & Phân quyền",
      icon: ShieldCheck,
      exact: false,
      badge: null,
    },
    {
      href: ROUTES.ADMIN_SETTINGS,
      label: "Cấu hình hệ thống",
      icon: Settings,
      exact: false,
      badge: null,
    },
    {
      href: ROUTES.ADMIN_CUSTOMERS,
      label: "Khách hàng",
      icon: Users,
      exact: false,
      badge: null,
    },
    {
      href: ROUTES.ADMIN_PETS,
      label: "Thú cưng",
      icon: Dog,
      exact: false,
      badge: null,
    },

    // 2. Tra cứu dữ liệu vận hành (Chế độ Chỉ Xem - Read Only theo nghiệp vụ)
    {
      href: ROUTES.ADMIN_BOOKINGS,
      label: "Tra cứu Đặt lịch",
      icon: CalendarCheck,
      exact: false,
      badge: readOnlyBadge,
    },
    {
      href: ROUTES.ADMIN_STAFF,
      label: "Tra cứu Nhân sự",
      icon: UserCheck,
      exact: false,
      badge: readOnlyBadge,
    },
    {
      href: ROUTES.ADMIN_SCHEDULE,
      label: "Tra cứu Lịch trực",
      icon: Calendar,
      exact: false,
      badge: readOnlyBadge,
    },
    {
      href: ROUTES.ADMIN_SHOP,
      label: "Tra cứu Cửa hàng",
      icon: ShoppingBag,
      exact: false,
      badge: readOnlyBadge,
    },
    {
      href: ROUTES.ADMIN_FINANCE,
      label: "Tra cứu Doanh thu",
      icon: TrendingUp,
      exact: false,
      badge: readOnlyBadge,
    },
    {
      href: ROUTES.ADMIN_VOUCHERS,
      label: "Voucher",
      icon: Ticket,
      exact: false,
      badge: readOnlyBadge,
    },
  ];

  return (
    <PortalSidebar
      brandHref={ROUTES.ADMIN}
      subtitle="Quản Trị Hệ Thống & Phân Quyền"
      menuItems={menuItems}
    />
  );
}
