'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

export const bookingCardStyle: React.CSSProperties = {
  backgroundColor: 'var(--surface)',
  borderColor: 'var(--border)',
  boxShadow: 'var(--shadow)',
};

export const formatVnd = (n: number): string =>
  `${Math.round(n).toLocaleString('vi-VN')}đ`;

export const BookingSectionTitle = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <h2
    className="text-[13px] font-extrabold uppercase tracking-[0.1em]"
    style={{ color: 'var(--primary)' }}
  >
    {children}
  </h2>
);

export const BookingBreadcrumb = ({
  items,
}: {
  items: Array<{ label: string; onClick?: () => void; testId?: string }>;
}) => (
  <nav
    aria-label="Breadcrumb"
    className="flex flex-wrap items-center gap-1.5 text-sm font-semibold"
    style={{ color: 'var(--text-muted)' }}
  >
    {items.map((item, idx) => {
      const isLast = idx === items.length - 1;
      return (
        <React.Fragment key={`${item.label}-${idx}`}>
          {item.onClick && !isLast ? (
            <button
              type="button"
              data-testid={item.testId}
              onClick={item.onClick}
              className="hover:underline cursor-pointer font-bold"
              style={{ color: 'var(--primary)' }}
            >
              {item.label}
            </button>
          ) : (
            <span
              aria-current={isLast ? 'page' : undefined}
              className={isLast ? 'tabular-nums font-bold' : ''}
              style={isLast ? { color: 'var(--text)' } : undefined}
            >
              {item.label}
            </span>
          )}
          {!isLast && (
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          )}
        </React.Fragment>
      );
    })}
  </nav>
);

