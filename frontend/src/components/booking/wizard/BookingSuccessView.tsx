import React from 'react';
import { Calendar, Check, CheckCircle2, Clock, Copy } from 'lucide-react';
import { Booking, Language, PageId, UserAccount } from '@/types';
import { ServiceEntity } from '@/data/servicesData';
import {
  formatBookingPhoneOnBlur,
  formatEstimatedPriceText,
  formatIsoDateForDisplay,
  getPetTypeLabel,
  getPreferredContactLabel,
  resolveServiceBySlugOrName,
} from '@/data/serviceBookingData';
import { ServiceBookingDraft } from '@/hooks/booking/useServiceBookingWizard';

interface BookingSuccessViewProps {
  lang: Language;
  confirmedBooking: Booking | null;
  selectedService: ServiceEntity;
  formState: ServiceBookingDraft;
  currentUser: UserAccount | null;
  copiedCode: boolean;
  onCopyBookingCode: (code: string) => void;
  onClearDraft: () => void;
  onNavigate: (page: PageId) => void;
  onNavigateBookingUrl: (path: string) => void;
}

export const BookingSuccessView = ({
  lang,
  confirmedBooking,
  selectedService,
  formState,
  currentUser,
  copiedCode,
  onCopyBookingCode,
  onClearDraft,
  onNavigate,
  onNavigateBookingUrl,
}: BookingSuccessViewProps) => {
  const isVi = lang === 'vi';
  const bk: Booking = confirmedBooking || {
    id: 'bk-demo',
    code: 'DL-2026-0001',
    serviceSlug: selectedService.slug,
    service: selectedService.name.vi,
    petType: formState.petType,
    petName: formState.petName || 'Mây Mây',
    weightRange: formState.weightRange,
    date: formState.date,
    timeSlot: formState.timeSlot || '10:00',
    fullName: formState.fullName || 'Nguyễn Minh Anh',
    phone: formatBookingPhoneOnBlur(formState.phoneDigits || '0912345678'),
    email: formState.email || 'minhanh@animora.vn',
    preferredContact: formState.preferredContact,
    status: 'Mới',
    createdAt: new Date().toISOString(),
  };

  const bkService = resolveServiceBySlugOrName(bk.serviceSlug || bk.service);
  const contactMethodLabel = getPreferredContactLabel(bk.preferredContact, lang);

  return (
    <div
      data-testid="page-booking-success"
      className="pt-20 pb-8 shared-container"
    >
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs sm:text-sm mb-4"
        style={{ color: 'var(--text-muted)' }}
      >
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="hover:underline font-semibold cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B] rounded"
        >
          {isVi ? 'Trang chủ' : 'Home'}
        </button>
        <span aria-hidden="true">›</span>
        <button
          type="button"
          onClick={() => onNavigateBookingUrl('/dat-lich')}
          className="hover:underline font-semibold cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B] rounded"
        >
          {isVi ? 'Đặt lịch' : 'Book Service'}
        </button>
        <span aria-hidden="true">›</span>
        <span className="font-bold" style={{ color: 'var(--primary)' }}>
          {isVi ? 'Hoàn tất' : 'Confirmed'}
        </span>
      </nav>

      <div
        className="max-w-3xl mx-auto rounded-[24px] border p-6 sm:p-8 text-center space-y-5"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm"
            style={{
              backgroundColor: 'var(--surface-2)',
              color: 'var(--primary)',
            }}
          >
            <CheckCircle2 className="w-7 h-7 stroke-[2.4]" />
          </div>

          <h1
            className="font-heading font-extrabold leading-tight text-2xl sm:text-3xl"
            style={{ color: 'var(--primary)' }}
          >
            {isVi
              ? 'Đã nhận lịch hẹn của bạn!'
              : 'We have received your appointment!'}
          </h1>
          <p
            className="text-xs sm:text-sm max-w-lg mx-auto"
            style={{ color: 'var(--text-muted)' }}
          >
            {isVi
              ? `Chúng tôi sẽ liên hệ xác nhận qua ${contactMethodLabel} trong thời gian sớm nhất.`
              : `We will contact you via ${contactMethodLabel} as soon as possible to confirm.`}
          </p>
        </div>

        <div
          className="max-w-md mx-auto rounded-xl border px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap"
          style={{
            backgroundColor: 'var(--surface-2)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="text-left">
            <span
              className="block text-[10px] font-bold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              {isVi ? 'MÃ LỊCH HẸN' : 'BOOKING CODE'}
            </span>
            <span
              data-testid="booking-success-code"
              className="font-heading text-lg sm:text-xl font-extrabold tracking-wider tabular-nums"
              style={{ color: 'var(--primary)' }}
            >
              {bk.code || 'DL-2026-0001'}
            </span>
          </div>
          <button
            type="button"
            data-testid="copy-booking-code-btn"
            onClick={() => onCopyBookingCode(bk.code || 'DL-2026-0001')}
            className="h-9 px-3.5 rounded-full border text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--primary)',
            }}
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{isVi ? 'Đã sao chép' : 'Copied'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{isVi ? 'Sao chép mã' : 'Copy code'}</span>
              </>
            )}
          </button>
        </div>

        <div
          className="text-left rounded-xl border p-5 space-y-3.5"
          style={{
            backgroundColor: 'var(--bg)',
            borderColor: 'var(--border)',
          }}
        >
          <h2
            className="font-heading text-lg font-bold pb-2.5 border-b"
            style={{ color: 'var(--primary)', borderColor: 'var(--border)' }}
          >
            {isVi ? 'Tóm tắt lịch hẹn' : 'Booking summary'}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-3.5 text-xs sm:text-sm">
            <div>
              <span
                className="block text-[11px] font-bold"
                style={{ color: 'var(--text-muted)' }}
              >
                {isVi ? 'Dịch vụ' : 'Service'}
              </span>
              <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                {bkService.name[lang]} ({bkService.duration[lang]})
              </span>
            </div>

            <div>
              <span
                className="block text-[11px] font-bold"
                style={{ color: 'var(--text-muted)' }}
              >
                {isVi ? 'Ngày & giờ hẹn' : 'Date & time'}
              </span>
              <span
                className="font-bold text-sm tabular-nums"
                style={{ color: 'var(--text)' }}
              >
                {formatIsoDateForDisplay(bk.date, lang)} · {bk.timeSlot || '10:00'}
                {bk.durationMinutes && bk.durationMinutes < 1440 && !bk.timeSlot?.includes('(') ? (
                  <span className="ml-1 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
                    ({bk.durationMinutes} {isVi ? 'phút' : 'mins'})
                  </span>
                ) : null}
              </span>
            </div>

            <div>
              <span
                className="block text-[11px] font-bold"
                style={{ color: 'var(--text-muted)' }}
              >
                {isVi ? 'Thông tin của bé' : 'Pet details'}
              </span>
              <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                {bk.petName || getPetTypeLabel(bk.petType, lang)}
              </span>
            </div>

            <div>
              <span
                className="block text-[11px] font-bold"
                style={{ color: 'var(--text-muted)' }}
              >
                {isVi ? 'Chi phí dự kiến' : 'Estimated price'}
              </span>
              <span
                className="font-extrabold text-sm"
                style={{ color: 'var(--primary)' }}
              >
                {formatEstimatedPriceText(bkService, bk.weightRange, lang)}
              </span>
            </div>

            <div>
              <span
                className="block text-[11px] font-bold"
                style={{ color: 'var(--text-muted)' }}
              >
                {isVi ? 'Người đặt lịch' : 'Booked by'}
              </span>
              <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                {bk.fullName} · {bk.phone}
              </span>
            </div>

            {bk.email && (
              <div>
                <span
                  className="block text-[11px] font-bold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Email
                </span>
                <span
                  className="font-bold text-sm break-all"
                  style={{ color: 'var(--text)' }}
                >
                  {bk.email}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2.5 pt-1">
          <button
            type="button"
            data-testid="success-view-my-bookings-btn"
            onClick={() => {
              const codeParam = bk.code || 'DL-2026-0001';
              const targetPath = currentUser
                ? '/lich-hen'
                : `/lich-hen?code=${encodeURIComponent(codeParam)}`;
              onNavigateBookingUrl(targetPath);
            }}
            className="btn-secondary min-h-[42px] px-5 py-2 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
          >
            <Clock className="w-4 h-4" />
            <span>{isVi ? 'Xem lịch hẹn của tôi' : 'View my bookings'}</span>
          </button>

          <button
            type="button"
            data-testid="success-book-another-btn"
            onClick={() => {
              onClearDraft();
              onNavigateBookingUrl('/dat-lich');
            }}
            className="btn-secondary min-h-[48px] px-6 py-3 text-sm font-bold inline-flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
          >
            <Calendar className="w-4 h-4" />
            <span>
              {isVi ? 'Đặt thêm lịch khác' : 'Book another appointment'}
            </span>
          </button>

          <button
            type="button"
            data-testid="success-back-home-btn"
            onClick={() => onNavigate('home')}
            className="btn-primary min-h-[48px] px-7 py-3 text-sm font-bold inline-flex items-center justify-center gap-2 w-full sm:w-auto shadow-md cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
          >
            <span>{isVi ? 'Về trang chủ' : 'Back to home'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

