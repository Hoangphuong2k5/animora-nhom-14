"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { COOKIE_KEYS, ROUTES } from "@/constants/config.constant";
import {
  DEFAULT_REDIRECT_BY_ROLE,
  type ExpertType,
} from "@/constants/roles.constant";
import {
  getCurrentUser,
  loginService,
  requestRefreshToken,
} from "@/services/auth.service";
import type { ActionState } from "@/types/auth.type";
import { fetchWrapper } from "@/utils/fetch";
import { resolveUserRole } from "@/utils/rbac";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập địa chỉ email")
    .pipe(z.email("Định dạng email không hợp lệ")),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export async function loginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawInput = {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };

  // 1. Validate dữ liệu bằng Zod
  const parsed = await loginSchema.safeParseAsync(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: "Vui lòng kiểm tra lại thông tin nhập",
      errors: Object.fromEntries(
        parsed.error.issues.map((issue) => [
          String(issue.path[0]),
          issue.message,
        ])
      ),
    };
  }

  // 2. Gọi API xác thực tới Backend
  const authData = await loginService(parsed.data);
  if (!authData?.accessToken) {
    return {
      success: false,
      message: "Email hoặc mật khẩu không chính xác",
    };
  }

  // 3. Ghi cặp Token vào HttpOnly Cookie an toàn chống XSS
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_KEYS.ACCESS_TOKEN, authData.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1 giờ
  });

  if (authData.refreshToken) {
    cookieStore.set(COOKIE_KEYS.REFRESH_TOKEN, authData.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 ngày
    });
  }

  // 4. Xác định trang điều hướng mặc định theo Role của người dùng
  const currentUser =
    authData.user ??
    (await getCurrentUser(authData.accessToken)) ?? {
      id: "",
      email: parsed.data.email,
      fullName: "",
    };
  const role = resolveUserRole(currentUser);

  return {
    success: true,
    message: "Đăng nhập thành công!",
    redirectTo: DEFAULT_REDIRECT_BY_ROLE[role],
  };
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();

  try {
    await fetchWrapper("/auth/logout", { method: "POST" });
  } catch {
    // Bỏ qua lỗi mạng nếu token đã hết hạn sẵn
  }

  cookieStore.set(COOKIE_KEYS.ACCESS_TOKEN, "", { path: "/", maxAge: 0 });
  cookieStore.set(COOKIE_KEYS.REFRESH_TOKEN, "", { path: "/", maxAge: 0 });
  cookieStore.delete({ name: COOKIE_KEYS.ACCESS_TOKEN, path: "/" });
  cookieStore.delete({ name: COOKIE_KEYS.REFRESH_TOKEN, path: "/" });
  revalidatePath("/", "layout");

  // QUAN TRỌNG: Đặt redirect() ngoài khối try/catch để không bắt nhầm NEXT_REDIRECT
  redirect(ROUTES.LOGIN);
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_KEYS.ACCESS_TOKEN)?.value;
}

export async function makeRefreshToken(): Promise<boolean> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(COOKIE_KEYS.REFRESH_TOKEN)?.value;
  if (!refreshToken) return false;

  const newTokens = await requestRefreshToken(refreshToken);
  if (!newTokens?.accessToken) {
    cookieStore.delete(COOKIE_KEYS.ACCESS_TOKEN);
    cookieStore.delete(COOKIE_KEYS.REFRESH_TOKEN);
    return false;
  }

  cookieStore.set(COOKIE_KEYS.ACCESS_TOKEN, newTokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  if (newTokens.refreshToken) {
    cookieStore.set(COOKIE_KEYS.REFRESH_TOKEN, newTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return true;
}

/**
 * Server Action phục vụ Dev Mode Role Switcher:
 * Tự động gán session HttpOnly Cookie chuẩn cho vai trò được chọn
 */
export type DevQuickRole =
  | "admin"
  | "manager"
  | "user"
  | "expert-vet"
  | "expert-vet-2"
  | "expert-vet-3"
  | "expert-spa"
  | "expert-spa-2"
  | "supplier"
  | "receptionist";

const DEV_QUICK_ROLE_CONFIG: Record<
  DevQuickRole,
  { tokenPrefix: string; refreshTag: string; redirectTo: string; message: string }
> = {
  admin: {
    tokenPrefix: "mock-admin-token",
    refreshTag: "admin",
    redirectTo: "/admin",
    message: "Đã đăng nhập vai trò Admin!",
  },
  manager: {
    tokenPrefix: "mock-manager-token",
    refreshTag: "manager",
    redirectTo: "/manager",
    message: "Đã đăng nhập vai trò Manager!",
  },
  user: {
    tokenPrefix: "mock-user-token",
    refreshTag: "user",
    redirectTo: "/",
    message: "Đã đăng nhập vai trò User!",
  },
  "expert-vet": {
    tokenPrefix: "mock-expert-vet-token",
    refreshTag: "expert-vet",
    redirectTo: "/expert",
    message: "Đã đăng nhập vai trò Bác sĩ thú y (BS. Lê Huy Hoàng)!",
  },
  "expert-vet-2": {
    tokenPrefix: "mock-expert-vet-2-token",
    refreshTag: "expert-vet-2",
    redirectTo: "/expert",
    message: "Đã đăng nhập vai trò Bác sĩ thú y (BS. Ngô Phước Toàn)!",
  },
  "expert-vet-3": {
    tokenPrefix: "mock-expert-vet-3-token",
    refreshTag: "expert-vet-3",
    redirectTo: "/expert",
    message: "Đã đăng nhập vai trò Bác sĩ thú y (BS. Hoàng Phương)!",
  },
  "expert-spa": {
    tokenPrefix: "mock-expert-spa-token",
    refreshTag: "expert-spa",
    redirectTo: "/expert",
    message: "Đã đăng nhập vai trò NV Chăm sóc (Phan Thị Đình Thùy)!",
  },
  "expert-spa-2": {
    tokenPrefix: "mock-expert-spa-2-token",
    refreshTag: "expert-spa-2",
    redirectTo: "/expert",
    message: "Đã đăng nhập vai trò NV Chăm sóc (Nguyễn Văn Tuấn Anh)!",
  },
  supplier: {
    tokenPrefix: "mock-supplier-token",
    refreshTag: "supplier",
    redirectTo: "/supplier",
    message: "Đã đăng nhập vai trò Nhà cung cấp (Supplier)!",
  },
  receptionist: {
    tokenPrefix: "mock-receptionist-token",
    refreshTag: "receptionist",
    redirectTo: "/receptionist",
    message: "Đã đăng nhập vai trò Lễ tân (LT. Trần Ngọc Bảo Trâm)!",
  },
};

export async function devQuickLoginAction(
  role: DevQuickRole
): Promise<{ success: boolean; redirectTo: string; message: string }> {
  const cookieStore = await cookies();
  const config = DEV_QUICK_ROLE_CONFIG[role] ?? DEV_QUICK_ROLE_CONFIG.user;
  const token = `${config.tokenPrefix}-${Date.now()}`;
  const refreshToken = `mock-refresh-token-${config.refreshTag}-${Date.now()}`;

  cookieStore.set(COOKIE_KEYS.ACCESS_TOKEN, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  cookieStore.set(COOKIE_KEYS.REFRESH_TOKEN, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return {
    success: true,
    redirectTo: config.redirectTo,
    message: config.message,
  };
}

/**
 * Server Action lấy trạng thái phiên làm việc hiện tại cho Dev Widget
 */
export async function devGetSessionInfoAction(): Promise<{
  isLoggedIn: boolean;
  id?: string | number;
  role: "admin" | "manager" | "user" | "expert" | "supplier" | "receptionist" | "guest";
  expertType?: ExpertType;
  employmentType?: "full_time";
  email?: string;
  fullName?: string;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_KEYS.ACCESS_TOKEN)?.value;
  if (!token) {
    return { isLoggedIn: false, role: "guest" };
  }
  const user = await getCurrentUser(token);
  if (!user) {
    return { isLoggedIn: false, role: "guest" };
  }
  return {
    isLoggedIn: true,
    id: user.id,
    role:
      user.role === "admin"
        ? "admin"
        : user.role === "manager"
        ? "manager"
        : user.role === "expert"
        ? "expert"
        : user.role === "supplier"
        ? "supplier"
        : user.role === "receptionist"
        ? "receptionist"
        : "user",
    expertType: user.expertType,
    employmentType: user.employmentType,
    email: user.email,
    fullName: user.fullName,
  };
}

/**
 * Server Action đăng xuất nhanh cho Dev Widget
 */
export async function devLogoutAction(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_KEYS.ACCESS_TOKEN, "", { path: "/", maxAge: 0 });
  cookieStore.set(COOKIE_KEYS.REFRESH_TOKEN, "", { path: "/", maxAge: 0 });
  cookieStore.delete({ name: COOKIE_KEYS.ACCESS_TOKEN, path: "/" });
  cookieStore.delete({ name: COOKIE_KEYS.REFRESH_TOKEN, path: "/" });
  revalidatePath("/", "layout");
  return { success: true };
}
