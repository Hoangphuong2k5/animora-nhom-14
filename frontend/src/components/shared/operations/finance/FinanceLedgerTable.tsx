"use client";

import React from "react";
import { CreditCard } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTimeDdMmYyyy } from "@/utils/dateFormat";
import type { FinancialTransaction } from "./financeTypesAndData";

interface FinanceLedgerTableProps {
  filterType: string;
  onChangeFilterType: (next: string) => void;
  transactions: FinancialTransaction[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const TX_TYPE_BADGE: Record<
  FinancialTransaction["type"],
  { label: string; className: string }
> = {
  in_service: {
    label: "Thu Booking",
    className: "bg-[#6B1F2E]/10 text-[#6B1F2E] dark:text-[#FF7F6B]",
  },
  in_shop: { label: "Thu Shop", className: "bg-blue-500/10 text-blue-600" },
  out_stock: { label: "Chi Nhập Kho", className: "bg-rose-500/10 text-rose-600" },
  out_operations: { label: "Vận Hành & Vật Tư", className: "bg-amber-500/10 text-amber-600" },
  out_refund: { label: "Hoàn phí hủy 50%", className: "bg-purple-500/10 text-purple-600" },
};

/** Shared real-time financial cashflow ledger table with pagination and filters. */
export function FinanceLedgerTable({
  filterType,
  onChangeFilterType,
  transactions,
  currentPage,
  totalPages,
  onPageChange,
}: FinanceLedgerTableProps) {
  return (
    <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-base font-bold text-zinc-900 dark:text-foreground flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#FF7F6B]" />
          Sổ Cái Giao Dịch Dòng Tiền Thời Gian Thực
        </h3>

        <Tabs
          value={filterType}
          onValueChange={(val) => {
            if (val) onChangeFilterType(val as string);
          }}
        >
          <TabsList className="h-auto! flex-wrap gap-1.5 bg-white dark:bg-card border border-zinc-200/80 dark:border-border p-1.5 rounded-2xl shadow-sm w-fit">
            {[
              { id: "all", label: "Tất cả" },
              { id: "in", label: "Dòng tiền Thu (+)" },
              { id: "out", label: "Dòng tiền Chi (-)" },
            ].map((btn) => (
              <TabsTrigger
                key={btn.id}
                value={btn.id}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all bg-zinc-50/80 dark:bg-muted/40 text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground hover:bg-zinc-100 dark:hover:bg-muted data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
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
            <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
              Mã GD
            </TableHead>
            <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
              Loại giao dịch
            </TableHead>
            <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
              Nội dung diễn giải
            </TableHead>
            <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
              Số tiền
            </TableHead>
            <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
              Phương thức
            </TableHead>
            <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
              Thời gian
            </TableHead>
            <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
              Trạng thái
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
          {transactions.map((tx) => {
            const isIncoming = tx.type.startsWith("in_");
            const badge = TX_TYPE_BADGE[tx.type];
            return (
              <TableRow
                key={tx.id}
                className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors"
              >
                <TableCell className="py-3.5 px-3 font-mono font-bold text-zinc-900 dark:text-foreground">
                  {tx.code}
                </TableCell>
                <TableCell className="py-3.5 px-3">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.className}`}
                  >
                    {badge.label}
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
                <TableCell className="py-3.5 px-3 text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                  {formatDateTimeDdMmYyyy(tx.date)}
                </TableCell>
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

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
