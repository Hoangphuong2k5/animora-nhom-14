import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Check, CheckCircle2 } from 'lucide-react';
import {
  formatPhone433,
  validatePhoneDigits,
  VIETNAMESE_PROVINCES,
} from '@/utils/adoptionFormLogic';
import {
  BEST_TIME_OPTIONS,
  DraftFormData,
  FormErrors,
  PREFERRED_CONTACT_OPTIONS,
} from './applyTypes';

interface ApplyStep1PersonalInfoProps {
  isEn: boolean;
  formData: DraftFormData;
  setFormData: React.Dispatch<React.SetStateAction<DraftFormData>>;
  errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
  isPhoneFocused: boolean;
  setIsPhoneFocused: React.Dispatch<React.SetStateAction<boolean>>;
  phoneInputRef: React.RefObject<HTMLInputElement | null>;
  provinceItems: Record<string, string>;
  onPhoneInputChange: (raw: string) => void;
  onPhonePaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onPhoneBlur: () => void;
  onNextStep: () => void;
}

export const ApplyStep1PersonalInfo: React.FC<ApplyStep1PersonalInfoProps> = ({
  isEn,
  formData,
  setFormData,
  errors,
  setErrors,
  isPhoneFocused,
  setIsPhoneFocused,
  phoneInputRef,
  provinceItems,
  onPhoneInputChange,
  onPhonePaste,
  onPhoneBlur,
  onNextStep,
}) => {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="border-b border-[var(--border)] pb-4">
        <h2 className="text-xl font-bold font-heading text-[var(--primary)]">
          {isEn ? 'Step 1: Your Contact Information' : 'Bước 1: Thông tin liên hệ của bạn'}
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
          {isEn
            ? 'We will reach out to verify and guide you through the next adoption steps.'
            : 'Animora cam kết bảo mật tuyệt đối thông tin cá nhân của bạn.'}
        </p>
      </div>

      {/* Full Name */}
      <div>
        <label htmlFor="applicantName" className="block text-sm font-bold text-[var(--text)] mb-1.5">
          {isEn ? 'Full name *' : 'Họ và tên *'}
        </label>
        <input
          id="applicantName"
          name="applicantName"
          type="text"
          value={formData.applicantName}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, applicantName: e.target.value }));
            if (errors.applicantName) {
              setErrors((prev) => {
                const n = { ...prev };
                delete n.applicantName;
                return n;
              });
            }
          }}
          placeholder={isEn ? 'e.g. Nguyen Minh Anh' : 'Ví dụ: Nguyễn Minh Anh'}
          className={`form-input w-full h-[52px] text-base ${
            errors.applicantName ? 'border-red-500 focus:ring-red-400' : ''
          }`}
        />
        {errors.applicantName && (
          <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.applicantName}
          </p>
        )}
      </div>

      {/* Phone & Email (2 columns on tablet+) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-bold text-[var(--text)] mb-1.5">
            {isEn ? 'Phone number *' : 'Số điện thoại liên hệ *'}
          </label>
          <div className="relative">
            <input
              ref={phoneInputRef}
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={isPhoneFocused ? formData.phoneDigits : formatPhone433(formData.phoneDigits)}
              onFocus={() => setIsPhoneFocused(true)}
              onBlur={onPhoneBlur}
              onChange={(e) => onPhoneInputChange(e.target.value)}
              onPaste={onPhonePaste}
              placeholder="0912 345 678"
              className={`form-input w-full h-[52px] text-base pr-10 ${
                errors.phone ? 'border-red-500 focus:ring-red-400' : ''
              }`}
            />
            {validatePhoneDigits(formData.phoneDigits, isEn).isValid && (
              <div
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400 pointer-events-none flex items-center justify-center"
                aria-label={isEn ? 'Valid number' : 'Số hợp lệ'}
              >
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              </div>
            )}
          </div>
          {errors.phone ? (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.phone}
            </p>
          ) : (
            <p className="text-[13px] text-[var(--text-muted)] mt-1.5 font-normal leading-relaxed">
              {isEn
                ? 'Enter 10 digits starting with 03, 05, 07, 08, or 09'
                : 'Nhập 10 số, bắt đầu bằng 03, 05, 07, 08 hoặc 09'}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-[var(--text)] mb-1.5">
            {isEn ? 'Email address *' : 'Địa chỉ email *'}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, email: e.target.value }));
              if (errors.email) {
                setErrors((prev) => {
                  const n = { ...prev };
                  delete n.email;
                  return n;
                });
              }
            }}
            placeholder="minhanh@example.com"
            className={`form-input w-full h-[52px] text-base ${
              errors.email ? 'border-red-500 focus:ring-red-400' : ''
            }`}
          />
          {errors.email ? (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.email}
            </p>
          ) : (
            <p className="text-[13px] text-[var(--text-muted)] mt-1.5 font-normal leading-relaxed">
              {isEn
                ? 'We only use this to send confirmation and contact you'
                : 'Chúng tôi chỉ dùng để gửi xác nhận và liên hệ'}
            </p>
          )}
        </div>
      </div>

      {/* Living Area (Province/City) */}
      <div>
        <label htmlFor="area" className="block text-sm font-bold text-[var(--text)] mb-1.5">
          {isEn ? 'Current living province / city *' : 'Tỉnh / Thành phố sinh sống hiện tại *'}
        </label>
        <Select
          name="area"
          value={formData.area || '__empty__'}
          onValueChange={(val) => {
            if (val !== null) {
              const nextArea = val === '__empty__' ? '' : val;
              setFormData((prev) => ({ ...prev, area: nextArea }));
              if (errors.area && nextArea) {
                setErrors((prev) => {
                  const n = { ...prev };
                  delete n.area;
                  return n;
                });
              }
            }
          }}
          items={provinceItems}
        >
          <SelectTrigger
            id="area"
            aria-invalid={Boolean(errors.area)}
            className={`form-input w-full h-12! text-base cursor-pointer ${
              errors.area ? 'border-red-500 focus:ring-red-400' : ''
            }`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-(--surface) border-(--border) text-(--text) max-h-72">
            <SelectItem value="__empty__" disabled>
              {isEn ? 'Select province/city' : 'Chọn tỉnh/thành'}
            </SelectItem>
            {formData.area && !VIETNAMESE_PROVINCES.includes(formData.area) && (
              <SelectItem value={formData.area}>{formData.area}</SelectItem>
            )}
            {VIETNAMESE_PROVINCES.map((prov) => (
              <SelectItem key={prov} value={prov}>
                {prov}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.area && (
          <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.area}
          </p>
        )}
      </div>

      {/* Preferred Contact Method Pills */}
      <div>
        <label className="block text-sm font-bold text-[var(--text)] mb-2">
          {isEn ? 'Preferred contact channel' : 'Hình thức liên hệ bạn thuận tiện nhất'}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {PREFERRED_CONTACT_OPTIONS.map((item) => {
            const isSelected = formData.preferredContact === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    preferredContact: item.id as 'phone' | 'zalo' | 'email',
                  }))
                }
                className={`min-h-[46px] py-2.5 px-3.5 rounded-full text-sm font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isSelected
                    ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)] shadow-sm'
                    : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--surface-2)]'
                }`}
              >
                {isSelected && <Check className="w-4 h-4 stroke-[3] shrink-0" />}
                <span>{isEn ? item.labelEn : item.labelVi}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Best Time To Call Pills */}
      <div>
        <label className="block text-sm font-bold text-[var(--text)] mb-2">
          {isEn ? 'Convenient time for consultation' : 'Khung giờ thuận tiện để nghe máy'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {BEST_TIME_OPTIONS.map((item) => {
            const isSelected = formData.bestTime === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    bestTime: item.id as 'morning' | 'afternoon' | 'evening' | 'anytime',
                  }))
                }
                className={`min-h-[46px] py-2.5 px-3 rounded-xl text-sm font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)] shadow-sm'
                    : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--surface-2)]'
                }`}
              >
                {isSelected && <Check className="w-4 h-4 stroke-[3] shrink-0" />}
                <span className="text-center">{isEn ? item.labelEn : item.labelVi}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 1 Actions */}
      <div className="pt-4 flex justify-end">
        <button
          type="button"
          onClick={onNextStep}
          className="btn-primary px-8 py-3.5 cursor-pointer text-base inline-flex items-center gap-2"
        >
          <span>{isEn ? 'Next: Home & Conditions →' : 'Tiếp tục: Điều kiện nuôi →'}</span>
        </button>
      </div>
    </div>
  );
};
