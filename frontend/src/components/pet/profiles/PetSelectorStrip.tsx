import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Language } from '@/types';
import {
  CareRecord,
  PetProfileEntity,
  hasPetDueSoonOrOverdue,
  translateSpecies,
} from '@/data/petProfilesData';

interface PetSelectorStripProps {
  lang: Language;
  profilesCount?: number;
  visiblePets: PetProfileEntity[];
  activePetId: string;
  careRecords: CareRecord[];
  referenceNow: Date;
  petSearchQuery?: string;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  selectorScrollerRef: React.RefObject<HTMLDivElement | null>;
  pillRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
  onScrollEdges: () => void;
  onSelectPet: (petId: string) => void;
  onChangeSearch?: (query: string) => void;
}

export const PetSelectorStrip = ({
  lang,
  visiblePets,
  activePetId,
  careRecords,
  referenceNow,
  canScrollLeft,
  canScrollRight,
  selectorScrollerRef,
  pillRefs,
  onScrollEdges,
  onSelectPet,
}: PetSelectorStripProps) => {
  const handleScrollStep = (direction: 'prev' | 'next') => {
    const el = selectorScrollerRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === 'next' ? 280 : -280,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative">
      {canScrollLeft && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 z-10"
            style={{
              background: 'linear-gradient(to right, var(--bg) 35%, transparent 100%)',
            }}
          />
          <button
            type="button"
            data-testid="pet-selector-prev-btn"
            onClick={() => handleScrollStep('prev')}
            aria-label={lang === 'vi' ? 'Xem thú cưng trước' : 'Previous pets'}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full border shadow-md flex items-center justify-center transition-colors cursor-pointer hover:border-(--primary) focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </>
      )}
      {canScrollRight && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 z-10"
            style={{
              background: 'linear-gradient(to left, var(--bg) 35%, transparent 100%)',
            }}
          />
          <button
            type="button"
            data-testid="pet-selector-next-btn"
            onClick={() => handleScrollStep('next')}
            aria-label={lang === 'vi' ? 'Xem thêm thú cưng' : 'Next pets'}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full border shadow-md flex items-center justify-center transition-colors cursor-pointer hover:border-(--primary) focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      <div
        ref={selectorScrollerRef}
        onScroll={onScrollEdges}
        role="tablist"
        aria-label={lang === 'vi' ? 'Chọn hồ sơ thú cưng' : 'Select pet profile'}
        className="flex flex-nowrap items-center gap-2.5 overflow-x-auto py-1.5 scrollbar-none"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {visiblePets.map((pet) => {
          const isSelected = activePetId === pet.id;
          const thisPetRecords = careRecords.filter((r) => r.pet === pet.id);
          const isDueSoon = hasPetDueSoonOrOverdue(thisPetRecords, referenceNow);

          return (
            <button
              key={pet.id}
              ref={(el) => {
                pillRefs.current[pet.id] = el;
              }}
              type="button"
              role="tab"
              aria-selected={isSelected}
              data-testid={`pet-selector-pill-${pet.id}`}
              onClick={() => onSelectPet(pet.id)}
              className="px-3.5 py-2 rounded-full text-[15px] font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 border shadow-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7F6B]"
              style={{
                backgroundColor: isSelected ? 'var(--primary)' : 'var(--surface)',
                color: isSelected ? 'var(--on-primary)' : 'var(--text)',
                borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
              }}
            >
              <img
                loading="lazy"
                decoding="async"
                src={pet.photo}
                alt={pet.name}
                className="w-7 h-7 rounded-full object-cover shrink-0 border"
                style={{
                  borderColor: isSelected ? 'var(--on-primary)' : 'var(--border)',
                }}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src =
                    '/assets/images/about_fluffy_cat_1793177483392.jpg';
                }}
              />
              <span>{pet.name}</span>
              <span
                className="text-[12px] font-bold px-2.5 py-0.5 rounded-full leading-tight"
                style={{
                  backgroundColor: isSelected
                    ? 'color-mix(in srgb, var(--on-primary) 18%, transparent)'
                    : 'var(--surface-2)',
                  color: isSelected ? 'var(--on-primary)' : 'var(--text)',
                }}
              >
                {translateSpecies(pet.species, lang)}
              </span>
              {isDueSoon && (
                <span
                  role="img"
                  data-testid={`pet-due-dot-${pet.id}`}
                  aria-label={
                    lang === 'vi'
                      ? 'Có lịch sắp đến hạn'
                      : 'Has upcoming due item'
                  }
                  title={
                    lang === 'vi'
                      ? 'Có lịch sắp đến hạn'
                      : 'Has upcoming due item'
                  }
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: '#FF7F6B',
                    boxShadow: isSelected
                      ? '0 0 0 2px var(--primary)'
                      : '0 0 0 2px var(--surface)',
                  }}
                />
              )}
            </button>
          );
        })}

        {visiblePets.length === 0 && (
          <div className="py-2 px-4 text-xs font-semibold italic text-[var(--text-muted)]">
            {lang === 'vi'
              ? 'Không tìm thấy bé nào phù hợp'
              : 'No matching pets found'}
          </div>
        )}
      </div>
    </div>
  );
};

