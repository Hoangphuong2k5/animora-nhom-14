"use client";

import React from "react";
import { Calendar } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminSchedule } from "@/hooks/admin/useAdminSchedule";
import { ScheduleWeeklyMatrix } from "./ScheduleWeeklyMatrix";
import { StaffShiftApprovalList } from "./StaffShiftApprovalList";

/** Main admin schedule lookup page (read-only). */
export function AdminSchedulePage() {
  const schedule = useAdminSchedule();

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-[#6B1F2E] dark:text-[#FF7F6B]" />
            Tra Cứu Lịch Làm Việc &amp; Ca Trực
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Tra cứu ma trận ca làm chuyên viên và trạng thái yêu cầu nghỉ phép / đổi ca
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Tabs
            value={schedule.viewMode}
            onValueChange={(val) => {
              if (val) schedule.setViewMode(val as "week" | "month");
            }}
          >
            <TabsList className="h-auto! flex-wrap gap-1.5 bg-[#FBF6F7] dark:bg-muted/80 p-1 rounded-2xl">
              <TabsTrigger
                value="week"
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
              >
                Theo Tuần
              </TabsTrigger>
              <TabsTrigger
                value="month"
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
              >
                Theo Tháng
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <ScheduleWeeklyMatrix
        shifts={schedule.shifts}
        filterStaff={schedule.filterStaff}
        onSelectFilterStaff={schedule.setFilterStaff}
      />

      <StaffShiftApprovalList
        staffRequests={schedule.staffRequests}
        requestRoleFilter={schedule.requestRoleFilter}
        onChangeRoleFilter={schedule.setRequestRoleFilter}
      />
    </div>
  );
}
