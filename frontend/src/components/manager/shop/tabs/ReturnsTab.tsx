"use client";

import React from "react";
import { RotateCcw } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { ReturnRequestItem } from "@/components/manager/shop/shopTypesAndData";

interface ReturnsTabProps {
  readOnly?: boolean;
  returns: ReturnRequestItem[];
  onProcessReturn: (returnId: string, nextStatus: "approved" | "rejected") => void;
}

export function ReturnsTab({
  readOnly = false,
  returns,
  onProcessReturn,
}: ReturnsTabProps) {
  return (
    <TabsContent value="returns" className="space-y-4">
      <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
        <h3 className="text-base font-bold text-zinc-900 dark:text-foreground mb-4 flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-amber-500" />
          Yêu Cầu Đổi Trả & Hoàn Tiền Khách Hàng
        </h3>

        <Table className="w-full text-left text-xs">
          <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
            <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Mã yêu cầu</TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Đơn hàng & Khách</TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Sản phẩm</TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Lý do hoàn trả</TableHead>
              <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Số tiền hoàn</TableHead>
              <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Trạng thái</TableHead>
              <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Xử lý</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
            {returns.map((ret) => (
              <TableRow key={ret.id} className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors">
                <TableCell className="py-3.5 px-3 font-mono font-bold text-zinc-900 dark:text-foreground whitespace-nowrap">
                  {ret.requestCode}
                </TableCell>
                <TableCell className="py-3.5 px-3">
                  <div className="font-bold text-zinc-900 dark:text-foreground">{ret.customerName}</div>
                  <div className="text-[11px] text-zinc-400">
                    Đơn {ret.orderCode} · {ret.phone}
                  </div>
                </TableCell>
                <TableCell className="py-3.5 px-3 max-w-[200px] whitespace-normal font-medium text-zinc-800 dark:text-foreground/90">
                  {ret.productName}
                </TableCell>
                <TableCell className="py-3.5 px-3 max-w-[240px] whitespace-normal text-zinc-600 dark:text-muted-foreground italic">
                  &quot;{ret.reason}&quot;
                </TableCell>
                <TableCell className="py-3.5 px-3 text-right font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                  {ret.refundAmount.toLocaleString("vi-VN")}₫
                </TableCell>
                <TableCell className="py-3.5 px-3 text-center whitespace-nowrap">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      ret.status === "approved"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : ret.status === "rejected"
                        ? "bg-rose-500/10 text-rose-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {ret.status === "approved"
                      ? "Đã hoàn tiền"
                      : ret.status === "rejected"
                      ? "Từ chối"
                      : "Chờ duyệt"}
                  </span>
                </TableCell>
                <TableCell className="py-3.5 px-3 text-center whitespace-nowrap">
                  {ret.status === "pending" ? (
                    readOnly ? (
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium italic">
                        Chờ Quản lý duyệt
                      </span>
                    ) : (
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onProcessReturn(ret.id, "approved")}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer whitespace-nowrap transition-colors"
                        >
                          Duyệt hoàn
                        </button>
                        <button
                          type="button"
                          onClick={() => onProcessReturn(ret.id, "rejected")}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 font-bold cursor-pointer whitespace-nowrap transition-colors"
                        >
                          Từ chối
                        </button>
                      </div>
                    )
                  ) : (
                    <span className="text-[11px] text-zinc-400 italic">Đã xử lý</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TabsContent>
  );
}
