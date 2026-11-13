"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { loginAction, devQuickLoginAction } from "@/actions/auth.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ROUTES } from "@/constants/config.constant";
import { QUERY_KEYS } from "@/constants/query-keys.constant";
import type { ActionState } from "@/types/auth.type";

const initialState: ActionState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const lastStateRef = useRef<ActionState>(state);

  useEffect(() => {
    if (lastStateRef.current === state) return;
    lastStateRef.current = state;

    if (state.message) {
      if (state.success) {
        toast.success(state.message);
      } else {
        toast.error(state.message);
      }
    }

    if (state.success) {
      // Làm mới ngay cache thông tin User & Giỏ hàng phía Client sau khi đăng nhập
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.all });
      const targetUrl =
        searchParams.get("continue") || state.redirectTo || ROUTES.HOME;
      router.push(targetUrl);
      router.refresh();
    }
  }, [queryClient, router, searchParams, state]);

  const handleQuickLogin = async (role: "admin" | "user") => {
    try {
      const res = await devQuickLoginAction(role);
      if (res.success) {
        toast.success(res.message);
        try {
          const devUser = {
            id: role === "admin" ? "admin-root" : "user-demo",
            fullName:
              role === "admin"
                ? "Animora Administrator"
                : "Animora User",
            email: role === "admin" ? "admin@animora.vn" : "user@animora.vn",
            role: role === "admin" ? "admin" : "owner",
            createdAt: "2026-01-01",
            addresses: [],
          };
          localStorage.setItem("animora_current_user", JSON.stringify(devUser));
          window.dispatchEvent(new Event("animora_user_sync"));
        } catch {
          // ignore
        }
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.all });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.all });
        const targetUrl =
          searchParams.get("continue") || res.redirectTo || ROUTES.HOME;
        router.push(targetUrl);
        router.refresh();
      }
    } catch {
      toast.error("Lỗi khi đăng nhập bằng tài khoản test.");
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Đăng nhập tài khoản</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Nhập thông tin tài khoản của bạn để tiếp tục
      </p>

      <form
        action={formAction}
        ref={(form) => {
          return () => form?.reset();
        }}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium">
            Địa chỉ Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
          />
          {state.errors?.email && (
            <p className="text-xs text-red-500">{state.errors.email}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium">
            Mật khẩu
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
          />
          {state.errors?.password && (
            <p className="text-xs text-red-500">{state.errors.password}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={pending}
          className="w-full cursor-pointer gap-2"
        >
          {pending && <Spinner className="w-4 h-4" />}
          <span>{pending ? "Đang xác thực..." : "Đăng nhập"}</span>
        </Button>
      </form>

      {/* Quick Test Accounts for Dev / Reviewers */}
      <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span className="font-semibold">Tài khoản thử nghiệm nhanh:</span>
          <span className="text-[11px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full font-mono">Dev Mode</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin("admin")}
            className="px-3 py-2 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/80 dark:bg-red-950/40 hover:bg-red-100 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs"
          >
            <span>⚡ Quick Admin</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin("user")}
            className="px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs"
          >
            <span>👤 Quick User</span>
          </button>
        </div>
        <p className="text-[11px] text-zinc-400 text-center">
          Admin: admin@animora.vn | User: user@animora.vn
        </p>
      </div>
    </div>
  );
}
