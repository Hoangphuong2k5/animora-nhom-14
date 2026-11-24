export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  USER: "user",
  EXPERT: "expert",
  SUPPLIER: "supplier",
  RECEPTIONIST: "receptionist",
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
    prefix: "/manager",
    allowedRoles: [ROLES.MANAGER],
  },
  {
    prefix: "/expert",
    allowedRoles: [ROLES.EXPERT],
  },
  {
    prefix: "/supplier",
    allowedRoles: [ROLES.SUPPLIER],
  },
  {
    prefix: "/receptionist",
    allowedRoles: [ROLES.RECEPTIONIST],
  },
  {
    prefix: "/profile",
    allowedRoles: [ROLES.USER],
  },
  {
    prefix: "/cart",
    allowedRoles: [ROLES.USER],
  },
  {
    prefix: "/gio-hang",
    allowedRoles: [ROLES.USER],
  },
  {
    prefix: "/thanh-toan",
    allowedRoles: [ROLES.USER],
  },
  {
    prefix: "/orders",
    allowedRoles: [ROLES.USER],
  },
  {
    prefix: "/don-hang",
    allowedRoles: [ROLES.USER],
  },
  {
    prefix: "/accounts",
    allowedRoles: [ROLES.USER],
  },
];

// Lớp phân quyền thứ 2 trong Expert Portal: route chỉ dành cho Bác sĩ thú y (theo bảng phân quyền Mục 2 v1.4)
export const EXPERT_TYPE_PROTECTED_ROUTES: readonly ExpertTypeRouteRule[] = [
  {
    prefix: "/expert/health-records",
    allowedTypes: [EXPERT_TYPES.VET],
  },
  {
    prefix: "/expert/prescriptions",
    allowedTypes: [EXPERT_TYPES.VET],
  },
  {
    prefix: "/expert/medicine-box",
    allowedTypes: [EXPERT_TYPES.VET],
  },
];

// Đường dẫn điều hướng mặc định sau khi đăng nhập ứng với từng Role
export const DEFAULT_REDIRECT_BY_ROLE: Record<Role, string> = {
  [ROLES.ADMIN]: "/admin",
  [ROLES.MANAGER]: "/manager",
  [ROLES.USER]: "/",
  [ROLES.EXPERT]: "/expert",
  [ROLES.SUPPLIER]: "/supplier",
  [ROLES.RECEPTIONIST]: "/receptionist",
};
