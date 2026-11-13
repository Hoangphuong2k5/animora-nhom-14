"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Check,
  RotateCcw,
  Sparkles,
  Phone,
  Calendar,
  User,
  Dog,
  DollarSign,
  AlertTriangle,
  FileText,
  CreditCard,
  UserCheck,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";
import { safeGetStorage, safeSetStorage } from "@/utils/cartLogic";
import { Booking, BookingStatus } from "@/types";
import { createSeededServiceBookings } from "@/data/serviceBookingData";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

const RESCHEDULE_SLOTS = [
  "08:30 - 10:00",
  "10:00 - 11:30",
  "13:30 - 15:00",
  "15:00 - 16:30",
  "16:30 - 18:00",
];

export interface ExtendedBooking extends Booking {
  staffName?: string;
  price?: number;
  paymentMethod?: "online" | "counter";
  paymentStatus?: "paid" | "unpaid";
  cancellationFee?: number;
  prescription?: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<ExtendedBooking[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("all");
  const [filterService, setFilterService] = useState<string>("all");
  const [filterStaff, setFilterStaff] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Slide-over drawer state
  const [selectedBooking, setSelectedBooking] = useState<ExtendedBooking | null>(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [applyHalfFee, setApplyHalfFee] = useState(false);

  useEffect(() => {
    const saved = safeGetStorage<ExtendedBooking[]>("animora_bookings_v2", []);
    if (Array.isArray(saved) && saved.length > 0) {
      setBookings(saved);
    } else {
      const seeded = createSeededServiceBookings().map((b, i) => ({
        ...b,
        staffName: i % 2 === 0 ? "BS. CKI Nguyễn Quốc Hùng" : "Trần Thảo Vy (Groomer)",
        price: b.service.includes("Spa") ? 350000 : b.service.includes("Khám") ? 300000 : 250000,
        paymentMethod: (i % 3 === 0 ? "counter" : "online") as "counter" | "online",
        paymentStatus: (i % 4 === 0 ? "unpaid" : "paid") as "unpaid" | "paid",
        prescription: i % 2 === 0 ? "Vitamin B-Complex 1 viên/ngày x 7 ngày. Giữ ấm vết mổ." : undefined,
      }));
      setBookings(seeded);
      safeSetStorage("animora_bookings_v2", seeded);
    }
  }, []);

  const saveBookings = (updated: ExtendedBooking[]) => {
    setBookings(updated);
    safeSetStorage("animora_bookings_v2", updated);
  };

  const handleUpdateStatus = (id: string, newStatus: BookingStatus, extra?: Partial<ExtendedBooking>) => {
    const updated = bookings.map((b) => {
      if (b.id === id) {
        return {
          ...b,
          status: newStatus,
          ...(newStatus === "Đã xác nhận" ? { confirmedAt: new Date().toISOString() } : {}),
          ...(newStatus === "Hoàn thành" ? { completedAt: new Date().toISOString() } : {}),
          ...(newStatus === "Đã hủy" ? { cancelledAt: new Date().toISOString() } : {}),
          ...extra,
        };
      }
      return b;
    });

    saveBookings(updated);
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking(updated.find((b) => b.id === id) || null);
    }

    const statusText =
      newStatus === "Đã xác nhận"
        ? "Đã duyệt lịch hẹn thành công!"
        : newStatus === "Hoàn thành"
        ? "Đã đánh dấu hoàn thành dịch vụ!"
        : "Đã hủy lịch hẹn.";
    toast.success(statusText);
  };

  const handleConfirmCancel = () => {
    if (!selectedBooking) return;
    const price = selectedBooking.price || 300000;
    const fee = applyHalfFee ? Math.round(price * 0.5) : 0;

    handleUpdateStatus(selectedBooking.id, "Đã hủy", {
      cancelReason: cancelReason || (applyHalfFee ? "Hủy sát giờ hẹn (dưới 3h) - Áp dụng phạt 50%" : "Khách yêu cầu hủy"),
      cancellationFee: fee,
    });

    setCancelModalOpen(false);
    setCancelReason("");
    setApplyHalfFee(false);
  };

  const handleReschedule = () => {
    if (!selectedBooking || !newDate) {
      toast.error("Vui lòng chọn ngày mới!");
      return;
    }

    const updated = bookings.map((b) => {
      if (b.id === selectedBooking.id) {
        return {
          ...b,
          date: newDate,
          timeSlot: newTime || b.timeSlot,
          internalNote: `Đổi lịch từ ${b.date} sang ${newDate} (${newTime || b.timeSlot})`,
        };
      }
      return b;
    });

    saveBookings(updated);
    if (selectedBooking) {
      setSelectedBooking(updated.find((b) => b.id === selectedBooking.id) || null);
    }
    setIsRescheduleModalOpen(false);
    toast.success(`Đã dời lịch sang ${newDate} lúc ${newTime || "giờ cũ"}!`);
  };

  const handleResetData = () => {
    const seeded = createSeededServiceBookings().map((b, i) => ({
      ...b,
      staffName: i % 2 === 0 ? "BS. CKI Nguyễn Quốc Hùng" : "Trần Thảo Vy (Groomer)",
      price: b.service.includes("Spa") ? 350000 : b.service.includes("Khám") ? 300000 : 250000,
      paymentMethod: (i % 3 === 0 ? "counter" : "online") as "counter" | "online",
      paymentStatus: (i % 4 === 0 ? "unpaid" : "paid") as "unpaid" | "paid",
    }));
    saveBookings(seeded);
    toast.info("Đã khôi phục dữ liệu mẫu ban đầu.");
  };

  // Filter logic
  const filteredBookings = bookings.filter((b) => {
    // Status
    const matchStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "Mới"
        ? b.status === "Mới" || !b.status
        : b.status === filterStatus;

    // Service
    const matchService =
      filterService === "all" ? true : b.service.toLowerCase().includes(filterService.toLowerCase());

    // Staff
    const matchStaff =
      filterStaff === "all" ? true : (b.staffName || "").toLowerCase().includes(filterStaff.toLowerCase());

    // Payment
    const matchPayment =
      filterPayment === "all" ? true : b.paymentMethod === filterPayment;

    // Search query
    const query = searchQuery.toLowerCase().trim();
    const matchSearch =
      !query ||
      b.fullName.toLowerCase().includes(query) ||
      b.phone.includes(query) ||
      (b.petName && b.petName.toLowerCase().includes(query)) ||
      (b.code && b.code.toLowerCase().includes(query)) ||
      b.service.toLowerCase().includes(query);

    return matchStatus && matchService && matchStaff && matchPayment && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-[#6B1F2E] dark:text-[#FF7F6B]" />
            Quản Lý Đặt Lịch & Dịch Vụ
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Điều phối ca hẹn, duyệt lịch trực tuyến, áp dụng chính sách hủy và quản lý hồ sơ chăm sóc
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetData}
          className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-border hover:bg-zinc-100 dark:hover:bg-muted transition-colors text-zinc-600 dark:text-muted-foreground cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Dữ liệu mẫu</span>
        </button>
      </div>

      {/* 2. Filter Bar */}
      <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-3.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên khách, SĐT, tên bé cưng, mã lịch..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#FF7F6B]"
            />
          </div>

          {/* Quick Status Filters */}
          <Tabs
            value={filterStatus}
            onValueChange={(val) => {
              if (val) setFilterStatus(val as string);
            }}
          >
            <TabsList className="h-auto! flex-wrap gap-1.5 bg-[#FBF6F7] dark:bg-muted/80 p-1 rounded-2xl">
              {[
                { id: "all", label: `Tất cả (${bookings.length})` },
                { id: "Mới", label: `Chờ duyệt (${bookings.filter((b) => b.status === "Mới" || !b.status).length})` },
                { id: "Đã xác nhận", label: `Đã duyệt (${bookings.filter((b) => b.status === "Đã xác nhận").length})` },
                { id: "Hoàn thành", label: `Hoàn thành (${bookings.filter((b) => b.status === "Hoàn thành").length})` },
                { id: "Đã hủy", label: `Đã hủy (${bookings.filter((b) => b.status === "Đã hủy").length})` },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Secondary dropdown filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-100 dark:border-border text-xs">
          {/* Service filter */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Dịch vụ</label>
            <Select
              value={filterService}
              onValueChange={(val) => {
                if (val !== null) setFilterService(val);
              }}
              items={{
                all: "Tất cả dịch vụ",
                Spa: "Spa & Cắt tỉa",
                "Khám": "Khám thú y",
                "Tiêm": "Tiêm phòng vaccine",
                "Răng": "Nha khoa",
              }}
            >
              <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-medium px-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả dịch vụ</SelectItem>
                <SelectItem value="Spa">Spa & Cắt tỉa</SelectItem>
                <SelectItem value="Khám">Khám thú y</SelectItem>
                <SelectItem value="Tiêm">Tiêm phòng vaccine</SelectItem>
                <SelectItem value="Răng">Nha khoa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Staff filter */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Chuyên viên</label>
            <Select
              value={filterStaff}
              onValueChange={(val) => {
                if (val !== null) setFilterStaff(val);
              }}
              items={{
                all: "Tất cả chuyên viên",
                "Hùng": "BS. CKI Quốc Hùng",
                Vy: "Groomer Thảo Vy",
              }}
            >
              <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-medium px-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả chuyên viên</SelectItem>
                <SelectItem value="Hùng">BS. CKI Quốc Hùng</SelectItem>
                <SelectItem value="Vy">Groomer Thảo Vy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment method */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Hình thức thanh toán</label>
            <Select
              value={filterPayment}
              onValueChange={(val) => {
                if (val !== null) setFilterPayment(val);
              }}
              items={{
                all: "Tất cả hình thức",
                online: "Trả trước Online",
                counter: "Trả sau tại quầy",
              }}
            >
              <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-medium px-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả hình thức</SelectItem>
                <SelectItem value="online">Trả trước Online</SelectItem>
                <SelectItem value="counter">Trả sau tại quầy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active count badge */}
          <div className="flex items-end pb-1 justify-end">
            <span className="text-[11px] font-semibold text-zinc-400">
              Hiển thị <span className="font-bold text-[#6B1F2E] dark:text-[#FF7F6B]">{filteredBookings.length}</span> lịch hẹn
            </span>
          </div>
        </div>
      </div>

      {/* 3. Bookings Table */}
      <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-muted flex items-center justify-center mx-auto text-zinc-400">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-zinc-600 dark:text-muted-foreground">
              Chưa có dữ liệu lịch hẹn phù hợp với bộ lọc
            </p>
          </div>
        ) : (
          <Table className="w-full text-left text-xs">
            <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
              <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Mã lịch</TableHead>
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Khách hàng</TableHead>
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Thú cưng</TableHead>
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Dịch vụ</TableHead>
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Chuyên viên</TableHead>
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Giờ hẹn</TableHead>
                <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Tổng tiền</TableHead>
                <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Thanh toán</TableHead>
                <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Trạng thái</TableHead>
                <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
              {filteredBookings.map((b, idx) => {
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
                  <TableRow
                    key={b.id || idx}
                    className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors group"
                  >
                    {/* Code */}
                    <TableCell className="py-3.5 px-3 font-mono font-bold text-zinc-900 dark:text-foreground">
                      {b.code || `BK-${b.id?.slice(0, 5) || idx + 101}`}
                    </TableCell>

                    {/* Customer */}
                    <TableCell className="py-3.5 px-3">
                      <div className="font-bold text-zinc-900 dark:text-foreground">{b.fullName}</div>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#FF7F6B]" />
                        {b.phone}
                      </div>
                    </TableCell>

                    {/* Pet */}
                    <TableCell className="py-3.5 px-3">
                      <div className="font-semibold text-zinc-800 dark:text-foreground/90">
                        {b.petName || "Bé cưng"}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {b.petType} {b.petBreed ? `· ${b.petBreed}` : ""}
                      </div>
                    </TableCell>

                    {/* Service */}
                    <TableCell className="py-3.5 px-3 font-medium text-zinc-800 dark:text-foreground/90 max-w-[160px] whitespace-normal">
                      {b.service}
                    </TableCell>

                    {/* Staff */}
                    <TableCell className="py-3.5 px-3 text-zinc-500 font-medium">
                      {b.staffName || "BS. CKI Quốc Hùng"}
                    </TableCell>

                    {/* Schedule */}
                    <TableCell className="py-3.5 px-3">
                      <div className="font-semibold text-zinc-800 dark:text-foreground/90">{b.date}</div>
                      <div className="text-[11px] text-zinc-400">{b.timeSlot || "09:00 - 10:30"}</div>
                    </TableCell>

                    {/* Price */}
                    <TableCell className="py-3.5 px-3 text-right font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                      {(b.price || 350000).toLocaleString("vi-VN")}₫
                    </TableCell>

                    {/* Payment */}
                    <TableCell className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.paymentStatus === "paid"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-zinc-100 dark:bg-muted text-zinc-500"
                        }`}
                      >
                        {b.paymentStatus === "paid" ? "Đã trả" : "Trả sau"}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeClasses}`}
                      >
                        {status}
                      </span>
                    </TableCell>

                    {/* Operations */}
                    <TableCell className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Drawer Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedBooking(b)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-muted dark:hover:bg-muted font-bold text-zinc-700 dark:text-foreground/80 transition-colors cursor-pointer"
                        >
                          Chi tiết
                        </button>

                        {/* Quick Confirm */}
                        {(status === "Mới" || !b.status) && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(b.id, "Đã xác nhận")}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white transition-colors cursor-pointer"
                            title="Duyệt lịch"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* 4. Slide-over Right Drawer (Chi tiết lịch hẹn) */}
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
              {/* Drawer Header */}
              <SheetHeader className="px-6 py-4 border-b border-border shrink-0 pr-12">
                <span className="text-xs font-mono font-bold text-[#FF7F6B]">
                  {selectedBooking.code || `BK-${selectedBooking.id?.slice(0, 5)}`}
                </span>
                <SheetTitle className="text-base font-bold text-zinc-900 dark:text-foreground">
                  Hồ Sơ Chi Tiết Lịch Hẹn
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Thông tin khách hàng, thú cưng, thanh toán và tiến trình phục vụ
                </SheetDescription>
              </SheetHeader>

              {/* Drawer Body */}
              <ScrollArea className="flex-1 min-h-0 overflow-hidden">
                <div className="p-6 space-y-5 text-xs">
                  {/* Customer & Pet Profile */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border space-y-3">
                    <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-foreground text-sm">
                      <User className="w-4 h-4 text-[#FF7F6B]" />
                      <span>Khách hàng: {selectedBooking.fullName}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-zinc-600 dark:text-muted-foreground">
                      <div>
                        <span className="text-[11px] text-zinc-400 block">Số điện thoại:</span>
                        <span className="font-semibold text-zinc-800 dark:text-foreground/90">
                          {selectedBooking.phone}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-zinc-400 block">Email:</span>
                        <span className="font-semibold text-zinc-800 dark:text-foreground/90 truncate block">
                          {selectedBooking.email || "Chưa cung cấp"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-200/60 dark:border-border/60">
                      <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-foreground">
                        <Dog className="w-4 h-4 text-[#FF7F6B]" />
                        <span>Thú cưng: {selectedBooking.petName || "Bé cưng"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-zinc-600 dark:text-muted-foreground mt-1">
                        <div>
                          <span className="text-[11px] text-zinc-400 block">Loài:</span>
                          <span className="font-semibold text-zinc-800 dark:text-foreground/90">
                            {selectedBooking.petType}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-zinc-400 block">Giống:</span>
                          <span className="font-semibold text-zinc-800 dark:text-foreground/90">
                            {selectedBooking.petBreed || "Lai"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-zinc-400 block">Cân nặng:</span>
                          <span className="font-semibold text-zinc-800 dark:text-foreground/90">
                            {selectedBooking.weightRange || "Dưới 5kg"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service & Staff Info */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Dịch vụ yêu cầu:</span>
                      <span className="font-bold text-zinc-900 dark:text-foreground">
                        {selectedBooking.service}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Chuyên viên phụ trách:</span>
                      <span className="font-bold text-[#6B1F2E] dark:text-[#FF7F6B]">
                        {selectedBooking.staffName || "BS. CKI Quốc Hùng"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Thời gian hẹn:</span>
                      <span className="font-semibold text-zinc-800 dark:text-foreground/90">
                        {selectedBooking.date} lúc {selectedBooking.timeSlot || "09:00"}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-zinc-200/60 dark:border-border/60">
                      <span className="text-zinc-400">Tổng chi phí:</span>
                      <span className="font-extrabold text-sm text-[#6B1F2E] dark:text-[#FF7F6B]">
                        {(selectedBooking.price || 350000).toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Hình thức thanh toán:</span>
                      <span className="font-semibold text-zinc-800 dark:text-foreground/90">
                        {selectedBooking.paymentMethod === "online" ? "Đã trả trước qua VNPAY" : "Thanh toán sau tại quầy"}
                      </span>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border space-y-3">
                    <span className="font-bold text-zinc-900 dark:text-foreground block">
                      Tiến Trình Đổi Trạng Thái
                    </span>
                    <div className="space-y-2 relative pl-4 border-l-2 border-zinc-200 dark:border-border">
                      <div className="relative">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -left-[21px] top-1" />
                        <div className="font-bold text-zinc-800 dark:text-foreground/90">Đặt lịch hẹn</div>
                        <div className="text-[11px] text-zinc-400">{selectedBooking.createdAt}</div>
                      </div>

                      {selectedBooking.confirmedAt && (
                        <div className="relative">
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 absolute -left-[21px] top-1" />
                          <div className="font-bold text-zinc-800 dark:text-foreground/90">Admin đã xác nhận</div>
                          <div className="text-[11px] text-zinc-400">{selectedBooking.confirmedAt}</div>
                        </div>
                      )}

                      {selectedBooking.completedAt && (
                        <div className="relative">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -left-[21px] top-1" />
                          <div className="font-bold text-zinc-800 dark:text-foreground/90">Hoàn thành dịch vụ</div>
                          <div className="text-[11px] text-zinc-400">{selectedBooking.completedAt}</div>
                        </div>
                      )}

                      {selectedBooking.cancelledAt && (
                        <div className="relative">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute -left-[21px] top-1" />
                          <div className="font-bold text-rose-600 dark:text-rose-400">Đã hủy lịch</div>
                          <div className="text-[11px] text-zinc-400">{selectedBooking.cancelledAt}</div>
                          {selectedBooking.cancelReason && (
                            <div className="text-[11px] text-rose-500 mt-0.5">
                              Lý do: {selectedBooking.cancelReason}
                            </div>
                          )}
                          {selectedBooking.cancellationFee ? (
                            <div className="text-[11px] font-bold text-rose-600 mt-0.5">
                              Khoản phí phạt áp dụng (50%): {selectedBooking.cancellationFee.toLocaleString("vi-VN")}₫
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cancellation Policy Rule Box */}
                  <div className="p-3.5 rounded-2xl bg-[#6B1F2E]/5 dark:bg-[#6B1F2E]/20 border border-[#6B1F2E]/15 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-[#6B1F2E] dark:text-[#FF7F6B]">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Quy Tắc Hủy Lịch Animora</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-muted-foreground">
                      • Báo trước <strong>24h</strong>: Miễn phí hoàn tiền 100%.<br />
                      • Hủy <strong>dưới 3h</strong> trước giờ hẹn: Áp dụng khấu trừ <strong>50% phí dịch vụ</strong> để bù đắp ca làm của chuyên viên.
                    </p>
                  </div>

                  {/* Prescription / Notes */}
                  {selectedBooking.prescription && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                      <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">
                        Đơn Kê Đơn & Chỉ Định Lâm Sàng:
                      </span>
                      <p className="text-zinc-700 dark:text-foreground/80 text-[11px]">
                        {selectedBooking.prescription}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Drawer Actions Footer */}
              <div className="px-6 py-4 border-t border-border shrink-0 flex flex-wrap items-center gap-2">
                {selectedBooking.status !== "Đã xác nhận" && selectedBooking.status !== "Hoàn thành" && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedBooking.id, "Đã xác nhận")}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Xác nhận lịch</span>
                  </button>
                )}

                {selectedBooking.status === "Đã xác nhận" && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedBooking.id, "Hoàn thành")}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Hoàn thành ca</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setNewDate(selectedBooking.date);
                    setNewTime(selectedBooking.timeSlot || "09:00 - 10:30");
                    setIsRescheduleModalOpen(true);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-muted dark:hover:bg-muted text-zinc-700 dark:text-foreground/80 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Đổi lịch</span>
                </button>

                {selectedBooking.status !== "Đã hủy" && (
                  <button
                    type="button"
                    onClick={() => setCancelModalOpen(true)}
                    className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Hủy lịch</span>
                  </button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* 5. Modal Đổi Lịch */}
      <Dialog
        open={isRescheduleModalOpen}
        onOpenChange={(open) => setIsRescheduleModalOpen(open)}
      >
        <DialogContent
          showCloseButton={true}
          className="sm:max-w-md max-h-[90vh] overflow-y-auto scrollbar-thin rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl"
        >
          <DialogHeader className="pr-8">
            <DialogTitle className="text-lg font-bold">
              Đổi Thời Gian Hẹn
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Chọn ngày hẹn và khung giờ phục vụ mới cho khách hàng.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-zinc-500 font-medium block mb-1">Ngày hẹn mới:</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full p-2 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
              />
            </div>
            <div>
              <label className="text-zinc-500 font-medium block mb-1">Khung giờ mới:</label>
              <Select
                value={newTime || RESCHEDULE_SLOTS[0]}
                onValueChange={(val) => {
                  if (val !== null) setNewTime(val);
                }}
                items={Object.fromEntries(
                  (newTime && !RESCHEDULE_SLOTS.includes(newTime)
                    ? [newTime, ...RESCHEDULE_SLOTS]
                    : RESCHEDULE_SLOTS
                  ).map((s) => [s, s])
                )}
              >
                <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-medium px-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(newTime && !RESCHEDULE_SLOTS.includes(newTime)
                    ? [newTime, ...RESCHEDULE_SLOTS]
                    : RESCHEDULE_SLOTS
                  ).map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsRescheduleModalOpen(false)}
              className="px-3 py-1.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-muted font-bold text-xs cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleReschedule}
              className="px-4 py-2 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs cursor-pointer"
            >
              Xác nhận đổi lịch
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 6. Modal Hủy Lịch & Áp dụng phí phạt 50% */}
      <AlertDialog
        open={Boolean(cancelModalOpen && selectedBooking)}
        onOpenChange={(open) => setCancelModalOpen(open)}
      >
        <AlertDialogContent className="max-w-[calc(100%-2rem)] data-[size=default]:max-w-[calc(100%-2rem)] sm:max-w-md data-[size=default]:sm:max-w-md rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl">
          {selectedBooking && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg font-bold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  Xác Nhận Hủy Lịch Hẹn
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-muted-foreground">
                  Bạn đang hủy lịch hẹn của khách <strong>{selectedBooking.fullName}</strong> ({selectedBooking.code}).
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-500 font-medium block mb-1">Lý do hủy lịch:</label>
                  <input
                    type="text"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Khách bận đột xuất, không liên lạc được..."
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
                  />
                </div>

                {/* 50% Rule Checkbox */}
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3">
                  <Checkbox
                    id="halfFee"
                    checked={applyHalfFee}
                    onCheckedChange={(checked) => setApplyHalfFee(Boolean(checked))}
                    className="mt-0.5 data-checked:bg-rose-600 data-checked:border-rose-600"
                  />
                  <label htmlFor="halfFee" className="text-zinc-700 dark:text-foreground/80 cursor-pointer">
                    <span className="font-bold text-rose-600 dark:text-rose-400 block">
                      Áp dụng tính phí hủy 50% (Hủy dưới 3 tiếng)
                    </span>
                    Số tiền phạt tính:{" "}
                    <strong>
                      {Math.round((selectedBooking.price || 350000) * 0.5).toLocaleString("vi-VN")}₫
                    </strong>{" "}
                    theo chính sách cam kết của Animora.
                  </label>
                </div>
              </div>

              <AlertDialogFooter className="bg-transparent border-t-0 p-0 mt-2 mx-0 mb-0">
                <AlertDialogCancel className="rounded-xl font-bold text-xs cursor-pointer">
                  Quay lại
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmCancel}
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
                >
                  Xác nhận hủy
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
