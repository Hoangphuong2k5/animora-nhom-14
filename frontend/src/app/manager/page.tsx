"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  ShoppingBag,
  Users,
  AlertTriangle,
  PackagePlus,
  Plus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ROUTES } from "@/constants/config.constant";
import { safeGetStorage } from "@/utils/cartLogic";
import { Booking } from "@/types";
import { createSeededServiceBookings } from "@/data/serviceBookingData";
import {
  MANAGER_STORAGE_KEYS,
  SEED_PURCHASE_ORDERS,
  PurchaseOrder,
} from "@/data/managerOpsData";
import {
  readAllExpertShiftRequests,
  EXPERT_SYNC_EVENT,
  ADMIN_BOOKINGS_SYNC_EVENT,
} from "@/utils/clinicalSync";
import { ORDERS_SYNC_EVENT, readOrdersFromStorage } from "@/utils/orderSync";
import { initialProducts } from "@/data/mockData";
import {
  PortalKpiStatCard,
  PortalLeaderboardsSection,
  PortalRevenueAnalyticsSection,
  PortalWelcomeHero,
  type PortalKpiCardConfig,
} from "@/components/shared/portal/dashboard";

interface LowStockSummaryItem {
  id: string;
  name: string;
  stock: number;
  image?: string;
}

export default function ManagerDashboardPage() {
  const [todayBookingsCount, setTodayBookingsCount] = useState<number>(14);
  const [pendingStaffReqs, setPendingStaffReqs] = useState<number>(0);
  const [pendingBookingsCount, setPendingBookingsCount] = useState<number>(0);
  const [totalOrdersCount, setTotalOrdersCount] = useState<number>(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const [activePOsCount, setActivePOsCount] = useState<number>(0);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockSummaryItem[]>([]);
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const reload = () => {
      const saved = safeGetStorage<Booking[]>("animora_bookings_v2", []);
      const list =
        Array.isArray(saved) && saved.length > 0 ? saved : createSeededServiceBookings();
      setTodayBookingsCount(list.length > 0 ? list.length : 14);
      setPendingBookingsCount(list.filter((b) => b.status === "Mới" || !b.status).length);

      const expertReqs = readAllExpertShiftRequests();
      setPendingStaffReqs(expertReqs.filter((r) => r.request.status === "pending").length);

      const savedPOs = safeGetStorage<PurchaseOrder[]>(
        MANAGER_STORAGE_KEYS.purchaseOrders,
        SEED_PURCHASE_ORDERS
      );
      setActivePOsCount(
        savedPOs.filter(
          (p) =>
            p.status !== "received" &&
            p.status !== "received_partial" &&
            p.status !== "supplier_rejected"
        ).length
      );

      const savedOrders = readOrdersFromStorage();
      setTotalOrdersCount(savedOrders.length);
      setPendingOrdersCount(
        savedOrders.filter((o) => o.status === "pending" || o.status === "packing").length
      );

      const savedProds = safeGetStorage<
        Array<{ id: string; name: string; stock?: number; image?: string }>
      >("animora_shop_products_v2", []);
      const prodSource =
        Array.isArray(savedProds) && savedProds.length > 0
          ? savedProds
          : initialProducts.map((p, i) => ({
              id: p.id,
              name: p.name,
              stock: p.stock || (i === 1 ? 3 : i === 4 ? 2 : 25),
              image: p.image,
            }));
      setLowStockProducts(
        prodSource
          .filter((p) => (p.stock || 0) < 5)
          .sort((a, b) => (a.stock || 0) - (b.stock || 0))
          .map((p) => ({
            id: p.id,
            name: p.name,
            stock: p.stock || 0,
            image: p.image,
          }))
      );
    };

    reload();
    window.addEventListener(EXPERT_SYNC_EVENT, reload);
    window.addEventListener(ADMIN_BOOKINGS_SYNC_EVENT, reload);
    window.addEventListener(ORDERS_SYNC_EVENT, reload);
    return () => {
      window.removeEventListener(EXPERT_SYNC_EVENT, reload);
      window.removeEventListener(ADMIN_BOOKINGS_SYNC_EVENT, reload);
      window.removeEventListener(ORDERS_SYNC_EVENT, reload);
    };
  }, []);

  const kpiCards: PortalKpiCardConfig[] = [
    {
      href: `${ROUTES.MANAGER_BOOKINGS}?status=pending`,
      title: "Lịch hẹn dịch vụ",
      value: todayBookingsCount,
      unit: "lịch",
      badgeText: `${pendingBookingsCount} ca chờ duyệt`,
      Icon: CalendarCheck,
      accentBar: "from-[#6B1F2E] to-[#FF7F6B]",
      iconBg: "bg-[#6B1F2E]/10 text-[#6B1F2E] dark:bg-[#6B1F2E]/25 dark:text-[#FF7F6B]",
      badgeStyle:
        "bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
      dotColor: "bg-amber-500",
      hoverBorder: "hover:border-[#6B1F2E]/30 dark:hover:border-[#FF7F6B]/30",
    },
    {
      href: pendingStaffReqs > 0 ? "/manager/staff?tab=requests" : "/manager/staff",
      title: "Nhân sự & Phép năm",
      value: pendingStaffReqs,
      unit: "yêu cầu",
      badgeText: "Chờ duyệt nghỉ / đổi ca",
      Icon: Users,
      accentBar: "from-emerald-500 to-teal-400",
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      badgeStyle:
        "bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
      dotColor: "bg-emerald-500",
      hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-500/30",
    },
    {
      href: "/manager/shop?tab=orders",
      title: "Đơn hàng & Kho NCC",
      value: totalOrdersCount,
      unit: "đơn",
      badgeText: `${pendingOrdersCount} chờ xử lý · ${activePOsCount} PO`,
      Icon: ShoppingBag,
      accentBar: "from-blue-600 to-sky-400",
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      badgeStyle:
        "bg-sky-50 text-sky-700 border-sky-200/70 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
      dotColor: "bg-sky-500",
      hoverBorder: "hover:border-blue-300 dark:hover:border-blue-500/30",
    },
    {
      onClick: () => setIsLowStockModalOpen(true),
      title: "Tồn kho cần nhập (< 5)",
      value: lowStockProducts.length,
      unit: "sản phẩm",
      badgeText:
        lowStockProducts.length > 0
          ? lowStockProducts
              .map((p) => `${p.name.split(" ").slice(0, 3).join(" ")} (${p.stock})`)
              .join(" · ")
          : "Tồn kho an toàn",
      Icon: AlertTriangle,
      accentBar: "from-rose-600 to-amber-500",
      iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      badgeStyle:
        "bg-rose-50 text-rose-700 border-rose-200/70 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
      dotColor: "bg-rose-500",
      hoverBorder: "hover:border-rose-300 dark:hover:border-rose-500/30",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <PortalWelcomeHero
        title="Xin chào, Animora Manager!"
        subtitle={
          <>
            Tổng quan hiệu suất hệ sinh thái: hôm nay có{" "}
            <span className="font-bold text-[#FF7F6B]">{pendingBookingsCount} ca chờ duyệt</span>,{" "}
            <span className="font-bold text-[#FF7F6B]">{pendingOrdersCount} đơn hàng</span> cần xử
            lý và{" "}
            <span className="font-bold text-[#FF7F6B]">{pendingStaffReqs} yêu cầu nhân sự</span> chờ
            duyệt.
          </>
        }
        actions={
          <>
            <Link
              href={`${ROUTES.MANAGER_BOOKINGS}?status=pending`}
              className="px-4 py-2.5 rounded-xl bg-white text-[#6B1F2E] font-bold text-xs hover:bg-[#FFF4E8] transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 text-[#FF7F6B]" />
              <span>Duyệt lịch hẹn</span>
            </Link>
            <Link
              href="/manager/staff"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-all border border-white/20 flex items-center gap-2 cursor-pointer backdrop-blur-sm"
            >
              <Users className="w-4 h-4 text-[#A7F3D0]" />
              <span>Quản lý nhân sự</span>
            </Link>
            <Link
              href="/manager/shop?tab=orders"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-all border border-white/20 flex items-center gap-2 cursor-pointer backdrop-blur-sm"
            >
              <ShoppingBag className="w-4 h-4 text-[#FFD166]" />
              <span>Xử lý đơn hàng</span>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <PortalKpiStatCard key={kpi.title} {...kpi} />
        ))}
      </div>

      <PortalRevenueAnalyticsSection />

      <PortalLeaderboardsSection staffLinkHref={ROUTES.MANAGER_STAFF} />

      <Dialog
        open={isLowStockModalOpen}
        onOpenChange={(open) => setIsLowStockModalOpen(open)}
      >
        <DialogContent
          showCloseButton={true}
          className="flex flex-col sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl"
        >
          <DialogHeader className="pr-8">
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-rose-500">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Sản Phẩm Tồn Kho Cần Nhập (&lt; 5)</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Các mặt hàng có số lượng tồn kho dưới 5 đơn vị cần lập đơn PO gửi Nhà cung cấp.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 text-xs pt-2 w-full min-w-0">
            {lowStockProducts.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-border text-center text-muted-foreground">
                Tất cả sản phẩm trong kho đều đang ở mức tồn kho an toàn (&ge; 5).
              </div>
            ) : (
              lowStockProducts.map((item) => (
                <div
                  key={item.id}
                  className="w-full min-w-0 p-3 rounded-2xl border border-border/70 bg-muted/30 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-xl object-cover border border-border shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-foreground truncate">{item.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono truncate">
                        Mã: {item.id}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        item.stock === 0
                          ? "bg-rose-500/15 text-rose-500"
                          : "bg-amber-500/15 text-amber-500"
                      }`}
                    >
                      {item.stock} món
                    </span>
                    <Link
                      href={`/manager/shop?tab=suppliers&createPO=1&productId=${encodeURIComponent(item.id)}`}
                      onClick={() => setIsLowStockModalOpen(false)}
                      title={`Tạo đơn PO nhập ${item.name}`}
                      className="p-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-500 border border-emerald-500/30 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 text-xs">
            <button
              type="button"
              onClick={() => setIsLowStockModalOpen(false)}
              className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted font-semibold cursor-pointer"
            >
              Đóng
            </button>
            <Link
              href="/manager/shop?tab=suppliers&createPO=1"
              onClick={() => setIsLowStockModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold inline-flex items-center gap-1.5"
            >
              <PackagePlus className="w-4 h-4" />
              <span>Tạo đơn PO nhập kho</span>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
