'use client';

import React from 'react';
import { AlertTriangle, ArrowLeft, Phone } from 'lucide-react';
import { Booking, Language } from '@/types';
import { CONTACT_INFO } from '@/constants/contact.constant';
import { getBookingModificationPolicy } from '@/utils/bookingHistoryUtils';
import { bookingCardStyle } from './BookingPageParts';

interface BookingActionUnavailableProps {
  booking: Booking | null;
  lang: Language;
  action: 'reschedule' | 'cancel';
  referenceNow: Date;
  onBack: () => void;
}

export const BookingActionUnavailable = ({
  booking,
  lang,
  action,
  referenceNow,
  onBack,
}: BookingActionUnavailableProps) => {
  const isVi = lang === 'vi';
  const actionLabel =
    action === 'reschedule'
      ? isVi
        ? 'đổi giờ'
        : 'reschedule'
      : isVi
      ? 'hủy'
      : 'cancel';

  let reason: string;
  if (!booking) {
    reason = isVi
      ? 'Không tìm thấy lịch hẹn này hoặc lịch hẹn không thuộc tài khoản của bạn.'
      : 'We could not find this appointment, or it does not belong to your account.';
  } else {
    const policy = getBookingModificationPolicy(booking, referenceNow);
    if (policy.reason === 'status') {
      reason = isVi
        ? `Lịch hẹn đang ở trạng thái "${booking.status}" nên không thể ${actionLabel}.`
        : `This appointment is "${booking.status}" and cannot be changed.`;
    } else {
      reason = isVi
        ? `Hiện không thể ${actionLabel} lịch hẹn này.`
        : 'This action is not available right now.';
    }
  }

  return (
    <div
      data-testid="booking-action-unavailable"
      role="alert"
      className="max-w-[640px] mx-auto rounded-[26px] border p-6 sm:p-8 text-center space-y-5"
      style={bookingCardStyle}
    >
      <div
        className="w-14 h-14 mx-auto rounded-full flex items-center justify-center"
        style={{ backgroundColor: '#FFF4E5', color: '#9A4A06' }}
      >
        <AlertTriangle className="w-7 h-7" />
      </div>
      <div className="space-y-2">
        <h1
          className="font-heading text-2xl font-extrabold"
          style={{ color: 'var(--primary)' }}
        >
          {isVi
            ? `Không thể ${actionLabel} lịch này`
            : 'This action is unavailable'}
        </h1>
        <p
          className="text-sm sm:text-base font-semibold"
          style={{ color: 'var(--text-muted)' }}
        >
          {reason}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href={CONTACT_INFO.phoneHref}
          className="btn-primary min-h-[46px] px-5 py-2.5 !rounded-2xl text-sm font-extrabold inline-flex items-center justify-center gap-2"
        >
          <Phone className="w-4 h-4" />
          <span>
            {isVi
              ? `Gọi hotline ${CONTACT_INFO.phoneDisplay}`
              : `Call ${CONTACT_INFO.phoneDisplay}`}
          </span>
        </a>
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary min-h-[46px] px-5 py-2.5 !rounded-2xl text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>
            {booking
              ? isVi
                ? 'Quay lại chi tiết lịch hẹn'
                : 'Back to appointment'
              : isVi
              ? 'Về Lịch hẹn của tôi'
              : 'Back to My bookings'}
          </span>
        </button>
      </div>
    </div>
  );
};

