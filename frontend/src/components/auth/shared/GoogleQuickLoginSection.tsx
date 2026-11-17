import React from 'react';
import { Plus, X } from 'lucide-react';
import { AuthMode, Language } from '@/types';
import { GMAIL_QUICK_ACCOUNTS, GoogleLogoIcon } from './authConstants';

interface GoogleQuickLoginSectionProps {
  lang: Language;
  mode: AuthMode;
  gmailPickerOpen: boolean;
  setGmailPickerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  customGmailMode: boolean;
  setCustomGmailMode: React.Dispatch<React.SetStateAction<boolean>>;
  customGmailName: string;
  setCustomGmailName: (val: string) => void;
  customGmailAddress: string;
  setCustomGmailAddress: (val: string) => void;
  onSelectAccount: (account: { fullName: string; email: string; phone: string }) => void;
  onSubmitCustomGmail: (e: React.FormEvent) => void;
}

/** Shared Google / Gmail quick account picker and custom Gmail form. */
export const GoogleQuickLoginSection = ({
  lang,
  mode,
  gmailPickerOpen,
  setGmailPickerOpen,
  customGmailMode,
  setCustomGmailMode,
  customGmailName,
  setCustomGmailName,
  customGmailAddress,
  setCustomGmailAddress,
  onSelectAccount,
  onSubmitCustomGmail,
}: GoogleQuickLoginSectionProps) => {
  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center gap-3 my-3">
        <div className="flex-1 border-t border-[var(--border)]" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          {lang === 'vi' ? 'hoặc tiếp tục với' : 'or continue with'}
        </span>
        <div className="flex-1 border-t border-[var(--border)]" />
      </div>

      <button
        type="button"
        data-testid="google-auth-trigger-btn"
        onClick={() => setGmailPickerOpen((prev) => !prev)}
        className="w-full h-[46px] px-4 rounded-xl border border-[var(--border)] hover:border-[var(--coral)] bg-[var(--bg)] hover:bg-black/[0.02] dark:hover:bg-white/[0.03] flex items-center justify-center gap-3 text-[13.5px] font-bold text-[var(--text)] transition-all duration-200 shadow-sm hover:shadow active:scale-[0.99] cursor-pointer"
      >
        <GoogleLogoIcon className="w-5 h-5 shrink-0" />
        <span>
          {mode === 'login'
            ? lang === 'vi'
              ? 'Đăng nhập bằng Google'
              : 'Sign in with Google'
            : lang === 'vi'
            ? 'Đăng ký nhanh bằng Google'
            : 'Sign up with Google'}
        </span>
      </button>

      {gmailPickerOpen && (
        <div
          data-testid="gmail-account-chooser"
          className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)] space-y-3 shadow-lg animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <GoogleLogoIcon className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold text-[var(--text)]">
                {lang === 'vi' ? 'Chọn tài khoản Google' : 'Choose a Google account'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setGmailPickerOpen(false)}
              className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {GMAIL_QUICK_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                data-testid={`gmail-quick-account-${acc.email}`}
                onClick={() => onSelectAccount(acc)}
                className="w-full p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-left flex items-center justify-between gap-3 transition-all hover:border-[var(--coral)] hover:shadow-sm cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 text-white shadow-sm"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    {acc.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate text-[var(--text)]">
                      {acc.fullName}
                    </div>
                    <div className="text-[11px] truncate text-[var(--text-muted)]">
                      {acc.email}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] shrink-0">
                  {lang === 'vi' ? 'Tiếp tục' : 'Continue'}
                </span>
              </button>
            ))}
          </div>

          {!customGmailMode ? (
            <button
              type="button"
              data-testid="use-another-gmail-btn"
              onClick={() => setCustomGmailMode(true)}
              className="w-full py-2 px-3 rounded-xl border border-dashed border-[var(--border)] hover:border-[var(--coral)] text-xs font-bold text-[var(--primary)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {lang === 'vi'
                  ? 'Sử dụng địa chỉ Google khác'
                  : 'Use another Google account'}
              </span>
            </button>
          ) : (
            <form
              onSubmit={onSubmitCustomGmail}
              className="space-y-2.5 pt-2 border-t border-[var(--border)]"
            >
              <input
                type="text"
                value={customGmailName}
                onChange={(e) => setCustomGmailName(e.target.value)}
                placeholder={lang === 'vi' ? 'Họ và tên hiển thị' : 'Display name'}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)] outline-none focus:border-[var(--coral)]"
              />
              <input
                type="email"
                required
                data-testid="custom-gmail-input"
                value={customGmailAddress}
                onChange={(e) => setCustomGmailAddress(e.target.value)}
                placeholder="tenban@gmail.com"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)] outline-none focus:border-[var(--coral)]"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  data-testid="custom-gmail-submit-btn"
                  className="btn-primary flex-1 py-2 px-3 !rounded-xl text-xs font-bold cursor-pointer"
                >
                  {lang === 'vi' ? 'Xác nhận' : 'Confirm'}
                </button>
                <button
                  type="button"
                  onClick={() => setCustomGmailMode(false)}
                  className="py-2 px-3 rounded-xl text-xs font-semibold border border-[var(--border)] text-[var(--text-muted)] cursor-pointer"
                >
                  {lang === 'vi' ? 'Hủy' : 'Cancel'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
