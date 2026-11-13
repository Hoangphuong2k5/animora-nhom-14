"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CalendarCheck,
  Dog,
  FileHeart,
  LogOut,
  Pill,
  Scissors,
  Star,
  Stethoscope,
  TrendingUp,
  User,
} from "lucide-react";
import { devLogoutAction } from "@/actions/auth.action";
import { ROUTES } from "@/constants/config.constant";
import { toast } from "sonner";
import { useExpert } from "./ExpertProvider";
import { useExpertT } from "./expertI18n";
import { HeaderNotificationDropdown } from "./header/HeaderNotificationDropdown";
import { HeaderUserMenu } from "./header/HeaderUserMenu";
import {
  PortalHeader,
  PortalQuickSearch,
  PortalSearchResultItem,
} from "@/components/shared/portal";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ExpertHeader() {
  const router = useRouter();
  const {
    profile,
    isVet,
    store,
    allPets,
    allOwners,
    allServices,
    markNotificationAsRead,
    markAllNotificationsRead,
  } = useExpert();
  const { t, lang } = useExpertT();

  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  // Quick links when search input is empty
  const expertQuickLinks: PortalSearchResultItem[] = useMemo(() => {
    const links: PortalSearchResultItem[] = [
      { id: "eq-app", title: t.menu.appointments, href: ROUTES.EXPERT_APPOINTMENTS, icon: CalendarCheck },
      { id: "eq-sch", title: t.menu.schedule, href: ROUTES.EXPERT_SCHEDULE, icon: Calendar },
      { id: "eq-cli", title: t.menu.clients, href: ROUTES.EXPERT_CLIENTS, icon: Dog },
      { id: "eq-rec", title: t.menu.healthRecords, href: ROUTES.EXPERT_HEALTH_RECORDS, icon: FileHeart },
      { id: "eq-rev", title: t.menu.reviews, href: ROUTES.EXPERT_REVIEWS, icon: Star },
      { id: "eq-ear", title: t.menu.earnings, href: ROUTES.EXPERT_EARNINGS, icon: TrendingUp },
      { id: "eq-pro", title: t.menu.profile, href: ROUTES.EXPERT_PROFILE, icon: User },
    ];
    if (isVet) {
      links.splice(4, 0, {
        id: "eq-rx",
        title: "Kê đơn thuốc [Rx]",
        href: ROUTES.EXPERT_PRESCRIPTIONS,
        icon: Pill,
      });
    }
    return links;
  }, [t, isVet]);

  // Search results from current expert appointments and clients
  const searchResults: PortalSearchResultItem[] = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();

    return store.appointments
      .filter((a) => {
        const pet = allPets.find((p) => p.id === a.petId);
        const owner = allOwners.find((o) => o.id === a.ownerId);
        const srv = allServices.find((s) => s.id === a.serviceId);

        return (
          a.code.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          a.customerNote?.toLowerCase().includes(q) ||
          (pet && (pet.name.toLowerCase().includes(q) || pet.breed.toLowerCase().includes(q))) ||
          (owner && owner.fullName.toLowerCase().includes(q)) ||
          (srv && srv.name.vi.toLowerCase().includes(q))
        );
      })
      .slice(0, 8)
      .map((a) => {
        const pet = allPets.find((p) => p.id === a.petId);
        const owner = allOwners.find((o) => o.id === a.ownerId);
        const srv = allServices.find((s) => s.id === a.serviceId);

        const petInfo = pet ? `${pet.name} (${pet.breed})` : "Thú cưng";
        const ownerName = owner ? owner.fullName : "Khách";
        const srvName = srv ? srv.name[lang] || srv.name.vi : "Dịch vụ";

        return {
          id: a.id,
          title: `${a.code} • ${petInfo}`,
          subtitle: `${ownerName} • ${srvName} • ${a.startAt.replace("T", " ")}`,
          category: isVet ? "Ca khám" : "Ca spa",
          badge:
            a.status === "in_progress"
              ? "Đang phục vụ"
              : a.status === "upcoming"
              ? "Sắp tới"
              : a.status === "completed"
              ? "Hoàn tất"
              : "Chờ tiếp nhận",
          icon: isVet ? Stethoscope : Scissors,
          href: `/expert/appointments?code=${a.code}`,
        };
      });
  }, [searchQuery, store.appointments, allPets, allOwners, allServices, isVet, lang]);

  const handleLogout = async () => {
    try {
      await devLogoutAction();
      localStorage.removeItem("animora_current_user");
      window.dispatchEvent(new Event("animora_user_sync"));
      toast.info("Đã đăng xuất khỏi hệ thống!");
      router.push(ROUTES.LOGIN);
      router.refresh();
    } catch {
      window.location.href = ROUTES.LOGIN;
    }
  };

  const unreadCount = store.notifications.filter((n) => n.unread).length;

  const roleLabel = isVet
    ? lang === "vi"
      ? "Bác sĩ thú y"
      : "Veterinarian"
    : lang === "vi"
    ? "Chuyên viên Grooming"
    : "Grooming Specialist";

  return (
    <PortalHeader
      searchSlot={
        <PortalQuickSearch
          id="expert-quick-search"
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Tìm nhanh lịch hẹn, khách hàng, thú cưng... (Ctrl+K)"
          results={searchResults}
          quickLinks={expertQuickLinks}
          onSelectResult={(item) => {
            if (item.href) {
              router.push(item.href);
            }
          }}
        />
      }
      notificationSlot={
        <HeaderNotificationDropdown
          notifications={store.notifications}
          unreadCount={unreadCount}
          isOpen={showNotifications}
          onToggle={() => setShowNotifications((prev) => !prev)}
          onClose={() => setShowNotifications(false)}
          onMarkAllRead={markAllNotificationsRead}
          onSelectNotification={(id, href) => {
            markNotificationAsRead(id);
            if (href) {
              setShowNotifications(false);
              router.push(href);
            }
          }}
          title={t.notifications}
          markAllReadLabel={t.markAllRead}
          noNotificationsLabel={t.noNotifications}
          lang={lang}
        />
      }
      showThemeToggle={true}
      userSlot={
        <HeaderUserMenu
          profile={profile}
          isVet={isVet}
          onLogout={handleLogout}
          roleLabel={roleLabel}
          profileLabel={t.menu.profile}
          earningsLabel={t.menu.earnings}
          logoutLabel={lang === "vi" ? "Đăng xuất" : "Log out"}
        />
      }
      logoutButton={
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                aria-label="Đăng xuất khỏi hệ thống"
                className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
              />
            }
          >
            <LogOut className="size-4" />
          </TooltipTrigger>
          <TooltipContent side="bottom">Đăng xuất khỏi hệ thống</TooltipContent>
        </Tooltip>
      }
    />
  );
}
