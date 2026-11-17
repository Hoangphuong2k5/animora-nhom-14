"use client";

import {
  MANAGER_STORAGE_KEYS,
  SEED_EMPLOYEES,
  SEED_QUOTA,
  SEED_REQUESTS,
  useManagerStore,
  type LeaveQuotaConfig,
  type ManagerEmployee,
  type StaffRequest,
} from "@/data/managerOpsData";

/** Truy cập toàn bộ dữ liệu nhân sự vận hành của Manager (đồng bộ giữa các tab). */
export function useStaffOps() {
  const [employees, setEmployees] = useManagerStore<ManagerEmployee[]>(
    MANAGER_STORAGE_KEYS.employees,
    SEED_EMPLOYEES
  );
  const [requests, setRequests] = useManagerStore<StaffRequest[]>(
    MANAGER_STORAGE_KEYS.requests,
    SEED_REQUESTS
  );
  const [quota, setQuota] = useManagerStore<LeaveQuotaConfig>(MANAGER_STORAGE_KEYS.quota, SEED_QUOTA);

  const employeeById = (id: string) => employees.find((e) => e.id === id);

  return {
    employees,
    setEmployees,
    requests,
    setRequests,
    quota,
    setQuota,
    employeeById,
  };
}

export const panelCard =
  "p-4 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-border bg-white dark:bg-card shadow-sm";
export const thClass =
  "py-3 px-3 text-zinc-500 dark:text-muted-foreground uppercase tracking-wider font-semibold text-[11px]";
export const inputClass =
  "w-full px-3 py-2 rounded-xl text-xs border border-zinc-200 dark:border-border bg-zinc-50 dark:bg-muted text-zinc-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#FF7F6B]";
export const primaryBtn =
  "px-3 py-1.5 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs cursor-pointer shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
export const approveBtn =
  "px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer";
export const rejectBtn =
  "px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 hover:bg-rose-100 font-bold text-[11px] cursor-pointer";

export function StatusPill({ status }: { status: "pending" | "approved" | "rejected" }) {
  const map = {
    pending: { label: "Chờ duyệt", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    approved: { label: "Đã duyệt", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    rejected: { label: "Từ chối", cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  }[status];
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${map.cls}`}>
      {map.label}
    </span>
  );
}

