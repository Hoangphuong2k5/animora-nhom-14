"use client";

import React, { useState } from "react";
import { Download, FileText, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { usePagination } from "@/components/ui/table-pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinanceLedgerTable } from "./FinanceLedgerTable";
import { FinanceSummaryAndChart } from "./FinanceSummaryAndChart";
import {
  type FinancePeriod,
  PERIOD_FINANCE_DATA,
  SAMPLE_TRANSACTIONS,
} from "./financeTypesAndData";

export interface FinanceWorkspaceProps {
  mode?: "manager" | "readonly";
}

/** Shared Revenue & Cashflow Ledger workspace for Manager and Admin (read-only). */
export function FinanceWorkspace({ mode = "manager" }: FinanceWorkspaceProps) {
  const isReadOnly = mode === "readonly";
  const [period, setPeriod] = useState<FinancePeriod>("month");
  const [filterType, setFilterType] = useState<string>("all");

  const activeConfig = PERIOD_FINANCE_DATA[period];

  const handleExport = (format: "excel" | "pdf") => {
    toast.success(
      `Đã xuất báo cáo tài chính (${activeConfig.label}) dưới định dạng ${format.toUpperCase()}!`
    );
  };

  const filteredTx = SAMPLE_TRANSACTIONS.filter((tx) => {
    const monthNum = Number(tx.date.slice(5, 7));
    if (period === "month" && monthNum !== 11) return false;
    if (period === "quarter" && monthNum < 10) return false;
    if (filterType === "in") return tx.type.startsWith("in_");
    if (filterType === "out") return tx.type.startsWith("out_");
    return true;
  });

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedTx,
  } = usePagination(filteredTx, 5);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-foreground flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-[#6B1F2E] dark:text-[#FF7F6B]" />
            {isReadOnly
              ? "Tra Cứu Doanh Thu & Kế Toán Dòng Tiền"
              : "Doanh Thu & Kế Toán Dòng Tiền"}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Báo cáo tổng hợp doanh thu dịch vụ, bán lẻ cửa hàng, đối chiếu chi phí và sổ cái dòng tiền
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Tabs
            value={period}
            onValueChange={(val) => {
              if (val) {
                setPeriod(val as FinancePeriod);
                setCurrentPage(1);
              }
            }}
          >
            <TabsList className="h-auto! flex-wrap gap-1.5 bg-white dark:bg-card border border-zinc-200/80 dark:border-border p-1.5 rounded-2xl shadow-sm w-fit">
              {(
                [
                  { id: "month", label: "Tháng này" },
                  { id: "quarter", label: "Quý 4" },
                  { id: "year", label: "Cả năm 2026" },
                ] as const
              ).map((p) => (
                <TabsTrigger
                  key={p.id}
                  value={p.id}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-zinc-50/80 dark:bg-muted/40 text-zinc-600 dark:text-muted-foreground hover:text-zinc-900 dark:hover:text-foreground hover:bg-zinc-100 dark:hover:bg-muted data-active:bg-[#6B1F2E]! data-active:text-white! dark:data-active:bg-primary! dark:data-active:text-primary-foreground! data-active:shadow-sm"
                >
                  {p.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleExport("excel")}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
            <button
              type="button"
              onClick={() => handleExport("pdf")}
              className="px-3 py-2 rounded-xl bg-[#6B1F2E] hover:bg-[#8C2B3E] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      <FinanceSummaryAndChart activeConfig={activeConfig} />

      <FinanceLedgerTable
        filterType={filterType}
        onChangeFilterType={(next) => {
          setFilterType(next);
          setCurrentPage(1);
        }}
        transactions={paginatedTx}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
