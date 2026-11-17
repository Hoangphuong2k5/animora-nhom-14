"use client";

import React, { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Truck } from "lucide-react";
import {
  MANAGER_STORAGE_KEYS,
  PO_STATUS_LABEL,
  PurchaseOrder,
  SEED_PURCHASE_ORDERS,
  formatVnd,
  poTotal,
  useManagerStore,
} from "@/data/managerOpsData";
import { useActiveSupplierFilter } from "@/data/supplierPortalData";
import { formatDateDdMmYyyy } from "@/utils/dateFormat";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 5;

export default function SupplierReconciliationPage() {
  const [activeSupplier] = useActiveSupplierFilter();
  const [purchaseOrders] = useManagerStore<PurchaseOrder[]>(
    MANAGER_STORAGE_KEYS.purchaseOrders,
    SEED_PURCHASE_ORDERS
  );
  const [currentPage, setCurrentPage] = useState(1);

  const reconciliationOrders = useMemo(() => {
    return purchaseOrders.filter((po) => {
      if (activeSupplier !== "all" && po.supplierName !== activeSupplier) {
        return false;
      }
      return (
        po.status === "received" ||
        po.status === "received_partial" ||
        po.status === "delivering" ||
        po.status === "supplier_adjusted" ||
        po.status === "supplier_confirmed"
      );
    });
  }, [purchaseOrders, activeSupplier]);

  const receivedOrders = reconciliationOrders.filter(
    (po) => po.status === "received" || po.status === "received_partial"
  );
  const inTransitOrders = reconciliationOrders.filter(
    (po) => po.status !== "received" && po.status !== "received_partial"
  );

  const settledAmount = receivedOrders.reduce((sum, po) => sum + poTotal(po), 0);
  const pendingAmount = inTransitOrders.reduce((sum, po) => sum + poTotal(po), 0);

  const totalPages = Math.max(
    1,
    Math.ceil(reconciliationOrders.length / PAGE_SIZE)
  );
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrders = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return reconciliationOrders.slice(start, start + PAGE_SIZE);
  }, [reconciliationOrders, safePage]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
          <FileSpreadsheet className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          Đối Soát Công Nợ &amp; Lịch Sử Giao Nhận
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Theo dõi số lượng đặt ban đầu, số lượng NCC chốt và giá trị đối soát thực nhận tại kho Animora
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm">
          <div className="text-[11px] font-semibold text-zinc-500">
            Đã hoàn tất đối soát (Đã nhập kho)
          </div>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatVnd(settledAmount)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            {receivedOrders.length} đơn hàng
          </div>
        </div>

        <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm">
          <div className="text-[11px] font-semibold text-zinc-500">
            Đang chờ đối soát (Đang giao / Đã chốt)
          </div>
          <div className="text-xl font-extrabold text-sky-600 dark:text-sky-400 mt-1">
            {formatVnd(pendingAmount)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            {inTransitOrders.length} đơn hàng
          </div>
        </div>

        <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm">
          <div className="text-[11px] font-semibold text-zinc-500">
            Tổng giá trị cung ứng
          </div>
          <div className="text-xl font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B] mt-1">
            {formatVnd(settledAmount + pendingAmount)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            {reconciliationOrders.length} đơn hợp lệ
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
        <Table className="w-full text-left text-xs">
          <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
            <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Mã PO
              </TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Nhà cung cấp
              </TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Đối chiếu số lượng
              </TableHead>
              <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Giá trị đối soát
              </TableHead>
              <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Ngày giao / nhận
              </TableHead>
              <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Trạng thái đối soát
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
            {paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-zinc-400">
                  Chưa có dữ liệu đối soát.
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((po) => (
                <TableRow
                  key={po.id}
                  className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60"
                >
                  <TableCell className="py-3.5 px-3 font-mono font-bold text-zinc-900 dark:text-foreground">
                    {po.code}
                  </TableCell>
                  <TableCell className="py-3.5 px-3 font-semibold">
                    {po.supplierName}
                  </TableCell>
                  <TableCell className="py-3.5 px-3 max-w-[260px] whitespace-normal">
                    {po.lines.map((l, idx) => (
                      <div key={idx}>
                        <span className="font-semibold">{l.productName}</span>
                        <span className="text-[11px] text-zinc-400 ml-1">
                          (Đặt: {l.quantity} · Chốt:{" "}
                          {l.confirmedQuantity ?? l.quantity}
                          {l.receivedQuantity !== undefined
                            ? ` · Thực nhận: ${l.receivedQuantity}`
                            : ""}
                          )
                        </span>
                      </div>
                    ))}
                    {po.discrepancyNote && (
                      <div className="text-[11px] text-amber-600 dark:text-amber-400 italic mt-0.5">
                        Đối soát: {po.discrepancyNote}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-right font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                    {formatVnd(poTotal(po))}
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-center font-mono text-zinc-500">
                    {formatDateDdMmYyyy(po.receivedAt || po.expectedDate)}
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-center">
                    {po.status === "received" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Đã đối soát</span>
                      </span>
                    ) : po.status === "received_partial" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Nhập thiếu (Đối soát)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20">
                        <Truck className="w-3 h-3" />
                        <span>{PO_STATUS_LABEL[po.status]}</span>
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          tone="supplier"
        />
      </div>
    </div>
  );
}
