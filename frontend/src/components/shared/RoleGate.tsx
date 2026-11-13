"use client";

import type { Role } from "@/constants/roles.constant";
import { useAuth } from "@/hooks/useAuth";

interface RoleGateProps {
  allowedRoles: readonly Role[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Component bảo vệ phần tử giao diện (nút bấm, menu, thẻ thống kê...) theo Role trên Client.
 * Lưu ý: Bảo mật đường dẫn thực sự luôn nằm ở tầng Server (`src/proxy.ts`).
 */
export default function RoleGate({
  allowedRoles,
  fallback = null,
  children,
}: RoleGateProps) {
  const { isLoading, checkRole } = useAuth();

  if (isLoading) return null;
  if (!checkRole(allowedRoles)) return <>{fallback}</>;

  return <>{children}</>;
}

