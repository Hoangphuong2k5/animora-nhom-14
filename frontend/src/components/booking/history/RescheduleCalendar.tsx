'use client';

import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Language } from '@/types';
import { addDaysToIso, isDateClosed } from '@/data/serviceBookingData';

interface RescheduleCalendarProps {
  lang: Language;
  valueIso: string;
  originalIso: string;
  todayIso: string;
  maxIso: string;
  onSelect: (iso: string) => void;
}

const pad = (n: number) => String(n).padStart(2, '0');
const toIso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

const WEEKDAYS_VI = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const WEEKDAYS_EN = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const RescheduleCalendar = ({
  lang,
  valueIso,
  originalIso,
  todayIso,
  maxIso,
  onSelect,
}: RescheduleCalendarProps) => {
  const isVi = lang === 'vi';
  const gridRef = useRef<HTMLDivElement | null>(null);

  const initial = (valueIso || todayIso).split('-').map(Number);
  const [view, setView] = useState({ y: initial[0], m: initial[1] - 1 });

  const [ty, tm] = todayIso.split('-').map(Number);
  const [my, mm] = maxIso.split('-').map(Number);
  const canPrev = view.y > ty || (view.y === ty && view.m > tm - 1);
  const canNext = view.y < my || (view.y === my && view.m < mm - 1);

  const goMonth = (delta: number) => {
    setView((prev) => {
      const d = new Date(prev.y, prev.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  const firstOffset = (new Date(view.y, view.m, 1).getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: Array<number | null> = [
    ...Array.from({ length: firstOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = isVi
    ? `Tháng ${view.m + 1}, ${view.y}`
    : new Date(view.y, view.m, 1).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });

  const isDisabled = (iso: string) =>
    iso < todayIso || iso > maxIso || isDateClosed(iso, todayIso);

  const focusIso = (iso: string) => {
    const el = gridRef.current?.querySelector<HTMLButtonElement>(
      `[data-iso="${iso}"]:not(:disabled)`
    );
    el?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, iso: string) => {
    const delta =
      e.key === 'ArrowLeft'
        ? -1
        : e.key === 'ArrowRight'
        ? 1
        : e.key === 'ArrowUp'
        ? -7
        : e.key === 'ArrowDown'
        ? 7
        : 0;
    if (!delta) return;
    e.preventDefault();
    focusIso(addDaysToIso(iso, delta));
  };

  return (
    <div data-testid="reschedule-calendar" className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => goMonth(-1)}
          disabled={!canPrev}
          aria-label={isVi ? 'Tháng trước' : 'Previous month'}
          className="min-h-[40px] min-w-[40px] rounded-full border flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--bg)',
            borderColor: 'var(--border)',
            color: 'var(--primary)',
          }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span
          className="font-heading font-extrabold text-base"
          style={{ color: 'var(--primary)' }}
          aria-live="polite"
        >
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={() => goMonth(1)}
          disabled={!canNext}
          aria-label={isVi ? 'Tháng sau' : 'Next month'}
          className="min-h-[40px] min-w-[40px] rounded-full border flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--bg)',
            borderColor: 'var(--border)',
            color: 'var(--primary)',
          }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div
        role="grid"
        aria-label={monthLabel}
        ref={gridRef}
        className="grid grid-cols-7 gap-1.5"
      >
        {(isVi ? WEEKDAYS_VI : WEEKDAYS_EN).map((w) => (
          <div
            key={w}
            role="columnheader"
            className="text-center text-xs font-bold py-1"
            style={{ color: 'var(--text-muted)' }}
          >
            {w}
          </div>
        ))}
        {cells.map((day, idx) => {
          if (day === null) return <div key={`e-${idx}`} aria-hidden="true" />;
          const iso = toIso(view.y, view.m, day);
          const disabled = isDisabled(iso);
          const selected = iso === valueIso;
          const isToday = iso === todayIso;
          const isOriginal = iso === originalIso;
          return (
            <button
              key={iso}
              type="button"
              role="gridcell"
              data-iso={iso}
              data-testid={`reschedule-day-${iso}`}
              aria-selected={selected}
              aria-label={`${pad(day)}/${pad(view.m + 1)}/${view.y}${
                isOriginal ? (isVi ? ' (ngày hẹn hiện tại)' : ' (current date)') : ''
              }${isToday ? (isVi ? ' (hôm nay)' : ' (today)') : ''}`}
              disabled={disabled}
              onClick={() => onSelect(iso)}
              onKeyDown={(e) => handleKeyDown(e, iso)}
              className={`relative min-h-[44px] rounded-xl border text-sm font-extrabold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-[#FF7F6B] ${
                disabled ? 'opacity-35 cursor-not-allowed' : 'cursor-pointer'
              }`}
              style={{
                backgroundColor: selected ? 'var(--primary)' : 'var(--bg)',
                color: selected ? 'var(--on-primary)' : 'var(--text)',
                borderColor: selected
                  ? 'var(--primary)'
                  : isOriginal
                  ? 'var(--coral)'
                  : isToday
                  ? 'var(--primary)'
                  : 'var(--border)',
                textDecoration: disabled && isDateClosed(iso, todayIso) ? 'line-through' : undefined,
              }}
            >
              {day}
              {isOriginal && !selected && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: 'var(--coral)' }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div
        className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold"
        style={{ color: 'var(--text-muted)' }}
      >
        <span className="inline-flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: 'var(--coral)' }}
          />
          {isVi ? 'Ngày hẹn hiện tại' : 'Current date'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full border"
            style={{ borderColor: 'var(--primary)' }}
          />
          {isVi ? 'Hôm nay' : 'Today'}
        </span>
        <span className="inline-flex items-center gap-1.5 line-through">
          {isVi ? 'Phòng khám nghỉ' : 'Clinic closed'}
        </span>
      </div>
    </div>
  );
};

