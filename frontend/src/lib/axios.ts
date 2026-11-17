import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { devGetSessionInfoAction, devLogoutAction } from "@/actions/auth.action";
import { CONFIG, ROUTES } from "@/constants/config.constant";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const AXIOS_BASE_CONFIG = {
  baseURL: CONFIG.PUBLIC_API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
} as const;

export const axiosInstance = axios.create(AXIOS_BASE_CONFIG);

// Instance thuần không interceptor để gọi /auth/refresh-token và /auth/logout, tránh vòng lặp vô tận
const authControlAxios = axios.create(AXIOS_BASE_CONFIG);

let refreshTokenPromise: Promise<void> | null = null;
let logoutRedirectPromise: Promise<void> | null = null;

function isExcludedFromAutoRedirect(config?: InternalAxiosRequestConfig): boolean {
  const url = config?.url ?? "";
  return (
    url.includes("/auth/me") ||
    url.includes("/profile/me") ||
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/logout") ||
    url.includes("/auth/refresh-token") ||
    url.includes("/auth/refresh") ||
    (url.includes("/shopping-cart") && config?.method?.toLowerCase() === "get")
  );
}

async function handleUnauthorizedRedirect(
  config?: InternalAxiosRequestConfig
): Promise<void> {
  if (typeof window === "undefined" || isExcludedFromAutoRedirect(config)) {
    return;
  }

  if (!logoutRedirectPromise) {
    logoutRedirectPromise = (async () => {
      try {
        const devSession = await devGetSessionInfoAction();
        // Bảo toàn phiên Dev Mode Role Switcher (cookie giả lập không hợp lệ với Backend thật)
        if (devSession.isLoggedIn && devSession.role !== "guest") {
          return;
        }
      } catch {
        // Bỏ qua nếu kiểm tra Dev Mode lỗi
      }

      await Promise.allSettled([
        authControlAxios.post("/auth/logout"),
        devLogoutAction(),
      ]);

      if (window.location.pathname !== ROUTES.LOGIN) {
        window.location.href = `${ROUTES.LOGIN}?continue=${encodeURIComponent(
          window.location.pathname
        )}`;
      }
    })().finally(() => {
      logoutRedirectPromise = null;
    });
  }

  return logoutRedirectPromise;
}

// 100% Thuần HttpOnly Cookie: trình duyệt tự đính kèm cookie qua withCredentials: true
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;

    // 1. 401 UNAUTHORIZED: Không gọi refresh token thừa; xử lý logout/redirect nếu cần
    if (status === 401) {
      await handleUnauthorizedRedirect(originalRequest);
      return Promise.reject(error);
    }

    // 2. 410 GONE: Access Token hết hạn -> Singleton Promise Lock refresh token -> Retry 1 lần
    const isRefreshEndpoint =
      originalRequest?.url?.includes("/auth/refresh-token") ||
      originalRequest?.url?.includes("/auth/refresh");

    if (
      status === 410 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshEndpoint
    ) {
      originalRequest._retry = true;

      if (!refreshTokenPromise) {
        refreshTokenPromise = authControlAxios
          .post("/auth/refresh-token")
          .then(() => undefined)
          .finally(() => {
            refreshTokenPromise = null;
          });
      }

      try {
        await refreshTokenPromise;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        await handleUnauthorizedRedirect(originalRequest);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
