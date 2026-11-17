import React from 'react';
import { Edit3 } from 'lucide-react';
import { Language } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { ServiceEntity, resolveServicePaymentTiming } from '@/data/servicesData';
import {
  calculateServiceEndTime,
  formatBookingPhoneOnBlur,
  formatIsoDateForDisplay,
  getPetTypeLabel,
  getPreferredContactLabel,
} from '@/data/serviceBookingData';
import { ServiceBookingDraft } from '@/hooks/booking/useServiceBookingWizard';

interface Step3ReviewConfirmProps {
  lang: Language;
  formState: ServiceBookingDraft;
  selectedService: ServiceEntity;
  estimatedPriceDisplay: string;
  submitError: string | null;
  errorTextColor: string;
  stepHeadingRef: React.RefObject<HTMLHeadingElement | null>;
  consentCheckboxRef: React.RefObject<HTMLButtonElement | null>;
  onGoToStep: (step: 1 | 2 | 3) => void;
  onUpdateField: <K extends keyof ServiceBookingDraft>(
    key: K,
    value: ServiceBookingDraft[K]
  ) => void;
}

export const Step3ReviewConfirm = ({
  lang,
  formState,
  selectedService,
  estimatedPriceDisplay,
  submitError,
  errorTextColor,
  stepHeadingRef,
  consentCheckboxRef,
  onGoToStep,
  onUpdateField,
}: Step3ReviewConfirmProps) => {
  const isVi = lang === 'vi';
  const paymentTiming =
    formState.paymentTiming || resolveServicePaymentTiming(selectedService);
  const durationMinutes = selectedService.durationMinutes || 45;
  const isBoarding = selectedService.id === 'boarding';
  const endTime = formState.timeSlot
    ? calculateServiceEndTime(formState.timeSlot, durationMinutes)
    : '';

  return (
    <div data-testid="booking-step-3" className="space-y-6">
      <div className="border-b pb-4" style={{ borderColor: 'var(--border)' }}>
        <h2
          ref={stepHeadingRef}
          tabIndex={-1}
          className="font-heading text-2xl font-extrabold focus:outline-none"
          style={{ color: 'var(--primary)' }}
        >
          {isVi ? 'Bước 3: Kiểm tra & xác nhận' : 'Step 3: Review & confirm'}
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {isVi
            ? 'Kiểm tra lại thông tin lịch hẹn trước khi hoàn tất gửi đăng ký.'
            : 'Review your appointment details below before submitting.'}
        </p>
      </div>

      {/* Review Card */}
      <div
        className="rounded-2xl border divide-y"
        style={{
          backgroundColor: 'var(--bg)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3
              className="font-heading text-lg font-bold"
              style={{ color: 'var(--primary)' }}
            >
              {isVi ? 'Dịch vụ & Thời gian hẹn' : 'Service & Appointment Time'}
            </h3>
            <button
              type="button"
              data-testid="review-edit-step-1"
              onClick={() => onGoToStep(1)}
              className="min-h-[36px] px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 underline cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
              style={{ color: 'var(--primary)' }}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isVi ? 'Sửa' : 'Edit'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span
                className="block text-xs font-bold"
                style={{ color: 'var(--text-muted)' }}
              >
                {isVi ? 'Dịch vụ' : 'Service'}
              </span>
              <span className="font-bold text-base" style={{ color: 'var(--text)' }}>
                {selectedService.name[lang]} ({selectedService.duration[lang]})
              </span>
            </div>

            <div>
              <span
                className="block text-xs font-bold"
                style={{ color: 'var(--text-muted)' }}
              >
                {isVi ? 'Chi phí dự kiến' : 'Estimated price'}
              </span>
              <span
                className="font-extrabold text-base"
                style={{ color: 'var(--primary)' }}
              >
                {estimatedPriceDisplay}
              </span>
            </div>

            <div>
              <span
                className="block text-xs font-bold"
                style={{ color: 'var(--text-muted)' }}
              >
                {isVi ? 'Thú cưng' : 'Pet'}
              </span>
              <span className="font-bold text-base" style={{ color: 'var(--text)' }}>
                {formState.petName || getPetTypeLabel(formState.petType, lang)}
              </span>
            </div>

            <div>
              <span
                className="block text-xs font-bold"
                style={{ color: 'var(--text-muted)' }}
              >
                {isVi ? 'Ngày & giờ hẹn' : 'Date & time'}
              </span>
              <div className="font-bold text-base tabular-nums" style={{ color: 'var(--text)' }}>
                <div>{formatIsoDateForDisplay(formState.date, lang)}</div>
                {formState.timeSlot && (
                  <div className="text-sm font-extrabold mt-0.5" style={{ color: 'var(--primary)' }}>
                    {!isBoarding ? (
                      <>
                        {formState.timeSlot} – {endTime}
                        <span className="ml-1 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
                          ({selectedService.duration[lang]})
                        </span>
                      </>
                    ) : (
                      <>
                        {formState.timeSlot} (Check-in)
                        <span className="block text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
                          {isVi ? 'Trả phòng trước 12:00 hôm sau' : 'Checkout before 12:00 next day'}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <span
                className="block text-xs font-bold"
                style={{ color: 'var(--text-muted)' }}
              >
                {isVi ? 'Bác sĩ / Chuyên viên' : 'Doctor / Specialist'}
              </span>
              <span className="font-bold text-base" style={{ color: 'var(--text)' }}>
                {formState.doctorName ||
                  (isVi ? 'Hệ thống tự điều phối phù hợp nhất' : 'Best available specialist')}
              </span>
            </div>

            <div className="sm:col-span-2 space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <span
                className="block text-xs font-extrabold uppercase tracking-wider"
                style={{ color: 'var(--primary)' }}
              >
                {isVi ? 'Chọn hình thức thanh toán *' : 'Choose payment option *'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  data-testid="payment-timing-postpaid-btn"
                  onClick={() => {
                    onUpdateField('paymentTiming', 'postpaid');
                    onUpdateField('paymentMethod', 'counter');
                  }}
                  className="p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
                  style={{
                    backgroundColor:
                      paymentTiming === 'postpaid' ? 'var(--surface-2)' : 'var(--bg)',
                    borderColor:
                      paymentTiming === 'postpaid' ? 'var(--primary)' : 'var(--border)',
                    borderWidth: paymentTiming === 'postpaid' ? 2 : 1,
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                      {isVi ? 'Thanh toán sau tại quầy' : 'Pay later at counter'}
                    </span>
                    <span
                      className="size-4 rounded-full border flex items-center justify-center shrink-0"
                      style={{
                        borderColor:
                          paymentTiming === 'postpaid' ? 'var(--primary)' : 'var(--border)',
                        backgroundColor:
                          paymentTiming === 'postpaid' ? 'var(--primary)' : 'transparent',
                      }}
                    >
                      {paymentTiming === 'postpaid' && (
                        <span className="size-1.5 rounded-full bg-white" />
                      )}
                    </span>
                  </div>
                  <span className="text-xs font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
                    {isVi
                      ? 'Thanh toán tiền mặt hoặc thẻ sau khi bé hoàn thành dịch vụ.'
                      : 'Pay with cash or card after service is completed.'}
                  </span>
                </button>

                <button
                  type="button"
                  data-testid="payment-timing-prepaid-btn"
                  onClick={() => {
                    onUpdateField('paymentTiming', 'prepaid');
                    if (formState.paymentMethod === 'counter') {
                      onUpdateField('paymentMethod', 'vnpay');
                    }
                  }}
                  className="p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
                  style={{
                    backgroundColor:
                      paymentTiming === 'prepaid' ? 'var(--surface-2)' : 'var(--bg)',
                    borderColor:
                      paymentTiming === 'prepaid' ? 'var(--primary)' : 'var(--border)',
                    borderWidth: paymentTiming === 'prepaid' ? 2 : 1,
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                      {isVi ? 'Thanh toán trước trực tuyến' : 'Prepay online'}
                    </span>
                    <span
                      className="size-4 rounded-full border flex items-center justify-center shrink-0"
                      style={{
                        borderColor:
                          paymentTiming === 'prepaid' ? 'var(--primary)' : 'var(--border)',
                        backgroundColor:
                          paymentTiming === 'prepaid' ? 'var(--primary)' : 'transparent',
                      }}
                    >
                      {paymentTiming === 'prepaid' && (
                        <span className="size-1.5 rounded-full bg-white" />
                      )}
                    </span>
                  </div>
                  <span className="text-xs font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
                    {isVi
                      ? 'Thanh toán trước qua VNPAY QR hoặc Chuyển khoản (Hoàn 100% nếu hủy).'
                      : 'Prepay via VNPAY or Bank Transfer (100% refund if cancelled).'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {paymentTiming === 'prepaid' && (
            <div
              data-testid="prepaid-method-box"
              className="mt-3 p-4 rounded-xl border space-y-2.5"
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: 'var(--border)',
              }}
            >
              <span
                className="block text-xs font-extrabold uppercase tracking-wider"
                style={{ color: 'var(--primary)' }}
              >
                {isVi
                  ? 'Chọn phương thức thanh toán trước *'
                  : 'Select online prepayment method *'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {([
                  {
                    id: 'vnpay',
                    vi: 'VNPAY QR (Xác nhận ngay)',
                    en: 'VNPAY QR (Instant)',
                  },
                  {
                    id: 'bank',
                    vi: 'Chuyển khoản ngân hàng 24/7',
                    en: '24/7 Bank Transfer',
                  },
                ] as const).map((pm) => {
                  const selected =
                    (formState.paymentMethod === 'counter'
                      ? 'vnpay'
                      : formState.paymentMethod) === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => onUpdateField('paymentMethod', pm.id)}
                      className="p-3 rounded-xl border text-left text-xs font-bold cursor-pointer transition-all"
                      style={{
                        backgroundColor: selected ? 'var(--primary)' : 'var(--bg)',
                        color: selected ? 'var(--on-primary)' : 'var(--text)',
                        borderColor: selected ? 'var(--primary)' : 'var(--border)',
                      }}
                    >
                      {isVi ? pm.vi : pm.en}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-5 space-y-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between gap-2">
            <h3
              className="font-heading text-lg font-bold"
              style={{ color: 'var(--primary)' }}
            >
              {isVi ? 'Thông tin liên hệ & Ghi chú' : 'Contact Details & Notes'}
            </h3>
            <button
              type="button"
              data-testid="review-edit-step-2"
              onClick={() => onGoToStep(2)}
              className="min-h-[36px] px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 underline cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
              style={{ color: 'var(--primary)' }}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isVi ? 'Sửa' : 'Edit'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span
                className="block text-xs font-bold"
                style={{ color: 'var(--text-muted)' }}
              >
                {isVi ? 'Họ tên & Điện thoại' : 'Name & Phone'}
              </span>
              <span
                className="font-bold text-base tabular-nums"
                style={{ color: 'var(--text)' }}
              >
                {formState.fullName} · {formatBookingPhoneOnBlur(formState.phoneDigits)}
              </span>
            </div>

            <div>
              <span
                className="block text-xs font-bold"
                style={{ color: 'var(--text-muted)' }}
              >
                {isVi ? 'Liên hệ qua' : 'Preferred contact'}
              </span>
              <span className="font-bold text-base" style={{ color: 'var(--text)' }}>
                {getPreferredContactLabel(formState.preferredContact, lang)}
              </span>
            </div>

            {(formState.petBreed ||
              formState.petAge ||
              formState.petWeight ||
              formState.petAllergies) && (
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {formState.petBreed && (
                  <div>
                    <span
                      className="block text-xs font-bold"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {isVi ? 'Giống' : 'Breed'}
                    </span>
                    <span className="font-semibold" style={{ color: 'var(--text)' }}>
                      {formState.petBreed}
                    </span>
                  </div>
                )}
                {formState.petAge && (
                  <div>
                    <span
                      className="block text-xs font-bold"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {isVi ? 'Tuổi' : 'Age'}
                    </span>
                    <span className="font-semibold" style={{ color: 'var(--text)' }}>
                      {formState.petAge}
                    </span>
                  </div>
                )}
                {formState.petWeight && (
                  <div>
                    <span
                      className="block text-xs font-bold"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {isVi ? 'Cân nặng' : 'Weight'}
                    </span>
                    <span className="font-semibold" style={{ color: 'var(--text)' }}>
                      {formState.petWeight}
                    </span>
                  </div>
                )}
                {formState.petAllergies && (
                  <div>
                    <span
                      className="block text-xs font-bold"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {isVi ? 'Dị ứng' : 'Allergies'}
                    </span>
                    <span className="font-semibold" style={{ color: 'var(--text)' }}>
                      {formState.petAllergies}
                    </span>
                  </div>
                )}
              </div>
            )}

            {formState.note && (
              <div className="sm:col-span-2">
                <span
                  className="block text-xs font-bold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {isVi ? 'Tình trạng hiện tại' : 'Current condition'}
                </span>
                <span className="font-semibold" style={{ color: 'var(--text)' }}>
                  {formState.note}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-3 pt-1">
        <label
          htmlFor="booking-consent-checkbox"
          className="flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer select-none focus-within:outline-2 focus-within:outline-[#FF7F6B]"
          style={{
            backgroundColor: 'var(--bg)',
            borderColor: 'var(--border)',
          }}
        >
          <Checkbox
            ref={consentCheckboxRef}
            id="booking-consent-checkbox"
            data-testid="booking-consent-checkbox"
            aria-required="true"
            checked={formState.consentContact}
            onCheckedChange={(checked) =>
              onUpdateField('consentContact', Boolean(checked))
            }
            className="mt-1 size-5 rounded shrink-0 cursor-pointer data-checked:bg-[var(--primary)] data-checked:border-[var(--primary)] data-checked:text-[var(--on-primary)]"
          />
          <span
            className="text-sm font-bold leading-relaxed"
            style={{ color: 'var(--text)' }}
          >
            {isVi
              ? 'Tôi đồng ý để Animora liên hệ xác nhận lịch hẹn *'
              : 'I agree to let Animora contact me to confirm the appointment *'}
          </span>
        </label>

        {(selectedService.id === 'spa' || selectedService.id === 'boarding') && (
          <label
            htmlFor="booking-vaccine-checkbox"
            className="flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer select-none focus-within:outline-2 focus-within:outline-[#FF7F6B]"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
            }}
          >
            <Checkbox
              id="booking-vaccine-checkbox"
              data-testid="booking-vaccine-checkbox"
              checked={formState.vaccinatedConfirmed}
              onCheckedChange={(checked) =>
                onUpdateField('vaccinatedConfirmed', Boolean(checked))
              }
              className="mt-1 size-5 rounded shrink-0 cursor-pointer data-checked:bg-[var(--primary)] data-checked:border-[var(--primary)] data-checked:text-[var(--on-primary)]"
            />
            <span
              className="text-sm font-semibold leading-relaxed"
              style={{ color: 'var(--text)' }}
            >
              {isVi
                ? 'Bé đã được tiêm phòng đầy đủ theo khuyến cáo'
                : 'My pet is up to date on recommended vaccinations'}
            </span>
          </label>
        )}

        <div
          className="space-y-1.5 pt-2 text-[13px]"
          style={{ color: 'var(--text-muted)' }}
        >
          <p>
            {isVi
              ? 'Thông tin của bạn chỉ được dùng để xử lý lịch hẹn và liên hệ với bạn.'
              : 'Your information is only used to process your appointment and contact you.'}
          </p>
          <p className="font-semibold" style={{ color: 'var(--text)' }}>
            {isVi
              ? 'Chính sách thanh toán & hủy hẹn: Bạn có thể chọn thanh toán trước hoặc trả sau tại quầy. Hủy lịch hẹn miễn phí bất kỳ lúc nào trước giờ hẹn; các đơn thanh toán trước sẽ được hoàn trả 100% về phương thức ban đầu.'
              : 'Policy: You can choose to prepay online or pay after at the counter. Free cancellation at any time before the appointment; prepaid bookings will be 100% refunded to the original method.'}
          </p>
        </div>
      </div>

      {submitError && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 rounded-2xl border flex items-center justify-between gap-3"
          style={{
            backgroundColor: 'var(--surface-2)',
            borderColor: errorTextColor,
            color: errorTextColor,
          }}
        >
          <span className="text-sm font-bold">{submitError}</span>
          <button type="submit" className="btn-primary px-4 py-2 text-xs font-bold shrink-0">
            {isVi ? 'Thử lại' : 'Retry'}
          </button>
        </div>
      )}
    </div>
  );
};

