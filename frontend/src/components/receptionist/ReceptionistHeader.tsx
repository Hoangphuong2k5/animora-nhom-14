"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarOff,
  CalendarPlus,
  ConciergeBell,
  ExternalLink,
  FileSpreadsheet,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { devLogoutAction } from "@/actions/auth.action";
import { ROUTES } from "@/constants/config.constant";
import {
  PortalHeader,
  PortalQuickSearch,
  PortalSearchResultItem,
  PortalUserMenu,
} from "@/components/shared/portal";
import { useReceptionistActor } from "@/hooks/receptionist/useReceptionistActor";

export default function ReceptionistHeader() {
  const router = useRouter();
  const { actorName, actorEmail, initials } = useReceptionistActor();
  const [searchQuery, setSearchQuery] = useState("");

  const quickLinks: PortalSearchResultItem[] = useMemo(
    () => [
      {
        id: "rql-counter",
        title: "Quầy Tiếp nhận, Check-in & Thu tiền",
        href: ROUTES.RECEPTIONIST,
        icon: ConciergeBell,
      },
      {
        id: "rql-booking",
        title: "Đặt lịch giúp khách (Làm ngay / Hẹn giờ)",
        href: ROUTES.RECEPTIONIST_BOOKING,
        icon: CalendarPlus,
      },
      {
        id: "rql-customers",
        title: "Tra cứu SĐT, Khách vãng lai & Tạo TK Web",
        href: ROUTES.RECEPTIONIST_CUSTOMERS,
        icon: Users,
      },
      {
        id: "rql-audit",
        title: "Hóa đơn, Hoàn/Bù tiền & Audit Log",
        href: ROUTES.RECEPTIONIST_AUDIT,
        icon: FileSpreadsheet,
      },
      {
        id: "rql-leave",
        title: "Xin nghỉ phép (Quỹ 4 ngày/tháng)",
        href: ROUTES.RECEPTIONIST_LEAVE,
        icon: CalendarOff,
      },
    ],
    []
  );

  const allSearchItems: PortalSearchResultItem[] = useMemo(
    () => [
      {
        id: "r-counter",
        title: "Bàn Quầy Tiếp Nhận & Thu Ngân",
        subtitle: "Check-in, Dời 30 phút, Không đến, Điều chỉnh giá theo cân & Thu tiền",
        category: "Vận hành quầy",
        href: ROUTES.RECEPTIONIST,
        icon: ConciergeBell,
        badge: "Lễ tân",
      },
      {
        id: "r-booking",
        title: "Đặt Lịch Giúp Khách Hàng Tại Quầy",
        subtitle: "Giao diện đặt lịch KH nhúng tại quầy • Làm ngay hoặc Hẹn giờ",
        category: "Đặt lịch",
        href: ROUTES.RECEPTIONIST_BOOKING,
        icon: CalendarPlus,
      },
      {
        id: "r-customers",
        title: "Khách Vãng Lai, Thú Cưng & Tạo Tài Khoản Web",
        subtitle: "Tìm SĐT chống trùng, tạo hồ sơ 4 loài và kích hoạt OTP/Mật khẩu",
        category: "Khách hàng",
        href: ROUTES.RECEPTIONIST_CUSTOMERS,
        icon: Users,
      },
      {
        id: "r-audit",
        title: "Hóa Đơn Dịch Vụ, Hoàn/Bù Tiền & Nhật Ký Audit",
        subtitle: "Tra cứu hóa đơn đã xuất và lịch sử thao tác của Lễ tân",
        category: "Đối soát",
        href: ROUTES.RECEPTIONIST_AUDIT,
        icon: FileSpreadsheet,
      },
      {
        id: "r-leave",
        title: "Xin Nghỉ Phép (Lễ Tân)",
        subtitle: "Gửi đơn nghỉ nguyên ngày gửi Quản lý duyệt & theo dõi quỹ 4 ngày/tháng",
        category: "Nhân sự",
        href: ROUTES.RECEPTIONIST_LEAVE,
        icon: CalendarOff,
      },
      {
        id: "r-customer-ui",
        title: "Mở Trang Đặt Lịch Khách Hàng (/dat-lich)",
        subtitle: "Truy cập trực tiếp trang đặt lịch phía khách hàng",
        category: "Kênh KH",
        href: "/dat-lich",
        icon: ExternalLink,
      },
    ],
    []
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return allSearchItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
    );
  }, [searchQuery, allSearchItems]);

  const handleLogout = async () => {
    try {
      await devLogoutAction();
      localStorage.removeItem("animora_current_user");
      window.dispatchEvent(new Event("animora_user_sync"));
      toast.info("Đã đăng xuất khỏi cổng Lễ tân!");
      router.push(ROUTES.LOGIN);
      router.refresh();
    } catch {
      window.location.href = ROUTES.LOGIN;
    }
  };

  return (
    <PortalHeader
      searchSlot={
        <PortalQuickSearch
          id="receptionist-quick-search"
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Tìm nghiệp vụ quầy, đặt lịch giúp, hóa đơn... (Ctrl+K)"
          results={searchResults}
          quickLinks={quickLinks}
          onSelectResult={(item) => {
            if (item.href) router.push(item.href);
          }}
        />
      }
      showThemeToggle={true}
      userSlot={
        <PortalUserMenu
          name={actorName}
          subtitle={actorEmail}
          initials={initials}
          avatarFallbackClassName="bg-linear-to-br from-amber-600 to-orange-600 text-white font-bold text-[11px]"
          avatarRingClassName="ring-amber-500/20 dark:ring-amber-400/25"
          triggerHoverClassName="hover:border-amber-400/60 dark:hover:border-amber-400/50"
          roleBadge={{
            label: "Lễ tân",
            icon: ConciergeBell,
            className:
              "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300",
          }}
          menuItems={[
            {
              label: "Quầy Tiếp Nhận & Thu Ngân",
              icon: ConciergeBell,
              iconClassName: "text-amber-600 dark:text-amber-400",
              onClick: () => router.push(ROUTES.RECEPTIONIST),
            },
            {
              label: "Đặt Lịch Giúp Khách",
              icon: CalendarPlus,
              iconClassName: "text-amber-600 dark:text-amber-400",
              onClick: () => router.push(ROUTES.RECEPTIONIST_BOOKING),
            },
            {
              label: "Khách Vãng Lai & Thú Cưng",
              icon: Users,
              iconClassName: "text-amber-600 dark:text-amber-400",
              onClick: () => router.push(ROUTES.RECEPTIONIST_CUSTOMERS),
            },
            {
              label: "Hóa Đơn & Nhật Ký Audit",
              icon: FileSpreadsheet,
              iconClassName: "text-amber-600 dark:text-amber-400",
              onClick: () => router.push(ROUTES.RECEPTIONIST_AUDIT),
            },
          ]}
          logoutLabel="Đăng xuất Lễ tân"
          onLogout={handleLogout}
        />
      }
    />
  );
}

