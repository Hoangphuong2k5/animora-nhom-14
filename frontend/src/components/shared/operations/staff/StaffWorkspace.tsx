"use client";

import React, { useEffect, useState } from "react";
import { Calendar, Clock, UserCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminStaff } from "@/hooks/admin/useAdminStaff";
import { StaffAbsenceQuotaTable } from "@/components/admin/staff/StaffAbsenceQuotaTable";
import { StaffDetailSheet } from "@/components/admin/staff/StaffDetailSheet";
import { StaffDirectoryTable } from "@/components/admin/staff/StaffDirectoryTable";
import type { StaffItem } from "@/components/admin/staff/staffData";
import { CertificateApprovalPanel } from "@/components/manager/staff/CertificateApprovalPanel";
import { LeaveQuotaPanel } from "@/components/manager/staff/LeaveQuotaPanel";
import { LeaveRequestsPanel } from "@/components/manager/staff/LeaveRequestsPanel";

export type { StaffItem };

export interface StaffWorkspaceProps {
  mode?: "manager" | "readonly";
}

type ManagerStaffTab = "directory" | "requests" | "quota";
type ReadOnlyStaffTab = "directory" | "absences";

/** Shared Staff Directory, Certificates & Leave Quota workspace for Manager & Admin (read-only). */
export function StaffWorkspace({ mode = "manager" }: StaffWorkspaceProps) {
  const isReadOnly = mode === "readonly";
  const staff = useAdminStaff();
  const [managerTab, setManagerTab] = useState<ManagerStaffTab>("requests");

  useEffect(() => {
    if (isReadOnly) return;
    const syncTabFromQuery = () => {
      const tab = new URLSearchParams(window.location.search).get("tab");
      if (tab === "directory" || tab === "requests" || tab === "quota") {
        setManagerTab(tab);
      }
    };
    syncTabFromQuery();
    window.addEventListener("popstate", syncTabFromQuery);
    return () => window.removeEventListener("popstate", syncTabFromQuery);
  }, [isReadOnly]);

  if (isReadOnly) {
    const readonlyTab: ReadOnlyStaffTab =
      staff.activeTab === "accounts" ? "directory" : staff.activeTab;

    return (
      <div className="space-y-6 animate-fade-in pb-12">
        <Tabs
          value={readonlyTab}
          onValueChange={(val) => {
            if (val) staff.setActiveTab(val as ReadOnlyStaffTab);
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
                Tra cứu hồ sơ chứng chỉ nhân viên và theo dõi vắng mặt (tối đa 4 ngày/tháng • Nhân sự Full-time)
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

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <Tabs
        value={managerTab}
        onValueChange={(val) => {
          if (val) setManagerTab(val as ManagerStaffTab);
        }}
        className="gap-6"
      >
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
              <UserCheck className="w-6 h-6 text-[#6B1F2E] dark:text-[#FF7F6B]" />
              Nhân Sự, Phê Duyệt &amp; Quỹ Nghỉ Phép
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Duyệt chứng chỉ, duyệt đơn nghỉ phép / ca làm, kiểm soát hạn mức vắng mặt (tối đa 4
              ngày/tháng)
            </p>
          </div>

          <TabsList className="h-auto! flex-wrap gap-1.5 bg-white dark:bg-card border border-zinc-200/80 dark:border-border p-1.5 rounded-2xl shadow-sm w-fit">
            {[
              { value: "requests", label: "Duyệt nghỉ phép & Ca làm", Icon: Calendar },
              { value: "quota", label: "Hạn mức & Vắng mặt", Icon: Clock },
              { value: "directory", label: "Đội ngũ & Bằng cấp", Icon: UserCheck },
            ].map(({ value, label, Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-zinc-50/80 dark:bg-muted/40 text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground hover:bg-zinc-100 dark:hover:bg-muted data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="directory" className="space-y-5">
          <CertificateApprovalPanel />
          <StaffDirectoryTable
            staffList={staff.staffList}
            expertStores={staff.expertStores}
            onSelectStaff={staff.setSelectedStaff}
          />
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <LeaveRequestsPanel />
        </TabsContent>

        <TabsContent value="quota" className="space-y-4">
          <LeaveQuotaPanel />
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
