import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Booking, Language, Pet, UserAccount } from '@/types';
import {
  TIME_SLOT_CONFIG,
  generateBookingIcsContent,
  getSafeNow,
  getTodayLocalIso,
  addDaysToIso,
  validateBookingDate,
  getTimeSlotsForDate,
  calculateServiceEndTime,
  getServiceDurationMinutes,
} from '@/data/serviceBookingData';
import {
  BookingTabCategory,
  BookingSortOrder,
  MyBookingsAction,
  CANCEL_REASON_OPTIONS,
  getCancellationOutcome,
  getBookingModificationPolicy,
  getBookingTabCategory,
  doesBookingBelongToUser,
  filterAndSortBookings,
  lookupSingleBooking,
  checkLookupRateLimit,
  buildRebookUrl,
} from '@/utils/bookingHistoryUtils';
import { syncCustomerReviewToExpertStore } from '@/utils/clinicalSync';
import { triggerTextDownload } from '@/utils/downloadFile';
import { cancelBookingApi, rescheduleBookingApi } from '@/services/animora/bookingApi';
import { ApiClientError, isBusinessConflictOrValidationError } from '@/services/animora/apiClient';

const LOOKUP_RATE_LIMIT_KEY = 'animora_booking_lookup_attempts_v1';

interface UseMyBookingsStateParams {
  lang: Language;
  bookings: Booking[];
  pets: Pet[];
  currentUser: UserAccount | null;
  detailCode: string | null;
  queryCode: string | null;
  action?: MyBookingsAction;
  onUpdateBooking: (updated: Booking) => void;
  onNavigateUrl: (path: string) => void;
  onShowToast: (text: string) => void;
}

/**
 * Manages MyBookingsPage state: tabs/filters, visitor lookup with rate limit,
 * detail drawer/page routing, cancel & reschedule dialogs, ICS download,
 * and CareRecord integration.
 */
export function useMyBookingsState({
  lang,
  bookings,
  pets,
  currentUser,
  detailCode,
  queryCode,
  action = 'list',
  onUpdateBooking,
  onNavigateUrl,
  onShowToast,
}: UseMyBookingsStateParams) {
  const isVi = lang === 'vi';
  const [referenceNow, setReferenceNow] = useState<Date>(() => getSafeNow());
  const todayIso = useMemo(() => getTodayLocalIso(referenceNow), [referenceNow]);
  const maxDateIso = useMemo(
    () => addDaysToIso(todayIso, TIME_SLOT_CONFIG.maxAdvanceDays),
    [todayIso]
  );

  const [loadState, setLoadState] = useState<'loading' | 'error' | 'ready'>('ready');
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<BookingTabCategory>('upcoming');
  const [selectedPetFilter, setSelectedPetFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<BookingSortOrder>('nearest');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Visitor lookup
  const [lookupCode, setLookupCode] = useState<string>(
    () => queryCode || detailCode || ''
  );
  const [lookupPhoneDigits, setLookupPhoneDigits] = useState<string>('');
  const [isLookupPhoneFocused, setIsLookupPhoneFocused] = useState(false);
  const [lookupPhoneTouched, setLookupPhoneTouched] = useState(false);
  const [lookupCodeTouched, setLookupCodeTouched] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [verifiedVisitorBookingCode, setVerifiedVisitorBookingCode] = useState<
    string | null
  >(null);
  const lookupHoneypotRef = useRef<HTMLInputElement | null>(null);

  // Detail Drawer/Page
  const [openDetailCode, setOpenDetailCode] = useState<string | null>(detailCode);
  const detailTriggerRef = useRef<HTMLElement | null>(null);

  // Cancel page state
  const [selectedCancelReason, setSelectedCancelReason] = useState<string>('');
  const [cancelNote, setCancelNote] = useState<string>('');
  const [cancelFeeAgreed, setCancelFeeAgreed] = useState<boolean>(false);

  // Reschedule page state
  const [rescheduleDate, setRescheduleDate] = useState<string>(todayIso);
  const [rescheduleSlot, setRescheduleSlot] = useState<string>('');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  // Review Dialog
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null);
  const reviewTriggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const realNow = new Date();
      setReferenceNow(realNow);

      const p = new URLSearchParams(window.location.search).get('state');
      if (p === 'loading' || p === 'error') {
        setLoadState(p);
      }

      setIsMobileViewport(window.innerWidth < 768);
    });

    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelled = true;
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Sync prop changes without calling setState synchronously in an effect
  const [prevQueryCode, setPrevQueryCode] = useState(queryCode);
  const [prevDetailCode, setPrevDetailCode] = useState(detailCode);
  if (prevQueryCode !== queryCode || prevDetailCode !== detailCode) {
    setPrevQueryCode(queryCode);
    setPrevDetailCode(detailCode);
    if (queryCode || detailCode) {
      setLookupCode(queryCode || detailCode || '');
    }
    if (prevDetailCode !== detailCode) {
      setOpenDetailCode(detailCode);
    }
  }

  const userBookings = useMemo(() => {
    if (!currentUser) return [];
    return bookings.filter((b) => doesBookingBelongToUser(b, currentUser));
  }, [bookings, currentUser]);

  const verifiedVisitorBooking = useMemo(() => {
    if (currentUser || !verifiedVisitorBookingCode) return null;
    return (
      bookings.find(
        (b) =>
          (b.code || '').trim().toUpperCase() ===
          verifiedVisitorBookingCode.trim().toUpperCase()
      ) || null
    );
  }, [bookings, currentUser, verifiedVisitorBookingCode]);

  const isBookingVerifiedForViewer = (
    bk: Booking | null | undefined
  ): boolean => {
    if (!bk) return false;
    if (currentUser && doesBookingBelongToUser(bk, currentUser)) {
      return true;
    }
    if (
      !currentUser &&
      verifiedVisitorBookingCode &&
      (bk.code || '').trim().toUpperCase() ===
        verifiedVisitorBookingCode.trim().toUpperCase()
    ) {
      return true;
    }
    return false;
  };

  const activeDetailBooking = useMemo(() => {
    if (!openDetailCode) return null;
    const found = bookings.find(
      (b) =>
        (b.code || '').trim().toUpperCase() === openDetailCode.trim().toUpperCase()
    );
    if (!found) return null;
    if (currentUser && doesBookingBelongToUser(found, currentUser)) return found;
    if (
      !currentUser &&
      verifiedVisitorBookingCode &&
      (found.code || '').trim().toUpperCase() ===
        verifiedVisitorBookingCode.trim().toUpperCase()
    ) {
      return found;
    }
    return null;
  }, [openDetailCode, bookings, currentUser, verifiedVisitorBookingCode]);

  // Dedicated action pages (/lich-hen/[code]/doi-lich | /huy)
  const reschedulingBooking = action === 'reschedule' ? activeDetailBooking : null;
  const cancellingBooking = action === 'cancel' ? activeDetailBooking : null;

  // Reset page-local form state whenever the action/booking changes
  // (adjust-state-during-render pattern, no effect needed)
  const actionInitKey = `${action}:${activeDetailBooking?.id ?? ''}`;
  const [prevActionInitKey, setPrevActionInitKey] = useState(actionInitKey);
  if (prevActionInitKey !== actionInitKey) {
    setPrevActionInitKey(actionInitKey);
    if (action === 'reschedule' && activeDetailBooking) {
      setRescheduleDate(
        activeDetailBooking.date && activeDetailBooking.date >= todayIso
          ? activeDetailBooking.date
          : addDaysToIso(todayIso, 1)
      );
      setRescheduleSlot('');
      setRescheduleError(null);
    }
    if (action === 'cancel') {
      setSelectedCancelReason('');
      setCancelNote('');
      setCancelFeeAgreed(false);
    }
  }

  const userBookingPetNames = useMemo(() => {
    const set = new Set<string>();
    userBookings.forEach((b) => {
      if (b.petName && b.petName.trim()) {
        set.add(b.petName.trim());
      }
    });
    return Array.from(set);
  }, [userBookings]);

  const petFilterItems = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {
      all: isVi ? 'Tất cả các bé' : 'All pets',
    };
    userBookingPetNames.forEach((petName) => {
      map[petName] = isVi ? `Bé ${petName}` : petName;
    });
    return map;
  }, [isVi, userBookingPetNames]);

  const sortOrderItems = useMemo<Record<BookingSortOrder, string>>(
    () => ({
      nearest: isVi ? 'Gần nhất' : 'Nearest',
      farthest: isVi ? 'Xa nhất' : 'Farthest',
    }),
    [isVi]
  );

  const upcomingCount = useMemo(() => {
    return userBookings.filter(
      (b) => getBookingTabCategory(b, referenceNow) === 'upcoming'
    ).length;
  }, [userBookings, referenceNow]);

  const displayedBookings = useMemo(() => {
    return filterAndSortBookings(userBookings, {
      tab: activeTab,
      petFilter: selectedPetFilter,
      sortOrder,
      now: referenceNow,
    });
  }, [userBookings, activeTab, selectedPetFilter, sortOrder, referenceNow]);

  const handleOpenDetail = (bk: Booking, triggerEl?: HTMLElement | null) => {
    if (triggerEl) detailTriggerRef.current = triggerEl;
    const code = bk.code || bk.id;
    setOpenDetailCode(code);
    onNavigateUrl(`/lich-hen/${encodeURIComponent(code)}`);
  };

  const handleCloseDetail = () => {
    setOpenDetailCode(null);
    onNavigateUrl('/lich-hen');
    requestAnimationFrame(() => {
      detailTriggerRef.current?.focus();
    });
  };

  const handleCopyCode = async (code: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      }
    } catch {
      // ignore clipboard fallback
    }
    setCopiedCode(code);
    onShowToast(isVi ? `Đã sao chép mã ${code}` : `Copied code ${code}`);
    window.setTimeout(() => {
      setCopiedCode((prev) => (prev === code ? null : prev));
    }, 2200);
  };

  const handleDownloadIcs = (bk: Booking, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const icsContent = generateBookingIcsContent(bk, lang);
    triggerTextDownload(
      `lich-hen-animora-${(bk.code || bk.id).toLowerCase()}.ics`,
      icsContent,
      'text/calendar;charset=utf-8'
    );
  };

  const handleRebook = (bk: Booking, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onNavigateUrl(buildRebookUrl(bk));
  };

  const bookingPath = (bk: Booking, suffix = '') =>
    `/lich-hen/${encodeURIComponent(bk.code || bk.id)}${suffix}`;

  // Cancel & reschedule now live on dedicated pages: these just navigate.
  const openCancelDialog = (bk: Booking, triggerEl?: HTMLElement | null) => {
    if (triggerEl) detailTriggerRef.current = triggerEl;
    setOpenDetailCode(bk.code || bk.id);
    onNavigateUrl(bookingPath(bk, '/huy'));
  };

  const closeCancelDialog = () => {
    if (activeDetailBooking) {
      onNavigateUrl(bookingPath(activeDetailBooking));
    } else {
      onNavigateUrl('/lich-hen');
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    const policy = getBookingModificationPolicy(cancellingBooking, new Date());
    if (!policy.canCancel) return;
    const outcome = getCancellationOutcome(cancellingBooking, new Date());
    const fee = outcome.feeAmount;

    const reasonOption = CANCEL_REASON_OPTIONS.find(
      (o) => o.labelVi === selectedCancelReason || o.labelEn === selectedCancelReason
    );
    const baseReason = selectedCancelReason
      ? reasonOption?.id === 'other' && cancelNote.trim()
        ? `${selectedCancelReason}: ${cancelNote.trim()}`
        : selectedCancelReason
      : isVi
      ? 'Không nêu lý do'
      : 'No reason given';

    const numericBookingId = Number(cancellingBooking.id);
    if (Number.isInteger(numericBookingId) && numericBookingId > 0) {
      try {
        await cancelBookingApi(numericBookingId, baseReason);
      } catch (err) {
        if (isBusinessConflictOrValidationError(err)) {
          onShowToast(err.message);
          return;
        }
        if (!(err instanceof ApiClientError && (err.statusCode === 401 || err.isNetworkError))) {
          onShowToast(isVi ? 'Không thể hủy lịch hẹn lúc này' : 'Could not cancel appointment');
          return;
        }
      }
    }

    const updated: Booking = {
      ...cancellingBooking,
      status: 'Đã hủy',
      cancelledAt: new Date().toISOString(),
      cancelReason:
        fee > 0
          ? `${baseReason} (Hủy < 3h — phí 50%: ${fee.toLocaleString('vi-VN')}đ)`
          : baseReason,
      cancellationFee: fee,
      refundAmount: outcome.refundAmount,
      paymentState:
        fee > 0
          ? 'partial_fee'
          : cancellingBooking.paymentState === 'paid'
          ? 'refunded'
          : cancellingBooking.paymentState,
    };
    onUpdateBooking(updated);

    let msg: string;
    if (outcome.kind === 'refund_full') {
      msg = isVi
        ? `Đã hủy lịch hẹn. Hoàn lại toàn bộ ${outcome.refundAmount.toLocaleString('vi-VN')}đ.`
        : `Appointment cancelled. Full refund of ${outcome.refundAmount.toLocaleString('vi-VN')}đ.`;
    } else if (outcome.kind === 'refund_partial') {
      msg = isVi
        ? `Đã hủy lịch hẹn. Phí 50%: ${fee.toLocaleString('vi-VN')}đ, hoàn lại ${outcome.refundAmount.toLocaleString('vi-VN')}đ.`
        : `Appointment cancelled. 50% fee ${fee.toLocaleString('vi-VN')}đ, refund ${outcome.refundAmount.toLocaleString('vi-VN')}đ.`;
    } else if (outcome.kind === 'fee_due') {
      msg = isVi
        ? `Đã hủy lịch hẹn (áp dụng phí 50%: ${fee.toLocaleString('vi-VN')}đ)`
        : `Appointment cancelled (50% fee applied: ${fee.toLocaleString('vi-VN')}đ)`;
    } else {
      msg = isVi ? 'Đã hủy lịch hẹn' : 'Appointment cancelled';
    }
    onShowToast(msg);
    setLiveAnnouncement(
      isVi
        ? `Đã hủy lịch hẹn ${updated.code || updated.id} thành công.`
        : `Appointment ${updated.code || updated.id} has been cancelled.`
    );
    setActiveTab('cancelled');
    setOpenDetailCode(null);
    onNavigateUrl('/lich-hen');
  };

  const openRescheduleDialog = (bk: Booking, triggerEl?: HTMLElement | null) => {
    if (triggerEl) detailTriggerRef.current = triggerEl;
    setOpenDetailCode(bk.code || bk.id);
    onNavigateUrl(bookingPath(bk, '/doi-lich'));
  };

  const closeRescheduleDialog = () => {
    setRescheduleError(null);
    if (activeDetailBooking) {
      onNavigateUrl(bookingPath(activeDetailBooking));
    } else {
      onNavigateUrl('/lich-hen');
    }
  };

  const rescheduleSlots = useMemo(() => {
    if (!reschedulingBooking) return [];
    const durationMinutes =
      reschedulingBooking.durationMinutes ||
      getServiceDurationMinutes(reschedulingBooking.serviceSlug || reschedulingBooking.service);
    return getTimeSlotsForDate(rescheduleDate, bookings, referenceNow, undefined, {
      petName: reschedulingBooking.petName,
      doctorId: reschedulingBooking.doctorId,
      userId: reschedulingBooking.userId,
      durationMinutes,
      excludeBookingId: reschedulingBooking.id,
      excludeBookingCode: reschedulingBooking.code,
    });
  }, [rescheduleDate, bookings, reschedulingBooking, referenceNow]);

  const handleSaveReschedule = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!reschedulingBooking) return;
    setRescheduleError(null);

    if (!getBookingModificationPolicy(reschedulingBooking, new Date()).canReschedule) {
      setRescheduleError(
        isVi
          ? 'Lịch hẹn này hiện không thể đổi giờ trực tuyến.'
          : 'This appointment can no longer be rescheduled online.'
      );
      return;
    }

    if (!rescheduleSlot) {
      setRescheduleError(
        isVi ? 'Vui lòng chọn khung giờ mới.' : 'Please choose a new time slot.'
      );
      return;
    }

    const currentStartSlot =
      reschedulingBooking.startTime ||
      (reschedulingBooking.timeSlot || '').split(' - ')[0].trim();

    if (
      rescheduleDate === reschedulingBooking.date &&
      rescheduleSlot === currentStartSlot
    ) {
      setRescheduleError(
        isVi
          ? 'Lịch mới trùng với lịch hiện tại, vui lòng chọn thời gian khác.'
          : 'The new time is the same as the current one, please choose another.'
      );
      return;
    }

    const now = new Date();
    const dateValidation = validateBookingDate(
      rescheduleDate,
      getTodayLocalIso(now)
    );
    if (!dateValidation.valid) {
      setRescheduleError(
        isVi
          ? 'Ngày hẹn đã chọn không hợp lệ hoặc phòng khám nghỉ bảo dưỡng.'
          : 'Selected date is invalid or the clinic is closed.'
      );
      return;
    }

    const durationMinutes =
      reschedulingBooking.durationMinutes ||
      getServiceDurationMinutes(reschedulingBooking.serviceSlug || reschedulingBooking.service);
    const latestSlots = getTimeSlotsForDate(rescheduleDate, bookings, now, undefined, {
      petName: reschedulingBooking.petName,
      doctorId: reschedulingBooking.doctorId,
      userId: reschedulingBooking.userId,
      durationMinutes,
      excludeBookingId: reschedulingBooking.id,
      excludeBookingCode: reschedulingBooking.code,
    });
    const targetSlot = latestSlots.find((s) => s.time === rescheduleSlot);

    if (!targetSlot || targetSlot.disabled) {
      setRescheduleError(
        isVi
          ? 'Khung giờ này vừa có người đặt, vui lòng chọn giờ khác'
          : 'This time slot was just booked, please choose another time'
      );
      return;
    }

    const numericBookingId = Number(reschedulingBooking.id);
    if (Number.isInteger(numericBookingId) && numericBookingId > 0) {
      try {
        const newScheduledIso = new Date(`${rescheduleDate}T${rescheduleSlot}:00`).toISOString();
        await rescheduleBookingApi(numericBookingId, newScheduledIso, 'Khách hàng đổi lịch');
      } catch (err) {
        if (isBusinessConflictOrValidationError(err)) {
          setRescheduleError(err.message);
          return;
        }
        if (!(err instanceof ApiClientError && (err.statusCode === 401 || err.isNetworkError))) {
          setRescheduleError(
            isVi ? 'Không thể đổi lịch hẹn lúc này.' : 'Could not reschedule appointment.'
          );
          return;
        }
      }
    }

    const endTime = calculateServiceEndTime(rescheduleSlot, durationMinutes);
    const formattedSlot = `${rescheduleSlot} - ${endTime}`;

    const historyEntry = {
      fromDate: reschedulingBooking.date,
      fromTimeSlot: reschedulingBooking.timeSlot,
      toDate: rescheduleDate,
      toTimeSlot: formattedSlot,
      changedAt: new Date().toISOString(),
    };

    const updated: Booking = {
      ...reschedulingBooking,
      date: rescheduleDate,
      timeSlot: formattedSlot,
      startTime: rescheduleSlot,
      endTime: endTime,
      durationMinutes: durationMinutes,
      status: 'Mới',
      rescheduledFrom: [
        ...(reschedulingBooking.rescheduledFrom || []),
        historyEntry,
      ],
    };

    onUpdateBooking(updated);
    setActiveTab('upcoming');

    const toastText = isVi
      ? 'Đã đổi giờ lịch hẹn. Chúng tôi sẽ xác nhận lại sớm nhất!'
      : 'Appointment rescheduled! Waiting for confirmation.';
    onShowToast(toastText);
    setLiveAnnouncement(toastText);
    onNavigateUrl(bookingPath(updated));
  };

  const openReviewDialog = (bk: Booking, triggerEl?: HTMLElement | null) => {
    if (bk.status !== 'Hoàn thành') return;
    if (triggerEl) reviewTriggerRef.current = triggerEl;
    setReviewingBooking(bk);
  };

  const closeReviewDialog = () => {
    setReviewingBooking(null);
    requestAnimationFrame(() => {
      reviewTriggerRef.current?.focus();
    });
  };

  const handleSubmitReview = (payload: {
    rating: 1 | 2 | 3 | 4 | 5;
    serviceRating: 1 | 2 | 3 | 4 | 5;
    comment: string;
  }) => {
    if (!reviewingBooking) return;
    const reviewObj = {
      rating: payload.rating,
      serviceRating: payload.serviceRating,
      comment: payload.comment,
      createdAt: new Date().toISOString(),
    };
    const updated: Booking = {
      ...reviewingBooking,
      review: reviewObj,
    };
    onUpdateBooking(updated);
    syncCustomerReviewToExpertStore(updated, reviewObj);
    setReviewingBooking(null);
    onShowToast(
      isVi
        ? 'Cảm ơn bạn đã gửi đánh giá bác sĩ và dịch vụ!'
        : 'Thank you for rating our doctor and service!'
    );
    requestAnimationFrame(() => {
      reviewTriggerRef.current?.focus();
    });
  };

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupCodeTouched(true);
    setLookupPhoneTouched(true);
    setLookupError(null);

    let storedTimestamps: number[] = [];
    try {
      const raw = localStorage.getItem(LOOKUP_RATE_LIMIT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) storedTimestamps = parsed;
      }
    } catch {
      // ignore
    }

    const rateCheck = checkLookupRateLimit(storedTimestamps, Date.now());
    try {
      localStorage.setItem(
        LOOKUP_RATE_LIMIT_KEY,
        JSON.stringify(rateCheck.updatedTimestamps)
      );
    } catch {
      // ignore
    }

    if (!rateCheck.allowed) {
      setLookupError(
        isVi
          ? 'Bạn đã thử quá 5 lần trong 1 phút. Vui lòng đợi ít phút rồi thử lại.'
          : 'Too many attempts (max 5 per minute). Please wait a moment and try again.'
      );
      return;
    }

    const hpVal = lookupHoneypotRef.current?.value || '';
    const result = lookupSingleBooking(
      bookings,
      lookupCode,
      lookupPhoneDigits,
      lang,
      hpVal
    );

    if (!result.found) {
      setVerifiedVisitorBookingCode(null);
      setLookupError(result.error);
      return;
    }

    setVerifiedVisitorBookingCode(result.found.code || result.found.id);
    setLookupError(null);
  };

  return {
    referenceNow,
    todayIso,
    maxDateIso,
    loadState,
    setLoadState,
    isMobileViewport,
    liveAnnouncement,
    activeTab,
    setActiveTab,
    selectedPetFilter,
    setSelectedPetFilter,
    sortOrder,
    setSortOrder,
    copiedCode,
    lookupCode,
    setLookupCode,
    lookupPhoneDigits,
    setLookupPhoneDigits,
    isLookupPhoneFocused,
    setIsLookupPhoneFocused,
    lookupPhoneTouched,
    setLookupPhoneTouched,
    lookupCodeTouched,
    setLookupCodeTouched,
    lookupError,
    lookupHoneypotRef,
    verifiedVisitorBooking,
    openDetailCode,
    activeDetailBooking,
    userBookings,
    userBookingPetNames,
    petFilterItems,
    sortOrderItems,
    upcomingCount,
    displayedBookings,
    cancellingBooking,
    selectedCancelReason,
    setSelectedCancelReason,
    cancelNote,
    setCancelNote,
    cancelFeeAgreed,
    setCancelFeeAgreed,
    reschedulingBooking,
    rescheduleDate,
    setRescheduleDate,
    rescheduleSlot,
    setRescheduleSlot,
    rescheduleError,
    setRescheduleError,
    rescheduleSlots,
    reviewingBooking,
    isBookingVerifiedForViewer,
    handleOpenDetail,
    handleCloseDetail,
    handleCopyCode,
    handleDownloadIcs,
    handleRebook,
    openCancelDialog,
    closeCancelDialog,
    handleConfirmCancel,
    openRescheduleDialog,
    closeRescheduleDialog,
    handleSaveReschedule,
    openReviewDialog,
    closeReviewDialog,
    handleSubmitReview,
    handleLookupSubmit,
  };
}

