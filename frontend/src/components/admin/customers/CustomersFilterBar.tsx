import React from "react";
import { Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CustomerProfile } from "./customersData";

interface CustomersFilterBarProps {
  customers: CustomerProfile[];
  searchQuery: string;
  onChangeSearch: (val: string) => void;
  filterStatus: "all" | "active" | "locked";
  onChangeStatus: (val: "all" | "active" | "locked") => void;
}

/** Search bar + status filter tabs for AdminCustomersPage. */
export function CustomersFilterBar({
  customers,
  searchQuery,
  onChangeSearch,
  filterStatus,
  onChangeStatus,
}: CustomersFilterBarProps) {
  return (
    <div className="p-4 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onChangeSearch(e.target.value)}
          placeholder="Tìm theo tên khách, email, số điện thoại..."
          className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#FF7F6B]"
        />
      </div>

      <Tabs
        value={filterStatus}
        onValueChange={(val) => {
          if (val) onChangeStatus(val as "all" | "active" | "locked");
        }}
        className="self-start sm:self-auto"
      >
        <TabsList className="h-auto! flex-wrap gap-1.5 bg-[#FBF6F7] dark:bg-muted/80 p-1 rounded-2xl">
          {(
            [
              { id: "all", label: `Tất cả (${customers.length})` },
              {
                id: "active",
                label: `Hoạt động (${
                  customers.filter((c) => c.status === "active").length
                })`,
              },
              {
                id: "locked",
                label: `Bị khóa (${
                  customers.filter((c) => c.status === "locked").length
                })`,
              },
            ] as const
          ).map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
