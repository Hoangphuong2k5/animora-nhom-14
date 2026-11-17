import React from "react";
import { CalendarCheck, Phone } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { BookingStatus } from "@/types";
import { ExtendedBooking } from "@/hooks/admin/useAdminBookings";
import { formatDateDdMmYyyy } from "@/utils/dateFormat";

interface AdminBookingsTableProps {
  bookings: ExtendedBooking[];
  onSelectBooking: (booking: ExtendedBooking) => void;
  onUpdateStatus?: (id: string, status: BookingStatus) => void;
}

export const AdminBookingsTable = ({
  bookings,
  onSelectBooking,
}: AdminBookingsTableProps) => {
  return (
    <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
      {bookings.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-muted flex items-center justify-center mx-auto text-zinc-400">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-zinc-600 dark:text-muted-foreground">
            Chưa có dữ liệu lịch hẹn phù hợp với bộ lọc
          </p>
        </div>
      ) : (
        <Table className="w-full text-left text-xs">
          <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
            <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Mã lịch
              </TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Khách hàng
              </TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Thú cưng
              </TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Dịch vụ
              </TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Chuyên viên
              </TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Giờ hẹn
              </TableHead>
              <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Tổng tiền
              </TableHead>
              <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Thanh toán
              </TableHead>
              <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Trạng thái
              </TableHead>
              <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Thao tác
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

              return (
                <TableRow
                  key={b.id || idx}
                  className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors group"
                >
                  <TableCell className="py-3.5 px-3 font-mono font-bold text-zinc-900 dark:text-foreground">
                    {b.code || `BK-${b.id?.slice(0, 5) || idx + 101}`}
                  </TableCell>

                  <TableCell className="py-3.5 px-3">
                    <div className="font-bold text-zinc-900 dark:text-foreground">
                      {b.fullName}
                    </div>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#FF7F6B]" />
                      {b.phone}
                    </div>
                  </TableCell>

                  <TableCell className="py-3.5 px-3">
                    <div className="font-semibold text-zinc-800 dark:text-foreground/90">
                      {b.petName || "Bé cưng"}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {b.petType} {b.petBreed ? `· ${b.petBreed}` : ""}
                    </div>
                  </TableCell>

                  <TableCell className="py-3.5 px-3 font-medium text-zinc-800 dark:text-foreground/90 max-w-[160px] whitespace-normal">
                    {b.service}
                  </TableCell>

                  <TableCell className="py-3.5 px-3 text-zinc-500 font-medium">
                    {b.staffName || "BS. Lê Huy Hoàng"}
                  </TableCell>

                  <TableCell className="py-3.5 px-3">
                    <div className="font-semibold text-zinc-800 dark:text-foreground/90 whitespace-nowrap">
                      {formatDateDdMmYyyy(b.date)}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {b.timeSlot || "09:00 - 10:30"}
                    </div>
                  </TableCell>

                  <TableCell className="py-3.5 px-3 text-right font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                    {(b.price || 350000).toLocaleString("vi-VN")}₫
                  </TableCell>

                  <TableCell className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.paymentStatus === "paid"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-zinc-100 dark:bg-muted text-zinc-500"
                      }`}
                    >
                      {b.paymentStatus === "paid" ? "Đã trả" : "Trả sau"}
                    </span>
                  </TableCell>

                  <TableCell className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeClasses}`}
                    >
                      {status}
                    </span>
                  </TableCell>

                  <TableCell className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectBooking(b)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-muted dark:hover:bg-muted font-bold text-zinc-700 dark:text-foreground/80 transition-colors cursor-pointer"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

