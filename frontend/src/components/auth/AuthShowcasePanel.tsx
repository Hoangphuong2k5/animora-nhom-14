import React from 'react';
import { Language } from '@/types';
import { PET_SLIDES } from './shared/authConstants';

interface AuthShowcasePanelProps {
  lang: Language;
  activeSlideIndex: number;
  onSelectSlide: (index: number) => void;
}

/** Right-hand high-res pet showcase panel with frosted glass caption for AuthPage. */
export const AuthShowcasePanel = ({
  lang,
  activeSlideIndex,
  onSelectSlide,
}: AuthShowcasePanelProps) => {
  const activeSlide = PET_SLIDES[activeSlideIndex] || PET_SLIDES[0];

  return (
    <div className="w-full lg:w-[52%] xl:w-[55%] p-4 sm:p-6 lg:p-7 lg:sticky lg:top-0 lg:h-screen flex items-center justify-center">
      <div
        className="relative w-full h-[480px] sm:h-[580px] lg:h-[calc(100vh-48px)] max-h-[860px] rounded-[36px] overflow-hidden select-none shadow-md flex items-center justify-center"
        style={{ backgroundColor: '#F3E5D3' }}
      >
        <img
          loading="lazy"
          decoding="async"
          key={activeSlide.id}
          src={activeSlide.image}
          alt={lang === 'vi' ? activeSlide.tagVi : activeSlide.tagEn}
          className="w-full h-full object-cover transition-all duration-700 !filter-none"
          style={{
            objectPosition: activeSlide.objectPosition || '50% 50%',
          }}
        />

        {/* S-curve decorative corner cutout */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 w-[72px] sm:w-[90px] h-[48px] sm:h-[58px] rounded-br-[32px] z-20"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          <svg
            className="absolute top-0 -right-[28px] w-[28px] h-[28px]"
            viewBox="0 0 28 28"
            fill="none"
          >
            <path d="M0 0H28C12.536 0 0 12.536 0 28V0Z" fill="var(--surface)" />
          </svg>
          <svg
            className="absolute -bottom-[28px] left-0 w-[28px] h-[28px]"
            viewBox="0 0 28 28"
            fill="none"
          >
            <path d="M0 0H28C12.536 0 0 12.536 0 28V0Z" fill="var(--surface)" />
          </svg>
        </div>

        {/* Bottom Frosted Glass Caption Card */}
        <div className="absolute bottom-6 inset-x-6 sm:inset-x-8 z-20">
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-stone-950/70 backdrop-blur-md border border-white/20 text-white shadow-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1 max-w-[440px]">
              <h3 className="font-heading text-base sm:text-lg font-bold leading-snug drop-shadow-sm text-white">
                {lang === 'vi' ? activeSlide.captionVi : activeSlide.captionEn}
              </h3>
              <p className="text-xs text-white/80 leading-relaxed">
                {lang === 'vi' ? activeSlide.subVi : activeSlide.subEn}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {PET_SLIDES.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => onSelectSlide(index)}
                  aria-label={`Slide ${index + 1}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    activeSlideIndex === index
                      ? 'w-7 h-2.5 bg-[var(--coral)] shadow-sm'
                      : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
