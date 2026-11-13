"use client";

import React, { useState } from "react";
import { Download } from "lucide-react";
import { useExpert } from "@/components/expert/ExpertProvider";
import { BarDataPoint } from "@/components/expert/Charts";
import { EarningsSummaryCards } from "@/components/expert/earnings/EarningsSummaryCards";
import { EarningsTrendChart } from "@/components/expert/earnings/EarningsTrendChart";
import { CommissionDetailTable } from "@/components/expert/earnings/CommissionDetailTable";
import { useEarningsExport } from "@/hooks/expert/useEarningsExport";
import { SEED_PAYROLL_MONTHS } from "@/data/expertPortalData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAYROLL_MONTH_ITEMS: Record<string, string> = Object.fromEntries(
  SEED_PAYROLL_MONTHS.map((m) => [
    m.month,
    `Tháng ${m.month} (${m.status === "paid" ? "Đã chi" : "Tạm tính"})`,
  ])
);

export default function ExpertEarningsPage() {
  const { profile, store, allServices, allPets } = useExpert();

  const [selectedMonth, setSelectedMonth] = useState<string>("2024-11");

  // Current month payroll
  const currentPayroll =
    SEED_PAYROLL_MONTHS.find((p) => p.month === selectedMonth) ||
    SEED_PAYROLL_MONTHS[SEED_PAYROLL_MONTHS.length - 1];

  const netEarnings =
    currentPayroll.baseSalary +
    currentPayroll.commission +
    currentPayroll.ratingBonus -
    currentPayroll.deductions;

  // Monthly earnings bar data
  const monthlyEarningsData: BarDataPoint[] = SEED_PAYROLL_MONTHS.map((m) => ({
    label: `Tháng ${parseInt(m.month.slice(5))}`,
    subLabel: m.status === "paid" ? "Đã chi" : "Tạm tính",
    value: Math.round((m.baseSalary + m.commission + m.ratingBonus - m.deductions) / 1000000),
  }));

  // Completed appointments for commission detail table
  const completedAppointments = store.appointments.filter(
    (a) => a.status === "completed"
  );

  const { handleExportPayslip } = useEarningsExport(profile, currentPayroll, netEarnings);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-zinc-900 dark:text-foreground">
            Thu Nhập & Bảng Lương Chuyên Viên
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Bảng kê chi tiết lương cơ bản, hoa hồng theo từng booking hoàn thành và thưởng chất lượng dịch vụ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Select Month */}
          <Select
            value={selectedMonth}
            onValueChange={(val) => {
              if (val !== null) setSelectedMonth(val);
            }}
            items={PAYROLL_MONTH_ITEMS}
          >
            <SelectTrigger className="h-9! min-w-[195px] rounded-xl border-zinc-200 dark:border-border bg-white dark:bg-card px-3.5 text-xs font-bold text-zinc-800 dark:text-foreground/90 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEED_PAYROLL_MONTHS.map((m) => (
                <SelectItem key={m.month} value={m.month}>
                  Tháng {m.month} ({m.status === "paid" ? "Đã chi" : "Tạm tính"})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            type="button"
            onClick={handleExportPayslip}
            className="inline-flex h-9 items-center gap-1.5 px-4 rounded-xl text-xs font-bold bg-[#6B1F2E] text-white hover:bg-[#521723] transition-colors cursor-pointer shadow-sm shadow-[#6B1F2E]/20"
          >
            <Download className="w-4 h-4 text-[#FF7F6B]" />
            <span>Xuất phiếu lương</span>
          </button>
        </div>
      </div>

      {/* Summary Cards (Sub-Component) */}
      <EarningsSummaryCards
        currentPayroll={currentPayroll}
        commissionRate={profile.commissionRate}
        netEarnings={netEarnings}
      />

      {/* Lịch sử thu nhập các tháng (Sub-Component) */}
      <EarningsTrendChart data={monthlyEarningsData} />

      {/* Bảng chi tiết hoa hồng theo từng ca hoàn thành (Sub-Component) */}
      <CommissionDetailTable
        appointments={completedAppointments}
        pets={allPets}
        services={allServices}
        commissionRate={profile.commissionRate}
      />
    </div>
  );
}
