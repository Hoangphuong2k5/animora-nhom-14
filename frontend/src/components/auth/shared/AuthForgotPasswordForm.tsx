import React from 'react';
import { AuthMode, Language } from '@/types';
import { translations } from '@/data/translations';
import { DEMO_OTP_CODE } from './authConstants';

interface AuthForgotPasswordFormProps {
  lang: Language;
  forgotStep: 1 | 2;
  forgotIdentifier: string;
  setForgotIdentifier: (val: string) => void;
  forgotOtp: string;
  setForgotOtp: (val: string) => void;
  forgotNewPass: string;
  setForgotNewPass: (val: string) => void;
  forgotConfirmPass: string;
  setForgotConfirmPass: (val: string) => void;
  onSendOtp: (e: React.FormEvent) => void;
  onResetPassword: (e: React.FormEvent) => void;
  onSwitchMode: (mode: AuthMode) => void;
}

/** Unified 2-step Forgot Password form (OTP = 123456) for AuthPage and LoginModal. */
export const AuthForgotPasswordForm = ({
  lang,
  forgotStep,
  forgotIdentifier,
  setForgotIdentifier,
  forgotOtp,
  setForgotOtp,
  forgotNewPass,
  setForgotNewPass,
  forgotConfirmPass,
  setForgotConfirmPass,
  onSendOtp,
  onResetPassword,
  onSwitchMode,
}: AuthForgotPasswordFormProps) => {
  const t = translations[lang].loginModal;

  return (
    <div data-testid="forgot-password-screen" className="space-y-4">
      {forgotStep === 1 ? (
        <form onSubmit={onSendOtp} className="space-y-4">
          <div className="w-full rounded-xl px-4 py-2.5 border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--primary)]/50 focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/15 transition-all">
            <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-0.5">
              {t.emailOnlyLabel}
            </label>
            <input
              type="email"
              value={forgotIdentifier}
              onChange={(e) => setForgotIdentifier(e.target.value)}
              placeholder="phanthidinhthuy6@gmail.com"
              className="w-full bg-transparent text-[14px] font-semibold text-[var(--text)] outline-none"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full h-[48px] !rounded-xl font-heading text-[15px] font-bold shadow-md cursor-pointer"
          >
            {t.sendOtpBtn}
          </button>

          <button
            type="button"
            onClick={() => onSwitchMode('login')}
            className="w-full text-center text-xs font-bold text-[var(--primary)] hover:underline pt-2 cursor-pointer"
          >
            {t.backToLogin}
          </button>
        </form>
      ) : (
        <form onSubmit={onResetPassword} className="space-y-4">
          <div className="w-full rounded-xl px-4 py-2.5 border border-[var(--border)] bg-[var(--bg)]">
            <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-0.5">
              {lang === 'vi'
                ? `Mã xác thực OTP (thử ${DEMO_OTP_CODE})`
                : `OTP Code (demo: ${DEMO_OTP_CODE})`}
            </label>
            <input
              type="text"
              value={forgotOtp}
              onChange={(e) => setForgotOtp(e.target.value)}
              placeholder={DEMO_OTP_CODE}
              className="w-full bg-transparent text-[15px] font-bold tracking-widest text-center text-[var(--text)] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="w-full rounded-xl px-4 py-2.5 border border-[var(--border)] bg-[var(--bg)]">
              <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-0.5">
                {t.newPassLabel}
              </label>
              <input
                type="password"
                value={forgotNewPass}
                onChange={(e) => setForgotNewPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-[14px] font-semibold text-[var(--text)] outline-none"
              />
            </div>

            <div className="w-full rounded-xl px-4 py-2.5 border border-[var(--border)] bg-[var(--bg)]">
              <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-0.5">
                {t.confirmPassLabel}
              </label>
              <input
                type="password"
                value={forgotConfirmPass}
                onChange={(e) => setForgotConfirmPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-[14px] font-semibold text-[var(--text)] outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full h-[48px] !rounded-xl font-heading text-[15px] font-bold shadow-md cursor-pointer"
          >
            {t.resetPassBtn}
          </button>

          <button
            type="button"
            onClick={() => onSwitchMode('login')}
            className="w-full text-center text-xs font-bold text-[var(--primary)] hover:underline pt-2 cursor-pointer"
          >
            {lang === 'vi' ? 'Hủy & Quay lại Đăng nhập' : 'Cancel & Back to Login'}
          </button>
        </form>
      )}
    </div>
  );
};
