"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  Clock,
  Dog,
  ExternalLink,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Ticket,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { devLogoutAction } from "@/actions/auth.action";
import { ROUTES } from "@/constants/config.constant";
import { toast } from "sonner";
import {
  PortalHeader,
  PortalNotificationItem,
  PortalNotificationPopover,
  PortalQuickSearch,
  PortalSearchResultItem,
} from "@/components/shared/portal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  type: "booking" | "stock" | "adoption" | "refund";
  href?: string;
}

function getAdminNotifIcon(type: NotificationItem["type"]) {
  switch (type) {
    case "booking":
      return <Clock className="size-4" />;
    case "stock":
      return <Package className="size-4 text-amber-500" />;
    case "adoption":
      return <HeartHandshake className="size-4 text-rose-500" />;
    case "refund":
      return <CheckCircle2 className="size-4 text-emerald-500" />;
  }
}

export default function AdminHeader() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "notif-1",
      title: "Lịch hẹn Spa mới",
      desc: "Khách Nguyễn Văn An vừa đặt Spa Combo 5 bước lúc 14:00.",
      time: "5 phút trước",
      unread: true,
      type: "booking",
      href: ROUTES.ADMIN_BOOKINGS,
    },
    {
      id: "notif-2",
      title: "Cảnh báo tồn kho dưới ngưỡng",
      desc: "Hạt Royal Canin mini adult chỉ còn 2 gói trong kho.",
      time: "20 phút trước",
      unread: true,
      type: "stock",
      href: ROUTES.ADMIN_SHOP,
    },
    {
      id: "notif-3",
      title: "Hồ sơ xin nhận nuôi mới",
      desc: "Trần Thùy Linh nộp đơn xin nhận nuôi bé Mochi (Corgi).",
      time: "1 giờ trước",
      unread: true,
      type: "adoption",
      href: ROUTES.ADMIN_ADOPTIONS,
    },
    {
      id: "notif-4",
      title: "Yêu cầu hoàn tiền cần duyệt",
      desc: "Đơn hàng #ANM-771 yêu cầu đổi size chuồng vận chuyển.",
      time: "3 giờ trước",
      unread: true,
      type: "refund",
      href: ROUTES.ADMIN_SHOP,
    },
  ]);

  // Quick links when search input is empty
  const adminQuickLinks: PortalSearchResultItem[] = useMemo(
    () => [
      { id: "ql-bookings", title: "Đặt lịch hẹn", href: ROUTES.ADMIN_BOOKINGS, icon: CalendarCheck },
      { id: "ql-customers", title: "Khách hàng", href: ROUTES.ADMIN_CUSTOMERS, icon: Users },
      { id: "ql-pets", title: "Hồ sơ Thú cưng", href: ROUTES.ADMIN_PETS, icon: Dog },
      { id: "ql-schedule", title: "Lịch làm việc", href: ROUTES.ADMIN_SCHEDULE, icon: Calendar },
      { id: "ql-staff", title: "Chuyên viên & BS", href: ROUTES.ADMIN_STAFF, icon: UserCheck },
      { id: "ql-finance", title: "Doanh thu", href: ROUTES.ADMIN_FINANCE, icon: TrendingUp },
      { id: "ql-shop", title: "Cửa hàng", href: ROUTES.ADMIN_SHOP, icon: ShoppingBag },
      { id: "ql-settings", title: "Cài đặt", href: ROUTES.ADMIN_SETTINGS, icon: Settings },
    ],
    []
  );

  // Search items pool (combining admin navigation modules + sample entities)
  const allSearchItems: PortalSearchResultItem[] = useMemo(
    () => [
      { id: "m-overview", title: "Bảng điều khiển Tổng quan", subtitle: "Thống kê KPI và biểu đồ toàn hệ sinh thái", category: "Trang", href: ROUTES.ADMIN, icon: TrendingUp },
      { id: "m-bookings", title: "Quản lý Đặt lịch hẹn", subtitle: "Danh sách lịch hẹn, duyệt ca khám & spa", category: "Trang", href: ROUTES.ADMIN_BOOKINGS, icon: CalendarCheck, badge: "Mới" },
      { id: "m-customers", title: "Khách hàng thân thiết", subtitle: "Danh sách khách hàng, điểm tích lũy, số dư", category: "Trang", href: ROUTES.ADMIN_CUSTOMERS, icon: Users },
      { id: "m-pets", title: "Quản lý Thú cưng", subtitle: "Hồ sơ chó mèo, giống loài, tiền sử sức khỏe", category: "Trang", href: ROUTES.ADMIN_PETS, icon: Dog },
      { id: "m-staff", title: "Chuyên viên & Nhân sự", subtitle: "Quản lý bác sĩ thú y, kỹ thuật viên spa, ca trực", category: "Trang", href: ROUTES.ADMIN_STAFF, icon: UserCheck },
      { id: "m-schedule", title: "Lịch làm việc & Ca trực", subtitle: "Phân ca làm việc, duyệt đơn xin nghỉ", category: "Trang", href: ROUTES.ADMIN_SCHEDULE, icon: Calendar },
      { id: "m-shop", title: "Cửa hàng & Tồn kho", subtitle: "Quản lý sản phẩm, cảnh báo hết hàng", category: "Trang", href: ROUTES.ADMIN_SHOP, icon: ShoppingBag },
      { id: "m-adoptions", title: "Nhận nuôi & Trạm cứu hộ", subtitle: "Hồ sơ chó mèo tìm chủ, đơn đăng ký nhận nuôi", category: "Trang", href: ROUTES.ADMIN_ADOPTIONS, icon: HeartHandshake, badge: "Tìm chủ" },
      { id: "m-finance", title: "Doanh thu & Kế toán", subtitle: "Báo cáo doanh thu theo ngày, tuần, tháng", category: "Trang", href: ROUTES.ADMIN_FINANCE, icon: TrendingUp },
      { id: "m-vouchers", title: "Mã giảm giá & Voucher", subtitle: "Quản lý chiến dịch khuyến mãi, mã ưu đãi", category: "Trang", href: ROUTES.ADMIN_VOUCHERS, icon: Ticket },
      { id: "m-settings", title: "Cài đặt hệ thống", subtitle: "Cấu hình trung tâm, quyền truy cập, sao lưu", category: "Trang", href: ROUTES.ADMIN_SETTINGS, icon: Settings },

      { id: "e-bk-1", title: "Đơn hẹn #ANM-771", subtitle: "Nguyễn Văn An • Spa Combo 5 bước (14:00)", category: "Đặt lịch", href: ROUTES.ADMIN_BOOKINGS, badge: "Chờ duyệt", icon: CalendarCheck },
      { id: "e-bk-2", title: "Đơn hẹn #BK-9021", subtitle: "Trần Thùy Linh • Khám cấp cứu thú cưng", category: "Đặt lịch", href: ROUTES.ADMIN_BOOKINGS, badge: "Khẩn cấp", icon: CalendarCheck },
      { id: "e-c-1", title: "Khách hàng Nguyễn Văn An", subtitle: "0901 234 567 • 12 lần sử dụng dịch vụ", category: "Khách hàng", href: ROUTES.ADMIN_CUSTOMERS, icon: Users },
      { id: "e-c-2", title: "Khách hàng Trần Thùy Linh", subtitle: "0912 345 678 • Thành viên Kim Cương", category: "Khách hàng", href: ROUTES.ADMIN_CUSTOMERS, icon: Users },
      { id: "e-p-1", title: "Thú cưng Mochi (Corgi)", subtitle: "Chủ nuôi: Trần Thùy Linh • 2 tuổi", category: "Thú cưng", href: ROUTES.ADMIN_PETS, icon: Dog },
      { id: "e-p-2", title: "Thú cưng Kẹo Kéo (Poodle Tiny)", subtitle: "Chủ nuôi: Lê Hoàng Long • 1.5 tuổi", category: "Thú cưng", href: ROUTES.ADMIN_PETS, icon: Dog },
      { id: "e-p-3", title: "Thú cưng Lili (Mèo Ba Tư trắng)", subtitle: "Chủ nuôi: Đỗ Mai Khanh • 3 tuổi", category: "Thú cưng", href: ROUTES.ADMIN_PETS, icon: Dog },
      { id: "e-s-1", title: "BS. Lê Minh Khoa", subtitle: "Bác sĩ trưởng khoa Thú y • vet@animora.vn", category: "Nhân sự", href: ROUTES.ADMIN_STAFF, icon: UserCheck },
      { id: "e-s-2", title: "KTV. Nguyễn Thu Hà", subtitle: "Chuyên viên Grooming & Spa • spa@animora.vn", category: "Nhân sự", href: ROUTES.ADMIN_STAFF, icon: UserCheck },
    ],
    []
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return allSearchItems
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [searchQuery, allSearchItems]);

  const handleAdminLogout = async () => {
    try {
      await devLogoutAction();
      localStorage.removeItem("animora_current_user");
      window.dispatchEvent(new Event("animora_user_sync"));
      toast.info("Đã đăng xuất khỏi tài khoản Quản trị viên!");
      router.push(ROUTES.LOGIN);
      router.refresh();
    } catch {
      window.location.href = ROUTES.LOGIN;
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast.success("Đã đánh dấu tất cả thông báo là đã đọc!");
  };

  const handleSelectNotification = (item: PortalNotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    if (item.href) {
      setShowNotifications(false);
      router.push(item.href);
    }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const popoverItems: PortalNotificationItem[] = useMemo(
    () =>
      notifications.map((n) => ({
        id: n.id,
        title: n.title,
        description: n.desc,
        time: n.time,
        unread: n.unread,
        icon: getAdminNotifIcon(n.type),
        href: n.href,
      })),
    [notifications]
  );

  return (
    <PortalHeader
      searchSlot={
        <PortalQuickSearch
          id="admin-quick-search"
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Tìm nhanh lịch hẹn, khách hàng, thú cưng... (Ctrl+K)"
          results={searchResults}
          quickLinks={adminQuickLinks}
          onSelectResult={(item) => {
            if (item.href) {
              router.push(item.href);
            }
          }}
        />
      }
      notificationSlot={
        <PortalNotificationPopover
          items={popoverItems}
          unreadCount={unreadCount}
          open={showNotifications}
          onOpenChange={setShowNotifications}
          title="Thông báo hệ thống"
          markAllReadLabel="Đọc tất cả"
          emptyLabel="Không có thông báo mới."
          tooltipLabel="Thông báo hệ thống"
          onMarkAllRead={markAllAsRead}
          onSelectItem={handleSelectNotification}
        />
      }
      showThemeToggle={true}
      userSlot={
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-muted/60 hover:bg-muted border border-border/80 hover:border-(--coral)/40 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
            <Avatar size="sm" className="size-7">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
                AD
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold leading-tight text-foreground">
                Quản trị viên
              </span>
              <span className="text-[10px] text-muted-foreground">
                admin@animora.vn
              </span>
            </div>
            <ChevronDown className="hidden sm:block size-3.5 text-muted-foreground shrink-0" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-60 rounded-2xl p-1.5 border border-border bg-popover text-popover-foreground shadow-xl"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-2 flex flex-col gap-1">
                <div className="text-xs font-bold text-foreground">
                  Quản trị viên Animora
                </div>
                <div className="text-[11px] font-normal text-muted-foreground truncate">
                  admin@animora.vn
                </div>
                <Badge
                  variant="secondary"
                  className="mt-1 w-fit bg-primary/10 dark:bg-(--coral)/20 text-primary dark:text-(--coral) text-[9px] font-extrabold uppercase px-2 py-0 h-4.5"
                >
                  <ShieldCheck className="size-2.5" />
                  Super Admin
                </Badge>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push(ROUTES.ADMIN)}
                className="rounded-xl px-2.5 py-2 text-xs font-semibold gap-2 cursor-pointer"
              >
                <LayoutDashboard className="size-3.5 text-primary dark:text-(--coral)" />
                <span>Bảng điều khiển tổng quan</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(ROUTES.ADMIN_SETTINGS)}
                className="rounded-xl px-2.5 py-2 text-xs font-semibold gap-2 cursor-pointer"
              >
                <Settings className="size-3.5 text-primary dark:text-(--coral)" />
                <span>Cài đặt hệ thống</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(ROUTES.HOME)}
                className="rounded-xl px-2.5 py-2 text-xs font-semibold gap-2 cursor-pointer"
              >
                <ExternalLink className="size-3.5 text-primary dark:text-(--coral)" />
                <span>Về trang khách hàng</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              onClick={handleAdminLogout}
              className="rounded-xl px-2.5 py-2 text-xs font-bold gap-2 cursor-pointer"
            >
              <LogOut className="size-3.5" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
      logoutButton={
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleAdminLogout}
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
