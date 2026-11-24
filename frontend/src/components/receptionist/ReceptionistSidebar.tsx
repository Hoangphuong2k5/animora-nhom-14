"use client";

import React from "react";
import {
  CalendarOff,
  CalendarPlus,
  ConciergeBell,
  FileSpreadsheet,
  Users,
} from "lucide-react";
import { ROUTES } from "@/constants/config.constant";
import { PortalSidebar, PortalMenuItem } from "@/components/shared/portal";

export default function ReceptionistSidebar() {
  const menuItems: PortalMenuItem[] = [
    {
      href: ROUTES.RECEPTIONIST,
      label: "Quầy Tiếp Nhận",
      icon: ConciergeBell,
      exact: true,
      badge: null,
    },
    {
      href: ROUTES.RECEPTIONIST_BOOKING,
      label: "Đặt Lịch Tại Quầy",
      icon: CalendarPlus,
      exact: false,
      badge: null,
    },
    {
      href: ROUTES.RECEPTIONIST_CUSTOMERS,
      label: "Khách Vãng Lai",
      icon: Users,
      exact: false,
      badge: null,
    },
    {
      href: ROUTES.RECEPTIONIST_AUDIT,
      label: "Hóa Đơn & Audit Log",
      icon: FileSpreadsheet,
      exact: false,
      badge: null,
    },
    {
      href: ROUTES.RECEPTIONIST_LEAVE,
      label: "Xin Nghỉ Phép",
      icon: CalendarOff,
      exact: false,
      badge: null,
    },
  ];

  return (
    <PortalSidebar
      brandHref={ROUTES.RECEPTIONIST}
      subtitle="Lễ Tân"
      menuItems={menuItems}
    />
  );
}

