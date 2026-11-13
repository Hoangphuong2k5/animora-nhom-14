"use client";

import React, { useMemo } from "react";
import { ExpertServiceDef } from "@/types/expert.type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AppointmentFilterBarProps {
  filterDateRange: string;
  onDateRangeChange: (val: string) => void;
  filterService: string;
  onServiceChange: (val: string) => void;
  filterPayment: string;
  onPaymentChange: (val: string) => void;
  services: ExpertServiceDef[];
}

const DATE_RANGE_ITEMS: Record<string, string> = {
  all: "Khoảng ngày: Tất cả",
  today: "Chỉ hôm nay",
  week: "Trong 7 ngày tới",
};

const PAYMENT_ITEMS: Record<string, string> = {
  all: "Thanh toán: Tất cả",
  prepaid: "Trả trước",
  postpaid: "Trả sau",
};

export function AppointmentFilterBar({
  filterDateRange,
  onDateRangeChange,
  filterService,
  onServiceChange,
  filterPayment,
  onPaymentChange,
  services,
}: AppointmentFilterBarProps) {
  const serviceItems = useMemo(() => {
    const map: Record<string, string> = { all: "Dịch vụ: Tất cả" };
    services.forEach((s) => {
      map[s.id] = s.name.vi;
    });
    return map;
  }, [services]);

  return (
    <>
      {/* Filter Date Range */}
      <Select
        value={filterDateRange}
        onValueChange={(val) => {
          if (val !== null) onDateRangeChange(val);
        }}
        items={DATE_RANGE_ITEMS}
      >
        <SelectTrigger className="h-9! min-w-[165px] rounded-xl border-zinc-200 dark:border-border bg-white dark:bg-card px-3 text-xs font-semibold text-zinc-700 dark:text-foreground/80 cursor-pointer">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Khoảng ngày: Tất cả</SelectItem>
          <SelectItem value="today">Chỉ hôm nay</SelectItem>
          <SelectItem value="week">Trong 7 ngày tới</SelectItem>
        </SelectContent>
      </Select>

      {/* Filter Service */}
      <Select
        value={filterService}
        onValueChange={(val) => {
          if (val !== null) onServiceChange(val);
        }}
        items={serviceItems}
      >
        <SelectTrigger className="h-9! min-w-[165px] rounded-xl border-zinc-200 dark:border-border bg-white dark:bg-card px-3 text-xs font-semibold text-zinc-700 dark:text-foreground/80 cursor-pointer">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Dịch vụ: Tất cả</SelectItem>
          {services.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name.vi}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filter Payment */}
      <Select
        value={filterPayment}
        onValueChange={(val) => {
          if (val !== null) onPaymentChange(val);
        }}
        items={PAYMENT_ITEMS}
      >
        <SelectTrigger className="h-9! min-w-[160px] rounded-xl border-zinc-200 dark:border-border bg-white dark:bg-card px-3 text-xs font-semibold text-zinc-700 dark:text-foreground/80 cursor-pointer">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Thanh toán: Tất cả</SelectItem>
          <SelectItem value="prepaid">Trả trước</SelectItem>
          <SelectItem value="postpaid">Trả sau</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}
