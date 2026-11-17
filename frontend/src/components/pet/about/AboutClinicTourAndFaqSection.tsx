import React from 'react';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
} from 'lucide-react';
import { PageId } from '@/types';
import { CONTACT_INFO } from '@/constants/contact.constant';
import { ClinicZoneItem, FaqItem } from './aboutData';

export interface AboutClinicTourAndFaqSectionProps {
  isVi: boolean;
  clinicZones: ClinicZoneItem[];
  activeZone: ClinicZoneItem;
  onSelectZone: (zoneId: string) => void;
  faqs: FaqItem[];
  openFaqIdx: number | null;
  onToggleFaq: (idx: number) => void;
  onNavigate: (page: PageId) => void;
}

export const AboutClinicTourAndFaqSection: React.FC<AboutClinicTourAndFaqSectionProps> = ({
  isVi,
  clinicZones,
  activeZone,
  onSelectZone,
  faqs,
  openFaqIdx,
  onToggleFaq,
  onNavigate,
}) => {
  return (
    <>
      {/* ========================================================
          SECTION 7 – OUR FACILITIES & CARE ENVIRONMENT
          Interactive zone preview with high quality photography
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span
            className="inline-block uppercase font-bold tracking-widest text-xs"
            style={{ color: 'var(--coral)' }}
          >
            {isVi ? 'CƠ SỞ VẬT CHẤT TIÊU CHUẨN' : 'OUR SANCTUARY & CLINIC'}
          </span>
          <h2
            className="font-heading font-extrabold text-3xl sm:text-4xl"
            style={{ color: 'var(--primary)' }}
          >
            {isVi
              ? 'Không gian chuyên biệt cho từng loài thú cưng'
              : 'Purpose-Built Spaces for Every Species'}
          </h2>
          <p
            className="text-base sm:text-lg leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            {isVi
              ? 'Thiết kế loại bỏ tối đa áp lực tiếng ồn và mùi lạ giữa các loài, mang đến sự an tâm tuyệt đối.'
              : 'Designed to eliminate cross-species sensory stress, noise, and foreign scents.'}
          </p>
        </div>

        {/* Zone Selector Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          {clinicZones.map((zone) => (
            <button
              key={zone.id}
              type="button"
              onClick={() => onSelectZone(zone.id)}
              className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold border transition-all cursor-pointer"
              style={{
                backgroundColor:
                  activeZone.id === zone.id ? 'var(--primary)' : 'var(--surface)',
                color:
                  activeZone.id === zone.id ? 'var(--on-primary)' : 'var(--text)',
                borderColor:
                  activeZone.id === zone.id ? 'var(--primary)' : 'var(--border)',
              }}
            >
              {isVi ? zone.titleVi : zone.titleEn}
            </button>
          ))}
        </div>

        {/* Active Zone Display Card */}
        <div className="animora-card p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6">
            <div
              className="rounded-2xl overflow-hidden h-72 sm:h-96 border relative shadow-md"
              style={{ borderColor: 'var(--border)' }}
            >
              <img
                loading="lazy"
                decoding="async"
                src={activeZone.image}
                alt={isVi ? activeZone.titleVi : activeZone.titleEn}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--coral)' }}
              >
                {isVi ? 'Tiêu chuẩn quốc tế' : 'International Standard'}
              </span>
              <h3
                className="font-heading text-2xl sm:text-3xl font-extrabold leading-tight"
                style={{ color: 'var(--primary)' }}
              >
                {isVi ? activeZone.titleVi : activeZone.titleEn}
              </h3>
            </div>

            <p
              className="text-base leading-relaxed"
              style={{ color: 'var(--text)' }}
            >
              {isVi ? activeZone.descVi : activeZone.descEn}
            </p>

            <div className="space-y-3 pt-2">
              {(isVi ? activeZone.highlightsVi : activeZone.highlightsEn).map(
                (item, hIdx) => (
                  <div
                    key={hIdx}
                    className="flex items-center gap-3 text-sm font-semibold"
                    style={{ color: 'var(--text)' }}
                  >
                    <CheckCircle2
                      className="w-4 h-4 shrink-0"
                      style={{ color: 'var(--coral)' }}
                    />
                    <span>{item}</span>
                  </div>
                )
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('booking')}
                className="btn-primary px-6 py-3 text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>{isVi ? 'Đặt lịch ghé thăm cơ sở' : 'Book a Tour / Visit'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Compact FAQs & Location Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6">
          {/* FAQ Accordion */}
          <div className="lg:col-span-7 space-y-4">
            <h3
              className="font-heading text-2xl font-bold"
              style={{ color: 'var(--primary)' }}
            >
              {isVi ? 'Giải đáp thắc mắc thường gặp' : 'Frequently Asked Questions'}
            </h3>

            <div className="space-y-3">
              {faqs.map((faq, fIdx) => {
                const isOpen = openFaqIdx === fIdx;
                return (
                  <div
                    key={fIdx}
                    className="animora-card overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => onToggleFaq(fIdx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base cursor-pointer"
                      style={{ color: 'var(--text)' }}
                    >
                      <span>{isVi ? faq.qVi : faq.qEn}</span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        style={{ color: 'var(--coral)' }}
                      />
                    </button>
                    {isOpen && (
                      <div
                        className="px-5 pb-5 text-sm leading-relaxed border-t pt-3"
                        style={{
                          borderColor: 'var(--border)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {isVi ? faq.aVi : faq.aEn}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clinic Contact Info */}
          <div
            className="lg:col-span-5 p-7 rounded-[28px] border-2 space-y-5"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <span
              className="inline-block uppercase font-bold tracking-widest text-xs"
              style={{ color: 'var(--coral)' }}
            >
              {isVi ? 'THÔNG TIN LIÊN HỆ' : 'VISIT & CONTACT'}
            </span>

            <h4
              className="font-heading text-xl font-bold"
              style={{ color: 'var(--primary)' }}
            >
              {isVi
                ? 'Trung tâm Thú y & Spa Đa loài Animora'
                : 'Animora Multi-Species Care Center'}
            </h4>

            <div className="space-y-3.5 text-sm" style={{ color: 'var(--text)' }}>
              <div className="flex items-start gap-3">
                <MapPin
                  className="w-4 h-4 shrink-0 mt-1"
                  style={{ color: 'var(--coral)' }}
                />
                <span>
                  128 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone
                  className="w-4 h-4 shrink-0"
                  style={{ color: 'var(--coral)' }}
                />
                <a
                  href={CONTACT_INFO.phoneHref}
                  className="font-bold hover:underline"
                  style={{ color: 'var(--primary)' }}
                >
                  {isVi ? 'Hotline & Cấp cứu 24/7' : '24/7 Hotline'}:{' '}
                  {CONTACT_INFO.phoneDisplay}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail
                  className="w-4 h-4 shrink-0"
                  style={{ color: 'var(--coral)' }}
                />
                <a
                  href={CONTACT_INFO.mailtoHref}
                  className="hover:underline [overflow-wrap:anywhere]"
                  style={{ color: 'var(--primary)' }}
                >
                  {CONTACT_INFO.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Clock
                  className="w-4 h-4 shrink-0"
                  style={{ color: 'var(--coral)' }}
                />
                <span>
                  {isVi
                    ? 'Mở cửa mỗi ngày: 08:00 – 20:30'
                    : 'Open Daily: 08:00 AM – 08:30 PM'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 8 – FINAL CTA
          Inspiring message, Dual CTAs (/dat-lich & /nhan-nuoi),
          Quick links (/dich-vu, /nhan-nuoi, /cua-hang)
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[36px] p-8 sm:p-14 lg:p-16 text-center space-y-8 border-2 relative overflow-hidden shadow-xl bg-[#6B1F2E] dark:bg-[#3A121D] text-[#FFF4E8] border-[#8B2B3E] dark:border-[#5E2A38]">
          {/* Subtle soft pink background decorative circles */}
          <div
            aria-hidden="true"
            className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-15 blur-2xl pointer-events-none"
            style={{ backgroundColor: '#F4B6C2' }}
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full opacity-15 blur-2xl pointer-events-none"
            style={{ backgroundColor: 'var(--coral)' }}
          />

          <div className="max-w-3xl mx-auto space-y-4 relative z-10">
            <span
              className="inline-block uppercase font-bold tracking-widest text-xs px-4 py-1.5 rounded-full"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                color: '#FFF4E8',
              }}
            >
              {isVi ? 'ĐỒNG HÀNH CÙNG BÉ' : 'COMPANIONSHIP FOR LIFE'}
            </span>

            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight !text-[#FFF4E8]">
              {isVi
                ? 'Yêu thương đúng cách, bắt đầu từ hôm nay.'
                : 'Loving Pets the Right Way, Starting Today.'}
            </h2>

            <p className="text-base sm:text-lg leading-relaxed text-[#FFF4E8]/90 max-w-2xl mx-auto">
              {isVi
                ? 'Cùng Animora mang đến những điều tốt đẹp hơn cho người bạn nhỏ của bạn — từ sức khỏe toàn diện, diện mạo rạng rỡ đến một cuộc sống tràn đầy niềm vui.'
                : 'Join Animora in nurturing happier, healthier lives for your animal companions — through holistic wellness, gentle care, and unconditional devotion.'}
            </p>
          </div>

          {/* Dual Primary CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 pt-2">
            <button
              type="button"
              data-testid="about-final-cta-booking"
              onClick={() => onNavigate('booking')}
              className="px-8 py-4 rounded-full text-base font-extrabold shadow-lg cursor-pointer transition-all transform hover:-translate-y-0.5"
              style={{
                backgroundColor: 'var(--coral)',
                color: '#FFFFFF',
              }}
            >
              {isVi ? 'Đặt lịch chăm sóc →' : 'Book Care Appointment →'}
            </button>

            <button
              type="button"
              data-testid="about-final-cta-adopt"
              onClick={() => onNavigate('adopt')}
              className="px-8 py-4 rounded-full text-base font-extrabold border-2 text-[#FFF4E8] hover:bg-white/10 transition-all cursor-pointer"
              style={{ borderColor: 'rgba(255, 255, 255, 0.6)' }}
            >
              {isVi ? 'Tìm người bạn mới →' : 'Meet Adoptable Pets →'}
            </button>
          </div>

          {/* Quick Links Row */}
          <div
            className="pt-8 mt-6 border-t flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-bold relative z-10"
            style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <button
              type="button"
              onClick={() => onNavigate('services')}
              className="text-[#FFF4E8]/85 hover:text-white hover:underline cursor-pointer"
            >
              {isVi ? 'Dịch vụ khám & Spa' : 'Services & Spa'}
            </button>
            <span className="text-[#FFF4E8]/40">•</span>
            <button
              type="button"
              onClick={() => onNavigate('adopt')}
              className="text-[#FFF4E8]/85 hover:text-white hover:underline cursor-pointer"
            >
              {isVi ? 'Trạm Nhận nuôi Animora' : 'Adoption Sanctuary'}
            </button>
            <span className="text-[#FFF4E8]/40">•</span>
            <button
              type="button"
              onClick={() => onNavigate('shop')}
              className="text-[#FFF4E8]/85 hover:text-white hover:underline cursor-pointer"
            >
              {isVi ? 'Cửa hàng Dinh dưỡng' : 'Nutrition Shop'}
            </button>
          </div>
        </div>
      </section>
    </>
  );
};
