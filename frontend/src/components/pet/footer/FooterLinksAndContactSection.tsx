'use client';

import React from 'react';
import { Zap, User, Phone, Mail, Copy, Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Language, PageId } from '@/types';
import { translations } from '@/data/translations';
import { CONTACT_INFO } from '@/constants/contact.constant';

export interface FooterLinksAndContactSectionProps {
  lang: Language;
  darkMode?: boolean;
  navT: (typeof translations)[Language]['nav'];
  footerT: (typeof translations)[Language]['footer'];
  infoInView: boolean;
  infoRef: React.RefObject<HTMLDivElement | null>;
  copiedField: 'phone' | 'email' | null;
  effectsEnabled: boolean;
  onNavigate?: (page: PageId) => void;
  onCopy: (value: string, field: 'phone' | 'email') => void;
  onToggleEffects: (checked?: boolean) => void;
  children?: React.ReactNode;
}

export const FooterLinksAndContactSection = ({
  lang,
  darkMode,
  navT,
  footerT,
  infoInView,
  infoRef,
  copiedField,
  effectsEnabled,
  onNavigate,
  onCopy,
  onToggleEffects,
  children,
}: FooterLinksAndContactSectionProps) => {
  return (
    <>
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {children}

        {/* 3. Info Row (Brand Story + Navigation Links + Contact Column) */}
        <div
          ref={infoRef}
          className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-start transition-all duration-700 delay-200 ${
            infoInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Left Column: Brand story & description */}
          <div className="lg:col-span-5 space-y-4 max-w-[460px] mx-auto lg:mx-0 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#F4B6C2] bg-white shadow-md flex items-center justify-center shrink-0">
                <img loading="lazy" decoding="async"
                  src="/assets/images/animora_pet_logo_1793179870995.jpg"
                  alt="Animora Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-heading text-2xl font-bold tracking-tight text-[#FFF4E8]">
                Animora
              </span>
            </div>

            <p className="text-[18px] text-[#FFF4E8] leading-[1.6] font-medium">
              {lang === 'vi'
                ? 'Chúng tôi là đội ngũ nhỏ yêu nghề, xây dựng toàn bộ hoạt động xoay quanh một điều duy nhất: giúp bé cưng của bạn luôn cảm thấy an toàn.'
                : 'We are a small team who love this work, and we built our whole practice around one thing: making your pet feel safe.'}
            </p>
          </div>

          {/* Middle Column: Navigation Links */}
          <div className="lg:col-span-3 flex flex-col items-center lg:items-start">
            <h3 className="font-heading text-xl font-bold !text-[#FFF4E8] mb-3">
              {footerT.colExplore}
            </h3>
            <ul className="grid grid-cols-2 lg:grid-cols-1 gap-x-8 gap-y-3 text-center lg:text-left text-base font-semibold text-[#FFF4E8]">
              {(
                [
                  { id: 'home', label: navT.home },
                  { id: 'about', label: navT.about },
                  { id: 'services', label: navT.services },
                  {
                    id: 'my-bookings',
                    label: lang === 'vi' ? 'Lịch hẹn của tôi' : 'My bookings',
                  },
                  { id: 'shop', label: navT.shop },
                  { id: 'pet-profiles', label: navT.petProfiles },
                ] as const
              ).map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    data-testid={`footer-link-${item.id}`}
                    onClick={() => onNavigate?.(item.id)}
                    className="min-h-[44px] lg:min-h-0 inline-flex items-center hover:text-[#FF7F6B] hover:underline decoration-[#FF7F6B] underline-offset-4 transition-colors focus:outline-none focus:underline cursor-pointer"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Contact Block ("Liên hệ" / "Contact") */}
          <div className="lg:col-span-4 w-full flex flex-col items-stretch lg:items-start">
            <div className="flex items-center justify-center lg:justify-between gap-3 mb-3">
              <h3 className="font-heading text-xl font-bold !text-[#FFF4E8]">
                {footerT.colContact}
              </h3>
              {copiedField && (
                <span
                  role="status"
                  aria-live="polite"
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FF7F6B] text-white shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  {footerT.copiedToast}
                </span>
              )}
            </div>

            <div className="w-full space-y-2">
              {/* 1. Contact Person Row */}
              <div className="group w-full min-h-[44px] flex items-center gap-3 py-1 text-[#FFF4E8] text-[18px] font-semibold leading-[1.6]">
                <User className="w-5 h-5 shrink-0 text-[#FFF4E8] transition-colors group-hover:text-[#FF7F6B]" />
                <div className="flex flex-wrap items-baseline gap-x-1.5">
                  <span className="text-sm font-medium text-[#FFF4E8]/80">
                    {footerT.contactPersonLabel}:
                  </span>
                  <span className="text-[18px] font-semibold leading-[1.6] text-[#FFF4E8]">
                    {CONTACT_INFO.personName}
                  </span>
                </div>
              </div>

              {/* 2. Phone Row */}
              <div className="group w-full min-h-[44px] flex items-center justify-between gap-2 py-1 text-[#FFF4E8] text-[18px] font-semibold leading-[1.6]">
                <a
                  href={CONTACT_INFO.phoneHref}
                  className="flex-1 min-h-[44px] inline-flex items-center gap-3 text-[#FFF4E8] text-[18px] font-semibold leading-[1.6] hover:underline decoration-[#FF7F6B] underline-offset-4 focus:outline-none focus:underline"
                >
                  <Phone className="w-5 h-5 shrink-0 text-[#FFF4E8] transition-colors group-hover:text-[#FF7F6B]" />
                  <span>{CONTACT_INFO.phoneDisplay}</span>
                </a>
                <button
                  type="button"
                  onClick={() => onCopy(CONTACT_INFO.phoneDisplay, 'phone')}
                  aria-label="Sao chép số điện thoại"
                  title={footerT.copyPhoneAria}
                  className="w-9 h-9 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] rounded-lg inline-flex items-center justify-center text-[#FFF4E8]/85 hover:text-[#FF7F6B] hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF7F6B] shrink-0 cursor-pointer"
                >
                  {copiedField === 'phone' ? (
                    <Check className="w-4 h-4 text-[#FF7F6B]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* 3. Email Row */}
              <div className="group w-full min-h-[44px] flex items-center justify-between gap-2 py-1 text-[#FFF4E8] text-[18px] font-semibold leading-[1.6]">
                <a
                  href={CONTACT_INFO.mailtoHref}
                  className="flex-1 min-w-0 min-h-[44px] inline-flex items-center gap-3 text-[#FFF4E8] text-[18px] font-semibold leading-[1.6] hover:underline decoration-[#FF7F6B] underline-offset-4 [overflow-wrap:anywhere] focus:outline-none focus:underline"
                >
                  <Mail className="w-5 h-5 shrink-0 text-[#FFF4E8] transition-colors group-hover:text-[#FF7F6B]" />
                  <span className="[overflow-wrap:anywhere]">{CONTACT_INFO.email}</span>
                </a>
                <button
                  type="button"
                  onClick={() => onCopy(CONTACT_INFO.email, 'email')}
                  aria-label="Sao chép email"
                  title={footerT.copyEmailAria}
                  className="w-9 h-9 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] rounded-lg inline-flex items-center justify-center text-[#FFF4E8]/85 hover:text-[#FF7F6B] hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF7F6B] shrink-0 cursor-pointer"
                >
                  {copiedField === 'email' ? (
                    <Check className="w-4 h-4 text-[#FF7F6B]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Second Thin Divider Line */}
        <div
          className="w-full h-[1px] mt-8 mb-4"
          style={{
            background: 'linear-gradient(to right, transparent, rgba(255, 244, 232, 0.3) 20%, rgba(255, 244, 232, 0.3) 80%, transparent)',
          }}
        />
      </div>

      {/* ========================================================= */}
      {/* 4. Fluffy Cloud Bottom Bar (Copyright + Bubbles Toggle)   */}
      {/* ========================================================= */}
      <div className="relative z-50 w-full h-[190px] overflow-hidden mt-6 flex items-end">
        {/* Drifting Layered Cloud Blobs (Back & Front Layers) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <style>{`
            :root, :root[data-theme="light"] {
              --cloud-1: #FFF4E8;
              --cloud-2: rgba(255, 255, 255, 0.85);
              --cloud-text: #3B1520;
            }
            :root[data-theme="dark"] {
              --cloud-1: #3A121D;
              --cloud-2: #4A1A27;
              --cloud-text: #FFF4E8;
            }
          `}</style>

          {/* Cloud Layer 1 (Drifting Layer) */}
          <div className="absolute bottom-0 left-0 w-[200%] h-full flex animate-cloud-drift-1 filter blur-[2px] opacity-90">
            <svg viewBox="0 0 1440 180" preserveAspectRatio="none" className="w-1/2 h-full fill-[var(--cloud-1)]">
              <path d="M0,100 Q180,30 360,90 Q540,20 720,80 Q900,10 1080,75 Q1260,30 1440,95 L1440,180 L0,180 Z" />
            </svg>
            <svg viewBox="0 0 1440 180" preserveAspectRatio="none" className="w-1/2 h-full fill-[var(--cloud-1)]">
              <path d="M0,100 Q180,30 360,90 Q540,20 720,80 Q900,10 1080,75 Q1260,30 1440,95 L1440,180 L0,180 Z" />
            </svg>
          </div>

          {/* Cloud Layer 2 (Drifting Overlay Layer) */}
          <div className="absolute bottom-0 left-0 w-[200%] h-full flex animate-cloud-drift-2 filter blur-[1px]">
            <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="w-1/2 h-full fill-[var(--cloud-2)]">
              <path d="M0,110 Q240,40 480,100 Q720,35 960,105 Q1200,45 1440,115 L1440,160 L0,160 Z" />
            </svg>
            <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="w-1/2 h-full fill-[var(--cloud-2)]">
              <path d="M0,110 Q240,40 480,100 Q720,35 960,105 Q1200,45 1440,115 L1440,160 L0,160 Z" />
            </svg>
          </div>
        </div>

        {/* Cloud Bottom Content (Copyright + Background Effects Toggle, NO Social Media Links) */}
        <div className="relative z-50 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[var(--cloud-text)] font-semibold text-sm">
          {/* Copyright */}
          <p>
            {lang === 'vi'
              ? '© 2026 Animora. Bảo lưu mọi quyền.'
              : '© 2026 Animora. All rights reserved.'}
          </p>

          {/* Effects Toggle (When ON, visual effects and bubbles run; when OFF, eco mode) */}
          <div
            role="button"
            tabIndex={0}
            data-testid="performance-mode-toggle"
            onClick={() => onToggleEffects(!effectsEnabled)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggleEffects(!effectsEnabled);
              }
            }}
            className="relative z-[60] inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border shadow-md hover:scale-[1.02] cursor-pointer select-none"
            style={{
              backgroundColor: darkMode
                ? (effectsEnabled ? '#3F1822' : '#2A1016')
                : (effectsEnabled ? '#FFF1EE' : '#FFF8F5'),
              borderColor: effectsEnabled ? '#FF7F6B' : 'rgba(107, 31, 46, 0.22)',
              color: 'inherit',
            }}
            title={
              lang === 'vi'
                ? (effectsEnabled
                    ? 'Hiệu ứng đang bật (Bong bóng bay & vệt chuột sinh động)'
                    : 'Hiệu ứng đang tắt (Tối ưu mượt mà & tiết kiệm pin)')
                : (effectsEnabled
                    ? 'Visual effects are ON (Full bubbles & animations)'
                    : 'Visual effects are OFF (Eco mode for speed)')
            }
          >
            <Zap className={`w-3.5 h-3.5 ${effectsEnabled ? 'text-[#FF7F6B] fill-[#FF7F6B]' : 'opacity-40'}`} />
            <span>
              {lang === 'vi'
                ? `Hiệu ứng: ${effectsEnabled ? 'Bật (Sinh động)' : 'Tắt (Tiết kiệm)'}`
                : `Effects: ${effectsEnabled ? 'ON (Full)' : 'OFF (Eco)'}`}
            </span>
            <Switch
              id="animora-perf-mode-switch"
              size="sm"
              checked={effectsEnabled}
              className="data-checked:bg-[#FF7F6B] pointer-events-none"
            />
          </div>
        </div>
      </div>
    </>
  );
};
