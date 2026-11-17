"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ClipboardCheck,
  FileSpreadsheet,
  Package,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { devLogoutAction } from "@/actions/auth.action";
import { ROUTES } from "@/constants/config.constant";
import { PortalHeader, PortalUserMenu } from "@/components/shared/portal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SUPPLIER_SYNC_EVENT,
  SupplierProfile,
  loadSupplierProfiles,
  useActiveSupplierFilter,
} from "@/data/supplierPortalData";

export default function SupplierHeader() {
  const router = useRouter();
  const [activeSupplier, setActiveSupplier] = useActiveSupplierFilter();
  const [profiles, setProfiles] = useState<SupplierProfile[]>([]);

  useEffect(() => {
    const sync = () => setProfiles(loadSupplierProfiles());
    sync();
    window.addEventListener(SUPPLIER_SYNC_EVENT, sync);
    return () => window.removeEventListener(SUPPLIER_SYNC_EVENT, sync);
  }, []);

  const currentProfile =
    profiles.find((p) => p.name === activeSupplier) || profiles[0];

  const handleLogout = async () => {
    try {
      await devLogoutAction();
      localStorage.removeItem("animora_current_user");
      window.dispatchEvent(new Event("animora_user_sync"));
      toast.success("Đã đăng xuất khỏi Cổng Nhà Cung Cấp!");
      router.push(ROUTES.LOGIN);
      router.refresh();
    } catch {
      toast.error("Có lỗi khi đăng xuất.");
    }
  };

  return (
    <PortalHeader
      searchSlot={
        <div className="flex items-center gap-2.5 max-w-md w-full">
          <span className="text-xs font-semibold text-zinc-500 dark:text-muted-foreground whitespace-nowrap hidden sm:inline">
            Đối tác NCC:
          </span>
          <Select
            value={activeSupplier}
            onValueChange={(val) => {
              if (val) setActiveSupplier(val);
            }}
            items={{
              all: "Tất cả Nhà cung cấp (Chế độ liên kết)",
              ...Object.fromEntries(profiles.map((p) => [p.name, p.name])),
            }}
          >
            <SelectTrigger className="w-full sm:w-80 h-9! rounded-xl bg-zinc-50 dark:bg-muted/60 border-zinc-200 dark:border-border text-xs font-semibold px-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs font-semibold">
                Tất cả Nhà cung cấp (Chế độ liên kết)
              </SelectItem>
              {profiles.map((p) => (
                <SelectItem key={p.id} value={p.name} className="text-xs">
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
      showThemeToggle={true}
      userSlot={
        <PortalUserMenu
          name={
            activeSupplier === "all"
              ? currentProfile?.name || "Nhà cung cấp Animora"
              : activeSupplier
          }
          subtitle={currentProfile?.email || "supplier@animora.vn"}
          initials="SUP"
          avatarFallbackClassName="bg-linear-to-br from-teal-600 to-teal-700 text-white font-bold text-[11px]"
          avatarRingClassName="ring-teal-500/15 dark:ring-teal-400/25"
          triggerHoverClassName="hover:border-teal-400/60 dark:hover:border-teal-400/50"
          roleBadge={{
            label: "Supplier",
            icon: Truck,
            className:
              "bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300",
          }}
          menuItems={[
            {
              label: "Đơn nhập hàng (PO)",
              icon: ClipboardCheck,
              iconClassName: "text-teal-600 dark:text-teal-400",
              onClick: () => router.push("/supplier"),
            },
            {
              label: "Danh mục & Giá cung ứng",
              icon: Package,
              iconClassName: "text-teal-600 dark:text-teal-400",
              onClick: () => router.push("/supplier/catalog"),
            },
            {
              label: "Đối soát & Lịch sử giao",
              icon: FileSpreadsheet,
              iconClassName: "text-teal-600 dark:text-teal-400",
              onClick: () => router.push("/supplier/reconciliation"),
            },
            {
              label: "Hồ sơ Nhà cung cấp",
              icon: Building2,
              iconClassName: "text-teal-600 dark:text-teal-400",
              onClick: () => router.push("/supplier/profile"),
            },
          ]}
          logoutLabel="Đăng xuất Nhà cung cấp"
          onLogout={handleLogout}
        />
      }
    />
  );
}
