import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Booking, Language } from '@/types';

interface ReviewBookingDialogProps {
  booking: Booking | null;
  lang: Language;
  onClose: () => void;
  onSubmitReview: (payload: {
    rating: 1 | 2 | 3 | 4 | 5;
    serviceRating: 1 | 2 | 3 | 4 | 5;
    comment: string;
  }) => void;
}

export const ReviewBookingDialog = ({
  booking,
  lang,
  onClose,
  onSubmitReview,
}: ReviewBookingDialogProps) => {
  const isVi = lang === 'vi';
  const [doctorRating, setDoctorRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [serviceRating, setServiceRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError(
        isVi
          ? 'Vui lòng nhập nhận xét ngắn về buổi chăm sóc.'
          : 'Please enter a short review comment.'
      );
      return;
    }
    onSubmitReview({
      rating: doctorRating,
      serviceRating,
      comment: comment.trim(),
    });
    setComment('');
    setError(null);
  };

  const renderStars = (
    value: number,
    onChange: (v: 1 | 2 | 3 | 4 | 5) => void,
    testIdPrefix: string
  ) => (
    <div className="flex items-center gap-1.5">
      {([1, 2, 3, 4, 5] as const).map((star) => (
        <button
          key={star}
          type="button"
          data-testid={`${testIdPrefix}-${star}`}
          onClick={() => onChange(star)}
          className="p-1 cursor-pointer transition-transform hover:scale-110"
          aria-label={`${star} sao`}
        >
          <Star
            className="w-6 h-6"
            style={{
              fill: star <= value ? '#E8A33D' : 'transparent',
              color: '#E8A33D',
            }}
          />
        </button>
      ))}
    </div>
  );

  return (
    <Dialog
      open={Boolean(booking)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        data-testid="review-booking-dialog"
        className="sm:max-w-md rounded-[24px] border p-6 sm:p-7 gap-5"
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
                  className="font-heading text-xl font-extrabold"
                  style={{ color: 'var(--primary)' }}
                >
                  {isVi
                    ? 'Đánh giá Bác sĩ & Dịch vụ'
                    : 'Rate Doctor & Service'}
                </DialogTitle>
                <DialogDescription
                  className="text-xs font-semibold mt-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {booking.code} · {booking.service}
                  {booking.doctorName ? ` · ${booking.doctorName}` : ''}
                </DialogDescription>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={isVi ? 'Đóng' : 'Close'}
                className="min-h-[40px] min-w-[40px] rounded-full border flex items-center justify-center shrink-0 cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold" style={{ color: 'var(--text)' }}>
                  {isVi
                    ? `Đánh giá ${booking.doctorName || 'Bác sĩ / Chuyên viên'}`
                    : `Rate ${booking.doctorName || 'Doctor / Specialist'}`}
                </label>
                {renderStars(doctorRating, setDoctorRating, 'doctor-rating-star')}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold" style={{ color: 'var(--text)' }}>
                  {isVi ? 'Đánh giá chất lượng dịch vụ' : 'Rate service quality'}
                </label>
                {renderStars(serviceRating, setServiceRating, 'service-rating-star')}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="booking-review-comment"
                  className="block text-xs font-bold"
                  style={{ color: 'var(--text)' }}
                >
                  {isVi ? 'Nhận xét của bạn *' : 'Your feedback *'}
                </label>
                <textarea
                  id="booking-review-comment"
                  data-testid="booking-review-comment"
                  rows={3}
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={
                    isVi
                      ? 'Chia sẻ trải nghiệm của bé và gia đình...'
                      : 'Share your pet’s experience...'
                  }
                  className="form-input w-full text-sm resize-none"
                />
                {error && (
                  <p className="text-xs font-bold text-rose-600">{error}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary min-h-[42px] px-5 py-2 text-xs font-bold cursor-pointer"
                >
                  {isVi ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  data-testid="submit-booking-review-btn"
                  className="btn-primary min-h-[42px] px-6 py-2 text-xs font-bold cursor-pointer"
                >
                  {isVi ? 'Gửi đánh giá' : 'Submit review'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <DialogTitle className="sr-only">
            {isVi ? 'Đánh giá dịch vụ' : 'Rate service'}
          </DialogTitle>
        )}
      </DialogContent>
    </Dialog>
  );
};
