"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Clock,
  UserCheck,
  Truck,
  HeartHandshake,
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
    role: "admin" | "manager" | "user" | "expert" | "supplier" | "rescue" | "guest";
    expertType?: string;
    employmentType?: "full_time" | "part_time";
    email?: string;
    fullName?: string;
  }>({
    isLoggedIn: false,
    role: "guest",
  });

  const popoverRef = useRef<HTMLDivElement>(null);

  const refreshSession = useCallback(async () => {
    try {
      const res = await devGetSessionInfoAction();
      if (res && res.isLoggedIn) {
        setSession(res);
        return;
      }
    } catch {
      // Fallback to local storage check
    }

    try {
      const savedStr = localStorage.getItem("animora_current_user");
      if (savedStr) {
        const saved = JSON.parse(savedStr);
        if (saved && (saved.role || saved.fullName)) {
          let role: "admin" | "manager" | "user" | "expert" | "supplier" | "rescue" = "user";
          let quickRole: DevQuickRole = "user";
          let expertType: "vet" | "spa" | undefined = undefined;
          let employmentType: "full_time" | "part_time" | undefined = undefined;

          if (saved.role === "admin" || saved.id === "admin-root") {
            role = "admin";
            quickRole = "admin";
          } else if (saved.role === "manager" || saved.id === "manager-root") {
            role = "manager";
            quickRole = "manager";
          } else if (saved.role === "supplier" || saved.id === "sup-01") {
            role = "supplier";
            quickRole = "supplier";
          } else if (saved.role === "rescue" || saved.id === "she-1") {
            role = "rescue";
            quickRole = "rescue";
          } else if (
            saved.role === "vet" ||
            saved.id === "exp-vet-01" ||
            saved.id === "exp-vet-02" ||
            saved.id === "exp-vet-03" ||
            saved.expertType === "vet"
          ) {
            role = "expert";
            quickRole =
              saved.id === "exp-vet-02" || saved.email === "vet.toan@animora.vn"
                ? "expert-vet-2"
                : saved.id === "exp-vet-03" || saved.email === "vet.phuong@animora.vn"
                ? "expert-vet-3"
                : "expert-vet";
            expertType = "vet";
          } else if (
            saved.id === "exp-spa-02" ||
            saved.employmentType === "part_time"
          ) {
            role = "expert";
            quickRole = "expert-care-pt";
            expertType = "spa";
            employmentType = "part_time";
          } else if (
            saved.role === "spa" ||
            saved.role === "expert" ||
            saved.id === "exp-spa-01" ||
            saved.expertType === "spa"
          ) {
            role = "expert";
            quickRole = "expert-spa";
            expertType = "spa";
            employmentType = "full_time";
          }

          setSession({
            isLoggedIn: true,
            role,
            expertType,
            employmentType,
            email: saved.email,
            fullName: saved.fullName,
          });

          try {
            devQuickLoginAction(quickRole);
          } catch {
            // ignore
          }
          return;
        }
      }
    } catch {
      // ignore
    }

    setSession({ isLoggedIn: false, role: "guest" });
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      setMounted(true);
      refreshSession();
    });

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
      cancelled = true;
      window.removeEventListener("animora_user_sync", handleSync);
    };
  }, [refreshSession]);

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
            manager: {
              id: "manager-root",
              fullName: "Animora Manager",
              email: "manager@animora.vn",
              role: "manager",
            },
            user: {
              id: "user-demo",
              fullName: "Animora User",
              email: "user@animora.vn",
              role: "owner",
            },
            "expert-vet": {
              id: "exp-vet-01",
              fullName: "BS. Lê Huy Hoàng",
              email: "vet@animora.vn",
              role: "vet",
            },
            "expert-vet-2": {
              id: "exp-vet-02",
              fullName: "BS. Ngô Phước Toàn",
              email: "vet.toan@animora.vn",
              role: "vet",
            },
            "expert-vet-3": {
              id: "exp-vet-03",
              fullName: "BS. Nguyễn Thúc Hoàng Phương",
              email: "vet.phuong@animora.vn",
              role: "vet",
            },
            "expert-spa": {
              id: "exp-spa-01",
              fullName: "Phan Thị Đình Thùy",
              email: "spa@animora.vn",
              role: "expert",
            },
            "expert-care-pt": {
              id: "exp-spa-02",
              fullName: "Nguyễn Văn Tuấn Anh",
              email: "care.pt@animora.vn",
              role: "expert",
            },
            supplier: {
              id: "sup-01",
              fullName: "Công ty TNHH Royal Canin Việt Nam",
              email: "supplier@animora.vn",
              role: "supplier",
            },
            rescue: {
              id: "she-1",
              fullName: "Trạm Cứu Hộ Động Vật Hanoi Pet Rescue",
              email: "rescue@animora.vn",
              role: "rescue",
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
      toast.info("Đã đăng xuất về trạng thái Khách (Guest)");
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
    manager: {
      label: "Manager",
      pillClass: "bg-indigo-600 text-white",
      dotClass: "bg-indigo-400",
    },
    user: {
      label: "User",
      pillClass: "bg-emerald-600 text-white",
      dotClass: "bg-emerald-400",
    },
    expert: {
      label:
        session.expertType === "vet"
          ? "Bác sĩ"
          : session.employmentType === "part_time"
          ? "NV Chăm sóc (PT)"
          : "NV Chăm sóc (FT)",
      pillClass: "bg-[#6B1F2E] text-white",
      dotClass: "bg-[#FF7F6B]",
    },
    supplier: {
      label: "Supplier",
      pillClass: "bg-teal-600 text-white",
      dotClass: "bg-teal-400",
    },
    rescue: {
      label: "Rescue",
      pillClass: "bg-rose-600 text-white",
      dotClass: "bg-rose-400",
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
        <div className="mb-2.5 w-80 max-h-[calc(100vh-5.5rem)] overflow-y-auto scrollbar-thin bg-white/95 dark:bg-[#181C26]/95 backdrop-blur-md rounded-2xl border border-neutral-200 dark:border-[#2B3142] shadow-2xl p-3 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-[#2B3142]">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#FF7F6B]/15 text-[#FF7F6B]">
                <Wrench className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-[#F4F5F8] leading-tight">
                  Dev Mode Role Switcher
                </h4>
                <p className="text-[11px] text-neutral-500 dark:text-[#9CA3B4]">
                  Tự động đăng nhập test 1-click
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-neutral-400 dark:text-[#9CA3B4] hover:text-neutral-600 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#222735] cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Role Switcher Actions */}
          <div className="mt-2 space-y-1.5">
            {/* 1. Quick Admin */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSwitchRole("admin")}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                session.role === "admin"
                  ? "bg-red-50 dark:bg-red-500/15 border-red-200 dark:border-red-500/45 text-red-700 dark:text-red-200"
                  : "bg-white dark:bg-[#222735]/80 hover:bg-neutral-50 dark:hover:bg-[#293042] border-neutral-200 dark:border-[#2E3548] text-neutral-800 dark:text-[#F4F5F8]"
              }`}
            >
              <div className="flex items-center gap-2.5 text-left">
                <span className="p-1.5 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300">
                  <Shield className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    Admin
                    {session.role === "admin" && (
                      <Check className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="text-[10px] text-neutral-500 dark:text-[#A8B0C2]">
                    admin@animora.vn • Điều hướng /admin
                  </div>
                </div>
              </div>
            </button>

            {/* 1b. Quick Manager */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSwitchRole("manager")}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                session.role === "manager"
                  ? "bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-400/45 text-indigo-700 dark:text-indigo-200"
                  : "bg-white dark:bg-[#222735]/80 hover:bg-neutral-50 dark:hover:bg-[#293042] border-neutral-200 dark:border-[#2E3548] text-neutral-800 dark:text-[#F4F5F8]"
              }`}
            >
              <div className="flex items-center gap-2.5 text-left">
                <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300">
                  <UserCheck className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    Manager
                    {session.role === "manager" && (
                      <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                  <div className="text-[10px] text-neutral-500 dark:text-[#A8B0C2]">
                    manager@animora.vn • Điều hướng /manager
                  </div>
                </div>
              </div>
            </button>

            {/* 2, 3, 4. Quick Expert roles */}
            <div className="pt-1 pb-0.5 space-y-1.5">
              <div className="px-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-[#9CA3B4]">
                <span>Cổng Chuyên viên (/expert)</span>
              </div>
              {[
                {
                  key: "expert-vet-2" as const,
                  label: "BS. Ngô Phước Toàn",
                  sub: "vet.toan@animora.vn",
                  badge: "Bác sĩ",
                  Icon: Stethoscope,
                  active:
                    session.role === "expert" &&
                    session.expertType === "vet",
                  activeCls:
                    "bg-cyan-50 dark:bg-cyan-500/15 border-cyan-200 dark:border-cyan-400/45 text-cyan-700 dark:text-cyan-200",
                  iconCls:
                    "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300",
                  checkCls: "text-cyan-600 dark:text-cyan-400",
                  badgeCls:
                    "bg-cyan-100/80 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
                },
                {
                  key: "expert-spa" as const,
                  label: "NV Chăm sóc",
                  sub: "spa@animora.vn",
                  badge: "Full-time",
                  Icon: Scissors,
                  active:
                    session.role === "expert" &&
                    session.expertType !== "vet" &&
                    session.employmentType !== "part_time",
                  activeCls:
                    "bg-[#6B1F2E]/10 dark:bg-[#FF8573]/15 border-[#6B1F2E]/30 dark:border-[#FF8573]/45 text-[#6B1F2E] dark:text-[#F4B6C2]",
                  iconCls:
                    "bg-[#6B1F2E]/10 dark:bg-[#FF8573]/20 text-[#6B1F2E] dark:text-[#FF8573]",
                  checkCls: "text-[#6B1F2E] dark:text-[#FF8573]",
                  badgeCls:
                    "bg-[#6B1F2E]/10 text-[#6B1F2E] dark:bg-[#FF8573]/20 dark:text-[#FF8573]",
                },
                {
                  key: "expert-care-pt" as const,
                  label: "NV Chăm sóc",
                  sub: "care.pt@animora.vn",
                  badge: "Part-time",
                  Icon: Clock,
                  active:
                    session.role === "expert" &&
                    session.expertType !== "vet" &&
                    session.employmentType === "part_time",
                  activeCls:
                    "bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-400/45 text-amber-800 dark:text-amber-200",
                  iconCls:
                    "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300",
                  checkCls: "text-amber-600 dark:text-amber-400",
                  badgeCls:
                    "bg-amber-100/80 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
                },
              ].map(
                ({
                  key,
                  label,
                  sub,
                  badge,
                  Icon,
                  active,
                  activeCls,
                  iconCls,
                  checkCls,
                  badgeCls,
                }) => (
                  <button
                    key={key}
                    type="button"
                    disabled={loading}
                    onClick={() => handleSwitchRole(key)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                      active
                        ? activeCls
                        : "bg-white dark:bg-[#222735]/80 hover:bg-neutral-50 dark:hover:bg-[#293042] border-neutral-200 dark:border-[#2E3548] text-neutral-800 dark:text-[#F4F5F8]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-left min-w-0">
                      <span className={`p-1.5 rounded-lg shrink-0 ${iconCls}`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold flex items-center gap-1.5">
                          <span className="truncate">{label}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide shrink-0 ${badgeCls}`}
                          >
                            {badge}
                          </span>
                          {active && (
                            <Check className={`w-3.5 h-3.5 shrink-0 ${checkCls}`} />
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-500 dark:text-[#A8B0C2] truncate">
                          {sub}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              )}
            </div>

            {/* 4b. Quick Supplier */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSwitchRole("supplier")}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                session.role === "supplier"
                  ? "bg-teal-50 dark:bg-teal-500/15 border-teal-200 dark:border-teal-400/45 text-teal-700 dark:text-teal-200"
                  : "bg-white dark:bg-[#222735]/80 hover:bg-neutral-50 dark:hover:bg-[#293042] border-neutral-200 dark:border-[#2E3548] text-neutral-800 dark:text-[#F4F5F8]"
              }`}
            >
              <div className="flex items-center gap-2.5 text-left">
                <span className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-300">
                  <Truck className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    Nhà cung cấp
                    {session.role === "supplier" && (
                      <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    )}
                  </div>
                  <div className="text-[10px] text-neutral-500 dark:text-[#A8B0C2]">
                    supplier@animora.vn • Điều hướng /supplier
                  </div>
                </div>
              </div>
            </button>

            {/* 4c. Quick Rescue */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSwitchRole("rescue")}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                session.role === "rescue"
                  ? "bg-rose-50 dark:bg-rose-500/15 border-rose-200 dark:border-rose-400/45 text-rose-700 dark:text-rose-200"
                  : "bg-white dark:bg-[#222735]/80 hover:bg-neutral-50 dark:hover:bg-[#293042] border-neutral-200 dark:border-[#2E3548] text-neutral-800 dark:text-[#F4F5F8]"
              }`}
            >
              <div className="flex items-center gap-2.5 text-left">
                <span className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300">
                  <HeartHandshake className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    Trạm cứu hộ
                    {session.role === "rescue" && (
                      <Check className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    )}
                  </div>
                  <div className="text-[10px] text-neutral-500 dark:text-[#A8B0C2]">
                    rescue@animora.vn • Điều hướng /rescue
                  </div>
                </div>
              </div>
            </button>

            {/* 5. Quick User */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSwitchRole("user")}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                session.role === "user"
                  ? "bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-400/45 text-emerald-700 dark:text-emerald-200"
                  : "bg-white dark:bg-[#222735]/80 hover:bg-neutral-50 dark:hover:bg-[#293042] border-neutral-200 dark:border-[#2E3548] text-neutral-800 dark:text-[#F4F5F8]"
              }`}
            >
              <div className="flex items-center gap-2.5 text-left">
                <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                  <User className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    User
                    {session.role === "user" && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <div className="text-[10px] text-neutral-500 dark:text-[#A8B0C2]">
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
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-[#C5CBD8] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/15 border border-transparent dark:border-[#2B3142]/70 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất về Khách (Guest)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Floating Pill Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        title="Bấm để mở công cụ chuyển đổi nhanh vai trò Dev Mode"
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border shadow-lg hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#FF7F6B] cursor-pointer bg-white/90 dark:bg-[#181C26]/95 backdrop-blur-md border-neutral-200 dark:border-[#2B3142] text-neutral-800 dark:text-[#F4F5F8]"
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
