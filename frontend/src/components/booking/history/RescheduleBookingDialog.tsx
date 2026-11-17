import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Booking, Language } from '@/types';
import {
  calculateServiceEndTime,
  getServiceDurationMinutes,
  isDateClosed,
  TimeSlotAvailability,
} from '@/data/serviceBookingData';

interface RescheduleBookingDialogProps {
  booking: Booking | null;
  lang: Language;
  darkMode: boolean;
  todayIso: string;
  maxDateIso: string;
  rescheduleDate: string;
  rescheduleSlot: string;
  rescheduleError: string | null;
  rescheduleSlots: TimeSlotAvailability[];
  onChangeDate: (date: string) => void;
  onChangeSlot: (slot: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const RescheduleBookingDialog = ({
  booking,
  lang,
  darkMode,
  todayIso,
  maxDateIso,
  rescheduleDate,
  rescheduleSlot,
  rescheduleError,
  rescheduleSlots,
  onChangeDate,
  onChangeSlot,
  onClose,
  onSubmit,
}: RescheduleBookingDialogProps) => {
  const isVi = lang === 'vi';
  const errorColor = darkMode ? '#FDA29B' : '#B42318';
  const durationMinutes =
    booking?.durationMinutes ||
    getServiceDurationMinutes(booking?.serviceSlug || booking?.service);
  const currentSlotStart =
    booking?.startTime || (booking?.timeSlot || '').split(' - ')[0].trim();

  return (
    <Dialog
      open={Boolean(booking)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        data-testid="reschedule-booking-dialog"
        className="sm:max-w-lg max-h-[92vh] overflow-y-auto scrollbar-thin rounded-[24px] border p-6 sm:p-7 gap-5"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        {booking ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle
                  id="reschedule-dialog-title"
                  className="font-heading text-2xl font-extrabold"
                  style={{ color: 'var(--primary)' }}
                >
                  {isVi ? 'Đổi ngày & giờ hẹn' : 'Reschedule appointment'}
                </DialogTitle>
                <DialogDescription
                  className="text-xs sm:text-sm font-semibold mt-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {booking.code} · {booking.service}
                </DialogDescription>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={
                  isVi ? 'Đóng hộp thoại đổi giờ' : 'Close reschedule dialog'
                }
                className="min-h-[44px] min-w-[44px] rounded-full border flex items-center justify-center shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="reschedule-date-input"
                  className="block text-sm font-bold mb-1.5"
                  style={{ color: 'var(--text)' }}
                >
                  {isVi ? 'Chọn ngày hẹn mới *' : 'Choose new date *'}
                </label>
                <input
                  id="reschedule-date-input"
                  data-testid="reschedule-date-input"
                  type="date"
                  min={todayIso}
                  max={maxDateIso}
                  value={rescheduleDate}
                  onChange={(e) => onChangeDate(e.target.value)}
                  className="form-input w-full font-bold tabular-nums"
                />
                {isDateClosed(rescheduleDate, todayIso) && (
                  <p
                    role="alert"
                    className="mt-1.5 text-xs font-bold"
                    style={{ color: errorColor }}
                  >
                    {isVi
                      ? 'Trung tâm nghỉ bảo dưỡng định kỳ vào ngày này, vui lòng chọn ngày khác.'
                      : 'The clinic is closed on this date, please choose another day.'}
                  </p>
                )}
              </div>

              <div>
                <span
                  className="block text-sm font-bold mb-2"
                  style={{ color: 'var(--text)' }}
                >
                  {isVi
                    ? 'Chọn khung giờ mới (08:00 – 19:00) *'
                    : 'Choose new time slot (08:00 – 19:00) *'}
                </span>
                {rescheduleSlots.length === 0 ? (
                  <p
                    className="text-xs font-bold"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {isVi
                      ? 'Không có khung giờ trống trong ngày này.'
                      : 'No available time slots on this date.'}
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {rescheduleSlots.map((slot) => {
                      const isCurrentOriginalSlot =
                        rescheduleDate === booking.date &&
                        slot.time === currentSlotStart;
                      const isSelected = rescheduleSlot === slot.time;

                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={slot.disabled}
                          data-testid={`reschedule-slot-${slot.time}`}
                          onClick={() => onChangeSlot(slot.time)}
                          className={`min-h-[48px] px-2 py-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center focus-visible:outline-2 focus-visible:outline-[#FF7F6B] ${
                            slot.disabled
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
                              : isCurrentOriginalSlot
                              ? 'var(--coral)'
                              : 'var(--border)',
                          }}
                        >
                          <span className="text-sm font-extrabold tabular-nums">
                            {slot.time}
                          </span>
                          {isCurrentOriginalSlot && (
                            <span className="text-[10px] font-bold">
                              {isVi ? 'Giờ hiện tại' : 'Current'}
                            </span>
                          )}
                          {!isCurrentOriginalSlot && slot.disabled && (
                            <span className="text-[10px] font-semibold">
                              {isVi ? slot.reasonVi : slot.reasonEn}
                            </span>
                          )}
                          {!isCurrentOriginalSlot && !slot.disabled && (
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
                )}
              </div>

              {rescheduleError && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="p-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-2"
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

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary min-h-[44px] px-5 py-2.5 text-sm font-bold cursor-pointer"
                >
                  {isVi ? 'Đóng' : 'Close'}
                </button>
                <button
                  type="submit"
                  data-testid="reschedule-save-btn"
                  className="btn-primary min-h-[44px] px-6 py-2.5 text-sm font-bold cursor-pointer"
                >
                  {isVi ? 'Lưu giờ hẹn mới' : 'Save new time'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <DialogTitle className="sr-only">
            {isVi ? 'Đổi ngày & giờ hẹn' : 'Reschedule appointment'}
          </DialogTitle>
        )}
      </DialogContent>
    </Dialog>
  );
};

