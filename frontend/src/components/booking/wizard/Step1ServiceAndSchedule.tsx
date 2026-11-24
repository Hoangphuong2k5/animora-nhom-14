import React, { useMemo, useState } from 'react';
import { AlertCircle, Calendar, Check, Clock, PawPrint, Search, Star, Stethoscope } from 'lucide-react';
import { Booking, Language, Pet } from '@/types';
import {
  ServiceEntity,
  resolveServicePaymentTiming,
} from '@/data/servicesData';
import { useSyncedActiveServices } from '@/hooks/booking/useSyncedActiveServices';
import { getDoctorsWithLiveRatings } from '@/data/doctorsDirectory';
import {
  calculateServiceEndTime,
  findNextAvailableDate,
  formatEstimatedPriceText,
  formatIsoDateForDisplay,
  formatServiceTimeRange,
  TimeSlotAvailability,
} from '@/data/serviceBookingData';
import { ServiceBookingDraft } from '@/hooks/booking/useServiceBookingWizard';
import { ServiceIcon } from '../shared/ServiceIcon';

interface QuickDateItem {
  iso: string;
  offset: number;
  closed: boolean;
  allFull: boolean;
  displayShort: string;
}

interface Step1ServiceAndScheduleProps {
  lang: Language;
  formState: ServiceBookingDraft;
  selectedService: ServiceEntity;
  pets: Pet[];
  bookings: Booking[];
  todayIso: string;
  maxDateIso: string;
  viDateText: string;
  quickDates: QuickDateItem[];
  timeSlots: TimeSlotAvailability[];
  availableSlotsCount: number;
  step1Submitted: boolean;
  step1Errors: { service?: string; date?: string; timeSlot?: string };
  errorTextColor: string;
  stepHeadingRef: React.RefObject<HTMLHeadingElement | null>;
  serviceGroupRef: React.RefObject<HTMLDivElement | null>;
  dateInputRef: React.RefObject<HTMLInputElement | null>;
  timeSlotGroupRef: React.RefObject<HTMLDivElement | null>;
  onUpdateField: <K extends keyof ServiceBookingDraft>(
    key: K,
    value: ServiceBookingDraft[K]
  ) => void;
  onSelectSavedPet: (pet: Pet | 'new') => void;
  onOpenAddPetModal?: () => void;
  onClearSlotTakenAlert: () => void;
}

export const Step1ServiceAndSchedule = ({
  lang,
  formState,
  selectedService,
  pets,
  bookings,
  todayIso,
  maxDateIso,
  viDateText,
  quickDates,
  timeSlots,
  availableSlotsCount,
  step1Submitted,
  step1Errors,
  errorTextColor,
  stepHeadingRef,
  serviceGroupRef,
  dateInputRef,
  timeSlotGroupRef,
  onUpdateField,
  onSelectSavedPet,
  onOpenAddPetModal,
  onClearSlotTakenAlert,
}: Step1ServiceAndScheduleProps) => {
  const isVi = lang === 'vi';
  const activeServices = useSyncedActiveServices();
  const [doctorQuery, setDoctorQuery] = useState('');
  const [minDoctorRating, setMinDoctorRating] = useState<0 | 4.8 | 4.9>(0);

  const durationMinutes = selectedService.durationMinutes || 45;
  const selectedEndTime = formState.timeSlot
    ? calculateServiceEndTime(formState.timeSlot, durationMinutes)
    : '';

  const matchingDoctors = useMemo(() => {
    const base = getDoctorsWithLiveRatings(bookings, selectedService.category);
    const q = doctorQuery.toLowerCase().trim();
    return base.filter((doc) => {
      if (doc.rating < minDoctorRating) return false;
      if (!q) return true;
      return (
        doc.name.toLowerCase().includes(q) ||
        doc.specialtyVi.toLowerCase().includes(q) ||
        doc.specialtyEn.toLowerCase().includes(q)
      );
    });
  }, [bookings, selectedService.category, doctorQuery, minDoctorRating]);

  return (
    <div data-testid="booking-step-1" className="space-y-7">
      <div className="border-b pb-4" style={{ borderColor: 'var(--border)' }}>
        <h2
          ref={stepHeadingRef}
          tabIndex={-1}
          className="font-heading text-2xl font-extrabold focus:outline-none"
          style={{ color: 'var(--primary)' }}
        >
          {isVi ? 'Bước 1: Dịch vụ & thời gian' : 'Step 1: Service & time'}
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {isVi
            ? 'Chọn gói dịch vụ chăm sóc và khung giờ trống phù hợp nhất với lịch trình của bạn.'
            : 'Select a care package and an available time slot that fits your schedule.'}
        </p>
      </div>

      {/* 1. Chọn dịch vụ */}
      <div
        ref={serviceGroupRef}
        tabIndex={-1}
        role="radiogroup"
        aria-labelledby="label-choose-service"
        aria-required="true"
        className="space-y-3"
      >
        <label
          id="label-choose-service"
          className="block text-[14px] font-bold"
          style={{ color: 'var(--text)' }}
        >
          {isVi ? 'Chọn dịch vụ *' : 'Choose a service *'}
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {activeServices.map((srv) => {
            const isSelected = formState.serviceSlug === srv.slug;
            const priceText = formatEstimatedPriceText(srv, undefined, lang);
            const paymentTiming = resolveServicePaymentTiming(srv);

            return (
              <label
                key={srv.slug}
                data-testid={`service-option-${srv.slug}`}
                className="relative rounded-2xl p-4 flex items-start gap-3.5 transition-all cursor-pointer select-none focus-within:outline-2 focus-within:outline-[#FF7F6B] focus-within:outline-offset-2"
                style={{
                  backgroundColor: isSelected ? 'var(--surface-2)' : 'var(--bg)',
                  border: isSelected
                    ? '2px solid var(--primary)'
                    : '1px solid var(--border)',
                }}
              >
                <input
                  type="radio"
                  name="serviceSlug"
                  value={srv.slug}
                  checked={isSelected}
                  onChange={() => {
                    onUpdateField('serviceSlug', srv.slug);
                    onUpdateField('doctorId', '');
                    onUpdateField('doctorName', '');
                  }}
                  className="sr-only"
                />
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--on-primary)',
                  }}
                >
                  <ServiceIcon type={srv.icon} className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <span
                    className="block font-heading text-base font-bold leading-snug"
                    style={{ color: 'var(--text)' }}
                  >
                    {srv.name[lang]}
                  </span>
                  <span
                    className="block text-xs font-medium mt-0.5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {srv.duration[lang]}
                  </span>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span
                      className="text-sm font-extrabold"
                      style={{ color: 'var(--primary)' }}
                    >
                      {priceText}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-bold border"
                      style={{
                        backgroundColor: 'var(--surface-2)',
                        borderColor: 'var(--border)',
                        color: 'var(--primary)',
                      }}
                    >
                      {isVi ? 'Trả trước hoặc Trả sau' : 'Prepay or Postpay'}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center absolute top-3.5 right-3.5"
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'var(--on-primary)',
                    }}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}
              </label>
            );
          })}
        </div>

        {step1Submitted && step1Errors.service && (
          <p
            role="alert"
            aria-live="polite"
            className="text-[14px] font-semibold flex items-center gap-1.5 pt-1"
            style={{ color: errorTextColor }}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{step1Errors.service}</span>
          </p>
        )}
      </div>

      {/* 1b. Tìm & chọn Bác sĩ / Chuyên viên theo đánh giá */}
      <div className="space-y-3" data-testid="doctor-finder-section">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className="text-[14px] font-bold flex items-center gap-1.5"
            style={{ color: 'var(--text)' }}
          >
            <Stethoscope className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            <span>
              {isVi
                ? 'Chọn Bác sĩ / Chuyên viên theo đánh giá'
                : 'Find & select Specialist by rating'}
            </span>
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {([
              { val: 0, labelVi: 'Tất cả', labelEn: 'All' },
              { val: 4.8, labelVi: 'Từ 4.8★', labelEn: '4.8★+' },
              { val: 4.9, labelVi: 'Từ 4.9★', labelEn: '4.9★+' },
            ] as const).map((chip) => {
              const active = minDoctorRating === chip.val;
              return (
                <button
                  key={chip.val}
                  type="button"
                  onClick={() => setMinDoctorRating(chip.val)}
                  className="px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer"
                  style={{
                    backgroundColor: active ? 'var(--primary)' : 'var(--bg)',
                    color: active ? 'var(--on-primary)' : 'var(--text)',
                    borderColor: active ? 'var(--primary)' : 'var(--border)',
                  }}
                >
                  {isVi ? chip.labelVi : chip.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <Search
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            data-testid="doctor-search-input"
            value={doctorQuery}
            onChange={(e) => setDoctorQuery(e.target.value)}
            placeholder={
              isVi
                ? 'Tìm bác sĩ, chuyên viên theo tên hoặc chuyên khoa...'
                : 'Search doctor or specialist by name or specialty...'
            }
            className="form-input w-full pl-10 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {matchingDoctors.map((doc) => {
            const isDocSelected = formState.doctorId === doc.id;
            return (
              <button
                key={doc.id}
                type="button"
                data-testid={`doctor-option-${doc.id}`}
                onClick={() => {
                  if (isDocSelected) {
                    onUpdateField('doctorId', '');
                    onUpdateField('doctorName', '');
                  } else {
                    onUpdateField('doctorId', doc.id);
                    onUpdateField('doctorName', doc.name);
                  }
                }}
                className="text-left rounded-2xl p-3.5 flex items-start gap-3 transition-all cursor-pointer relative"
                style={{
                  backgroundColor: isDocSelected ? 'var(--surface-2)' : 'var(--bg)',
                  border: isDocSelected
                    ? '2px solid var(--primary)'
                    : '1px solid var(--border)',
                }}
              >
                <img
                  src={doc.avatar}
                  alt={doc.name}
                  className="w-11 h-11 rounded-full object-cover shrink-0 border"
                  style={{ borderColor: 'var(--border)' }}
                />
                <div className="min-w-0 flex-1 pr-5">
                  <div className="font-bold text-sm truncate" style={{ color: 'var(--text)' }}>
                    {doc.name}
                  </div>
                  <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                    {isVi ? doc.roleTitleVi : doc.roleTitleEn}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs font-bold">
                    <span className="inline-flex items-center gap-1 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{doc.rating.toFixed(2)}</span>
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      ({doc.reviewCount} {isVi ? 'đánh giá' : 'reviews'})
                    </span>
                  </div>
                </div>
                {isDocSelected && (
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center absolute top-3 right-3"
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'var(--on-primary)',
                    }}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Chọn bé đã lưu */}
      <div className="space-y-2.5">
        <span
          className="block text-[14px] font-bold"
          style={{ color: 'var(--text)' }}
        >
          {isVi ? 'Chọn bé đã lưu' : 'Choose a saved pet'}
        </span>
        <div className="flex flex-wrap items-center gap-2.5">
          {pets.map((p) => {
            const isSelected = formState.selectedSavedPetId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                data-testid={`saved-pet-pill-${p.id}`}
                onClick={() => onSelectSavedPet(p)}
                className="min-h-[44px] pl-2 pr-4 py-1.5 rounded-full border text-sm font-bold inline-flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#FF7F6B] focus-visible:outline-offset-2"
                style={{
                  backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg)',
                  color: isSelected ? 'var(--on-primary)' : 'var(--text)',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                }}
              >
                <img
                  loading="lazy"
                  decoding="async"
                  src={p.photo}
                  alt={p.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src =
                      '/assets/images/about_fluffy_cat_1793177483392.jpg';
                  }}
                  className="w-7 h-7 rounded-full object-cover shrink-0 border"
                  style={{
                    borderColor: isSelected
                      ? 'var(--on-primary)'
                      : 'var(--border)',
                  }}
                />
                <span>{p.name}</span>
              </button>
            );
          })}

          <button
            type="button"
            data-testid="saved-pet-pill-new"
            onClick={() =>
              onOpenAddPetModal ? onOpenAddPetModal() : onSelectSavedPet('new')
            }
            className="min-h-[44px] px-4 py-1.5 rounded-full border text-sm font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#FF7F6B] focus-visible:outline-offset-2 hover:border-(--primary)"
            style={{
              backgroundColor:
                formState.selectedSavedPetId === 'new'
                  ? 'var(--primary)'
                  : 'var(--bg)',
              color:
                formState.selectedSavedPetId === 'new'
                  ? 'var(--on-primary)'
                  : 'var(--text)',
              borderColor:
                formState.selectedSavedPetId === 'new'
                  ? 'var(--primary)'
                  : 'var(--border)',
            }}
          >
            <PawPrint className="w-3.5 h-3.5" />
            <span>{isVi ? '+ Bé mới' : '+ New pet'}</span>
          </button>
        </div>
      </div>

      {/* 3. Ngày hẹn */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="booking-date-input"
            className="block text-[14px] font-bold"
            style={{ color: 'var(--text)' }}
          >
            {isVi ? 'Ngày hẹn *' : 'Appointment date *'}
          </label>
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            {isVi
              ? `Đặt trước tối thiểu ${selectedService.minAdvanceHours} giờ · Tối đa 60 ngày`
              : `Min ${selectedService.minAdvanceHours}h notice · Up to 60 days`}
          </span>
        </div>
        {selectedService.slug === 'nha-khoa-thu-nho' && (
          <p className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
            {isVi
              ? 'Lưu ý chuẩn bị: Bé cần nhịn ăn/uống theo hướng dẫn trước giờ hẹn nha khoa.'
              : 'Prep note: Please fast your pet per clinic instructions before dental care.'}
          </p>
        )}

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              const el = dateInputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
              el?.showPicker?.();
              el?.focus();
            }}
            className="w-full h-[46px] px-4 rounded-[14px] border flex items-center justify-between gap-3 text-left transition-colors hover:border-(--primary) cursor-pointer"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor:
                step1Submitted && step1Errors.date
                  ? errorTextColor
                  : 'var(--border)',
              color: 'var(--text)',
            }}
          >
            <span className="inline-flex items-center gap-2.5 min-w-0">
              <Calendar className="w-4 h-4 shrink-0" style={{ color: 'var(--primary)' }} />
              <span
                data-testid="booking-date-formatted"
                className="font-bold text-[15px] tabular-nums truncate"
              >
                {(() => {
                  const formatted = formatIsoDateForDisplay(formState.date, lang) || viDateText;
                  if (!formState.date) return formatted;
                  const dt = new Date(`${formState.date}T00:00:00`);
                  if (Number.isNaN(dt.getTime())) return formatted;
                  const weekday = dt.toLocaleDateString(isVi ? 'vi-VN' : 'en-US', {
                    weekday: 'long',
                  });
                  return `${weekday}, ${formatted}`;
                })()}
              </span>
            </span>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
              style={{
                backgroundColor: 'var(--surface-2)',
                color: 'var(--primary)',
              }}
            >
              {isVi ? 'Chọn ngày' : 'Change'}
            </span>
          </button>

          <input
            ref={dateInputRef}
            id="booking-date-input"
            data-testid="booking-date-input"
            type="date"
            lang={lang === 'vi' ? 'vi-VN' : 'en-US'}
            min={todayIso}
            max={maxDateIso}
            value={formState.date}
            aria-required="true"
            onChange={(e) => {
              onClearSlotTakenAlert();
              onUpdateField('date', e.target.value);
            }}
            onClick={(e) => {
              const el = e.currentTarget as HTMLInputElement & { showPicker?: () => void };
              el.showPicker?.();
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {quickDates.map((d) => {
            const isSelected = formState.date === d.iso;
            return (
              <button
                key={d.iso}
                type="button"
                disabled={d.closed}
                data-testid={`quick-date-${d.offset}`}
                onClick={() => {
                  onClearSlotTakenAlert();
                  onUpdateField('date', d.iso);
                }}
                title={
                  d.closed
                    ? isVi
                      ? 'Ngày nghỉ định kỳ'
                      : 'Closed day'
                    : d.allFull
                    ? isVi
                      ? 'Đã kín lịch'
                      : 'Fully booked'
                    : undefined
                }
                className={`h-[34px] px-3 rounded-full border text-xs font-bold shrink-0 whitespace-nowrap transition-all focus-visible:outline-2 focus-visible:outline-[#FF7F6B] ${
                  d.closed ? 'opacity-45 cursor-not-allowed line-through' : 'cursor-pointer'
                }`}
                style={{
                  backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg)',
                  color: isSelected ? 'var(--on-primary)' : 'var(--text)',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                }}
              >
                {d.offset === 0
                  ? isVi
                    ? `Hôm nay (${d.displayShort.slice(0, 5)})`
                    : `Today (${d.displayShort})`
                  : d.offset === 1
                  ? isVi
                    ? `Ngày mai (${d.displayShort.slice(0, 5)})`
                    : `Tomorrow (${d.displayShort})`
                  : d.displayShort.slice(0, 5)}
                {d.closed ? (isVi ? ' · Nghỉ' : ' · Off') : ''}
              </button>
            );
          })}
        </div>

        {step1Submitted && step1Errors.date && (
          <p
            role="alert"
            aria-live="polite"
            className="text-[14px] font-semibold flex items-center gap-1.5"
            style={{ color: errorTextColor }}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{step1Errors.date}</span>
          </p>
        )}
      </div>

      {/* 4. Giờ hẹn */}
      <div ref={timeSlotGroupRef} tabIndex={-1} className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span
            className="block text-[14px] font-bold"
            style={{ color: 'var(--text)' }}
          >
            {isVi ? 'Giờ hẹn *' : 'Time slot *'}
          </span>
          <span
            className="text-xs font-semibold"
            style={{ color: 'var(--text-muted)' }}
          >
            {isVi
              ? `Thời lượng: ${selectedService.duration[lang]} · Giờ làm việc: 08:00 – 19:00`
              : `Duration: ${selectedService.duration[lang]} · Hours: 08:00 – 19:00`}
          </span>
        </div>

        {availableSlotsCount === 0 ? (
          <div
            data-testid="no-slots-message"
            className="rounded-2xl border p-5 text-center space-y-3"
            style={{
              backgroundColor: 'var(--surface-2)',
              borderColor: 'var(--border)',
            }}
          >
            <p className="font-bold text-base" style={{ color: 'var(--text)' }}>
              {isVi
                ? 'Hiện chưa có lịch trống ngày này'
                : 'No slots available on this day'}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {isVi
                ? 'Tất cả khung giờ trong ngày đã được đặt kín hoặc trung tâm nghỉ bảo dưỡng.'
                : 'All time slots on this date are booked or the clinic is closed.'}
            </p>
            <button
              type="button"
              data-testid="try-next-day-btn"
              onClick={() => {
                const nextOpen = findNextAvailableDate(
                  formState.date,
                  bookings,
                  new Date()
                );
                onUpdateField('date', nextOpen);
              }}
              className="btn-primary min-h-[40px] px-5 py-2 text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>
                {isVi ? 'Thử ngày có lịch kế tiếp' : 'Try next available day'}
              </span>
            </button>
          </div>
        ) : (
          <div
            role="radiogroup"
            aria-label={isVi ? 'Giờ hẹn' : 'Time slot'}
            className="grid grid-cols-4 sm:grid-cols-6 gap-2"
          >
            {timeSlots.map((slot) => {
              const isSelected = !slot.disabled && formState.timeSlot === slot.time;
              const slotEndTime = calculateServiceEndTime(slot.time, durationMinutes);
              const tooltipText = slot.disabled
                ? isVi
                  ? slot.reasonVi || 'Hết chỗ'
                  : slot.reasonEn || 'Full'
                : isVi
                ? `${slot.time} đến ${slotEndTime} (${selectedService.duration.vi})`
                : `${slot.time} to ${slotEndTime} (${selectedService.duration.en})`;

              return (
                <button
                  key={slot.time}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={slot.disabled}
                  title={tooltipText}
                  data-testid={`time-slot-${slot.time}`}
                  onClick={() => {
                    if (!slot.disabled) {
                      onClearSlotTakenAlert();
                      onUpdateField('timeSlot', slot.time);
                    }
                  }}
                  className={`min-h-[46px] py-1 px-2 rounded-xl border flex flex-col items-center justify-center transition-all tabular-nums focus-visible:outline-2 focus-visible:outline-[#FF7F6B] focus-visible:outline-offset-2 ${
                    slot.disabled
                      ? 'opacity-40 cursor-not-allowed line-through'
                      : 'cursor-pointer hover:border-(--primary)'
                  }`}
                  style={{
                    backgroundColor: isSelected
                      ? 'var(--primary)'
                      : slot.disabled
                      ? 'var(--surface-2)'
                      : 'var(--bg)',
                    color: isSelected ? 'var(--on-primary)' : 'var(--text)',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                  }}
                >
                  <span className="font-extrabold text-xs sm:text-sm leading-tight">
                    {slot.time}
                  </span>
                  {slot.disabled && slot.reasonVi === 'Nghỉ trưa' ? (
                    <span
                      className="text-[10px] font-bold leading-none mt-0.5 tracking-tight truncate no-underline"
                      style={{ color: 'var(--primary)' }}
                    >
                      {isVi ? 'Nghỉ trưa' : 'Lunch break'}
                    </span>
                  ) : (
                    !slot.disabled && (
                      <span
                        className="text-[10px] font-semibold leading-none mt-0.5 tracking-tight truncate"
                        style={{
                          color: isSelected
                            ? 'rgba(255,255,255,0.85)'
                            : 'var(--text-muted)',
                        }}
                      >
                        ~ {slotEndTime}
                      </span>
                    )
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Thẻ thông tin lịch trình trực quan dựa trên thời lượng thực tế của dịch vụ */}
        {formState.timeSlot && (
          <div
            data-testid="selected-schedule-banner"
            className="rounded-2xl border p-4 space-y-1.5 transition-all mt-3"
            style={{
              backgroundColor: 'var(--surface-2)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" style={{ color: 'var(--coral)' }} />
              <span className="font-heading text-sm font-bold" style={{ color: 'var(--text)' }}>
                {isVi ? 'Khung giờ phục vụ dự kiến:' : 'Estimated Service Schedule:'}{' '}
                <span style={{ color: 'var(--primary)' }} className="font-extrabold">
                  {formState.timeSlot} – {selectedEndTime}
                </span>
                <span className="ml-1 text-xs font-semibold opacity-75">
                  ({selectedService.duration[lang]})
                </span>
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {isVi
                ? '💡 Ba mẹ vui lòng đưa bé đến trung tâm trước khoảng 10 phút để nhân viên đón tiếp và làm quen với bé trước khi bắt đầu dịch vụ.'
                : '💡 Please arrive 10 minutes prior so our team can warmly welcome and settle your pet before service begins.'}
            </p>
          </div>
        )}

        {step1Submitted && step1Errors.timeSlot && (
          <p
            role="alert"
            aria-live="polite"
            className="text-[14px] font-semibold flex items-center gap-1.5"
            style={{ color: errorTextColor }}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{step1Errors.timeSlot}</span>
          </p>
        )}
      </div>
    </div>
  );
};

