import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getAccessToken, makeRefreshToken } from "@/actions/auth.action";
import { CONFIG, ROUTES } from "@/constants/config.constant";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const axiosInstance = axios.create({
  baseURL: CONFIG.PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Request Interceptor: Lấy Access Token từ HttpOnly Cookie thông qua Server Action
axiosInstance.interceptors.request.use(async (config) => {
  const accessToken = await getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// 2. Singleton Promise Lock ngăn gọi trùng API Refresh Token khi nhiều request nổ 401 cùng lúc
let refreshTokenPromise: Promise<boolean> | null = null;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (!refreshTokenPromise) {
        refreshTokenPromise = makeRefreshToken().finally(() => {
          refreshTokenPromise = null;
        });
      }

      const isRefreshed = await refreshTokenPromise;
      if (isRefreshed) {
        return axiosInstance(originalRequest);
      }

      // Refresh thất bại -> chuyển hướng về Login (trừ các endpoint kiểm tra ngầm trên Header)
      if (typeof window !== "undefined") {
        const isSilentCheck =
          originalRequest.url === "/profile/me" ||
          (originalRequest.url === "/shopping-cart" &&
            originalRequest.method === "get");

        if (!isSilentCheck && window.location.pathname !== ROUTES.LOGIN) {
          window.location.href = `${ROUTES.LOGIN}?continue=${encodeURIComponent(
            window.location.pathname
          )}`;
        }
      }
    }

    return Promise.reject(error);
  }
);
