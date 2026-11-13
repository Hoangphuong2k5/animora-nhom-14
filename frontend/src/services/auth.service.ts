import "server-only";
import { cookies } from "next/headers";
import { CONFIG, COOKIE_KEYS } from "@/constants/config.constant";
import { EXPERT_TYPES, ROLES } from "@/constants/roles.constant";
import type { AuthTokens, LoginPayload, User } from "@/types/auth.type";
import { fetchWrapper } from "@/utils/fetch";
import { resolveUserRole } from "@/utils/rbac";

/**
 * Tài khoản Dev Mode dùng khi test offline / chuyển vai trò nhanh.
 * `tokenPrefix` quyết định token giả lập được nhận diện lại ở getCurrentUser().
 */
const DEV_ACCOUNTS: ReadonlyArray<{
  email: string;
  password: string;
  tokenPrefix: string;
  refreshTag: string;
  user: User;
}> = [
  {
    email: "admin@animora.vn",
    password: "admin123",
    tokenPrefix: "mock-admin-token",
    refreshTag: "admin",
    user: {
      id: "admin-root",
      email: "admin@animora.vn",
      fullName: "Animora Administrator",
      role: ROLES.ADMIN,
    },
  },
  {
    email: "vet@animora.vn",
    password: "vet123",
    tokenPrefix: "mock-expert-vet-token",
    refreshTag: "expert-vet",
    user: {
      id: "exp-vet-01",
      email: "vet@animora.vn",
      fullName: "BS. Lê Minh Khoa",
      role: ROLES.EXPERT,
      expertType: EXPERT_TYPES.VET,
    },
  },
  {
    email: "spa@animora.vn",
    password: "spa123",
    tokenPrefix: "mock-expert-spa-token",
    refreshTag: "expert-spa",
    user: {
      id: "exp-spa-01",
      email: "spa@animora.vn",
      fullName: "Nguyễn Thu Hà",
      role: ROLES.EXPERT,
      expertType: EXPERT_TYPES.GROOMER,
    },
  },
  {
    email: "user@animora.vn",
    password: "user123",
    tokenPrefix: "mock-user-token",
    refreshTag: "user",
    user: {
      id: "user-demo",
      email: "user@animora.vn",
      fullName: "Animora User",
      role: ROLES.USER,
    },
  },
];

export async function loginService(
  payload: LoginPayload
): Promise<(AuthTokens & { user?: User }) | null> {
  // Hỗ trợ Dev Mode Accounts khi test offline hoặc chuyển vai trò nhanh
  const devAccount = DEV_ACCOUNTS.find(
    (acc) => acc.email === payload.email && acc.password === payload.password
  );
  if (devAccount) {
    return {
      accessToken: `${devAccount.tokenPrefix}-${Date.now()}`,
      refreshToken: `mock-refresh-token-${devAccount.refreshTag}-${Date.now()}`,
      user: devAccount.user,
    };
  }

  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function requestRefreshToken(
  refreshToken?: string
): Promise<AuthTokens | null> {
  if (!refreshToken) return null;

  if (refreshToken.startsWith("mock-refresh-token")) {
    // Giữ nguyên vai trò (và loại chuyên viên) khi làm mới token giả lập
    const account =
      DEV_ACCOUNTS.find((acc) =>
        refreshToken.startsWith(`mock-refresh-token-${acc.refreshTag}-`)
      ) ??
      (refreshToken.includes("admin")
        ? DEV_ACCOUNTS.find((acc) => acc.refreshTag === "admin")
        : DEV_ACCOUNTS.find((acc) => acc.refreshTag === "user"));

    return {
      accessToken: `${account?.tokenPrefix ?? "mock-user-token"}-${Date.now()}`,
      refreshToken: refreshToken,
    };
  }

  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function getCurrentUser(
  overrideToken?: string
): Promise<User | null> {
  let token = overrideToken;
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(COOKIE_KEYS.ACCESS_TOKEN)?.value;
    } catch {
      // In middleware or proxy context if cookies() is unavailable
    }
  }

  // Nhận diện tài khoản Dev Mode
  const devAccount = token
    ? DEV_ACCOUNTS.find((acc) => token.startsWith(acc.tokenPrefix))
    : undefined;
  if (devAccount) {
    return { ...devAccount.user };
  }

  try {
    const response = await fetchWrapper("/profile/me", {
      cache: "no-store",
      headers: overrideToken
        ? { Authorization: `Bearer ${overrideToken}` }
        : undefined,
    });

    if (!response.ok) return null;
    const data = await response.json();
    const rawUser: User | null = data.user ?? data ?? null;
    if (!rawUser) return null;

    return {
      ...rawUser,
      role: resolveUserRole(rawUser),
    };
  } catch {
    return null;
  }
}
