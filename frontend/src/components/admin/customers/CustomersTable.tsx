import React from "react";
import { Dog, Lock, Mail, Phone, Unlock, Users } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type { CustomerProfile } from "./customersData";
import { formatDateDdMmYyyy } from "@/utils/dateFormat";

interface CustomersTableProps {
  customers: CustomerProfile[];
  onSelectCustomer: (customer: CustomerProfile) => void;
  onToggleLock: (customerId: string) => void;
}

/** Customer list table with quick lock/unlock and detail actions. */
export function CustomersTable({
  customers,
  onSelectCustomer,
  onToggleLock,
}: CustomersTableProps) {
  return (
    <div className="p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden">
      {customers.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-muted flex items-center justify-center mx-auto text-zinc-400">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-zinc-600 dark:text-muted-foreground">
            Không tìm thấy khách hàng nào
          </p>
        </div>
      ) : (
        <Table className="w-full text-left text-xs">
          <TableHeader className="bg-[#FBF6F7] dark:bg-muted/60 border-b border-zinc-200 dark:border-border">
            <TableRow className="hover:bg-transparent border-zinc-200 dark:border-border">
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Khách hàng
              </TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Liên hệ
              </TableHead>
              <TableHead className="py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Ngày đăng ký
              </TableHead>
              <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Số thú cưng
              </TableHead>
              <TableHead className="py-3 px-3 text-center text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Lịch đã đặt
              </TableHead>
              <TableHead className="py-3 px-3 text-right text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                Tổng chi tiêu
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
            {customers.map((c) => (
              <TableRow
                key={c.id}
                className="hover:bg-zinc-50 dark:hover:bg-muted/40 border-zinc-100 dark:border-border/60 transition-colors group"
              >
                <TableCell className="py-3.5 px-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={c.avatar}
                      alt={c.fullName}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-border shrink-0"
                    />
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-foreground">
                        {c.fullName}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        ID: {c.id}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-3.5 px-3">
                  <div className="flex items-center gap-1.5 text-zinc-800 dark:text-foreground/90">
                    <Phone className="w-3.5 h-3.5 text-[#FF7F6B]" />
                    <span>{c.phone}</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{c.email}</span>
                  </div>
                </TableCell>

                <TableCell className="py-3.5 px-3 text-zinc-500 font-medium font-mono">
                  {formatDateDdMmYyyy(c.registeredDate)}
                </TableCell>

                <TableCell className="py-3.5 px-3 text-center font-bold text-zinc-900 dark:text-foreground">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-muted">
                    <Dog className="w-3.5 h-3.5 text-[#FF7F6B]" />
                    {c.petCount} bé
                  </span>
                </TableCell>

                <TableCell className="py-3.5 px-3 text-center font-semibold text-zinc-800 dark:text-foreground/90">
                  {c.bookingsCount} lượt
                </TableCell>

                <TableCell className="py-3.5 px-3 text-right font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                  {c.totalSpent.toLocaleString("vi-VN")}₫
                </TableCell>

                <TableCell className="py-3.5 px-3 text-center">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      c.status === "active"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                    }`}
                  >
                    {c.status === "active" ? "Hoạt động" : "Bị khóa"}
                  </span>
                </TableCell>

                <TableCell className="py-3.5 px-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSelectCustomer(c)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-muted dark:hover:bg-muted font-bold text-zinc-700 dark:text-foreground/80 transition-colors cursor-pointer"
                    >
                      Chi tiết
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleLock(c.id)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        c.status === "active"
                          ? "border-rose-200 hover:bg-rose-50 dark:border-rose-900/60 dark:hover:bg-rose-950/40 text-rose-600"
                          : "border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900/60 dark:hover:bg-emerald-950/40 text-emerald-600"
                      }`}
                      title={
                        c.status === "active" ? "Khóa tài khoản" : "Mở khóa tài khoản"
                      }
                    >
                      {c.status === "active" ? (
                        <Lock className="w-3.5 h-3.5" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
