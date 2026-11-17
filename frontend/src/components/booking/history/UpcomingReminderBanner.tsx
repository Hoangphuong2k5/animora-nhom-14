'use client';

import React from 'react';
import { BellRing, ChevronRight } from 'lucide-react';
import { Booking, Language } from '@/types';
import { getHoursUntilBooking } from '@/utils/bookingHistoryUtils';
import { formatIsoDateForDisplay } from '@/data/serviceBookingData';

interface UpcomingReminderBannerProps {
  bookings: Booking[];
  lang: Language;
  referenceNow: Date;
  onOpenDetail: (bk: Booking, triggerEl?: HTMLElement | null) => void;
}

export const UpcomingReminderBanner = ({
  bookings,
  lang,
  referenceNow,
  onOpenDetail,
}: UpcomingReminderBannerProps) => {
  const isVi = lang === 'vi';

  const reminders = bookings
    .map((bk) => ({
      booking: bk,
      hours: getHoursUntilBooking(bk, referenceNow),
    }))
    .filter(({ booking, hours }) => {
      const status = booking.status || 'Mới';
      return (status === 'Mới' || status === 'Đã xác nhận') && hours > 0 && hours <= 24;
    })
    .sort((a, b) => a.hours - b.hours)
    .slice(0, 2);

  if (reminders.length === 0) return null;

  return (
    <div
      data-testid="upcoming-reminder-banner"
      className="max-w-[860px] mx-auto rounded-2xl border p-4 space-y-2.5"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--primary)',
      }}
    >
      <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
        <BellRing className="w-4 h-4 shrink-0" />
        <span>
          {isVi ? 'Nhắc lịch hẹn sắp tới' : 'Upcoming appointment reminders'}
        </span>
      </div>

      <div className="space-y-2">
        {reminders.map(({ booking: bk, hours }) => {
          const is2hWindow = hours <= 2;
          const isDental = bk.serviceSlug === 'nha-khoa-thu-nho';
          const roundedHours = Math.max(1, Math.ceil(hours));
          const badgeText = is2hWindow
            ? isVi
              ? 'Nhắc trước 2 giờ'
              : '2h reminder'
            : isVi
            ? `Còn ~${roundedHours} giờ`
            : `In ~${roundedHours}h`;

          return (
            <div
              key={bk.id}
              className="rounded-xl border px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="min-w-0 space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="text-[11px] font-extrabold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: is2hWindow ? 'var(--primary)' : 'var(--surface-2)',
                      color: is2hWindow ? 'var(--on-primary)' : 'var(--primary)',
                    }}
                  >
                    {badgeText}
                  </span>
                  <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                    {bk.service} · {bk.petName}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                    {formatIsoDateForDisplay(bk.date, lang)} · {bk.timeSlot}
                  </span>
                </div>
                {isDental && (
                  <p className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                    {isVi
                      ? 'Lưu ý chuẩn bị: Cho bé nhịn ăn/uống theo hướng dẫn trước giờ hẹn.'
                      : 'Prep reminder: Fast your pet per clinic instructions before the visit.'}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={(e) => onOpenDetail(bk, e.currentTarget)}
                className="text-xs font-bold inline-flex items-center gap-1 cursor-pointer hover:opacity-80 shrink-0"
                style={{ color: 'var(--primary)' }}
              >
                <span>{isVi ? 'Xem chi tiết' : 'View'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

