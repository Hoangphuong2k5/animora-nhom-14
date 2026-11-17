"use client";

import React from "react";
import {
  CalendarCheck,
  Check,
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  Phone,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
import { formatDateDdMmYyyy } from "@/utils/dateFormat";
import { getWeightRangeLabel } from "@/data/serviceBookingData";
import type { BookingStatus } from "@/types";
import {
  type ExtendedBooking,
  getBookingPaymentMeta,
  resolveBookingPetPhoto,
} from "./bookingsTypesAndData";

export type BookingSortKey = "code" | "client" | "pet" | "time";

interface BookingsTableProps {
  readOnly?: boolean;
  totalFilteredCount: number;
  bookings: ExtendedBooking[];
  sortKey: BookingSortKey | null;
  sortOrder: "asc" | "desc";
  onToggleSort: (key: BookingSortKey) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSelectBooking: (booking: ExtendedBooking) => void;
  onQuickConfirm?: (id: string, status: BookingStatus) => void;
}

/** Shared sortable, paginated bookings table for Manager and Admin (read-only). */
export function BookingsTable({
  readOnly = false,
  totalFilteredCount,
  bookings,
  sortKey,
  sortOrder,
  onToggleSort,
  currentPage,
  totalPages,
  onPageChange,
  onSelectBooking,
  onQuickConfirm,
}: BookingsTableProps) {
  const renderSortIcon = (key: BookingSortKey) => {
    if (sortKey !== key) return <ChevronsUpDown className="w-3 h-3 opacity-35" />;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5 text-[#6B1F2E] dark:text-[#FF7F6B]" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-[#6B1F2E] dark:text-[#FF7F6B]" />
    );
  };

  return (
    <div className="p-3 sm:p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
      {totalFilteredCount === 0 ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-muted flex items-center justify-center mx-auto text-zinc-400">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-zinc-600 dark:text-muted-foreground">
            Chưa có dữ liệu lịch hẹn phù hợp với bộ lọc
          </p>
        </div>
      ) : (
        <>
          <Table className="w-full text-left text-xs">
            <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
              <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
                {(
                  [
                    { key: "code", label: "Mã lịch" },
                    { key: "client", label: "Khách hàng" },
                    { key: "pet", label: "Thú cưng" },
                  ] as const
                ).map((col) => (
                  <TableHead
                    key={col.key}
                    onClick={() => onToggleSort(col.key)}
                    className="py-3 px-1.5 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px] cursor-pointer select-none hover:text-zinc-900 dark:hover:text-foreground whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      <span>{col.label}</span>
                      {renderSortIcon(col.key)}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="py-3 px-1.5 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px] whitespace-nowrap">
                  Dịch vụ
                </TableHead>
                <TableHead className="py-3 px-1.5 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px] whitespace-nowrap">
                  Chuyên viên
                </TableHead>
                <TableHead
                  onClick={() => onToggleSort("time")}
                  className="py-3 px-1.5 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px] cursor-pointer select-none hover:text-zinc-900 dark:hover:text-foreground whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Giờ hẹn</span>
                    {renderSortIcon("time")}
                  </div>
                </TableHead>
                <TableHead className="py-3 px-1.5 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px] whitespace-nowrap">
                  Thanh toán
                </TableHead>
                <TableHead className="py-3 px-1.5 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px] whitespace-nowrap">
                  Trạng thái
                </TableHead>
                <TableHead className="py-3 px-1.5 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px] whitespace-nowrap">
                  {readOnly ? "Chi tiết" : "Thao tác"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-zinc-100 dark:divide-border/60 text-zinc-700 dark:text-foreground/80">
              {bookings.map((b, idx) => {
                const status = b.status || "Mới";
                const badgeClasses =
                  status === "Hoàn thành"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : status === "Đã xác nhận"
                      ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
                      : status === "Đã hủy"
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";

                const petSubtitle = [
                  b.petBreed || b.petType,
                  b.petWeight ||
                    (b.weightRange ? getWeightRangeLabel(b.weightRange, "vi") : ""),
                ]
                  .filter(Boolean)
                  .join(" · ");

                const { badgeLabel, badgeClass } = getBookingPaymentMeta(b);

                return (
                  <TableRow
                    key={b.id || idx}
                    onClick={() => onSelectBooking(b)}
                    className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors group cursor-pointer"
                  >
                    <TableCell className="py-3.5 px-1.5 font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B] whitespace-nowrap">
                      {b.code || `BK-${b.id?.slice(0, 5) || idx + 101}`}
                    </TableCell>

                    <TableCell className="py-3.5 px-1.5">
                      <div
                        className="font-bold text-zinc-900 dark:text-foreground max-w-[115px] truncate"
                        title={b.fullName}
                      >
                        {b.fullName}
                      </div>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-1 whitespace-nowrap">
                        <Phone className="w-3 h-3 text-[#FF7F6B] shrink-0" />
                        <span>{b.phone}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 px-1.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={resolveBookingPetPhoto(b)}
                          alt={b.petName || "Bé cưng"}
                          className="w-8 h-8 rounded-lg object-cover shrink-0 border border-zinc-200 dark:border-border"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-zinc-900 dark:text-foreground whitespace-nowrap">
                            {b.petName || "Bé cưng"}
                          </div>
                          <div
                            className="text-[11px] text-zinc-400 truncate max-w-[110px]"
                            title={petSubtitle}
                          >
                            {petSubtitle}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 px-1.5">
                      <div
                        className="font-bold text-zinc-900 dark:text-foreground max-w-[115px] truncate"
                        title={b.service}
                      >
                        {b.service}
                      </div>
                      <div className="text-[11px] font-semibold text-[#6B1F2E] dark:text-[#FF7F6B]">
                        {(b.price || 350000).toLocaleString("vi-VN")}₫
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 px-1.5 text-zinc-500 font-medium">
                      <div
                        className="max-w-[105px] truncate"
                        title={b.staffName || "BS. Lê Huy Hoàng"}
                      >
                        {b.staffName || "BS. Lê Huy Hoàng"}
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 px-1.5 whitespace-nowrap">
                      <div className="font-bold text-zinc-900 dark:text-foreground">
                        {b.timeSlot || "09:00"}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {formatDateDdMmYyyy(b.date)}
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 px-1.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${badgeClass}`}
                      >
                        {badgeLabel}
                      </span>
                    </TableCell>

                    <TableCell className="py-3.5 px-1.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${badgeClasses}`}
                      >
                        {status}
                      </span>
                    </TableCell>

                    <TableCell className="py-3.5 px-1.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectBooking(b);
                          }}
                          className="inline-flex items-center justify-center whitespace-nowrap px-2.5 py-1 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-[#222735] dark:hover:bg-[#2C3347] border border-zinc-200/80 dark:border-[#343C52] font-bold text-[11px] text-zinc-700 dark:text-[#F4F5F8] transition-colors cursor-pointer shrink-0"
                        >
                          Chi tiết
                        </button>

                        {!readOnly &&
                          onQuickConfirm &&
                          (status === "Mới" || !b.status) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onQuickConfirm(b.id, "Đã xác nhận");
                              }}
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

          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  );
}
