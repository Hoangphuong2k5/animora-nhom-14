import "server-only";
import { cookies, headers } from "next/headers";
import { CONFIG, COOKIE_KEYS } from "@/constants/config.constant";

/**
 * Hàm fetch chuyên dụng cho Server Components & Server Services.
 * Tự động đính kèm HttpOnly Cookie (accessToken, refreshToken) và Bearer Token
 * để tương thích 100% với auth.middleware.js của Backend Express.
 */
export async function fetchWrapper(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${CONFIG.API_BASE_URL}${endpoint}`;

  const requestHeaders = new Headers(options.headers || {});

  // Đọc token mới nhất từ header nội bộ x-token (do proxy.ts truyền sang) hoặc từ cookie
  const incomingHeaders = await headers();
  const cookieStore = await cookies();
  const accessToken =
    incomingHeaders.get("x-token") ||
    cookieStore.get(COOKIE_KEYS.ACCESS_TOKEN)?.value;
  const refreshToken = cookieStore.get(COOKIE_KEYS.REFRESH_TOKEN)?.value;

  if (accessToken && !requestHeaders.has("Authorization")) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  // Backend Express authMiddleware đọc trực tiếp req.cookies?.accessToken
  if (!requestHeaders.has("Cookie")) {
    const cookieParts: string[] = [];
    if (accessToken) {
      cookieParts.push(`${COOKIE_KEYS.ACCESS_TOKEN}=${accessToken}`);
    }
    if (refreshToken) {
      cookieParts.push(`${COOKIE_KEYS.REFRESH_TOKEN}=${refreshToken}`);
    }
    if (cookieParts.length > 0) {
      requestHeaders.set("Cookie", cookieParts.join("; "));
    }
  }

  return fetch(url, {
    ...options,
    headers: requestHeaders,
  });
}
