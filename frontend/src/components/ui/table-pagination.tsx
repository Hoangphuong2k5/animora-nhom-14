"use client";

import React, { useMemo, useState } from "react";

export type PaginationTone = "manager" | "supplier" | "receptionist";

const ACTIVE_TONE_CLASS: Record<PaginationTone, string> = {
  manager: "bg-[#6B1F2E] text-white shadow-sm",
  supplier: "bg-teal-600 text-white shadow-sm",
  receptionist: "bg-rose-600 text-white shadow-sm",
};

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  tone?: PaginationTone;
  className?: string;
}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  tone = "manager",
  className = "",
}: TablePaginationProps) {
  if (totalPages <= 1) return null;

  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const activeClass = ACTIVE_TONE_CLASS[tone];

  return (
    <div
      className={`mt-4 pt-4 border-t border-zinc-100 dark:border-border/60 flex items-center justify-center gap-1.5 flex-wrap text-xs ${className}`}
    >
      <button
        type="button"
        disabled={safePage <= 1}
        onClick={() => onPageChange(Math.max(1, safePage - 1))}
        className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-border font-semibold text-zinc-600 dark:text-muted-foreground hover:bg-zinc-100 dark:hover:bg-muted disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors"
      >
        Trước
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
        <button
          key={pageNum}
          type="button"
          onClick={() => onPageChange(pageNum)}
          className={`w-8 h-8 rounded-xl font-bold transition-all cursor-pointer ${
            pageNum === safePage
              ? activeClass
              : "bg-zinc-50 dark:bg-muted/60 text-zinc-600 dark:text-muted-foreground hover:bg-zinc-100 dark:hover:bg-muted border border-zinc-200/70 dark:border-border"
          }`}
        >
          {pageNum}
        </button>
      ))}

      <button
        type="button"
        disabled={safePage >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
        className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-border font-semibold text-zinc-600 dark:text-muted-foreground hover:bg-zinc-100 dark:hover:bg-muted disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors"
      >
        Sau
      </button>
    </div>
  );
}

export function usePagination<T>(items: T[], pageSize = 5) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  return {
    currentPage: safePage,
    setCurrentPage,
    totalPages,
    paginatedItems,
  };
}
