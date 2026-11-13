"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface AppointmentTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabCounts: Record<string, number>;
}

const APPOINTMENT_TAB_ITEMS = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "upcoming", label: "Sắp tới" },
  { key: "in_progress", label: "Đang thực hiện" },
  { key: "completed", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
];

export function AppointmentTabs({
  activeTab,
  onTabChange,
  tabCounts,
}: AppointmentTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(val) => {
        if (val !== null && val !== undefined) onTabChange(String(val));
      }}
    >
      <TabsList className="h-auto flex-wrap justify-start gap-1.5 p-1 rounded-2xl bg-zinc-100/80 dark:bg-card/80 border border-zinc-200/80 dark:border-border">
        {APPOINTMENT_TAB_ITEMS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="h-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer text-zinc-500 hover:text-zinc-900 dark:text-muted-foreground dark:hover:text-foreground data-active:bg-[#6B1F2E] data-active:text-white dark:data-active:bg-[#6B1F2E] dark:data-active:text-white data-active:shadow-sm transition-all"
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] leading-none font-bold transition-colors",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-zinc-200/80 dark:bg-muted text-zinc-600 dark:text-foreground/80"
                )}
              >
                {tabCounts[tab.key] || 0}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}

