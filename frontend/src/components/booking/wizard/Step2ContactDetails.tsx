import React from 'react';
import { AlertCircle, PawPrint } from 'lucide-react';
import { BookingPetTypeId, Language, Pet } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BOOKING_PET_TYPES,
  BOOKING_PREFERRED_CONTACTS,
  formatBookingPhoneOnBlur,
} from '@/data/serviceBookingData';
import { ServiceBookingDraft } from '@/hooks/booking/useServiceBookingWizard';

interface Step2ContactDetailsProps {
  lang: Language;
  formState: ServiceBookingDraft;
  selectedSavedPet: Pet | null;
  isPhoneFocused: boolean;
  touched: Record<string, boolean>;
  step2Submitted: boolean;
  step2Errors: {
    fullName?: string;
    phone?: string;
    email?: string;
    petName?: string;
    petType?: string;
  };
  errorTextColor: string;
  stepHeadingRef: React.RefObject<HTMLHeadingElement | null>;
  fullNameInputRef: React.RefObject<HTMLInputElement | null>;
  phoneInputRef: React.RefObject<HTMLInputElement | null>;
  emailInputRef: React.RefObject<HTMLInputElement | null>;
  petNameInputRef: React.RefObject<HTMLInputElement | null>;
  onChangePet?: () => void;
  onUpdateField: <K extends keyof ServiceBookingDraft>(
    key: K,
    value: ServiceBookingDraft[K]
  ) => void;
  onMarkTouched: (field: string) => void;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhonePaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onPhoneFocus: () => void;
  onPhoneBlur: () => void;
}

export const Step2ContactDetails = ({
  lang,
  formState,
  selectedSavedPet,
  isPhoneFocused,
  touched,
  step2Submitted,
  step2Errors,
  errorTextColor,
  stepHeadingRef,
  fullNameInputRef,
  phoneInputRef,
  petNameInputRef,
  onChangePet,
  onUpdateField,
  onMarkTouched,
  onPhoneChange,
  onPhonePaste,
  onPhoneFocus,
  onPhoneBlur,
}: Step2ContactDetailsProps) => {
  const isVi = lang === 'vi';

  return (
    <div data-testid="booking-step-2" className="space-y-6">
      <div className="border-b pb-4" style={{ borderColor: 'var(--border)' }}>
        <h2
          ref={stepHeadingRef}
          tabIndex={-1}
          className="font-heading text-2xl font-extrabold focus:outline-none"
          style={{ color: 'var(--primary)' }}
        >
          {isVi ? 'Bước 2: Thông tin liên hệ' : 'Step 2: Your details'}
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {isVi
            ? 'Điền thông tin của bạn và bé để đội ngũ Animora chuẩn bị chu đáo trước giờ hẹn.'
            : 'Provide your contact and pet details so our team can prepare for your visit.'}
        </p>
      </div>

      {/* Row 1: Họ tên * & Số điện thoại * */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        <div className="space-y-1.5">
          <label
            htmlFor="booking-full-name"
            className="block text-[14px] font-bold"
            style={{ color: 'var(--text)' }}
          >
            {isVi ? 'Họ tên *' : 'Full name *'}
          </label>
          <input
            ref={fullNameInputRef}
            id="booking-full-name"
            data-testid="booking-full-name"
            type="text"
            aria-required="true"
            aria-invalid={Boolean(
              (touched.fullName || step2Submitted) && step2Errors.fullName
            )}
            value={formState.fullName}
            onChange={(e) => onUpdateField('fullName', e.target.value)}
            onBlur={() => onMarkTouched('fullName')}
            placeholder={isVi ? 'Nguyễn Minh Anh' : 'Nguyen Minh Anh'}
            className="w-full h-[52px] px-4 rounded-[14px] border text-[16px] focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor:
                (touched.fullName || step2Submitted) && step2Errors.fullName
                  ? errorTextColor
                  : 'var(--border)',
              color: 'var(--text)',
            }}
          />
          <div className="min-h-[20px]" aria-live="polite">
            {(touched.fullName || step2Submitted) && step2Errors.fullName ? (
              <p
                className="text-[14px] font-semibold flex items-center gap-1.5"
                style={{ color: errorTextColor }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{step2Errors.fullName}</span>
              </p>
            ) : (
              <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                {isVi ? 'Tối thiểu 2 ký tự' : 'At least 2 characters'}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="booking-phone"
            className="block text-[14px] font-bold"
            style={{ color: 'var(--text)' }}
          >
            {isVi ? 'Số điện thoại *' : 'Phone number *'}
          </label>
          <input
            ref={phoneInputRef}
            id="booking-phone"
            data-testid="booking-phone"
            type="tel"
            inputMode="numeric"
            aria-required="true"
            aria-invalid={Boolean(
              (touched.phone || step2Submitted) && step2Errors.phone
            )}
            value={
              isPhoneFocused
                ? formState.phoneDigits
                : formatBookingPhoneOnBlur(formState.phoneDigits)
            }
            onChange={onPhoneChange}
            onPaste={onPhonePaste}
            onFocus={onPhoneFocus}
            onBlur={onPhoneBlur}
            placeholder="0912 345 678"
            className="w-full h-[52px] px-4 rounded-[14px] border text-[16px] tabular-nums focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor:
                (touched.phone || step2Submitted) && step2Errors.phone
                  ? errorTextColor
                  : 'var(--border)',
              color: 'var(--text)',
            }}
          />
          <div className="min-h-[20px]" aria-live="polite">
            {(touched.phone || step2Submitted) && step2Errors.phone ? (
              <p
                data-testid="booking-phone-error"
                className="text-[14px] font-semibold flex items-center gap-1.5"
                style={{ color: errorTextColor }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{step2Errors.phone}</span>
              </p>
            ) : (
              <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                {isVi
                  ? '10 số di động VN (03, 05, 07, 08, 09)'
                  : '10-digit VN mobile (03, 05, 07, 08, 09)'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Thú cưng: tóm tắt nếu đã chọn từ hồ sơ ở Bước 1, ngược lại hiện form tối giản */}
      {selectedSavedPet ? (
        <div
          data-testid="selected-pet-summary-card"
          className="rounded-2xl border px-4 py-3.5 flex items-center justify-between gap-3"
          style={{
            backgroundColor: 'var(--bg)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{
                backgroundColor: 'var(--surface-2)',
                color: 'var(--primary)',
              }}
            >
              <PawPrint className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {isVi ? 'Bé đã chọn' : 'Selected pet'}
                </span>
                <span className="text-[15px] font-extrabold" style={{ color: 'var(--text)' }}>
                  {selectedSavedPet.name}
                </span>
              </div>
              <p className="text-[13px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                {[formState.petType, formState.petWeight]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          </div>
          {onChangePet && (
            <button
              type="button"
              onClick={onChangePet}
              className="shrink-0 px-3 py-1.5 rounded-full border text-xs font-bold transition-colors cursor-pointer hover:opacity-80"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--primary)',
                backgroundColor: 'var(--surface-2)',
              }}
            >
              {isVi ? 'Đổi bé' : 'Change'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
          <div className="space-y-1.5">
            <label
              htmlFor="booking-pet-name"
              className="block text-[14px] font-bold"
              style={{ color: 'var(--text)' }}
            >
              {isVi ? 'Tên của bé *' : "Pet's name *"}
            </label>
            <input
              ref={petNameInputRef}
              id="booking-pet-name"
              data-testid="booking-pet-name"
              type="text"
              aria-required="true"
              aria-invalid={Boolean(
                (touched.petName || step2Submitted) && step2Errors.petName
              )}
              value={formState.petName}
              onChange={(e) => onUpdateField('petName', e.target.value)}
              onBlur={() => onMarkTouched('petName')}
              placeholder={isVi ? 'Ví dụ: Mây Mây, Bơ...' : 'e.g. Mochi, Bella...'}
              className="w-full h-[52px] px-4 rounded-[14px] border text-[16px] focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor:
                  (touched.petName || step2Submitted) && step2Errors.petName
                    ? errorTextColor
                    : 'var(--border)',
                color: 'var(--text)',
              }}
            />
            {(touched.petName || step2Submitted) && step2Errors.petName && (
              <p
                className="text-[14px] font-semibold flex items-center gap-1.5"
                style={{ color: errorTextColor }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{step2Errors.petName}</span>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="booking-pet-type"
              className="block text-[14px] font-bold"
              style={{ color: 'var(--text)' }}
            >
              {isVi ? 'Loài *' : 'Species *'}
            </label>
            <Select
              value={formState.petType}
              onValueChange={(val) =>
                onUpdateField('petType', val as BookingPetTypeId)
              }
            >
              <SelectTrigger
                id="booking-pet-type"
                data-testid="booking-pet-type"
                aria-required="true"
                aria-invalid={Boolean(
                  (touched.petType || step2Submitted) && step2Errors.petType
                )}
                className="w-full !h-[52px] px-4 rounded-[14px] border text-[16px] font-normal focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor:
                    (touched.petType || step2Submitted) && step2Errors.petType
                      ? errorTextColor
                      : 'var(--border)',
                  color: 'var(--text)',
                }}
              >
                <SelectValue
                  placeholder={isVi ? 'Chọn loài thú cưng' : 'Select species'}
                />
              </SelectTrigger>
              <SelectContent className="bg-[var(--surface)] border-[var(--border)] text-[var(--text)]">
                {BOOKING_PET_TYPES.map((pt) => (
                  <SelectItem key={pt.id} value={pt.id}>
                    {isVi ? pt.labelVi : pt.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(touched.petType || step2Submitted) && step2Errors.petType && (
              <p
                className="text-[14px] font-semibold flex items-center gap-1.5"
                style={{ color: errorTextColor }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{step2Errors.petType}</span>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="booking-pet-weight"
              className="block text-[14px] font-bold"
              style={{ color: 'var(--text)' }}
            >
              {isVi ? 'Cân nặng' : 'Weight'}
            </label>
            <div className="relative">
              <input
                id="booking-pet-weight"
                data-testid="booking-pet-weight"
                type="text"
                inputMode="decimal"
                value={formState.petWeight.replace(/\s*kg$/i, '').trim()}
                onChange={(e) => {
                  const raw = e.target.value.replace(/kg/gi, '').trim();
                  onUpdateField('petWeight', raw ? `${raw} kg` : '');
                }}
                placeholder={isVi ? 'Ví dụ: 3.8' : 'e.g. 3.8'}
                className="w-full h-[52px] pl-4 pr-11 rounded-[14px] border text-[16px] focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              />
              <span
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-semibold pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              >
                kg
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Row 4: Cách liên hệ ưa thích */}
      <div className="space-y-2">
        <span
          className="block text-[14px] font-bold"
          style={{ color: 'var(--text)' }}
        >
          {isVi ? 'Cách liên hệ ưa thích' : 'Preferred contact method'}
        </span>
        <div
          role="radiogroup"
          aria-label={isVi ? 'Cách liên hệ ưa thích' : 'Preferred contact method'}
          className="flex flex-wrap items-center gap-2.5"
        >
          {BOOKING_PREFERRED_CONTACTS.map((c) => {
            const isSelected = formState.preferredContact === c.id;
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                data-testid={`contact-pill-${c.id}`}
                onClick={() => onUpdateField('preferredContact', c.id)}
                className="min-h-[44px] px-5 py-2 rounded-full border text-sm font-bold transition-all cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#FF7F6B] focus-visible:outline-offset-2"
                style={{
                  backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg)',
                  color: isSelected ? 'var(--on-primary)' : 'var(--text)',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                }}
              >
                {isVi ? c.labelVi : c.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 5: Tình trạng hiện tại */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="booking-note"
            className="block text-[14px] font-bold"
            style={{ color: 'var(--text)' }}
          >
            {isVi ? 'Tình trạng hiện tại' : 'Current condition'}
          </label>
          <span
            data-testid="booking-note-counter"
            className="text-[13px] font-semibold tabular-nums"
            style={{ color: 'var(--text-muted)' }}
          >
            {formState.note.length}/300
          </span>
        </div>
        <Textarea
          id="booking-note"
          data-testid="booking-note"
          rows={3}
          value={formState.note}
          onChange={(e) => onUpdateField('note', e.target.value.slice(0, 300))}
          placeholder={
            isVi
              ? 'Ví dụ: Bé ăn ít hơn 2 ngày nay, hơi mệt, ho nhẹ hoặc ngứa vùng tai...'
              : 'e.g. Eating less for 2 days, slightly tired, mild cough, or itchy ears...'
          }
          className="w-full p-4 rounded-[14px] border text-[16px] leading-relaxed focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
          style={{
            backgroundColor: 'var(--bg)',
            borderColor: 'var(--border)',
            color: 'var(--text)',
          }}
        />
        <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
          {isVi
            ? 'Chia sẻ thêm tình trạng sức khỏe hoặc biểu hiện hiện tại của bé để bác sĩ chuẩn bị trước.'
            : "Share your pet's current condition or recent symptoms so our team can prepare."}
        </p>
      </div>
    </div>
  );
};

