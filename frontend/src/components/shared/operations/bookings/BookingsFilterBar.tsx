"use client";

import React from "react";
import { RotateCcw, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BOOKING_WEEK_FILTER_LABELS, type ExtendedBooking } from "./bookingsTypesAndData";

interface BookingsFilterBarProps {
  bookingsMatchingBaseFilters: ExtendedBooking[];
  searchQuery: string;
  onChangeSearch: (q: string) => void;
  filterStatus: string;
  onChangeStatus: (status: string) => void;
  filterService: string;
  onChangeService: (service: string) => void;
  filterStaff: string;
  onChangeStaff: (staff: string) => void;
  filterTimeSlot: string;
  onChangeTimeSlot: (timeSlot: string) => void;
  filterPayment: string;
  onChangePayment: (payment: string) => void;
  serviceOptions: string[];
  staffOptions: string[];
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

const PAYMENT_ITEMS_MAP: Record<string, string> = {
  all: "Tất cả hình thức",
  online: "Trả trước Online",
  counter: "Trả sau tại quầy",
  paid: "Đã thanh toán",
  unpaid: "Chưa thanh toán",
};

/** Shared Bookings search bar, status count tabs, and secondary dropdown filters. */
export function BookingsFilterBar({
  bookingsMatchingBaseFilters,
  searchQuery,
  onChangeSearch,
  filterStatus,
  onChangeStatus,
  filterService,
  onChangeService,
  filterStaff,
  onChangeStaff,
  filterTimeSlot,
  onChangeTimeSlot,
  filterPayment,
  onChangePayment,
  serviceOptions,
  staffOptions,
  hasActiveFilters,
  onResetFilters,
}: BookingsFilterBarProps) {
  const serviceItemsMap: Record<string, string> = {
    all: "Tất cả dịch vụ",
    ...Object.fromEntries(serviceOptions.map((s) => [s, s])),
  };

  const staffItemsMap: Record<string, string> = {
    all: "Tất cả chuyên viên",
    ...Object.fromEntries(staffOptions.map((s) => [s, s])),
  };

  return (
    <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm space-y-3.5">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onChangeSearch(e.target.value)}
            placeholder="Tìm theo tên khách, SĐT, tên bé cưng, mã lịch..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#FF7F6B]"
          />
        </div>

        <Tabs
          value={filterStatus}
          onValueChange={(val) => {
            if (val) onChangeStatus(val as string);
          }}
        >
          <TabsList className="h-auto! flex-wrap gap-1.5 bg-[#FBF6F7] dark:bg-muted/80 p-1 rounded-2xl">
            {[
              {
                id: "Mới",
                label: `Chờ duyệt (${bookingsMatchingBaseFilters.filter((b) => b.status === "Mới" || !b.status).length})`,
              },
              {
                id: "Đã xác nhận",
                label: `Đã duyệt (${bookingsMatchingBaseFilters.filter((b) => b.status === "Đã xác nhận").length})`,
              },
              {
                id: "Hoàn thành",
                label: `Hoàn thành (${bookingsMatchingBaseFilters.filter((b) => b.status === "Hoàn thành").length})`,
              },
              {
                id: "Đã hủy",
                label: `Đã hủy (${bookingsMatchingBaseFilters.filter((b) => b.status === "Đã hủy").length})`,
              },
              { id: "all", label: `Tất cả (${bookingsMatchingBaseFilters.length})` },
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 pt-3 border-t border-zinc-100 dark:border-border text-xs items-end">
        <div>
          <label className="text-[11px] font-semibold text-zinc-400 block mb-1.5">Dịch vụ</label>
          <Select
            value={filterService}
            onValueChange={(val) => {
              if (val !== null) onChangeService(val);
            }}
            items={serviceItemsMap}
          >
            <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-semibold text-zinc-700 dark:text-foreground px-3.5">
              <SelectValue>{serviceItemsMap[filterService] || "Tất cả dịch vụ"}</SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-2xl min-w-[220px]">
              <SelectItem value="all" className="text-xs font-medium">
                Tất cả dịch vụ
              </SelectItem>
              {serviceOptions.map((service) => (
                <SelectItem key={service} value={service} className="text-xs font-medium">
                  {service}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-zinc-400 block mb-1.5">Chuyên viên</label>
          <Select
            value={filterStaff}
            onValueChange={(val) => {
              if (val !== null) onChangeStaff(val);
            }}
            items={staffItemsMap}
          >
            <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-semibold text-zinc-700 dark:text-foreground px-3.5">
              <SelectValue>{staffItemsMap[filterStaff] || "Tất cả chuyên viên"}</SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-2xl min-w-[230px]">
              <SelectItem value="all" className="text-xs font-medium">
                Tất cả chuyên viên
              </SelectItem>
              {staffOptions.map((staff) => (
                <SelectItem key={staff} value={staff} className="text-xs font-medium">
                  {staff}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
            Giờ hẹn (7 ngày)
          </label>
          <Select
            value={filterTimeSlot}
            onValueChange={(val) => {
              if (val !== null) onChangeTimeSlot(val);
            }}
            items={BOOKING_WEEK_FILTER_LABELS}
          >
            <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-semibold text-zinc-700 dark:text-foreground px-3.5">
              <SelectValue>
                {BOOKING_WEEK_FILTER_LABELS[
                  filterTimeSlot as keyof typeof BOOKING_WEEK_FILTER_LABELS
                ] || BOOKING_WEEK_FILTER_LABELS.all}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-2xl min-w-[200px]">
              {Object.entries(BOOKING_WEEK_FILTER_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key} className="text-xs font-medium">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
            Hình thức thanh toán
          </label>
          <Select
            value={filterPayment}
            onValueChange={(val) => {
              if (val !== null) onChangePayment(val);
            }}
            items={PAYMENT_ITEMS_MAP}
          >
            <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-semibold text-zinc-700 dark:text-foreground px-3.5">
              <SelectValue>
                {PAYMENT_ITEMS_MAP[filterPayment] || "Tất cả hình thức"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-2xl min-w-[210px]">
              {Object.entries(PAYMENT_ITEMS_MAP).map(([key, label]) => (
                <SelectItem key={key} value={key} className="text-xs font-medium">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col justify-end">
          <div className="h-10 flex items-center justify-end">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-xs font-bold text-[#6B1F2E] dark:text-[#FF7F6B] bg-[#FBF6F7] dark:bg-muted hover:bg-[#F3E6E9] dark:hover:bg-muted/80 border border-[#EAD6DA] dark:border-border transition-colors cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa bộ lọc</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
