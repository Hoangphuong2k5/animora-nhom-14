import React, { useRef } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Language } from '@/types';
import {
  ADOPTION_SPECIES_TABS,
  AdoptionSpeciesTab,
  AdoptionSortOption,
} from '@/data/adoptionData';

export interface AdoptionFilterToolbarProps {
  lang: Language;
  activeTab: AdoptionSpeciesTab;
  onSelectTab: (tab: AdoptionSpeciesTab) => void;
  counts: Record<AdoptionSpeciesTab, number>;
  sortBy: AdoptionSortOption;
  onChangeSort: (sort: AdoptionSortOption) => void;
}

export const AdoptionFilterToolbar = ({
  lang,
  activeTab,
  onSelectTab,
  counts,
  sortBy,
  onChangeSort,
}: AdoptionFilterToolbarProps) => {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const total = ADOPTION_SPECIES_TABS.length;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % total;
      const nextTab = ADOPTION_SPECIES_TABS[nextIndex];
      onSelectTab(nextTab.id);
      tabRefs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + total) % total;
      const prevTab = ADOPTION_SPECIES_TABS[prevIndex];
      onSelectTab(prevTab.id);
      tabRefs.current[prevIndex]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      onSelectTab(ADOPTION_SPECIES_TABS[0].id);
      tabRefs.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      const last = total - 1;
      onSelectTab(ADOPTION_SPECIES_TABS[last].id);
      tabRefs.current[last]?.focus();
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-8">
      {/* Species Tabs: role="tablist", single row, no wrap, height 44px, arrow-key navigation */}
      <div
        role="tablist"
        aria-label={lang === 'vi' ? 'Lọc thú cưng theo loài' : 'Filter pets by species'}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 max-w-full"
        style={{ scrollbarWidth: 'none' }}
      >
        {ADOPTION_SPECIES_TABS.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          const count = counts[tab.id] ?? 0;
          const label = lang === 'vi' ? tab.labelVi : tab.labelEn;

          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[idx] = el;
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              data-testid={`adopt-tab-${tab.id}`}
              onClick={(e) => {
                onSelectTab(tab.id);
                e.currentTarget.scrollIntoView({
                  behavior: 'smooth',
                  inline: 'center',
                  block: 'nearest',
                });
              }}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="h-[44px] px-4 rounded-full text-[15px] font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 border transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7F6B]"
              style={{
                backgroundColor: isActive ? 'var(--primary)' : 'var(--surface)',
                color: isActive ? 'var(--on-primary)' : 'var(--text)',
                borderColor: isActive ? 'var(--primary)' : 'var(--border)',
              }}
            >
              <span>{label}</span>
              <span
                className="text-[13px] font-bold px-1.5 py-0.5 rounded-full leading-none tabular-nums"
                style={{
                  backgroundColor: isActive
                    ? 'rgba(255, 244, 232, 0.2)'
                    : 'var(--surface-2)',
                  color: isActive ? 'var(--on-primary)' : 'var(--text-muted)',
                }}
              >
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Sort Dropdown on the right */}
      <div className="flex items-center justify-end gap-2 shrink-0">
        <label
          htmlFor="adoption-sort-select"
          className="text-[14px] font-bold whitespace-nowrap"
          style={{ color: 'var(--text-muted)' }}
        >
          {lang === 'vi' ? 'Sắp xếp:' : 'Sort:'}
        </label>
        <Select
          value={sortBy}
          onValueChange={(val) => {
            if (val !== null) {
              onChangeSort(val as AdoptionSortOption);
            }
          }}
          items={{
            newest: lang === 'vi' ? 'Mới nhất' : 'Newest',
            youngest: lang === 'vi' ? 'Nhỏ tuổi nhất' : 'Youngest',
            nearest: lang === 'vi' ? 'Gần tôi nhất' : 'Nearest to me',
          }}
        >
          <SelectTrigger
            id="adoption-sort-select"
            data-testid="adopt-sort-select"
            className="h-11! min-w-[155px] px-4 rounded-full text-[14px] font-bold border bg-(--surface) text-(--text) border-(--border) cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7F6B]"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-(--surface) border-(--border) text-(--text)">
            <SelectItem value="newest">
              {lang === 'vi' ? 'Mới nhất' : 'Newest'}
            </SelectItem>
            <SelectItem value="youngest">
              {lang === 'vi' ? 'Nhỏ tuổi nhất' : 'Youngest'}
            </SelectItem>
            <SelectItem value="nearest">
              {lang === 'vi' ? 'Gần tôi nhất' : 'Nearest to me'}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
