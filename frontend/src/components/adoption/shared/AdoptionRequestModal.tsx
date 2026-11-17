import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';
import { AdoptionPet, AdoptionRequest, Language } from '@/types';
import {
  getSpeciesDisplayName,
  validateAdoptionForm,
  AdoptionFormValues,
  AdoptionFormFieldErrors,
} from '@/data/adoptionData';
import { findDuplicateAdoptionRequest } from '@/utils/adoptionFormLogic';
import { safeGetStorage } from '@/utils/cartLogic';

export interface AdoptionRequestModalProps {
  pet: AdoptionPet | null;
  lang: Language;
  onClose: () => void;
  onSubmitRequest: (req: AdoptionRequest) => boolean | void;
}

export const AdoptionRequestModal = ({
  pet,
  lang,
  onClose,
  onSubmitRequest,
}: AdoptionRequestModalProps) => {
  const [values, setValues] = useState<AdoptionFormValues>({
    applicantName: '',
    phone: '',
    email: '',
    area: pet ? (lang === 'vi' ? pet.area || 'TP.HCM' : pet.areaEn || pet.area || 'Ho Chi Minh City') : 'TP.HCM',
    hadPetBefore: '',
    livingCondition: '',
    notes: '',
    agreedCommitment: false,
  });
  const [errors, setErrors] = useState<AdoptionFormFieldErrors>({});

  useEffect(() => {
    if (pet) {
      setValues({
        applicantName: '',
        phone: '',
        email: '',
        area: lang === 'vi' ? pet.area || 'TP.HCM' : pet.areaEn || pet.area || 'Ho Chi Minh City',
        hadPetBefore: '',
        livingCondition: '',
        notes: '',
        agreedCommitment: false,
      });
      setErrors({});
    }
  }, [pet, lang]);

  const handleFieldChange = <K extends keyof AdoptionFormValues>(
    field: K,
    val: AdoptionFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pet) return;
    const validation = validateAdoptionForm(values);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const newReq: AdoptionRequest = {
      id: 'req-' + Date.now(),
      petId: pet.id,
      petSlug: pet.slug,
      petName: pet.name,
      applicantName: values.applicantName.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      area: values.area.trim() || pet.area,
      hadPetBefore: values.hadPetBefore === 'yes',
      livingCondition: values.livingCondition as 'house' | 'apartment' | 'other',
      notes: values.notes.trim(),
      agreedCommitment: values.agreedCommitment,
      createdAt: new Date().toISOString(),
    };

    const existing = safeGetStorage<AdoptionRequest[]>('animora_adoption_requests_v2', []);
    if (findDuplicateAdoptionRequest(existing, newReq)) {
      setErrors((prev) => ({
        ...prev,
        phone: {
          vi: `Bạn đã gửi yêu cầu nhận nuôi cho bé ${pet.name} trước đó rồi`,
          en: `You already submitted an active adoption request for ${pet.name}`,
        },
      }));
      return;
    }

    const ok = onSubmitRequest(newReq);
    if (ok === false) return;
    onClose();
  };

  return (
    <Sheet
      open={Boolean(pet)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="right"
        showCloseButton={false}
        data-testid="adoption-request-modal"
        className="w-full data-[side=right]:w-full data-[side=right]:sm:max-w-xl p-0 gap-0 flex flex-col h-full bg-(--surface) border-l border-(--border) shadow-2xl"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        {pet ? (
          <>
            {/* Pet Header with pre-filled pet name */}
            <div
              className="flex items-center justify-between gap-4 px-6 sm:px-8 pt-6 sm:pt-8 pb-5 border-b shrink-0 relative"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-4 min-w-0 pr-10">
                <img loading="lazy" decoding="async"
                  src={pet.photo}
                  alt={pet.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-full object-cover border-2 shrink-0"
                  style={{ borderColor: '#F4B6C2', objectPosition: 'center 30%' }}
                />
                <div className="min-w-0">
                  <span
                    className="text-[12px] font-bold uppercase tracking-[0.12em] block"
                    style={{ color: '#FF7F6B' }}
                  >
                    {lang === 'vi' ? 'ĐƠN ĐĂNG KÝ NHẬN NUÔI' : 'ADOPTION APPLICATION'}
                  </span>
                  <SheetTitle
                    id="adoption-form-modal-title"
                    className="font-heading text-2xl sm:text-3xl font-bold"
                    style={{ color: 'var(--primary)' }}
                  >
                    {lang === 'vi' ? `Nhận nuôi ${pet.name}` : `Adopt ${pet.name}`}
                  </SheetTitle>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    {getSpeciesDisplayName(pet.species, lang)} ·{' '}
                    {lang === 'vi' ? pet.breed : pet.breedEn || pet.breed} ·{' '}
                    {lang === 'vi' ? pet.age : pet.ageEn || pet.age}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label={lang === 'vi' ? 'Đóng biểu mẫu' : 'Close form'}
                className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center border transition-colors hover:bg-[var(--surface-2)] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text-muted)',
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ScrollArea className="flex-1 min-h-0 overflow-hidden">
              <div className="p-6 sm:p-8 pt-5">
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Pet Name (Pre-filled read-only field for clarity) */}
          <div>
            <label
              htmlFor="adopt-pet-name-input"
              className="block text-xs font-bold mb-1"
              style={{ color: 'var(--text-muted)' }}
            >
              {lang === 'vi' ? 'Bé đăng ký nhận nuôi' : 'Selected pet'}
            </label>
            <input
              id="adopt-pet-name-input"
              type="text"
              readOnly
              value={`${pet.name} (${lang === 'vi' ? pet.breed : pet.breedEn || pet.breed})`}
              className="w-full h-11 px-4 rounded-xl border text-sm font-bold opacity-85 cursor-default"
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: 'var(--border)',
                color: 'var(--primary)',
              }}
            />
          </div>

          {/* Row 1: Họ tên* & Số điện thoại* */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="adopt-name-input"
                className="block text-xs font-bold mb-1"
                style={{ color: 'var(--text)' }}
              >
                {lang === 'vi' ? 'Họ tên *' : 'Full name *'}
              </label>
              <input
                id="adopt-name-input"
                data-testid="adopt-input-name"
                type="text"
                value={values.applicantName}
                onChange={(e) => handleFieldChange('applicantName', e.target.value)}
                placeholder={lang === 'vi' ? 'Nguyễn Văn A' : 'Alex Nguyen'}
                className="form-input w-full"
                aria-invalid={Boolean(errors.applicantName)}
              />
              {errors.applicantName && (
                <p
                  data-testid="adopt-error-name"
                  className="text-xs font-semibold mt-1 text-[#DC2626]"
                >
                  {lang === 'vi' ? errors.applicantName.vi : errors.applicantName.en}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="adopt-phone-input"
                className="block text-xs font-bold mb-1"
                style={{ color: 'var(--text)' }}
              >
                {lang === 'vi' ? 'Số điện thoại *' : 'Phone number *'}
              </label>
              <input
                id="adopt-phone-input"
                data-testid="adopt-input-phone"
                type="tel"
                value={values.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="0901234567"
                className="form-input w-full"
                aria-invalid={Boolean(errors.phone)}
              />
              {errors.phone && (
                <p
                  data-testid="adopt-error-phone"
                  className="text-xs font-semibold mt-1 text-[#DC2626]"
                >
                  {lang === 'vi' ? errors.phone.vi : errors.phone.en}
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Email* & Khu vực */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="adopt-email-input"
                className="block text-xs font-bold mb-1"
                style={{ color: 'var(--text)' }}
              >
                {lang === 'vi' ? 'Email *' : 'Email *'}
              </label>
              <input
                id="adopt-email-input"
                data-testid="adopt-input-email"
                type="email"
                value={values.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                placeholder="ban@email.com"
                className="form-input w-full"
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && (
                <p
                  data-testid="adopt-error-email"
                  className="text-xs font-semibold mt-1 text-[#DC2626]"
                >
                  {lang === 'vi' ? errors.email.vi : errors.email.en}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="adopt-area-input"
                className="block text-xs font-bold mb-1"
                style={{ color: 'var(--text)' }}
              >
                {lang === 'vi' ? 'Khu vực sinh sống' : 'Your area / city'}
              </label>
              <input
                id="adopt-area-input"
                data-testid="adopt-input-area"
                type="text"
                value={values.area}
                onChange={(e) => handleFieldChange('area', e.target.value)}
                placeholder={lang === 'vi' ? 'Đà Nẵng / TP.HCM / Hà Nội' : 'Da Nang / HCMC / Hanoi'}
                className="form-input w-full"
              />
            </div>
          </div>

          {/* Row 3: "Bạn đã từng nuôi thú cưng chưa?" (Yes/No) */}
          <div>
            <span className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text)' }}>
              {lang === 'vi'
                ? 'Bạn đã từng nuôi thú cưng chưa? *'
                : 'Have you owned a pet before? *'}
            </span>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'yes', labelVi: 'Đã từng nuôi', labelEn: 'Yes, I have' },
                { id: 'no', labelVi: 'Chưa từng (Lần đầu)', labelEn: 'No (First time)' },
              ].map((opt) => {
                const selected = values.hadPetBefore === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    data-testid={`adopt-exp-${opt.id}`}
                    onClick={() =>
                      handleFieldChange('hadPetBefore', opt.id as 'yes' | 'no')
                    }
                    className="h-11 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
                    style={{
                      backgroundColor: selected ? 'var(--primary)' : 'var(--bg)',
                      color: selected ? 'var(--on-primary)' : 'var(--text)',
                      borderColor: selected ? 'var(--primary)' : 'var(--border)',
                    }}
                  >
                    {lang === 'vi' ? opt.labelVi : opt.labelEn}
                  </button>
                );
              })}
            </div>
            {errors.hadPetBefore && (
              <p
                data-testid="adopt-error-exp"
                className="text-xs font-semibold mt-1 text-[#DC2626]"
              >
                {lang === 'vi' ? errors.hadPetBefore.vi : errors.hadPetBefore.en}
              </p>
            )}
          </div>

          {/* Row 4: "Điều kiện sống" (Nhà riêng / Chung cư / Khác) */}
          <div>
            <span className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text)' }}>
              {lang === 'vi' ? 'Điều kiện sống *' : 'Living condition *'}
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'house', labelVi: 'Nhà riêng', labelEn: 'House' },
                { id: 'apartment', labelVi: 'Chung cư', labelEn: 'Apartment' },
                { id: 'other', labelVi: 'Khác', labelEn: 'Other' },
              ].map((opt) => {
                const selected = values.livingCondition === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    data-testid={`adopt-living-${opt.id}`}
                    onClick={() =>
                      handleFieldChange(
                        'livingCondition',
                        opt.id as 'house' | 'apartment' | 'other'
                      )
                    }
                    className="h-11 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
                    style={{
                      backgroundColor: selected ? 'var(--primary)' : 'var(--bg)',
                      color: selected ? 'var(--on-primary)' : 'var(--text)',
                      borderColor: selected ? 'var(--primary)' : 'var(--border)',
                    }}
                  >
                    {lang === 'vi' ? opt.labelVi : opt.labelEn}
                  </button>
                );
              })}
            </div>
            {errors.livingCondition && (
              <p
                data-testid="adopt-error-living"
                className="text-xs font-semibold mt-1 text-[#DC2626]"
              >
                {lang === 'vi' ? errors.livingCondition.vi : errors.livingCondition.en}
              </p>
            )}
          </div>

          {/* Row 5: Lời nhắn (optional) */}
          <div>
            <label
              htmlFor="adopt-notes-input"
              className="block text-xs font-bold mb-1"
              style={{ color: 'var(--text)' }}
            >
              {lang === 'vi' ? 'Lời nhắn (không bắt buộc)' : 'Message (optional)'}
            </label>
            <Textarea
              id="adopt-notes-input"
              data-testid="adopt-input-notes"
              rows={3}
              value={values.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              placeholder={
                lang === 'vi'
                  ? 'Chia sẻ thêm về thời gian rảnh hoặc mong muốn của gia đình bạn...'
                  : 'Share a bit about your daily schedule or household...'
              }
              className="form-input w-full min-h-[84px] h-auto py-2.5"
            />
          </div>

          {/* Row 6: Consent checkbox "Tôi cam kết chăm sóc bé tận tâm" */}
          <div>
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <Checkbox
                data-testid="adopt-checkbox-consent"
                checked={values.agreedCommitment}
                onCheckedChange={(checked) =>
                  handleFieldChange('agreedCommitment', Boolean(checked))
                }
                aria-invalid={Boolean(errors.agreedCommitment)}
                className="mt-0.5 shrink-0 cursor-pointer data-checked:bg-(--primary) data-checked:border-(--primary) data-checked:text-(--on-primary)"
              />
              <span className="text-xs font-semibold leading-relaxed" style={{ color: 'var(--text)' }}>
                {lang === 'vi'
                  ? 'Tôi cam kết chăm sóc bé tận tâm'
                  : 'I commit to caring for this pet wholeheartedly'}
              </span>
            </label>
            {errors.agreedCommitment && (
              <p
                data-testid="adopt-error-consent"
                className="text-xs font-semibold mt-1 text-[#DC2626]"
              >
                {lang === 'vi' ? errors.agreedCommitment.vi : errors.agreedCommitment.en}
              </p>
            )}
          </div>

                  {/* Submit button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      data-testid="adopt-submit-btn"
                      className="w-full h-[46px] rounded-full text-sm font-bold cursor-pointer transition-colors bg-[var(--primary)] text-[var(--on-primary)] hover:!bg-[#FF7F6B] hover:!text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7F6B]"
                    >
                      {lang === 'vi' ? 'Gửi đăng ký nhận nuôi' : 'Submit adoption request'}
                    </button>
                  </div>
                </form>
              </div>
            </ScrollArea>
          </>
        ) : (
          <SheetTitle className="sr-only">
            {lang === 'vi' ? 'Đơn đăng ký nhận nuôi' : 'Adoption application'}
          </SheetTitle>
        )}
      </SheetContent>
    </Sheet>
  );
};
