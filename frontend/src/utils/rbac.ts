import {
  EXPERT_TYPE_PROTECTED_ROUTES,
  EXPERT_TYPES,
  ROLE_PROTECTED_ROUTES,
  ROLES,
  type ExpertTypeRouteRule,
  type Role,
  type RoutePermissionRule,
} from "@/constants/roles.constant";
import type { User } from "@/types/auth.type";

/**
 * Xác định Role chuẩn của người dùng:
 * 1. Ưu tiên trường `user.role` do Backend API trả về ("admin" | "user"...).
 * 2. Hỗ trợ thêm biến `NEXT_PUBLIC_ADMIN_EMAILS` (danh sách email cách nhau bởi dấu phẩy)
 *    để dễ dàng test quyền Admin ngay trên các API demo chưa trả trường `role`.
 * 3. Mặc định an toàn là `ROLES.USER` ("user").
 */
export function resolveUserRole(user: User | null | undefined): Role {
  if (!user) return ROLES.USER;

  const validRoles = Object.values(ROLES) as string[];
  if (user.role && validRoles.includes(user.role)) {
    return user.role;
  }

  const adminEmailsRaw = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
  if (adminEmailsRaw && user.email) {
    const adminEmails = adminEmailsRaw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);

    if (adminEmails.includes(user.email.toLowerCase())) {
      return ROLES.ADMIN;
    }
  }

  return ROLES.USER;
}

/**
 * Kiểm tra người dùng có thuộc danh sách các Role được phép hay không.
 */
export function hasRole(
  user: User | null | undefined,
  allowedRoles: readonly Role[]
): boolean {
  if (!user) return false;
  if (allowedRoles.length === 0) return true;
  const userRole = resolveUserRole(user);
  return allowedRoles.includes(userRole);
}

/**
 * Người dùng có phải Bác sĩ thú y (expert + expertType "vet") hay không.
 */
export function isVetUser(user: User | null | undefined): boolean {
  return (
    !!user &&
    resolveUserRole(user) === ROLES.EXPERT &&
    user.expertType === EXPERT_TYPES.VET
  );
}

/**
 * Tìm quy tắc giới hạn theo loại chuyên viên (ví dụ `/expert/prescriptions` chỉ dành cho bác sĩ).
 */
export function findExpertTypeRouteRule(
  pathname: string
): ExpertTypeRouteRule | undefined {
  return EXPERT_TYPE_PROTECTED_ROUTES.find(
    (rule) =>
      pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)
  );
}

/**
 * Tìm quy tắc phân quyền khớp với đường dẫn hiện tại (khớp chính xác hoặc theo prefix `/admin/...`).
 */
export function findMatchedRouteRule(
  pathname: string
): RoutePermissionRule | undefined {
  return ROLE_PROTECTED_ROUTES.find(
    (rule) =>
      pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)
  );
}

