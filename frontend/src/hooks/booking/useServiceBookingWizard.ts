import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Booking,
  BookingPetTypeId,
  BookingPreferredContact,
  BookingWeightRangeId,
  Language,
  Pet,
  UserAccount,
} from '@/types';
import {
  SERVICES_DATA,
  ServiceEntity,
  resolveServicePaymentTiming,
} from '@/data/servicesData';
import { useSyncedActiveServices } from './useSyncedActiveServices';
import { getDoctorsWithLiveRatings } from '@/data/doctorsDirectory';
import { computeBookingEstimatedPrice } from '@/utils/bookingHistoryUtils';
import {
  createBookingApi,
  fetchBackendMyPetsForLookup,
  fetchBackendServicesForLookup,
  fetchBookingAvailabilityApi,
  mapBackendBookingToFrontend,
} from '@/services/animora/bookingApi';
import { createVnpayPaymentUrlApi } from '@/services/animora/paymentApi';
import { ApiClientError, isBusinessConflictOrValidationError } from '@/services/animora/apiClient';
import {
  TIME_SLOT_CONFIG,
  mapPetSpeciesToBookingPetType,
  mapWeightStringToRangeId,
  resolveServiceBySlugOrName,
  formatEstimatedPriceText,
  getSafeNow,
  getTodayLocalIso,
  addDaysToIso,
  formatIsoDateForDisplay,
  isDateClosed,
  validateBookingDate,
  getTimeSlotsForDate,
  findNextAvailableDate,
  cleanBookingPhoneDigits,
  formatBookingPhoneOnBlur,
  validateBookingPhoneDigits,
  validateBookingEmail,
  validateBookingFullName,
  validateBookingPetName,
  validateBookingPetType,
  resolveSavedPetProfileDetails,
  generateServiceBookingCode,
  calculateServiceEndTime,
  getServiceDurationMinutes,
} from '@/data/serviceBookingData';

const DRAFT_STORAGE_KEY = 'animora_service_booking_draft_v1';
const LAST_BOOKING_STORAGE_KEY = 'animora_last_service_booking_v1';

export interface ServiceBookingDraft {
  serviceSlug: string;
  doctorId: string;
  doctorName: string;
  paymentMethod: 'vnpay' | 'bank' | 'counter';
  paymentTiming?: 'prepaid' | 'postpaid';
  selectedSavedPetId: string | 'new';
  petType: BookingPetTypeId;
  weightRange: BookingWeightRangeId;
  date: string;
  timeSlot: string;
  fullName: string;
  phoneDigits: string;
  email: string;
  petName: string;
  petBreed: string;
  petAge: string;
  petWeight: string;
  petAllergies: string;
  preferredContact: BookingPreferredContact;
  note: string;
  consentContact: boolean;
  vaccinatedConfirmed: boolean;
  step: 1 | 2 | 3;
}

export interface BookingWizardRefs {
  honeypotRef: React.RefObject<HTMLInputElement | null>;
  stepHeadingRef: React.RefObject<HTMLHeadingElement | null>;
  serviceGroupRef: React.RefObject<HTMLDivElement | null>;
  dateInputRef: React.RefObject<HTMLInputElement | null>;
  timeSlotGroupRef: React.RefObject<HTMLDivElement | null>;
  fullNameInputRef: React.RefObject<HTMLInputElement | null>;
  phoneInputRef: React.RefObject<HTMLInputElement | null>;
  emailInputRef: React.RefObject<HTMLInputElement | null>;
  petNameInputRef: React.RefObject<HTMLInputElement | null>;
  consentCheckboxRef: React.RefObject<HTMLButtonElement | null>;
}

interface UseServiceBookingWizardParams {
  lang: Language;
  bookings: Booking[];
  pets: Pet[];
  currentUser: UserAccount | null;
  initialServiceSlug?: string | null;
  isSuccessRoute: boolean;
  refs: BookingWizardRefs;
  onAddBooking: (booking: Booking) => void;
  onNavigateBookingUrl: (path: string) => void;
}

function buildDefaultDraft(
  srvSlug: string,
  defaultDate: string,
  currentUser: UserAccount | null,
  pets: Pet[] = [],
  lang: Language = 'vi'
): ServiceBookingDraft {
  const firstPet = pets[0];
  const firstPetDetails = firstPet
    ? resolveSavedPetProfileDetails(firstPet, lang)
    : null;

  const srvEntity = resolveServiceBySlugOrName(srvSlug);
  const defaultTiming = resolveServicePaymentTiming(srvEntity);

  return {
    serviceSlug: srvSlug,
    doctorId: '',
    doctorName: '',
    paymentMethod: defaultTiming === 'prepaid' ? 'vnpay' : 'counter',
    paymentTiming: defaultTiming,
    selectedSavedPetId: firstPet ? firstPet.id : 'new',
    petType: firstPetDetails ? firstPetDetails.petType : 'Chó',
    weightRange: firstPet ? mapWeightStringToRangeId(firstPet.weight) : 'under_5',
    date: defaultDate,
    timeSlot: '10:00',
    fullName: currentUser?.fullName || '',
    phoneDigits: currentUser?.phone
      ? cleanBookingPhoneDigits(currentUser.phone)
      : '',
    email: currentUser?.email || '',
    petName: firstPet ? firstPet.name : '',
    petBreed: firstPetDetails ? firstPetDetails.breed : '',
    petAge: firstPetDetails ? firstPetDetails.age : '',
    petWeight: firstPetDetails ? firstPetDetails.weight : '',
    petAllergies: firstPetDetails ? firstPetDetails.allergies : '',
    preferredContact: 'phone',
    note: firstPetDetails ? firstPetDetails.note : '',
    consentContact: false,
    vaccinatedConfirmed: false,
    step: 1,
  };
}

/**
 * Manages the 3-step service booking wizard state, draft persistence,
 * slot availability, validation, focus management, and submission.
 */
export function useServiceBookingWizard({
  lang,
  bookings,
  pets,
  currentUser,
  initialServiceSlug,
  isSuccessRoute,
  refs,
  onAddBooking,
  onNavigateBookingUrl,
}: UseServiceBookingWizardParams) {
  const isVi = lang === 'vi';
  const [referenceNow, setReferenceNow] = useState<Date>(() => getSafeNow());
  const todayIso = useMemo(() => getTodayLocalIso(referenceNow), [referenceNow]);
  const defaultDateIso = useMemo(() => addDaysToIso(todayIso, 1), [todayIso]);
  const maxDateIso = useMemo(
    () => addDaysToIso(todayIso, TIME_SLOT_CONFIG.maxAdvanceDays),
    [todayIso]
  );

  const resolvedInitialService = useMemo(
    () => resolveServiceBySlugOrName(initialServiceSlug),
    [initialServiceSlug]
  );

  const [draftRestored, setDraftRestored] = useState(false);
  const [isClientSuccessPath, setIsClientSuccessPath] = useState(false);
  const [formState, setFormState] = useState<ServiceBookingDraft>(() =>
    buildDefaultDraft(
      resolvedInitialService.slug,
      defaultDateIso,
      currentUser,
      pets,
      lang
    )
  );
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [step1Submitted, setStep1Submitted] = useState(false);
  const [step2Submitted, setStep2Submitted] = useState(false);
  const [step3Submitted, setStep3Submitted] = useState(false);
  const [slotTakenAlert, setSlotTakenAlert] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [apiBusySlots, setApiBusySlots] = useState<
    Array<{ start_at: string; end_at: string; source: string }>
  >([]);

  const mountTimeRef = useRef<number>(0);
  const submittingRef = useRef<boolean>(false);

  useEffect(() => {
    mountTimeRef.current = Date.now();
  }, []);

  // Hydrate client date, route state, last booking, and saved draft on mount
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const realNow = new Date();
      setReferenceNow(realNow);
      const realDefaultDate = addDaysToIso(getTodayLocalIso(realNow), 1);

      setIsClientSuccessPath(
        window.location.pathname.replace(/\/+$/, '') === '/dat-lich/thanh-cong'
      );

      try {
        const saved = localStorage.getItem(LAST_BOOKING_STORAGE_KEY);
        if (saved) {
          setConfirmedBooking(JSON.parse(saved) as Booking);
        }
      } catch {
        // ignore storage errors
      }

      if (!isSuccessRoute) {
        try {
          const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as Partial<ServiceBookingDraft>;
            if (
              parsed &&
              (parsed.petName || parsed.phoneDigits || parsed.fullName || parsed.note)
            ) {
              setDraftRestored(true);
            }
            const params = new URLSearchParams(window.location.search);
            const urlServiceParam = params.get('service');
            const realTodayIso = getTodayLocalIso(realNow);
            const validDraftDate =
              parsed.date && parsed.date >= realTodayIso
                ? parsed.date
                : realDefaultDate;
            setFormState((prev) => ({
              ...prev,
              ...parsed,
              date: validDraftDate,
              serviceSlug: urlServiceParam
                ? resolveServiceBySlugOrName(urlServiceParam).slug
                : parsed.serviceSlug || prev.serviceSlug,
              phoneDigits: cleanBookingPhoneDigits(
                parsed.phoneDigits || prev.phoneDigits
              ),
              fullName: parsed.fullName || prev.fullName,
              email: parsed.email || prev.email,
              step: parsed.step === 2 || parsed.step === 3 ? parsed.step : 1,
            }));
            return;
          }
        } catch {
          // ignore storage errors
        }
      }

      setFormState((prev) => ({
        ...prev,
        date: realDefaultDate,
      }));
    });
    return () => {
      cancelled = true;
    };
  }, [isSuccessRoute]);

  // Sync URL ?service={slug}&pet={pet}
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const params = new URLSearchParams(window.location.search);
      const serviceParam = params.get('service');
      const petParam = params.get('pet');

      setFormState((prev) => {
        let next = { ...prev };
        if (serviceParam) {
          next.serviceSlug = resolveServiceBySlugOrName(serviceParam).slug;
        } else if (initialServiceSlug) {
          next.serviceSlug = resolveServiceBySlugOrName(initialServiceSlug).slug;
        }

        if (petParam && petParam.trim()) {
          const cleanPet = petParam.trim().toLowerCase();
          const matchedSavedPet = pets.find(
            (p) =>
              p.name.trim().toLowerCase() === cleanPet ||
              p.id.trim().toLowerCase() === cleanPet
          );
          if (matchedSavedPet) {
            const details = resolveSavedPetProfileDetails(matchedSavedPet, lang);
            next = {
              ...next,
              selectedSavedPetId: matchedSavedPet.id,
              petType: details.petType,
              weightRange: mapWeightStringToRangeId(matchedSavedPet.weight),
              petName: matchedSavedPet.name,
              petBreed: details.breed,
              petAge: details.age,
              petWeight: details.weight,
              petAllergies: details.allergies,
              note: details.note,
            };
          } else {
            next = {
              ...next,
              selectedSavedPetId: 'new',
              petName: petParam.trim(),
            };
          }
        } else if (pets.length > 0) {
          const currentMatched = pets.find(
            (p) => p.id === next.selectedSavedPetId
          );
          if (!currentMatched && next.selectedSavedPetId === 'new' && !next.petName) {
            const firstPet = pets[0];
            const details = resolveSavedPetProfileDetails(firstPet, lang);
            next = {
              ...next,
              selectedSavedPetId: firstPet.id,
              petType: details.petType,
              weightRange: mapWeightStringToRangeId(firstPet.weight),
              petName: firstPet.name,
              petBreed: details.breed,
              petAge: details.age,
              petWeight: details.weight,
              petAllergies: details.allergies,
              note: details.note,
            };
          } else if (currentMatched) {
            const details = resolveSavedPetProfileDetails(currentMatched, lang);
            next = {
              ...next,
              petType: details.petType,
              petBreed: next.petBreed || details.breed,
              petAge: next.petAge || details.age,
              petWeight: next.petWeight || details.weight,
              petAllergies: next.petAllergies || details.allergies,
              note: next.note || details.note,
            };
          }
        }

        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [initialServiceSlug, pets, lang]);

  // Prefill logged-in user details if fields are empty
  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setFormState((prev) => ({
        ...prev,
        fullName: prev.fullName || currentUser.fullName || '',
        phoneDigits:
          prev.phoneDigits ||
          (currentUser.phone ? cleanBookingPhoneDigits(currentUser.phone) : ''),
        email: prev.email || currentUser.email || '',
      }));
    });
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  // Save draft to localStorage
  useEffect(() => {
    if (isSuccessRoute || !hasUnsavedChanges) return;
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formState));
    } catch {
      // ignore storage quota errors
    }
  }, [formState, hasUnsavedChanges, isSuccessRoute]);

  // Warn before leaving when dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isSuccessRoute) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isSuccessRoute]);

  const activeServices = useSyncedActiveServices();

  const selectedService: ServiceEntity = useMemo(
    () =>
      activeServices.find((s) => s.slug === formState.serviceSlug) ||
      activeServices[0] ||
      SERVICES_DATA[0],
    [activeServices, formState.serviceSlug]
  );

  const topDoctorForService = useMemo(
    () => getDoctorsWithLiveRatings(bookings, selectedService.category)[0],
    [bookings, selectedService.category]
  );

  const effectiveDoctorId = formState.doctorId || topDoctorForService?.id || '';
  const effectiveDoctorName =
    formState.doctorName ||
    (effectiveDoctorId && effectiveDoctorId === topDoctorForService?.id
      ? topDoctorForService.name
      : '');

  useEffect(() => {
    let cancelled = false;
    if (!formState.date) return;
    const numericPetId = Number(formState.selectedSavedPetId);
    const numericExpertId = Number(effectiveDoctorId);
    fetchBookingAvailabilityApi({
      date: formState.date,
      petId: Number.isInteger(numericPetId) && numericPetId > 0 ? numericPetId : undefined,
      expertId: Number.isInteger(numericExpertId) && numericExpertId > 0 ? numericExpertId : undefined,
    })
      .then((res) => {
        if (!cancelled && Array.isArray(res?.busy_slots)) {
          setApiBusySlots(res.busy_slots);
        }
      })
      .catch(() => {
        if (!cancelled) setApiBusySlots([]);
      });
    return () => {
      cancelled = true;
    };
  }, [formState.date, formState.selectedSavedPetId, effectiveDoctorId]);

  const slotAvailabilityContext = useMemo(
    () => ({
      petName: formState.petName,
      doctorId: effectiveDoctorId,
      userId: currentUser?.id,
      minAdvanceHours: selectedService.minAdvanceHours,
      durationMinutes: selectedService.durationMinutes || 60,
      busySlotsFromApi: apiBusySlots,
    }),
    [
      formState.petName,
      effectiveDoctorId,
      currentUser?.id,
      selectedService.minAdvanceHours,
      selectedService.durationMinutes,
      apiBusySlots,
    ]
  );

  const timeSlots = useMemo(
    () =>
      getTimeSlotsForDate(
        formState.date,
        bookings,
        referenceNow,
        TIME_SLOT_CONFIG,
        slotAvailabilityContext
      ),
    [formState.date, bookings, referenceNow, slotAvailabilityContext]
  );

  const availableSlotsCount = useMemo(
    () => timeSlots.filter((s) => !s.disabled).length,
    [timeSlots]
  );

  // Derive a valid active timeSlot if current one is disabled on the chosen date
  const effectiveTimeSlot = useMemo(() => {
    if (timeSlots.length === 0) return formState.timeSlot;
    const currentObj = timeSlots.find((s) => s.time === formState.timeSlot);
    if (!currentObj || currentObj.disabled) {
      const firstOpen = timeSlots.find((s) => !s.disabled);
      return firstOpen ? firstOpen.time : '';
    }
    return formState.timeSlot;
  }, [formState.timeSlot, timeSlots]);

  const effectiveFormState: ServiceBookingDraft = useMemo(
    () =>
      effectiveTimeSlot === formState.timeSlot &&
      effectiveDoctorId === formState.doctorId &&
      effectiveDoctorName === formState.doctorName
        ? formState
        : {
            ...formState,
            timeSlot: effectiveTimeSlot,
            doctorId: effectiveDoctorId,
            doctorName: effectiveDoctorName,
          },
    [
      formState,
      effectiveTimeSlot,
      effectiveDoctorId,
      effectiveDoctorName,
    ]
  );

  const viDateText = formatIsoDateForDisplay(formState.date, 'vi');

  const updateField = <K extends keyof ServiceBookingDraft>(
    key: K,
    value: ServiceBookingDraft[K]
  ) => {
    setHasUnsavedChanges(true);
    setFormState((prev) => {
      if (key === 'serviceSlug') {
        const nextSlug = value as string;
        const nextService =
          activeServices.find((s) => s.slug === nextSlug) ||
          activeServices[0] ||
          SERVICES_DATA[0];
        const nextTopDoctor = getDoctorsWithLiveRatings(
          bookings,
          nextService.category
        )[0];
        const nextCtx = {
          petName: prev.petName,
          doctorId: nextTopDoctor?.id || '',
          userId: currentUser?.id,
          minAdvanceHours: nextService.minAdvanceHours,
        };
        const currentDateSlots = getTimeSlotsForDate(
          prev.date,
          bookings,
          referenceNow,
          TIME_SLOT_CONFIG,
          nextCtx
        );
        const nextDate = currentDateSlots.some((s) => !s.disabled)
          ? prev.date
          : findNextAvailableDate(
              prev.date,
              bookings,
              referenceNow,
              TIME_SLOT_CONFIG,
              nextCtx
            );
        return {
          ...prev,
          serviceSlug: nextSlug,
          date: nextDate,
        };
      }
      if (key === 'date') {
        const nextDate = value as string;
        const nextSlots = getTimeSlotsForDate(
          nextDate,
          bookings,
          referenceNow,
          TIME_SLOT_CONFIG,
          {
            petName: prev.petName,
            doctorId: prev.doctorId || topDoctorForService?.id || '',
            userId: currentUser?.id,
            minAdvanceHours: selectedService.minAdvanceHours,
          }
        );
        const curSlotObj = nextSlots.find((s) => s.time === prev.timeSlot);
        const resolvedSlot =
          !curSlotObj || curSlotObj.disabled
            ? nextSlots.find((s) => !s.disabled)?.time || ''
            : prev.timeSlot;
        return { ...prev, date: nextDate, timeSlot: resolvedSlot };
      }
      return { ...prev, [key]: value };
    });
  };

  const handleClearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // ignore
    }
    setDraftRestored(false);
    setHasUnsavedChanges(false);
    setTouched({});
    setStep1Submitted(false);
    setStep2Submitted(false);
    setStep3Submitted(false);
    setSlotTakenAlert(null);
    setSubmitError(null);
    setFormState(
      buildDefaultDraft(
        resolvedInitialService.slug,
        defaultDateIso,
        currentUser,
        pets,
        lang
      )
    );
  };

  const handleSelectSavedPet = (pet: Pet | 'new') => {
    setHasUnsavedChanges(true);
    if (pet === 'new') {
      setFormState((prev) => ({
        ...prev,
        selectedSavedPetId: 'new',
        petName: '',
        petBreed: '',
        petAge: '',
        petWeight: '',
        petAllergies: '',
        note: '',
      }));
      return;
    }
    const details = resolveSavedPetProfileDetails(pet, lang);
    setFormState((prev) => ({
      ...prev,
      selectedSavedPetId: pet.id,
      petType: details.petType,
      weightRange: mapWeightStringToRangeId(pet.weight),
      petName: pet.name,
      petBreed: details.breed,
      petAge: details.age,
      petWeight: details.weight,
      petAllergies: details.allergies,
      note: details.note,
    }));
  };

  const getStep1Errors = () => {
    const errs: { service?: string; date?: string; timeSlot?: string } = {};
    if (!effectiveFormState.serviceSlug) {
      errs.service = isVi ? 'Vui lòng chọn một dịch vụ' : 'Please choose a service';
    }

    const dateCheck = validateBookingDate(effectiveFormState.date, todayIso);
    if (!dateCheck.valid) {
      if (dateCheck.reason === 'empty') {
        errs.date = isVi ? 'Vui lòng chọn ngày hẹn' : 'Please select an appointment date';
      } else if (dateCheck.reason === 'past') {
        errs.date = isVi
          ? 'Không thể chọn ngày trong quá khứ'
          : 'Cannot select a date in the past';
      } else if (dateCheck.reason === 'too_far') {
        errs.date = isVi
          ? 'Chỉ nhận đặt lịch trước tối đa 60 ngày'
          : 'Appointments can only be booked up to 60 days ahead';
      } else if (dateCheck.reason === 'closed') {
        errs.date = isVi
          ? 'Trung tâm nghỉ bảo dưỡng định kỳ vào ngày này, vui lòng chọn ngày khác'
          : 'The center is closed on this date, please choose another day';
      }
    }

    if (!errs.date) {
      const chosenSlot = timeSlots.find(
        (s) => s.time === effectiveFormState.timeSlot
      );
      if (!effectiveFormState.timeSlot || !chosenSlot) {
        errs.timeSlot = isVi
          ? 'Vui lòng chọn khung giờ hẹn'
          : 'Please choose a time slot';
      } else if (chosenSlot.disabled) {
        errs.timeSlot = isVi
          ? 'Khung giờ này đã hết chỗ, vui lòng chọn giờ khác'
          : 'This time slot is unavailable, please select another';
      }
    }

    return errs;
  };

  const getStep2Errors = () => {
    const errs: {
      fullName?: string;
      phone?: string;
      email?: string;
      petName?: string;
      petType?: string;
    } = {};

    const nameErr = validateBookingFullName(effectiveFormState.fullName, lang);
    if (nameErr) errs.fullName = nameErr;

    const phoneErr = validateBookingPhoneDigits(
      effectiveFormState.phoneDigits,
      lang
    );
    if (phoneErr) errs.phone = phoneErr;

    const petNameErr = validateBookingPetName(effectiveFormState.petName, lang);
    if (petNameErr) errs.petName = petNameErr;

    const petTypeErr = validateBookingPetType(effectiveFormState.petType, lang);
    if (petTypeErr) errs.petType = petTypeErr;

    return errs;
  };

  const step1Errors = getStep1Errors();
  const step2Errors = getStep2Errors();

  const goToStep = (targetStep: 1 | 2 | 3) => {
    updateField('step', targetStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    requestAnimationFrame(() => {
      refs.stepHeadingRef.current?.focus();
    });
  };

  const handleContinueFromStep1 = () => {
    setStep1Submitted(true);
    setSlotTakenAlert(null);
    const errs = getStep1Errors();
    if (Object.keys(errs).length > 0) {
      if (errs.service) refs.serviceGroupRef.current?.focus();
      else if (errs.date) refs.dateInputRef.current?.focus();
      else if (errs.timeSlot) refs.timeSlotGroupRef.current?.focus();
      return;
    }
    goToStep(2);
  };

  const handleContinueFromStep2 = () => {
    setStep2Submitted(true);
    const errs = getStep2Errors();
    if (Object.keys(errs).length > 0) {
      if (errs.fullName) refs.fullNameInputRef.current?.focus();
      else if (errs.phone) refs.phoneInputRef.current?.focus();
      else if (errs.petName) refs.petNameInputRef.current?.focus();
      return;
    }
    goToStep(3);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField('phoneDigits', cleanBookingPhoneDigits(e.target.value));
  };

  const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    updateField('phoneDigits', cleanBookingPhoneDigits(pastedText));
  };

  const handlePhoneFocus = () => setIsPhoneFocused(true);

  const handlePhoneBlur = () => {
    setIsPhoneFocused(false);
    setTouched((prev) => ({ ...prev, phone: true }));
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    setStep3Submitted(true);
    setSubmitError(null);

    if (refs.honeypotRef.current && refs.honeypotRef.current.value) {
      return;
    }

    if (!effectiveFormState.consentContact) {
      refs.consentCheckboxRef.current?.focus();
      return;
    }

    const s1Errs = getStep1Errors();
    if (Object.keys(s1Errs).length > 0) {
      setStep1Submitted(true);
      goToStep(1);
      return;
    }
    const s2Errs = getStep2Errors();
    if (Object.keys(s2Errs).length > 0) {
      setStep2Submitted(true);
      goToStep(2);
      return;
    }

    const latestSlots = getTimeSlotsForDate(
      effectiveFormState.date,
      bookings,
      new Date(),
      TIME_SLOT_CONFIG,
      {
        petName: effectiveFormState.petName,
        doctorId: effectiveFormState.doctorId,
        userId: currentUser?.id,
        minAdvanceHours: selectedService.minAdvanceHours,
        durationMinutes: selectedService.durationMinutes || 60,
        busySlotsFromApi: apiBusySlots,
      }
    );
    const targetSlot = latestSlots.find(
      (s) => s.time === effectiveFormState.timeSlot
    );
    if (!targetSlot || targetSlot.disabled) {
      setSlotTakenAlert(
        isVi
          ? targetSlot?.reasonVi === 'Bé đã có lịch'
            ? 'Bé đã có lịch hẹn ở khung giờ này, vui lòng chọn giờ khác'
            : targetSlot?.reasonVi === 'Bác sĩ bận'
            ? 'Bác sĩ đã có lịch ở khung giờ này, vui lòng chọn giờ khác'
            : 'Khung giờ này vừa có người đặt, vui lòng chọn giờ khác'
          : targetSlot?.reasonEn === 'Pet already booked'
          ? 'This pet already has an appointment at this time, please choose another slot'
          : 'This time slot was just booked, please choose another time'
      );
      goToStep(1);
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    const elapsed = Date.now() - mountTimeRef.current;
    const waitMs = elapsed < 3000 ? Math.min(800, 3000 - elapsed) : 250;
    await new Promise((resolve) => setTimeout(resolve, waitMs));

    try {
      const paymentTiming =
        effectiveFormState.paymentTiming ||
        resolveServicePaymentTiming(selectedService);
      const paymentTimingDb: 'Prepaid' | 'Postpaid' =
        paymentTiming === 'prepaid' ? 'Prepaid' : 'Postpaid';

      let createdFromBackend: Booking | null = null;
      let createdBackendId: number | null = null;

      try {
        const [backendServices, backendPets] = await Promise.all([
          fetchBackendServicesForLookup(),
          fetchBackendMyPetsForLookup(),
        ]);

        const numericPetId = Number(effectiveFormState.selectedSavedPetId);
        const matchedBackendPet =
          (Number.isInteger(numericPetId) && numericPetId > 0
            ? backendPets.find((p) => p.id === numericPetId)
            : undefined) ||
          backendPets.find(
            (p) =>
              p.name.trim().toLowerCase() ===
              effectiveFormState.petName.trim().toLowerCase()
          );

        const matchedBackendService =
          backendServices.find(
            (s) =>
              s.name.trim().toLowerCase() ===
              selectedService.name.vi.trim().toLowerCase()
          ) || backendServices[0];

        if (matchedBackendPet && matchedBackendService) {
          const scheduledIso = new Date(
            `${effectiveFormState.date}T${effectiveFormState.timeSlot}:00`
          ).toISOString();
          const numericExpertId = Number(effectiveFormState.doctorId);

          const backendDto = await createBookingApi({
            pet_id: matchedBackendPet.id,
            service_id: matchedBackendService.id,
            expert_id:
              Number.isInteger(numericExpertId) && numericExpertId > 0
                ? numericExpertId
                : null,
            scheduled_at: scheduledIso,
            payment_timing: paymentTimingDb,
            customer_note: effectiveFormState.note.trim() || null,
          });
          createdBackendId = backendDto.id;
          createdFromBackend = mapBackendBookingToFrontend(backendDto);
        }
      } catch (apiErr) {
        if (isBusinessConflictOrValidationError(apiErr)) {
          submittingRef.current = false;
          setIsSubmitting(false);
          if (apiErr.statusCode === 409) {
            setSlotTakenAlert(apiErr.message);
            goToStep(1);
          } else {
            setSubmitError(apiErr.message);
          }
          return;
        }
        if (!(apiErr instanceof ApiClientError && (apiErr.statusCode === 401 || apiErr.isNetworkError))) {
          throw apiErr;
        }
      }

      const bookingCode = generateServiceBookingCode(bookings.length);
      const matchedDoc = effectiveFormState.doctorId
        ? getDoctorsWithLiveRatings(bookings).find(
            (d) => d.id === effectiveFormState.doctorId
          )
        : getDoctorsWithLiveRatings(bookings, selectedService.category)[0];
      const durationMinutes =
        selectedService.durationMinutes ||
        getServiceDurationMinutes(selectedService.slug);
      const startTime = effectiveFormState.timeSlot;
      const endTime = calculateServiceEndTime(startTime, durationMinutes);
      const formattedSlot = `${startTime} - ${endTime}`;

      const draftWithWeight: Booking = createdFromBackend || {
        id: `bk-${Date.now()}`,
        code: bookingCode,
        userId: currentUser?.id || null,
        serviceSlug: selectedService.slug,
        service: selectedService.name.vi,
        doctorId: matchedDoc?.id || effectiveFormState.doctorId || undefined,
        doctorName:
          effectiveFormState.doctorName || matchedDoc?.name || undefined,
        petType: effectiveFormState.petType,
        petName: effectiveFormState.petName.trim(),
        petBreed: effectiveFormState.petBreed.trim() || undefined,
        petAge: effectiveFormState.petAge.trim() || undefined,
        petWeight: effectiveFormState.petWeight.trim() || undefined,
        petAllergies: effectiveFormState.petAllergies.trim() || undefined,
        weightRange: selectedService.dependsOnWeight
          ? effectiveFormState.weightRange
          : undefined,
        date: effectiveFormState.date,
        timeSlot: formattedSlot,
        startTime: startTime,
        endTime: endTime,
        durationMinutes: durationMinutes,
        fullName: effectiveFormState.fullName.trim(),
        phone: formatBookingPhoneOnBlur(effectiveFormState.phoneDigits),
        email: effectiveFormState.email.trim(),
        preferredContact: effectiveFormState.preferredContact,
        note: effectiveFormState.note.trim() || undefined,
        vaccinatedConfirmed:
          selectedService.id === 'spa' || selectedService.id === 'boarding'
            ? effectiveFormState.vaccinatedConfirmed
            : undefined,
        paymentTiming,
        paymentState: paymentTiming === 'prepaid' ? 'paid' : 'unpaid',
        paymentMethod:
          paymentTiming === 'prepaid'
            ? effectiveFormState.paymentMethod === 'counter'
              ? 'vnpay'
              : effectiveFormState.paymentMethod
            : 'counter',
        status: 'Mới',
        createdAt: new Date().toISOString(),
      };
      const newBooking: Booking = createdFromBackend
        ? createdFromBackend
        : {
            ...draftWithWeight,
            estimatedPrice: computeBookingEstimatedPrice(draftWithWeight),
          };

      onAddBooking(newBooking);
      setConfirmedBooking(newBooking);

      try {
        localStorage.setItem(LAST_BOOKING_STORAGE_KEY, JSON.stringify(newBooking));
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // ignore storage errors
      }

      setHasUnsavedChanges(false);
      setDraftRestored(false);

      if (
        createdBackendId &&
        paymentTiming === 'prepaid' &&
        effectiveFormState.paymentMethod !== 'counter'
      ) {
        try {
          const paymentRes = await createVnpayPaymentUrlApi({
            appointment_id: createdBackendId,
            idempotency_key: `VNP-APP-${createdBackendId}-${Date.now()}`,
          });
          if (paymentRes?.payment_url) {
            submittingRef.current = false;
            setIsSubmitting(false);
            window.location.assign(paymentRes.payment_url);
            return;
          }
        } catch (payErr) {
          if (isBusinessConflictOrValidationError(payErr)) {
            submittingRef.current = false;
            setIsSubmitting(false);
            setSubmitError(payErr.message);
            return;
          }
        }
      }

      submittingRef.current = false;
      setIsSubmitting(false);
      onNavigateBookingUrl('/dat-lich/thanh-cong');
    } catch {
      submittingRef.current = false;
      setIsSubmitting(false);
      setSubmitError(
        isVi
          ? 'Không thể lưu lịch hẹn lúc này. Vui lòng thử lại.'
          : 'Could not save your appointment right now. Please try again.'
      );
    }
  };

  const handleCopyBookingCode = async (code: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      }
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2400);
    } catch {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2400);
    }
  };

  const estimatedPriceDisplay = formatEstimatedPriceText(
    selectedService,
    selectedService.dependsOnWeight ? effectiveFormState.weightRange : undefined,
    lang
  );

  const quickDates = useMemo(() => {
    return [0, 1, 2, 3, 4, 5, 6].map((offset) => {
      const iso = addDaysToIso(todayIso, offset);
      const closed = isDateClosed(iso, todayIso);
      const slots = getTimeSlotsForDate(iso, bookings, referenceNow);
      const allFull = !closed && slots.length > 0 && slots.every((s) => s.disabled);
      return {
        iso,
        offset,
        closed,
        allFull,
        displayShort: formatIsoDateForDisplay(iso, lang),
      };
    });
  }, [todayIso, bookings, lang, referenceNow]);

  const isOnSuccessPath = isSuccessRoute || isClientSuccessPath;

  return {
    todayIso,
    maxDateIso,
    draftRestored,
    formState: effectiveFormState,
    confirmedBooking,
    isPhoneFocused,
    viDateText,
    touched,
    setTouched,
    step1Submitted,
    step2Submitted,
    step3Submitted,
    step1Errors,
    step2Errors,
    slotTakenAlert,
    setSlotTakenAlert,
    submitError,
    isSubmitting,
    mobileSummaryOpen,
    setMobileSummaryOpen,
    copiedCode,
    selectedService,
    timeSlots,
    availableSlotsCount,
    estimatedPriceDisplay,
    quickDates,
    isOnSuccessPath,
    updateField,
    goToStep,
    handleClearDraft,
    handleSelectSavedPet,
    handleContinueFromStep1,
    handleContinueFromStep2,
    handlePhoneChange,
    handlePhonePaste,
    handlePhoneFocus,
    handlePhoneBlur,
    handleFinalSubmit,
    handleCopyBookingCode,
  };
}
