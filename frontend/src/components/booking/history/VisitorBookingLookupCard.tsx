import React from 'react';
import { AlertCircle, LogIn, Search } from 'lucide-react';
import { Booking, Language, PageId } from '@/types';
import {
  cleanBookingPhoneDigits,
  formatBookingPhoneOnBlur,
  validateBookingPhoneDigits,
} from '@/data/serviceBookingData';

interface VisitorBookingLookupCardProps {
  lang: Language;
  darkMode: boolean;
  openDetailCode: string | null;
  verifiedVisitorBooking: Booking | null;
  lookupCode: string;
  lookupPhoneDigits: string;
  isLookupPhoneFocused: boolean;
  lookupCodeTouched: boolean;
  lookupPhoneTouched: boolean;
  lookupError: string | null;
  honeypotRef: React.RefObject<HTMLInputElement | null>;
  onChangeCode: (value: string) => void;
  onBlurCode: () => void;
  onChangePhoneDigits: (digits: string) => void;
  onFocusPhone: () => void;
  onBlurPhone: () => void;
  onSubmitLookup: (e: React.FormEvent) => void;
  onNavigate: (page: PageId) => void;
  renderVerifiedCard: (bk: Booking) => React.ReactNode;
}

export const VisitorBookingLookupCard = ({
  lang,
  darkMode,
  openDetailCode,
  verifiedVisitorBooking,
  lookupCode,
  lookupPhoneDigits,
  isLookupPhoneFocused,
  lookupCodeTouched,
  lookupPhoneTouched,
  lookupError,
  honeypotRef,
  onChangeCode,
  onBlurCode,
  onChangePhoneDigits,
  onFocusPhone,
  onBlurPhone,
  onSubmitLookup,
  onNavigate,
  renderVerifiedCard,
}: VisitorBookingLookupCardProps) => {
  const isVi = lang === 'vi';
  const errorColor = darkMode ? '#FDA29B' : '#B42318';

  return (
    <div className="max-w-[860px] mx-auto space-y-8">
      <div
        data-testid="visitor-lookup-card"
        className="rounded-[24px] border p-6 sm:p-8 space-y-6"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div className="space-y-1.5">
          <h2
            className="font-heading text-2xl sm:text-3xl font-extrabold"
            style={{ color: 'var(--primary)' }}
          >
            {isVi ? 'Tra cứu lịch hẹn' : 'Look up a booking'}
          </h2>
          <p className="text-sm sm:text-base" style={{ color: 'var(--text-muted)' }}>
            {isVi
              ? 'Nhập mã đặt lịch và số điện thoại đã đăng ký để xem chi tiết, đổi giờ hoặc hủy lịch hẹn.'
              : 'Enter your booking code and registered phone number to view details, reschedule, or cancel.'}
          </p>
        </div>

        {openDetailCode && !verifiedVisitorBooking && (
          <div
            data-testid="unverified-url-notice"
            role="alert"
            className="p-3.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-2.5"
            style={{
              backgroundColor: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--primary)',
            }}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              {isVi
                ? `Vì lý do bảo mật, vui lòng nhập số điện thoại của mã ${openDetailCode} để xác thực chủ sở hữu.`
                : `For privacy protection, please enter the phone number for ${openDetailCode} to verify ownership.`}
            </span>
          </div>
        )}

        <form onSubmit={onSubmitLookup} noValidate className="space-y-5">
          <input
            ref={honeypotRef}
            type="text"
            name="animora_lookup_hp"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '-9999px',
              opacity: 0,
              pointerEvents: 'none',
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="lookup-booking-code"
                className="block text-sm font-bold mb-1.5"
                style={{ color: 'var(--text)' }}
              >
                {isVi ? 'Mã đặt lịch *' : 'Booking code *'}
              </label>
              <input
                id="lookup-booking-code"
                data-testid="lookup-code-input"
                type="text"
                value={lookupCode}
                onChange={(e) => onChangeCode(e.target.value)}
                onBlur={onBlurCode}
                placeholder="DL-2026-0001"
                className="form-input w-full font-bold uppercase tracking-wider"
              />
              {lookupCodeTouched && !lookupCode.trim() && (
                <p
                  role="alert"
                  aria-live="polite"
                  className="mt-1.5 text-xs font-bold flex items-center gap-1"
                  style={{ color: errorColor }}
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {isVi
                      ? 'Vui lòng nhập mã đặt lịch'
                      : 'Please enter booking code'}
                  </span>
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="lookup-booking-phone"
                className="block text-sm font-bold mb-1.5"
                style={{ color: 'var(--text)' }}
              >
                {isVi ? 'Số điện thoại *' : 'Phone number *'}
              </label>
              <input
                id="lookup-booking-phone"
                data-testid="lookup-phone-input"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={
                  isLookupPhoneFocused
                    ? lookupPhoneDigits
                    : formatBookingPhoneOnBlur(lookupPhoneDigits)
                }
                onChange={(e) =>
                  onChangePhoneDigits(cleanBookingPhoneDigits(e.target.value))
                }
                onPaste={(e) => {
                  e.preventDefault();
                  const pasted = e.clipboardData.getData('text');
                  onChangePhoneDigits(cleanBookingPhoneDigits(pasted));
                }}
                onFocus={onFocusPhone}
                onBlur={onBlurPhone}
                placeholder="0337 203 332"
                className="form-input w-full font-bold tabular-nums"
              />
              {lookupPhoneTouched &&
                validateBookingPhoneDigits(lookupPhoneDigits, lang) && (
                  <p
                    role="alert"
                    aria-live="polite"
                    className="mt-1.5 text-xs font-bold flex items-center gap-1"
                    style={{ color: errorColor }}
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {validateBookingPhoneDigits(lookupPhoneDigits, lang)}
                    </span>
                  </p>
                )}
            </div>
          </div>

          {lookupError && (
            <div
              data-testid="lookup-error-alert"
              role="alert"
              aria-live="assertive"
              className="p-3.5 rounded-xl border text-sm font-bold flex items-center gap-2"
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: errorColor,
                color: errorColor,
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{lookupError}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <button
              type="submit"
              data-testid="lookup-submit-btn"
              className="btn-primary min-h-[48px] px-7 py-3 text-sm font-bold inline-flex items-center justify-center gap-2 shadow-md cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
            >
              <Search className="w-4 h-4" />
              <span>{isVi ? 'Tra cứu lịch hẹn' : 'Look up booking'}</span>
            </button>

            <button
              type="button"
              data-testid="lookup-login-link-btn"
              onClick={() => onNavigate('login')}
              className="min-h-[44px] px-4 py-2 text-sm font-extrabold inline-flex items-center justify-center gap-2 underline cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B] rounded-lg"
              style={{ color: 'var(--primary)' }}
            >
              <LogIn className="w-4 h-4" />
              <span>
                {isVi
                  ? 'Đăng nhập để xem tất cả lịch hẹn'
                  : 'Log in to see all your bookings'}
              </span>
            </button>
          </div>
        </form>
      </div>

      {verifiedVisitorBooking && (
        <div data-testid="visitor-lookup-result" className="space-y-4">
          <h3
            className="font-heading text-xl font-bold"
            style={{ color: 'var(--primary)' }}
          >
            {isVi ? 'Kết quả tra cứu' : 'Lookup result'}
          </h3>
          {renderVerifiedCard(verifiedVisitorBooking)}
        </div>
      )}
    </div>
  );
};

