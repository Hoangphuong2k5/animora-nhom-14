import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Language } from '@/types';
import { ServiceEntity } from '@/data/servicesData';
import {
  calculateServiceEndTime,
  formatIsoDateForDisplay,
  getPetTypeLabel,
} from '@/data/serviceBookingData';
import { ServiceBookingDraft } from '@/hooks/booking/useServiceBookingWizard';

interface MobileBookingSummaryBarProps {
  lang: Language;
  selectedService: ServiceEntity;
  formState: ServiceBookingDraft;
  estimatedPriceDisplay: string;
  mobileSummaryOpen: boolean;
  onToggleMobileSummary: () => void;
}

export const MobileBookingSummaryBar = ({
  lang,
  selectedService,
  formState,
  estimatedPriceDisplay,
  mobileSummaryOpen,
  onToggleMobileSummary,
}: MobileBookingSummaryBarProps) => {
  const isVi = lang === 'vi';
  const durationMinutes = selectedService.durationMinutes || 45;
  const isBoarding = selectedService.id === 'boarding';
  const timeSlotFormatted = formState.timeSlot
    ? !isBoarding
      ? `· ${formState.timeSlot} – ${calculateServiceEndTime(formState.timeSlot, durationMinutes)}`
      : `· ${formState.timeSlot} (Check-in)`
    : '';

  return (
    <div
      data-testid="mobile-booking-summary-bar"
      className="min-[960px]:hidden mt-8 rounded-2xl border p-4 space-y-3"
      style={{
        backgroundColor: 'var(--surface-2)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span
            className="block text-xs font-bold truncate"
            style={{ color: 'var(--text-muted)' }}
          >
            {selectedService.name[lang]} ·{' '}
            {formatIsoDateForDisplay(formState.date, lang)}{' '}
            {timeSlotFormatted}
          </span>
          <span
            className="font-heading text-lg font-extrabold"
            style={{ color: 'var(--primary)' }}
          >
            {estimatedPriceDisplay}
          </span>
        </div>

        <button
          type="button"
          data-testid="mobile-summary-toggle-btn"
          aria-expanded={mobileSummaryOpen}
          onClick={onToggleMobileSummary}
          className="min-h-[44px] px-3.5 py-2 rounded-full border text-xs font-bold inline-flex items-center gap-1 shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--primary)',
          }}
        >
          <span>
            {mobileSummaryOpen
              ? isVi
                ? 'Ẩn tóm tắt'
                : 'Hide summary'
              : isVi
              ? 'Xem tóm tắt'
              : 'View summary'}
          </span>
          {mobileSummaryOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {mobileSummaryOpen && (
        <div
          className="pt-3 border-t space-y-2 text-xs"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
        >
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>
              {isVi ? 'Thời lượng:' : 'Duration:'}
            </span>
            <span className="font-bold">{selectedService.duration[lang]}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>
              {isVi ? 'Thú cưng:' : 'Pet:'}
            </span>
            <span className="font-bold">
              {formState.petName || getPetTypeLabel(formState.petType, lang)}
            </span>
          </div>
          <p className="text-[11px] pt-1" style={{ color: 'var(--text-muted)' }}>
            {isVi
              ? 'Giá cuối cùng phụ thuộc cân nặng và tình trạng của bé'
              : "Final price depends on your pet's weight and condition"}
          </p>
        </div>
      )}
    </div>
  );
};

