import React from "react";
import { Search } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExtendedBooking } from "@/hooks/admin/useAdminBookings";

interface AdminBookingsFilterBarProps {
  bookings: ExtendedBooking[];
  filteredCount: number;
  searchQuery: string;
  filterStatus: string;
  filterService: string;
  filterStaff: string;
  filterPayment: string;
  onChangeSearch: (q: string) => void;
  onChangeStatus: (s: string) => void;
  onChangeService: (s: string) => void;
  onChangeStaff: (s: string) => void;
  onChangePayment: (p: string) => void;
}

export const AdminBookingsFilterBar = ({
  bookings,
  filteredCount,
  searchQuery,
  filterStatus,
  filterService,
  filterStaff,
  filterPayment,
  onChangeSearch,
  onChangeStatus,
  onChangeService,
  onChangeStaff,
  onChangePayment,
}: AdminBookingsFilterBarProps) => {
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
              { id: "all", label: `Tất cả (${bookings.length})` },
              {
                id: "Mới",
                label: `Chờ duyệt (${bookings.filter((b) => b.status === "Mới" || !b.status).length})`,
              },
              {
                id: "Đã xác nhận",
                label: `Đã duyệt (${bookings.filter((b) => b.status === "Đã xác nhận").length})`,
              },
              {
                id: "Hoàn thành",
                label: `Hoàn thành (${bookings.filter((b) => b.status === "Hoàn thành").length})`,
              },
              {
                id: "Đã hủy",
                label: `Đã hủy (${bookings.filter((b) => b.status === "Đã hủy").length})`,
              },
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-100 dark:border-border text-xs">
        <div>
          <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
            Dịch vụ
          </label>
          <Select
            value={filterService}
            onValueChange={(val) => {
              if (val !== null) onChangeService(val);
            }}
            items={{
              all: "Tất cả dịch vụ",
              Spa: "Spa & Cắt tỉa",
              Khám: "Khám thú y",
              Tiêm: "Tiêm phòng vaccine",
              Răng: "Nha khoa",
            }}
          >
            <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-medium px-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả dịch vụ</SelectItem>
              <SelectItem value="Spa">Spa & Cắt tỉa</SelectItem>
              <SelectItem value="Khám">Khám thú y</SelectItem>
              <SelectItem value="Tiêm">Tiêm phòng vaccine</SelectItem>
              <SelectItem value="Răng">Nha khoa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
            Chuyên viên
          </label>
          <Select
            value={filterStaff}
            onValueChange={(val) => {
              if (val !== null) onChangeStaff(val);
            }}
            items={{
              all: "Tất cả chuyên viên",
              Hoàng: "BS. Lê Huy Hoàng",
              Toàn: "BS. Ngô Phước Toàn",
              Phương: "BS. Nguyễn Thúc Hoàng Phương",
              Thùy: "Phan Thị Đình Thùy",
              "Tuấn Anh": "Nguyễn Văn Tuấn Anh",
            }}
          >
            <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-medium px-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chuyên viên</SelectItem>
              <SelectItem value="Hoàng">BS. Lê Huy Hoàng</SelectItem>
              <SelectItem value="Toàn">BS. Ngô Phước Toàn</SelectItem>
              <SelectItem value="Phương">BS. Nguyễn Thúc Hoàng Phương</SelectItem>
              <SelectItem value="Thùy">Phan Thị Đình Thùy</SelectItem>
              <SelectItem value="Tuấn Anh">Nguyễn Văn Tuấn Anh</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
            Hình thức thanh toán
          </label>
          <Select
            value={filterPayment}
            onValueChange={(val) => {
              if (val !== null) onChangePayment(val);
            }}
            items={{
              all: "Tất cả hình thức",
              online: "Trả trước Online",
              counter: "Trả sau tại quầy",
            }}
          >
            <SelectTrigger className="w-full h-10! rounded-xl bg-[#FBF6F7] dark:bg-muted border-[#EAD6DA] dark:border-border text-xs font-medium px-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả hình thức</SelectItem>
              <SelectItem value="online">Trả trước Online</SelectItem>
              <SelectItem value="counter">Trả sau tại quầy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end pb-1 justify-end">
          <span className="text-[11px] font-semibold text-zinc-400">
            Hiển thị{" "}
            <span className="font-bold text-[#6B1F2E] dark:text-[#FF7F6B]">
              {filteredCount}
            </span>{" "}
            lịch hẹn
          </span>
        </div>
      </div>
    </div>
  );
};

