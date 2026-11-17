"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface PortalMenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: React.ReactNode;
  hidden?: boolean;
}

export interface PortalSidebarProps {
  brandHref: string;
  brandName?: string;
  logoSrc?: string;
  badge?: React.ReactNode;
  subtitle?: React.ReactNode;
  menuItems: PortalMenuItem[];
  footer?: React.ReactNode;
  collapsible?: boolean;
  className?: string;
}

export function PortalSidebar({
  brandHref,
  brandName = "Animora",
  logoSrc = "/assets/images/animora_pet_logo_1793179870995.jpg",
  badge,
  subtitle,
  menuItems,
  footer,
  collapsible = true,
  className,
}: PortalSidebarProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = !collapsible || isHovered;

  return (
    <aside
      onMouseEnter={() => collapsible && setIsHovered(true)}
      onMouseLeave={() => collapsible && setIsHovered(false)}
      onFocus={() => collapsible && setIsHovered(true)}
      onBlur={(e) => {
        if (collapsible && !e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setIsHovered(false);
        }
      }}
      className={cn(
        "w-full shrink-0 border-b md:border-b-0 md:border-r border-zinc-200/80 dark:border-sidebar-border bg-white/95 dark:bg-sidebar/95 backdrop-blur-md flex flex-col justify-between md:fixed md:inset-y-0 md:left-0 md:h-screen md:overflow-y-auto md:overflow-x-hidden z-40 md:transition-[width,box-shadow] md:duration-200 md:ease-out",
        isExpanded ? "md:w-64 md:shadow-2xl md:shadow-black/20" : "md:w-[72px]",
        className
      )}
    >
      {/* Constant horizontal padding (md:px-3) keeps every icon locked at the exact same X position */}
      <div className="p-4 md:px-3 md:py-4 space-y-4">
        {/* Brand Header (12px container + 4px link + 40px logo = centered in 72px) */}
        <Link
          href={brandHref}
          className="flex items-center gap-3 px-2.5 md:px-1 py-1.5 transition-transform hover:scale-[1.02] group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-[#6B1F2E] dark:border-[#FF7F6B] shadow-md shadow-[#6B1F2E]/20 flex items-center justify-center shrink-0 bg-[#6B1F2E]">
            <img
              src={logoSrc}
              alt={`${brandName} Logo`}
              className="w-full h-full object-cover"
            />
          </div>
          <div
            className={cn(
              "flex flex-col min-w-0 md:transition-opacity md:duration-150",
              !isExpanded && "md:opacity-0 md:pointer-events-none"
            )}
          >
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-extrabold text-xl tracking-tight text-[#6B1F2E] dark:text-[#F4B6C2] whitespace-nowrap">
                {brandName}
              </span>
              {badge}
            </div>
            {subtitle && (
              <div className="text-[10px] text-zinc-400 dark:text-muted-foreground font-medium whitespace-nowrap truncate">
                {subtitle}
              </div>
            )}
          </div>
        </Link>

        {/* Navigation Menu (12px container + 16px link + 16px icon = centered in 72px) */}
        <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {menuItems
            .filter((item) => !item.hidden)
            .map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3.5 md:px-4 py-2.5 text-xs font-bold transition-colors whitespace-nowrap duration-150",
                    isActive
                      ? "bg-[#6B1F2E] text-white dark:bg-primary dark:text-primary-foreground shadow-md shadow-[#6B1F2E]/20 dark:shadow-none"
                      : "text-zinc-600 dark:text-muted-foreground hover:bg-[#6B1F2E]/10 hover:text-[#6B1F2E] dark:hover:bg-muted/60 dark:hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0",
                        isActive ? "opacity-100" : "opacity-80"
                      )}
                    />
                    <span
                      className={cn(
                        "truncate md:transition-opacity md:duration-150",
                        !isExpanded && "md:opacity-0 md:pointer-events-none"
                      )}
                    >
                      {item.label}
                    </span>
                  </div>

                  {item.badge !== undefined && item.badge !== null && (
                    <span
                      className={cn(
                        "inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase leading-none shrink-0 ml-1.5 md:transition-opacity md:duration-150",
                        !isExpanded && "md:opacity-0 md:pointer-events-none",
                        isActive
                          ? "bg-white/20 text-white dark:bg-primary-foreground/20 dark:text-primary-foreground"
                          : "bg-[#FF7F6B]/20 text-[#FF7F6B] dark:text-[#FF7F6B]"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
        </nav>
      </div>

      {/* Optional Footer */}
      {footer && (
        <div
          className={cn(
            "p-4 border-t border-zinc-200/80 dark:border-sidebar-border md:transition-opacity md:duration-150",
            !isExpanded && "md:opacity-0 md:pointer-events-none"
          )}
        >
          {footer}
        </div>
      )}
    </aside>
  );
}
