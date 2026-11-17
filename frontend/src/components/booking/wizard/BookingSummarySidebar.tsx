import React from 'react';
import { Clock, Heart, Mail, Phone, RefreshCw } from 'lucide-react';
import { Language } from '@/types';
import { CONTACT_INFO } from '@/constants/contact.constant';
import { ServiceEntity } from '@/data/servicesData';
import {
  calculateServiceEndTime,
  formatIsoDateForDisplay,
  getPetTypeLabel,
} from '@/data/serviceBookingData';
import { ServiceBookingDraft } from '@/hooks/booking/useServiceBookingWizard';
import { ServiceIcon } from '../shared/ServiceIcon';

interface BookingSummarySidebarProps {
  lang: Language;
  selectedService: ServiceEntity;
  formState: ServiceBookingDraft;
  estimatedPriceDisplay: string;
}

export const BookingSummarySidebar = ({
  lang,
  selectedService,
  formState,
  estimatedPriceDisplay,
}: BookingSummarySidebarProps) => {
  const isVi = lang === 'vi';
  const durationMinutes = selectedService.durationMinutes || 45;
  const isBoarding = selectedService.id === 'boarding';

  return (
    <aside
      data-testid="booking-summary-sidebar"
      className="w-full min-[960px]:w-[38%] min-[960px]:sticky space-y-5"
      style={{ top: 'calc(var(--nav-h) + 24px)' }}
    >
      <div
        className="rounded-[24px] border p-6 sm:p-7 space-y-5"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div className="pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2
            className="font-heading text-2xl font-extrabold"
            style={{ color: 'var(--primary)' }}
          >
            {isVi ? 'Tóm tắt lịch hẹn' : 'Booking summary'}
          </h2>
        </div>

        <div className="flex items-start gap-3.5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--on-primary)',
            }}
          >
            <ServiceIcon type={selectedService.icon} className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span
              className="block text-xs font-bold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              {isVi ? 'Dịch vụ đã chọn' : 'Selected service'}
            </span>
            <h3
              data-testid="summary-service-name"
              className="font-heading text-xl font-bold leading-snug"
              style={{ color: 'var(--text)' }}
            >
              {selectedService.name[lang]}
            </h3>
            <span
              className="text-xs font-semibold flex items-center gap-1 mt-0.5"
              style={{ color: 'var(--text-muted)' }}
            >
              <Clock className="w-3.5 h-3.5" style={{ color: 'var(--coral)' }} />
              {selectedService.duration[lang]}
            </span>
          </div>
        </div>

        <div
          className="space-y-3 pt-4 border-t text-sm"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-start justify-between gap-3">
            <span style={{ color: 'var(--text-muted)' }}>
              {isVi ? 'Thú cưng:' : 'Pet:'}
            </span>
            <span
              data-testid="summary-pet-info"
              className="font-bold text-right"
              style={{ color: 'var(--text)' }}
            >
              {formState.petName || getPetTypeLabel(formState.petType, lang)}
            </span>
          </div>

          <div className="flex items-start justify-between gap-3">
            <span style={{ color: 'var(--text-muted)' }}>
              {isVi ? 'Ngày & giờ:' : 'Date & time:'}
            </span>
            <div
              data-testid="summary-datetime"
              className="font-bold text-right tabular-nums"
              style={{ color: 'var(--text)' }}
            >
              <div>{formatIsoDateForDisplay(formState.date, lang)}</div>
              {formState.timeSlot && (
                <div
                  className="text-xs font-extrabold mt-0.5"
                  style={{ color: 'var(--primary)' }}
                >
                  {!isBoarding ? (
                    <>
                      {formState.timeSlot} – {calculateServiceEndTime(formState.timeSlot, durationMinutes)}
                      <span
                        className="block text-[11px] font-normal"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {selectedService.duration[lang]}
                      </span>
                    </>
                  ) : (
                    <>
                      {formState.timeSlot} (Check-in)
                      <span
                        className="block text-[11px] font-normal"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {isVi ? 'Trả phòng 12:00 hôm sau' : 'Check-out by 12:00 next day'}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl p-4 space-y-1.5"
          style={{ backgroundColor: 'var(--surface-2)' }}
        >
          <div className="flex items-baseline justify-between gap-2">
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              {isVi ? 'Chi phí dự kiến' : 'Estimated price'}
            </span>
            <span
              data-testid="summary-estimated-price"
              className="font-heading text-2xl font-extrabold tabular-nums"
              style={{ color: 'var(--primary)' }}
            >
              {estimatedPriceDisplay}
            </span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {isVi
              ? 'Giá cuối cùng phụ thuộc cân nặng và tình trạng của bé'
              : "Final price depends on your pet's weight and condition"}
          </p>
        </div>

        <div
          className="rounded-2xl border p-4 space-y-2.5"
          style={{
            backgroundColor: 'var(--bg)',
            borderColor: 'var(--border)',
          }}
        >
          <span className="block text-sm font-bold" style={{ color: 'var(--primary)' }}>
            {isVi ? 'Cần hỗ trợ?' : 'Need help?'}
          </span>
          <div className="space-y-1.5 text-sm">
            <a
              href={CONTACT_INFO.phoneHref}
              className="flex items-center gap-2 font-bold hover:underline focus-visible:outline-2 focus-visible:outline-[#FF7F6B] rounded"
              style={{ color: 'var(--text)' }}
            >
              <Phone className="w-4 h-4 shrink-0" style={{ color: 'var(--coral)' }} />
              <span>
                {isVi
                  ? `Gọi: ${CONTACT_INFO.phoneDisplay}`
                  : `Call: ${CONTACT_INFO.phoneDisplay}`}
              </span>
            </a>
            <a
              href={`mailto:${CONTACT_INFO.email}`}
              className="flex items-center gap-2 font-bold hover:underline break-all focus-visible:outline-2 focus-visible:outline-[#FF7F6B] rounded"
              style={{ color: 'var(--text)' }}
            >
              <Mail className="w-4 h-4 shrink-0" style={{ color: 'var(--coral)' }} />
              <span>{CONTACT_INFO.email}</span>
            </a>
          </div>
        </div>

        <ul
          className="space-y-2.5 pt-2 text-sm font-semibold"
          style={{ color: 'var(--text)' }}
        >
          <li className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 shrink-0" style={{ color: 'var(--primary)' }} />
            <span>
              {isVi ? 'Xác nhận lịch nhanh' : 'Fast appointment confirmation'}
            </span>
          </li>
          <li className="flex items-center gap-2.5">
            <RefreshCw className="w-4 h-4 shrink-0" style={{ color: 'var(--primary)' }} />
            <span>
              {isVi
                ? 'Đổi lịch miễn phí trước 24 giờ'
                : 'Free rescheduling up to 24h in advance'}
            </span>
          </li>
          <li className="flex items-center gap-2.5">
            <Heart className="w-4 h-4 shrink-0" style={{ color: 'var(--primary)' }} />
            <span>
              {isVi ? 'Đội ngũ yêu thú cưng' : 'Dedicated pet-loving team'}
            </span>
          </li>
        </ul>
      </div>
    </aside>
  );
};

