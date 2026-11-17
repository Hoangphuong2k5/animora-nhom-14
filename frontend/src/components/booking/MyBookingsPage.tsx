import React from 'react';
import { AlertCircle, Calendar, RotateCcw } from 'lucide-react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Booking, Language, PageId, Pet, UserAccount } from '@/types';
import {
  BookingTabCategory,
  MyBookingsAction,
} from '@/utils/bookingHistoryUtils';
import { useMyBookingsState } from '@/hooks/booking/useMyBookingsState';
import { BookingCard } from './history/BookingCard';
import { BookingDetailPageView } from './history/BookingDetailPageView';
import { BookingReschedulePageView } from './history/BookingReschedulePageView';
import { BookingCancelPageView } from './history/BookingCancelPageView';
import { VisitorBookingLookupCard } from './history/VisitorBookingLookupCard';
import { BookingFilterBar } from './history/BookingFilterBar';
import { BookingEmptyState } from './history/BookingEmptyState';
import { ReviewBookingDialog } from './history/ReviewBookingDialog';
import { UpcomingReminderBanner } from './history/UpcomingReminderBanner';

interface MyBookingsPageProps {
  lang: Language;
  darkMode?: boolean;
  bookings: Booking[];
  pets: Pet[];
  currentUser: UserAccount | null;
  detailCode?: string | null;
  queryCode?: string | null;
  action?: MyBookingsAction;
  onUpdateBooking: (updated: Booking) => void;
  onNavigate: (page: PageId) => void;
  onNavigateUrl: (path: string) => void;
  onShowToast: (text: string) => void;
}

export const MyBookingsPage = ({
  lang,
  darkMode = false,
  bookings,
  pets,
  currentUser,
  detailCode = null,
  queryCode = null,
  action = 'list',
  onUpdateBooking,
  onNavigate,
  onNavigateUrl,
  onShowToast,
}: MyBookingsPageProps) => {
  const isVi = lang === 'vi';
  const state = useMyBookingsState({
    lang,
    bookings,
    pets,
    currentUser,
    detailCode,
    queryCode,
    action,
    onUpdateBooking,
    onNavigateUrl,
    onShowToast,
  });

  const renderCard = (bk: Booking) => (
    <BookingCard
      key={bk.id}
      booking={bk}
      lang={lang}
      darkMode={darkMode}
      referenceNow={state.referenceNow}
      pets={pets}
      copiedCode={state.copiedCode}
      onOpenDetail={state.handleOpenDetail}
      onCopyCode={state.handleCopyCode}
      onReschedule={state.openRescheduleDialog}
      onCancel={state.openCancelDialog}
      onDownloadIcs={state.handleDownloadIcs}
      onRebook={state.handleRebook}
      onReview={state.openReviewDialog}
    />
  );

  const reviewDialogNode = (
    <ReviewBookingDialog
      booking={state.reviewingBooking}
      lang={lang}
      onClose={state.closeReviewDialog}
      onSubmitReview={state.handleSubmitReview}
    />
  );

  if (action === 'reschedule') {
    return (
      <div
        data-testid="page-booking-reschedule"
        className="min-h-screen pt-24 sm:pt-28 pb-24 shared-container"
      >
        <div role="status" aria-live="polite" className="sr-only">
          {state.liveAnnouncement}
        </div>

        <BookingReschedulePageView
          booking={state.activeDetailBooking}
          lang={lang}
          darkMode={darkMode}
          referenceNow={state.referenceNow}
          todayIso={state.todayIso}
          maxDateIso={state.maxDateIso}
          rescheduleDate={state.rescheduleDate}
          rescheduleSlot={state.rescheduleSlot}
          rescheduleError={state.rescheduleError}
          rescheduleSlots={state.rescheduleSlots}
          onChangeDate={(d) => {
            state.setRescheduleDate(d);
            state.setRescheduleSlot('');
            state.setRescheduleError(null);
          }}
          onChangeSlot={(s) => {
            state.setRescheduleSlot(s);
            state.setRescheduleError(null);
          }}
          onBackToList={state.handleCloseDetail}
          onBackToDetail={state.closeRescheduleDialog}
          onSubmit={state.handleSaveReschedule}
        />
      </div>
    );
  }

  if (action === 'cancel') {
    return (
      <div
        data-testid="page-booking-cancel"
        className="min-h-screen pt-24 sm:pt-28 pb-24 shared-container"
      >
        <div role="status" aria-live="polite" className="sr-only">
          {state.liveAnnouncement}
        </div>

        <BookingCancelPageView
          booking={state.activeDetailBooking}
          lang={lang}
          darkMode={darkMode}
          referenceNow={state.referenceNow}
          selectedReason={state.selectedCancelReason}
          cancelNote={state.cancelNote}
          cancelFeeAgreed={state.cancelFeeAgreed}
          onSelectReason={state.setSelectedCancelReason}
          onChangeCancelNote={state.setCancelNote}
          onChangeCancelFeeAgreed={state.setCancelFeeAgreed}
          onSwitchToReschedule={() => {
            if (state.activeDetailBooking) {
              state.openRescheduleDialog(state.activeDetailBooking);
            }
          }}
          onBackToList={state.handleCloseDetail}
          onBackToDetail={state.closeCancelDialog}
          onConfirmCancel={state.handleConfirmCancel}
        />
      </div>
    );
  }

  if (state.activeDetailBooking) {
    return (
      <div
        data-testid="page-booking-detail"
        className="min-h-screen pt-24 sm:pt-28 pb-24 shared-container"
      >
        <div role="status" aria-live="polite" className="sr-only">
          {state.liveAnnouncement}
        </div>

        <BookingDetailPageView
          booking={state.activeDetailBooking}
          lang={lang}
          darkMode={darkMode}
          referenceNow={state.referenceNow}
          pets={pets}
          copiedCode={state.copiedCode}
          isVerifiedOwner={state.isBookingVerifiedForViewer(
            state.activeDetailBooking
          )}
          onBack={state.handleCloseDetail}
          onCopyCode={state.handleCopyCode}
          onReschedule={state.openRescheduleDialog}
          onCancel={state.openCancelDialog}
          onDownloadIcs={state.handleDownloadIcs}
          onRebook={state.handleRebook}
          onReview={state.openReviewDialog}
        />

        {reviewDialogNode}
      </div>
    );
  }

  return (
    <div
      data-testid="page-my-bookings"
      className="min-h-screen pt-24 sm:pt-28 pb-24 shared-container"
    >
      <div
        data-testid="booking-aria-live"
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        {state.liveAnnouncement}
      </div>

      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2.5 max-w-2xl">
          <span
            data-testid="my-bookings-eyebrow"
            className="block uppercase font-bold"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'var(--primary)',
            }}
          >
            {currentUser
              ? (isVi ? 'LỊCH HẸN THÀNH VIÊN' : 'MEMBER APPOINTMENTS')
              : (isVi ? 'TRA CỨU LỊCH HẸN' : 'APPOINTMENT LOOKUP')}
          </span>
          <h1
            data-testid="my-bookings-title"
            className="font-heading font-extrabold leading-[1.14] tracking-[-0.02em]"
            style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              color: 'var(--primary)',
            }}
          >
            {currentUser
              ? (isVi ? 'Lịch hẹn của tôi' : 'My bookings')
              : (isVi ? 'Tra cứu lịch hẹn' : 'Lookup appointment')}
          </h1>
          <p
            data-testid="my-bookings-subtitle"
            className="text-[18px] leading-relaxed font-normal"
            style={{ color: 'var(--text-muted)' }}
          >
            {currentUser
              ? (isVi
                  ? 'Xem, đổi giờ hoặc hủy lịch hẹn chăm sóc của bé.'
                  : "View, reschedule or cancel your pet's appointments.")
              : (isVi
                  ? 'Tra cứu nhanh lịch hẹn bằng mã đặt lịch và số điện thoại liên hệ.'
                  : 'Look up your appointment using booking code and phone number.')}
          </p>
        </div>

        <button
          type="button"
          data-testid="new-booking-header-btn"
          onClick={() => onNavigateUrl('/dat-lich')}
          className="btn-primary min-h-[48px] px-6 py-3 text-sm font-bold inline-flex items-center justify-center gap-2 shrink-0 shadow-md cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
        >
          <Calendar className="w-4 h-4" />
          <span>{isVi ? 'Đặt lịch mới' : 'New booking'}</span>
        </button>
      </header>

      {state.loadState === 'loading' && (
        <div
          data-testid="bookings-loading-skeleton"
          className="max-w-[860px] mx-auto space-y-4"
        >
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-[20px] border p-5 animate-pulse space-y-3"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-full"
                  style={{ backgroundColor: 'var(--surface-2)' }}
                />
                <div className="flex-1 space-y-2">
                  <div
                    className="h-5 w-48 rounded"
                    style={{ backgroundColor: 'var(--surface-2)' }}
                  />
                  <div
                    className="h-4 w-64 rounded"
                    style={{ backgroundColor: 'var(--surface-2)' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {state.loadState === 'error' && (
        <div
          data-testid="bookings-error-state"
          className="max-w-[860px] mx-auto rounded-[20px] border p-8 text-center space-y-4"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <AlertCircle className="w-10 h-10 mx-auto" style={{ color: 'var(--coral)' }} />
          <p className="font-heading text-xl font-bold" style={{ color: 'var(--primary)' }}>
            {isVi ? 'Không tải được lịch hẹn' : 'Could not load appointments'}
          </p>
          <button
            type="button"
            onClick={() => state.setLoadState('ready')}
            className="btn-primary min-h-[44px] px-6 py-2.5 text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isVi ? 'Thử lại' : 'Retry'}</span>
          </button>
        </div>
      )}

      {state.loadState === 'ready' && !currentUser && (
        <VisitorBookingLookupCard
          lang={lang}
          darkMode={darkMode}
          openDetailCode={state.openDetailCode}
          verifiedVisitorBooking={state.verifiedVisitorBooking}
          lookupCode={state.lookupCode}
          lookupPhoneDigits={state.lookupPhoneDigits}
          isLookupPhoneFocused={state.isLookupPhoneFocused}
          lookupCodeTouched={state.lookupCodeTouched}
          lookupPhoneTouched={state.lookupPhoneTouched}
          lookupError={state.lookupError}
          honeypotRef={state.lookupHoneypotRef}
          onChangeCode={state.setLookupCode}
          onBlurCode={() => state.setLookupCodeTouched(true)}
          onChangePhoneDigits={state.setLookupPhoneDigits}
          onFocusPhone={() => state.setIsLookupPhoneFocused(true)}
          onBlurPhone={() => {
            state.setIsLookupPhoneFocused(false);
            state.setLookupPhoneTouched(true);
          }}
          onSubmitLookup={state.handleLookupSubmit}
          onNavigate={onNavigate}
          renderVerifiedCard={renderCard}
        />
      )}

      {state.loadState === 'ready' && currentUser && (
        <Tabs
          value={state.activeTab}
          onValueChange={(val) => {
            if (val !== null) state.setActiveTab(val as BookingTabCategory);
          }}
          className="space-y-6"
        >
          <UpcomingReminderBanner
            bookings={state.userBookings}
            lang={lang}
            referenceNow={state.referenceNow}
            onOpenDetail={state.handleOpenDetail}
          />
          <BookingFilterBar
            lang={lang}
            activeTab={state.activeTab}
            upcomingCount={state.upcomingCount}
            totalBookingsCount={state.userBookings.length}
            selectedPetFilter={state.selectedPetFilter}
            petFilterItems={state.petFilterItems}
            userBookingPetNames={state.userBookingPetNames}
            sortOrder={state.sortOrder}
            sortOrderItems={state.sortOrderItems}
            onChangePetFilter={state.setSelectedPetFilter}
            onChangeSortOrder={state.setSortOrder}
          />

          <TabsContent
            value={state.activeTab}
            id={`booking-tabpanel-${state.activeTab}`}
            className="w-full max-w-[860px] mx-auto space-y-4"
          >
            {state.displayedBookings.length > 0 ? (
              state.displayedBookings.map(renderCard)
            ) : (
              <BookingEmptyState
                lang={lang}
                activeTab={state.activeTab}
                onNavigateUrl={onNavigateUrl}
              />
            )}
          </TabsContent>
        </Tabs>
      )}

      {reviewDialogNode}
    </div>
  );
};
