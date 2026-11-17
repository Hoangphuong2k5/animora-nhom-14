"use client";

import React from "react";
import { Building2, ClipboardList, Dog } from "lucide-react";
import { PortalSidebar, PortalMenuItem } from "@/components/shared/portal";

export default function RescueSidebar() {
  const menuItems: PortalMenuItem[] = [
    {
      href: "/rescue",
      label: "Yêu cầu nhận nuôi",
      icon: ClipboardList,
      exact: true,
      badge: null,
    },
    {
      href: "/rescue/pets",
      label: "Bé cưng tìm mái ấm",
      icon: Dog,
      exact: false,
      badge: null,
    },
    {
      href: "/rescue/profile",
      label: "Hồ sơ Trạm cứu hộ",
      icon: Building2,
      exact: false,
      badge: null,
    },
  ];

  return (
    <PortalSidebar
      brandHref="/rescue"
      subtitle="Rescue"
      menuItems={menuItems}
    />
  );
}
