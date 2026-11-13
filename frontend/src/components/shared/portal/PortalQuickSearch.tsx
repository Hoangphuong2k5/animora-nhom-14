"use client";

import React, { useState, useEffect } from "react";
import { Search, ArrowRight, CornerDownLeft } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface PortalSearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  badge?: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  onSelect?: () => void;
}

export interface PortalQuickSearchProps {
  id?: string;
  placeholder?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  results?: PortalSearchResultItem[];
  onSelectResult?: (item: PortalSearchResultItem) => void;
  quickLinks?: PortalSearchResultItem[];
  emptyText?: string;
  className?: string;
}

export function PortalQuickSearch({
  id = "portal-quick-search",
  placeholder = "Tìm nhanh... (Ctrl+K)",
  searchQuery,
  onSearchChange,
  results = [],
  onSelectResult,
  quickLinks = [],
  emptyText = "Không tìm thấy kết quả phù hợp.",
  className,
}: PortalQuickSearchProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Global Ctrl+K / Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleItemSelect = (item: PortalSearchResultItem) => {
    setIsOpen(false);
    onSearchChange("");
    if (onSelectResult) {
      onSelectResult(item);
    } else if (item.onSelect) {
      item.onSelect();
    }
  };

  const hasQuery = searchQuery.trim().length > 0;

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      {/* Trigger Pill in Header */}
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={placeholder}
        className="w-full flex items-center justify-between gap-2 pl-3 pr-2.5 py-1.5 rounded-full text-xs bg-muted/60 hover:bg-muted border border-border/70 hover:border-(--coral)/50 text-muted-foreground transition-all cursor-pointer group"
      >
        <span className="flex items-center gap-2 min-w-0 truncate">
          <Search className="size-3.5 text-primary dark:text-(--coral) shrink-0 transition-transform group-hover:scale-105" />
          <span className="truncate">
            {hasQuery ? searchQuery : placeholder}
          </span>
        </span>
        <kbd className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-background/80 border border-border text-muted-foreground shrink-0">
          Ctrl+K
        </kbd>
      </button>

      {/* Shadcn CommandDialog */}
      <CommandDialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open && hasQuery) {
            onSearchChange("");
          }
        }}
        title="Tìm kiếm nhanh"
        description={placeholder}
        className="sm:max-w-lg rounded-2xl! border border-border bg-popover text-popover-foreground shadow-2xl"
      >
        <Command
          shouldFilter={false}
          className="bg-popover text-popover-foreground rounded-2xl!"
        >
          <CommandInput
            value={searchQuery}
            onValueChange={onSearchChange}
            placeholder={placeholder}
          />

          <CommandList className="max-h-80 p-1.5 scrollbar-thin">
            {hasQuery ? (
              results.length === 0 ? (
                <CommandEmpty className="py-8 text-center text-xs text-muted-foreground">
                  {emptyText}
                </CommandEmpty>
              ) : (
                <CommandGroup heading={`Kết quả tìm kiếm (${results.length})`}>
                  {results.map((item) => {
                    const Icon = item.icon || Search;
                    return (
                      <CommandItem
                        key={item.id}
                        value={`${item.id} ${item.title} ${item.subtitle ?? ""}`}
                        onSelect={() => handleItemSelect(item)}
                        className="flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer data-selected:bg-primary/8 dark:data-selected:bg-(--coral)/15"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="size-7 rounded-lg bg-primary/10 dark:bg-(--coral)/20 text-primary dark:text-(--coral) flex items-center justify-center shrink-0">
                            <Icon className="size-3.5" />
                          </div>
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="text-xs font-bold text-foreground flex items-center gap-1.5 min-w-0">
                              <span className="truncate">{item.title}</span>
                              {item.category && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] font-semibold px-1.5 py-0 h-4 shrink-0"
                                >
                                  {item.category}
                                </Badge>
                              )}
                            </div>
                            {item.subtitle && (
                              <div className="text-[11px] text-muted-foreground truncate">
                                {item.subtitle}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.badge && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-bold px-2 py-0 h-4.5 border-border"
                            >
                              {item.badge}
                            </Badge>
                          )}
                          <ArrowRight className="size-3.5 text-muted-foreground opacity-60 group-data-selected/command-item:opacity-100 group-data-selected/command-item:translate-x-0.5 transition-all" />
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )
            ) : (
              quickLinks.length > 0 && (
                <CommandGroup heading="Truy cập nhanh">
                  {quickLinks.map((item) => {
                    const Icon = item.icon || ArrowRight;
                    return (
                      <CommandItem
                        key={item.id}
                        value={`${item.id} ${item.title}`}
                        onSelect={() => handleItemSelect(item)}
                        className="flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer data-selected:bg-primary/8 dark:data-selected:bg-(--coral)/15"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="size-6.5 rounded-lg bg-primary/10 dark:bg-(--coral)/20 text-primary dark:text-(--coral) flex items-center justify-center shrink-0">
                            <Icon className="size-3.5" />
                          </div>
                          <span className="text-xs font-semibold text-foreground truncate">
                            {item.title}
                          </span>
                        </div>
                        <CornerDownLeft className="size-3 text-muted-foreground opacity-0 group-data-selected/command-item:opacity-100 transition-opacity shrink-0" />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )
            )}
          </CommandList>

          {/* Subtle Keyboard Hints Footer */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/30 text-[10px] text-muted-foreground">
            <span>Dùng phím ↑↓ để di chuyển, Enter để chọn</span>
            <span className="font-mono">ESC để đóng</span>
          </div>
        </Command>
      </CommandDialog>
    </div>
  );
}
