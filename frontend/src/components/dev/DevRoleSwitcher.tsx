"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  User,
  LogOut,
  Wrench,
  X,
  ChevronUp,
  Check,
  Stethoscope,
  Scissors,
} from "lucide-react";
import {
  devQuickLoginAction,
  devGetSessionInfoAction,
  devLogoutAction,
  type DevQuickRole,
} from "@/actions/auth.action";
import { toast } from "sonner";

export function DevRoleSwitcher() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<{
    isLoggedIn: boolean;
    role: "admin" | "user" | "expert" | "guest";
    expertType?: string;
    email?: string;
    fullName?: string;
  }>({
    isLoggedIn: false,
    role: "guest",
  });

  const popoverRef = useRef<HTMLDivElement>(null);

  // Load session on mount & when popover opens
  useEffect(() => {
    setMounted(true);
    refreshSession();

    const handleSync = () => {
      try {
        const saved = localStorage.getItem("animora_current_user");
        if (!saved) {
          setSession({ isLoggedIn: false, role: "guest" });
          return;
        }
      } catch {
        // ignore
      }
      refreshSession();
    };

    window.addEventListener("animora_user_sync", handleSync);
    return () => {
      window.removeEventListener("animora_user_sync", handleSync);
    };
  }, []);

  const refreshSession = async () => {
    try {
      const res = await devGetSessionInfoAction();
      setSession(res);
    } catch {
      setSession({ isLoggedIn: false, role: "guest" });
    }
  };

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Don't render on production
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  if (!mounted) {
    return null;
  }

  const handleSwitchRole = async (targetRole: DevQuickRole) => {
    setLoading(true);
    try {
      const res = await devQuickLoginAction(targetRole);
      if (res.success) {
        toast.success(res.message);
        setIsOpen(false);
        try {
          const devUserMap: Record<
            DevQuickRole,
            { id: string; fullName: string; email: string; role: string }
          > = {
            admin: {
              id: "admin-root",
              fullName: "Animora Administrator",
              email: "admin@animora.vn",
              role: "admin",
            },
            user: {
              id: "user-demo",
              fullName: "Animora User",
              email: "user@animora.vn",
              role: "owner",
            },
            "expert-vet": {
              id: "exp-vet-01",
              fullName: "BS. Lê Minh Khoa",
              email: "vet@animora.vn",
              role: "vet",
            },
            "expert-spa": {
              id: "exp-spa-01",
              fullName: "Nguyễn Thu Hà",
              email: "spa@animora.vn",
              role: "owner",
            },
          };
          const devUser = {
            ...devUserMap[targetRole],
            createdAt: "2026-01-01",
            addresses: [],
          };
          localStorage.setItem(
            "animora_current_user",
            JSON.stringify(devUser)
          );
          window.dispatchEvent(new Event("animora_user_sync"));
        } catch {
          // ignore
        }
        await refreshSession();
        router.push(res.redirectTo);
        router.refresh();
      }
    } catch {
      toast.error("Có lỗi xảy ra khi đổi quyền.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await devLogoutAction();
      setSession({ isLoggedIn: false, role: "guest" });
      setIsOpen(false);
      try {
        localStorage.removeItem("animora_current_user");
        window.dispatchEvent(new Event("animora_user_sync"));
      } catch {
        // ignore
      }
      toast.info("Đã đăng xuất tài khoản!");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Lỗi khi đăng xuất.");
    } finally {
      setLoading(false);
    }
  };

  const roleBadgeConfig = {
    admin: {
      label: "Admin",
      pillClass: "bg-red-500 text-white",
      dotClass: "bg-red-400",
    },
    user: {
      label: "User",
      pillClass: "bg-emerald-600 text-white",
      dotClass: "bg-emerald-400",
    },
    expert: {
      label: session.expertType === "vet" ? "Bác sĩ" : "Chuyên viên",
      pillClass: "bg-[#6B1F2E] text-white",
      dotClass: "bg-[#FF7F6B]",
    },
    guest: {
      label: "Khách",
      pillClass: "bg-neutral-600 text-white",
      dotClass: "bg-neutral-400",
    },
  }[session.role];

  return (
    <div
      ref={popoverRef}
      className={`fixed bottom-5 right-5 ${isOpen ? "z-50" : "z-20"} flex flex-col items-end select-none font-sans`}
    >
      {/* Popover Menu (Expanded upwards) */}
      {isOpen && (
        <div className="mb-3 w-80 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-4 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FF7F6B]/15 text-[#FF7F6B]">
                <Wrench className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                  Dev Mode Role Switcher
                </h4>
                <p className="text-[11px] text-neutral-500">
                  Tự động đăng nhập test 1-click
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Session status */}
          <div className="my-3 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">Vai trò hiện tại:</span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${roleBadgeConfig.pillClass}`}
              >
                {roleBadgeConfig.label}
              </span>
            </div>
            {session.isLoggedIn && (
              <div className="mt-1 pt-1 border-t border-neutral-200/60 dark:border-neutral-700/60 text-[11px] text-neutral-600 dark:text-neutral-300 truncate">
                <span className="font-semibold">{session.fullName}</span> (
                {session.email})
              </div>
            )}
          </div>

          {/* Role Switcher Actions */}
          <div className="space-y-2">
            {/* 1. Quick Admin */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSwitchRole("admin")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                session.role === "admin"
                  ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300"
                  : "bg-white dark:bg-neutral-800/80 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200"
              }`}
            >
              <div className="flex items-center gap-2.5 text-left">
                <span className="p-1 rounded-md bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300">
                  <Shield className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    Đăng nhập vai Admin
                    {session.role === "admin" && (
                      <Check className="w-3.5 h-3.5 text-red-600" />
                    )}
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    admin@animora.vn • Điều hướng /admin
                  </div>
                </div>
              </div>
            </button>

            {/* 2 & 3. Quick Expert roles: Bác sĩ thú y -> Chuyên viên spa */}
            {(
              [
                {
                  key: "expert-vet" as const,
                  label: "Đăng nhập vai Bác sĩ thú y",
                  sub: "vet@animora.vn • Điều hướng /expert",
                  Icon: Stethoscope,
                  active: session.role === "expert" && session.expertType === "vet",
                },
                {
                  key: "expert-spa" as const,
                  label: "Đăng nhập vai Chuyên viên spa",
                  sub: "spa@animora.vn • Điều hướng /expert",
                  Icon: Scissors,
                  active: session.role === "expert" && session.expertType !== "vet",
                },
              ]
            ).map(({ key, label, sub, Icon, active }) => (
              <button
                key={key}
                type="button"
                disabled={loading}
                onClick={() => handleSwitchRole(key)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                  active
                    ? "bg-[#6B1F2E]/10 dark:bg-[#FF7F6B]/15 border-[#6B1F2E]/30 dark:border-[#FF7F6B]/40 text-[#6B1F2E] dark:text-[#F4B6C2]"
                    : "bg-white dark:bg-neutral-800/80 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200"
                }`}
              >
                <div className="flex items-center gap-2.5 text-left">
                  <span className="p-1 rounded-md bg-[#6B1F2E]/10 dark:bg-[#FF7F6B]/20 text-[#6B1F2E] dark:text-[#FF7F6B]">
                    <Icon className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      {label}
                      {active && <Check className="w-3.5 h-3.5 text-[#6B1F2E] dark:text-[#FF7F6B]" />}
                    </div>
                    <div className="text-[10px] text-neutral-400">{sub}</div>
                  </div>
                </div>
              </button>
            ))}

            {/* 4. Quick User */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSwitchRole("user")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                session.role === "user"
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300"
                  : "bg-white dark:bg-neutral-800/80 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200"
              }`}
            >
              <div className="flex items-center gap-2.5 text-left">
                <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300">
                  <User className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    Đăng nhập vai User
                    {session.role === "user" && (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    user@animora.vn • Điều hướng /
                  </div>
                </div>
              </div>
            </button>

            {/* Quick Logout (only if logged in) */}
            {session.isLoggedIn && (
              <button
                type="button"
                disabled={loading}
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-neutral-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border border-transparent transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất về Khách (Guest)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Floating Pill Trigger (Styled matching Animora Glass Pill) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        title="Bấm để mở công cụ chuyển đổi nhanh vai trò Dev Mode"
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border shadow-lg hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#FF7F6B] cursor-pointer bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200"
      >
        <Wrench className="w-3.5 h-3.5 text-[#FF7F6B]" />
        <span>Dev Mode</span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${roleBadgeConfig.pillClass}`}
        >
          {roleBadgeConfig.label}
        </span>
        <ChevronUp
          className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
    </div>
  );
}

