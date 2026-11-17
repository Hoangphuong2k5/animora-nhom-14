"use client";

import React from "react";
import {
  Building2,
  ClipboardCheck,
  FileSpreadsheet,
  Package,
} from "lucide-react";
import { PortalSidebar, PortalMenuItem } from "@/components/shared/portal";

export default function SupplierSidebar() {
  const menuItems: PortalMenuItem[] = [
    {
      href: "/supplier",
      label: "Đơn nhập hàng (PO)",
      icon: ClipboardCheck,
      exact: true,
      badge: null,
    },
    {
      href: "/supplier/catalog",
      label: "Danh mục & Giá cung ứng",
      icon: Package,
      exact: false,
      badge: null,
    },
    {
      href: "/supplier/reconciliation",
      label: "Đối soát & Lịch sử giao",
      icon: FileSpreadsheet,
      exact: false,
      badge: null,
    },
    {
      href: "/supplier/profile",
      label: "Hồ sơ Nhà cung cấp",
      icon: Building2,
      exact: false,
      badge: null,
    },
  ];

  return (
    <PortalSidebar
      brandHref="/supplier"
      subtitle="Supplier"
      menuItems={menuItems}
    />
  );
}
