"use client";

import React, { useState } from "react";
import { Package, Truck, CheckCircle2 } from "lucide-react";
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
import { TabsContent } from "@/components/ui/tabs";
import { ShopOrder } from "@/components/manager/shop/shopTypesAndData";

interface OrdersTabProps {
  readOnly?: boolean;
  orders: ShopOrder[];
  onUpdateOrderStatus: (orderId: string, nextStatus: ShopOrder["status"]) => void;
}

export function OrdersTab({
  readOnly = false,
  orders,
  onUpdateOrderStatus,
}: OrdersTabProps) {
  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);

  const handleStatusChange = (orderId: string, nextStatus: ShopOrder["status"]) => {
    onUpdateOrderStatus(orderId, nextStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: nextStatus });
    }
  };

  return (
    <>
      <TabsContent value="orders" className="space-y-4">
        <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
          <Table className="w-full text-left text-xs">
            <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
              <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Mã đơn</TableHead>
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Khách hàng</TableHead>
                <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Món hàng</TableHead>
                <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Tổng tiền</TableHead>
                <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Thanh toán</TableHead>
                <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Trạng thái giao</TableHead>
                <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
              {orders.map((o) => (
                <TableRow key={o.id} className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors">
                  <TableCell className="py-3.5 px-3 font-mono font-bold text-zinc-900 dark:text-foreground">
                    {o.orderCode}
                  </TableCell>
                  <TableCell className="py-3.5 px-3">
                    <div className="font-bold text-zinc-900 dark:text-foreground">{o.customerName}</div>
                    <div className="text-[11px] text-zinc-400">{o.phone}</div>
                  </TableCell>
                  <TableCell className="py-3.5 px-3 max-w-[240px] whitespace-normal text-zinc-600 dark:text-muted-foreground">
                    {o.items.map((it) => `${it.productName} (x${it.quantity})`).join(", ")}
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-right font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                    {o.totalAmount.toLocaleString("vi-VN")}₫
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-center">
                    <span className="font-semibold text-zinc-600 dark:text-muted-foreground">
                      {o.paymentMethod}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        o.status === "delivered"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : o.status === "shipping"
                          ? "bg-sky-500/10 text-sky-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {o.status === "delivered"
                        ? "Đã giao"
                        : o.status === "shipping"
                        ? "Đang giao"
                        : "Chờ xử lý"}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(o)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-muted dark:hover:bg-muted font-bold text-zinc-700 dark:text-foreground/80 transition-colors cursor-pointer"
                    >
                      Chi tiết đơn
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      {/* Slide-over Drawer Chi Tiết Đơn Hàng */}
      <Sheet
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null);
        }}
      >
        <SheetContent
          side="right"
          showCloseButton={true}
          className="w-full data-[side=right]:w-full data-[side=right]:sm:max-w-lg p-0 gap-0 flex flex-col h-full bg-popover text-popover-foreground border-l border-border shadow-2xl"
        >
          {selectedOrder && (
            <>
              <SheetHeader className="px-6 py-4 border-b border-border shrink-0 pr-12">
                <span className="text-xs font-mono font-bold text-[#FF7F6B]">
                  {selectedOrder.orderCode}
                </span>
                <SheetTitle className="text-base font-bold text-zinc-900 dark:text-foreground">
                  Chi Tiết Đơn Hàng Cửa Hàng
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Thông tin giao nhận và danh sách sản phẩm trong đơn
                </SheetDescription>
              </SheetHeader>

              <ScrollArea className="flex-1 min-h-0 overflow-hidden">
                <div className="p-6 space-y-5 text-xs">
                  {/* 4-Step Order Lifecycle Stepper (Phân tích nghiệp vụ Mục 5, 7) */}
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-muted/60 border border-zinc-100 dark:border-border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-900 dark:text-foreground">Tiến trình đơn hàng (4 bước)</span>
                      <span className="font-semibold text-[#6B1F2E] dark:text-[#FF7F6B]">
                        {selectedOrder.status === "pending"
                          ? "Bước 1/4: Chờ xác nhận"
                          : selectedOrder.status === "packing"
                          ? "Bước 2/4: Đang đóng gói"
                          : selectedOrder.status === "shipping"
                          ? "Bước 3/4: Đang giao hàng"
                          : selectedOrder.status === "delivered"
                          ? "Bước 4/4: Đã hoàn tất giao"
                          : "Đã hoàn trả"}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {[
                        { id: "pending", label: "Chờ xác nhận" },
                        { id: "packing", label: "Đóng gói" },
                        { id: "shipping", label: "Giao hàng" },
                        { id: "delivered", label: "Hoàn tất" },
                      ].map((st, i) => {
                        const orderSteps = ["pending", "packing", "shipping", "delivered"];
                        const currentIdx = orderSteps.indexOf(selectedOrder.status);
                        const isCurrent = selectedOrder.status === st.id;
                        const isPast = currentIdx >= i;
                        return (
                          <div
                            key={st.id}
                            className={`p-1.5 rounded-xl text-center text-[10px] font-bold border transition-colors ${
                              isCurrent
                                ? "bg-[#6B1F2E] text-white border-[#6B1F2E] dark:bg-primary dark:text-primary-foreground"
                                : isPast
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                : "bg-muted/50 text-muted-foreground border-border/50"
                            }`}
                          >
                            {st.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-muted/60 border border-zinc-100 dark:border-border space-y-1">
                    <div className="font-bold text-zinc-900 dark:text-foreground">
                      Người nhận: {selectedOrder.customerName}
                    </div>
                    <div className="text-zinc-500">SĐT: {selectedOrder.phone}</div>
                    <div className="text-zinc-500">Địa chỉ giao: {selectedOrder.shippingAddress}</div>
                  </div>

                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-foreground mb-2">
                      Danh Sách Món Đã Đặt:
                    </h4>
                    <div className="space-y-2">
                      {selectedOrder.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-foreground">{it.productName}</div>
                            <div className="text-[11px] text-zinc-400">Số lượng: x{it.quantity}</div>
                          </div>
                          <div className="font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                            {(it.price * it.quantity).toLocaleString("vi-VN")}₫
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-muted/60 border border-zinc-100 dark:border-border flex items-center justify-between font-bold">
                    <span>Tổng giá trị đơn hàng:</span>
                    <span className="text-lg text-[#6B1F2E] dark:text-[#FF7F6B]">
                      {selectedOrder.totalAmount.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                </div>
              </ScrollArea>

              <div className="px-6 py-4 border-t border-border shrink-0 flex flex-wrap gap-2">
                {readOnly ? (
                  <div className="w-full flex items-center justify-between text-xs">
                    <span className="text-muted-foreground italic">
                      Chế độ chỉ xem (Read-Only)
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(null)}
                      className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                ) : (
                  <>
                    {selectedOrder.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedOrder.id, "packing")}
                    className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Package className="w-4 h-4" />
                    <span>Xác nhận & Đóng gói</span>
                  </button>
                )}
                {selectedOrder.status === "packing" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedOrder.id, "shipping")}
                    className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Bàn giao Vận chuyển</span>
                  </button>
                )}
                {selectedOrder.status === "shipping" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedOrder.id, "delivered")}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đã Giao Xong</span>
                  </button>
                )}
                {selectedOrder.status !== "returned" && selectedOrder.status !== "delivered" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedOrder.id, "returned")}
                    className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 font-bold text-xs cursor-pointer"
                  >
                    Hủy/Hoàn đơn
                  </button>
                )}
                  </>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
