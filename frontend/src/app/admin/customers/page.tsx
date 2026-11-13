"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Lock,
  Unlock,
  Phone,
  Mail,
  Calendar,
  Dog,
  ShoppingBag,
  Star,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { safeGetStorage, safeSetStorage } from "@/utils/cartLogic";
import {
  Sheet,
  SheetContent,
  SheetHeader,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface CustomerPet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
}

export interface CustomerBookingHistory {
  id: string;
  code: string;
  service: string;
  date: string;
  total: number;
  status: string;
}

export interface CustomerOrderHistory {
  id: string;
  code: string;
  items: string;
  date: string;
  total: number;
  status: string;
}

export interface CustomerReview {
  id: string;
  serviceOrProduct: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CustomerProfile {
  id: string;
  fullName: string;
  avatar: string;
  email: string;
  phone: string;
  registeredDate: string;
  petCount: number;
  bookingsCount: number;
  totalSpent: number;
  status: "active" | "locked";
  pets: CustomerPet[];
  bookingHistory: CustomerBookingHistory[];
  orderHistory: CustomerOrderHistory[];
  reviews: CustomerReview[];
}

const INITIAL_CUSTOMERS: CustomerProfile[] = [
  {
    id: "cus-1",
    fullName: "Phan Thị Đinh Thùy",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    email: "phanthidinhthuy6@gmail.com",
    phone: "0337203332",
    registeredDate: "2026-01-15",
    petCount: 2,
    bookingsCount: 8,
    totalSpent: 4850000,
    status: "active",
    pets: [
      { id: "p1", name: "Bơ", species: "Chó", breed: "Corgi Pembroke", age: "1.5 tuổi" },
      { id: "p2", name: "Sữa", species: "Mèo", breed: "British Shorthair", age: "2 tuổi" },
    ],
    bookingHistory: [
      { id: "b1", code: "BK-9821", service: "Spa Cắt Tỉa & Tắm Thảo Dược", date: "2026-11-01", total: 450000, status: "Hoàn thành" },
      { id: "b2", code: "BK-9750", service: "Tiêm Vaccine 7 Bệnh Định Kỳ", date: "2026-10-15", total: 300000, status: "Hoàn thành" },
    ],
    orderHistory: [
      { id: "o1", code: "ORD-94821", items: "Hạt Royal Canin Mini (2kg), Pate Monge (x4)", date: "2026-11-03", total: 480000, status: "Đang giao" },
    ],
    reviews: [
      { id: "r1", serviceOrProduct: "Spa Cắt Tỉa & Tắm Thảo Dược", rating: 5, comment: "Bác sĩ và bé nhân viên chăm Bơ rất chu đáo, tắm về thơm nức nở!", date: "2026-11-01" },
    ],
  },
  {
    id: "cus-2",
    fullName: "Nguyễn Minh Anh",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    email: "minhanh.ng@gmail.com",
    phone: "0901234567",
    registeredDate: "2026-02-04",
    petCount: 1,
    bookingsCount: 5,
    totalSpent: 3200000,
    status: "active",
    pets: [
      { id: "p3", name: "Miu Miu", species: "Mèo", breed: "Mèo Ba Tư", age: "1 tuổi" },
    ],
    bookingHistory: [
      { id: "b3", code: "BK-9804", service: "Khám Tổng Quát & Siêu Âm", date: "2026-10-28", total: 350000, status: "Hoàn thành" },
    ],
    orderHistory: [
      { id: "o2", code: "ORD-94822", items: "Cát vệ sinh Cature gỗ nén (x2), Lược chải lông", date: "2026-11-03", total: 1250000, status: "Chờ xác nhận" },
    ],
    reviews: [
      { id: "r2", serviceOrProduct: "Khám Tổng Quát & Siêu Âm", rating: 5, comment: "Phòng khám hiện đại, BS tư vấn tận tình dễ thương.", date: "2026-10-28" },
    ],
  },
  {
    id: "cus-3",
    fullName: "Hoàng Văn Tuấn",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    email: "tuan.hoangvan@yahoo.com",
    phone: "0988776655",
    registeredDate: "2026-03-12",
    petCount: 3,
    bookingsCount: 12,
    totalSpent: 8900000,
    status: "active",
    pets: [
      { id: "p4", name: "Rex", species: "Chó", breed: "Golden Retriever", age: "3 tuổi" },
      { id: "p5", name: "Max", species: "Chó", breed: "Poodle", age: "8 tháng" },
      { id: "p6", name: "Lulu", species: "Mèo", breed: "Mèo Mướp", age: "2 tuổi" },
    ],
    bookingHistory: [
      { id: "b4", code: "BK-9790", service: "Spa Combo VIP Chăm Sóc Toàn Diện", date: "2026-10-20", total: 750000, status: "Hoàn thành" },
    ],
    orderHistory: [
      { id: "o3", code: "ORD-94819", items: "Xương gặm Orgo sạch răng, Sữa tắm Tropiclean", date: "2026-11-02", total: 320000, status: "Đã giao" },
    ],
    reviews: [
      { id: "r3", serviceOrProduct: "Spa Combo VIP", rating: 4, comment: "Làm lông sạch sẽ, sẽ tiếp tục ủng hộ Animora dài lâu.", date: "2026-10-20" },
    ],
  },
  {
    id: "cus-4",
    fullName: "Lê Thị Thảo Linh",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    email: "linhle.thaothao@gmail.com",
    phone: "0912348899",
    registeredDate: "2026-04-18",
    petCount: 1,
    bookingsCount: 2,
    totalSpent: 920000,
    status: "locked",
    pets: [
      { id: "p7", name: "Mít", species: "Chó", breed: "Pug", age: "1 tuổi" },
    ],
    bookingHistory: [
      { id: "b5", code: "BK-9640", service: "Khám Da Liễu & Điều Trị Nấm", date: "2026-09-12", total: 420000, status: "Đã hủy" },
    ],
    orderHistory: [],
    reviews: [
      { id: "r4", serviceOrProduct: "Khám Da Liễu", rating: 2, comment: "Chờ hơi lâu vào ngày cuối tuần.", date: "2026-09-12" },
    ],
  },
  {
    id: "cus-5",
    fullName: "Đỗ Quốc Bảo",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    email: "quocbao.do@outlook.com",
    phone: "0933445566",
    registeredDate: "2026-05-22",
    petCount: 2,
    bookingsCount: 4,
    totalSpent: 2600000,
    status: "active",
    pets: [
      { id: "p8", name: "Kuro", species: "Chó", breed: "Shiba Inu", age: "2 tuổi" },
      { id: "p9", name: "Shiro", species: "Chó", breed: "Samoyed", age: "1.2 tuổi" },
    ],
    bookingHistory: [
      { id: "b6", code: "BK-9815", service: "Spa Cắt Tỉa & Tắm Thảo Dược", date: "2026-10-30", total: 600000, status: "Hoàn thành" },
    ],
    orderHistory: [
      { id: "o4", code: "ORD-94812", items: "Vòng cổ chống ve rận Seresto", date: "2026-10-25", total: 850000, status: "Đã giao" },
    ],
    reviews: [
      { id: "r5", serviceOrProduct: "Spa Cắt Tỉa", rating: 5, comment: "Dịch vụ 5 sao, Kuro cắt lông tròn xoe như gấu bông!", date: "2026-10-30" },
    ],
  },
];

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "locked">("all");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  useEffect(() => {
    const saved = safeGetStorage<CustomerProfile[]>("animora_customers_v2", []);
    if (Array.isArray(saved) && saved.length > 0) {
      setCustomers(saved);
    } else {
      setCustomers(INITIAL_CUSTOMERS);
      safeSetStorage("animora_customers_v2", INITIAL_CUSTOMERS);
    }
  }, []);

  const saveCustomers = (updated: CustomerProfile[]) => {
    setCustomers(updated);
    safeSetStorage("animora_customers_v2", updated);
  };

  const handleToggleLock = (customerId: string) => {
    const updated = customers.map((c) => {
      if (c.id === customerId) {
        const nextStatus = c.status === "active" ? ("locked" as const) : ("active" as const);
        return { ...c, status: nextStatus };
      }
      return c;
    });

    saveCustomers(updated);
    if (selectedCustomer && selectedCustomer.id === customerId) {
      setSelectedCustomer(updated.find((c) => c.id === customerId) || null);
    }

    const current = customers.find((c) => c.id === customerId);
    if (current?.status === "active") {
      toast.warning(`Đã khóa tài khoản khách hàng: ${current.fullName}`);
    } else {
      toast.success(`Đã mở khóa tài khoản khách hàng: ${current?.fullName}`);
    }
  };

  const filtered = customers.filter((c) => {
    const matchStatus = filterStatus === "all" ? true : c.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      c.fullName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#6B1F2E] dark:text-[#FF7F6B]" />
            Quản Lý Khách Hàng
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Danh sách khách hàng, hồ sơ thú cưng sở hữu, lịch sử chi tiêu và kiểm soát tài khoản
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-muted text-xs font-semibold text-zinc-600 dark:text-muted-foreground">
            Tổng: <strong className="text-[#6B1F2E] dark:text-[#FF7F6B]">{customers.length}</strong> khách hàng
          </span>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên khách, email, số điện thoại..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#FF7F6B]"
          />
        </div>

        <Tabs
          value={filterStatus}
          onValueChange={(val) => {
            if (val) setFilterStatus(val as "all" | "active" | "locked");
          }}
          className="self-start sm:self-auto"
        >
          <TabsList className="h-auto! flex-wrap gap-1.5 bg-[#FBF6F7] dark:bg-muted/80 p-1 rounded-2xl">
            {(
              [
                { id: "all", label: `Tất cả (${customers.length})` },
                { id: "active", label: `Hoạt động (${customers.filter((c) => c.status === "active").length})` },
                { id: "locked", label: `Bị khóa (${customers.filter((c) => c.status === "locked").length})` },
              ] as const
            ).map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* 3. Table */}
      <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-muted flex items-center justify-center mx-auto text-zinc-400">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-zinc-600 dark:text-muted-foreground">
              Không tìm thấy khách hàng nào
            </p>
          </div>
        ) : (
          <Table className="w-full text-left text-xs">
            <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
              <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Khách hàng</TableHead>
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Liên hệ</TableHead>
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Ngày đăng ký</TableHead>
                <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Số thú cưng</TableHead>
                <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Lịch đã đặt</TableHead>
                <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Tổng chi tiêu</TableHead>
                <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Trạng thái</TableHead>
                <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
              {filtered.map((c) => (
                <TableRow
                  key={c.id}
                  className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors group"
                >
                  {/* Avatar & Name */}
                  <TableCell className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={c.avatar}
                        alt={c.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-border shrink-0"
                      />
                      <div>
                        <div className="font-bold text-zinc-900 dark:text-foreground">{c.fullName}</div>
                        <div className="text-[11px] text-zinc-400 font-mono">ID: {c.id}</div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Contact */}
                  <TableCell className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5 text-zinc-800 dark:text-foreground/90">
                      <Phone className="w-3.5 h-3.5 text-[#FF7F6B]" />
                      <span>{c.phone}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{c.email}</span>
                    </div>
                  </TableCell>

                  {/* Register date */}
                  <TableCell className="py-3.5 px-3 text-zinc-500 font-medium">{c.registeredDate}</TableCell>

                  {/* Pet Count */}
                  <TableCell className="py-3.5 px-3 text-center font-bold text-zinc-900 dark:text-foreground">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-muted">
                      <Dog className="w-3.5 h-3.5 text-[#FF7F6B]" />
                      {c.petCount} bé
                    </span>
                  </TableCell>

                  {/* Bookings Count */}
                  <TableCell className="py-3.5 px-3 text-center font-semibold text-zinc-800 dark:text-foreground/90">
                    {c.bookingsCount} lượt
                  </TableCell>

                  {/* Total Spent */}
                  <TableCell className="py-3.5 px-3 text-right font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                    {c.totalSpent.toLocaleString("vi-VN")}₫
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        c.status === "active"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {c.status === "active" ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedCustomer(c)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-muted dark:hover:bg-muted font-bold text-zinc-700 dark:text-foreground/80 transition-colors cursor-pointer"
                      >
                        Chi tiết
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleLock(c.id)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          c.status === "active"
                            ? "border-rose-200 hover:bg-rose-50 dark:border-rose-900/60 dark:hover:bg-rose-950/40 text-rose-600"
                            : "border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900/60 dark:hover:bg-emerald-950/40 text-emerald-600"
                        }`}
                        title={c.status === "active" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                      >
                        {c.status === "active" ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* 4. Slide-over Detail Drawer */}
      <Sheet
        open={Boolean(selectedCustomer)}
        onOpenChange={(open) => {
          if (!open) setSelectedCustomer(null);
        }}
      >
        <SheetContent
          side="right"
          showCloseButton={true}
          className="w-full data-[side=right]:w-full data-[side=right]:sm:max-w-lg p-0 gap-0 flex flex-col h-full bg-popover text-popover-foreground border-l border-border shadow-2xl"
        >
          {selectedCustomer && (
            <>
              {/* Header */}
              <SheetHeader className="px-6 py-4 border-b border-border shrink-0 pr-12">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedCustomer.avatar}
                    alt={selectedCustomer.fullName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#FF7F6B] shrink-0"
                  />
                  <div className="min-w-0">
                    <SheetTitle className="text-base font-bold text-zinc-900 dark:text-foreground">
                      {selectedCustomer.fullName}
                    </SheetTitle>
                    <SheetDescription className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          selectedCustomer.status === "active"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-rose-500/10 text-rose-600"
                        }`}
                      >
                        {selectedCustomer.status === "active" ? "Tài khoản hoạt động" : "Đang bị khóa"}
                      </span>
                      <span>Tham gia: {selectedCustomer.registeredDate}</span>
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              {/* Content Tabs / Scrollable Section */}
              <ScrollArea className="flex-1 min-h-0 overflow-hidden">
                <div className="p-6 space-y-6 text-xs">
                  {/* Spending Summary Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-muted/60 border border-zinc-100 dark:border-border">
                      <span className="text-[11px] text-zinc-400 block font-medium">Tổng chi tiêu tích lũy</span>
                      <span className="text-lg font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                        {selectedCustomer.totalSpent.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-muted/60 border border-zinc-100 dark:border-border">
                      <span className="text-[11px] text-zinc-400 block font-medium">Lượt sử dụng dịch vụ</span>
                      <span className="text-lg font-extrabold text-zinc-900 dark:text-foreground">
                        {selectedCustomer.bookingsCount} lần
                      </span>
                    </div>
                  </div>

                  {/* 1. Danh sách thú cưng */}
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-foreground mb-2.5 flex items-center gap-1.5">
                      <Dog className="w-4 h-4 text-[#FF7F6B]" />
                      Danh Sách Thú Cưng ({selectedCustomer.pets.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedCustomer.pets.map((p) => (
                        <div
                          key={p.id}
                          className="p-3 rounded-2xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border"
                        >
                          <div className="font-bold text-zinc-900 dark:text-foreground">{p.name}</div>
                          <div className="text-[11px] text-zinc-500 mt-0.5">
                            {p.species} · {p.breed}
                          </div>
                          <div className="text-[10px] text-zinc-400 mt-1">{p.age}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Lịch sử đặt lịch */}
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-foreground mb-2.5 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#FF7F6B]" />
                      Lịch Sử Đặt Lịch ({selectedCustomer.bookingHistory.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedCustomer.bookingHistory.map((b) => (
                        <div
                          key={b.id}
                          className="p-3 rounded-2xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-foreground">{b.service}</div>
                            <div className="text-[11px] text-zinc-400">
                              {b.code} · Ngày {b.date}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                              {b.total.toLocaleString("vi-VN")}₫
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.2 rounded-full">
                              {b.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Lịch sử đơn hàng */}
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-foreground mb-2.5 flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-[#FF7F6B]" />
                      Lịch Sử Mua Hàng ({selectedCustomer.orderHistory.length})
                    </h4>
                    {selectedCustomer.orderHistory.length === 0 ? (
                      <p className="text-zinc-400 italic">Chưa có đơn hàng nào tại cửa hàng.</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedCustomer.orderHistory.map((o) => (
                          <div
                            key={o.id}
                            className="p-3 rounded-2xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border flex items-center justify-between"
                          >
                            <div>
                              <div className="font-bold text-zinc-900 dark:text-foreground">{o.code}</div>
                              <div className="text-[11px] text-zinc-500 truncate max-w-[200px]">{o.items}</div>
                              <div className="text-[10px] text-zinc-400">{o.date}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-extrabold text-zinc-900 dark:text-foreground">
                                {o.total.toLocaleString("vi-VN")}₫
                              </div>
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.2 rounded-full">
                                {o.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 4. Đánh giá đã gửi */}
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-foreground mb-2.5 flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      Đánh Giá Đã Gửi ({selectedCustomer.reviews.length})
                    </h4>
                    {selectedCustomer.reviews.map((r) => (
                      <div
                        key={r.id}
                        className="p-3 rounded-2xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-zinc-900 dark:text-foreground">
                            {r.serviceOrProduct}
                          </span>
                          <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star className="w-3 h-3 fill-amber-500" />
                            <span>{r.rating}/5</span>
                          </div>
                        </div>
                        <p className="text-zinc-600 dark:text-foreground/80 italic">"{r.comment}"</p>
                        <div className="text-[10px] text-zinc-400">{r.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>

              {/* Footer Action */}
              <div className="px-6 py-4 border-t border-border shrink-0 flex items-center justify-between gap-3">
                <span className="text-xs text-zinc-500">
                  Trạng thái: <strong>{selectedCustomer.status === "active" ? "Bình thường" : "Khóa"}</strong>
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleLock(selectedCustomer.id)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                    selectedCustomer.status === "active"
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {selectedCustomer.status === "active" ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Khóa tài khoản</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Mở khóa tài khoản</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

