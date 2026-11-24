import "server-only";
import { cookies } from "next/headers";
import { CONFIG, COOKIE_KEYS } from "@/constants/config.constant";
import { EXPERT_TYPES, ROLES } from "@/constants/roles.constant";
import type { AuthTokens, LoginPayload, User } from "@/types/auth.type";
import { fetchWrapper } from "@/utils/fetch";
import { resolveUserRole } from "@/utils/rbac";

const resolveDevCredential = (tag: string): string =>
  process.env.DEV_MOCK_CREDENTIAL || `${tag}123`;

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
    password: resolveDevCredential("admin"),
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
    email: "manager@animora.vn",
    password: resolveDevCredential("manager"),
    tokenPrefix: "mock-manager-token",
    refreshTag: "manager",
    user: {
      id: "manager-root",
      email: "manager@animora.vn",
      fullName: "Animora Manager",
      role: ROLES.MANAGER,
    },
  },
  {
    email: "vet@animora.vn",
    password: resolveDevCredential("vet"),
    tokenPrefix: "mock-expert-vet-token",
    refreshTag: "expert-vet",
    user: {
      id: "exp-vet-01",
      email: "vet@animora.vn",
      fullName: "BS. Lê Huy Hoàng",
      role: ROLES.EXPERT,
      expertType: EXPERT_TYPES.VET,
      employmentType: "full_time",
    },
  },
  {
    email: "vet.toan@animora.vn",
    password: resolveDevCredential("vet"),
    tokenPrefix: "mock-expert-vet-2-token",
    refreshTag: "expert-vet-2",
    user: {
      id: "exp-vet-02",
      email: "vet.toan@animora.vn",
      fullName: "BS. Ngô Phước Toàn",
      role: ROLES.EXPERT,
      expertType: EXPERT_TYPES.VET,
      employmentType: "full_time",
    },
  },
  {
    email: "vet.phuong@animora.vn",
    password: resolveDevCredential("vet"),
    tokenPrefix: "mock-expert-vet-3-token",
    refreshTag: "expert-vet-3",
    user: {
      id: "exp-vet-03",
      email: "vet.phuong@animora.vn",
      fullName: "BS. Nguyễn Thúc Hoàng Phương",
      role: ROLES.EXPERT,
      expertType: EXPERT_TYPES.VET,
      employmentType: "full_time",
    },
  },
  {
    email: "spa@animora.vn",
    password: resolveDevCredential("spa"),
    tokenPrefix: "mock-expert-spa-token",
    refreshTag: "expert-spa",
    user: {
      id: "exp-spa-01",
      email: "spa@animora.vn",
      fullName: "Phan Thị Đình Thùy",
      role: ROLES.EXPERT,
      expertType: EXPERT_TYPES.GROOMER,
      employmentType: "full_time",
    },
  },
  {
    email: "care2@animora.vn",
    password: resolveDevCredential("spa"),
    tokenPrefix: "mock-expert-spa-2-token",
    refreshTag: "expert-spa-2",
    user: {
      id: "exp-spa-02",
      email: "care2@animora.vn",
      fullName: "Nguyễn Văn Tuấn Anh",
      role: ROLES.EXPERT,
      expertType: EXPERT_TYPES.GROOMER,
      employmentType: "full_time",
    },
  },
  {
    email: "supplier@animora.vn",
    password: resolveDevCredential("supplier"),
    tokenPrefix: "mock-supplier-token",
    refreshTag: "supplier",
    user: {
      id: "sup-01",
      email: "supplier@animora.vn",
      fullName: "Công ty TNHH Royal Canin Việt Nam",
      role: ROLES.SUPPLIER,
    },
  },
  {
    email: "receptionist@animora.vn",
    password: resolveDevCredential("receptionist"),
    tokenPrefix: "mock-receptionist-token",
    refreshTag: "receptionist",
    user: {
      id: "rec-01",
      email: "receptionist@animora.vn",
      fullName: "LT. Trần Ngọc Bảo Trâm",
      role: ROLES.RECEPTIONIST,
      employmentType: "full_time",
    },
  },
  {
    email: "user@animora.vn",
    password: resolveDevCredential("user"),
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

function extractAuthCookies(response: Response): Partial<AuthTokens> {
  const tokens: Partial<AuthTokens> = {};
  const headersWithGetSetCookie = response.headers as Headers & {
    getSetCookie?: () => string[];
  };

  let setCookieList: string[] = [];
  if (typeof headersWithGetSetCookie.getSetCookie === "function") {
    setCookieList = headersWithGetSetCookie.getSetCookie();
  } else {
    const rawHeader = response.headers.get("set-cookie");
    if (rawHeader) {
      setCookieList = rawHeader.split(/,\s*(?=[^;,]+=)/);
    }
  }

  for (const entry of setCookieList) {
    const firstPart = entry.split(";")[0]?.trim() || "";
    const eqIndex = firstPart.indexOf("=");
    if (eqIndex <= 0) continue;
    const name = firstPart.slice(0, eqIndex).trim();
    const value = decodeURIComponent(firstPart.slice(eqIndex + 1).trim());
    if (name === COOKIE_KEYS.ACCESS_TOKEN || name === "accessToken") {
      tokens.accessToken = value;
    } else if (name === COOKIE_KEYS.REFRESH_TOKEN || name === "refreshToken") {
      tokens.refreshToken = value;
    }
  }
  return tokens;
}

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
    const cookieTokens = extractAuthCookies(response);
    const json = await response.json().catch(() => null);
    const rawUser: User | undefined = json?.data ?? json?.user ?? undefined;
    const accessToken = cookieTokens.accessToken ?? json?.accessToken;
    const refreshToken = cookieTokens.refreshToken ?? json?.refreshToken;

    if (!accessToken) return null;
    return {
      accessToken,
      refreshToken,
      user: rawUser
        ? { ...rawUser, role: resolveUserRole(rawUser) }
        : undefined,
    };
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
    const response = await fetch(`${CONFIG.API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${COOKIE_KEYS.REFRESH_TOKEN}=${refreshToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) return null;
    const cookieTokens = extractAuthCookies(response);
    const json = await response.json().catch(() => null);
    const accessToken = cookieTokens.accessToken ?? json?.accessToken;
    if (!accessToken) return null;

    return {
      accessToken,
      refreshToken:
        cookieTokens.refreshToken ?? json?.refreshToken ?? refreshToken,
    };
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

  if (!token) return null;

  // Nhận diện tài khoản Dev Mode
  const devAccount = DEV_ACCOUNTS.find((acc) =>
    token.startsWith(acc.tokenPrefix)
  );
  if (devAccount) {
    return { ...devAccount.user };
  }

  try {
    const response = await fetchWrapper("/auth/me", {
      cache: "no-store",
      headers: overrideToken
        ? {
            Cookie: `${COOKIE_KEYS.ACCESS_TOKEN}=${overrideToken}`,
            Authorization: `Bearer ${overrideToken}`,
          }
        : undefined,
    });

    if (!response.ok) return null;
    const json = await response.json();
    const rawUser: User | null =
      json?.data ?? json?.user ?? (json?.id || json?.email ? json : null);
    if (!rawUser) return null;

    return {
      ...rawUser,
      role: resolveUserRole(rawUser),
    };
  } catch {
    return null;
  }
}
