"use client";

import React from "react";
import { UserCheck } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAdminStaff } from "@/hooks/admin/useAdminStaff";
import { StaffDirectoryTable } from "./StaffDirectoryTable";
import { StaffAbsenceQuotaTable } from "./StaffAbsenceQuotaTable";
import { StaffDetailSheet } from "./StaffDetailSheet";

/** Main admin staff lookup workspace (directory & absence quotas, read-only). */
export function AdminStaffPage() {
  const staff = useAdminStaff();

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <Tabs
        value={staff.activeTab === "accounts" ? "directory" : staff.activeTab}
        onValueChange={(val) => {
          if (val) staff.setActiveTab(val as "directory" | "absences");
        }}
        className="gap-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
              <UserCheck className="w-6 h-6 text-[#6B1F2E] dark:text-[#FF7F6B]" />
              Tra Cứu Chuyên Viên &amp; Nhân Sự
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Tra cứu hồ sơ chứng chỉ nhân viên và theo dõi vắng mặt (tối đa 4
              ngày/tháng • Nhân sự Full-time)
            </p>
          </div>

          <TabsList className="h-auto! flex-wrap gap-1.5 bg-[#FBF6F7] dark:bg-muted/80 p-1 rounded-2xl self-start sm:self-auto">
            <TabsTrigger
              value="directory"
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
            >
              Đội ngũ &amp; Chứng chỉ
            </TabsTrigger>
            <TabsTrigger
              value="absences"
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
            >
              Theo dõi vắng mặt
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="directory" className="space-y-4">
          <StaffDirectoryTable
            staffList={staff.staffList}
            expertStores={staff.expertStores}
            onSelectStaff={staff.setSelectedStaff}
          />
        </TabsContent>

        <TabsContent value="absences" className="space-y-4">
          <StaffAbsenceQuotaTable
            todayIso={staff.todayIso}
            rows={staff.absenceRows}
          />
        </TabsContent>
      </Tabs>

      <StaffDetailSheet
        selectedStaff={staff.selectedStaff}
        expertStores={staff.expertStores}
        onClose={() => staff.setSelectedStaff(null)}
      />
    </div>
  );
}
