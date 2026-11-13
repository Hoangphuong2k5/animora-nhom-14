"use client";

import React from "react";
import { ExpertAppointment, ExpertPet, ExpertServiceDef } from "@/types/expert.type";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CommissionDetailTableProps {
  appointments: ExpertAppointment[];
  pets: ExpertPet[];
  services: ExpertServiceDef[];
  commissionRate: number;
}

export function CommissionDetailTable({
  appointments,
  pets,
  services,
  commissionRate,
}: CommissionDetailTableProps) {
  return (
    <div className="rounded-3xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-md p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-extrabold text-sm text-zinc-900 dark:text-foreground">
          Bảng Kê Chi Tiết Hoa Hồng Từng Booking ({appointments.length})
        </h3>
        <span className="text-xs text-zinc-400">
          Tỷ lệ hoa hồng cá nhân: <strong>{commissionRate * 100}%</strong>
        </span>
      </div>

      <Table className="w-full text-left text-xs">
        <TableHeader className="border-b border-zinc-200/80 dark:border-border bg-zinc-50/70 dark:bg-muted/70 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
          <TableRow className="border-zinc-200/80 dark:border-border hover:bg-transparent">
            <TableHead className="h-auto px-4 py-3 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
              Mã ca hẹn
            </TableHead>
            <TableHead className="h-auto px-4 py-3 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
              Thú cưng
            </TableHead>
            <TableHead className="h-auto px-4 py-3 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
              Dịch vụ
            </TableHead>
            <TableHead className="h-auto px-4 py-3 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
              Thời gian
            </TableHead>
            <TableHead className="h-auto px-4 py-3 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
              Tiền dịch vụ
            </TableHead>
            <TableHead className="h-auto px-4 py-3 text-right text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
              Hoa hồng nhận
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-zinc-200/60 dark:divide-border/60">
          {appointments.map((appt) => {
            const pet = pets.find((p) => p.id === appt.petId);
            const srv = services.find((s) => s.id === appt.serviceId);
            const price = srv?.price || 250000;
            const commission = Math.round(price * commissionRate);

            return (
              <TableRow
                key={appt.id}
                className="border-zinc-200/60 dark:border-border/60 hover:bg-zinc-50/50 dark:hover:bg-muted/50"
              >
                <TableCell className="px-4 py-3 whitespace-normal font-extrabold text-[#6B1F2E] dark:text-[#FF7F6B]">
                  {appt.code}
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-normal">
                  <div className="font-bold text-zinc-900 dark:text-foreground">
                    {pet?.name || "Bé cưng"}
                  </div>
                  <div className="text-[10px] text-zinc-400">{pet?.breed}</div>
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-normal font-medium text-zinc-700 dark:text-foreground/80">
                  {srv?.name.vi}
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-normal text-zinc-500">
                  {appt.startAt.replace("T", " ")}
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-normal font-semibold text-zinc-800 dark:text-foreground/90">
                  {price.toLocaleString("vi-VN")}đ
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-normal text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                  +{commission.toLocaleString("vi-VN")}đ
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
