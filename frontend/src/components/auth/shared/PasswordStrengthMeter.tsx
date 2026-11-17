import React from 'react';
import { Check } from 'lucide-react';
import { Language } from '@/types';
import { evaluatePasswordStrength } from '@/utils/petLogic';

interface PasswordStrengthMeterProps {
  lang: Language;
  password: string;
  confirmPassword: string;
  showChecklist?: boolean;
}

/** Shared password strength meter using evaluatePasswordStrength. */
export const PasswordStrengthMeter = ({
  lang,
  password,
  confirmPassword,
  showChecklist = true,
}: PasswordStrengthMeterProps) => {
  if (password.length === 0) return null;

  const strength = evaluatePasswordStrength(password);
  const isMinLengthMet = password.length >= 6;
  const isConfirmMatch = password.length > 0 && password === confirmPassword;

  const labelColorClass =
    strength.level === 'weak'
      ? 'text-red-500'
      : strength.level === 'medium'
      ? 'text-amber-500'
      : 'text-emerald-500';

  const activeBarClass =
    strength.level === 'weak'
      ? 'bg-red-500'
      : strength.level === 'medium'
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  return (
    <div className="px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1.5 animate-fadeIn">
      <div className="flex items-center justify-between gap-3">
        <div className="grid grid-cols-4 gap-1.5 h-1.5 flex-1 max-w-[180px]">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`rounded-full transition-all duration-300 ${
                strength.score >= step
                  ? activeBarClass
                  : 'bg-stone-200 dark:bg-stone-700'
              }`}
            />
          ))}
        </div>

        <span className={`text-[11px] font-extrabold shrink-0 ${labelColorClass}`}>
          {lang === 'vi' ? strength.labelVi : strength.labelEn}
        </span>
      </div>

      {showChecklist && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div
            className={`inline-flex items-center gap-1 font-medium ${
              isMinLengthMet
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-[var(--text-muted)]'
            }`}
          >
            <Check className="w-3 h-3 shrink-0" />
            <span>{lang === 'vi' ? 'Tối thiểu 6 ký tự' : 'Min 6 characters'}</span>
          </div>
          <div
            className={`inline-flex items-center gap-1 font-medium ${
              isConfirmMatch
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-[var(--text-muted)]'
            }`}
          >
            <Check className="w-3 h-3 shrink-0" />
            <span>{lang === 'vi' ? 'Mật khẩu khớp nhau' : 'Passwords match'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
