import React, { useState } from 'react';
import {
  Check,
  Copy,
  CreditCard,
  Download,
  Mail,
  Phone,
  RefreshCw,
  RotateCcw,
  Star,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { createVnpayPaymentUrlApi } from '@/services/animora/paymentApi';
import { isBusinessConflictOrValidationError } from '@/services/animora/apiClient';
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
  getBookingModificationPolicy,
  formatBookingDateWithWeekday,
  getBookingTabCategory,
  maskBookingEmail,
  maskBookingPhone,
} from '@/utils/bookingHistoryUtils';
import { ServiceIcon } from '../shared/ServiceIcon';
import { BookingStatusPill } from './BookingStatusPill';

interface BookingDetailPanelProps {
  booking: Booking;
  lang: Language;
  darkMode: boolean;
  referenceNow: Date;
  pets?: Pet[];
  copiedCode: string | null;
  isVerifiedOwner: boolean;
  onCopyCode: (code: string, e?: React.MouseEvent) => void;
  onReschedule: (bk: Booking, triggerEl?: HTMLElement | null) => void;
  onCancel: (bk: Booking, triggerEl?: HTMLElement | null) => void;
  onDownloadIcs?: (bk: Booking, e?: React.MouseEvent) => void;
  onRebook: (bk: Booking, e?: React.MouseEvent) => void;
  onReview?: (bk: Booking, triggerEl?: HTMLElement | null) => void;
}

export const BookingDetailPanel = ({
  booking: bk,
  lang,
  darkMode,
  referenceNow,
  copiedCode,
  isVerifiedOwner,
  onCopyCode,
  onReschedule,
  onCancel,
  onRebook,
  onReview,
}: BookingDetailPanelProps) => {
  const isVi = lang === 'vi';
  const [isPayingVnpay, setIsPayingVnpay] = useState(false);
  const srv = resolveServiceBySlugOrName(bk.serviceSlug || bk.service);
  const codeStr = bk.code || bk.id;
  const numericBookingId = Number(bk.id);
  const canPayViaVnpay =
    Number.isInteger(numericBookingId) &&
    numericBookingId > 0 &&
    bk.status !== 'Đã hủy' &&
    bk.status !== 'Không đến' &&
    bk.paymentState === 'unpaid';

  const handlePayVnpay = async () => {
    if (isPayingVnpay || !canPayViaVnpay) return;
    setIsPayingVnpay(true);
    try {
      const res = await createVnpayPaymentUrlApi({
        appointment_id: numericBookingId,
        idempotency_key: `VNP-APP-${numericBookingId}-${Date.now()}`,
      });
      if (res?.payment_url) {
        window.location.assign(res.payment_url);
        return;
      }
      toast.error(isVi ? 'Không tạo được liên kết VNPAY' : 'Could not create VNPAY URL');
    } catch (err) {
      if (isBusinessConflictOrValidationError(err)) {
        toast.error(err.message);
      } else {
        toast.error(
          isVi ? 'Không thể kết nối cổng thanh toán VNPAY' : 'Payment gateway unavailable'
        );
      }
    } finally {
      setIsPayingVnpay(false);
    }
  };
  const policy = getBookingModificationPolicy(bk, referenceNow);
  const tabCat = getBookingTabCategory(bk, referenceNow);

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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
            style={{
              backgroundColor: 'var(--surface-2)',
              color: 'var(--primary)',
            }}
          >
            <ServiceIcon type={srv.icon} className="w-6 h-6" />
          </div>
          <div>
            <h2
              className="font-heading text-2xl font-extrabold leading-tight"
              style={{ color: 'var(--primary)' }}
            >
              {srv.name[lang]}
            </h2>
            <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>
              {srv.duration[lang]} ·{' '}
              {formatEstimatedPriceText(srv, bk.weightRange, lang)}
            </p>
          </div>
        </div>
        <BookingStatusPill status={bk.status} lang={lang} darkMode={darkMode} />
      </div>

      {/* Booking Code Box */}
      <div
        className="rounded-2xl border p-4 flex items-center justify-between gap-3"
        style={{
          backgroundColor: 'var(--bg)',
          borderColor: 'var(--border)',
        }}
      >
        <div>
          <span
            className="block text-[11px] font-bold uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            {isVi ? 'Mã đặt lịch' : 'Booking code'}
          </span>
          <span
            data-testid="detail-booking-code"
            className="font-heading text-xl font-extrabold tabular-nums"
            style={{ color: 'var(--primary)' }}
          >
            {codeStr}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => onCopyCode(codeStr, e)}
          className="min-h-[44px] px-4 py-2 rounded-full border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--primary)',
          }}
        >
          {copiedCode === codeStr ? (
            <>
              <Check className="w-4 h-4" />
              <span>{isVi ? 'Đã sao chép' : 'Copied'}</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>{isVi ? 'Sao chép mã' : 'Copy code'}</span>
            </>
          )}
        </button>
      </div>

      {/* Status Timeline */}
      <div
        data-testid="detail-status-timeline"
        className="rounded-2xl border p-4 space-y-3"
        style={{
          backgroundColor: 'var(--bg)',
          borderColor: 'var(--border)',
        }}
      >
        <h3
          className="text-xs font-extrabold uppercase tracking-wider"
          style={{ color: 'var(--primary)' }}
        >
          {isVi ? 'Tiến trình lịch hẹn' : 'Appointment timeline'}
        </h3>
        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              key: 'sent',
              labelVi: 'Đã gửi',
              labelEn: 'Submitted',
              date: createdDateStr,
              done: true,
            },
            {
              key: 'confirmed',
              labelVi: 'Đã xác nhận',
              labelEn: 'Confirmed',
              date: confirmedDateStr,
              done:
                bk.status === 'Đã xác nhận' ||
                bk.status === 'Hoàn thành' ||
                Boolean(bk.confirmedAt),
            },
            {
              key: 'completed',
              labelVi:
                bk.status === 'Đã hủy'
                  ? 'Đã hủy'
                  : bk.status === 'Không đến'
                  ? 'Không đến'
                  : 'Hoàn thành',
              labelEn:
                bk.status === 'Đã hủy'
                  ? 'Cancelled'
                  : bk.status === 'Không đến'
                  ? 'No-show'
                  : 'Completed',
              date:
                bk.status === 'Đã hủy' && bk.cancelledAt
                  ? formatIsoDateForDisplay(bk.cancelledAt.slice(0, 10), lang)
                  : completedDateStr,
              done:
                bk.status === 'Hoàn thành' ||
                bk.status === 'Đã hủy' ||
                bk.status === 'Không đến',
            },
          ].map((step) => (
            <li
              key={step.key}
              className="flex items-center gap-2.5 p-2.5 rounded-xl border"
              style={{
                backgroundColor: step.done ? 'var(--surface)' : 'transparent',
                borderColor: step.done ? 'var(--primary)' : 'var(--border)',
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  backgroundColor: step.done
                    ? 'var(--primary)'
                    : 'var(--surface-2)',
                  color: step.done ? 'var(--on-primary)' : 'var(--text-muted)',
                }}
              >
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold" style={{ color: 'var(--text)' }}>
                  {isVi ? step.labelVi : step.labelEn}
                </span>
                <span
                  className="block text-[11px] tabular-nums"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {step.date || (isVi ? 'Đang chờ' : 'Pending')}
                </span>
              </div>
            </li>
          ))}
        </ol>

        {bk.status === 'Đã hủy' && bk.cancelReason && (
          <p className="text-xs font-semibold pt-1" style={{ color: 'var(--text-muted)' }}>
            {isVi ? 'Lý do hủy:' : 'Cancellation reason:'}{' '}
            <strong>{bk.cancelReason}</strong>
          </p>
        )}
      </div>

      {/* Details Grid */}
      <div
        className="rounded-2xl border p-5 space-y-4 text-sm"
        style={{
          backgroundColor: 'var(--bg)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span
              className="block text-xs font-bold"
              style={{ color: 'var(--text-muted)' }}
            >
              {isVi ? 'Thông tin của bé' : 'Pet details'}
            </span>
            <span className="font-bold text-base" style={{ color: 'var(--text)' }}>
              {bk.petName ? `Bé ${bk.petName}` : getPetTypeLabel(bk.petType, lang)} ·{' '}
              {getPetTypeLabel(bk.petType, lang)}
              {bk.weightRange
                ? ` (${getWeightRangeLabel(bk.weightRange, lang)})`
                : ''}
            </span>
            {bk.petBreed && (
              <span
                className="block text-xs font-semibold mt-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                {bk.petBreed}
              </span>
            )}
          </div>

          <div>
            <span
              className="block text-xs font-bold"
              style={{ color: 'var(--text-muted)' }}
            >
              {isVi ? 'Ngày & giờ hẹn' : 'Date & time'}
            </span>
            <span
              className="font-bold text-base tabular-nums"
              style={{ color: 'var(--text)' }}
            >
              {formatBookingDateWithWeekday(bk.date, bk.timeSlot, lang)}
            </span>
            {bk.rescheduledFrom && bk.rescheduledFrom.length > 0 && (
              <span
                className="block text-xs font-semibold mt-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                {isVi ? 'Đã đổi từ:' : 'Rescheduled from:'}{' '}
                {formatIsoDateForDisplay(
                  bk.rescheduledFrom[bk.rescheduledFrom.length - 1].fromDate,
                  lang
                )}{' '}
                ·{' '}
                {bk.rescheduledFrom[bk.rescheduledFrom.length - 1].fromTimeSlot ||
                  '09:00'}
              </span>
            )}
          </div>

          <div>
            <span
              className="block text-xs font-bold"
              style={{ color: 'var(--text-muted)' }}
            >
              {isVi ? 'Thông tin liên hệ' : 'Contact details'}
            </span>
            <span
              data-testid="detail-owner-phone"
              className="font-bold text-base block tabular-nums"
              style={{ color: 'var(--text)' }}
            >
              {bk.fullName} ·{' '}
              {isVerifiedOwner
                ? formatBookingPhoneOnBlur(bk.phone)
                : maskBookingPhone(bk.phone)}
            </span>
            {bk.email && (
              <span
                data-testid="detail-owner-email"
                className="text-xs font-semibold block mt-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                {isVerifiedOwner ? bk.email : maskBookingEmail(bk.email)}
              </span>
            )}
          </div>

          <div>
            <span
              className="block text-xs font-bold"
              style={{ color: 'var(--text-muted)' }}
            >
              {isVi ? 'Chi phí & Thanh toán' : 'Price & Payment'}
            </span>
            <span
              className="font-extrabold text-base block"
              style={{ color: 'var(--primary)' }}
            >
              {formatEstimatedPriceText(srv, bk.weightRange, lang)}
            </span>
            {bk.doctorName && (
              <span className="block text-xs font-semibold mt-0.5" style={{ color: 'var(--text)' }}>
                {isVi ? 'Phụ trách: ' : 'Specialist: '}
                {bk.doctorName}
              </span>
            )}
            {bk.paymentTiming && (
              <span className="block text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {bk.paymentTiming === 'prepaid'
                  ? bk.paymentState === 'paid'
                    ? isVi
                      ? 'Đã thanh toán trước'
                      : 'Prepaid'
                    : isVi
                    ? 'Trả trước'
                    : 'Prepay'
                  : isVi
                  ? 'Trả sau khi hoàn thành'
                  : 'Pay after completion'}
              </span>
            )}
          </div>
        </div>

        {bk.review && (
          <div className="pt-3 border-t space-y-1" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--primary)' }}>
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>
                {isVi
                  ? `Đánh giá của bạn: ${bk.review.rating}/5 sao`
                  : `Your rating: ${bk.review.rating}/5 stars`}
              </span>
            </div>
            <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
              &ldquo;{bk.review.comment}&rdquo;
            </p>
          </div>
        )}

        {bk.note && (
          <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <span
              className="block text-xs font-bold mb-1"
              style={{ color: 'var(--text-muted)' }}
            >
              {isVi ? 'Ghi chú của khách hàng' : 'Customer note'}
            </span>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {bk.note}
            </p>
          </div>
        )}
      </div>

      {/* Actions inside Detail View */}
      <div className="flex flex-wrap items-center gap-2.5">
        {canPayViaVnpay && (
          <button
            type="button"
            disabled={isPayingVnpay}
            onClick={handlePayVnpay}
            data-testid="detail-pay-vnpay-btn"
            className="btn-primary min-h-[44px] px-4 py-2 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <CreditCard className="w-4 h-4" />
            <span>
              {isPayingVnpay
                ? isVi
                  ? 'Đang chuyển VNPAY...'
                  : 'Redirecting...'
                : isVi
                ? 'Thanh toán VNPAY'
                : 'Pay via VNPAY'}
            </span>
          </button>
        )}

        {tabCat === 'upcoming' && (
          <>
            <button
              type="button"
              disabled={policy.hoursRemaining <= 0}
              onClick={(e) => onReschedule(bk, e.currentTarget)}
              className={`btn-secondary min-h-[44px] px-4 py-2 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 ${
                policy.hoursRemaining <= 0
                  ? 'opacity-45 !cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>{isVi ? 'Đổi giờ' : 'Reschedule'}</span>
            </button>

            <button
              type="button"
              disabled={policy.hoursRemaining <= 0}
              onClick={(e) => onCancel(bk, e.currentTarget)}
              className={`btn-secondary min-h-[44px] px-4 py-2 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 ${
                policy.hoursRemaining <= 0
                  ? 'opacity-45 !cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>{isVi ? 'Hủy lịch' : 'Cancel'}</span>
            </button>
          </>
        )}

        {tabCat !== 'upcoming' && (
          <button
            type="button"
            onClick={(e) => onRebook(bk, e)}
            className="btn-primary min-h-[44px] px-5 py-2 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>
              {isVi ? 'Đặt lại dịch vụ này' : 'Book this service again'}
            </span>
          </button>
        )}

        {bk.status === 'Hoàn thành' && !bk.review && onReview && (
          <button
            type="button"
            onClick={(e) => onReview(bk, e.currentTarget)}
            className="btn-secondary min-h-[44px] px-4 py-2 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Star className="w-4 h-4" />
            <span>
              {isVi ? 'Đánh giá bác sĩ & dịch vụ' : 'Rate doctor & service'}
            </span>
          </button>
        )}
      </div>

      <p
        data-testid="detail-cancellation-policy"
        className="text-xs font-semibold pt-2 border-t"
        style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
      >
        {isVi
          ? 'Chính sách hủy: Miễn phí trước giờ hẹn; đơn thanh toán trước được hoàn trả 100% về phương thức ban đầu.'
          : 'Cancellation policy: Free cancellation before appointment time; prepaid bookings are 100% refunded.'}
      </p>

      <div
        className="rounded-2xl border p-4 space-y-2"
        style={{
          backgroundColor: 'var(--surface-2)',
          borderColor: 'var(--border)',
        }}
      >
        <span
          className="block text-xs font-extrabold uppercase tracking-wider"
          style={{ color: 'var(--primary)' }}
        >
          {isVi ? 'Cần hỗ trợ?' : 'Need help?'}
        </span>
        <div className="flex flex-wrap items-center gap-4 text-sm font-bold">
          <a
            href={CONTACT_INFO.phoneHref}
            className="inline-flex items-center gap-1.5 hover:underline"
            style={{ color: 'var(--primary)' }}
          >
            <Phone className="w-4 h-4 shrink-0" style={{ color: 'var(--coral)' }} />
            <span>{isVi ? 'Gọi 0337 203 332' : 'Call 0337 203 332'}</span>
          </a>
          <a
            href={CONTACT_INFO.mailtoHref}
            className="inline-flex items-center gap-1.5 hover:underline break-all"
            style={{ color: 'var(--primary)' }}
          >
            <Mail className="w-4 h-4 shrink-0" style={{ color: 'var(--coral)' }} />
            <span>{CONTACT_INFO.email}</span>
          </a>
        </div>
      </div>
    </div>
  );
};

