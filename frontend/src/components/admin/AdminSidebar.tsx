"use client";

import React from "react";
import {
  Calendar,
  CalendarCheck,
  Dog,
  HeartHandshake,
  LayoutDashboard,
  Settings,
  ShoppingBag,
  Ticket,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { ROUTES } from "@/constants/config.constant";
import { PortalSidebar, PortalMenuItem } from "@/components/shared/portal";

export default function AdminSidebar() {
  const menuItems: PortalMenuItem[] = [
    {
      href: ROUTES.ADMIN,
      label: "Tổng quan",
      icon: LayoutDashboard,
      exact: true,
      badge: null,
    },
    {
      href: ROUTES.ADMIN_BOOKINGS,
      label: "Đặt lịch",
      icon: CalendarCheck,
      exact: false,
      badge: "Mới",
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
    {
      href: ROUTES.ADMIN_STAFF,
      label: "Chuyên viên & nhân sự",
      icon: UserCheck,
      exact: false,
      badge: null,
    },
    {
      href: ROUTES.ADMIN_SCHEDULE,
      label: "Lịch làm việc",
      icon: Calendar,
      exact: false,
      badge: null,
    },
    {
      href: ROUTES.ADMIN_SHOP,
      label: "Cửa hàng",
      icon: ShoppingBag,
      exact: false,
      badge: null,
    },
    {
      href: ROUTES.ADMIN_ADOPTIONS,
      label: "Nhận nuôi & Trạm cứu hộ",
      icon: HeartHandshake,
      exact: false,
      badge: "Tìm chủ",
    },
    {
      href: ROUTES.ADMIN_FINANCE,
      label: "Doanh thu & Kế toán",
      icon: TrendingUp,
      exact: false,
      badge: null,
    },
    {
      href: ROUTES.ADMIN_VOUCHERS,
      label: "Voucher",
      icon: Ticket,
      exact: false,
      badge: "%",
    },
    {
      href: ROUTES.ADMIN_SETTINGS,
      label: "Cài đặt",
      icon: Settings,
      exact: false,
      badge: null,
    },
  ];

  return (
    <PortalSidebar
      brandHref={ROUTES.ADMIN}
      subtitle="Hệ thống Quản Trị Hệ Sinh Thái"
      menuItems={menuItems}
    />
  );
}
