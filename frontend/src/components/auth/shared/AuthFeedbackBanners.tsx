import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthFeedbackBannersProps {
  errorMsg: string;
  successBanner: string;
}

/** Shared error and success alert banners for AuthPage and LoginModal. */
export const AuthFeedbackBanners = ({
  errorMsg,
  successBanner,
}: AuthFeedbackBannersProps) => {
  return (
    <>
      {errorMsg && (
        <div
          data-testid="auth-error-banner"
          className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs font-bold flex items-center gap-2.5 animate-fadeIn"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successBanner && (
        <div
          data-testid="auth-success-banner"
          className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-fadeIn"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}
    </>
  );
};
