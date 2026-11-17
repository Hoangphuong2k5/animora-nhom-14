'use client';

import React from 'react';
import { Language } from '@/types';

export interface FooterHeroAndWordmarkSectionProps {
  lang: Language;
  darkMode?: boolean;
  wordmarkFontSize: number | null;
  partAInView: boolean;
  partARef: React.RefObject<HTMLDivElement | null>;
}

export const FooterHeroAndWordmarkSection = ({
  lang,
  darkMode,
  wordmarkFontSize,
  partAInView,
  partARef,
}: FooterHeroAndWordmarkSectionProps) => {
  return (
    /* ========================================================= */
    /* PART A: Wordmark + Peeking Kitten + Sideways Wave          */
    /* Height: clamp(420px, 58vh, 680px) | Under 860px: clamp(320px, 46vh, 440px) */
    /* ========================================================= */
    <div
      ref={partARef}
      className="group relative w-full overflow-hidden pt-[30px] sm:pt-[42px] h-[clamp(350px,50vh,470px)] sm:h-[clamp(470px,63vh,690px)] flex flex-col justify-between bg-transparent"
    >
      {/* Layer 1: Giant Full-Width Wordmark "Animora" (High visibility, crisp contrast, touches both edges) */}
      <div
        className="relative z-10 w-full text-center px-0 pointer-events-none"
        style={{
          paddingTop: '0.08em',
          overflow: 'visible',
          whiteSpace: 'nowrap',
          lineHeight: 0.85,
          letterSpacing: '-0.02em',
        }}
      >
        <span
          className="inline-block font-heading font-extrabold"
          style={{
            fontSize: wordmarkFontSize ? `${wordmarkFontSize}px` : '24vw',
            lineHeight: 0.85,
            letterSpacing: '-0.02em',
            color: 'var(--footer-wordmark)',
            textShadow: 'var(--footer-wordmark-shadow)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
          }}
        >
          Animora
        </span>

        <style>{`
          :root, :root[data-theme="light"] {
            --footer-wordmark: #DE7A90;
            --footer-wordmark-shadow: 0 6px 20px rgba(107, 31, 46, 0.12);
          }
          :root[data-theme="dark"] {
            --footer-wordmark: #A24158;
            --footer-wordmark-shadow: 0 6px 24px rgba(0, 0, 0, 0.38);
          }
        `}</style>
      </div>

      {/* Layer 2: Waving Puppy & Kitten Duo (z-20, tucked cleanly behind z-30 wave crest) */}
      <div
        className="absolute bottom-[20px] sm:bottom-[32px] lg:bottom-[44px] z-20 pointer-events-auto flex items-end justify-center w-full px-4"
        style={{
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <div
          className={`flex items-end justify-center gap-4 sm:gap-10 lg:gap-16 transition-all duration-800 ease-out transform ${
            partAInView ? 'translate-y-0 opacity-100' : 'translate-y-[80px] opacity-0'
          }`}
        >
          {/* 1. Waving Puppy */}
          <div className="animate-pets-bob transition-transform duration-300 hover:-translate-y-3 cursor-pointer">
            <img loading="lazy" decoding="async"
              src="/assets/aistudio/peek_dog_waving_transparent.png"
              alt={lang === 'vi' ? 'Chú chó con vẫy chân chào' : 'Puppy waving paw'}
              className="h-[195px] sm:h-[280px] lg:h-[355px] max-h-[66vh] w-auto object-contain block mx-auto animate-paw-wave"
              style={{
                filter: 'var(--pet-filter, none)',
              }}
            />
          </div>

          {/* 2. Waving Kitten */}
          <div
            className="animate-pets-bob transition-transform duration-300 hover:-translate-y-3 cursor-pointer"
            style={{ animationDelay: '0.6s' }}
          >
            <img loading="lazy" decoding="async"
              src="/assets/aistudio/peek_kitten_clean_1200.png"
              alt={lang === 'vi' ? 'Mèo con vẫy chân chào' : 'Kitten waving paw'}
              className="h-[195px] sm:h-[280px] lg:h-[355px] max-h-[66vh] w-auto object-contain block mx-auto animate-paw-wave"
              style={{
                animationDelay: '0.4s',
                filter: 'var(--pet-filter, none)',
              }}
            />
          </div>
        </div>
        <style>{`
          html[data-theme="dark"] img[alt*="chào"],
          html[data-theme="dark"] img[alt*="waving"] {
            filter: brightness(0.92) !important;
          }
        `}</style>
      </div>

      {/* Layer 3: Multi-layered Natural Organic Wave SVG (z-30) + 4-Paw Walking Trail Decoration */}
      <div
        className="absolute bottom-0 left-0 right-0 z-30 w-full overflow-hidden -mb-[1px] h-[110px] sm:h-[150px] lg:h-[185px] pointer-events-none"
        aria-hidden="true"
      >
        {/* 4 Cream Paw-Print Icons walking diagonally across the wave */}
        <div className="absolute inset-0 pointer-events-none z-35 overflow-hidden">
          {/* Paw 1 */}
          <div
            className={`absolute animate-paw-trail text-[#FFF4E8]/20 transition-opacity duration-700 ${
              partAInView ? 'opacity-20' : 'opacity-0'
            }`}
            style={{
              left: '8%',
              bottom: '14%',
              transform: 'rotate(-20deg)',
              animationDelay: '0.1s',
            }}
          >
            <svg className="w-10 h-10 sm:w-12 sm:h-12 fill-current" viewBox="0 0 24 24">
              <path d="M12 14c-2.4 0-4.3 1.7-4.3 3.8 0 1.2.6 2.2 1.6 2.8.7.4 1.7.6 2.7.6s2-.2 2.7-.6c1-.6 1.6-1.6 1.6-2.8 0-2.1-1.9-3.8-4.3-3.8zm-5.5-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm11 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-8.8-4.5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6.6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </div>

          {/* Paw 2 */}
          <div
            className={`absolute animate-paw-trail text-[#FFF4E8]/20 transition-opacity duration-700 ${
              partAInView ? 'opacity-20' : 'opacity-0'
            }`}
            style={{
              left: '22%',
              bottom: '22%',
              transform: 'rotate(15deg)',
              animationDelay: '0.3s',
            }}
          >
            <svg className="w-11 h-11 sm:w-14 sm:h-14 fill-current" viewBox="0 0 24 24">
              <path d="M12 14c-2.4 0-4.3 1.7-4.3 3.8 0 1.2.6 2.2 1.6 2.8.7.4 1.7.6 2.7.6s2-.2 2.7-.6c1-.6 1.6-1.6 1.6-2.8 0-2.1-1.9-3.8-4.3-3.8zm-5.5-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm11 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-8.8-4.5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6.6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </div>

          {/* Paw 3 */}
          <div
            className={`absolute animate-paw-trail text-[#FFF4E8]/20 transition-opacity duration-700 ${
              partAInView ? 'opacity-20' : 'opacity-0'
            }`}
            style={{
              left: '78%',
              bottom: '20%',
              transform: 'rotate(-10deg)',
              animationDelay: '0.5s',
            }}
          >
            <svg className="w-10 h-10 sm:w-13 sm:h-13 fill-current" viewBox="0 0 24 24">
              <path d="M12 14c-2.4 0-4.3 1.7-4.3 3.8 0 1.2.6 2.2 1.6 2.8.7.4 1.7.6 2.7.6s2-.2 2.7-.6c1-.6 1.6-1.6 1.6-2.8 0-2.1-1.9-3.8-4.3-3.8zm-5.5-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm11 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-8.8-4.5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6.6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </div>

          {/* Paw 4 */}
          <div
            className={`absolute animate-paw-trail text-[#FFF4E8]/20 transition-opacity duration-700 ${
              partAInView ? 'opacity-20' : 'opacity-0'
            }`}
            style={{
              left: '88%',
              bottom: '28%',
              transform: 'rotate(24deg)',
              animationDelay: '0.7s',
            }}
          >
            <svg className="w-12 h-12 sm:w-15 sm:h-15 fill-current" viewBox="0 0 24 24">
              <path d="M12 14c-2.4 0-4.3 1.7-4.3 3.8 0 1.2.6 2.2 1.6 2.8.7.4 1.7.6 2.7.6s2-.2 2.7-.6c1-.6 1.6-1.6 1.6-2.8 0-2.1-1.9-3.8-4.3-3.8zm-5.5-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm11 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-8.8-4.5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6.6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </div>
        </div>

        {/* Multi-layered Sculptural Organic Wave SVG */}
        <svg
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          className="w-full h-full block"
        >
          {/* Wave Layer 1: Soft Blush Pink Ripple (Back) */}
          <path
            d="M0,68 C190,128 350,122 490,70 C630,18 780,10 940,46 C1100,82 1270,98 1440,32 L1440,160 L0,160 Z"
            fill="#F4B6C2"
            fillOpacity={darkMode ? 0.18 : 0.45}
          >
            <animate suppressHydrationWarning
              attributeName="d"
              dur="10s"
              repeatCount="indefinite"
              values="M0,68 C190,128 350,122 490,70 C630,18 780,10 940,46 C1100,82 1270,98 1440,32 L1440,160 L0,160 Z; M0,56 C210,114 380,110 520,58 C660,10 810,6 970,38 C1130,70 1300,86 1440,44 L1440,160 L0,160 Z; M0,68 C190,128 350,122 490,70 C630,18 780,10 940,46 C1100,82 1270,98 1440,32 L1440,160 L0,160 Z"
            />
          </path>

          {/* Wave Layer 2: Warm Rose Mid-Ripple */}
          <path
            d="M0,82 C170,138 330,132 475,78 C615,26 770,16 930,54 C1090,92 1265,110 1440,42 L1440,160 L0,160 Z"
            fill={darkMode ? '#4A1A27' : '#D47A8B'}
            fillOpacity={darkMode ? 0.6 : 0.38}
          >
            <animate suppressHydrationWarning
              attributeName="d"
              dur="8s"
              repeatCount="indefinite"
              values="M0,82 C170,138 330,132 475,78 C615,26 770,16 930,54 C1090,92 1265,110 1440,42 L1440,160 L0,160 Z; M0,70 C195,126 360,122 500,68 C640,16 795,12 955,44 C1115,82 1285,98 1440,54 L1440,160 L0,160 Z; M0,82 C170,138 330,132 475,78 C615,26 770,16 930,54 C1090,92 1265,110 1440,42 L1440,160 L0,160 Z"
            />
          </path>

          {/* Wave Layer 3: Main Foreground Natural Wave (var(--footer-bg)) */}
          <path
            d="M0,95 C180,148 340,142 480,88 C620,34 760,24 920,62 C1080,100 1260,118 1440,54 L1440,160 L0,160 Z"
            style={{ fill: 'var(--footer-bg)' }}
          >
            <animate suppressHydrationWarning
              attributeName="d"
              dur="12s"
              repeatCount="indefinite"
              values="M0,95 C180,148 340,142 480,88 C620,34 760,24 920,62 C1080,100 1260,118 1440,54 L1440,160 L0,160 Z; M0,82 C200,136 370,132 510,78 C650,22 800,18 960,54 C1120,92 1290,108 1440,66 L1440,160 L0,160 Z; M0,95 C180,148 340,142 480,88 C620,34 760,24 920,62 C1080,100 1260,118 1440,54 L1440,160 L0,160 Z"
            />
          </path>

          {/* Subtle Crest Highlight Line */}
          <path
            d="M0,95 C180,148 340,142 480,88 C620,34 760,24 920,62 C1080,100 1260,118 1440,54"
            fill="none"
            stroke="#F4B6C2"
            strokeOpacity={darkMode ? 0.38 : 0.28}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          >
            <animate suppressHydrationWarning
              attributeName="d"
              dur="12s"
              repeatCount="indefinite"
              values="M0,95 C180,148 340,142 480,88 C620,34 760,24 920,62 C1080,100 1260,118 1440,54; M0,82 C200,136 370,132 510,78 C650,22 800,18 960,54 C1120,92 1290,108 1440,66; M0,95 C180,148 340,142 480,88 C620,34 760,24 920,62 C1080,100 1260,118 1440,54"
            />
          </path>
        </svg>
      </div>
    </div>
  );
};
