import React from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { BookingStatus, Language } from '@/types';

interface BookingStatusPillProps {
  status?: BookingStatus;
  lang: Language;
  darkMode?: boolean;
}

export const BookingStatusPill = ({
  status = 'Mới',
  lang,
  darkMode = false,
}: BookingStatusPillProps) => {
  const isVi = lang === 'vi';

  switch (status) {
    case 'Mới':
      return (
        <span
          data-testid="booking-status-pill"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold whitespace-nowrap border"
          style={{
            backgroundColor: 'var(--surface-2)',
            color: 'var(--text)',
            borderColor: 'var(--border)',
          }}
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{isVi ? 'Mới' : 'New'}</span>
        </span>
      );
    case 'Đã xác nhận':
      return (
        <span
          data-testid="booking-status-pill"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold whitespace-nowrap border"
          style={{
            backgroundColor: '#F4B6C2',
            color: '#3A0F1B',
            borderColor: '#E59AA8',
          }}
        >
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{isVi ? 'Đã xác nhận' : 'Confirmed'}</span>
        </span>
      );
    case 'Hoàn thành':
      return (
        <span
          data-testid="booking-status-pill"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold whitespace-nowrap border-2"
          style={{
            backgroundColor: 'var(--surface)',
            color: 'var(--primary)',
            borderColor: 'var(--primary)',
          }}
        >
          <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
          <span>{isVi ? 'Hoàn thành' : 'Completed'}</span>
        </span>
      );
    case 'Đã hủy':
      return (
        <span
          data-testid="booking-status-pill"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold whitespace-nowrap border"
          style={{
            backgroundColor: darkMode ? '#374151' : '#E5E7EB',
            color: darkMode ? '#F9FAFB' : '#1F2937',
            borderColor: darkMode ? '#4B5563' : '#D1D5DB',
          }}
        >
          <XCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{isVi ? 'Đã hủy' : 'Cancelled'}</span>
        </span>
      );
    case 'Không đến':
      return (
        <span
          data-testid="booking-status-pill"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold whitespace-nowrap border"
          style={{
            backgroundColor: darkMode ? '#374151' : '#E5E7EB',
            color: darkMode ? '#F9FAFB' : '#1F2937',
            borderColor: darkMode ? '#4B5563' : '#D1D5DB',
          }}
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{isVi ? 'Không đến' : 'No-show'}</span>
        </span>
      );
  }
};

