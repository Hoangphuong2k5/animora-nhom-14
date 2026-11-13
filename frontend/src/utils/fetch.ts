import "server-only";
import { cookies, headers } from "next/headers";
import { CONFIG, COOKIE_KEYS } from "@/constants/config.constant";

/**
 * Hàm fetch chuyên dụng cho Server Components & Server Services.
 * Tự động đính kèm Bearer Token từ Request Header (nếu vừa refresh tại proxy.ts) hoặc từ HttpOnly Cookie.
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

  if (accessToken && !requestHeaders.has("Authorization")) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  return fetch(url, {
    ...options,
    headers: requestHeaders,
  });
}
