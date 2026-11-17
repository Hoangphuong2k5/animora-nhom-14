"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ClipboardList, Dog, HeartHandshake } from "lucide-react";
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
import { ShelterPartner } from "@/components/manager/adoptions/managerAdoptionsData";
import {
  ADOPTION_SYNC_EVENT,
  loadRescueShelters,
  useActiveRescueShelterFilter,
} from "@/data/rescuePortalData";

export default function RescueHeader() {
  const router = useRouter();
  const [activeShelter, setActiveShelter] = useActiveRescueShelterFilter();
  const [shelters, setShelters] = useState<ShelterPartner[]>([]);

  useEffect(() => {
    const sync = () => setShelters(loadRescueShelters());
    sync();
    window.addEventListener(ADOPTION_SYNC_EVENT, sync);
    return () => window.removeEventListener(ADOPTION_SYNC_EVENT, sync);
  }, []);

  const currentShelter =
    shelters.find((s) => s.name === activeShelter) || shelters[0];

  const handleLogout = async () => {
    try {
      await devLogoutAction();
      localStorage.removeItem("animora_current_user");
      window.dispatchEvent(new Event("animora_user_sync"));
      toast.success("Đã đăng xuất khỏi Cổng Trạm Cứu Hộ!");
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
            Trạm cứu hộ:
          </span>
          <Select
            value={activeShelter}
            onValueChange={(val) => {
              if (val) setActiveShelter(val);
            }}
            items={{
              all: "Tất cả Trạm cứu hộ liên kết",
              ...Object.fromEntries(shelters.map((s) => [s.name, s.name])),
            }}
          >
            <SelectTrigger className="w-full sm:w-80 h-9! rounded-xl bg-zinc-50 dark:bg-muted/60 border-zinc-200 dark:border-border text-xs font-semibold px-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs font-semibold">
                Tất cả Trạm cứu hộ liên kết
              </SelectItem>
              {shelters.map((s) => (
                <SelectItem key={s.id} value={s.name} className="text-xs">
                  {s.name}
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
            activeShelter === "all"
              ? currentShelter?.name || "Trạm cứu hộ Animora"
              : activeShelter
          }
          subtitle={currentShelter?.email || "rescue@animora.vn"}
          initials="TCH"
          avatarFallbackClassName="bg-linear-to-br from-rose-600 to-rose-700 text-white font-bold text-[11px]"
          avatarRingClassName="ring-rose-500/15 dark:ring-rose-400/25"
          triggerHoverClassName="hover:border-rose-400/60 dark:hover:border-rose-400/50"
          roleBadge={{
            label: "Rescue",
            icon: HeartHandshake,
            className:
              "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300",
          }}
          menuItems={[
            {
              label: "Yêu cầu nhận nuôi",
              icon: ClipboardList,
              iconClassName: "text-rose-600 dark:text-rose-400",
              onClick: () => router.push("/rescue"),
            },
            {
              label: "Bé cưng tìm mái ấm",
              icon: Dog,
              iconClassName: "text-rose-600 dark:text-rose-400",
              onClick: () => router.push("/rescue/pets"),
            },
            {
              label: "Hồ sơ Trạm cứu hộ",
              icon: Building2,
              iconClassName: "text-rose-600 dark:text-rose-400",
              onClick: () => router.push("/rescue/profile"),
            },
          ]}
          logoutLabel="Đăng xuất Trạm cứu hộ"
          onLogout={handleLogout}
        />
      }
    />
  );
}
