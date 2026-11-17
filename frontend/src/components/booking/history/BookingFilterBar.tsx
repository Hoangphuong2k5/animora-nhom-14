import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Language } from '@/types';
import { BookingSortOrder, BookingTabCategory } from '@/utils/bookingHistoryUtils';

interface BookingFilterBarProps {
  lang: Language;
  activeTab: BookingTabCategory;
  upcomingCount: number;
  totalBookingsCount: number;
  selectedPetFilter: string;
  petFilterItems: Record<string, string>;
  userBookingPetNames: string[];
  sortOrder: BookingSortOrder;
  sortOrderItems: Record<BookingSortOrder, string>;
  onChangePetFilter: (pet: string) => void;
  onChangeSortOrder: (sort: BookingSortOrder) => void;
}

export const BookingFilterBar = ({
  lang,
  activeTab,
  upcomingCount,
  totalBookingsCount,
  selectedPetFilter,
  petFilterItems,
  userBookingPetNames,
  sortOrder,
  sortOrderItems,
  onChangePetFilter,
  onChangeSortOrder,
}: BookingFilterBarProps) => {
  const isVi = lang === 'vi';

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <TabsList
        aria-label={isVi ? 'Phân loại lịch hẹn' : 'Appointment status tabs'}
        className="h-auto! flex-wrap items-center gap-2 p-1.5 rounded-full border self-start"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        {(
          [
            {
              id: 'upcoming' as const,
              labelVi: 'Sắp tới',
              labelEn: 'Upcoming',
              badge: upcomingCount,
            },
            {
              id: 'past' as const,
              labelVi: 'Đã qua',
              labelEn: 'Past',
            },
            {
              id: 'cancelled' as const,
              labelVi: 'Đã hủy',
              labelEn: 'Cancelled',
            },
          ]
        ).map((t) => {
          const isSelected = activeTab === t.id;
          return (
            <TabsTrigger
              key={t.id}
              value={t.id}
              id={`booking-tab-${t.id}`}
              data-testid={`booking-tab-${t.id}`}
              className="min-h-[44px] h-auto! px-5 py-2 rounded-full text-sm font-extrabold inline-flex items-center gap-2 transition-all cursor-pointer border-0 shadow-none text-[var(--text)] data-active:bg-[var(--primary)]! data-active:text-[var(--on-primary)]! focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
            >
              <span>{isVi ? t.labelVi : t.labelEn}</span>
              {typeof t.badge === 'number' && (
                <span
                  data-testid="upcoming-tab-badge"
                  className="px-2 py-0.5 rounded-full text-xs font-extrabold tabular-nums"
                  style={{
                    backgroundColor: isSelected
                      ? 'var(--on-primary)'
                      : 'var(--surface-2)',
                    color: 'var(--primary)',
                  }}
                >
                  {t.badge}
                </span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {totalBookingsCount > 1 && (
        <div
          data-testid="booking-filters-bar"
          className="flex flex-wrap items-center gap-3"
        >
          <div className="flex items-center gap-2">
            <label
              htmlFor="booking-pet-filter"
              className="text-xs font-bold whitespace-nowrap"
              style={{ color: 'var(--text-muted)' }}
            >
              {isVi ? 'Bé cưng:' : 'Pet:'}
            </label>
            <Select
              items={petFilterItems}
              value={selectedPetFilter}
              onValueChange={(val) => {
                if (val !== null) onChangePetFilter(val);
              }}
            >
              <SelectTrigger
                id="booking-pet-filter"
                data-testid="booking-pet-filter-select"
                aria-label={isVi ? 'Lọc theo bé cưng' : 'Filter by pet'}
                className="h-11! px-4 py-2 rounded-full border text-xs sm:text-sm font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF7F6B]"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {isVi ? 'Tất cả các bé' : 'All pets'}
                </SelectItem>
                {userBookingPetNames.map((petName) => (
                  <SelectItem key={petName} value={petName}>
                    {isVi ? `Bé ${petName}` : petName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="booking-sort-select"
              className="text-xs font-bold whitespace-nowrap"
              style={{ color: 'var(--text-muted)' }}
            >
              {isVi ? 'Sắp xếp:' : 'Sort:'}
            </label>
            <Select
              items={sortOrderItems}
              value={sortOrder}
              onValueChange={(val) => {
                if (val !== null) onChangeSortOrder(val as BookingSortOrder);
              }}
            >
              <SelectTrigger
                id="booking-sort-select"
                data-testid="booking-sort-select"
                aria-label={isVi ? 'Sắp xếp lịch hẹn' : 'Sort appointments'}
                className="h-11! px-4 py-2 rounded-full border text-xs sm:text-sm font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF7F6B]"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nearest">
                  {isVi ? 'Gần nhất' : 'Nearest'}
                </SelectItem>
                <SelectItem value="farthest">
                  {isVi ? 'Xa nhất' : 'Farthest'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};

