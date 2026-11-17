"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Home, Lock, PawPrint, Sparkles } from "lucide-react";
import { useTranslation } from "@/components/providers/I18nProvider";
import Footer from "@/components/shared/Footer";
import { ROUTES } from "@/constants/config.constant";

export default function ForbiddenPage() {
  const router = useRouter();
  const { locale } = useTranslation();
  const isVi = locale !== "en";

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(ROUTES.HOME);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between"
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
    >
      <div className="h-10" aria-hidden="true" />

      <main className="flex-1 flex items-center justify-center px-5 py-10">
        <div
          className="w-full max-w-[520px] rounded-[28px] border p-7 sm:p-9 text-center space-y-6"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow)",
          }}
        >
          {/* Friendly Pet & Lock Emblem */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center border"
                style={{
                  backgroundColor: "var(--surface-2)",
                  borderColor: "var(--border)",
                }}
              >
                <PawPrint
                  className="w-10 h-10"
                  style={{ color: "var(--primary)" }}
                />
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full border flex items-center justify-center shadow-sm"
                style={{
                  backgroundColor: "var(--bg)",
                  borderColor: "var(--border)",
                  color: "var(--primary)",
                }}
              >
                <Lock className="w-4 h-4" />
              </div>
            </div>

            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-extrabold tracking-wide uppercase"
              style={{
                backgroundColor: "var(--bg)",
                borderColor: "var(--border)",
                color: "var(--primary)",
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isVi ? "403 · Khu vực nội bộ" : "403 · Staff-only area"}</span>
            </span>
          </div>

          {/* Warm Copy */}
          <div className="space-y-2.5">
            <h1
              className="font-heading text-2xl sm:text-[26px] font-extrabold leading-snug"
              style={{ color: "var(--primary)" }}
            >
              {isVi
                ? "Oops! Khu vực này chỉ dành cho đội ngũ Animora"
                : "Oops! This area is for Animora staff only"}
            </h1>
            <p
              className="text-sm sm:text-[15px] leading-relaxed max-w-md mx-auto"
              style={{ color: "var(--text-muted)" }}
            >
              {isVi
                ? "Tài khoản hiện tại của bạn không có quyền truy cập trang quản trị này. Đừng lo, các dịch vụ chăm sóc và hồ sơ thú cưng của bạn vẫn luôn sẵn sàng!"
                : "Your current account doesn't have permission to view this management page. No worries — all pet care services and your pet profiles are right outside!"}
            </p>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link
              href={ROUTES.HOME}
              className="btn-primary min-h-[46px] px-6 py-2.5 rounded-full text-sm font-bold inline-flex items-center gap-2 shadow-sm transition-transform hover:scale-[1.02]"
            >
              <Home className="w-4 h-4" />
              <span>{isVi ? "Về trang chủ" : "Go home"}</span>
            </Link>

            <button
              type="button"
              onClick={handleBack}
              className="btn-secondary min-h-[46px] px-5 py-2.5 rounded-full text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isVi ? "Quay lại" : "Go back"}</span>
            </button>
          </div>

          {/* Helpful Shortcuts */}
          <div
            className="pt-5 border-t space-y-2.5"
            style={{ borderColor: "var(--border)" }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              {isVi ? "Hoặc đi nhanh tới" : "Or jump straight to"}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/dat-lich"
                className="px-3.5 py-1.5 rounded-full border text-xs font-bold inline-flex items-center gap-1.5 transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: "var(--bg)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
              >
                <Calendar className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
                <span>{isVi ? "Đặt lịch chăm sóc" : "Book care"}</span>
              </Link>
              <Link
                href="/dich-vu"
                className="px-3.5 py-1.5 rounded-full border text-xs font-bold transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: "var(--bg)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
              >
                {isVi ? "Dịch vụ" : "Services"}
              </Link>
              <Link
                href="/ho-so-thu-cung"
                className="px-3.5 py-1.5 rounded-full border text-xs font-bold transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: "var(--bg)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
              >
                {isVi ? "Hồ sơ thú cưng" : "Pet profiles"}
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
