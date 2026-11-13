import type { ExpertType, Role } from "@/constants/roles.constant";

export interface User {
  id: string | number;
  email: string;
  fullName: string;
  avatar?: string;
  role?: Role;
  /** Chỉ có khi role === "expert" (tương ứng cột expert_type phía backend) */
  expertType?: ExpertType;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ActionState<T = unknown> {
  success?: boolean;
  message?: string;
  redirectTo?: string;
  errors?: Record<string, string>;
  data?: T;
}
