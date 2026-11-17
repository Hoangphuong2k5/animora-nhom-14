"use client";

import React, { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { LowStockAlertBanner } from "@/components/manager/shop/LowStockAlertBanner";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { TablePagination } from "@/components/ui/table-pagination";
import { ExtendedProduct } from "@/components/manager/shop/shopTypesAndData";

interface InventoryTabProps {
  products: ExtendedProduct[];
  lowStockProducts: ExtendedProduct[];
  onStockAdjust: (productId: string, delta: number) => void;
  onCreateImportFromAlert: () => void;
}

export function InventoryTab({
  products,
  lowStockProducts,
  onStockAdjust,
  onCreateImportFromAlert,
}: InventoryTabProps) {
  const [stockSort, setStockSort] = useState<"asc" | "desc" | null>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;
  const sortedProducts = useMemo(() => {
    if (!stockSort) return products;
    return [...products].sort((a, b) => {
      const diff = (a.stock ?? 0) - (b.stock ?? 0);
      return stockSort === "asc" ? diff : -diff;
    });
  }, [products, stockSort]);
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return sortedProducts.slice(start, start + PAGE_SIZE);
  }, [sortedProducts, safePage]);

  const toggleStockSort = () => {
    setStockSort((prev) => (prev === null ? "asc" : prev === "asc" ? "desc" : null));
    setCurrentPage(1);
  };

  return (
    <TabsContent value="inventory" className="space-y-5">
      {/* Low Stock Alert Banner */}
      <LowStockAlertBanner
        lowStockCount={lowStockProducts.length}
        onCreateImportFromAlert={onCreateImportFromAlert}
      />

      {/* Inventory Table */}
      <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
        <h3 className="text-base font-bold text-zinc-900 dark:text-foreground mb-4">
          Bảng Theo Dõi Mức Tồn Kho Sản Phẩm
        </h3>
        <Table className="w-full text-left text-xs">
          <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
            <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Sản phẩm</TableHead>
              <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                <button
                  type="button"
                  onClick={toggleStockSort}
                  className="inline-flex items-center justify-center gap-1 uppercase tracking-wider font-semibold hover:text-zinc-900 dark:hover:text-foreground cursor-pointer transition-colors"
                  title="Sắp xếp theo số lượng tồn kho"
                >
                  <span>Tồn kho hiện tại</span>
                  {stockSort === "asc" ? (
                    <ArrowUp className="w-3.5 h-3.5 text-[#FF7F6B]" />
                  ) : stockSort === "desc" ? (
                    <ArrowDown className="w-3.5 h-3.5 text-[#FF7F6B]" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                  )}
                </button>
              </TableHead>
              <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Ngưỡng tối thiểu</TableHead>
              <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Mức độ an toàn</TableHead>
              <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Nhập / Xuất nhanh</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
            {paginatedProducts.map((p) => {
              const stock = p.stock || 0;
              const isDanger = stock < 5;
              const isWarning = stock >= 5 && stock < 10;

              return (
                <TableRow key={p.id} className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors">
                  <TableCell className="py-3.5 px-3 font-bold text-zinc-900 dark:text-foreground whitespace-normal">
                    {p.name}
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-center font-extrabold text-sm">
                    <span
                      className={
                        isDanger ? "text-rose-600" : isWarning ? "text-amber-600" : "text-emerald-600"
                      }
                    >
                      {stock}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-center text-zinc-400 font-semibold">10 món</TableCell>
                  <TableCell className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isDanger
                          ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                          : isWarning
                          ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      }`}
                    >
                      {isDanger ? "Báo động đỏ (<5)" : isWarning ? "Cảnh báo vàng (<10)" : "An toàn"}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onStockAdjust(p.id, -1)}
                        className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-border font-bold hover:bg-zinc-100 dark:hover:bg-muted cursor-pointer"
                        title="Xuất 1 món"
                      >
                        -1 Xuất
                      </button>
                      <button
                        type="button"
                        onClick={() => onStockAdjust(p.id, 10)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                        title="Nhập 10 món"
                      >
                        +10 Nhập
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <TablePagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </TabsContent>
  );
}
