import React from 'react';
import { Language } from '@/types';
import { ADOPTION_PROCESS_STEPS } from '@/data/adoptionData';

export const SmallPawDecoration = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <ellipse cx="18" cy="22.5" rx="6.5" ry="5.2" fill="currentColor" opacity="0.88" />
    <circle cx="10.2" cy="14.5" r="2.7" fill="currentColor" opacity="0.88" />
    <circle cx="15.2" cy="11.2" r="2.9" fill="currentColor" opacity="0.88" />
    <circle cx="20.8" cy="11.2" r="2.9" fill="currentColor" opacity="0.88" />
    <circle cx="25.8" cy="14.5" r="2.7" fill="currentColor" opacity="0.88" />
  </svg>
);

export interface AdoptionHeaderProps {
  lang: Language;
  HeadingTag?: 'h1' | 'h2';
}

export const AdoptionSectionHeader = ({
  lang,
  HeadingTag = 'h2',
}: AdoptionHeaderProps) => {
  return (
    <div className="mb-8 space-y-5">
      <div className="space-y-2.5 max-w-2xl">
        <span
          data-testid="adopt-eyebrow-pill"
          className="block uppercase font-bold"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: 'var(--primary)',
          }}
        >
          {lang === 'vi' ? 'NHẬN NUÔI THÚ CƯNG' : 'PET ADOPTION'}
        </span>

        <HeadingTag
          className="font-heading font-extrabold leading-[1.14] tracking-[-0.02em]"
          style={{
            fontSize: 'clamp(32px, 4vw, 48px)',
            color: 'var(--primary)',
          }}
        >
          {lang === 'vi' ? 'Tìm người bạn mới' : 'Find a new friend'}
        </HeadingTag>

        <p
          data-testid="adopt-subtitle"
          className="text-[18px] leading-relaxed font-normal"
          style={{ color: 'var(--text-muted)' }}
        >
          {lang === 'vi'
            ? 'Mỗi bé đang chờ một gia đình yêu thương.'
            : 'Every pet is waiting for a loving family.'}
        </p>
      </div>

      {/* 4-step process row, small and calm, horizontal scroller on mobile */}
      <div
        data-testid="adopt-process-row"
        className="flex items-center justify-start gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1"
      >
        {ADOPTION_PROCESS_STEPS.map((step, idx) => (
          <React.Fragment key={step.step}>
            <div className="inline-flex items-center gap-2 shrink-0">
              <span
                className="w-7 h-7 rounded-full inline-flex items-center justify-center text-[13px] font-extrabold shrink-0"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  color: 'var(--primary)',
                }}
              >
                {step.step}
              </span>
              <span
                className="text-[14px] font-semibold whitespace-nowrap"
                style={{ color: 'var(--text)' }}
              >
                {lang === 'vi' ? step.shortVi : step.shortEn}
              </span>
            </div>
            {idx < ADOPTION_PROCESS_STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className="text-xs font-bold shrink-0 select-none px-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                →
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export const AdoptionSkeletonGrid = ({ count = 6 }: { count?: number }) => {
  return (
    <div
      data-testid="adopt-skeleton-grid"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-[1920px]:grid-cols-4 gap-6"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-[24px] border p-6 flex flex-col items-center animate-pulse"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div
            className="w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] rounded-full mb-5"
            style={{ backgroundColor: 'var(--surface-2)' }}
          />
          <div
            className="h-6 w-32 rounded-full mb-2.5"
            style={{ backgroundColor: 'var(--surface-2)' }}
          />
          <div
            className="h-4 w-44 rounded-full mb-4"
            style={{ backgroundColor: 'var(--surface-2)' }}
          />
          <div className="flex gap-2 mb-4">
            <div
              className="h-6 w-20 rounded-full"
              style={{ backgroundColor: 'var(--surface-2)' }}
            />
            <div
              className="h-6 w-24 rounded-full"
              style={{ backgroundColor: 'var(--surface-2)' }}
            />
          </div>
          <div
            className="h-4 w-full rounded-full mb-2"
            style={{ backgroundColor: 'var(--surface-2)' }}
          />
          <div
            className="h-4 w-3/4 rounded-full mb-6"
            style={{ backgroundColor: 'var(--surface-2)' }}
          />
          <div
            className="h-[44px] w-full rounded-full mt-auto"
            style={{ backgroundColor: 'var(--surface-2)' }}
          />
        </div>
      ))}
    </div>
  );
};

export const AdoptionEmptyState = ({
  lang,
  onResetFilter,
}: {
  lang: Language;
  onResetFilter: () => void;
}) => {
  return (
    <div
      data-testid="adopt-empty-state"
      className="rounded-[24px] border p-10 text-center max-w-lg mx-auto my-6"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow)',
      }}
    >
      <div
        className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
        style={{ backgroundColor: 'var(--surface-2)', color: 'var(--primary)' }}
      >
        <SmallPawDecoration className="w-8 h-8" />
      </div>
      <h3
        className="font-heading text-2xl font-bold mb-2"
        style={{ color: 'var(--primary)' }}
      >
        {lang === 'vi'
          ? 'Hiện chưa có bé nào trong mục này'
          : 'No pets in this category yet'}
      </h3>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        {lang === 'vi'
          ? 'Hãy khám phá tất cả các bé khác đang chờ một gia đình yêu thương tại Animora nhé.'
          : 'Explore all other companions waiting for a loving family at Animora.'}
      </p>
      <button
        type="button"
        onClick={onResetFilter}
        className="h-[44px] px-6 rounded-full text-sm font-bold cursor-pointer transition-colors"
        style={{
          backgroundColor: 'var(--primary)',
          color: 'var(--on-primary)',
        }}
      >
        {lang === 'vi' ? 'Xem tất cả các bé' : 'See all pets'}
      </button>
    </div>
  );
};
