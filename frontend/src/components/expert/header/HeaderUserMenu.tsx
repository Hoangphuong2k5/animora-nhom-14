"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  DollarSign,
  LogOut,
  Scissors,
  Stethoscope,
  User,
} from "lucide-react";
import { ROUTES } from "@/constants/config.constant";
import { ExpertProfile } from "@/types/expert.type";
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

interface HeaderUserMenuProps {
  profile: ExpertProfile;
  isVet: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
  onLogout: () => void;
  roleLabel: string;
  profileLabel: string;
  earningsLabel: string;
  logoutLabel: string;
}

export function HeaderUserMenu({
  profile,
  isVet,
  isOpen,
  onToggle,
  onClose,
  onLogout,
  roleLabel,
  profileLabel,
  earningsLabel,
  logoutLabel,
}: HeaderUserMenuProps) {
  const router = useRouter();

  const initials = profile.fullName
    ? profile.fullName
        .split(" ")
        .filter(Boolean)
        .slice(-2)
        .map((p) => p[0])
        .join("")
        .toUpperCase()
    : "EX";

  const isControlled = isOpen !== undefined;

  return (
    <DropdownMenu
      open={isControlled ? isOpen : undefined}
      onOpenChange={
        isControlled
          ? (open) => {
              if (open) {
                if (!isOpen) onToggle?.();
              } else {
                onClose?.();
              }
            }
          : undefined
      }
    >
      <DropdownMenuTrigger className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-muted/60 hover:bg-muted border border-border/80 hover:border-(--coral)/40 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
        <Avatar size="sm" className="size-7">
          {profile.avatar && (
            <AvatarImage src={profile.avatar} alt={profile.fullName} />
          )}
          <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold leading-tight text-foreground truncate max-w-[140px]">
            {profile.fullName}
          </span>
          <span className="text-[10px] font-semibold text-primary dark:text-(--coral) truncate max-w-[140px]">
            {roleLabel}
          </span>
        </div>
        <ChevronDown className="hidden sm:block size-3.5 text-muted-foreground shrink-0" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-60 rounded-2xl p-1.5 border border-border bg-popover text-popover-foreground shadow-xl"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-2 flex flex-col gap-1">
            <div className="font-bold text-xs text-foreground truncate">
              {profile.fullName}
            </div>
            <div className="text-[11px] font-normal text-muted-foreground truncate">
              {profile.email}
            </div>
            <Badge
              variant="secondary"
              className="mt-1 w-fit bg-primary/10 dark:bg-(--coral)/20 text-primary dark:text-(--coral) text-[9px] font-extrabold uppercase px-2 py-0 h-4.5"
            >
              {isVet ? (
                <Stethoscope className="size-2.5" />
              ) : (
                <Scissors className="size-2.5" />
              )}
              <span>{roleLabel}</span>
            </Badge>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              onClose?.();
              router.push(ROUTES.EXPERT_PROFILE);
            }}
            className="rounded-xl px-2.5 py-2 text-xs font-semibold gap-2 cursor-pointer"
          >
            <User className="size-3.5 text-primary dark:text-(--coral)" />
            <span>{profileLabel}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              onClose?.();
              router.push(ROUTES.EXPERT_EARNINGS);
            }}
            className="rounded-xl px-2.5 py-2 text-xs font-semibold gap-2 cursor-pointer"
          >
            <DollarSign className="size-3.5 text-primary dark:text-(--coral)" />
            <span>{earningsLabel}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            onClose?.();
            onLogout();
          }}
          className="rounded-xl px-2.5 py-2 text-xs font-bold gap-2 cursor-pointer"
        >
          <LogOut className="size-3.5" />
          <span>{logoutLabel}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
