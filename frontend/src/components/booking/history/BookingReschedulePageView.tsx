'use client';

import React from 'react';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CalendarCheck,
  Clock,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { Booking, Language } from '@/types';
import {
  TimeSlotAvailability,
  isDateClosed,
  resolveServiceBySlugOrName,
  calculateServiceEndTime,
  getServiceDurationMinutes,
} from '@/data/serviceBookingData';
import {
  formatBookingDateWithWeekday,
  getBookingModificationPolicy,
  isOverdueBooking,
} from '@/utils/bookingHistoryUtils';
import { BookingActionUnavailable } from './BookingActionUnavailable';
import {
  BookingBreadcrumb,
  BookingSectionTitle,
  bookingCardStyle,
} from './BookingPageParts';
import { RescheduleCalendar } from './RescheduleCalendar';

interface BookingReschedulePageViewProps {
  booking: Booking | null;
  lang: Language;
  darkMode: boolean;
  referenceNow: Date;
  todayIso: string;
  maxDateIso: string;
  rescheduleDate: string;
  rescheduleSlot: string;
  rescheduleError: string | null;
  rescheduleSlots: TimeSlotAvailability[];
  onChangeDate: (date: string) => void;
  onChangeSlot: (slot: string) => void;
  onBackToList: () => void;
  onBackToDetail: () => void;
  onSubmit: (e?: React.FormEvent) => void;
}

const SLOT_GROUPS: Array<{
  key: string;
  labelVi: string;
  labelEn: string;
  match: (hour: number) => boolean;
}> = [
  { key: 'morning', labelVi: 'Buổi sáng', labelEn: 'Morning', match: (h) => h < 12 },
  {
    key: 'afternoon',
    labelVi: 'Buổi chiều',
    labelEn: 'Afternoon',
    match: (h) => h >= 12 && h < 17,
  },
  { key: 'evening', labelVi: 'Buổi tối', labelEn: 'Evening', match: (h) => h >= 17 },
];

export const BookingReschedulePageView = ({
  booking: bk,
  lang,
  darkMode,
  referenceNow,
  todayIso,
  maxDateIso,
  rescheduleDate,
  rescheduleSlot,
  rescheduleError,
  rescheduleSlots,
  onChangeDate,
  onChangeSlot,
  onBackToList,
  onBackToDetail,
  onSubmit,
}: BookingReschedulePageViewProps) => {
  const isVi = lang === 'vi';
  const errorColor = darkMode ? '#FDA29B' : '#B42318';

  if (!bk || !getBookingModificationPolicy(bk, referenceNow).canReschedule) {
    return (
      <BookingActionUnavailable
        booking={bk}
        lang={lang}
        action="reschedule"
        referenceNow={referenceNow}
        onBack={bk ? onBackToDetail : onBackToList}
      />
    );
  }

  const srv = resolveServiceBySlugOrName(bk.serviceSlug || bk.service);
  const durationMinutes = bk.durationMinutes || getServiceDurationMinutes(bk.serviceSlug || bk.service);
  const currentSlotStart = bk.startTime || (bk.timeSlot || '').split(' - ')[0].trim();
  const codeStr = bk.code || bk.id;
  const overdue = isOverdueBooking(bk, referenceNow);
  const hasSelection = Boolean(rescheduleSlot);
  const isSameAsCurrent =
    rescheduleDate === bk.date && rescheduleSlot === currentSlotStart;
  const canSubmit = hasSelection && !isSameAsCurrent;
  const closedSelected = isDateClosed(rescheduleDate, todayIso);

  const doctorLabel =
    bk.doctorName ||
    (isVi ? 'Đội ngũ Bác sĩ Thú y Animora' : 'Animora Veterinary Team');

  const newLabel = hasSelection
    ? formatBookingDateWithWeekday(rescheduleDate, rescheduleSlot, lang)
    : isVi
    ? 'Chưa chọn'
    : 'Not selected';

  const policyNote = overdue
    ? isVi
      ? 'Lịch đã quá giờ hẹn nhưng chưa hoàn thành: bạn được đổi giờ miễn phí.'
      : 'Past the appointment time but not completed: free rescheduling.'
    : isVi
    ? 'Đổi giờ miễn phí khi còn từ 24 giờ trở lên trước giờ hẹn. Sau khi đổi, lịch sẽ chờ phòng khám xác nhận lại.'
    : 'Free rescheduling with 24+ hours notice. The clinic will re-confirm the new time.';

  const submitLabel = isVi ? 'Xác nhận đổi lịch' : 'Confirm new time';

  return (
    <div data-testid="booking-reschedule-page" className="space-y-6 pb-24 lg:pb-0">
      <BookingBreadcrumb
        items={[
          {
            label: isVi ? 'Lịch hẹn của tôi' : 'My bookings',
            onClick: onBackToList,
            testId: 'mobile-detail-back-btn',
          },
          { label: codeStr, onClick: onBackToDetail },
          { label: isVi ? 'Đổi giờ' : 'Reschedule' },
        ]}
      />

      <header className="space-y-1.5">
        <h1
          className="font-heading text-2xl sm:text-[34px] font-extrabold leading-tight"
          style={{ color: 'var(--primary)' }}
        >
          {isVi ? 'Đổi ngày & giờ hẹn' : 'Reschedule appointment'}
        </h1>
        <p
          className="text-sm sm:text-base font-semibold"
          style={{ color: 'var(--text-muted)' }}
        >
          {srv.name[lang]} · {isVi ? 'Mã' : 'Code'} {codeStr}
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        {/* LEFT: Date + Time */}
        <div className="lg:col-span-8 space-y-6">
          <section
            className="rounded-[26px] border p-5 sm:p-6 space-y-4"
            style={bookingCardStyle}
          >
            <BookingSectionTitle>
              {isVi ? '1. Chọn ngày hẹn mới' : '1. Choose a new date'}
            </BookingSectionTitle>
            <RescheduleCalendar
              lang={lang}
              valueIso={rescheduleDate}
              originalIso={bk.date}
              todayIso={todayIso}
              maxIso={maxDateIso}
              onSelect={onChangeDate}
            />
            {closedSelected && (
              <p
                role="alert"
                className="text-xs font-bold"
                style={{ color: errorColor }}
              >
                {isVi
                  ? 'Trung tâm nghỉ bảo dưỡng định kỳ vào ngày này, vui lòng chọn ngày khác.'
                  : 'The clinic is closed on this date, please choose another day.'}
              </p>
            )}
          </section>

          <section
            className="rounded-[26px] border p-5 sm:p-6 space-y-4"
            style={bookingCardStyle}
          >
            <BookingSectionTitle>
              {isVi ? '2. Chọn khung giờ mới' : '2. Choose a new time slot'}
            </BookingSectionTitle>

            {rescheduleSlots.length === 0 ? (
              <p
                className="text-sm font-bold"
                style={{ color: 'var(--text-muted)' }}
              >
                {isVi
                  ? 'Không có khung giờ trống trong ngày này.'
                  : 'No available time slots on this date.'}
              </p>
            ) : (
              <div className="space-y-4">
                {SLOT_GROUPS.map((group) => {
                  const slots = rescheduleSlots.filter((s) =>
                    group.match(Number(s.time.split(':')[0]))
                  );
                  if (slots.length === 0) return null;
                  return (
                    <div key={group.key} className="space-y-2">
                      <span
                        className="block text-xs font-bold"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {isVi ? group.labelVi : group.labelEn}
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                        {slots.map((slot) => {
                          const isCurrent =
                            rescheduleDate === bk.date &&
                            slot.time === currentSlotStart;
                          const isSelected = rescheduleSlot === slot.time;
                          const disabled = slot.disabled || isCurrent;
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={disabled}
                              aria-pressed={isSelected}
                              data-testid={`reschedule-slot-${slot.time}`}
                              onClick={() => onChangeSlot(slot.time)}
                              className={`min-h-[52px] px-2 py-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center focus-visible:outline-2 focus-visible:outline-[#FF7F6B] ${
                                disabled
                                  ? 'opacity-45 !cursor-not-allowed'
                                  : 'cursor-pointer'
                              }`}
                              style={{
                                backgroundColor: isSelected
                                  ? 'var(--primary)'
                                  : 'var(--bg)',
                                color: isSelected
                                  ? 'var(--on-primary)'
                                  : 'var(--text)',
                                borderColor: isSelected
                                  ? 'var(--primary)'
                                  : isCurrent
                                  ? 'var(--coral)'
                                  : 'var(--border)',
                              }}
                            >
                              <span className="text-sm font-extrabold tabular-nums">
                                {slot.time}
                              </span>
                              {isCurrent ? (
                                <span className="text-[10px] font-bold">
                                  {isVi ? 'Giờ hiện tại' : 'Current'}
                                </span>
                              ) : slot.disabled ? (
                                <span className="text-[10px] font-semibold">
                                  {isVi ? slot.reasonVi : slot.reasonEn}
                                </span>
                              ) : (
                                <span
                                  className="text-[10px] font-medium"
                                  style={{
                                    color: isSelected
                                      ? 'var(--on-primary)'
                                      : 'var(--text-muted)',
                                  }}
                                >
                                  {durationMinutes < 1440
                                    ? `~ ${calculateServiceEndTime(slot.time, durationMinutes)}`
                                    : isVi
                                    ? 'Nhận phòng'
                                    : 'Check-in'}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {rescheduleError && (
            <div
              role="alert"
              aria-live="assertive"
              className="p-3.5 rounded-2xl border text-sm font-bold flex items-center gap-2"
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: errorColor,
                color: errorColor,
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{rescheduleError}</span>
            </div>
          )}
        </div>

        {/* RIGHT: Comparison summary (sticky) */}
        <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-5">
          <section
            data-testid="reschedule-summary"
            className="rounded-[26px] border p-5 sm:p-6 space-y-4"
            style={bookingCardStyle}
          >
            <BookingSectionTitle>
              {isVi ? 'Tóm tắt thay đổi' : 'Summary of changes'}
            </BookingSectionTitle>

            <div
              className="p-4 rounded-2xl border space-y-1"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border)',
              }}
            >
              <span
                className="text-xs font-bold flex items-center gap-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                <Clock className="w-3.5 h-3.5" />
                {isVi ? 'Lịch hiện tại' : 'Current time'}
              </span>
              <div
                data-testid="reschedule-current-label"
                className="font-bold text-sm sm:text-base tabular-nums line-through opacity-70"
                style={{ color: 'var(--text)' }}
              >
                {formatBookingDateWithWeekday(bk.date, bk.timeSlot, lang)}
              </div>
            </div>

            <div className="flex justify-center" aria-hidden="true">
              <ArrowRight
                className="w-5 h-5 rotate-90"
                style={{ color: 'var(--primary)' }}
              />
            </div>

            <div
              className="p-4 rounded-2xl border-2 space-y-1"
              style={{
                backgroundColor: hasSelection ? 'var(--surface-2)' : 'var(--bg)',
                borderColor: hasSelection ? 'var(--primary)' : 'var(--border)',
              }}
            >
              <span
                className="text-xs font-bold flex items-center gap-1.5"
                style={{ color: 'var(--primary)' }}
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                {isVi ? 'Lịch mới' : 'New time'}
              </span>
              <div
                data-testid="reschedule-new-label"
                className="font-extrabold text-sm sm:text-base tabular-nums"
                style={{
                  color: hasSelection ? 'var(--primary)' : 'var(--text-muted)',
                }}
              >
                {newLabel}
              </div>
            </div>

            <div
              className="text-xs font-semibold flex items-start gap-2"
              style={{ color: 'var(--text-muted)' }}
            >
              <Stethoscope
                className="w-4 h-4 shrink-0 mt-0.5"
                style={{ color: 'var(--primary)' }}
              />
              <span>
                {isVi ? 'Bác sĩ phụ trách: ' : 'Specialist: '}
                <strong style={{ color: 'var(--text)' }}>{doctorLabel}</strong>{' '}
                {isVi ? '(giữ nguyên)' : '(unchanged)'}
              </span>
            </div>

            {isSameAsCurrent && (
              <p
                className="text-xs font-bold"
                style={{ color: errorColor }}
                role="status"
              >
                {isVi
                  ? 'Lịch mới trùng lịch hiện tại.'
                  : 'The new time equals the current time.'}
              </p>
            )}

            <div className="hidden lg:flex flex-col gap-2.5 pt-1">
              <button
                type="submit"
                data-testid="reschedule-save-btn"
                disabled={!canSubmit}
                className="btn-primary w-full min-h-[48px] px-4 py-2.5 !rounded-2xl text-sm font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Calendar className="w-4 h-4" />
                <span>{submitLabel}</span>
              </button>
              <button
                type="button"
                data-testid="reschedule-keep-btn"
                onClick={onBackToDetail}
                className="btn-secondary w-full min-h-[46px] px-4 py-2 !rounded-2xl text-sm font-bold cursor-pointer"
              >
                {isVi ? 'Giữ lịch cũ' : 'Keep current time'}
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
              <span>{isVi ? 'Chính sách đổi giờ' : 'Reschedule policy'}</span>
            </div>
            <p className="leading-relaxed font-semibold">{policyNote}</p>
          </section>
        </aside>
      </form>

      {/* Mobile sticky confirm bar */}
      <div
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t px-4 py-3 pr-24 flex items-center gap-3"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="min-w-0 flex-1">
          <span
            className="block text-[11px] font-bold"
            style={{ color: 'var(--text-muted)' }}
          >
            {isVi ? 'Lịch mới' : 'New time'}
          </span>
          <span
            className="block text-sm font-extrabold truncate tabular-nums"
            style={{
              color: hasSelection ? 'var(--primary)' : 'var(--text-muted)',
            }}
          >
            {newLabel}
          </span>
        </div>
        <button
          type="button"
          data-testid="reschedule-save-btn-mobile"
          disabled={!canSubmit}
          onClick={() => onSubmit()}
          className="btn-primary min-h-[46px] px-4 py-2 !rounded-2xl text-sm font-extrabold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {isVi ? 'Xác nhận' : 'Confirm'}
        </button>
      </div>
    </div>
  );
};

