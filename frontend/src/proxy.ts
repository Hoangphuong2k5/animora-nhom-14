import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_KEYS, ROUTES } from "@/constants/config.constant";
import { DEFAULT_REDIRECT_BY_ROLE, ROLES } from "@/constants/roles.constant";
import { getCurrentUser, requestRefreshToken } from "@/services/auth.service";
import {
  findExpertTypeRouteRule,
  findMatchedRouteRule,
  hasRole,
  resolveUserRole,
} from "@/utils/rbac";
import type { User } from "@/types/auth.type";

// Lớp 3 (Expert Type): route chỉ dành cho một số loại chuyên viên (vd: /expert/prescriptions chỉ cho bác sĩ thú y)
function isExpertTypeDenied(pathname: string, user: User | null): boolean {
  const typeRule = findExpertTypeRouteRule(pathname);
  if (!typeRule) return false;
  return !user?.expertType || !typeRule.allowedTypes.includes(user.expertType);
}

function expertTypeDeniedUrl(request: NextRequest): URL {
  const url = new URL("/expert", request.nextUrl.origin);
  const deniedKey = request.nextUrl.pathname.startsWith("/expert/medicine-box")
    ? "medicine-box"
    : request.nextUrl.pathname.startsWith("/expert/health-records")
    ? "health-records"
    : "rx";
  url.searchParams.set("denied", deniedKey);
  return url;
}

// Danh sách URL chỉ dành cho khách chưa đăng nhập
const GUEST_ROUTES = ["/dang-nhap", "/dang-ky", "/login", "/register"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const matchedRule = findMatchedRouteRule(pathname);
  const isProtected = Boolean(matchedRule);
  const isGuestOnly = GUEST_ROUTES.includes(pathname);

  const accessToken = request.cookies.get(COOKIE_KEYS.ACCESS_TOKEN)?.value;

  // Các trang Public / giao diện khách hàng:
  // - Guest (không có accessToken) -> đi tiếp ngay, không gọi API
  // - Đã đăng nhập với role nội bộ (admin, manager, expert) -> chuyển hướng về portal riêng của role đó
  if (!isProtected && !isGuestOnly) {
    if (
      pathname === ROUTES.FORBIDDEN ||
      pathname.startsWith(`${ROUTES.FORBIDDEN}/`) ||
      !accessToken
    ) {
      return NextResponse.next();
    }

    const publicUser = await getCurrentUser(accessToken);
    if (publicUser) {
      const role = resolveUserRole(publicUser);
      const isReceptionistBookingOnCustomerUi =
        role === ROLES.RECEPTIONIST &&
        (pathname === "/dat-lich" || pathname.startsWith("/dat-lich/"));
      if (role !== ROLES.USER && !isReceptionistBookingOnCustomerUi) {
        return NextResponse.redirect(
          new URL(
            DEFAULT_REDIRECT_BY_ROLE[role] || ROUTES.HOME,
            request.nextUrl.origin
          )
        );
      }
    }

    return NextResponse.next();
  }

  let user = await getCurrentUser(accessToken);

  // Lớp 1 (Authentication): Chưa xác thực được user -> Thử Silent Refresh Token nếu đi vào vùng bảo vệ
  if (!user) {
    if (isProtected && matchedRule) {
      const refreshToken = request.cookies.get(COOKIE_KEYS.REFRESH_TOKEN)?.value;
      const newTokens = await requestRefreshToken(refreshToken);

      // Refresh thất bại -> Xóa sạch cookie cũ và đá về Login kèm vết đường dẫn ?continue=
      if (!newTokens?.accessToken) {
        const loginUrl = new URL(ROUTES.LOGIN, request.nextUrl.origin);
        loginUrl.searchParams.set("continue", pathname);

        const redirectRes = NextResponse.redirect(loginUrl);
        redirectRes.cookies.delete(COOKIE_KEYS.ACCESS_TOKEN);
        redirectRes.cookies.delete(COOKIE_KEYS.REFRESH_TOKEN);
        return redirectRes;
      }

      // Refresh thành công -> Kiểm tra tiếp quyền RBAC của user với token mới!
      user = await getCurrentUser(newTokens.accessToken);
      if (!user || !hasRole(user, matchedRule.allowedRoles)) {
        const forbiddenRes = NextResponse.redirect(
          new URL(ROUTES.FORBIDDEN, request.nextUrl.origin)
        );
        forbiddenRes.cookies.set(
          COOKIE_KEYS.ACCESS_TOKEN,
          newTokens.accessToken,
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60,
          }
        );
        if (newTokens.refreshToken) {
          forbiddenRes.cookies.set(
            COOKIE_KEYS.REFRESH_TOKEN,
            newTokens.refreshToken,
            {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
              maxAge: 60 * 60 * 24 * 7,
            }
          );
        }
        return forbiddenRes;
      }

      // Đủ quyền -> Gắn x-token vào Request Header để Server Component bên dưới đọc được ngay!
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-token", newTokens.accessToken);

      const response = isExpertTypeDenied(pathname, user)
        ? NextResponse.redirect(expertTypeDeniedUrl(request))
        : NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });

      response.cookies.set(COOKIE_KEYS.ACCESS_TOKEN, newTokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60,
      });

      if (newTokens.refreshToken) {
        response.cookies.set(
          COOKIE_KEYS.REFRESH_TOKEN,
          newTokens.refreshToken,
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
          }
        );
      }

      return response;
    }

    return NextResponse.next();
  }

  // Trường hợp vào trang Guest (/login, /register) khi đã đăng nhập -> Đẩy về trang mặc định theo Role (/admin hoặc /)
  if (isGuestOnly) {
    const role = resolveUserRole(user);
    const targetPath = DEFAULT_REDIRECT_BY_ROLE[role] || ROUTES.HOME;
    return NextResponse.redirect(new URL(targetPath, request.nextUrl.origin));
  }

  // Lớp 2 (Authorization / RBAC): Đã đăng nhập nhưng Role không nằm trong danh sách cho phép
  if (matchedRule && !hasRole(user, matchedRule.allowedRoles)) {
    const isUserOnlyRoute =
      matchedRule.allowedRoles.length === 1 &&
      matchedRule.allowedRoles[0] === ROLES.USER;
    const role = resolveUserRole(user);
    const redirectTarget =
      isUserOnlyRoute && role !== ROLES.USER
        ? DEFAULT_REDIRECT_BY_ROLE[role] || ROUTES.FORBIDDEN
        : ROUTES.FORBIDDEN;

    return NextResponse.redirect(
      new URL(redirectTarget, request.nextUrl.origin)
    );
  }

  // Lớp 3 (Expert Type): Chuyên viên không phải bác sĩ thú y truy cập trang kê đơn -> quay về Tổng quan kèm cảnh báo
  if (isExpertTypeDenied(pathname, user)) {
    return NextResponse.redirect(expertTypeDeniedUrl(request));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Chạy qua tất cả đường dẫn ngoại trừ api, static files và ảnh tĩnh
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
