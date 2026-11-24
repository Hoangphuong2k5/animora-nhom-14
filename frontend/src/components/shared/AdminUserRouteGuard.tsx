"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DEFAULT_REDIRECT_BY_ROLE, ROLES } from "@/constants/roles.constant";
import { useAuth } from "@/hooks/useAuth";

/** Redirects authenticated non-user roles (admin, manager, expert) away from customer-facing `(user)` routes to their own portal.
 *  Per Animora v1.4 Section 6.2, Receptionist (LT) is allowed to access `/dat-lich` to book on behalf of customers.
 */
export function AdminUserRouteGuard() {
  const { isAuthenticated, role, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && isAuthenticated && role && role !== ROLES.USER) {
      const isReceptionistOnBookingPage =
        role === ROLES.RECEPTIONIST &&
        Boolean(pathname && (pathname === "/dat-lich" || pathname.startsWith("/dat-lich/")));
      if (!isReceptionistOnBookingPage) {
        router.replace(DEFAULT_REDIRECT_BY_ROLE[role]);
      }
    }
  }, [isLoading, isAuthenticated, role, router, pathname]);

  return null;
}

