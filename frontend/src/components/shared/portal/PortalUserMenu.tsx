"use client";

import React from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export interface PortalUserMenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  onClick: () => void;
}

export interface PortalUserMenuProps {
  name: string;
  subtitle: string;
  subtitleClassName?: string;
  menuTitle?: string;
  menuEmail?: string;
  avatarSrc?: string;
  initials: string;
  avatarFallbackClassName?: string;
  avatarRingClassName?: string;
  roleBadge?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    className?: string;
  };
  menuItems: PortalUserMenuItem[];
  logoutLabel?: string;
  onLogout: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerHoverClassName?: string;
}

export function PortalUserMenu({
  name,
  subtitle,
  subtitleClassName,
  menuTitle,
  menuEmail,
  avatarSrc,
  initials,
  avatarFallbackClassName,
  avatarRingClassName,
  roleBadge,
  menuItems,
  logoutLabel = "Đăng xuất",
  onLogout,
  open,
  onOpenChange,
  triggerHoverClassName,
}: PortalUserMenuProps) {
  const RoleIcon = roleBadge?.icon;

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger
        className={cn(
          "h-10 flex items-center gap-2.5 pl-1.5 pr-3 rounded-full bg-white dark:bg-card/90 hover:bg-zinc-50 dark:hover:bg-muted/80 border border-zinc-200/90 dark:border-border shadow-xs hover:shadow-sm hover:border-[#6B1F2E]/30 dark:hover:border-(--coral)/40 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/50 group",
          triggerHoverClassName
        )}
      >
        <Avatar
          size="sm"
          className={cn(
            "size-7 ring-2 ring-[#6B1F2E]/10 dark:ring-(--coral)/20 shrink-0",
            avatarRingClassName
          )}
        >
          {avatarSrc && <AvatarImage src={avatarSrc} alt={name} />}
          <AvatarFallback
            className={cn(
              "bg-linear-to-br from-[#6B1F2E] to-[#8C2B3E] text-white font-bold text-[11px]",
              avatarFallbackClassName
            )}
          >
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="hidden sm:flex flex-col text-left gap-0.5">
          <span className="text-xs font-bold leading-none text-foreground truncate max-w-[140px]">
            {name}
          </span>
          <span
            className={cn(
              "text-[10px] leading-none text-muted-foreground font-medium truncate max-w-[140px]",
              subtitleClassName
            )}
          >
            {subtitle}
          </span>
        </div>

        <ChevronDown className="hidden sm:block size-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-0.5" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-60 rounded-2xl p-1.5 border border-border bg-popover text-popover-foreground shadow-xl"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-2 flex flex-col gap-1">
            <div className="text-xs font-bold text-foreground truncate">
              {menuTitle || name}
            </div>
            <div className="text-[11px] font-normal text-muted-foreground truncate">
              {menuEmail || subtitle}
            </div>
            {roleBadge && (
              <Badge
                variant="secondary"
                className={cn(
                  "mt-1 w-fit bg-primary/10 dark:bg-(--coral)/20 text-primary dark:text-(--coral) text-[9px] font-extrabold uppercase px-2 py-0 h-4.5 gap-1",
                  roleBadge.className
                )}
              >
                {RoleIcon && <RoleIcon className="size-2.5" />}
                <span>{roleBadge.label}</span>
              </Badge>
            )}
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {menuItems.map((item) => {
            const ItemIcon = item.icon;
            return (
              <DropdownMenuItem
                key={item.label}
                onClick={item.onClick}
                className="rounded-xl px-2.5 py-2 text-xs font-semibold gap-2 cursor-pointer"
              >
                <ItemIcon
                  className={cn(
                    "size-3.5 text-primary dark:text-(--coral)",
                    item.iconClassName
                  )}
                />
                <span>{item.label}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={onLogout}
          className="rounded-xl px-2.5 py-2 text-xs font-bold gap-2 cursor-pointer"
        >
          <LogOut className="size-3.5" />
          <span>{logoutLabel}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

