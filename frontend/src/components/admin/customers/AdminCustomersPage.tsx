"use client";

import React from "react";
import { Users } from "lucide-react";
import { useAdminCustomers } from "@/hooks/admin/useAdminCustomers";
import { CustomersFilterBar } from "./CustomersFilterBar";
import { CustomersTable } from "./CustomersTable";
import { CustomerDetailSheet } from "./CustomerDetailSheet";

/** Main admin customer management workspace. */
export function AdminCustomersPage() {
  const admin = useAdminCustomers();

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
          <Users className="w-6 h-6 text-[#6B1F2E] dark:text-[#FF7F6B]" />
          Quản Lý Khách Hàng
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Danh sách khách hàng, hồ sơ thú cưng sở hữu, lịch sử chi tiêu và kiểm
          soát tài khoản
        </p>
      </div>

      <CustomersFilterBar
        customers={admin.customers}
        searchQuery={admin.searchQuery}
        onChangeSearch={admin.setSearchQuery}
        filterStatus={admin.filterStatus}
        onChangeStatus={admin.setFilterStatus}
      />

      <CustomersTable
        customers={admin.filteredCustomers}
        onSelectCustomer={admin.setSelectedCustomer}
        onToggleLock={admin.handleToggleLock}
      />

      <CustomerDetailSheet
        customer={admin.selectedCustomer}
        onClose={() => admin.setSelectedCustomer(null)}
        onToggleLock={admin.handleToggleLock}
      />
    </div>
  );
}
