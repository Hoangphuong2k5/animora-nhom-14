import React, { useState } from 'react';
import {
  CalendarCheck,
  Home,
  LogOut,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Language, AuthMode, UserAccount, PageId } from '@/types';
import { translations } from '@/data/translations';
import { ANIMORA_LOGO_SRC } from './shared/authConstants';
import { useAuthFlows } from './shared/useAuthFlows';
import { useAccountManagement } from './shared/useAccountManagement';
import { AuthFeedbackBanners } from './shared/AuthFeedbackBanners';
import { AuthModeContent } from './shared/AuthModeContent';
import { AuthShowcasePanel } from './AuthShowcasePanel';
import { TermsPrivacyDialog } from './TermsPrivacyDialog';

interface AuthPageProps {
  lang: Language;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onToggleLang?: () => void;
  initialMode: AuthMode;
  currentUser: UserAccount | null;
  registeredUsers: UserAccount[];
  onNavigate: (page: PageId) => void;
  onLoginSuccess: (user: UserAccount) => void;
  onRegisterSuccess: (newUser: UserAccount) => void;
  onUpdateUser: (updatedUser: UserAccount) => void;
  onLogout: () => void;
  onResetPasswordSuccess: (identifier: string, newPassword: string) => void;
}

export const AuthPage = ({
  lang,
  darkMode = false,
  onToggleDarkMode,
  onToggleLang,
  initialMode,
  currentUser,
  registeredUsers,
  onNavigate,
  onLoginSuccess,
  onRegisterSuccess,
  onUpdateUser,
  onLogout,
  onResetPasswordSuccess,
}: AuthPageProps) => {
  const t = translations[lang].loginModal;

  const [mode, setMode] = useState<AuthMode>(currentUser ? 'account' : initialMode);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(
    initialMode === 'register' ? 1 : 0
  );
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [termsModalType, setTermsModalType] = useState<'terms' | 'privacy'>('terms');
  const [errorMsg, setErrorMsg] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  const propSyncKey = `${initialMode}|${currentUser?.id ?? ''}`;
  const [syncedPropKey, setSyncedPropKey] = useState(propSyncKey);
  if (syncedPropKey !== propSyncKey) {
    setSyncedPropKey(propSyncKey);
    if (currentUser && initialMode === 'account') {
      setMode('account');
    } else if (!currentUser && initialMode === 'account') {
      setMode('login');
    } else {
      setMode(initialMode);
      setActiveSlideIndex(initialMode === 'register' ? 1 : 0);
    }
    setErrorMsg('');
    setSuccessBanner('');
  }

  const authFlows = useAuthFlows({
    variant: 'page',
    lang,
    mode,
    setMode,
    registeredUsers,
    onLoginSuccess,
    onRegisterSuccess,
    onResetPasswordSuccess,
    onNavigate,
    setErrorMsg,
    setSuccessBanner,
  });

  const accountMgmt = useAccountManagement({
    lang,
    currentUser,
    onUpdateUser,
    setErrorMsg,
    setSuccessBanner,
  });

  const clearFeedback = () => {
    setErrorMsg('');
    setSuccessBanner('');
  };

  const switchMode = (target: AuthMode) => {
    clearFeedback();
    authFlows.resetGmailPicker();
    if (target === 'forgot-password') {
      authFlows.setForgotStep(1);
      setMode('forgot-password');
    } else if (target === 'login') {
      setMode('login');
      setActiveSlideIndex(0);
      onNavigate('login');
    } else if (target === 'register') {
      setMode('register');
      setActiveSlideIndex(1);
      onNavigate('register');
    } else {
      setMode('account');
      onNavigate('account');
    }
  };

  return (
    <div
      data-testid={`page-${mode}`}
      className="min-h-screen w-full flex flex-col lg:flex-row items-stretch justify-between transition-colors duration-300"
      style={{
        backgroundColor: 'var(--surface)',
        color: 'var(--text)',
      }}
    >
      {/* LEFT COLUMN: Auth Form Container */}
      <div className="w-full lg:w-[48%] xl:w-[45%] flex flex-col justify-between items-center px-6 sm:px-10 lg:px-12 py-5 sm:py-6 relative z-10 min-h-screen">
        {/* Center Form Body */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-1">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-4">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              title={lang === 'vi' ? 'Quay về Trang chủ Animora' : 'Back to Animora Home'}
              className="group inline-flex items-center gap-2.5 mb-2.5 cursor-pointer focus:outline-none"
            >
              <div
                className="relative flex items-center justify-center w-10 h-10 rounded-full shadow-sm group-hover:scale-105 transition-transform overflow-hidden border-2"
                style={{
                  borderColor: 'var(--primary)',
                  backgroundColor: 'transparent',
                }}
              >
                <img
                  loading="lazy"
                  decoding="async"
                  src={ANIMORA_LOGO_SRC}
                  alt="Animora"
                  className="w-full h-full object-cover !filter-none"
                />
              </div>
              <span className="font-heading text-2xl font-extrabold tracking-tight text-[var(--primary)]">
                Animora
              </span>
            </button>

            {currentUser ? (
              <div
                data-testid="auth-already-logged-in"
                className="w-full rounded-[24px] border p-6 text-center space-y-4 shadow-sm mt-2"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                }}
              >
                <div
                  className="w-16 h-16 rounded-full mx-auto flex items-center justify-center font-extrabold text-xl shadow-sm"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--on-primary)',
                  }}
                >
                  {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                </div>

                <div className="space-y-1">
                  <span
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide"
                    style={{
                      backgroundColor: 'rgba(46, 125, 50, 0.12)',
                      color: '#2e7d32',
                    }}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>{lang === 'vi' ? 'ĐÃ ĐĂNG NHẬP' : 'ACTIVE SESSION'}</span>
                  </span>
                  <h2 className="font-heading text-xl sm:text-2xl font-extrabold" style={{ color: 'var(--text)' }}>
                    {currentUser.fullName}
                  </h2>
                  <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                    {currentUser.email}
                  </p>
                </div>

                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {lang === 'vi'
                    ? 'Bạn đang trong phiên đăng nhập. Bạn có thể chuyển đến trang quản lý tài khoản hoặc xem các lịch hẹn chăm sóc thú cưng.'
                    : 'You are currently signed in. You can access your account dashboard or view your pet care appointments.'}
                </p>

                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    type="button"
                    data-testid="auth-go-account-btn"
                    onClick={() => onNavigate('account')}
                    className="btn-primary w-full py-2.5 px-4 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <User className="w-4 h-4" />
                    <span>{lang === 'vi' ? 'Quản lý tài khoản' : 'Go to My Account'}</span>
                  </button>

                  <button
                    type="button"
                    data-testid="auth-go-bookings-btn"
                    onClick={() => onNavigate('my-bookings')}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                      backgroundColor: 'var(--surface)',
                    }}
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>{lang === 'vi' ? 'Xem lịch hẹn của tôi' : 'My Bookings'}</span>
                  </button>

                  <button
                    type="button"
                    data-testid="auth-go-home-btn"
                    onClick={() => onNavigate('home')}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                      backgroundColor: 'transparent',
                    }}
                  >
                    <Home className="w-4 h-4" />
                    <span>{lang === 'vi' ? 'Quay về Trang chủ' : 'Back to Home'}</span>
                  </button>

                  <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                    <button
                      type="button"
                      data-testid="auth-page-logout-btn"
                      onClick={() => {
                        onLogout();
                        setMode('login');
                      }}
                      className="w-full py-2 px-4 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{lang === 'vi' ? 'Đăng xuất tài khoản này' : 'Sign out'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {mode === 'login' && (
                  <>
                    <h1 className="font-heading text-[26px] sm:text-[30px] font-extrabold tracking-tight leading-tight mb-0.5 text-[var(--text)]">
                      {lang === 'vi' ? 'Chào Mừng Trở Lại' : 'Welcome Back'}
                    </h1>
                    <p className="text-[13.5px] font-medium text-[var(--text-muted)]">
                      {lang === 'vi'
                        ? 'Đăng nhập để nhận ưu đãi và quản lý chăm sóc thú cưng'
                        : "Log in to access your pet's care dashboard"}
                    </p>
                  </>
                )}

                {mode === 'register' && (
                  <>
                    <h1 className="font-heading text-[26px] sm:text-[30px] font-extrabold tracking-tight leading-tight mb-0.5 text-[var(--text)]">
                      {lang === 'vi' ? 'Tạo Tài Khoản Mới' : 'Create Account'}
                    </h1>
                    <p className="text-[13.5px] font-medium text-[var(--text-muted)]">
                      {lang === 'vi'
                        ? 'Đồng hành cùng Animora chăm sóc bé cưng hạnh phúc mỗi ngày'
                        : 'Join the Animora pet care community today'}
                    </p>
                  </>
                )}

                {mode === 'forgot-password' && (
                  <>
                    <h1 className="font-heading text-[26px] sm:text-[30px] font-extrabold tracking-tight leading-tight mb-0.5 text-[var(--text)]">
                      {t.forgotTitle}
                    </h1>
                    <p className="text-[13.5px] font-medium text-[var(--text-muted)]">
                      {t.forgotSubtitle}
                    </p>
                  </>
                )}

                {/* Thanh chuyển Tab đôi: Đăng nhập | Đăng ký cùng 1 chỗ */}
                {(mode === 'login' || mode === 'register') && (
                  <div
                    data-testid="auth-mode-tabs"
                    className="w-full mt-3.5 p-1 rounded-2xl border grid grid-cols-2 gap-1"
                    style={{
                      backgroundColor: 'var(--bg)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <button
                      type="button"
                      data-testid="auth-tab-login"
                      onClick={() => switchMode('login')}
                      className="py-2 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer"
                      style={{
                        backgroundColor:
                          mode === 'login' ? 'var(--primary)' : 'transparent',
                        color:
                          mode === 'login' ? 'var(--on-primary)' : 'var(--text-muted)',
                      }}
                    >
                      {lang === 'vi' ? 'Đăng nhập' : 'Sign In'}
                    </button>
                    <button
                      type="button"
                      data-testid="auth-tab-register"
                      onClick={() => switchMode('register')}
                      className="py-2 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer"
                      style={{
                        backgroundColor:
                          mode === 'register' ? 'var(--primary)' : 'transparent',
                        color:
                          mode === 'register'
                            ? 'var(--on-primary)'
                            : 'var(--text-muted)',
                      }}
                    >
                      {lang === 'vi' ? 'Đăng ký tài khoản' : 'Create Account'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {!currentUser && (
            <>
              <AuthFeedbackBanners errorMsg={errorMsg} successBanner={successBanner} />

              <AuthModeContent
                lang={lang}
                mode={mode}
                currentUser={currentUser}
                authFlows={authFlows}
                accountMgmt={accountMgmt}
                onSwitchMode={switchMode}
                onClearFeedback={clearFeedback}
                onOpenTermsModal={(type) => {
                  setTermsModalType(type);
                  setTermsModalOpen(true);
                }}
                onLogout={() => {
                  onLogout();
                  onNavigate('login');
                }}
              />
            </>
          )}
        </div>

        <div className="w-full max-w-[420px] text-center text-[11px] text-[var(--text-muted)] pt-4 pb-2">
          © {new Date().getFullYear()} Animora Pet Care. All rights reserved.
        </div>
      </div>

      {/* RIGHT COLUMN: High-Res Warm Puppy Showcase */}
      <AuthShowcasePanel
        lang={lang}
        activeSlideIndex={activeSlideIndex}
        onSelectSlide={setActiveSlideIndex}
      />

      <TermsPrivacyDialog
        lang={lang}
        open={termsModalOpen}
        onOpenChange={setTermsModalOpen}
        type={termsModalType}
      />
    </div>
  );
};
