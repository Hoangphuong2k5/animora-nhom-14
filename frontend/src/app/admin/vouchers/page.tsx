"use client";

import React, { useState, useEffect } from "react";
import {
  Ticket,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  PauseCircle,
  PlayCircle,
  Trash2,
  Edit3,
  Calendar,
  Sparkles,
  Percent,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { safeGetStorage, safeSetStorage } from "@/utils/cartLogic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

export interface AdminVoucher {
  id: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number; // e.g. 15 (%) or 50000 (VND)
  minOrderValue: number;
  maxDiscount?: number;
  applicableTo: string;
  startDate: string;
  endDate: string;
  usedCount: number;
  maxUsage: number;
  status: "active" | "paused" | "expired";
}

const INITIAL_VOUCHERS: AdminVoucher[] = [
  {
    id: "vouch-1",
    code: "ANIMORA_SPA15",
    discountType: "percent",
    discountValue: 15,
    minOrderValue: 300000,
    maxDiscount: 100000,
    applicableTo: "Tất cả dịch vụ Spa & Grooming",
    startDate: "2026-11-01",
    endDate: "2026-11-30",
    usedCount: 42,
    maxUsage: 100,
    status: "active",
  },
  {
    id: "vouch-2",
    code: "WELCOME_NEWPET",
    discountType: "fixed",
    discountValue: 50000,
    minOrderValue: 200000,
    applicableTo: "Khách hàng mới đặt lịch lần đầu",
    startDate: "2026-10-01",
    endDate: "2026-12-31",
    usedCount: 118,
    maxUsage: 200,
    status: "active",
  },
  {
    id: "vouch-3",
    code: "VACCINE_SAVE20",
    discountType: "percent",
    discountValue: 20,
    minOrderValue: 400000,
    maxDiscount: 150000,
    applicableTo: "Gói Tiêm Chủng Vaccine 7 Bệnh",
    startDate: "2026-10-15",
    endDate: "2026-11-15",
    usedCount: 50,
    maxUsage: 50,
    status: "expired",
  },
  {
    id: "vouch-4",
    code: "FLASH_SALE_1111",
    discountType: "percent",
    discountValue: 25,
    minOrderValue: 500000,
    maxDiscount: 200000,
    applicableTo: "Toàn bộ sản phẩm cửa hàng",
    startDate: "2026-11-11",
    endDate: "2026-11-12",
    usedCount: 0,
    maxUsage: 300,
    status: "paused",
  },
];

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<AdminVoucher[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState(15);
  const [minOrderValue, setMinOrderValue] = useState(300000);
  const [maxDiscount, setMaxDiscount] = useState(100000);
  const [applicableTo, setApplicableTo] = useState("Tất cả dịch vụ");
  const [startDate, setStartDate] = useState("2026-11-01");
  const [endDate, setEndDate] = useState("2026-11-30");
  const [maxUsage, setMaxUsage] = useState(100);

  useEffect(() => {
    const saved = safeGetStorage<AdminVoucher[]>("animora_admin_vouchers_v2", []);
    if (Array.isArray(saved) && saved.length > 0) {
      setVouchers(saved);
    } else {
      setVouchers(INITIAL_VOUCHERS);
      safeSetStorage("animora_admin_vouchers_v2", INITIAL_VOUCHERS);
    }
  }, []);

  const saveVouchers = (updated: AdminVoucher[]) => {
    setVouchers(updated);
    safeSetStorage("animora_admin_vouchers_v2", updated);
  };

  // Toggle Pause/Resume
  const handleToggleStatus = (voucherId: string) => {
    const updated = vouchers.map((v) => {
      if (v.id === voucherId) {
        const nextStatus = v.status === "active" ? ("paused" as const) : ("active" as const);
        return { ...v, status: nextStatus };
      }
      return v;
    });
    saveVouchers(updated);
    toast.success("Đã thay đổi trạng thái kích hoạt của voucher!");
  };

  // Delete
  const handleDeleteVoucher = (voucherId: string) => {
    const updated = vouchers.filter((v) => v.id !== voucherId);
    saveVouchers(updated);
    toast.warning("Đã xóa voucher khỏi hệ thống!");
  };

  // Add Voucher
  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Vui lòng nhập mã voucher!");
      return;
    }

    const created: AdminVoucher = {
      id: `vouch-${Date.now()}`,
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount: discountType === "percent" ? maxDiscount : undefined,
      applicableTo,
      startDate,
      endDate,
      usedCount: 0,
      maxUsage,
      status: "active",
    };

    const next = [created, ...vouchers];
    saveVouchers(next);
    setIsAddModalOpen(false);

    // Reset
    setCode("");
    toast.success(`Đã phát hành mã ưu đãi ${created.code} thành công!`);
  };

  const filtered = vouchers.filter((v) => {
    const matchStatus = filterStatus === "all" ? true : v.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q || v.code.toLowerCase().includes(q) || v.applicableTo.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-[#6B1F2E] dark:text-[#FF7F6B]" />
            Quản Lý Mã Giảm Giá & Voucher
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Thiết lập khuyến mãi, coupon tri ân khách hàng và theo dõi giới hạn lượt sử dụng
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="self-start sm:self-center px-4 py-2.5 rounded-2xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo voucher mới</span>
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã coupon, dịch vụ áp dụng..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground"
          />
        </div>

        <Tabs
          value={filterStatus}
          onValueChange={(val) => {
            if (val) setFilterStatus(val as string);
          }}
          className="self-start sm:self-auto"
        >
          <TabsList className="h-auto! flex-wrap gap-1.5 bg-[#FBF6F7] dark:bg-muted/80 p-1 rounded-2xl">
            {[
              { id: "all", label: `Tất cả (${vouchers.length})` },
              { id: "active", label: `Đang chạy (${vouchers.filter((v) => v.status === "active").length})` },
              { id: "paused", label: `Tạm dừng (${vouchers.filter((v) => v.status === "paused").length})` },
              { id: "expired", label: `Hết hạn (${vouchers.filter((v) => v.status === "expired").length})` },
            ].map((tab) => (
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
        <Table className="w-full text-left text-xs">
          <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
            <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Mã Voucher</TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Mức giảm</TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Điều kiện áp dụng</TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Thời hạn hiệu lực</TableHead>
              <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Đã dùng / Giới hạn</TableHead>
              <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Trạng thái</TableHead>
              <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
            {filtered.map((v) => (
              <TableRow key={v.id} className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors">
                {/* Code */}
                <TableCell className="py-3.5 px-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#6B1F2E]/10 dark:bg-[#6B1F2E]/20 text-[#6B1F2E] dark:text-[#FF7F6B] font-mono font-extrabold text-sm border border-[#6B1F2E]/20">
                    <Ticket className="w-3.5 h-3.5" />
                    <span>{v.code}</span>
                  </div>
                </TableCell>

                {/* Discount Value */}
                <TableCell className="py-3.5 px-3">
                  <div className="font-extrabold text-zinc-900 dark:text-foreground text-sm">
                    {v.discountType === "percent" ? `Giảm ${v.discountValue}%` : `Giảm ${v.discountValue.toLocaleString("vi-VN")}₫`}
                  </div>
                  {v.maxDiscount && (
                    <div className="text-[11px] text-zinc-400">
                      Tối đa: {v.maxDiscount.toLocaleString("vi-VN")}₫
                    </div>
                  )}
                </TableCell>

                {/* Condition */}
                <TableCell className="py-3.5 px-3 max-w-[220px] whitespace-normal">
                  <div className="font-semibold text-zinc-800 dark:text-foreground/90">
                    {v.applicableTo}
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Đơn tối thiểu: {v.minOrderValue.toLocaleString("vi-VN")}₫
                  </div>
                </TableCell>

                {/* Validity */}
                <TableCell className="py-3.5 px-3 text-zinc-600 dark:text-muted-foreground font-medium">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#FF7F6B]" />
                    <span>{v.startDate} → {v.endDate}</span>
                  </div>
                </TableCell>

                {/* Usage */}
                <TableCell className="py-3.5 px-3 text-center">
                  <div className="font-bold text-zinc-900 dark:text-foreground">
                    {v.usedCount} / {v.maxUsage}
                  </div>
                  <div className="w-24 h-1.5 bg-zinc-100 dark:bg-muted rounded-full mx-auto mt-1 overflow-hidden">
                    <div
                      className="h-full bg-[#FF7F6B] rounded-full"
                      style={{ width: `${Math.min(100, (v.usedCount / v.maxUsage) * 100)}%` }}
                    />
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell className="py-3.5 px-3 text-center">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      v.status === "active"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : v.status === "paused"
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-zinc-100 dark:bg-muted text-zinc-400"
                    }`}
                  >
                    {v.status === "active"
                      ? "Đang chạy"
                      : v.status === "paused"
                      ? "Tạm dừng"
                      : "Hết hạn"}
                  </span>
                </TableCell>

                {/* Actions */}
                <TableCell className="py-3.5 px-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(v.id)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        v.status === "active"
                          ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                          : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      }`}
                      title={v.status === "active" ? "Tạm dừng áp dụng" : "Tiếp tục chạy voucher"}
                    >
                      {v.status === "active" ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteVoucher(v.id)}
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Xóa voucher"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal Tạo Voucher */}
      <Dialog
        open={isAddModalOpen}
        onOpenChange={(open) => setIsAddModalOpen(open)}
      >
        <DialogContent
          showCloseButton={true}
          className="sm:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin rounded-2xl bg-popover text-popover-foreground border border-border p-6 shadow-2xl"
        >
          <DialogHeader className="pr-8">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[#FF7F6B]" />
              Tạo Mã Voucher Khuyến Mãi Mới
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Thiết lập mã giảm giá, hạn mức đơn hàng tối thiểu và thời hạn hiệu lực.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateVoucher} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-zinc-500 block mb-1">Mã Code:</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ANIMORA_XMAS..."
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted font-mono font-bold uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-zinc-500 block mb-1">Loại giảm:</label>
                <Select
                  value={discountType}
                  onValueChange={(val) => {
                    if (val !== null) setDiscountType(val as "percent" | "fixed");
                  }}
                  items={{
                    percent: "Giảm theo %",
                    fixed: "Giảm số tiền cố định (VNĐ)",
                  }}
                >
                  <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-medium px-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Giảm theo %</SelectItem>
                    <SelectItem value="fixed">Giảm số tiền cố định (VNĐ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-semibold text-zinc-500 block mb-1">Mức giảm:</label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-zinc-500 block mb-1">Đơn tối thiểu:</label>
                <input
                  type="number"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
                />
              </div>
              <div>
                <label className="font-semibold text-zinc-500 block mb-1">Lượt dùng tối đa:</label>
                <input
                  type="number"
                  value={maxUsage}
                  onChange={(e) => setMaxUsage(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-zinc-500 block mb-1">Phạm vi áp dụng:</label>
              <input
                type="text"
                value={applicableTo}
                onChange={(e) => setApplicableTo(e.target.value)}
                placeholder="Tất cả dịch vụ / Thức ăn thú cưng..."
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-zinc-500 block mb-1">Từ ngày:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
                />
              </div>
              <div>
                <label className="font-semibold text-zinc-500 block mb-1">Đến ngày:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-muted font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold cursor-pointer"
              >
                Phát hành Voucher
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

