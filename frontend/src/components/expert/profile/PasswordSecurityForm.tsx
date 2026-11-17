"use client";

import React, { useState, useMemo } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import {
  evaluatePasswordStrength,
  MIN_PASSWORD_LENGTH,
} from "./profileUtils";
import { toast } from "sonner";

interface PasswordSecurityFormProps {
  email: string;
  lang: "vi" | "en";
}

export function PasswordSecurityForm({
  email,
  lang,
}: PasswordSecurityFormProps) {
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passTouched, setPassTouched] = useState<{
    current?: boolean;
    new?: boolean;
    confirm?: boolean;
  }>({});

  const passwordStrength = useMemo(
    () => evaluatePasswordStrength(newPass, lang),
    [newPass, lang]
  );

  const currentTouched = Boolean(passTouched.current);
  const newTouched = Boolean(passTouched.new);
  const confirmTouched = Boolean(passTouched.confirm);

  const currentPassError = useMemo(() => {
    if (!currentTouched) return null;
    if (!currentPass) {
      return lang === "en"
        ? "Please enter your current password."
        : "Vui lòng nhập mật khẩu hiện tại.";
    }
    return null;
  }, [currentPass, currentTouched, lang]);

  const newPassError = useMemo(() => {
    if (!newPass && !newTouched) return null;
    if (!newPass) {
      return lang === "en"
        ? "Please enter a new password."
        : "Vui lòng nhập mật khẩu mới.";
    }
    if (newPass.length < MIN_PASSWORD_LENGTH) {
      return lang === "en"
        ? `New password must be at least ${MIN_PASSWORD_LENGTH} characters (currently ${newPass.length}/${MIN_PASSWORD_LENGTH}).`
        : `Mật khẩu mới phải có tối thiểu ${MIN_PASSWORD_LENGTH} ký tự (hiện tại ${newPass.length}/${MIN_PASSWORD_LENGTH} ký tự).`;
    }
    if (currentPass && newPass === currentPass) {
      return lang === "en"
        ? "New password must not be identical to your current password."
        : "Mật khẩu mới không được trùng với mật khẩu hiện tại.";
    }
    return null;
  }, [newPass, currentPass, newTouched, lang]);

  const confirmPassError = useMemo(() => {
    if (!confirmPass && !confirmTouched) return null;
    if (!confirmPass) {
      return lang === "en"
        ? "Please confirm your new password."
        : "Vui lòng nhập xác nhận mật khẩu mới.";
    }
    if (confirmPass !== newPass) {
      return lang === "en"
        ? "Confirmation password does not match the new password."
        : "Mật khẩu xác nhận không khớp với mật khẩu mới.";
    }
    return null;
  }, [confirmPass, newPass, confirmTouched, lang]);

  const isPasswordFormValid =
    currentPass.length > 0 &&
    newPass.length >= MIN_PASSWORD_LENGTH &&
    newPass !== currentPass &&
    confirmPass.length >= MIN_PASSWORD_LENGTH &&
    confirmPass === newPass;

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassTouched({ current: true, new: true, confirm: true });

    if (!isPasswordFormValid) {
      toast.error(
        lang === "en"
          ? "Please check your password fields before updating."
          : "Vui lòng kiểm tra lại các trường mật khẩu đang báo lỗi."
      );
      return;
    }

    try {
      const storageKey = "animora_expert_passwords_v1";
      const raw = window.localStorage.getItem(storageKey);
      const map: Record<string, string> = raw ? JSON.parse(raw) : {};
      const expectedDefault = email.startsWith("vet")
        ? "vet123"
        : email.startsWith("care.pt")
        ? "carept123"
        : "spa123";
      const expectedCurrent = map[email] ?? expectedDefault;

      if (currentPass !== expectedCurrent) {
        toast.error(
          lang === "en"
            ? "Current password is incorrect."
            : "Mật khẩu hiện tại không chính xác."
        );
        return;
      }

      map[email] = newPass;
      window.localStorage.setItem(storageKey, JSON.stringify(map));
    } catch {
      // ignore storage errors
    }

    toast.success(
      lang === "en"
        ? "Password updated successfully!"
        : "Đã cập nhật mật khẩu thành công!"
    );
    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
    setShowCurrentPass(false);
    setShowNewPass(false);
    setShowConfirmPass(false);
    setPassTouched({});
  };

  return (
    <form
      noValidate
      onSubmit={handleChangePassword}
      className="relative z-10 rounded-3xl border border-zinc-200/80 dark:border-border bg-white/95 dark:bg-card/90 backdrop-blur-md shadow-xs p-6 space-y-4 text-xs"
    >
      {/* Mục 19: Trường username ẩn chuẩn W3C để trình quản lý mật khẩu không tự điền nhầm sang thẻ thông tin cá nhân phía trên */}
      <input
        type="email"
        name="username"
        autoComplete="username"
        value={email}
        readOnly
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      />

      <div className="flex items-center gap-2">
        <KeyRound className="w-4 h-4 text-[#6B1F2E] dark:text-[#FF7F6B]" />
        <h3 className="font-heading font-extrabold text-sm text-zinc-900 dark:text-foreground">
          {lang === "en"
            ? "Security and password change"
            : "Bảo mật và đổi mật khẩu"}
        </h3>
      </div>

      <div className="space-y-4">
        {/* Ô 1: Mật khẩu hiện tại (Mục 17, 19) */}
        <div className="space-y-1.5">
          <label className="block font-bold text-zinc-700 dark:text-foreground/90">
            {lang === "en" ? "Current password *" : "Mật khẩu hiện tại *"}
          </label>
          <div className="relative">
            <input
              name="current-password"
              autoComplete="current-password"
              type={showCurrentPass ? "text" : "password"}
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              onBlur={() =>
                setPassTouched((prev) => ({ ...prev, current: true }))
              }
              placeholder={
                lang === "en"
                  ? "Enter current password"
                  : "Nhập mật khẩu hiện tại"
              }
              className={`w-full p-2.5 pr-10 rounded-xl border bg-[#FAF6F0]/80 dark:bg-[#3A1420]/80 text-zinc-900 dark:text-foreground placeholder:text-zinc-400 dark:placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 ${
                currentPassError
                  ? "border-rose-500 focus:ring-rose-500/25 focus:border-rose-500"
                  : "border-zinc-200/80 dark:border-border focus:ring-[#6B1F2E]/25 dark:focus:ring-[#FF7F6B]/30 focus:border-[#6B1F2E] dark:focus:border-[#FF7F6B]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPass((prev) => !prev)}
              title={
                showCurrentPass
                  ? lang === "en"
                    ? "Hide password"
                    : "Ẩn mật khẩu"
                  : lang === "en"
                  ? "Show password"
                  : "Hiện mật khẩu"
              }
              aria-label={
                showCurrentPass
                  ? lang === "en"
                    ? "Hide password"
                    : "Ẩn mật khẩu"
                  : lang === "en"
                  ? "Show password"
                  : "Hiện mật khẩu"
              }
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-zinc-400 hover:text-zinc-800 dark:text-muted-foreground dark:hover:text-foreground cursor-pointer"
            >
              {showCurrentPass ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {currentPassError && (
            <p className="flex items-start gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{currentPassError}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          {/* Ô 2: Mật khẩu mới (Mục 17, 18, 19) */}
          <div className="space-y-1.5">
            <label className="block font-bold text-zinc-700 dark:text-foreground/90">
              {lang === "en"
                ? "New password (min 8 chars) *"
                : "Mật khẩu mới (tối thiểu 8 ký tự) *"}
            </label>
            <div className="relative">
              <input
                name="new-password"
                autoComplete="new-password"
                type={showNewPass ? "text" : "password"}
                value={newPass}
                onChange={(e) => {
                  setNewPass(e.target.value);
                  if (!passTouched.new) {
                    setPassTouched((prev) => ({ ...prev, new: true }));
                  }
                }}
                onBlur={() =>
                  setPassTouched((prev) => ({ ...prev, new: true }))
                }
                placeholder={
                  lang === "en"
                    ? "Enter new password (min 8 chars)"
                    : "Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                }
                className={`w-full p-2.5 pr-10 rounded-xl border bg-[#FAF6F0]/80 dark:bg-[#3A1420]/80 text-zinc-900 dark:text-foreground placeholder:text-zinc-400 dark:placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 ${
                  newPassError
                    ? "border-rose-500 focus:ring-rose-500/25 focus:border-rose-500"
                    : "border-zinc-200/80 dark:border-border focus:ring-[#6B1F2E]/25 dark:focus:ring-[#FF7F6B]/30 focus:border-[#6B1F2E] dark:focus:border-[#FF7F6B]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPass((prev) => !prev)}
                title={
                  showNewPass
                    ? lang === "en"
                      ? "Hide password"
                      : "Ẩn mật khẩu"
                    : lang === "en"
                    ? "Show password"
                    : "Hiện mật khẩu"
                }
                aria-label={
                  showNewPass
                    ? lang === "en"
                      ? "Hide password"
                      : "Ẩn mật khẩu"
                    : lang === "en"
                    ? "Show password"
                    : "Hiện mật khẩu"
                }
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-zinc-400 hover:text-zinc-800 dark:text-muted-foreground dark:hover:text-foreground cursor-pointer"
              >
                {showNewPass ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Thanh đo mức độ mạnh/yếu kèm gợi ý ngắn (Mục 18) */}
            <div className="space-y-1 pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 flex-1">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        passwordStrength.bars >= step
                          ? passwordStrength.barColorClass
                          : "bg-zinc-200 dark:bg-[#2A0C14] border border-transparent dark:border-border/50"
                      }`}
                    />
                  ))}
                </div>
                {passwordStrength.label && (
                  <span
                    className={`text-[11px] font-extrabold shrink-0 ${passwordStrength.textColorClass}`}
                  >
                    {passwordStrength.label}
                  </span>
                )}
              </div>

              {newPassError ? (
                <p className="flex items-start gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{newPassError}</span>
                </p>
              ) : (
                <p className="text-[11px] text-zinc-500 dark:text-muted-foreground font-medium leading-snug">
                  {passwordStrength.hint}
                </p>
              )}
            </div>
          </div>

          {/* Ô 3: Xác nhận mật khẩu mới (Mục 17, 18, 19) */}
          <div className="space-y-1.5">
            <label className="block font-bold text-zinc-700 dark:text-foreground/90">
              {lang === "en"
                ? "Confirm new password *"
                : "Xác nhận mật khẩu mới *"}
            </label>
            <div className="relative">
              <input
                name="confirm-new-password"
                autoComplete="new-password"
                type={showConfirmPass ? "text" : "password"}
                value={confirmPass}
                onChange={(e) => {
                  setConfirmPass(e.target.value);
                  if (!passTouched.confirm) {
                    setPassTouched((prev) => ({
                      ...prev,
                      confirm: true,
                    }));
                  }
                }}
                onBlur={() =>
                  setPassTouched((prev) => ({ ...prev, confirm: true }))
                }
                placeholder={
                  lang === "en"
                    ? "Re-enter new password"
                    : "Nhập lại mật khẩu mới"
                }
                className={`w-full p-2.5 pr-10 rounded-xl border bg-[#FAF6F0]/80 dark:bg-[#3A1420]/80 text-zinc-900 dark:text-foreground placeholder:text-zinc-400 dark:placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 ${
                  confirmPassError
                    ? "border-rose-500 focus:ring-rose-500/25 focus:border-rose-500"
                    : "border-zinc-200/80 dark:border-border focus:ring-[#6B1F2E]/25 dark:focus:ring-[#FF7F6B]/30 focus:border-[#6B1F2E] dark:focus:border-[#FF7F6B]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass((prev) => !prev)}
                title={
                  showConfirmPass
                    ? lang === "en"
                      ? "Hide password"
                      : "Ẩn mật khẩu"
                    : lang === "en"
                    ? "Show password"
                    : "Hiện mật khẩu"
                }
                aria-label={
                  showConfirmPass
                    ? lang === "en"
                      ? "Hide password"
                      : "Ẩn mật khẩu"
                    : lang === "en"
                    ? "Show password"
                    : "Hiện mật khẩu"
                }
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-zinc-400 hover:text-zinc-800 dark:text-muted-foreground dark:hover:text-foreground cursor-pointer"
              >
                {showConfirmPass ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {confirmPassError ? (
              <p className="flex items-start gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{confirmPassError}</span>
              </p>
            ) : (
              confirmPass.length >= MIN_PASSWORD_LENGTH &&
              confirmPass === newPass && (
                <p className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {lang === "en"
                      ? "Confirmation password matches"
                      : "Mật khẩu xác nhận đã khớp"}
                  </span>
                </p>
              )
            )}
          </div>
        </div>

        {/* Mục 20: Nút "Cập nhật mật khẩu" chỉ bật khi đủ 3 ô hợp lệ */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!isPasswordFormValid}
            className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold transition-all cursor-pointer shadow-sm ${
              !isPasswordFormValid
                ? "bg-zinc-100 text-zinc-400 border border-zinc-200 dark:bg-[#3A1420] dark:text-[#E5BFC4]/40 dark:border-[#6E2E40]/60 cursor-not-allowed shadow-none"
                : "bg-[#6B1F2E] text-white hover:bg-[#521723] dark:bg-[#FF7F6B] dark:text-zinc-950 dark:hover:bg-[#ff9482] shadow-[#6B1F2E]/20 dark:shadow-[#FF7F6B]/20"
            }`}
          >
            <KeyRound className="w-4 h-4 text-[#FF7F6B] dark:text-zinc-950" />
            <span>
              {lang === "en" ? "Update password" : "Cập nhật mật khẩu"}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}

