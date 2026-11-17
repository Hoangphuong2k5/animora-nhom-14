'use client';

import React from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  PawPrint,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  XCircle,
} from 'lucide-react';
import { Booking, Language } from '@/types';
import {
  getPetTypeLabel,
  getWeightRangeLabel,
  resolveServiceBySlugOrName,
} from '@/data/serviceBookingData';
import {
  CANCEL_REASON_OPTIONS,
  formatBookingDateWithWeekday,
  getBookingModificationPolicy,
  getCancellationOutcome,
} from '@/utils/bookingHistoryUtils';
import { ServiceIcon } from '../shared/ServiceIcon';
import { BookingActionUnavailable } from './BookingActionUnavailable';
import {
  BookingBreadcrumb,
  BookingSectionTitle,
  bookingCardStyle,
  formatVnd,
} from './BookingPageParts';

interface BookingCancelPageViewProps {
  booking: Booking | null;
  lang: Language;
  darkMode: boolean;
  referenceNow: Date;
  selectedReason: string;
  cancelNote: string;
  cancelFeeAgreed: boolean;
  onSelectReason: (reason: string) => void;
  onChangeCancelNote: (note: string) => void;
  onChangeCancelFeeAgreed: (agreed: boolean) => void;
  onSwitchToReschedule: () => void;
  onBackToList: () => void;
  onBackToDetail: () => void;
  onConfirmCancel: () => void;
}

export const BookingCancelPageView = ({
  booking: bk,
  lang,
  darkMode,
  referenceNow,
  selectedReason,
  cancelNote,
  cancelFeeAgreed,
  onSelectReason,
  onChangeCancelNote,
  onChangeCancelFeeAgreed,
  onSwitchToReschedule,
  onBackToList,
  onBackToDetail,
  onConfirmCancel,
}: BookingCancelPageViewProps) => {
  const isVi = lang === 'vi';

  if (!bk || !getBookingModificationPolicy(bk, referenceNow).canCancel) {
    return (
      <BookingActionUnavailable
        booking={bk}
        lang={lang}
        action="cancel"
        referenceNow={referenceNow}
        onBack={bk ? onBackToDetail : onBackToList}
      />
    );
  }

  const srv = resolveServiceBySlugOrName(bk.serviceSlug || bk.service);
  const codeStr = bk.code || bk.id;
  const policy = getBookingModificationPolicy(bk, referenceNow);
  const outcome = getCancellationOutcome(bk, referenceNow);
  const hasFee = outcome.feeAmount > 0;
  const canConfirm = !hasFee || cancelFeeAgreed;

  const selectedOption = CANCEL_REASON_OPTIONS.find(
    (o) => o.labelVi === selectedReason || o.labelEn === selectedReason
  );
  const isOtherSelected = selectedOption?.id === 'other';

  const doctorLabel =
    bk.doctorName ||
    (isVi ? 'Đội ngũ Bác sĩ Thú y Animora' : 'Animora Veterinary Team');

  // Outcome banner copy & colors
  let outcomeToneBg = '#EAF7EE';
  let outcomeToneBorder = '#9AD7AF';
  let outcomeToneColor = '#1B6B3A';
  let outcomeIcon = <CheckCircle2 className="w-5 h-5" />;
  let outcomeTitle = '';
  let outcomeBody = '';

  if (outcome.kind === 'refund_full') {
    outcomeTitle = isVi
      ? `Hoàn lại toàn bộ 100% (${formatVnd(outcome.refundAmount)})`
      : `Full 100% refund of ${formatVnd(outcome.refundAmount)}`;
    outcomeBody = isVi
      ? 'Lịch hẹn đã thanh toán trước sẽ được hoàn lại toàn bộ 100% về phương thức thanh toán ban đầu của bạn.'
      : 'This prepaid appointment qualifies for a 100% full refund to your original payment method.';
  } else {
    outcomeTitle = isVi
      ? 'Hủy lịch miễn phí (0đ)'
      : 'Free cancellation (0 VND)';
    outcomeBody = isVi
      ? 'Lịch hẹn trả sau tại quầy được hủy trực tiếp và không phát sinh bất kỳ khoản phí nào.'
      : 'Postpaid appointment is cancelled with 0 VND fee.';
  }

  return (
    <div data-testid="booking-cancel-page" className="space-y-6">
      <BookingBreadcrumb
        items={[
          {
            label: isVi ? 'Lịch hẹn của tôi' : 'My bookings',
            onClick: onBackToList,
            testId: 'mobile-detail-back-btn',
          },
          { label: codeStr, onClick: onBackToDetail },
          { label: isVi ? 'Hủy lịch' : 'Cancel' },
        ]}
      />

      <header className="space-y-1.5">
        <h1
          className="font-heading text-2xl sm:text-[34px] font-extrabold leading-tight"
          style={{ color: 'var(--primary)' }}
        >
          {isVi ? 'Xác nhận hủy lịch hẹn' : 'Confirm appointment cancellation'}
        </h1>
        <p
          className="text-sm sm:text-base font-semibold"
          style={{ color: 'var(--text-muted)' }}
        >
          {isVi
            ? 'Kiểm tra lại thông tin buổi hẹn và chính sách hoàn tiền / phí trước khi xác nhận.'
            : 'Please review the appointment summary and refund/fee details before confirming.'}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (7/12): Appointment summary + Reason selector */}
        <div className="lg:col-span-7 space-y-6">
          {/* Appointment Summary Card */}
          <section
            className="rounded-[26px] border p-5 sm:p-6 space-y-4"
            style={bookingCardStyle}
          >
            <BookingSectionTitle>
              {isVi ? 'Thông tin lịch hẹn sắp hủy' : 'Appointment summary'}
            </BookingSectionTitle>

            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  color: 'var(--primary)',
                }}
              >
                <ServiceIcon type={srv.icon} className="w-7 h-7" />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <h2
                  className="font-heading text-xl font-extrabold"
                  style={{ color: 'var(--primary)' }}
                >
                  {srv.name[lang]}
                </h2>
                <p
                  className="text-xs sm:text-sm font-bold tabular-nums"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {isVi ? 'Mã đặt lịch:' : 'Booking code:'}{' '}
                  <strong style={{ color: 'var(--text)' }}>{codeStr}</strong>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div
                className="p-3.5 rounded-2xl border space-y-1"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--border)',
                }}
              >
                <span
                  className="text-xs font-bold flex items-center gap-1.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Calendar
                    className="w-3.5 h-3.5"
                    style={{ color: 'var(--primary)' }}
                  />
                  {isVi ? 'Ngày & giờ hẹn' : 'Date & time'}
                </span>
                <div
                  className="text-sm font-extrabold tabular-nums"
                  style={{ color: 'var(--text)' }}
                >
                  {formatBookingDateWithWeekday(bk.date, bk.timeSlot, lang)}
                </div>
              </div>

              <div
                className="p-3.5 rounded-2xl border space-y-1"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--border)',
                }}
              >
                <span
                  className="text-xs font-bold flex items-center gap-1.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <PawPrint
                    className="w-3.5 h-3.5"
                    style={{ color: 'var(--primary)' }}
                  />
                  {isVi ? 'Thú cưng & Bác sĩ' : 'Pet & Specialist'}
                </span>
                <div
                  className="text-sm font-extrabold"
                  style={{ color: 'var(--text)' }}
                >
                  {bk.petName ? `Bé ${bk.petName}` : getPetTypeLabel(bk.petType, lang)}
                  {bk.weightRange
                    ? ` (${getWeightRangeLabel(bk.weightRange, lang)})`
                    : ''}
                </div>
                <div
                  className="text-xs font-semibold flex items-center gap-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Stethoscope className="w-3 h-3 shrink-0" />
                  <span>{doctorLabel}</span>
                </div>
              </div>
            </div>

            {/* Suggest rescheduling instead of cancelling */}
            {policy.canReschedule && (
              <div
                className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="space-y-0.5">
                  <p
                    className="text-sm font-extrabold"
                    style={{ color: 'var(--primary)' }}
                  >
                    {isVi
                      ? 'Bạn chỉ bận vào khung giờ này?'
                      : 'Just busy at this time?'}
                  </p>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {isVi
                      ? 'Đổi sang ngày/giờ khác miễn phí và giữ nguyên bác sĩ phụ trách.'
                      : 'Reschedule to another slot for free and keep the same specialist.'}
                  </p>
                </div>
                <button
                  type="button"
                  data-testid="cancel-switch-to-reschedule-btn"
                  onClick={onSwitchToReschedule}
                  className="btn-secondary min-h-[42px] px-4 py-2 !rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isVi ? 'Đổi giờ thay vì hủy' : 'Reschedule instead'}</span>
                </button>
              </div>
            )}
          </section>

          {/* Optional Cancellation Reason */}
          <section
            className="rounded-[26px] border p-5 sm:p-6 space-y-4"
            style={bookingCardStyle}
          >
            <div className="space-y-1">
              <BookingSectionTitle>
                {isVi ? 'Lý do hủy lịch (tùy chọn)' : 'Reason for cancelling (optional)'}
              </BookingSectionTitle>
              <p
                className="text-xs font-semibold"
                style={{ color: 'var(--text-muted)' }}
              >
                {isVi
                  ? 'Chia sẻ lý do giúp Animora cải thiện chất lượng phục vụ. Bạn có thể bỏ qua bước này.'
                  : 'Sharing your reason helps us improve. You may leave this blank.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CANCEL_REASON_OPTIONS.map((opt) => {
                const label = isVi ? opt.labelVi : opt.labelEn;
                const active = selectedReason === label;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    data-testid={`cancel-reason-${opt.id}`}
                    aria-pressed={active}
                    onClick={() => onSelectReason(active ? '' : label)}
                    className="min-h-[46px] px-4 py-2.5 rounded-2xl border text-left text-sm font-bold flex items-center justify-between gap-2 transition-colors cursor-pointer"
                    style={{
                      backgroundColor: active ? 'var(--primary)' : 'var(--bg)',
                      color: active ? 'var(--on-primary)' : 'var(--text)',
                      borderColor: active ? 'var(--primary)' : 'var(--border)',
                    }}
                  >
                    <span>{label}</span>
                    <span
                      className="w-4 h-4 rounded-full border flex items-center justify-center shrink-0"
                      style={{
                        borderColor: active
                          ? 'var(--on-primary)'
                          : 'var(--border)',
                      }}
                    >
                      {active && (
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: 'var(--on-primary)' }}
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {isOtherSelected && (
              <div className="space-y-1.5 pt-1">
                <label
                  htmlFor="cancel-other-note"
                  className="block text-xs font-bold"
                  style={{ color: 'var(--text)' }}
                >
                  {isVi
                    ? 'Nhập lý do cụ thể (tối đa 200 ký tự)'
                    : 'Specify your reason (up to 200 characters)'}
                </label>
                <textarea
                  id="cancel-other-note"
                  data-testid="cancel-other-note-input"
                  rows={3}
                  maxLength={200}
                  value={cancelNote}
                  onChange={(e) => onChangeCancelNote(e.target.value)}
                  placeholder={
                    isVi
                      ? 'Ví dụ: Gia đình có việc đột xuất...'
                      : 'E.g., Unexpected family schedule...'
                  }
                  className="form-input w-full text-sm font-semibold resize-none"
                />
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN (5/12): Financial outcome + Confirm buttons */}
        <aside className="lg:col-span-5 lg:sticky lg:top-28 space-y-5">
          <section
            data-testid="cancel-outcome-card"
            className="rounded-[26px] border p-5 sm:p-6 space-y-4"
            style={bookingCardStyle}
          >
            <BookingSectionTitle>
              {isVi ? 'Chi phí & hoàn tiền khi hủy' : 'Fee & refund summary'}
            </BookingSectionTitle>

            {/* Highlighted outcome banner */}
            <div
              data-testid="cancel-outcome-banner"
              className="rounded-2xl border p-4 flex items-start gap-3"
              style={{
                backgroundColor: outcomeToneBg,
                borderColor: outcomeToneBorder,
                color: outcomeToneColor,
              }}
            >
              <span className="mt-0.5 shrink-0">{outcomeIcon}</span>
              <div className="space-y-1">
                <p className="font-extrabold text-sm sm:text-base">
                  {outcomeTitle}
                </p>
                <p className="text-xs leading-relaxed font-semibold opacity-90">
                  {outcomeBody}
                </p>
              </div>
            </div>

            {/* Breakdown rows */}
            <div
              className="p-4 rounded-2xl border space-y-2.5 text-sm"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {isVi ? 'Giá dịch vụ dự kiến' : 'Estimated service price'}
                </span>
                <span
                  className="font-bold tabular-nums"
                  style={{ color: 'var(--text)' }}
                >
                  {formatVnd(outcome.estimatedPrice)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className="font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {isVi ? 'Trạng thái thanh toán' : 'Payment status'}
                </span>
                <span
                  className="font-bold"
                  style={{ color: 'var(--primary)' }}
                >
                  {bk.paymentTiming === 'prepaid' && bk.paymentState === 'paid'
                    ? isVi
                      ? 'Đã trả trước'
                      : 'Prepaid (paid)'
                    : isVi
                    ? 'Trả sau tại quầy'
                    : 'Pay at counter'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className="font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {isVi ? 'Phí hủy lịch' : 'Cancellation fee'}
                </span>
                <span
                  className="font-extrabold tabular-nums"
                  style={{
                    color: hasFee
                      ? darkMode
                        ? '#FDA29B'
                        : '#B42318'
                      : 'var(--primary)',
                  }}
                >
                  {hasFee
                    ? `${formatVnd(outcome.feeAmount)} (50%)`
                    : isVi
                    ? '0đ (Miễn phí)'
                    : '0 VND (Free)'}
                </span>
              </div>

              {bk.paymentTiming === 'prepaid' && bk.paymentState === 'paid' && (
                <div
                  className="pt-2 border-t flex items-center justify-between"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <span
                    className="font-extrabold"
                    style={{ color: 'var(--primary)' }}
                  >
                    {isVi ? 'Số tiền hoàn lại' : 'Refund amount'}
                  </span>
                  <span
                    data-testid="cancel-refund-amount"
                    className="font-heading text-lg font-extrabold tabular-nums"
                    style={{ color: '#1B6B3A' }}
                  >
                    {formatVnd(outcome.refundAmount)}
                  </span>
                </div>
              )}
            </div>

            {hasFee && (
              <label
                className="flex items-start gap-2.5 p-3 rounded-xl border text-xs font-bold cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              >
                <input
                  type="checkbox"
                  data-testid="cancel-fee-consent-checkbox"
                  checked={cancelFeeAgreed}
                  onChange={(e) => onChangeCancelFeeAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#7A1F2B]"
                />
                <span>
                  {isVi
                    ? `Tôi hiểu việc hủy lịch dưới 3 giờ áp dụng phí 50% (${formatVnd(outcome.feeAmount)}).`
                    : `I understand cancelling under 3 hours incurs a 50% fee (${formatVnd(outcome.feeAmount)}).`}
                </span>
              </label>
            )}

            <div className="flex flex-col gap-2.5 pt-1">
              <button
                type="button"
                data-testid="confirm-cancel-booking-btn"
                disabled={!canConfirm}
                onClick={onConfirmCancel}
                className="w-full min-h-[48px] px-5 py-2.5 rounded-2xl text-sm font-extrabold inline-flex items-center justify-center gap-2 transition-opacity cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#B42318',
                  color: '#FFFFFF',
                }}
              >
                <XCircle className="w-4 h-4" />
                <span>
                  {isVi ? 'Xác nhận hủy lịch hẹn' : 'Confirm cancellation'}
                </span>
              </button>

              <button
                type="button"
                data-testid="keep-booking-btn"
                onClick={onBackToDetail}
                className="btn-secondary w-full min-h-[46px] px-5 py-2 !rounded-2xl text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>{isVi ? 'Giữ lại lịch hẹn' : 'Keep appointment'}</span>
              </button>
            </div>
          </section>

          <section
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
                {isVi ? 'Chính sách hoàn tiền' : 'Refund policy'}
              </span>
            </div>
            <p className="leading-relaxed font-semibold">
              {isVi
                ? 'Với lịch trả trước đã thanh toán: hoàn lại toàn bộ 100% khi hủy trước giờ hẹn. Với lịch trả sau: hủy miễn phí 0đ, không phát sinh chi phí.'
                : 'For prepaid appointments: 100% full refund when cancelled before appointment. For postpaid: free cancellation with 0 VND fee.'}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
};

