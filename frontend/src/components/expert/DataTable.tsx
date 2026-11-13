"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState, LoadingSkeleton } from "./DataState";

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render: (item: T, index: number) => React.ReactNode;
  sortValue?: (item: T) => string | number;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  pageSize?: number;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  extraFilters?: React.ReactNode;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  searchPlaceholder = "Tìm kiếm...",
  searchFilter,
  pageSize = 10,
  loading = false,
  emptyTitle,
  emptyDescription,
  extraFilters,
  onRowClick,
  className = "",
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  // Filter
  const filtered = useMemo(() => {
    if (!searchQuery.trim() || !searchFilter) return data;
    const q = searchQuery.toLowerCase().trim();
    return data.filter((item) => searchFilter(item, q));
  }, [data, searchQuery, searchFilter]);

  // Sort
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col || !col.sortValue) return filtered;

    return [...filtered].sort((a, b) => {
      const valA = col.sortValue!(a);
      const valB = col.sortValue!(b);
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortOrder, columns]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey === key) {
      if (sortOrder === "asc") setSortOrder("desc");
      else {
        setSortKey(null);
        setSortOrder("asc");
      }
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {searchFilter && (
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full h-9 pl-9 pr-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-border bg-white dark:bg-card text-zinc-900 dark:text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#FF7F6B]/30 focus:border-[#FF7F6B] transition-all"
            />
          </div>
        )}
        {extraFilters && <div className="flex items-center gap-2 flex-wrap">{extraFilters}</div>}
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-zinc-200/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-sm overflow-hidden shadow-sm">
        {loading ? (
          <LoadingSkeleton rows={5} />
        ) : sorted.length === 0 ? (
          <div className="p-4">
            <EmptyState title={emptyTitle} description={emptyDescription} />
          </div>
        ) : (
          <Table className="w-full text-left text-xs">
            <TableHeader className="border-b border-zinc-200/80 dark:border-border bg-zinc-50/70 dark:bg-card/70 text-zinc-600 dark:text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
              <TableRow className="border-zinc-200/80 dark:border-border hover:bg-transparent">
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    onClick={() => handleSort(col.key, col.sortable)}
                    className={cn(
                      "h-auto px-4 py-3.5 select-none text-zinc-600 dark:text-muted-foreground font-bold uppercase tracking-wider text-[10px]",
                      col.sortable && "cursor-pointer hover:text-zinc-900 dark:hover:text-foreground",
                      col.className
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-zinc-400">
                          {sortKey === col.key ? (
                            sortOrder === "asc" ? (
                              <ChevronUp className="w-3.5 h-3.5 text-[#6B1F2E] dark:text-[#FF7F6B]" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-[#6B1F2E] dark:text-[#FF7F6B]" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3 h-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-zinc-200/60 dark:divide-border/60">
              {pagedData.map((item, idx) => (
                <TableRow
                  key={keyExtractor(item)}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={cn(
                    "border-zinc-200/60 dark:border-border/60 transition-colors hover:bg-[#6B1F2E]/5 dark:hover:bg-[#FF7F6B]/5",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn("px-4 py-3.5 align-middle whitespace-normal", col.className)}
                    >
                      {col.render(item, idx)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Bottom Pagination */}
        {!loading && sorted.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200/80 dark:border-border bg-zinc-50/40 dark:bg-card/40 text-xs text-zinc-500">
            <div>
              Hiển thị{" "}
              <span className="font-bold text-zinc-900 dark:text-foreground">
                {Math.min(sorted.length, (currentPage - 1) * pageSize + 1)}-
                {Math.min(sorted.length, currentPage * pageSize)}
              </span>{" "}
              trên tổng số{" "}
              <span className="font-bold text-zinc-900 dark:text-foreground">{sorted.length}</span>
            </div>
            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent className="gap-1.5">
                <PaginationItem>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Trang trước"
                    className="size-7 rounded-lg border-zinc-200 dark:border-border bg-white dark:bg-card hover:bg-zinc-100 dark:hover:bg-muted cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <span className="px-2 text-xs font-bold text-zinc-700 dark:text-foreground/80">
                    {currentPage} / {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Trang sau"
                    className="size-7 rounded-lg border-zinc-200 dark:border-border bg-white dark:bg-card hover:bg-zinc-100 dark:hover:bg-muted cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}

