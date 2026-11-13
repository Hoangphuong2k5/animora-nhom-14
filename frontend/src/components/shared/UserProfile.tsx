"use client";

import Link from "next/link";
import { LogOut, ShieldCheck, User as UserIcon } from "lucide-react";
import { useTranslation } from "@/components/providers/I18nProvider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ROUTES } from "@/constants/config.constant";
import { useAuth } from "@/hooks/useAuth";

export default function UserProfile() {
  const { user, role, isAdmin, isLoading, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="px-2 flex items-center">
        <Spinner className="w-4 h-4" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-2">
        {isAdmin && (
          <Link
            href={ROUTES.ADMIN}
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t("nav.admin")}</span>
          </Link>
        )}

        <Link
          href={ROUTES.PROFILE}
          className="inline-flex items-center gap-1.5 text-sm font-medium px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <UserIcon className="w-4 h-4" />
          <span className="max-w-28 truncate">{user.fullName || user.email}</span>
          {role && (
            <span className="hidden sm:inline-flex items-center rounded-full bg-zinc-200/80 dark:bg-zinc-700/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
              {role}
            </span>
          )}
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="cursor-pointer gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t("nav.logout")}</span>
        </Button>
      </div>
    );
  }

  return (
    <Link href={ROUTES.LOGIN} className={buttonVariants({ size: "sm" })}>
      {t("nav.login")}
    </Link>
  );
}
