"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { logoutAction } from "@/actions/auth.action";
import { QUERY_KEYS } from "@/constants/query-keys.constant";
import { ROLES, type Role } from "@/constants/roles.constant";
import { axiosInstance } from "@/lib/axios";
import type { User } from "@/types/auth.type";
import { hasRole, resolveUserRole } from "@/utils/rbac";

async function fetchCurrentUser(): Promise<User | null> {
  try {
    const response = await axiosInstance.get("/profile/me");
    const rawUser: User | null =
      response.data?.user ?? response.data ?? null;
    if (!rawUser) return null;

    return {
      ...rawUser,
      role: resolveUserRole(rawUser),
    };
  } catch {
    return null;
  }
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
