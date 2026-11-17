"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_REDIRECT_BY_ROLE, ROLES } from "@/constants/roles.constant";
import { useAuth } from "@/hooks/useAuth";

/** Redirects authenticated non-user roles (admin, manager, expert) away from customer-facing `(user)` routes to their own portal. */
export function AdminUserRouteGuard() {
  const { isAuthenticated, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && role && role !== ROLES.USER) {
      router.replace(DEFAULT_REDIRECT_BY_ROLE[role]);
    }
  }, [isLoading, isAuthenticated, role, router]);

  return null;
}

