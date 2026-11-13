"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  Download,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Building2,
  FileText,
  PieChart,
  ShoppingBag,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FinancialTransaction {
  id: string;
  code: string;
  type: "in_service" | "in_shop" | "out_stock" | "out_payroll" | "out_refund";
  description: string;
  amount: number;
  paymentMethod: "Chuyển khoản" | "Thẻ POS" | "VNPAY QR" | "Tiền mặt / COD";
  date: string;
  status: "completed" | "processing";
}

const SAMPLE_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: "tx-1",
    code: "TX-202611-001",
    type: "in_service",
    description: "Thanh toán Spa Cắt Tỉa VIP - Khách Phan Thị Đinh Thùy",
    amount: 450000,
    paymentMethod: "VNPAY QR",
    date: "2026-11-03 14:10",
    status: "completed",
  },
  {
    id: "tx-2",
    code: "TX-202611-002",
    type: "in_shop",
    description: "Đơn hàng ORD-94821 hạt Royal Canin & Pate",
    amount: 480000,
    paymentMethod: "Tiền mặt / COD",
    date: "2026-11-03 11:20",
    status: "completed",
  },
  {
    id: "tx-3",
    code: "TX-202611-003",
    type: "out_payroll",
    description: "Tạm ứng lương chuyên viên BS. CKI Quốc Hùng",
    amount: 5000000,
    paymentMethod: "Chuyển khoản",
    date: "2026-11-02 16:00",
    status: "completed",
  },
  {
    id: "tx-4",
    code: "TX-202611-004",
    type: "out_stock",
    description: "Thanh toán phiếu nhập PN-202611-01 Công ty Royal Canin",
    amount: 28500000,
    paymentMethod: "Chuyển khoản",
    date: "2026-11-01 10:30",
    status: "completed",
  },
  {
    id: "tx-5",
    code: "TX-202611-005",
    type: "out_refund",
    description: "Hoàn tiền cọc đơn hủy lịch có trừ phạt 50% BK-9710",
    amount: 175000,
    paymentMethod: "Chuyển khoản",
    date: "2026-10-31 15:45",
    status: "completed",
  },
  {
    id: "tx-6",
    code: "TX-202611-006",
    type: "in_service",
    description: "Gói Khám Tổng Quát & Siêu Âm - Khách Nguyễn Minh Anh",
    amount: 350000,
    paymentMethod: "Thẻ POS",
    date: "2026-10-30 09:20",
    status: "completed",
  },
];

export default function AdminFinancePage() {
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");
  const [filterType, setFilterType] = useState<string>("all");

  const serviceRevenue = 345000000;
  const shopRevenue = 142500000;
  const totalRevenue = serviceRevenue + shopRevenue;
  const cogsExpense = 68200000;
  const payrollExpense = 89250000;
  const grossProfit = totalRevenue - cogsExpense - payrollExpense;
  const profitMargin = ((grossProfit / totalRevenue) * 100).toFixed(1);

  const handleExport = (format: "excel" | "pdf") => {
    toast.success(`Đã xuất báo cáo tài chính ${period} dưới định dạng ${format.toUpperCase()}!`);
  };

  const filteredTx = SAMPLE_TRANSACTIONS.filter((tx) => {
    if (filterType === "all") return true;
    if (filterType === "in") return tx.type.startsWith("in_");
    if (filterType === "out") return tx.type.startsWith("out_");
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-[#6B1F2E] dark:text-[#FF7F6B]" />
            Doanh Thu & Kế Toán Dòng Tiền
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Báo cáo tổng hợp doanh thu dịch vụ, bán lẻ cửa hàng, đối chiếu chi phí và sổ cái dòng tiền
          </p>
        </div>

        {/* Period Selector & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <Tabs
            value={period}
            onValueChange={(val) => {
              if (val) setPeriod(val as "month" | "quarter" | "year");
            }}
          >
            <TabsList className="h-auto! flex-wrap gap-1.5 bg-[#FBF6F7] dark:bg-muted/80 p-1 rounded-2xl">
              {(
                [
                  { id: "month", label: "Tháng này" },
                  { id: "quarter", label: "Quý 4" },
                  { id: "year", label: "Cả năm 2026" },
                ] as const
              ).map((p) => (
                <TabsTrigger
                  key={p.id}
                  value={p.id}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
                >
                  {p.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleExport("excel")}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
            <button
              type="button"
              onClick={() => handleExport("pdf")}
              className="px-3 py-2 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Thẻ tổng hợp tài chính (5 Thẻ) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Doanh thu dịch vụ */}
        <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
            Doanh thu Dịch vụ
          </span>
          <div className="text-xl font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
            {serviceRevenue.toLocaleString("vi-VN")}₫
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            +21.4% (Chiếm 70.8%)
          </span>
        </div>

        {/* Doanh thu shop */}
        <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
            Doanh thu Cửa hàng
          </span>
          <div className="text-xl font-extrabold text-zinc-900 dark:text-foreground">
            {shopRevenue.toLocaleString("vi-VN")}₫
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            +14.2% (Chiếm 29.2%)
          </span>
        </div>

        {/* Chi phí nhập hàng */}
        <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
            Chi phí Nhập hàng (COGS)
          </span>
          <div className="text-xl font-extrabold text-rose-600">
            -{cogsExpense.toLocaleString("vi-VN")}₫
          </div>
          <span className="text-[11px] text-zinc-400 font-medium">Đối soát 3 nhà phân phối</span>
        </div>

        {/* Chi lương chuyên viên */}
        <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
            Lương & Hoa hồng nhân sự
          </span>
          <div className="text-xl font-extrabold text-amber-600">
            -{payrollExpense.toLocaleString("vi-VN")}₫
          </div>
          <span className="text-[11px] text-zinc-400 font-medium">Bác sĩ & Groomer</span>
        </div>

        {/* Lợi nhuận gộp */}
        <div className="p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-950/60 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
            Lợi Nhuận Gộp
          </span>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {grossProfit.toLocaleString("vi-VN")}₫
          </div>
          <span className="text-[11px] font-bold text-emerald-600">
            Biên lợi nhuận: {profitMargin}%
          </span>
        </div>
      </div>

      {/* 3. Biểu đồ so sánh Dịch Vụ vs Cửa Hàng */}
      <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-foreground flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#FF7F6B]" />
              So Sánh Tăng Trưởng Doanh Thu: Dịch Vụ vs Cửa Hàng
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Cơ cấu đóng góp của hai mảng kinh doanh trụ cột theo 6 tháng gần nhất
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#6B1F2E]" /> Dịch vụ Spa & Khám
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FF7F6B]" /> Cửa hàng bán lẻ
            </span>
          </div>
        </div>

        {/* Bar comparison mock visualization */}
        <div className="grid grid-cols-6 gap-3 pt-4 text-center text-xs">
          {[
            { month: "T6", svc: 180, shop: 80 },
            { month: "T7", svc: 210, shop: 95 },
            { month: "T8", svc: 245, shop: 110 },
            { month: "T9", svc: 280, shop: 125 },
            { month: "T10", svc: 310, shop: 135 },
            { month: "T11", svc: 345, shop: 142.5 },
          ].map((bar, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div className="w-full max-w-[60px] h-36 flex items-end justify-center gap-1.5 bg-zinc-50 dark:bg-muted/60 p-1.5 rounded-2xl">
                <div
                  className="w-1/2 bg-[#6B1F2E] rounded-xl transition-all"
                  style={{ height: `${(bar.svc / 350) * 100}%` }}
                  title={`Dịch vụ: ${bar.svc}M`}
                />
                <div
                  className="w-1/2 bg-[#FF7F6B] rounded-xl transition-all"
                  style={{ height: `${(bar.shop / 350) * 100}%` }}
                  title={`Cửa hàng: ${bar.shop}M`}
                />
              </div>
              <span className="font-bold text-zinc-700 dark:text-foreground/80">{bar.month}</span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {(bar.svc + bar.shop).toFixed(0)}M
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Sổ cái giao dịch dòng tiền (Ledger Table) */}
      <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-zinc-900 dark:text-foreground flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#FF7F6B]" />
            Sổ Cái Giao Dịch Dòng Tiền Thời Gian Thực
          </h3>

          <Tabs
            value={filterType}
            onValueChange={(val) => {
              if (val) setFilterType(val as string);
            }}
          >
            <TabsList className="h-auto! flex-wrap gap-1.5 bg-[#FBF6F7] dark:bg-muted/80 p-1 rounded-2xl">
              {[
                { id: "all", label: "Tất cả" },
                { id: "in", label: "Dòng tiền Thu (+)" },
                { id: "out", label: "Dòng tiền Chi (-)" },
              ].map((btn) => (
                <TabsTrigger
                  key={btn.id}
                  value={btn.id}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
                >
                  {btn.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <Table className="w-full text-left text-xs">
          <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
            <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Mã GD</TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Loại giao dịch</TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Nội dung diễn giải</TableHead>
              <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Số tiền</TableHead>
              <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Phương thức</TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Thời gian</TableHead>
              <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
            {filteredTx.map((tx) => {
              const isIncoming = tx.type.startsWith("in_");
              return (
                <TableRow key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors">
                  <TableCell className="py-3.5 px-3 font-mono font-bold text-zinc-900 dark:text-foreground">
                    {tx.code}
                  </TableCell>
                  <TableCell className="py-3.5 px-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.type === "in_service"
                          ? "bg-[#6B1F2E]/10 text-[#6B1F2E] dark:text-[#FF7F6B]"
                          : tx.type === "in_shop"
                          ? "bg-blue-500/10 text-blue-600"
                          : tx.type === "out_stock"
                          ? "bg-rose-500/10 text-rose-600"
                          : tx.type === "out_payroll"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-purple-500/10 text-purple-600"
                      }`}
                    >
                      {tx.type === "in_service"
                        ? "Thu Booking"
                        : tx.type === "in_shop"
                        ? "Thu Shop"
                        : tx.type === "out_stock"
                        ? "Chi Nhập Kho"
                        : tx.type === "out_payroll"
                        ? "Chi Lương"
                        : "Hoàn phí hủy 50%"}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-3 font-medium text-zinc-800 dark:text-foreground/90 max-w-[280px] whitespace-normal">
                    {tx.description}
                  </TableCell>
                  <TableCell
                    className={`py-3.5 px-3 text-right font-extrabold ${
                      isIncoming ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {isIncoming ? "+" : "-"}
                    {tx.amount.toLocaleString("vi-VN")}₫
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-center text-zinc-500 font-medium">
                    {tx.paymentMethod}
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-zinc-400 font-mono text-[11px]">{tx.date}</TableCell>
                  <TableCell className="py-3.5 px-3 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                      Thành công
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

