import React from 'react';
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Phone as PhoneIcon,
  User as UserIcon,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { AuthMode, Language } from '@/types';
import { translations } from '@/data/translations';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

interface AuthRegisterFormProps {
  lang: Language;
  regName: string;
  setRegName: (val: string) => void;
  regEmail: string;
  setRegEmail: (val: string) => void;
  regPhone: string;
  setRegPhone: (val: string) => void;
  regPassword: string;
  setRegPassword: (val: string) => void;
  regConfirmPassword: string;
  setRegConfirmPassword: (val: string) => void;
  showRegPass: boolean;
  setShowRegPass: React.Dispatch<React.SetStateAction<boolean>>;
  showRegConfirmPass: boolean;
  setShowRegConfirmPass: React.Dispatch<React.SetStateAction<boolean>>;
  agreeTerms: boolean;
  setAgreeTerms: (val: boolean) => void;
  isSubmittingRegister: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onSwitchMode: (mode: AuthMode) => void;
  onOpenTermsModal?: (type: 'terms' | 'privacy') => void;
  googleSection?: React.ReactNode;
}

/** Shared Register form for both AuthPage and LoginModal. */
export const AuthRegisterForm = ({
  lang,
  regName,
  setRegName,
  regEmail,
  setRegEmail,
  regPhone,
  setRegPhone,
  regPassword,
  setRegPassword,
  regConfirmPassword,
  setRegConfirmPassword,
  showRegPass,
  setShowRegPass,
  showRegConfirmPass,
  setShowRegConfirmPass,
  agreeTerms,
  setAgreeTerms,
  isSubmittingRegister,
  onSubmit,
  onSwitchMode,
  onOpenTermsModal,
  googleSection,
}: AuthRegisterFormProps) => {
  const t = translations[lang].loginModal;

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      {/* Full Name */}
      <div className="w-full rounded-xl px-4 py-2 border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--primary)]/50 focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/15 transition-all">
        <label
          htmlFor="auth-reg-name"
          className="block text-[11px] font-semibold text-[var(--text-muted)] mb-0.5"
        >
          {t.fullNameLabel}
        </label>
        <div className="flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          <input
            id="auth-reg-name"
            type="text"
            data-testid="register-name-input"
            value={regName}
            onChange={(e) => setRegName(e.target.value)}
            placeholder={lang === 'vi' ? 'Phan Thị Đình Thùy' : 'Alex Nguyen'}
            className="w-full bg-transparent text-[14px] font-semibold text-[var(--text)] outline-none"
          />
        </div>
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="w-full rounded-xl px-3.5 py-2 border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--primary)]/50 focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/15 transition-all">
          <label
            htmlFor="auth-reg-email"
            className="block text-[11px] font-semibold text-[var(--text-muted)] mb-0.5"
          >
            {t.emailOnlyLabel}
          </label>
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
            <input
              id="auth-reg-email"
              type="email"
              data-testid="register-email-input"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              placeholder="tenban@gmail.com"
              className="w-full bg-transparent text-[13.5px] font-semibold text-[var(--text)] outline-none"
            />
          </div>
        </div>

        <div className="w-full rounded-xl px-3.5 py-2 border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--primary)]/50 focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/15 transition-all">
          <label
            htmlFor="auth-reg-phone"
            className="block text-[11px] font-semibold text-[var(--text-muted)] mb-0.5"
          >
            {t.phoneLabel}
          </label>
          <div className="flex items-center gap-1.5">
            <PhoneIcon className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
            <input
              id="auth-reg-phone"
              type="tel"
              data-testid="register-phone-input"
              value={regPhone}
              onChange={(e) => setRegPhone(e.target.value)}
              placeholder="0337 203 332"
              className="w-full bg-transparent text-[13.5px] font-semibold text-[var(--text)] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Password & Confirm Password */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="w-full rounded-xl px-3.5 py-2 border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--primary)]/50 focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/15 transition-all flex items-center justify-between gap-1">
          <div className="flex-1 min-w-0">
            <label
              htmlFor="auth-reg-pass"
              className="block text-[11px] font-semibold text-[var(--text-muted)] mb-0.5"
            >
              {t.passLabel}
            </label>
            <input
              id="auth-reg-pass"
              type={showRegPass ? 'text' : 'password'}
              data-testid="register-password-input"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent text-[13.5px] font-semibold text-[var(--text)] outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowRegPass((prev) => !prev)}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
            aria-label="Toggle password visibility"
          >
            {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="w-full rounded-xl px-3.5 py-2 border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--primary)]/50 focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/15 transition-all flex items-center justify-between gap-1">
          <div className="flex-1 min-w-0">
            <label
              htmlFor="auth-reg-confirm"
              className="block text-[11px] font-semibold text-[var(--text-muted)] mb-0.5"
            >
              {t.confirmPassLabel}
            </label>
            <input
              id="auth-reg-confirm"
              type={showRegConfirmPass ? 'text' : 'password'}
              data-testid="register-confirm-password-input"
              value={regConfirmPassword}
              onChange={(e) => setRegConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent text-[13.5px] font-semibold text-[var(--text)] outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowRegConfirmPass((prev) => !prev)}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
            aria-label="Toggle confirm password visibility"
          >
            {showRegConfirmPass ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <PasswordStrengthMeter
        lang={lang}
        password={regPassword}
        confirmPassword={regConfirmPassword}
      />

      {/* Terms & Policy */}
      <div className="pt-0.5">
        <label className="flex items-start gap-2.5 text-[12.5px] font-medium text-[var(--text-muted)] cursor-pointer select-none p-1.5 -ml-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
          <Checkbox
            data-testid="register-terms-checkbox"
            checked={agreeTerms}
            onCheckedChange={(checked) => setAgreeTerms(Boolean(checked))}
            className="mt-0.5 shrink-0 cursor-pointer data-checked:bg-(--primary) data-checked:border-(--primary) data-checked:text-(--on-primary)"
          />
          <span className="leading-snug">
            {onOpenTermsModal ? (
              lang === 'vi' ? (
                <>
                  Tôi đồng ý với{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onOpenTermsModal('terms');
                    }}
                    className="font-bold text-[var(--primary)] underline hover:opacity-80 cursor-pointer"
                  >
                    Điều khoản dịch vụ
                  </button>{' '}
                  &amp;{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onOpenTermsModal('privacy');
                    }}
                    className="font-bold text-[var(--primary)] underline hover:opacity-80 cursor-pointer"
                  >
                    Chính sách bảo mật
                  </button>{' '}
                  của Animora
                </>
              ) : (
                <>
                  I agree to Animora&apos;s{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onOpenTermsModal('terms');
                    }}
                    className="font-bold text-[var(--primary)] underline hover:opacity-80 cursor-pointer"
                  >
                    Terms of Service
                  </button>{' '}
                  &amp;{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onOpenTermsModal('privacy');
                    }}
                    className="font-bold text-[var(--primary)] underline hover:opacity-80 cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </>
              )
            ) : (
              t.termsAgree
            )}
          </span>
        </label>
      </div>

      {/* Submit Register */}
      <button
        type="submit"
        disabled={isSubmittingRegister}
        data-testid="register-submit-btn"
        className="btn-primary w-full h-[48px] !rounded-xl font-heading text-[15px] font-bold shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
      >
        {isSubmittingRegister ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{lang === 'vi' ? 'Đang tạo tài khoản...' : 'Creating account...'}</span>
          </>
        ) : (
          <span>{t.registerSubmitBtn}</span>
        )}
      </button>

      {googleSection}
    </form>
  );
};
