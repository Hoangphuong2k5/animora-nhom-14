"use client";

import React from "react";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";

export interface PortalHeaderProps {
  searchSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
  notificationSlot?: React.ReactNode;
  showThemeToggle?: boolean;
  languageSlot?: React.ReactNode;
  userSlot?: React.ReactNode;
  logoutButton?: React.ReactNode;
  className?: string;
}

export function PortalHeader({
  searchSlot,
  actionsSlot,
  notificationSlot,
  showThemeToggle = true,
  languageSlot,
  userSlot,
  logoutButton,
  className,
}: PortalHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 h-16 border-b border-zinc-200/80 dark:border-border bg-white/80 dark:bg-background/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4",
        className
      )}
    >
      {/* Left Search Slot */}
      {searchSlot ? (
        <div className="flex items-center max-w-xs sm:max-w-md w-full">
          {searchSlot}
        </div>
      ) : (
        <div />
      )}

      {/* Right Controls Area */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
        {actionsSlot}
        {notificationSlot}
        {languageSlot}
        {showThemeToggle && <ThemeToggle />}
        {userSlot && (
          <>
            <div className="h-4 w-px bg-zinc-200 dark:bg-border" />
            {userSlot}
          </>
        )}
        {logoutButton}
      </div>
    </header>
  );
}

