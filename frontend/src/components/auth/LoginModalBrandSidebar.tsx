import React from 'react';
import {
  CheckCircle2,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Language } from '@/types';
import { translations } from '@/data/translations';
import { ANIMORA_LOGO_SRC } from './shared/authConstants';

interface LoginModalBrandSidebarProps {
  lang: Language;
}

/** Left-hand Animora Member Club sidebar for LoginModal. */
export const LoginModalBrandSidebar = ({ lang }: LoginModalBrandSidebarProps) => {
  const t = translations[lang].loginModal;

  const benefits = [
    { icon: ShieldCheck, title: t.benefit1Title, desc: t.benefit1Desc },
    { icon: HeartHandshake, title: t.benefit2Title, desc: t.benefit2Desc },
    { icon: CheckCircle2, title: t.benefit3Title, desc: t.benefit3Desc },
  ];

  return (
    <div
      className="hidden md:flex md:col-span-5 p-8 flex-col justify-between relative overflow-hidden"
      style={{
        backgroundColor: 'var(--primary)',
        color: 'var(--on-primary)',
      }}
    >
      <div
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-15 pointer-events-none"
        style={{ backgroundColor: 'var(--coral)' }}
      />
      <div
        className="absolute -bottom-20 -left-16 w-56 h-56 rounded-full opacity-10 pointer-events-none"
        style={{ backgroundColor: 'var(--on-primary)' }}
      />

      <div className="space-y-6 relative z-10">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full overflow-hidden border-2 shadow-md shrink-0"
            style={{ borderColor: 'var(--coral)' }}
          >
            <img
              loading="lazy"
              decoding="async"
              src={ANIMORA_LOGO_SRC}
              alt="Animora Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="font-heading text-2xl font-extrabold tracking-tight block leading-none">
              Animora
            </span>
            <span className="text-xs opacity-80 font-medium">
              Multi-Species Pet Care Center
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full"
            style={{
              backgroundColor: 'var(--coral)',
              color: 'var(--on-coral)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Animora Member Club</span>
          </span>
          <h4 className="font-heading text-2xl font-extrabold leading-snug pt-1">
            {lang === 'vi'
              ? 'Đồng hành trọn vẹn cùng sức khỏe bé cưng'
              : 'Complete care for every beloved companion'}
          </h4>
        </div>

        <div className="space-y-4 pt-2">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div key={idx} className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: 'rgba(255,255,255,0.14)' }}
                >
                  <Icon className="w-4.5 h-4.5" style={{ color: 'var(--coral)' }} />
                </div>
                <div>
                  <p className="text-sm font-bold">{b.title}</p>
                  <p className="text-xs opacity-80 leading-relaxed mt-0.5">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-6 border-t border-white/15 text-xs opacity-85 relative z-10 flex items-center justify-between">
        <span>
          {lang === 'vi'
            ? '1.600+ gia đình tin chọn từ 2012'
            : '1,600+ families trusted since 2012'}
        </span>
        <span className="font-bold">4.9 ★</span>
      </div>
    </div>
  );
};
