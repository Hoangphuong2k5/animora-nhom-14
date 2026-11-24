import React, { useRef, useState } from 'react';
import { AlertCircle, Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { Booking, Language, PageId, Pet, UserAccount, Vaccination } from '@/types';
import { saveNewPetProfileToStorage } from '@/data/serviceBookingData';
import { PetProfileEntity, WeightLog } from '@/data/petProfilesData';
import {
  useServiceBookingWizard,
  type CounterBookingContext,
} from '@/hooks/booking/useServiceBookingWizard';
import { AddPetModal } from '@/components/pet/profiles/modals/AddPetModal';
import { BookingStepperHeader } from './wizard/BookingStepperHeader';
import { Step1ServiceAndSchedule } from './wizard/Step1ServiceAndSchedule';
import { Step2ContactDetails } from './wizard/Step2ContactDetails';
import { Step3ReviewConfirm } from './wizard/Step3ReviewConfirm';
import { BookingSummarySidebar } from './wizard/BookingSummarySidebar';
import { MobileBookingSummaryBar } from './wizard/MobileBookingSummaryBar';
import { BookingSuccessView } from './wizard/BookingSuccessView';

interface ServiceBookingPageProps {
  lang: Language;
  darkMode?: boolean;
  bookings: Booking[];
  pets: Pet[];
  currentUser: UserAccount | null;
  initialServiceSlug?: string | null;
  isSuccessRoute?: boolean;
  onAddBooking: (booking: Booking) => void;
  onAddPet?: (newPet: Pet, newVaccinations: Vaccination[]) => void;
  onNavigate: (page: PageId) => void;
  onNavigateBookingUrl: (path: string) => void;
  counterContext?: CounterBookingContext;
  embeddedInPortal?: boolean;
}

export const ServiceBookingPage = ({
  lang,
  darkMode = false,
  bookings,
  pets,
  currentUser,
  initialServiceSlug,
  isSuccessRoute = false,
  onAddBooking,
  onAddPet,
  onNavigate,
  onNavigateBookingUrl,
  counterContext,
  embeddedInPortal = false,
}: ServiceBookingPageProps) => {
  const isVi = lang === 'vi';
  const errorTextColor = darkMode ? '#FDA29B' : '#B42318';
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);

  const honeypotRef = useRef<HTMLInputElement | null>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const serviceGroupRef = useRef<HTMLDivElement | null>(null);
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const timeSlotGroupRef = useRef<HTMLDivElement | null>(null);
  const fullNameInputRef = useRef<HTMLInputElement | null>(null);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const petNameInputRef = useRef<HTMLInputElement | null>(null);
  const consentCheckboxRef = useRef<HTMLButtonElement | null>(null);

  const wizard = useServiceBookingWizard({
    lang,
    bookings,
    pets,
    currentUser,
    initialServiceSlug,
    isSuccessRoute,
    refs: {
      honeypotRef,
      stepHeadingRef,
      serviceGroupRef,
      dateInputRef,
      timeSlotGroupRef,
      fullNameInputRef,
      phoneInputRef,
      emailInputRef,
      petNameInputRef,
      consentCheckboxRef,
    },
    onAddBooking,
    onNavigateBookingUrl,
    counterContext,
  });

  if (wizard.isOnSuccessPath) {
    return (
      <BookingSuccessView
        lang={lang}
        confirmedBooking={wizard.confirmedBooking}
        selectedService={wizard.selectedService}
        formState={wizard.formState}
        currentUser={currentUser}
        copiedCode={wizard.copiedCode}
        onCopyBookingCode={wizard.handleCopyBookingCode}
        onClearDraft={wizard.handleClearDraft}
        onNavigate={onNavigate}
        onNavigateBookingUrl={onNavigateBookingUrl}
      />
    );
  }

  return (
    <div
      data-testid="page-service-booking"
      className={
        embeddedInPortal
          ? 'pb-12'
          : 'min-h-screen pt-24 sm:pt-28 pb-32 min-[960px]:pb-24 shared-container'
      }
    >
      <input
        ref={honeypotRef}
        type="text"
        name="animora_company_hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      {counterContext?.isCounterChannel && (
        <div
          data-testid="counter-booking-acting-banner"
          className="mb-6 rounded-2xl border-2 border-[#6B1F2E]/30 dark:border-[#FF7F6B]/40 bg-[#FBF6F7] dark:bg-card p-4 shadow-sm space-y-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
            <div className="font-bold text-zinc-900 dark:text-foreground flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#6B1F2E] text-white dark:bg-[#FF7F6B] dark:text-zinc-950">
                Đặt tại quầy
              </span>
              <span>
                Đang đặt cho:{' '}
                <strong className="text-[#6B1F2E] dark:text-[#FF7F6B]">
                  {counterContext.targetCustomer
                    ? `${counterContext.targetCustomer.fullName} (${counterContext.targetCustomer.phone})`
                    : wizard.formState.fullName
                    ? `${wizard.formState.fullName} (${wizard.formState.phoneDigits})`
                    : 'Chưa chọn khách hàng — Vui lòng tra cứu SĐT ở trên'}
                </strong>
              </span>
            </div>
            <div className="text-xs font-semibold text-zinc-600 dark:text-muted-foreground">
              Kênh: <strong>Tại quầy</strong> • Chế độ:{' '}
              <strong>
                {counterContext.bookingMode === 'walk_in_now'
                  ? 'Làm ngay (Trạng thái đầu: Đã đến)'
                  : 'Hẹn giờ (Trạng thái đầu: Đã xác nhận)'}
              </strong>{' '}
              • Người thao tác: <strong>{counterContext.receptionistName}</strong>
            </div>
          </div>

          {counterContext.violationWarning && (
            <div
              data-testid="counter-violation-warning"
              className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{counterContext.violationWarning}</span>
            </div>
          )}

          {counterContext.isPostpaidLocked && counterContext.postpaidLockReason && (
            <div
              data-testid="counter-postpaid-lock-notice"
              className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{counterContext.postpaidLockReason}</span>
            </div>
          )}
        </div>
      )}

      <header className="mb-8 space-y-2.5 max-w-2xl">
        <span
          data-testid="booking-eyebrow"
          className="block uppercase font-bold"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: 'var(--primary)',
          }}
        >
          {isVi ? 'ĐĂNG KÝ DỊCH VỤ' : 'SERVICE REGISTRATION'}
        </span>
        <h1
          data-testid="booking-page-title"
          className="font-heading font-extrabold leading-[1.14] tracking-[-0.02em]"
          style={{
            fontSize: 'clamp(32px, 4vw, 48px)',
            color: 'var(--primary)',
          }}
        >
          {isVi ? 'Đặt lịch chăm sóc cho bé' : 'Book care for your pet'}
        </h1>
        <p
          data-testid="booking-page-subtitle"
          className="text-[18px] leading-relaxed font-normal"
          style={{ color: 'var(--text-muted)' }}
        >
          {isVi
            ? 'Chọn dịch vụ, ngày giờ phù hợp. Chúng tôi sẽ xác nhận lịch trong thời gian sớm nhất.'
            : 'Choose a service and a time. We will confirm your appointment as soon as possible.'}
        </p>
      </header>

      {wizard.draftRestored && (
        <div
          data-testid="booking-draft-banner"
          role="status"
          aria-live="polite"
          className="mb-6 rounded-2xl border px-4 py-3.5 flex flex-wrap items-center justify-between gap-3"
          style={{
            backgroundColor: 'var(--surface-2)',
            borderColor: 'var(--border)',
            color: 'var(--text)',
          }}
        >
          <div className="flex items-center gap-2.5 text-sm font-semibold">
            <Sparkles className="w-4 h-4 shrink-0" style={{ color: 'var(--primary)' }} />
            <span>
              {isVi
                ? 'Đã khôi phục bản nháp của bạn'
                : 'Restored your saved booking draft'}
            </span>
          </div>
          <button
            type="button"
            data-testid="clear-booking-draft-btn"
            onClick={wizard.handleClearDraft}
            className="min-h-[36px] px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 underline cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
            style={{ color: 'var(--primary)' }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isVi ? 'Xóa bản nháp' : 'Clear draft'}</span>
          </button>
        </div>
      )}

      <div className="flex flex-col min-[960px]:flex-row items-start gap-8">
        <div className="w-full min-[960px]:w-[62%] shrink-0">
          <div
            className="rounded-[24px] border p-[20px] sm:p-[32px]"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow)',
            }}
          >
            <BookingStepperHeader
              lang={lang}
              currentStep={wizard.formState.step}
              onGoToStep={wizard.goToStep}
            />

            {wizard.slotTakenAlert && (
              <div
                role="alert"
                aria-live="assertive"
                className="mb-6 p-4 rounded-2xl border flex items-start gap-2.5 text-sm font-bold"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: errorTextColor,
                  color: errorTextColor,
                }}
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{wizard.slotTakenAlert}</span>
              </div>
            )}

            <form onSubmit={wizard.handleFinalSubmit} noValidate>
              {wizard.formState.step === 1 && (
                <Step1ServiceAndSchedule
                  lang={lang}
                  formState={wizard.formState}
                  selectedService={wizard.selectedService}
                  pets={pets}
                  bookings={bookings}
                  todayIso={wizard.todayIso}
                  maxDateIso={wizard.maxDateIso}
                  viDateText={wizard.viDateText}
                  quickDates={wizard.quickDates}
                  timeSlots={wizard.timeSlots}
                  availableSlotsCount={wizard.availableSlotsCount}
                  step1Submitted={wizard.step1Submitted}
                  step1Errors={wizard.step1Errors}
                  errorTextColor={errorTextColor}
                  stepHeadingRef={stepHeadingRef}
                  serviceGroupRef={serviceGroupRef}
                  dateInputRef={dateInputRef}
                  timeSlotGroupRef={timeSlotGroupRef}
                  onUpdateField={wizard.updateField}
                  onSelectSavedPet={wizard.handleSelectSavedPet}
                  onOpenAddPetModal={() => setIsAddPetModalOpen(true)}
                  onClearSlotTakenAlert={() => wizard.setSlotTakenAlert(null)}
                />
              )}

              {wizard.formState.step === 2 && (
                <Step2ContactDetails
                  lang={lang}
                  formState={wizard.formState}
                  selectedSavedPet={
                    pets.find((p) => p.id === wizard.formState.selectedSavedPetId) ?? null
                  }
                  isPhoneFocused={wizard.isPhoneFocused}
                  touched={wizard.touched}
                  step2Submitted={wizard.step2Submitted}
                  step2Errors={wizard.step2Errors}
                  errorTextColor={errorTextColor}
                  stepHeadingRef={stepHeadingRef}
                  fullNameInputRef={fullNameInputRef}
                  phoneInputRef={phoneInputRef}
                  emailInputRef={emailInputRef}
                  petNameInputRef={petNameInputRef}
                  onChangePet={() => wizard.goToStep(1)}
                  onUpdateField={wizard.updateField}
                  onMarkTouched={(field) =>
                    wizard.setTouched((prev) => ({ ...prev, [field]: true }))
                  }
                  onPhoneChange={wizard.handlePhoneChange}
                  onPhonePaste={wizard.handlePhonePaste}
                  onPhoneFocus={wizard.handlePhoneFocus}
                  onPhoneBlur={wizard.handlePhoneBlur}
                />
              )}

              {wizard.formState.step === 3 && (
                <Step3ReviewConfirm
                  lang={lang}
                  formState={wizard.formState}
                  selectedService={wizard.selectedService}
                  estimatedPriceDisplay={wizard.estimatedPriceDisplay}
                  submitError={wizard.submitError}
                  errorTextColor={errorTextColor}
                  stepHeadingRef={stepHeadingRef}
                  consentCheckboxRef={consentCheckboxRef}
                  onGoToStep={wizard.goToStep}
                  onUpdateField={wizard.updateField}
                  isPostpaidLocked={counterContext?.isPostpaidLocked}
                  postpaidLockReason={counterContext?.postpaidLockReason}
                />
              )}

              <MobileBookingSummaryBar
                lang={lang}
                selectedService={wizard.selectedService}
                formState={wizard.formState}
                estimatedPriceDisplay={wizard.estimatedPriceDisplay}
                mobileSummaryOpen={wizard.mobileSummaryOpen}
                onToggleMobileSummary={() =>
                  wizard.setMobileSummaryOpen((prev) => !prev)
                }
              />

              <div
                className="mt-7 pt-6 border-t flex items-center justify-between gap-4"
                style={{ borderColor: 'var(--border)' }}
              >
                {wizard.formState.step > 1 ? (
                  <button
                    type="button"
                    data-testid="wizard-back-btn"
                    onClick={() =>
                      wizard.goToStep((wizard.formState.step - 1) as 1 | 2)
                    }
                    className="btn-secondary min-h-[48px] px-6 py-3 text-sm sm:text-base font-bold cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
                  >
                    {isVi ? 'Quay lại' : 'Back'}
                  </button>
                ) : (
                  <div />
                )}

                {wizard.formState.step === 1 && (
                  <button
                    type="button"
                    data-testid="wizard-continue-step-1"
                    onClick={wizard.handleContinueFromStep1}
                    className="btn-primary min-h-[48px] px-8 py-3 text-sm sm:text-base font-bold shadow-md cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
                  >
                    {isVi ? 'Tiếp tục' : 'Continue'}
                  </button>
                )}

                {wizard.formState.step === 2 && (
                  <button
                    type="button"
                    data-testid="wizard-continue-step-2"
                    onClick={wizard.handleContinueFromStep2}
                    className="btn-primary min-h-[48px] px-8 py-3 text-sm sm:text-base font-bold shadow-md cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
                  >
                    {isVi ? 'Tiếp tục' : 'Continue'}
                  </button>
                )}

                {wizard.formState.step === 3 && (
                  <button
                    type="submit"
                    data-testid="wizard-submit-btn"
                    disabled={!wizard.formState.consentContact || wizard.isSubmitting}
                    className="btn-primary min-h-[48px] px-8 py-3 text-sm sm:text-base font-bold inline-flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
                  >
                    {wizard.isSubmitting && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    <span>{isVi ? 'Gửi đăng ký' : 'Submit booking'}</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <BookingSummarySidebar
          lang={lang}
          selectedService={wizard.selectedService}
          formState={wizard.formState}
          estimatedPriceDisplay={wizard.estimatedPriceDisplay}
        />
      </div>

      <AddPetModal
        open={isAddPetModalOpen}
        lang={lang}
        onOpenChange={setIsAddPetModalOpen}
        onAddNewPet={(created: PetProfileEntity, initialWeightLog: WeightLog) => {
          saveNewPetProfileToStorage(created, initialWeightLog);
          onAddPet?.(created, []);
          wizard.handleSelectSavedPet(created);
          setIsAddPetModalOpen(false);
        }}
      />
    </div>
  );
};
