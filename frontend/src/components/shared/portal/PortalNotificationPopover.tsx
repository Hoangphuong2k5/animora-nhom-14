"use client";

import React from "react";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface PortalNotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  icon?: React.ReactNode;
  href?: string;
}

export interface PortalNotificationPopoverProps {
  items: PortalNotificationItem[];
  unreadCount: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  unreadBadgeText?: string;
  markAllReadLabel?: string;
  emptyLabel?: string;
  tooltipLabel?: string;
  onMarkAllRead?: () => void;
  onSelectItem?: (item: PortalNotificationItem) => void;
  className?: string;
}

export function PortalNotificationPopover({
  items,
  unreadCount,
  open,
  onOpenChange,
  title = "Thông báo",
  unreadBadgeText,
  markAllReadLabel = "Đọc tất cả",
  emptyLabel = "Chưa có thông báo mới.",
  tooltipLabel = "Thông báo hệ thống",
  onMarkAllRead,
  onSelectItem,
  className,
}: PortalNotificationPopoverProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              data-testid="portal-notification-trigger"
              aria-label={tooltipLabel}
              className={cn(
                "relative inline-flex size-9 items-center justify-center rounded-xl text-foreground/80 hover:bg-muted hover:text-foreground transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                className
              )}
            />
          }
        >
          <Bell className="size-4.5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-(--coral) px-1 text-[10px] font-extrabold text-white shadow-xs animate-pulse">
              {unreadCount}
            </span>
          )}
        </TooltipTrigger>
        <TooltipContent side="bottom">{tooltipLabel}</TooltipContent>
      </Tooltip>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[calc(100vw-2rem)] sm:w-96 p-0 gap-0 rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-heading font-bold text-sm text-foreground truncate">
              {title}
            </span>
            {unreadCount > 0 && (
              <Badge
                variant="secondary"
                className="bg-(--coral)/15 text-(--coral) border-transparent font-extrabold text-[10px] px-2 py-0.5 h-5"
              >
                {unreadBadgeText ?? `${unreadCount} mới`}
              </Badge>
            )}
          </div>

          {unreadCount > 0 && onMarkAllRead && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={onMarkAllRead}
              className="text-[11px] font-bold text-primary hover:text-(--coral) hover:bg-primary/5 px-2 shrink-0 cursor-pointer"
            >
              {markAllReadLabel}
            </Button>
          )}
        </div>

        {/* Scrollable Notification List */}
        <ScrollArea className="max-h-80 w-full overflow-x-hidden">
          <div className="p-2 space-y-1 overflow-x-hidden">
            {items.length === 0 ? (
              <div className="py-8 px-4 text-center text-xs text-muted-foreground">
                {emptyLabel}
              </div>
            ) : (
              items.map((item) => {
                const interactive = Boolean(onSelectItem);
                return (
                  <div
                    key={item.id}
                    role={interactive ? "button" : undefined}
                    tabIndex={interactive ? 0 : undefined}
                    onClick={() => onSelectItem?.(item)}
                    onKeyDown={(e) => {
                      if (
                        interactive &&
                        (e.key === "Enter" || e.key === " ")
                      ) {
                        e.preventDefault();
                        onSelectItem?.(item);
                      }
                    }}
                    className={cn(
                      "w-full p-2.5 rounded-xl flex items-start gap-3 transition-colors min-w-0 overflow-hidden",
                      interactive && "cursor-pointer",
                      item.unread
                        ? "bg-primary/6 dark:bg-(--coral)/12 hover:bg-primary/10 dark:hover:bg-(--coral)/18"
                        : "hover:bg-muted/60 opacity-85"
                    )}
                  >
                    <div className="size-8.5 rounded-xl bg-primary/10 dark:bg-(--coral)/20 text-primary dark:text-(--coral) flex items-center justify-center shrink-0 mt-0.5">
                      {item.icon ?? <Bell className="size-4" />}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <h4 className="text-xs font-bold text-foreground truncate">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {item.time}
                          </span>
                          {item.unread && (
                            <span className="size-1.5 rounded-full bg-(--coral) shrink-0" />
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 wrap-break-word">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
