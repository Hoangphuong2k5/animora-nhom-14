"use client";

import React from "react";
import {
  Calendar,
  CalendarCheck,
  Dog,
  LayoutDashboard,
  ShoppingBag,
  Ticket,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { ROUTES } from "@/constants/config.constant";
import { PortalSidebar, PortalMenuItem } from "@/components/shared/portal";

export default function ManagerSidebar() {
  const menuItems: PortalMenuItem[] = [
    {
      href: ROUTES.MANAGER,
      label: "Tổng quan vận hành",
      icon: LayoutDashboard,
      exact: true,
      badge: null,
    },
    {
      href: ROUTES.MANAGER_BOOKINGS,
      label: "Lịch hẹn & Dịch vụ",
      icon: CalendarCheck,
      exact: false,
      badge: null,
    },
    {
      href: ROUTES.MANAGER_STAFF,
      label: "Nhân sự & Phê duyệt",
      icon: UserCheck,
      exact: false,
      badge: null,
    },
    {
      href: ROUTES.MANAGER_SCHEDULE,
      label: "Lịch làm việc ca trực",
      icon: Calendar,
      exact: false,
      badge: null,
    },
    {
      href: ROUTES.MANAGER_CUSTOMERS,
      label: "Khách hàng",
      icon: Users,
      exact: false,
      badge: null,
    },
    {
      href: ROUTES.MANAGER_PETS,
      label: "Hồ sơ thú cưng",
      icon: Dog,
      exact: false,
      badge: null,
    },
    {
      href: ROUTES.MANAGER_SHOP,
      label: "Cửa hàng & Kho hàng",
      icon: ShoppingBag,
      exact: false,
      badge: null,
    },
    {
      href: ROUTES.MANAGER_FINANCE,
      label: "Doanh thu & Tài chính",
      icon: TrendingUp,
      exact: false,
      badge: null,
    },
    {
      href: ROUTES.MANAGER_VOUCHERS,
      label: "Voucher khuyến mãi",
      icon: Ticket,
      exact: false,
      badge: null,
    },
  ];

  return (
    <PortalSidebar
      brandHref={ROUTES.MANAGER}
      subtitle="Manager"
      menuItems={menuItems}
    />
  );
}

