import React from "react";
import { Calendar, Dog, Lock, ShoppingBag, Star, Unlock } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CustomerProfile } from "./customersData";
import { formatDateDdMmYyyy } from "@/utils/dateFormat";

interface CustomerDetailSheetProps {
  customer: CustomerProfile | null;
  onClose: () => void;
  onToggleLock: (customerId: string) => void;
}

/** Slide-over drawer displaying customer pets, booking history, order history, and reviews. */
export function CustomerDetailSheet({
  customer,
  onClose,
  onToggleLock,
}: CustomerDetailSheetProps) {
  return (
    <Sheet
      open={Boolean(customer)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="right"
        showCloseButton={true}
        className="w-full data-[side=right]:w-full data-[side=right]:sm:max-w-lg p-0 gap-0 flex flex-col h-full bg-popover text-popover-foreground border-l border-border shadow-2xl"
      >
        {customer && (
          <>
            <SheetHeader className="px-6 py-4 border-b border-border shrink-0 pr-12">
              <div className="flex items-center gap-3">
                <img
                  src={customer.avatar}
                  alt={customer.fullName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#FF7F6B] shrink-0"
                />
                <div className="min-w-0">
                  <SheetTitle className="text-base font-bold text-zinc-900 dark:text-foreground">
                    {customer.fullName}
                  </SheetTitle>
                  <SheetDescription className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        customer.status === "active"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-rose-500/10 text-rose-600"
                      }`}
                    >
                      {customer.status === "active"
                        ? "Tài khoản hoạt động"
                        : "Đang bị khóa"}
                    </span>
                    <span>Tham gia: {customer.registeredDate}</span>
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <ScrollArea className="flex-1 min-h-0 overflow-hidden">
              <div className="p-6 space-y-6 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-muted/60 border border-zinc-100 dark:border-border">
                    <span className="text-[11px] text-zinc-400 block font-medium">
                      Tổng chi tiêu tích lũy
                    </span>
                    <span className="text-lg font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                      {customer.totalSpent.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-muted/60 border border-zinc-100 dark:border-border">
                    <span className="text-[11px] text-zinc-400 block font-medium">
                      Lượt sử dụng dịch vụ
                    </span>
                    <span className="text-lg font-extrabold text-zinc-900 dark:text-foreground">
                      {customer.bookingsCount} lần
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-foreground mb-2.5 flex items-center gap-1.5">
                    <Dog className="w-4 h-4 text-[#FF7F6B]" />
                    Danh Sách Thú Cưng ({customer.pets.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {customer.pets.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-2xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border"
                      >
                        <div className="font-bold text-zinc-900 dark:text-foreground">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          {p.species} · {p.breed}
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-1">
                          {p.age}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-foreground mb-2.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#FF7F6B]" />
                    Lịch Sử Đặt Lịch ({customer.bookingHistory.length})
                  </h4>
                  <div className="space-y-2">
                    {customer.bookingHistory.map((b) => (
                      <div
                        key={b.id}
                        className="p-3 rounded-2xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-zinc-900 dark:text-foreground">
                            {b.service}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {b.code} · Ngày {formatDateDdMmYyyy(b.date)}
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

                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-foreground mb-2.5 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-[#FF7F6B]" />
                    Lịch Sử Mua Hàng ({customer.orderHistory.length})
                  </h4>
                  {customer.orderHistory.length === 0 ? (
                    <p className="text-zinc-400 italic">
                      Chưa có đơn hàng nào tại cửa hàng.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {customer.orderHistory.map((o) => (
                        <div
                          key={o.id}
                          className="p-3 rounded-2xl bg-zinc-50 dark:bg-muted/50 border border-zinc-100 dark:border-border flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-foreground">
                              {o.code}
                            </div>
                            <div className="text-[11px] text-zinc-500 truncate max-w-[200px]">
                              {o.items}
                            </div>
                            <div className="text-[10px] text-zinc-400">
                              {formatDateDdMmYyyy(o.date)}
                            </div>
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

                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-foreground mb-2.5 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    Đánh Giá Đã Gửi ({customer.reviews.length})
                  </h4>
                  {customer.reviews.map((r) => (
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
                      <p className="text-zinc-600 dark:text-foreground/80 italic">
                        &ldquo;{r.comment}&rdquo;
                      </p>
                      <div className="text-[10px] text-zinc-400">{formatDateDdMmYyyy(r.date)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>

            <div className="px-6 py-4 border-t border-border shrink-0 flex items-center justify-between gap-3">
              <span className="text-xs text-zinc-500">
                Trạng thái:{" "}
                <strong>
                  {customer.status === "active" ? "Bình thường" : "Khóa"}
                </strong>
              </span>

              <button
                type="button"
                onClick={() => onToggleLock(customer.id)}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                  customer.status === "active"
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {customer.status === "active" ? (
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
  );
}
