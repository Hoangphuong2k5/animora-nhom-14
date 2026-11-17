import React from 'react';
import { AlertTriangle, Bell, Check, Pill } from 'lucide-react';
import { Language } from '@/types';
import { getNearestReminderForPet } from '@/data/petProfilesData';
import type { MedicationReminderItem } from '@/utils/clinicalSync';

interface PetReminderBannerProps {
  lang: Language;
  nearestReminder: ReturnType<typeof getNearestReminderForPet>;
  medicationReminders?: MedicationReminderItem[];
  onBookReminder: (serviceName: string) => void;
}

export const PetReminderBanner = ({
  lang,
  nearestReminder,
  medicationReminders = [],
  onBookReminder,
}: PetReminderBannerProps) => {
  const medBanner =
    medicationReminders.length > 0 ? (
      <div
        data-testid="pet-medication-reminder-bar"
        className="rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border"
        style={{
          backgroundColor: 'var(--bg)',
          borderColor: 'var(--border)',
          borderLeft: '4px solid var(--primary)',
          color: 'var(--text)',
        }}
      >
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <Pill className="w-5 h-5 shrink-0 mt-0.5 sm:mt-0" style={{ color: 'var(--primary)' }} />
          <div className="min-w-0">
            <p className="text-[15px] font-bold leading-snug" style={{ color: 'var(--text)' }}>
              {lang === 'vi'
                ? `Nhắc uống thuốc (${medicationReminders[0].prescriptionCode}): ${medicationReminders[0].medicineNames.join(', ')}`
                : `Medication reminder (${medicationReminders[0].prescriptionCode}): ${medicationReminders[0].medicineNames.join(', ')}`}
            </p>
            <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {medicationReminders[0].dosageSummary} ·{' '}
              {lang === 'vi'
                ? `Còn ${medicationReminders[0].daysLeft} ngày theo đơn`
                : `${medicationReminders[0].daysLeft} days left`}
            </p>
          </div>
        </div>
      </div>
    ) : null;

  if (nearestReminder.state === 'upcoming') {
    return (
      <div className="space-y-3">
        <div
          data-testid="pet-reminder-bar"
          data-reminder-state="upcoming"
          className="rounded-2xl px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{
            backgroundColor: 'var(--surface-2)',
            borderLeft: '4px solid #FF7F6B',
            color: 'var(--text)',
          }}
        >
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 shrink-0" style={{ color: 'var(--primary)' }} />
            <p className="text-[16px] font-bold leading-snug" style={{ color: 'var(--text)' }}>
              {lang === 'vi'
                ? `Sắp tới: ${nearestReminder.itemName} · còn ${nearestReminder.days} ngày`
                : `Upcoming: ${nearestReminder.itemName} · ${nearestReminder.days} days left`}
            </p>
          </div>
          <button
            type="button"
            data-testid="pet-reminder-book-btn"
            onClick={() => onBookReminder(nearestReminder.servicePreselect)}
            className="btn-primary px-4 py-2 text-[14px] font-bold shrink-0 self-start sm:self-auto cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7F6B]"
          >
            {lang === 'vi' ? 'Đặt lịch' : 'Book'}
          </button>
        </div>
        {medBanner}
      </div>
    );
  }

  if (nearestReminder.state === 'overdue') {
    return (
      <div className="space-y-3">
        <div
          data-testid="pet-reminder-bar"
          data-reminder-state="overdue"
          className="rounded-2xl px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{
            backgroundColor: '#C2410C',
            borderLeft: '4px solid #7C2D12',
            color: '#FFFFFF',
          }}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-white" />
            <p className="text-[16px] font-bold leading-snug text-white">
              {lang === 'vi'
                ? `${nearestReminder.itemName} · Quá hạn ${nearestReminder.days} ngày`
                : `${nearestReminder.itemName} · Overdue ${nearestReminder.days} days`}
            </p>
          </div>
          <button
            type="button"
            data-testid="pet-reminder-book-btn"
            onClick={() => onBookReminder(nearestReminder.servicePreselect)}
            className="px-4 py-2 rounded-full text-[14px] font-bold bg-white text-[#3B1520] hover:bg-[#FFF4E8] transition-colors shrink-0 self-start sm:self-auto cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {lang === 'vi' ? 'Đặt lịch' : 'Book'}
          </button>
        </div>
        {medBanner}
      </div>
    );
  }

  if (nearestReminder.state === 'up_to_date') {
    return (
      <div className="space-y-3">
        <div
          data-testid="pet-reminder-bar"
          data-reminder-state="up_to_date"
          className="rounded-2xl px-4 py-3.5 flex items-center gap-3"
          style={{
            backgroundColor: '#F4B6C2',
            borderLeft: '4px solid #6B1F2E',
            color: '#3A0F1B',
          }}
        >
          <Check className="w-5 h-5 shrink-0 text-[#3A0F1B]" />
          <p className="text-[16px] font-bold leading-snug text-[#3A0F1B]">
            {lang === 'vi' ? 'Mọi thứ đang đúng lịch 🎉' : 'All up to date 🎉'}
          </p>
        </div>
        {medBanner}
      </div>
    );
  }

  return medBanner;
};

