"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    Award,
    Calendar,
    CalendarCheck,
    CheckCircle2,
    Clock,
    Dog,
    HeartHandshake,
    LayoutDashboard,
    Package,
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
    PortalUserMenu,
} from "@/components/shared/portal";
import {
    MANAGER_NOTIF_STORAGE_KEY,
    MANAGER_NOTIF_SYNC_EVENT,
    markAllManagerNotificationsRead,
    markManagerNotificationRead,
    readManagerNotifications,
    type ManagerNotificationRecord,
} from "@/utils/clinicalSync";

function getManagerNotifIcon(type: ManagerNotificationRecord["type"]) {
    switch (type) {
        case "certificate":
            return <Award className="size-4 text-[#FF7F6B]" />;
        case "staff":
            return <UserCheck className="size-4 text-indigo-500" />;
        case "booking":
            return <Clock className="size-4 text-sky-500" />;
        case "stock":
            return <Package className="size-4 text-amber-500" />;
        case "adoption":
            return <HeartHandshake className="size-4 text-rose-500" />;
    }
}

export default function ManagerHeader() {
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState("");
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<
        ManagerNotificationRecord[]
    >([]);

    useEffect(() => {
        const sync = () => setNotifications(readManagerNotifications());
        sync();
        const handleStorage = (e: StorageEvent) => {
            if (e.key === MANAGER_NOTIF_STORAGE_KEY) sync();
        };
        window.addEventListener(MANAGER_NOTIF_SYNC_EVENT, sync);
        window.addEventListener("storage", handleStorage);
        return () => {
            window.removeEventListener(MANAGER_NOTIF_SYNC_EVENT, sync);
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    // Quick links for search
    const managerQuickLinks: PortalSearchResultItem[] = useMemo(
        () => [
            {
                id: "mql-bookings",
                title: "Duyệt Đặt lịch",
                href: ROUTES.MANAGER_BOOKINGS,
                icon: CalendarCheck,
            },
            {
                id: "mql-staff",
                title: "Quản lý Nhân sự & Bác sĩ",
                href: ROUTES.MANAGER_STAFF,
                icon: UserCheck,
            },
            {
                id: "mql-schedule",
                title: "Xếp ca & Lịch làm",
                href: ROUTES.MANAGER_SCHEDULE,
                icon: Calendar,
            },
            {
                id: "mql-shop",
                title: "Cửa hàng & Kho NCC",
                href: ROUTES.MANAGER_SHOP,
                icon: ShoppingBag,
            },
            {
                id: "mql-adoptions",
                title: "Duyệt Nhận nuôi",
                href: ROUTES.MANAGER_ADOPTIONS,
                icon: HeartHandshake,
            },
            {
                id: "mql-finance",
                title: "Doanh thu & Lương",
                href: ROUTES.MANAGER_FINANCE,
                icon: TrendingUp,
            },
        ],
        [],
    );

    // Search items pool
    const allSearchItems: PortalSearchResultItem[] = useMemo(
        () => [
            {
                id: "m-overview",
                title: "Tổng quan Vận hành (Manager Dashboard)",
                subtitle: "KPI lịch hẹn, nhân sự và tồn kho",
                category: "Trang",
                href: ROUTES.MANAGER,
                icon: LayoutDashboard,
            },
            {
                id: "m-bookings",
                title: "Quản lý & Duyệt Đặt lịch hẹn",
                subtitle: "Xét duyệt ca khám, đổi lịch và phân công bác sĩ",
                category: "Trang",
                href: ROUTES.MANAGER_BOOKINGS,
                icon: CalendarCheck,
                badge: "Nghiệp vụ",
            },
            {
                id: "m-customers",
                title: "Khách hàng & Hội viên",
                subtitle: "Tra cứu hồ sơ khách hàng và dịch vụ",
                category: "Trang",
                href: ROUTES.MANAGER_CUSTOMERS,
                icon: Users,
            },
            {
                id: "m-pets",
                title: "Hồ sơ Thú cưng & Bệnh án",
                subtitle: "Quản lý thú cưng, sổ tiêm chủng và vi-chip",
                category: "Trang",
                href: ROUTES.MANAGER_PETS,
                icon: Dog,
            },
            {
                id: "m-staff",
                title: "Nhân sự & Tính hoa hồng",
                subtitle: "Duyệt đơn nghỉ phép, tính lương và phân bổ",
                category: "Trang",
                href: ROUTES.MANAGER_STAFF,
                icon: UserCheck,
            },
            {
                id: "m-schedule",
                title: "Điều phối Lịch trực & Phân ca",
                subtitle: "Bảng phân ca làm việc tuần/tháng chuyên viên",
                category: "Trang",
                href: ROUTES.MANAGER_SCHEDULE,
                icon: Calendar,
            },
            {
                id: "m-shop",
                title: "Quản lý Cửa hàng, Kho & NCC",
                subtitle: "Nhập xuất hàng, cảnh báo tồn kho và hoàn trả",
                category: "Trang",
                href: ROUTES.MANAGER_SHOP,
                icon: ShoppingBag,
            },
            {
                id: "m-adoptions",
                title: "Xét duyệt Hồ sơ Nhận nuôi",
                subtitle: "Duyệt nhận nuôi thú cưng & liên kết trạm cứu hộ",
                category: "Trang",
                href: ROUTES.MANAGER_ADOPTIONS,
                icon: HeartHandshake,
            },
            {
                id: "m-finance",
                title: "Báo cáo Doanh thu & Kế toán dòng tiền",
                subtitle: "Đối soát thu chi dịch vụ và bán lẻ",
                category: "Trang",
                href: ROUTES.MANAGER_FINANCE,
                icon: TrendingUp,
            },
            {
                id: "m-vouchers",
                title: "Quản lý Mã giảm giá & Ưu đãi",
                subtitle: "Thiết lập coupon và voucher thành viên",
                category: "Trang",
                href: ROUTES.MANAGER_VOUCHERS,
                icon: Ticket,
            },
        ],
        [],
    );

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase().trim();
        return allSearchItems
            .filter(
                (item) =>
                    item.title.toLowerCase().includes(q) ||
                    item.subtitle?.toLowerCase().includes(q) ||
                    item.category?.toLowerCase().includes(q),
            )
            .slice(0, 8);
    }, [searchQuery, allSearchItems]);

    const handleManagerLogout = async () => {
        try {
            await devLogoutAction();
            localStorage.removeItem("animora_current_user");
            window.dispatchEvent(new Event("animora_user_sync"));
            toast.info("Đã đăng xuất khỏi cổng Quản lý nghiệp vụ!");
            router.push(ROUTES.LOGIN);
            router.refresh();
        } catch {
            window.location.href = ROUTES.LOGIN;
        }
    };

    const markAllAsRead = () => {
        setNotifications(markAllManagerNotificationsRead());
        toast.success("Đã đánh dấu tất cả thông báo là đã đọc!");
    };

    const handleSelectNotification = (item: PortalNotificationItem) => {
        setNotifications(markManagerNotificationRead(item.id));
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
                icon: getManagerNotifIcon(n.type),
                href: n.href,
            })),
        [notifications],
    );

    return (
        <PortalHeader
            searchSlot={
                <PortalQuickSearch
                    id="manager-quick-search"
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    placeholder="Tìm nghiệp vụ, ca trực, lịch hẹn... (Ctrl+K)"
                    results={searchResults}
                    quickLinks={managerQuickLinks}
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
                    title="Thông báo vận hành"
                    markAllReadLabel="Đọc tất cả"
                    emptyLabel="Không có thông báo mới."
                    tooltipLabel="Thông báo vận hành"
                    onMarkAllRead={markAllAsRead}
                    onSelectItem={handleSelectNotification}
                />
            }
            showThemeToggle={true}
            userSlot={
                <PortalUserMenu
                    name="Animora Manager"
                    subtitle="manager@animora.vn"
                    initials="QL"
                    avatarFallbackClassName="bg-linear-to-br from-indigo-600 to-indigo-700 text-white font-bold text-[11px]"
                    avatarRingClassName="ring-indigo-500/15 dark:ring-indigo-400/25"
                    triggerHoverClassName="hover:border-indigo-400/60 dark:hover:border-indigo-400/50"
                    roleBadge={{
                        label: "Manager",
                        icon: UserCheck,
                        className:
                            "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300",
                    }}
                    menuItems={[
                        {
                            label: "Tổng quan Vận hành",
                            icon: LayoutDashboard,
                            iconClassName: "text-indigo-600 dark:text-indigo-400",
                            onClick: () => router.push(ROUTES.MANAGER),
                        },
                        {
                            label: "Duyệt Đặt Lịch Hẹn",
                            icon: CalendarCheck,
                            iconClassName: "text-indigo-600 dark:text-indigo-400",
                            onClick: () => router.push(ROUTES.MANAGER_BOOKINGS),
                        },
                        {
                            label: "Nhân Sự & Ca Trực",
                            icon: UserCheck,
                            iconClassName: "text-indigo-600 dark:text-indigo-400",
                            onClick: () => router.push(ROUTES.MANAGER_STAFF),
                        },
                    ]}
                    logoutLabel="Đăng xuất Quản lý"
                    onLogout={handleManagerLogout}
                />
            }
        />
    );
}
