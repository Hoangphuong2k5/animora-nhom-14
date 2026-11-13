"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  ShoppingBag,
  Users,
  TrendingUp,
  TrendingDown,
  Sparkles,
  AlertCircle,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Star,
  Award,
  ArrowRight,
  ShieldAlert,
  Package,
  HeartHandshake,
  DollarSign,
  Phone,
  Calendar,
} from "lucide-react";
import { ROUTES } from "@/constants/config.constant";
import { safeGetStorage } from "@/utils/cartLogic";
import { Booking } from "@/types";
import { createSeededServiceBookings } from "@/data/serviceBookingData";
import { AdminAnalyticsChart } from "@/components/admin/AdminAnalyticsChart";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface TopService {
  name: string;
  category: string;
  bookingsCount: number;
  revenue: number;
}

interface TopStaff {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  casesCount: number;
}

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const saved = safeGetStorage<Booking[]>("animora_bookings_v2", []);
    if (Array.isArray(saved) && saved.length > 0) {
      setBookings(saved);
    } else {
      setBookings(createSeededServiceBookings());
    }
  }, []);

  const todayBookingsCount = 14;
  const monthlyRevenue = "48.650.000₫";
  const newCustomersCount = 128;
  const pendingOrdersCount = 9;

  // Recent bookings list (Take first 5)
  const recentBookings = bookings.slice(0, 5);

  const topServices: TopService[] = [
    { name: "Spa Cắt Tỉa & Tắm Thảo Dược", category: "Spa & Grooming", bookingsCount: 168, revenue: 58800000 },
    { name: "Khám Tổng Quát & Siêu Âm", category: "Khám bệnh", bookingsCount: 124, revenue: 37200000 },
    { name: "Tiêm Vaccine 7 Bệnh Định Kỳ", category: "Tiêm phòng", bookingsCount: 95, revenue: 28500000 },
    { name: "Lấy Cao Răng Không Gây Mê", category: "Nha khoa", bookingsCount: 62, revenue: 21700000 },
  ];

  const topStaffs: TopStaff[] = [
    {
      name: "BS. CKI Nguyễn Quốc Hùng",
      role: "Bác sĩ Ngoại khoa",
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
      rating: 4.95,
      reviewCount: 86,
      casesCount: 142,
    },
    {
      name: "Trần Thảo Vy",
      role: "Master Groomer",
      avatar: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=150&auto=format&fit=crop&q=80",
      rating: 4.92,
      reviewCount: 94,
      casesCount: 168,
    },
    {
      name: "Lê Hoàng Toàn",
      role: "Chuyên viên Spa Cấp cao",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      rating: 4.88,
      reviewCount: 62,
      casesCount: 115,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#6B1F2E] via-[#7B2435] to-[#8C2B3E] text-white shadow-xl shadow-[#6B1F2E]/15 relative overflow-hidden">
        {/* Ambient Decorative Accents */}
        <div className="absolute -right-8 -bottom-10 w-64 h-64 rounded-full bg-white/[0.07] pointer-events-none blur-2xl" />
        <div className="absolute right-40 -top-12 w-48 h-48 rounded-full bg-[#FF7F6B]/15 pointer-events-none blur-3xl" />

        <div className="relative z-10 space-y-1.5 flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-[#FFF4E8]">
            <Sparkles className="w-3.5 h-3.5 text-[#FF7F6B]" />
            Animora Management Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight !text-white">
            Xin chào, Animora Administrator!
          </h1>
          <p className="text-xs sm:text-sm !text-white/90 max-w-xl">
            Tổng quan hiệu suất hệ sinh thái: hôm nay có <span className="font-bold text-[#FF7F6B]">{todayBookingsCount} ca hẹn</span>, <span className="font-bold text-[#FF7F6B]">{pendingOrdersCount} đơn hàng</span> cần xử lý và 4 thông báo cần duyệt.
          </p>
        </div>

        {/* Quick Shortcut Buttons - Right-aligned & Flush to edge */}
        <div className="relative z-10 flex flex-wrap items-center justify-start lg:justify-end gap-2.5 shrink-0 lg:ml-auto">
          <Link
            href={ROUTES.ADMIN_BOOKINGS}
            className="px-4 py-2.5 rounded-xl bg-white text-[#6B1F2E] font-bold text-xs hover:bg-[#FFF4E8] transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4 text-[#FF7F6B]" />
            <span>Duyệt lịch hẹn</span>
          </Link>
          <Link
            href={ROUTES.ADMIN_SHOP}
            className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-all border border-white/20 flex items-center gap-2 cursor-pointer backdrop-blur-sm"
          >
            <ShoppingBag className="w-4 h-4 text-[#FFD166]" />
            <span>Xử lý đơn hàng</span>
          </Link>
          <Link
            href={ROUTES.ADMIN_ADOPTIONS}
            className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-all border border-white/20 flex items-center gap-2 cursor-pointer backdrop-blur-sm"
          >
            <HeartHandshake className="w-4 h-4 text-[#F4B6C2]" />
            <span>Đơn nhận nuôi</span>
          </Link>
        </div>
      </div>

      {/* 2. Hàng 1: 4 thẻ KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Lịch hẹn hôm nay */}
        <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-muted-foreground uppercase tracking-wider">
              Lịch hẹn hôm nay
            </span>
            <span className="p-2 rounded-xl bg-[#6B1F2E]/10 text-[#6B1F2E] dark:bg-[#6B1F2E]/20 dark:text-[#FF7F6B]">
              <CalendarCheck className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground">
              {todayBookingsCount} <span className="text-sm font-semibold text-zinc-400 dark:text-muted-foreground">lịch</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12.0%</span>
              <span className="text-zinc-400 dark:text-muted-foreground font-normal">so với hôm qua</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Doanh thu tháng */}
        <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-muted-foreground uppercase tracking-wider">
              Doanh thu tháng
            </span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground">
              {monthlyRevenue}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4%</span>
              <span className="text-zinc-400 dark:text-muted-foreground font-normal">so với tháng trước</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Khách hàng mới */}
        <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-muted-foreground uppercase tracking-wider">
              Khách hàng mới
            </span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground">
              {newCustomersCount} <span className="text-sm font-semibold text-zinc-400 dark:text-muted-foreground">khách</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+24.5%</span>
              <span className="text-zinc-400 dark:text-muted-foreground font-normal">so với tháng trước</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Đơn hàng chờ xử lý */}
        <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-muted-foreground uppercase tracking-wider">
              Đơn hàng chờ xử lý
            </span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground">
              {pendingOrdersCount} <span className="text-sm font-semibold text-zinc-400 dark:text-muted-foreground">đơn</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold mt-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-5.2%</span>
              <span className="text-zinc-400 dark:text-muted-foreground font-normal">so với tuần trước</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Hàng 2: Biểu đồ (Doanh thu & Cơ cấu dịch vụ) */}
      <AdminAnalyticsChart />

      {/* 4. Hàng 3: Bảng và widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bảng lịch hẹn gần đây (Chiếm 2 cột) */}
        <div className="lg:col-span-2 p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FF7F6B]" />
                Lịch Hẹn Gần Đây
              </h2>
              <p className="text-xs text-zinc-400 dark:text-muted-foreground mt-0.5">
                Các ca dịch vụ vừa được khách hàng đặt hẹn qua website
              </p>
            </div>
            <Link
              href={ROUTES.ADMIN_BOOKINGS}
              className="text-xs font-bold text-[#6B1F2E] dark:text-[#FF7F6B] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Table className="w-full text-left text-xs">
            <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
              <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
                <TableHead className="py-2.5 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Mã lịch</TableHead>
                <TableHead className="py-2.5 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Khách hàng</TableHead>
                <TableHead className="py-2.5 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Thú cưng</TableHead>
                <TableHead className="py-2.5 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Dịch vụ</TableHead>
                <TableHead className="py-2.5 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Chuyên viên</TableHead>
                <TableHead className="py-2.5 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Thời gian</TableHead>
                <TableHead className="py-2.5 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Trạng thái</TableHead>
                <TableHead className="py-2.5 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Chi tiết</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
              {recentBookings.map((b, idx) => {
                const status = b.status || "Mới";
                const badgeClasses =
                  status === "Hoàn thành"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : status === "Đã xác nhận"
                    ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
                    : status === "Đã hủy"
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";

                return (
                  <TableRow key={b.id || idx} className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors">
                    <TableCell className="py-3 px-3 font-mono font-bold text-zinc-900 dark:text-foreground">
                      {b.code || `BK-${b.id?.slice(0, 5) || idx + 101}`}
                    </TableCell>
                    <TableCell className="py-3 px-3">
                      <div className="font-semibold text-zinc-900 dark:text-foreground">{b.fullName}</div>
                      <div className="text-[11px] text-zinc-400 dark:text-muted-foreground">{b.phone}</div>
                    </TableCell>
                    <TableCell className="py-3 px-3">
                      <span className="font-medium text-zinc-800 dark:text-foreground/90">
                        {b.petName || "Bé cưng"}
                      </span>
                      <span className="text-[11px] text-zinc-400 dark:text-muted-foreground block">({b.petType})</span>
                    </TableCell>
                    <TableCell className="py-3 px-3 font-medium text-zinc-800 dark:text-foreground/90 max-w-[160px] whitespace-normal">
                      {b.service}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-zinc-500 dark:text-muted-foreground font-medium">
                      {idx % 2 === 0 ? "BS. Hùng" : "Groomer Vy"}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-zinc-500 dark:text-muted-foreground">
                      <div>{b.date}</div>
                      <div className="text-[11px] text-zinc-400 dark:text-muted-foreground">{b.timeSlot || "09:00 - 10:30"}</div>
                    </TableCell>
                    <TableCell className="py-3 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold border ${badgeClasses}`}>
                        {status}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(b)}
                        className="p-1.5 rounded-lg text-zinc-400 dark:text-muted-foreground hover:text-[#6B1F2E] dark:hover:text-[#FF7F6B] hover:bg-zinc-100 dark:hover:bg-muted transition-colors cursor-pointer"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* 2 Widgets cột phải: Top dịch vụ & Top chuyên viên */}
        <div className="space-y-6">
          {/* Widget 1: Top dịch vụ */}
          <div className="p-5 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-foreground flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#FF7F6B]" />
                Top Dịch Vụ Tháng Này
              </h3>
              <span className="text-[11px] font-semibold text-zinc-400 dark:text-muted-foreground">Lượt / Doanh thu</span>
            </div>

            <div className="space-y-3">
              {topServices.map((svc, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="font-bold text-zinc-800 dark:text-foreground/90 truncate">
                      {svc.name}
                    </div>
                    <div className="text-[11px] text-zinc-400 dark:text-muted-foreground">{svc.category}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                      {svc.bookingsCount} lượt
                    </div>
                    <div className="text-[11px] text-zinc-400 dark:text-muted-foreground">
                      {(svc.revenue / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 2: Top chuyên viên */}
          <div className="p-5 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-foreground flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                Top Chuyên Viên Xuất Sắc
              </h3>
              <Link
                href={ROUTES.ADMIN_STAFF}
                className="text-[11px] font-bold text-[#6B1F2E] dark:text-[#FF7F6B] hover:underline"
              >
                Nhân sự
              </Link>
            </div>

            <div className="space-y-3">
              {topStaffs.map((staff, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <img
                    src={staff.avatar}
                    alt={staff.name}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-border shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-zinc-900 dark:text-foreground truncate">
                      {staff.name}
                    </div>
                    <div className="text-[11px] text-zinc-400 dark:text-muted-foreground truncate">{staff.role}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-xs font-extrabold text-amber-600 dark:text-amber-400 justify-end">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{staff.rating}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 dark:text-muted-foreground">{staff.casesCount} ca</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Hàng 4: Cần xử lý (4 thẻ cảnh báo / tác vụ cần phê duyệt) */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-foreground">
            Cần Xử Lý Ngay (Action Required)
          </h2>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            4 tác vụ
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Sản phẩm sắp hết hàng */}
          <Link
            href={`${ROUTES.ADMIN_SHOP}?tab=inventory`}
            className="p-5 rounded-2xl border border-rose-200/80 dark:border-rose-950/60 bg-rose-50/40 dark:bg-rose-950/20 hover:border-rose-400 transition-all group flex flex-col justify-between space-y-3 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Package className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full bg-rose-500/10">
                Kho hàng
              </span>
            </div>
            <div>
              <div className="text-lg font-bold text-zinc-900 dark:text-foreground">
                3 sản phẩm sắp hết hàng
              </div>
              <p className="text-xs text-zinc-500 dark:text-muted-foreground mt-1">
                Tồn kho dưới ngưỡng an toàn (dưới 5 đơn vị). Cần tạo phiếu nhập ngay.
              </p>
            </div>
            <div className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Kiểm tra kho</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 2: Yêu cầu hoàn tiền/trả hàng */}
          <Link
            href={`${ROUTES.ADMIN_SHOP}?tab=returns`}
            className="p-5 rounded-2xl border border-amber-200/80 dark:border-amber-950/60 bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-400 transition-all group flex flex-col justify-between space-y-3 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <DollarSign className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10">
                Chờ duyệt
              </span>
            </div>
            <div>
              <div className="text-lg font-bold text-zinc-900 dark:text-foreground">
                2 yêu cầu hoàn tiền / trả hàng
              </div>
              <p className="text-xs text-zinc-500 dark:text-muted-foreground mt-1">
                Khách hàng yêu cầu đổi trả thức ăn thú cưng do bao bì bị móp méo vận chuyển.
              </p>
            </div>
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Xem xét hoàn tiền</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 3: Hồ sơ nhận nuôi chờ duyệt */}
          <Link
            href={`${ROUTES.ADMIN_ADOPTIONS}?tab=requests`}
            className="p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-950/60 bg-emerald-50/40 dark:bg-emerald-950/20 hover:border-emerald-400 transition-all group flex flex-col justify-between space-y-3 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <HeartHandshake className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10">
                Cứu hộ
              </span>
            </div>
            <div>
              <div className="text-lg font-bold text-zinc-900 dark:text-foreground">
                5 hồ sơ nhận nuôi chờ duyệt
              </div>
              <p className="text-xs text-zinc-500 dark:text-muted-foreground mt-1">
                Các bé Mochi, Bắp và LuLu đang có người nộp đơn nhận nuôi và cam kết chăm sóc.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Phỏng vấn & duyệt</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 4: Đơn hủy lịch bị tính phí 50% */}
          <Link
            href={ROUTES.ADMIN_BOOKINGS}
            className="p-5 rounded-2xl border border-[#6B1F2E]/20 dark:border-[#6B1F2E]/40 bg-[#6B1F2E]/5 dark:bg-[#6B1F2E]/15 hover:border-[#6B1F2E] transition-all group flex flex-col justify-between space-y-3 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-[#6B1F2E]/10 text-[#6B1F2E] dark:text-[#FF7F6B]">
                <AlertCircle className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B1F2E] dark:text-[#FF7F6B] px-2 py-0.5 rounded-full bg-[#6B1F2E]/10">
                Quy tắc 50%
              </span>
            </div>
            <div>
              <div className="text-lg font-bold text-zinc-900 dark:text-foreground">
                1 đơn hủy lịch bị tính phí 50%
              </div>
              <p className="text-xs text-zinc-500 dark:text-muted-foreground mt-1">
                Khách hủy ca Spa dưới 3 tiếng so với giờ hẹn. Áp dụng khấu trừ 50% theo quy chế.
              </p>
            </div>
            <div className="text-xs font-bold text-[#6B1F2E] dark:text-[#FF7F6B] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Xử lý khoản phí</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Booking Detail Drawer */}
      <Sheet
        open={Boolean(selectedBooking)}
        onOpenChange={(open) => {
          if (!open) setSelectedBooking(null);
        }}
      >
        <SheetContent
          side="right"
          showCloseButton={true}
          className="w-full data-[side=right]:w-full data-[side=right]:sm:max-w-lg p-0 gap-0 flex flex-col h-full bg-popover text-popover-foreground border-l border-border shadow-2xl"
        >
          {selectedBooking && (
            <>
              <SheetHeader className="px-6 py-4 border-b border-border shrink-0 pr-12">
                <span className="text-xs font-mono font-bold text-[#FF7F6B]">
                  {selectedBooking.code || `BK-${selectedBooking.id?.slice(0, 5)}`}
                </span>
                <SheetTitle className="text-base font-bold text-zinc-900 dark:text-foreground">
                  Chi Tiết Lịch Hẹn
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Thông tin nhanh ca dịch vụ của khách hàng
                </SheetDescription>
              </SheetHeader>

              <ScrollArea className="flex-1 min-h-0 overflow-hidden">
                <div className="p-6 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-muted/60">
                    <div>
                      <span className="text-zinc-400 dark:text-muted-foreground block font-medium">Khách hàng:</span>
                      <span className="font-bold text-zinc-900 dark:text-foreground">
                        {selectedBooking.fullName}
                      </span>
                      <div className="text-zinc-500 dark:text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-[#FF7F6B]" />
                        <span>{selectedBooking.phone}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-zinc-400 dark:text-muted-foreground block font-medium">Thú cưng:</span>
                      <span className="font-bold text-zinc-900 dark:text-foreground">
                        {selectedBooking.petName || "Bé cưng"} ({selectedBooking.petType})
                      </span>
                      <div className="text-zinc-500 dark:text-muted-foreground mt-0.5">
                        {selectedBooking.petBreed || "Chưa rõ giống"}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-muted/60 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-zinc-400 dark:text-muted-foreground">Dịch vụ:</span>
                      <span className="font-bold text-zinc-900 dark:text-foreground">
                        {selectedBooking.service}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400 dark:text-muted-foreground">Thời gian hẹn:</span>
                      <span className="font-semibold text-zinc-800 dark:text-foreground/90 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#FF7F6B]" />
                        {selectedBooking.date} ({selectedBooking.timeSlot || "09:00"})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400 dark:text-muted-foreground">Trạng thái:</span>
                      <span className="font-bold text-[#6B1F2E] dark:text-[#FF7F6B]">
                        {selectedBooking.status || "Mới"}
                      </span>
                    </div>
                  </div>

                  {selectedBooking.note && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                      <span className="font-bold block mb-0.5">Ghi chú của khách:</span>
                      {selectedBooking.note}
                    </div>
                  )}
                </div>
              </ScrollArea>

              <SheetFooter className="px-6 py-4 border-t border-border shrink-0 flex-row items-center justify-end gap-2">
                <Link
                  href={ROUTES.ADMIN_BOOKINGS}
                  className="px-4 py-2 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs transition-colors"
                >
                  Mở trang Quản lý Đặt lịch
                </Link>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
