export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  EXPERT: "expert",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Loại chuyên viên (expert_type). Chỉ áp dụng khi role === "expert".
export const EXPERT_TYPES = {
  VET: "vet",
  GROOMER: "groomer",
  TRAINER: "trainer",
} as const;

export type ExpertType = (typeof EXPERT_TYPES)[keyof typeof EXPERT_TYPES];

export interface RoutePermissionRule {
  prefix: string;
  allowedRoles: readonly Role[];
}

export interface ExpertTypeRouteRule {
  prefix: string;
  allowedTypes: readonly ExpertType[];
}

// Ma trận phân quyền tập trung (Single Source of Truth)
// Khi mở rộng thêm role mới (ví dụ: "manager", "seller"), chỉ cần thêm vào ROLES và bảng dưới đây!
export const ROLE_PROTECTED_ROUTES: readonly RoutePermissionRule[] = [
  {
    prefix: "/admin",
    allowedRoles: [ROLES.ADMIN],
  },
  {
    prefix: "/expert",
    allowedRoles: [ROLES.EXPERT],
  },
  {
    prefix: "/profile",
    allowedRoles: [ROLES.USER, ROLES.ADMIN],
  },
  {
    prefix: "/cart",
    allowedRoles: [ROLES.USER, ROLES.ADMIN],
  },
  {
    prefix: "/orders",
    allowedRoles: [ROLES.USER, ROLES.ADMIN],
  },
  {
    prefix: "/accounts",
    allowedRoles: [ROLES.USER, ROLES.ADMIN],
  },
];

// Lớp phân quyền thứ 2 trong Expert Portal: route chỉ dành cho một số loại chuyên viên
export const EXPERT_TYPE_PROTECTED_ROUTES: readonly ExpertTypeRouteRule[] = [
  {
    prefix: "/expert/prescriptions",
    allowedTypes: [EXPERT_TYPES.VET],
  },
];

// Đường dẫn điều hướng mặc định sau khi đăng nhập ứng với từng Role
export const DEFAULT_REDIRECT_BY_ROLE: Record<Role, string> = {
  [ROLES.ADMIN]: "/admin",
  [ROLES.USER]: "/",
  [ROLES.EXPERT]: "/expert",
};
