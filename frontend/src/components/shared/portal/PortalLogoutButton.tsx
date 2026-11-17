"use client";

import React from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface PortalLogoutButtonProps {
  onLogout: () => void;
  tooltipLabel?: string;
}

export function PortalLogoutButton({
  onLogout,
  tooltipLabel = "Đăng xuất khỏi hệ thống",
}: PortalLogoutButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onLogout}
            aria-label={tooltipLabel}
            className="size-10 rounded-full border border-zinc-200/90 dark:border-border bg-white dark:bg-card/90 shadow-xs hover:shadow-sm text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/5 transition-all cursor-pointer"
          />
        }
      >
        <LogOut className="size-4" />
      </TooltipTrigger>
      <TooltipContent side="bottom">{tooltipLabel}</TooltipContent>
    </Tooltip>
  );
}

