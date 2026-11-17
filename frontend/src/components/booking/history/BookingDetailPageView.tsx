'use client';

import React from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Check,
  Clock,
  Copy,
  Download,
  Mail,
  PawPrint,
  Phone,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Star,
  Stethoscope,
  User,
  XCircle,
} from 'lucide-react';
import { Booking, Language, Pet } from '@/types';
import { CONTACT_INFO } from '@/constants/contact.constant';
import {
  formatBookingPhoneOnBlur,
  formatEstimatedPriceText,
  formatIsoDateForDisplay,
  getPetTypeLabel,
  getWeightRangeLabel,
  resolveServiceBySlugOrName,
} from '@/data/serviceBookingData';
import {
  formatBookingDateWithWeekday,
  getBookingModificationPolicy,
  getBookingTabCategory,
  getUpcomingCountdownText,
  isOverdueBooking,
  maskBookingEmail,
  maskBookingPhone,
} from '@/utils/bookingHistoryUtils';
import { ServiceIcon } from '../shared/ServiceIcon';
import { BookingStatusPill } from './BookingStatusPill';

interface BookingDetailPageViewProps {
  booking: Booking;
  lang: Language;
  darkMode: boolean;
  referenceNow: Date;
  pets?: Pet[];
  copiedCode: string | null;
  isVerifiedOwner: boolean;
  onBack: () => void;
  onCopyCode: (code: string, e?: React.MouseEvent) => void;
  onReschedule: (bk: Booking, triggerEl?: HTMLElement | null) => void;
  onCancel: (bk: Booking, triggerEl?: HTMLElement | null) => void;
  onDownloadIcs: (bk: Booking, e?: React.MouseEvent) => void;
  onRebook: (bk: Booking, e?: React.MouseEvent) => void;
  onReview?: (bk: Booking, triggerEl?: HTMLElement | null) => void;
}

type BannerTone = 'info' | 'warning' | 'success' | 'danger' | 'neutral';

const BANNER_STYLES: Record<
  BannerTone,
  { bg: string; border: string; color: string }
> = {
  info: { bg: '#FDF1EC', border: '#F3C9BC', color: '#7A1F2B' },
  warning: { bg: '#FFF4E5', border: '#FDBA74', color: '#9A4A06' },
  success: { bg: '#EAF7EE', border: '#9AD7AF', color: '#1B6B3A' },
  danger: { bg: '#FDECEC', border: '#F2B1B1', color: '#A32121' },
  neutral: { bg: '#F1EEEA', border: '#D8D1C9', color: '#5B524B' },
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2
    className="text-[13px] font-extrabold uppercase tracking-[0.1em]"
    style={{ color: 'var(--primary)' }}
  >
    {children}
  </h2>
);

const InfoTile = ({
  icon,
  label,
  children,
  testId,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  testId?: string;
}) => (
  <div
    data-testid={testId}
    className="p-4 rounded-2xl border space-y-1.5"
    style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
  >
    <span
      className="text-xs font-bold flex items-center gap-1.5"
      style={{ color: 'var(--text-muted)' }}
    >
      <span style={{ color: 'var(--primary)' }}>{icon}</span>
      <span>{label}</span>
    </span>
    {children}
  </div>
);

export const BookingDetailPageView = ({
  booking: bk,
  lang,
  darkMode,
  referenceNow,
  copiedCode,
  isVerifiedOwner,
  onBack,
  onCopyCode,
  onReschedule,
  onCancel,
  onDownloadIcs,
  onRebook,
  onReview,
}: BookingDetailPageViewProps) => {
  const isVi = lang === 'vi';
  const srv = resolveServiceBySlugOrName(bk.serviceSlug || bk.service);
  const codeStr = bk.code || bk.id;
  const policy = getBookingModificationPolicy(bk, referenceNow);
  const tabCat = getBookingTabCategory(bk, referenceNow);
  const overdue = isOverdueBooking(bk, referenceNow);
  const isLockedWithin24h = policy.reason === 'within_24h';
  const isCompleted = bk.status === 'Hoàn thành';
  const canReview = isCompleted && !bk.review && Boolean(onReview);
  const hasManageActions = policy.canReschedule || policy.canCancel;

  const createdDateStr = formatIsoDateForDisplay(
    (bk.createdAt || '').slice(0, 10) || bk.date,
    lang
  );
  const confirmedDateStr = bk.confirmedAt
    ? formatIsoDateForDisplay(bk.confirmedAt.slice(0, 10), lang)
    : bk.status === 'Đã xác nhận' || bk.status === 'Hoàn thành'
    ? createdDateStr
    : null;
  const completedDateStr = bk.completedAt
    ? formatIsoDateForDisplay(bk.completedAt.slice(0, 10), lang)
    : bk.status === 'Hoàn thành'
    ? formatIsoDateForDisplay(bk.date, lang)
    : null;

  // ---- Context banner ----
  let bannerTone: BannerTone = 'info';
  let bannerIcon = <Clock className="w-5 h-5" />;
  let bannerTitle = '';
  let bannerText = '';

  if (bk.status === 'Đã hủy') {
    bannerTone = 'danger';
    bannerIcon = <XCircle className="w-5 h-5" />;
    bannerTitle = isVi ? 'Lịch hẹn đã được hủy' : 'This appointment was cancelled';
    bannerText = bk.cancelReason
      ? `${isVi ? 'Lý do' : 'Reason'}: ${bk.cancelReason}`
      : isVi
      ? 'Bạn có thể đặt lại dịch vụ này bất cứ lúc nào.'
      : 'You can book this service again at any time.';
  } else if (bk.status === 'Không đến') {
    bannerTone = 'neutral';
    bannerIcon = <AlertTriangle className="w-5 h-5" />;
    bannerTitle = isVi ? 'Bé chưa đến buổi hẹn' : 'Appointment was missed';
    bannerText = isVi
      ? 'Bạn có thể đặt lại một lịch hẹn mới phù hợp hơn.'
      : 'You can book a new appointment that suits you better.';
  } else if (isCompleted) {
    bannerTone = 'success';
    bannerIcon = <CheckCircle2 className="w-5 h-5" />;
    bannerTitle = isVi ? 'Buổi hẹn đã hoàn thành' : 'Appointment completed';
    bannerText = bk.review
      ? isVi
        ? 'Cảm ơn bạn đã đánh giá dịch vụ của Animora.'
        : 'Thank you for rating Animora.'
      : isVi
      ? 'Hãy chia sẻ trải nghiệm để chúng tôi phục vụ bé tốt hơn.'
      : 'Share your experience so we can care for your pet even better.';
  } else if (overdue) {
    bannerTone = 'warning';
    bannerIcon = <AlertTriangle className="w-5 h-5" />;
    bannerTitle = isVi
      ? 'Quá giờ hẹn – chờ phòng khám xử lý'
      : 'Past appointment time – awaiting clinic';
    bannerText = isVi
      ? 'Lịch chưa được ghi nhận hoàn thành. Bạn có thể đổi sang thời gian mới hoặc hủy lịch miễn phí.'
      : 'This appointment has not been marked as completed. You can reschedule or cancel it for free.';
  } else {
    const countdown = getUpcomingCountdownText(bk, lang, referenceNow);
    bannerTone = 'info';
    bannerTitle = countdown
      ? countdown
      : isVi
      ? 'Lịch hẹn sắp tới'
      : 'Upcoming appointment';
    bannerText = isVi
      ? 'Vui lòng đưa bé đến đúng giờ. Mang theo mã đặt lịch để check-in nhanh tại quầy.'
      : 'Please arrive on time and bring your booking code for quick check-in.';
  }
  const bannerStyle = BANNER_STYLES[bannerTone];

  // ---- Policy note by context ----
  let policyNote: string;
  if (overdue) {
    policyNote = isVi
      ? 'Lịch đã quá giờ hẹn nhưng chưa hoàn thành: bạn được đổi giờ hoặc hủy miễn phí.'
      : 'Past appointment time but not completed: free rescheduling or cancellation.';
  } else if (tabCat === 'upcoming') {
    policyNote = isVi
      ? 'Đổi giờ hoặc hủy miễn phí trước giờ hẹn. Đơn thanh toán trước được hoàn trả 100% về phương thức ban đầu.'
      : 'Free reschedule or cancellation before appointment. Prepaid bookings receive a 100% refund.';
  } else {
    policyNote = isVi
      ? 'Lịch hẹn này không còn thao tác đổi giờ hoặc hủy. Bạn có thể đặt lại dịch vụ bất cứ lúc nào.'
      : 'Reschedule and cancel are no longer available. You can book this service again anytime.';
  }

  // ---- Timeline ----
  const thirdLabelVi =
    bk.status === 'Đã hủy'
      ? 'Đã hủy lịch'
      : bk.status === 'Không đến'
      ? 'Không đến'
      : 'Hoàn thành';
  const thirdLabelEn =
    bk.status === 'Đã hủy'
      ? 'Cancelled'
      : bk.status === 'Không đến'
      ? 'No-show'
      : 'Completed';
  const steps = [
    {
      key: 'sent',
      label: isVi ? 'Đã gửi yêu cầu' : 'Submitted',
      date: createdDateStr,
      done: true,
    },
    {
      key: 'confirmed',
      label: isVi ? 'Đã xác nhận' : 'Confirmed',
      date: confirmedDateStr,
      done:
        bk.status === 'Đã xác nhận' ||
        bk.status === 'Hoàn thành' ||
        Boolean(bk.confirmedAt),
    },
    {
      key: 'completed',
      label: isVi ? thirdLabelVi : thirdLabelEn,
      date:
        bk.status === 'Đã hủy' && bk.cancelledAt
          ? formatIsoDateForDisplay(bk.cancelledAt.slice(0, 10), lang)
          : completedDateStr,
      done:
        bk.status === 'Hoàn thành' ||
        bk.status === 'Đã hủy' ||
        bk.status === 'Không đến',
    },
  ];

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface)',
    borderColor: 'var(--border)',
    boxShadow: 'var(--shadow)',
  };

  // ---- Primary action in the right column ----
  const rebookButton = (primary: boolean) => (
    <button
      type="button"
      data-testid={`detail-rebook-btn-${codeStr}`}
      onClick={(e) => onRebook(bk, e)}
      className={`${
        primary ? 'btn-primary' : 'btn-secondary'
      } w-full min-h-[48px] px-4 py-2.5 !rounded-2xl text-sm font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer`}
    >
      <RotateCcw className="w-4 h-4" />
      <span>{isVi ? 'Đặt lại dịch vụ này' : 'Book this service again'}</span>
    </button>
  );

  return (
    <div data-testid="booking-detail-view" className="space-y-6">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-sm font-semibold"
        style={{ color: 'var(--text-muted)' }}
      >
        <button
          type="button"
          data-testid="mobile-detail-back-btn"
          onClick={onBack}
          className="hover:underline cursor-pointer font-bold"
          style={{ color: 'var(--primary)' }}
        >
          {isVi ? 'Lịch hẹn của tôi' : 'My bookings'}
        </button>
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
        <span className="tabular-nums">{codeStr}</span>
      </nav>

      {/* Header */}
      <header
        className="rounded-[26px] border p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
        style={cardStyle}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: 'var(--surface-2)',
              color: 'var(--primary)',
            }}
          >
            <ServiceIcon type={srv.icon} className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1
                className="font-heading text-2xl sm:text-[32px] font-extrabold leading-tight"
                style={{ color: 'var(--primary)' }}
              >
                {srv.name[lang]}
              </h1>
              <BookingStatusPill
                status={bk.status}
                lang={lang}
                darkMode={darkMode}
              />
              {overdue && (
                <span
                  data-testid="detail-overdue-badge"
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border"
                  style={{
                    backgroundColor: '#FFF1E6',
                    color: '#B45309',
                    borderColor: '#FDBA74',
                  }}
                >
                  <Clock className="w-3 h-3" />
                  <span>{isVi ? 'Quá giờ hẹn' : 'Overdue'}</span>
                </span>
              )}
            </div>
            <p
              className="text-sm font-semibold flex flex-wrap items-center gap-2"
              style={{ color: 'var(--text-muted)' }}
            >
              <span>
                {isVi ? 'Mã đặt lịch:' : 'Booking code:'}{' '}
                <strong
                  data-testid="detail-booking-code"
                  className="tabular-nums"
                  style={{ color: 'var(--primary)' }}
                >
                  {codeStr}
                </strong>
              </span>
              <button
                type="button"
                onClick={(e) => onCopyCode(codeStr, e)}
                className="px-2.5 py-0.5 rounded-full border text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--primary)',
                }}
              >
                {copiedCode === codeStr ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>{isVi ? 'Đã sao chép' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>{isVi ? 'Sao chép mã' : 'Copy code'}</span>
                  </>
                )}
              </button>
            </p>
          </div>
        </div>

        <div
          className="sm:text-right shrink-0 px-4 py-3 rounded-2xl border"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
        >
          <span
            className="block text-xs font-bold"
            style={{ color: 'var(--text-muted)' }}
          >
            {isVi ? 'Chi phí dự kiến' : 'Estimated cost'}
          </span>
          <span
            className="font-heading text-2xl font-extrabold"
            style={{ color: 'var(--primary)' }}
          >
            {formatEstimatedPriceText(srv, bk.weightRange, lang)}
          </span>
        </div>
      </header>

      {/* Context banner */}
      <div
        data-testid="detail-context-banner"
        role="status"
        className="rounded-2xl border px-4 py-3.5 flex items-start gap-3"
        style={{
          backgroundColor: bannerStyle.bg,
          borderColor: bannerStyle.border,
          color: bannerStyle.color,
        }}
      >
        <span className="mt-0.5 shrink-0">{bannerIcon}</span>
        <div className="space-y-0.5">
          <p className="font-extrabold text-sm sm:text-base">{bannerTitle}</p>
          <p className="text-xs sm:text-sm font-semibold opacity-90">
            {bannerText}
          </p>
        </div>
      </div>

      {/* 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT */}
        <div className="lg:col-span-8 space-y-6">
          {/* Timeline */}
          <section
            data-testid="detail-status-timeline"
            className="rounded-[26px] border p-5 sm:p-6 space-y-5"
            style={cardStyle}
          >
            <SectionTitle>
              {isVi ? 'Tiến trình lịch hẹn' : 'Appointment timeline'}
            </SectionTitle>
            <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {steps.map((step) => (
                <li
                  key={step.key}
                  className="flex items-center gap-3 p-3.5 rounded-2xl border"
                  style={{
                    backgroundColor: step.done ? 'var(--bg)' : 'transparent',
                    borderColor: step.done
                      ? 'var(--primary)'
                      : 'var(--border)',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: step.done
                        ? 'var(--primary)'
                        : 'var(--surface-2)',
                      color: step.done
                        ? 'var(--on-primary)'
                        : 'var(--text-muted)',
                    }}
                  >
                    <Check className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span
                      className="block text-sm font-extrabold"
                      style={{ color: 'var(--text)' }}
                    >
                      {step.label}
                    </span>
                    <span
                      className="block text-xs font-semibold tabular-nums"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {step.date || (isVi ? 'Đang chờ xử lý' : 'Pending')}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Appointment info */}
          <section
            className="rounded-[26px] border p-5 sm:p-6 space-y-4"
            style={cardStyle}
          >
            <SectionTitle>
              {isVi ? 'Thông tin buổi hẹn' : 'Appointment details'}
            </SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoTile
                icon={<Calendar className="w-4 h-4" />}
                label={isVi ? 'Ngày & giờ hẹn' : 'Date & time'}
              >
                <div
                  className="font-bold text-base tabular-nums"
                  style={{ color: 'var(--text)' }}
                >
                  {formatBookingDateWithWeekday(bk.date, bk.timeSlot, lang)}
                </div>
                <div
                  className="text-xs font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {isVi ? 'Thời lượng dự kiến:' : 'Duration:'}{' '}
                  {srv.duration[lang]}
                </div>
                {bk.rescheduledFrom && bk.rescheduledFrom.length > 0 && (
                  <div
                    className="text-xs font-bold pt-0.5"
                    style={{ color: 'var(--primary)' }}
                  >
                    {isVi ? 'Đã dời lịch từ:' : 'Rescheduled from:'}{' '}
                    {formatIsoDateForDisplay(
                      bk.rescheduledFrom[bk.rescheduledFrom.length - 1]
                        .fromDate,
                      lang
                    )}{' '}
                    ·{' '}
                    {bk.rescheduledFrom[bk.rescheduledFrom.length - 1]
                      .fromTimeSlot || '09:00'}
                  </div>
                )}
              </InfoTile>

              <InfoTile
                icon={<Stethoscope className="w-4 h-4" />}
                label={isVi ? 'Bác sĩ / Chuyên viên' : 'Specialist'}
              >
                <div
                  className="font-bold text-base"
                  style={{ color: 'var(--text)' }}
                >
                  {bk.doctorName ||
                    (isVi
                      ? 'Đội ngũ Bác sĩ Thú y Animora'
                      : 'Animora Veterinary Team')}
                </div>
                <div
                  className="text-xs font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {isVi
                    ? 'Phòng khám & Spa Thú cưng Animora'
                    : 'Animora Pet Clinic & Holistic Spa'}
                </div>
              </InfoTile>
            </div>
          </section>

          {/* Pet & owner */}
          <section
            className="rounded-[26px] border p-5 sm:p-6 space-y-4"
            style={cardStyle}
          >
            <SectionTitle>
              {isVi ? 'Thú cưng & chủ nuôi' : 'Pet & owner'}
            </SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoTile
                icon={<PawPrint className="w-4 h-4" />}
                label={isVi ? 'Thông tin của bé' : 'Pet details'}
              >
                <div
                  className="font-bold text-base"
                  style={{ color: 'var(--text)' }}
                >
                  {bk.petName
                    ? `${isVi ? 'Bé ' : ''}${bk.petName}`
                    : getPetTypeLabel(bk.petType, lang)}{' '}
                  · {getPetTypeLabel(bk.petType, lang)}
                  {bk.weightRange
                    ? ` (${getWeightRangeLabel(bk.weightRange, lang)})`
                    : ''}
                </div>
                {bk.petBreed && (
                  <div
                    className="text-xs font-semibold"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {bk.petBreed}
                  </div>
                )}
              </InfoTile>

              <InfoTile
                icon={<User className="w-4 h-4" />}
                label={isVi ? 'Thông tin liên hệ' : 'Contact details'}
              >
                <div
                  data-testid="detail-owner-phone"
                  className="font-bold text-base tabular-nums"
                  style={{ color: 'var(--text)' }}
                >
                  {bk.fullName} ·{' '}
                  {isVerifiedOwner
                    ? formatBookingPhoneOnBlur(bk.phone)
                    : maskBookingPhone(bk.phone)}
                </div>
                {bk.email && (
                  <div
                    data-testid="detail-owner-email"
                    className="text-xs font-semibold"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {isVerifiedOwner ? bk.email : maskBookingEmail(bk.email)}
                  </div>
                )}
              </InfoTile>
            </div>

            {bk.note && (
              <div
                className="p-4 rounded-2xl border space-y-1"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--border)',
                }}
              >
                <span
                  className="block text-xs font-bold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {isVi ? 'Ghi chú của bạn' : 'Your note'}
                </span>
                <p
                  className="text-sm font-semibold"
                  style={{ color: 'var(--text)' }}
                >
                  {bk.note}
                </p>
              </div>
            )}

            {bk.review && (
              <div
                className="p-4 rounded-2xl border space-y-1"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--border)',
                }}
              >
                <div
                  className="flex items-center gap-1.5 text-sm font-extrabold"
                  style={{ color: 'var(--primary)' }}
                >
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>
                    {isVi
                      ? `Đánh giá của bạn: ${bk.review.rating}/5 sao`
                      : `Your rating: ${bk.review.rating}/5 stars`}
                  </span>
                </div>
                <p
                  className="text-sm italic"
                  style={{ color: 'var(--text-muted)' }}
                >
                  &ldquo;{bk.review.comment}&rdquo;
                </p>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT (sticky) */}
        <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-5">
          <section
            data-testid="detail-actions-card"
            className="rounded-[26px] border p-5 sm:p-6 space-y-4"
            style={cardStyle}
          >
            <SectionTitle>
              {isVi ? 'Thao tác' : 'Actions'}
            </SectionTitle>

            {/* Primary */}
            {canReview && onReview ? (
              <button
                type="button"
                data-testid={`detail-review-btn-${codeStr}`}
                onClick={(e) => onReview(bk, e.currentTarget)}
                className="btn-primary w-full min-h-[48px] px-4 py-2.5 !rounded-2xl text-sm font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Star className="w-4 h-4" />
                <span>
                  {isVi ? 'Đánh giá bác sĩ & dịch vụ' : 'Rate doctor & service'}
                </span>
              </button>
            ) : policy.canReschedule ? (
              <button
                type="button"
                data-testid={`detail-reschedule-btn-${codeStr}`}
                onClick={(e) => onReschedule(bk, e.currentTarget)}
                className="btn-primary w-full min-h-[48px] px-4 py-2.5 !rounded-2xl text-sm font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{isVi ? 'Đổi ngày / giờ hẹn' : 'Reschedule'}</span>
              </button>
            ) : isLockedWithin24h ? (
              <a
                href={CONTACT_INFO.phoneHref}
                data-testid={`detail-hotline-btn-${codeStr}`}
                className="btn-primary w-full min-h-[48px] px-4 py-2.5 !rounded-2xl text-sm font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>
                  {isVi
                    ? `Gọi hotline ${CONTACT_INFO.phoneDisplay}`
                    : `Call ${CONTACT_INFO.phoneDisplay}`}
                </span>
              </a>
            ) : (
              rebookButton(true)
            )}

            {/* Secondary */}
            <div className="grid grid-cols-1 gap-2.5">
              {policy.canCancel && (
                <button
                  type="button"
                  data-testid={`detail-cancel-btn-${codeStr}`}
                  onClick={(e) => onCancel(bk, e.currentTarget)}
                  className="min-h-[46px] px-4 py-2.5 rounded-2xl text-sm font-extrabold border inline-flex items-center justify-center gap-2 transition-colors hover:bg-red-500/10 cursor-pointer"
                  style={{
                    borderColor: 'rgba(220, 38, 38, 0.35)',
                    color: darkMode ? '#FDA29B' : '#B42318',
                    backgroundColor: 'var(--bg)',
                  }}
                >
                  <XCircle className="w-4 h-4" />
                  <span>
                    {isVi ? 'Hủy lịch hẹn' : 'Cancel booking'}
                  </span>
                </button>
              )}

              {hasManageActions && tabCat === 'upcoming' && (
                <button
                  type="button"
                  data-testid={`detail-ics-btn-${codeStr}`}
                  onClick={(e) => onDownloadIcs(bk, e)}
                  className="btn-secondary min-h-[46px] px-4 py-2 !rounded-2xl text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isVi ? 'Thêm vào lịch (.ics)' : 'Add to calendar'}</span>
                </button>
              )}

              {(canReview || policy.canReschedule || isLockedWithin24h) &&
                rebookButton(false)}
            </div>
          </section>

          {/* Policy */}
          <section
            data-testid="detail-cancellation-policy"
            className="rounded-[22px] border p-4 space-y-1.5 text-xs"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            <div
              className="font-extrabold flex items-center gap-1.5 text-sm"
              style={{ color: 'var(--primary)' }}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                {isVi ? 'Chính sách đổi & hủy lịch' : 'Reschedule & cancel policy'}
              </span>
            </div>
            <p className="leading-relaxed font-semibold">{policyNote}</p>
          </section>

          {/* Support */}
          <section
            className="rounded-[22px] border p-4 space-y-2"
            style={{
              backgroundColor: 'var(--surface-2)',
              borderColor: 'var(--border)',
            }}
          >
            <span
              className="block text-[13px] font-extrabold uppercase tracking-[0.1em]"
              style={{ color: 'var(--primary)' }}
            >
              {isVi ? 'Cần hỗ trợ trực tiếp?' : 'Need direct assistance?'}
            </span>
            <div className="flex flex-col gap-2 text-sm font-bold">
              <a
                href={CONTACT_INFO.phoneHref}
                className="inline-flex items-center gap-2 hover:underline"
                style={{ color: 'var(--primary)' }}
              >
                <Phone
                  className="w-4 h-4 shrink-0"
                  style={{ color: 'var(--coral)' }}
                />
                <span>
                  {isVi
                    ? `Gọi ${CONTACT_INFO.phoneDisplay}`
                    : `Call ${CONTACT_INFO.phoneDisplay}`}
                </span>
              </a>
              <a
                href={CONTACT_INFO.mailtoHref}
                className="inline-flex items-center gap-2 hover:underline break-all"
                style={{ color: 'var(--primary)' }}
              >
                <Mail
                  className="w-4 h-4 shrink-0"
                  style={{ color: 'var(--coral)' }}
                />
                <span>{CONTACT_INFO.email}</span>
              </a>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};
