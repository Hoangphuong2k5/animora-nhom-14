import React from 'react';
import { CheckCircle2, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Booking, Language } from '@/types';
import { formatIsoDateForDisplay } from '@/data/serviceBookingData';
import {
  CANCEL_REASON_OPTIONS,
  getBookingModificationPolicy,
} from '@/utils/bookingHistoryUtils';

interface CancelBookingDialogProps {
  booking: Booking | null;
  lang: Language;
  darkMode: boolean;
  selectedReason: string;
  onSelectReason: (reason: string) => void;
  onClose: () => void;
  onConfirmCancel: () => void;
}

export const CancelBookingDialog = ({
  booking,
  lang,
  darkMode,
  selectedReason,
  onSelectReason,
  onClose,
  onConfirmCancel,
}: CancelBookingDialogProps) => {
  const isVi = lang === 'vi';
  const policy = booking ? getBookingModificationPolicy(booking, new Date()) : null;
  const isPrepaidPaid =
    booking?.paymentTiming === 'prepaid' && booking?.paymentState === 'paid';

  return (
    <AlertDialog
      open={Boolean(booking)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent
        data-testid="cancel-booking-dialog"
        className="data-[size=default]:max-w-[calc(100%-2rem)] data-[size=default]:sm:max-w-md max-h-[92vh] overflow-y-auto scrollbar-thin rounded-[24px] border p-6 sm:p-7 gap-5"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        {booking ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <AlertDialogTitle
                id="cancel-dialog-title"
                className="font-heading text-2xl font-extrabold leading-snug"
                style={{ color: 'var(--primary)' }}
              >
                {isVi
                  ? 'Bạn chắc chắn muốn hủy lịch này?'
                  : 'Are you sure you want to cancel this appointment?'}
              </AlertDialogTitle>
              <button
                type="button"
                onClick={onClose}
                aria-label={
                  isVi ? 'Đóng hộp thoại hủy lịch' : 'Close cancel dialog'
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

            <AlertDialogDescription
              className="text-sm font-semibold"
              style={{ color: 'var(--text-muted)' }}
            >
              {isVi
                ? `Mã lịch hẹn ${booking.code || booking.id} · Bé ${
                    booking.petName || ''
                  } (${formatIsoDateForDisplay(booking.date, lang)} · ${
                    booking.timeSlot || '09:00'
                  })`
                : `Booking ${booking.code || booking.id} · ${
                    booking.petName || ''
                  } (${formatIsoDateForDisplay(booking.date, lang)} · ${
                    booking.timeSlot || '09:00'
                  })`}
            </AlertDialogDescription>

            {isPrepaidPaid && policy ? (
              <div
                data-testid="cancel-prepaid-refund-info"
                className="p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs font-bold"
                style={{
                  backgroundColor: darkMode ? 'rgba(74, 222, 128, 0.12)' : '#EAF7EE',
                  borderColor: darkMode ? '#4ADE80' : '#9AD7AF',
                  color: darkMode ? '#4ADE80' : '#1B6B3A',
                }}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div>
                    {isVi
                      ? `Lịch hẹn đã thanh toán trước: Sẽ được hoàn lại 100% (${(policy.estimatedPrice || 0).toLocaleString('vi-VN')}đ)`
                      : `Prepaid appointment: 100% refund (${(policy.estimatedPrice || 0).toLocaleString('vi-VN')}đ)`}
                  </div>
                  <p className="font-semibold opacity-90">
                    {isVi
                      ? 'Khoản thanh toán sẽ được hoàn trả toàn bộ về phương thức thanh toán ban đầu của bạn.'
                      : 'The full payment will be refunded to your original payment method.'}
                  </p>
                </div>
              </div>
            ) : (
              <div
                data-testid="cancel-free-info"
                className="p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs font-bold"
                style={{
                  backgroundColor: darkMode ? 'rgba(56, 189, 248, 0.12)' : '#F0F9FF',
                  borderColor: darkMode ? '#38BDF8' : '#BAE6FD',
                  color: darkMode ? '#38BDF8' : '#0369A1',
                }}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div>
                    {isVi
                      ? 'Hủy lịch hẹn miễn phí (0đ)'
                      : 'Free cancellation (0 VND)'}
                  </div>
                  <p className="font-semibold opacity-90">
                    {isVi
                      ? 'Lịch hẹn trả sau tại quầy được hủy trực tiếp và không phát sinh bất kỳ khoản phí nào.'
                      : 'Postpaid appointment will be cancelled with no fees.'}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <span
                className="block text-xs font-bold"
                style={{ color: 'var(--text-muted)' }}
              >
                {isVi
                  ? 'Lý do hủy (tùy chọn):'
                  : 'Reason for cancelling (optional):'}
              </span>
              <div className="flex flex-wrap gap-2">
                {CANCEL_REASON_OPTIONS.map((opt) => {
                  const label = isVi ? opt.labelVi : opt.labelEn;
                  const isActive = selectedReason === label;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      data-testid={`cancel-reason-pill-${opt.id}`}
                      onClick={() => onSelectReason(label)}
                      className="min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
                      style={{
                        backgroundColor: isActive ? 'var(--primary)' : 'var(--bg)',
                        color: isActive ? 'var(--on-primary)' : 'var(--text)',
                        borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                data-testid="cancel-dialog-keep-btn"
                onClick={onClose}
                className="btn-secondary min-h-[44px] px-5 py-2.5 text-sm font-bold cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
              >
                {isVi ? 'Giữ lịch' : 'Keep appointment'}
              </button>

              <button
                type="button"
                data-testid="cancel-dialog-confirm-btn"
                onClick={onConfirmCancel}
                className="min-h-[44px] px-6 py-2.5 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-90 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
                style={{
                  backgroundColor: darkMode ? '#7A271A' : '#B42318',
                  color: '#FFFFFF',
                }}
              >
                {isVi ? 'Hủy lịch' : 'Cancel appointment'}
              </button>
            </div>
          </>
        ) : (
          <AlertDialogTitle className="sr-only">
            {isVi ? 'Hủy lịch hẹn' : 'Cancel appointment'}
          </AlertDialogTitle>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};

