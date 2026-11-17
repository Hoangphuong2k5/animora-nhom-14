import React, { useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AuthMode, Language, UserAccount } from '@/types';
import { translations } from '@/data/translations';
import { useAuthFlows } from './shared/useAuthFlows';
import { useAccountManagement } from './shared/useAccountManagement';
import { AuthFeedbackBanners } from './shared/AuthFeedbackBanners';
import { AuthModeContent } from './shared/AuthModeContent';
import { LoginModalBrandSidebar } from './LoginModalBrandSidebar';

interface LoginModalProps {
  lang: Language;
  isOpen: boolean;
  initialMode?: AuthMode;
  currentUser: UserAccount | null;
  registeredUsers: UserAccount[];
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  onRegisterSuccess: (user: UserAccount) => void;
  onUpdateUser: (user: UserAccount) => void;
  onLogout: () => void;
  onResetPasswordSuccess?: (identifier: string, newPassword: string) => void;
}

export const LoginModal = ({
  lang,
  isOpen,
  initialMode = 'login',
  currentUser,
  registeredUsers,
  onClose,
  onLoginSuccess,
  onRegisterSuccess,
  onUpdateUser,
  onLogout,
  onResetPasswordSuccess,
}: LoginModalProps) => {
  const t = translations[lang].loginModal;

  const [mode, setMode] = useState<AuthMode>(
    currentUser ? 'account' : initialMode === 'account' ? 'login' : initialMode
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  const modalSyncKey = `${isOpen}|${initialMode}|${currentUser?.id ?? ''}`;
  const [syncedModalKey, setSyncedModalKey] = useState(modalSyncKey);
  if (syncedModalKey !== modalSyncKey) {
    setSyncedModalKey(modalSyncKey);
    if (isOpen) {
      setMode(
        currentUser ? 'account' : initialMode === 'account' ? 'login' : initialMode
      );
      setErrorMsg('');
      setSuccessBanner('');
    }
  }

  const authFlows = useAuthFlows({
    variant: 'modal',
    lang,
    mode,
    setMode,
    registeredUsers,
    onLoginSuccess,
    onRegisterSuccess,
    onResetPasswordSuccess,
    onCloseModal: onClose,
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
    }
    setMode(target);
  };

  const screenWrapperTestId =
    mode === 'login'
      ? 'login-screen'
      : mode === 'register'
      ? 'register-screen'
      : undefined;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        data-testid="auth-modal-dialog"
        className="animora-card sm:max-w-4xl p-0 gap-0 overflow-hidden max-h-[92vh] overflow-y-auto scrollbar-thin shadow-2xl border"
        style={{ borderColor: 'var(--border)' }}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>
            {mode === 'register'
              ? t.registerTitle
              : mode === 'forgot-password'
              ? t.forgotTitle
              : mode === 'account'
              ? t.accountTitle
              : t.title}
          </DialogTitle>
        </DialogHeader>

        {/* Close Button */}
        <button
          type="button"
          data-testid="auth-modal-close"
          onClick={onClose}
          aria-label="Close authentication modal"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
          style={{
            backgroundColor: 'var(--bg-soft)',
            color: 'var(--text)',
          }}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[540px]">
          <LoginModalBrandSidebar lang={lang} />

          {/* Right Side: Interactive Forms */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
            {mode !== 'account' && (
              <div className="mb-6">
                <div
                  className="grid grid-cols-2 p-1 rounded-2xl border max-w-xs"
                  style={{
                    backgroundColor: 'var(--bg-soft)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <button
                    type="button"
                    data-testid="auth-tab-login"
                    onClick={() => switchMode('login')}
                    className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                      mode === 'login' || mode === 'forgot-password'
                        ? 'shadow-sm'
                        : 'opacity-75'
                    }`}
                    style={{
                      backgroundColor:
                        mode === 'login' || mode === 'forgot-password'
                          ? 'var(--primary)'
                          : 'transparent',
                      color:
                        mode === 'login' || mode === 'forgot-password'
                          ? 'var(--on-primary)'
                          : 'var(--text)',
                    }}
                  >
                    {t.tabLogin}
                  </button>
                  <button
                    type="button"
                    data-testid="auth-tab-register"
                    onClick={() => switchMode('register')}
                    className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                      mode === 'register' ? 'shadow-sm' : 'opacity-75'
                    }`}
                    style={{
                      backgroundColor:
                        mode === 'register' ? 'var(--primary)' : 'transparent',
                      color:
                        mode === 'register' ? 'var(--on-primary)' : 'var(--text)',
                    }}
                  >
                    {t.tabRegister}
                  </button>
                </div>
              </div>
            )}

            <AuthFeedbackBanners errorMsg={errorMsg} successBanner={successBanner} />

            <div data-testid={screenWrapperTestId} className="space-y-4">
              {mode === 'forgot-password' && (
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold hover:underline cursor-pointer"
                  style={{ color: 'var(--primary)' }}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t.backToLogin}</span>
                </button>
              )}

              {mode !== 'account' && (
                <div className="space-y-1">
                  <h3
                    className="card-title text-2xl font-extrabold"
                    style={{ color: 'var(--text)' }}
                  >
                    {mode === 'register'
                      ? t.registerTitle
                      : mode === 'forgot-password'
                      ? t.forgotTitle
                      : t.title}
                  </h3>
                  <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
                    {mode === 'register'
                      ? t.registerSubtitle
                      : mode === 'forgot-password'
                      ? t.forgotSubtitle
                      : t.subtitle}
                  </p>
                </div>
              )}

              <AuthModeContent
                lang={lang}
                mode={mode}
                currentUser={currentUser}
                authFlows={authFlows}
                accountMgmt={accountMgmt}
                onSwitchMode={switchMode}
                onClearFeedback={clearFeedback}
                showDemoLoginButton={true}
                showAccountUserHeader={true}
                onLogout={() => {
                  onLogout();
                  onClose();
                }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
