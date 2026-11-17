'use client';

import React from 'react';
import { Language, PageId } from '@/types';
import { translations } from '@/data/translations';
import { useFooterEffectsAndWordmark } from './footer/useFooterEffectsAndWordmark';
import { FooterHeroAndWordmarkSection } from './footer/FooterHeroAndWordmarkSection';
import { FooterLinksAndContactSection } from './footer/FooterLinksAndContactSection';

interface FooterProps {
  lang: Language;
  darkMode?: boolean;
  onNavigate?: (page: PageId) => void;
  onShowToast?: (text: string) => void;
}

export const Footer = ({ lang, darkMode, onNavigate, onShowToast }: FooterProps) => {
  const navT = translations[lang].nav;
  const footerT = translations[lang].footer;

  const {
    copiedField,
    handleCopy,
    effectsEnabled,
    handleToggleEffects,
    wordmarkFontSize,
    partAInView,
    headlineInView,
    infoInView,
    partARef,
    headlineRef,
    infoRef,
  } = useFooterEffectsAndWordmark({
    lang,
    copiedToastText: footerT.copiedToast,
    onShowToast,
  });

  return (
    <footer className="relative z-40 w-full overflow-x-clip select-none">
      {/* ========================================================= */}
      {/* PART A: Wordmark + Peeking Kitten + Sideways Wave          */}
      {/* ========================================================= */}
      <FooterHeroAndWordmarkSection
        lang={lang}
        darkMode={darkMode}
        wordmarkFontSize={wordmarkFontSize}
        partAInView={partAInView}
        partARef={partARef}
      />

      {/* ========================================================= */}
      {/* PART B: Footer Body (Background --footer-bg, Cream Text)   */}
      {/* ========================================================= */}
      <div
        className="relative z-50 -mt-[2px] pt-12 pb-0 overflow-hidden"
        style={{
          backgroundColor: 'var(--footer-bg)',
          color: '#FFF4E8',
        }}
      >
        <FooterLinksAndContactSection
          lang={lang}
          darkMode={darkMode}
          navT={navT}
          footerT={footerT}
          infoInView={infoInView}
          infoRef={infoRef}
          copiedField={copiedField}
          effectsEnabled={effectsEnabled}
          onNavigate={onNavigate}
          onCopy={handleCopy}
          onToggleEffects={handleToggleEffects}
        >
          {/* 1. Headline */}
          <div
            ref={headlineRef}
            className={`relative text-center max-w-3xl mx-auto pt-4 transition-all duration-700 ${
              headlineInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2
              className="font-heading font-bold [text-wrap:balance] leading-[1.15] tracking-tight px-4 sm:px-8"
              style={{
                fontSize: 'clamp(28px, 4.5vw, 56px)',
                color: '#FFF4E8',
              }}
            >
              {lang === 'vi'
                ? 'Gặp gỡ đội ngũ chăm sóc đứng sau niềm vui của bé cưng'
                : "Meet the pet care team behind your pet's happiness"}
            </h2>
          </div>

          {/* First Thin Divider Line with Fading Ends */}
          <div
            className="w-full h-[1px] my-8"
            style={{
              background:
                'linear-gradient(to right, transparent, rgba(255, 244, 232, 0.3) 20%, rgba(255, 244, 232, 0.3) 80%, transparent)',
            }}
          />
        </FooterLinksAndContactSection>
      </div>
    </footer>
  );
};
