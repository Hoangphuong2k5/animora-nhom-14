import React from 'react';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { AuthMode, Language } from '@/types';
import { translations } from '@/data/translations';

interface AuthLoginFormProps {
  lang: Language;
  loginIdentifier: string;
  setLoginIdentifier: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  showLoginPass: boolean;
  setShowLoginPass: React.Dispatch<React.SetStateAction<boolean>>;
  rememberMe: boolean;
  setRememberMe: (val: boolean) => void;
  isSubmittingLogin: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onSwitchMode: (mode: AuthMode) => void;
  showDemoLoginButton?: boolean;
  onDemoLogin?: () => void;
  googleSection?: React.ReactNode;
}

/** Shared Login form for both AuthPage and LoginModal. */
export const AuthLoginForm = ({
  lang,
  loginIdentifier,
  setLoginIdentifier,
  loginPassword,
  setLoginPassword,
  showLoginPass,
  setShowLoginPass,
  rememberMe,
  setRememberMe,
  isSubmittingLogin,
  onSubmit,
  onSwitchMode,
  showDemoLoginButton = false,
  onDemoLogin,
  googleSection,
}: AuthLoginFormProps) => {
  const t = translations[lang].loginModal;

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {/* Email / Phone Field */}
      <div className="w-full rounded-xl px-4 py-2.5 border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--primary)]/50 focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/15 transition-all">
        <label
          htmlFor="auth-login-email"
          className="block text-[11px] font-semibold text-[var(--text-muted)] mb-0.5"
        >
          {t.emailLabel}
        </label>
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          <input
            id="auth-login-email"
            type="text"
            data-testid="login-identifier-input"
            value={loginIdentifier}
            onChange={(e) => setLoginIdentifier(e.target.value)}
            placeholder="phanthidinhthuy6@gmail.com / 0901234567"
            className="w-full bg-transparent text-[14px] font-semibold text-[var(--text)] outline-none"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="w-full rounded-xl px-4 py-2.5 border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--primary)]/50 focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/15 transition-all flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <label
            htmlFor="auth-login-password"
            className="block text-[11px] font-semibold text-[var(--text-muted)] mb-0.5"
          >
            {t.passLabel}
          </label>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
            <input
              id="auth-login-password"
              type={showLoginPass ? 'text' : 'password'}
              data-testid="login-password-input"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent text-[14px] font-semibold text-[var(--text)] outline-none"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowLoginPass((prev) => !prev)}
          aria-label="Toggle password visibility"
          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
        >
          {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between pt-0.5 pb-0.5">
        <label className="inline-flex items-center gap-2.5 text-[13px] font-medium text-[var(--text)] cursor-pointer select-none p-1.5 -ml-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
          <Checkbox
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
            className="cursor-pointer data-checked:bg-(--primary) data-checked:border-(--primary) data-checked:text-(--on-primary)"
          />
          <span>{t.rememberMe}</span>
        </label>

        <button
          type="button"
          data-testid="forgot-password-link"
          onClick={() => onSwitchMode('forgot-password')}
          className="text-[13px] font-bold text-[var(--primary)] hover:underline cursor-pointer p-1 rounded-md"
        >
          {t.forgotLink}
        </button>
      </div>

      {/* Primary Login Button */}
      <button
        type="submit"
        disabled={isSubmittingLogin}
        data-testid="login-submit-btn"
        className="btn-primary w-full h-[48px] !rounded-xl font-heading text-[15px] font-bold shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
      >
        {isSubmittingLogin ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{lang === 'vi' ? 'Đang đăng nhập...' : 'Signing in...'}</span>
          </>
        ) : (
          <span>{t.submitBtn}</span>
        )}
      </button>

      {showDemoLoginButton && onDemoLogin && (
        <button
          type="button"
          data-testid="demo-login-btn"
          onClick={onDemoLogin}
          className="btn-secondary w-full py-2.5 text-xs font-bold text-center cursor-pointer"
        >
          {t.demoLoginBtn}
        </button>
      )}

      {googleSection}
    </form>
  );
};
