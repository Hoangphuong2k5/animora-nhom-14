import React from 'react';
import {
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Phone,
  RefreshCw,
  RotateCcw,
  Star,
  XCircle,
} from 'lucide-react';
import { Booking, Language, Pet } from '@/types';
import { ServiceEntity } from '@/data/servicesData';
import {
  formatEstimatedPriceText,
  getPetTypeLabel,
  resolveServiceBySlugOrName,
} from '@/data/serviceBookingData';
import {
  getBookingModificationPolicy,
  formatBookingDateWithWeekday,
  getBookingTabCategory,
  getUpcomingCountdownText,
  isOverdueBooking,
  maskBookingEmail,
  maskBookingPhone,
} from '@/utils/bookingHistoryUtils';
import { ServiceIcon } from '../shared/ServiceIcon';
import { BookingStatusPill } from './BookingStatusPill';

interface BookingCardProps {
  booking: Booking;
  lang: Language;
  darkMode: boolean;
  referenceNow: Date;
  pets?: Pet[];
  copiedCode: string | null;
  onOpenDetail: (bk: Booking, triggerEl?: HTMLElement | null) => void;
  onCopyCode: (code: string, e?: React.MouseEvent) => void;
  onReschedule: (bk: Booking, triggerEl?: HTMLElement | null) => void;
  onCancel: (bk: Booking, triggerEl?: HTMLElement | null) => void;
  onDownloadIcs?: (bk: Booking, e?: React.MouseEvent) => void;
  onRebook: (bk: Booking, e?: React.MouseEvent) => void;
  onReview?: (bk: Booking, triggerEl?: HTMLElement | null) => void;
}

export const BookingCard = ({
  booking: bk,
  lang,
  darkMode,
  referenceNow,
  copiedCode,
  onOpenDetail,
  onCopyCode,
  onReschedule,
  onCancel,
  onRebook,
  onReview,
}: BookingCardProps) => {
  const isVi = lang === 'vi';
  const srv: ServiceEntity = resolveServiceBySlugOrName(
    bk.serviceSlug || bk.service
  );
  const tabCat = getBookingTabCategory(bk, referenceNow);
  const countdown =
    tabCat === 'upcoming'
      ? getUpcomingCountdownText(bk, lang, referenceNow)
      : null;
  const policy = getBookingModificationPolicy(bk, referenceNow);
  const isOverdue = isOverdueBooking(bk, referenceNow);
  const codeStr = bk.code || bk.id;
  const isBetween3And24h =
    policy.reason === 'within_24h' && tabCat === 'upcoming';
  const isUnder3hFee50 =
    policy.reason === 'under_3h_fee_50' && tabCat === 'upcoming';
  const within24hNotice = isVi
    ? 'Trong khoảng 3–24 giờ trước giờ hẹn, vui lòng gọi hotline để được hỗ trợ đổi hoặc hủy lịch.'
    : 'Within 3–24 hours of the appointment, please call hotline to reschedule or cancel.';
  const under3hNotice = isVi
    ? `Dưới 3 giờ: Hủy lịch tính phí 50% (${policy.feeAmount.toLocaleString('vi-VN')}đ). Khóa đổi giờ.`
    : `Under 3h: Cancellation incurs 50% fee (${policy.feeAmount.toLocaleString('vi-VN')}đ). Reschedule locked.`;

  return (
    <article
      data-testid={`booking-card-${codeStr}`}
      className="rounded-[20px] border p-[20px] transition-all"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow)',
      }}
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <button
          type="button"
          data-testid={`booking-card-header-${codeStr}`}
          onClick={(e) => onOpenDetail(bk, e.currentTarget)}
          className="flex-1 min-w-0 text-left flex items-start gap-4 group cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B] rounded-xl"
        >
          <div
            className="w-[56px] h-[56px] rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
            style={{
              backgroundColor: 'var(--surface-2)',
              color: 'var(--primary)',
            }}
          >
            <ServiceIcon type={srv.icon} className="w-6 h-6" />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <h3
              className="font-heading text-[20px] font-bold leading-snug break-words"
              style={{ color: 'var(--primary)' }}
            >
              {srv.name[lang]}
            </h3>

            <p className="text-sm font-bold break-words" style={{ color: 'var(--text)' }}>
              {isVi
                ? `Bé ${bk.petName || 'Cưng'} · ${getPetTypeLabel(bk.petType, lang)}`
                : `${bk.petName || 'Pet'} · ${getPetTypeLabel(bk.petType, lang)}`}
              {bk.doctorName ? ` · ${bk.doctorName}` : ''}
            </p>

            <div
              className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold pt-0.5"
              style={{ color: 'var(--text-muted)' }}
            >
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <Calendar
                  className="w-4 h-4 shrink-0"
                  style={{ color: 'var(--primary)' }}
                />
                <span>
                  {formatBookingDateWithWeekday(bk.date, bk.timeSlot, lang)}
                </span>
              </span>
            </div>

            <div
              data-testid={`booking-masked-contact-${codeStr}`}
              className="text-xs font-semibold flex flex-wrap items-center gap-x-2 gap-y-0.5 pt-0.5"
              style={{ color: 'var(--text-muted)' }}
            >
              <span className="tabular-nums">{maskBookingPhone(bk.phone)}</span>
              {bk.email && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{maskBookingEmail(bk.email)}</span>
                </>
              )}
            </div>
          </div>
        </button>

        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0">
          {isOverdue ? (
            <span
              data-testid={`booking-overdue-${codeStr}`}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border"
              style={{
                backgroundColor: '#FFF1E6',
                color: '#B45309',
                borderColor: '#FDBA74',
              }}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{isVi ? 'Quá giờ hẹn · chờ xử lý' : 'Overdue · pending'}</span>
            </span>
          ) : (
            <BookingStatusPill status={bk.status} lang={lang} darkMode={darkMode} />
          )}
          {countdown && (
            <span
              data-testid={`booking-countdown-${codeStr}`}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border"
              style={{
                backgroundColor: 'var(--bg)',
                color: 'var(--primary)',
                borderColor: 'var(--border)',
              }}
            >
              <Clock className="w-3 h-3 shrink-0" />
              <span>{countdown}</span>
            </span>
          )}
        </div>
      </div>

      {/* Booking Code Row */}
      <div
        className="mt-3 pt-3 border-t flex flex-wrap items-center justify-between gap-2"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-[14px] font-bold tabular-nums"
            style={{ color: 'var(--text-muted)' }}
          >
            {isVi ? 'Mã đặt lịch:' : 'Booking code:'}{' '}
            <strong style={{ color: 'var(--text)' }}>{codeStr}</strong>
          </span>
          <button
            type="button"
            data-testid={`copy-code-btn-${codeStr}`}
            onClick={(e) => onCopyCode(codeStr, e)}
            aria-label={
              isVi
                ? `Sao chép mã đặt lịch ${codeStr}`
                : `Copy booking code ${codeStr}`
            }
            className="min-h-[44px] min-w-[44px] sm:min-h-[34px] sm:min-w-[34px] px-2.5 py-1 rounded-full border text-xs font-bold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
              color: 'var(--primary)',
            }}
          >
            {copiedCode === codeStr ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{isVi ? 'Đã chép' : 'Copied'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{isVi ? 'Sao chép' : 'Copy'}</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {bk.paymentTiming && (
            <span
              className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: 'var(--border)',
                color: 'var(--primary)',
              }}
            >
              {bk.paymentTiming === 'prepaid'
                ? bk.paymentState === 'paid'
                  ? isVi
                    ? 'Đã trả trước'
                    : 'Prepaid'
                  : isVi
                  ? 'Trả trước'
                  : 'Prepay'
                : isVi
                ? 'Trả sau'
                : 'Postpaid'}
            </span>
          )}
          <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>
            {formatEstimatedPriceText(srv, bk.weightRange, lang)}
          </span>
        </div>
      </div>

      {/* Actions Row */}
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        {tabCat === 'upcoming' && (
          <>
            <button
              type="button"
              data-testid={`view-detail-btn-${codeStr}`}
              onClick={(e) => onOpenDetail(bk, e.currentTarget)}
              className="btn-secondary min-h-[44px] sm:min-h-[40px] px-4 py-1.5 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
            >
              <span>{isVi ? 'Xem chi tiết' : 'View details'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {policy.canReschedule && (
              <button
                type="button"
                data-testid={`reschedule-btn-${codeStr}`}
                onClick={(e) => onReschedule(bk, e.currentTarget)}
                className="btn-secondary min-h-[44px] sm:min-h-[40px] px-4 py-1.5 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isVi ? 'Đổi giờ' : 'Reschedule'}</span>
              </button>
            )}

            {policy.canCancel && (
              <button
                type="button"
                data-testid={`cancel-btn-${codeStr}`}
                onClick={(e) => onCancel(bk, e.currentTarget)}
                className="min-h-[44px] sm:min-h-[40px] px-4 py-1.5 rounded-full border text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition-colors hover:bg-red-500/10 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--border)',
                  color: darkMode ? '#FDA29B' : '#B42318',
                }}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{isVi ? 'Hủy lịch' : 'Cancel'}</span>
              </button>
            )}
          </>
        )}

        {tabCat === 'past' && (
          <>
            <button
              type="button"
              data-testid={`view-detail-btn-${codeStr}`}
              onClick={(e) => onOpenDetail(bk, e.currentTarget)}
              className="btn-secondary min-h-[44px] sm:min-h-[40px] px-4 py-1.5 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
            >
              <span>{isVi ? 'Xem chi tiết' : 'View details'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              data-testid={`rebook-btn-${codeStr}`}
              onClick={(e) => onRebook(bk, e)}
              className="btn-secondary min-h-[44px] sm:min-h-[40px] px-4 py-1.5 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isVi ? 'Đặt lại' : 'Book again'}</span>
            </button>

            {bk.status === 'Hoàn thành' &&
              (bk.review ? (
                <span
                  data-testid={`reviewed-badge-${codeStr}`}
                  className="min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-extrabold inline-flex items-center gap-1.5 border"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    color: 'var(--primary)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>
                    {isVi
                      ? `Đã đánh giá ${bk.review.rating}★`
                      : `Rated ${bk.review.rating}★`}
                  </span>
                </span>
              ) : (
                onReview && (
                  <button
                    type="button"
                    data-testid={`review-booking-btn-${codeStr}`}
                    onClick={(e) => onReview(bk, e.currentTarget)}
                    className="btn-primary min-h-[44px] sm:min-h-[40px] px-4 py-1.5 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>
                      {isVi
                        ? 'Đánh giá bác sĩ & dịch vụ'
                        : 'Rate doctor & service'}
                    </span>
                  </button>
                )
              ))}
          </>
        )}

        {tabCat === 'cancelled' && (
          <>
            <button
              type="button"
              data-testid={`rebook-btn-${codeStr}`}
              onClick={(e) => onRebook(bk, e)}
              className="btn-secondary min-h-[44px] sm:min-h-[40px] px-4 py-1.5 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isVi ? 'Đặt lại' : 'Book again'}</span>
            </button>

            <button
              type="button"
              data-testid={`view-detail-btn-${codeStr}`}
              onClick={(e) => onOpenDetail(bk, e.currentTarget)}
              className="btn-secondary min-h-[44px] sm:min-h-[40px] px-4 py-1.5 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
            >
              <span>{isVi ? 'Xem chi tiết' : 'View details'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {isBetween3And24h && (
        <p
          data-testid={`within-24h-notice-${codeStr}`}
          className="mt-3 text-xs font-semibold flex items-center gap-1.5"
          style={{ color: 'var(--text-muted)' }}
        >
          <Phone
            className="w-3.5 h-3.5 shrink-0"
            style={{ color: 'var(--coral)' }}
          />
          <span>{within24hNotice}</span>
        </p>
      )}

      {isUnder3hFee50 && (
        <p
          data-testid={`under-3h-notice-${codeStr}`}
          className="mt-3 text-xs font-semibold flex items-center gap-1.5"
          style={{ color: darkMode ? '#FDA29B' : '#B42318' }}
        >
          <XCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{under3hNotice}</span>
        </p>
      )}
    </article>
  );
};

