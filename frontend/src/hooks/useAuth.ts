"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { devGetSessionInfoAction, logoutAction } from "@/actions/auth.action";
import { QUERY_KEYS } from "@/constants/query-keys.constant";
import { ROLES, type Role } from "@/constants/roles.constant";
import { axiosInstance } from "@/lib/axios";
import type { User } from "@/types/auth.type";
import { hasRole, resolveUserRole } from "@/utils/rbac";

async function fetchCurrentUser(): Promise<User | null> {
  try {
    const response = await axiosInstance.get("/auth/me");
    const rawUser: User | null =
      response.data?.data ?? response.data?.user ?? response.data ?? null;
    if (rawUser) {
      return {
        ...rawUser,
        role: resolveUserRole(rawUser),
      };
    }
  } catch {
    // Fallback sang Dev Mode Session nếu đang dùng Dev Role Switcher hoặc BE offline
  }

  try {
    const devSession = await devGetSessionInfoAction();
    if (devSession.isLoggedIn && devSession.role !== "guest") {
      return {
        id: `dev-${devSession.role}`,
        email: devSession.email ?? "",
        fullName: devSession.fullName ?? "Dev User",
        role: devSession.role,
        expertType: devSession.expertType,
        employmentType: devSession.employmentType,
      };
    }
  } catch {
    // Ignore fallback error
  }

  return null;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user = null, isLoading } = useQuery({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: fetchCurrentUser,
    refetchOnMount: "always",
  });

  const logout = async () => {
    queryClient.setQueryData(QUERY_KEYS.auth.me, null);
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.all });
    await logoutAction();
  };

  const role: Role | null = user ? resolveUserRole(user) : null;

  return {
    user,
    role,
    isAdmin: role === ROLES.ADMIN,
    checkRole: (allowedRoles: readonly Role[]) => hasRole(user, allowedRoles),
    isLoading,
    isAuthenticated: Boolean(user),
    logout,
  };
}
