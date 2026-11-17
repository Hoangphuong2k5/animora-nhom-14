import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  generateAdoptionRequestCode,
  getSpeciesDisplayName,
  isPetAdopted,
} from '@/data/adoptionData';
import {
  cleanPhone,
  findDuplicateAdoptionRequest,
  validatePhoneDigits,
  VIETNAMESE_PROVINCES,
} from '@/utils/adoptionFormLogic';
import { safeGetStorage } from '@/utils/cartLogic';
import { submitAdoptionApplicationApi } from '@/services/animora/adoptionApi';
import { ApiClientError, isBusinessConflictOrValidationError } from '@/services/animora/apiClient';
import type { AdoptionRequest } from '@/types';
import {
  AdoptionApplyPageProps,
  buildAdoptionRequest,
  checkHasRestoredDraft,
  DEFAULT_FORM_DATA,
  DraftFormData,
  FormErrors,
  getPetFactChips,
  loadInitialDraftFormData,
  validateStep1Fields,
  validateStep2Fields,
} from './apply/applyTypes';
import {
  ApplyPetAlreadyAdoptedView,
  ApplyPetNotFoundView,
  ApplySuccessConfirmationView,
} from './apply/ApplyStatusViews';
import { ApplyStep1PersonalInfo } from './apply/ApplyStep1PersonalInfo';
import { ApplyStep2LivingEnv } from './apply/ApplyStep2LivingEnv';
import { ApplyStep3Commitment } from './apply/ApplyStep3Commitment';
import {
  ApplyPetSummarySidebar,
  ApplyStepProgress,
  ApplyWizardHeader,
} from './apply/ApplyPetSummarySidebar';

export type { AdoptionApplyPageProps, DraftFormData };

export const AdoptionApplyPage = ({
  lang,
  pet,
  onAddAdoptionRequest,
  onNavigate,
  onNavigateUrl,
  isSuccessView = false,
}: AdoptionApplyPageProps) => {
  const isEn = lang === 'en';
  const slug = pet?.slug || '';
  const storageKey = `adoption-draft-v2-${slug}`;
  const submittedCodeKey = `animora_submitted_code_${slug}`;

  // Form states with single source of truth for phoneDigits
  const [formData, setFormData] = useState<DraftFormData>(() =>
    loadInitialDraftFormData(slug, storageKey, pet?.area)
  );

  const [hasRestoredDraft, setHasRestoredDraft] = useState<boolean>(() =>
    checkHasRestoredDraft(slug, storageKey)
  );

  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<number>(() => {
    return formData.currentStep && formData.currentStep >= 1 && formData.currentStep <= 3
      ? formData.currentStep
      : 1;
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmittedCode, setLastSubmittedCode] = useState<string>(() => {
    if (!slug) return '';
    try {
      return localStorage.getItem(submittedCodeKey) || '';
    } catch {
      return '';
    }
  });
  const [copiedCode, setCopiedCode] = useState(false);

  const provinceItems = useMemo(() => {
    const map: Record<string, string> = {
      __empty__: isEn ? 'Select province/city' : 'Chọn tỉnh/thành',
    };
    for (const prov of VIETNAMESE_PROVINCES) {
      map[prov] = prov;
    }
    if (formData.area && !map[formData.area]) {
      map[formData.area] = formData.area;
    }
    return map;
  }, [isEn, formData.area]);

  // Anti-bot & security refs
  const mountTimeRef = useRef<number>(0);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const isDirtyRef = useRef(false);
  const submittingRef = useRef(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    mountTimeRef.current = Date.now();
  }, [slug, isSuccessView]);

  // Save draft to localStorage
  useEffect(() => {
    if (!slug || isSuccessView) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ ...formData, currentStep }));
      isDirtyRef.current = true;
    } catch {
      // ignore
    }
  }, [formData, currentStep, slug, storageKey, isSuccessView]);

  const handleClearDraft = () => {
    setFormData({
      ...DEFAULT_FORM_DATA,
      area: pet?.area || '',
    });
    setCurrentStep(1);
    setHasRestoredDraft(false);
    setErrors({});
    isDirtyRef.current = false;
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  };

  const handlePhoneInputChange = (raw: string) => {
    const cleaned = cleanPhone(raw);
    setFormData((prev) => ({ ...prev, phoneDigits: cleaned }));
    if (errors.phone) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.phone;
        return next;
      });
    }
  };

  const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const input = e.currentTarget;
    const start = input.selectionStart ?? formData.phoneDigits.length;
    const end = input.selectionEnd ?? formData.phoneDigits.length;
    const combined = formData.phoneDigits.slice(0, start) + pasted + formData.phoneDigits.slice(end);
    const cleaned = cleanPhone(combined);
    setFormData((prev) => ({ ...prev, phoneDigits: cleaned }));
    if (errors.phone) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.phone;
        return next;
      });
    }
    setTimeout(() => {
      if (phoneInputRef.current) {
        phoneInputRef.current.setSelectionRange(cleaned.length, cleaned.length);
      }
    }, 0);
  };

  const handlePhoneBlur = () => {
    setIsPhoneFocused(false);
    const result = validatePhoneDigits(formData.phoneDigits, isEn);
    if (!result.isValid && result.error) {
      setErrors((prev) => ({ ...prev, phone: result.error! }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.phone;
        return next;
      });
    }
  };

  const validateStep1 = (): boolean => {
    const errs = validateStep1Fields(formData, isEn);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errs = validateStep2Fields(formData, isEn);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleJumpToStep = (step: number) => {
    if (step === 1) {
      setCurrentStep(1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } else if (step === 2 && validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const allCommitmentsChecked =
    formData.commit1 && formData.commit2 && formData.commit3 && formData.commit4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;

    if (honeypotRef.current && honeypotRef.current.value) {
      return;
    }

    const elapsed = Date.now() - mountTimeRef.current;
    if (elapsed < 3000) {
      alert(
        isEn
          ? 'Submission too fast. Please review your information.'
          : 'Thao tác quá nhanh. Vui lòng kiểm tra lại thông tin.'
      );
      return;
    }

    if (!allCommitmentsChecked) {
      setErrors((prev) => ({
        ...prev,
        commitments: isEn
          ? 'Please check all 4 mandatory commitments to submit.'
          : 'Vui lòng đánh dấu đủ 4 cam kết bắt buộc để tiếp tục.',
      }));
      return;
    }

    if (!pet) return;

    const generatedCode = generateAdoptionRequestCode();
    const newRequest = buildAdoptionRequest(pet, formData, generatedCode);

    const existingLocalReqs = safeGetStorage<AdoptionRequest[]>('animora_adoption_requests_v2', []);
    const duplicate = findDuplicateAdoptionRequest(existingLocalReqs, newRequest);
    if (duplicate) {
      setErrors((prev) => ({
        ...prev,
        commitments: isEn
          ? `You already have an active adoption application for ${pet.name}.`
          : `Bạn đã nộp hồ sơ nhận nuôi đang chờ xử lý cho bé ${pet.name} rồi (${duplicate.requestCode || duplicate.id}).`,
      }));
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);

    const numericListingId = Number(pet.id);
    if (Number.isInteger(numericListingId) && numericListingId > 0) {
      try {
        const createdDto = await submitAdoptionApplicationApi({
          listing_id: numericListingId,
          applicant_reason: formData.notes.trim() || 'Đăng ký nhận nuôi thú cưng',
          living_environment: `${formData.housingType || ''} - ${formData.area || ''}`.trim(),
          experience_description: formData.hadPetBefore || '',
        });
        newRequest.id = String(createdDto.id);
        newRequest.requestCode = `ADP-${createdDto.id}`;
      } catch (err) {
        if (isBusinessConflictOrValidationError(err)) {
          submittingRef.current = false;
          setIsSubmitting(false);
          setErrors((prev) => ({
            ...prev,
            commitments: err.message,
          }));
          return;
        }
        if (!(err instanceof ApiClientError && (err.statusCode === 401 || err.isNetworkError))) {
          submittingRef.current = false;
          setIsSubmitting(false);
          setErrors((prev) => ({
            ...prev,
            commitments: isEn ? 'Could not submit application.' : 'Không thể gửi hồ sơ nhận nuôi.',
          }));
          return;
        }
      }
    }

    const added = onAddAdoptionRequest(newRequest);
    if (added === false) {
      submittingRef.current = false;
      setIsSubmitting(false);
      setErrors((prev) => ({
        ...prev,
        commitments: isEn
          ? `You already have an active adoption application for ${pet.name}.`
          : `Bạn đã nộp hồ sơ nhận nuôi cho bé ${pet.name} rồi.`,
      }));
      return;
    }

    try {
      localStorage.setItem(submittedCodeKey, newRequest.requestCode || generatedCode);
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    setLastSubmittedCode(newRequest.requestCode || generatedCode);
    isDirtyRef.current = false;
    submittingRef.current = false;
    setIsSubmitting(false);

    onNavigateUrl(`/nhan-nuoi/${pet.slug}/dang-ky/thanh-cong`);
  };

  const handleCopyCode = async (codeToCopy: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(codeToCopy);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2400);
      }
    } catch {
      // fallback
    }
  };

  if (!pet) {
    return <ApplyPetNotFoundView isEn={isEn} onNavigate={onNavigate} />;
  }

  if (isPetAdopted(pet) && !isSuccessView) {
    return (
      <ApplyPetAlreadyAdoptedView
        isEn={isEn}
        pet={pet}
        onNavigate={onNavigate}
        onNavigateUrl={onNavigateUrl}
      />
    );
  }

  if (isSuccessView) {
    return (
      <ApplySuccessConfirmationView
        isEn={isEn}
        pet={pet}
        lastSubmittedCode={lastSubmittedCode}
        copiedCode={copiedCode}
        onCopyCode={handleCopyCode}
        onNavigate={onNavigate}
      />
    );
  }

  const speciesLabel = getSpeciesDisplayName(pet.species, lang);
  const factChips = getPetFactChips(pet, isEn);

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-20 shared-container">
      <input
        ref={honeypotRef}
        type="text"
        name="animora_website_hp"
        tabIndex={-1}
        autoComplete="off"
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      <ApplyWizardHeader
        isEn={isEn}
        pet={pet}
        speciesLabel={speciesLabel}
        hasRestoredDraft={hasRestoredDraft}
        onNavigate={onNavigate}
        onNavigateUrl={onNavigateUrl}
        onClearDraft={handleClearDraft}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <div className="animora-card p-5 sm:p-8">
            <ApplyStepProgress
              isEn={isEn}
              currentStep={currentStep}
              onJumpToStep={handleJumpToStep}
            />

            <form onSubmit={handleSubmit} noValidate>
              {currentStep === 1 && (
                <ApplyStep1PersonalInfo
                  isEn={isEn}
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  setErrors={setErrors}
                  isPhoneFocused={isPhoneFocused}
                  setIsPhoneFocused={setIsPhoneFocused}
                  phoneInputRef={phoneInputRef}
                  provinceItems={provinceItems}
                  onPhoneInputChange={handlePhoneInputChange}
                  onPhonePaste={handlePhonePaste}
                  onPhoneBlur={handlePhoneBlur}
                  onNextStep={handleNextStep}
                />
              )}

              {currentStep === 2 && (
                <ApplyStep2LivingEnv
                  isEn={isEn}
                  petName={pet.name}
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  setErrors={setErrors}
                  onPrevStep={handlePrevStep}
                  onNextStep={handleNextStep}
                />
              )}

              {currentStep === 3 && (
                <ApplyStep3Commitment
                  isEn={isEn}
                  petName={pet.name}
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  allCommitmentsChecked={allCommitmentsChecked}
                  isSubmitting={isSubmitting}
                  onJumpToStep={handleJumpToStep}
                  onPrevStep={handlePrevStep}
                />
              )}
            </form>
          </div>
        </div>

        <ApplyPetSummarySidebar
          isEn={isEn}
          pet={pet}
          speciesLabel={speciesLabel}
          factChips={factChips}
          onNavigateUrl={onNavigateUrl}
        />
      </div>
    </div>
  );
};
