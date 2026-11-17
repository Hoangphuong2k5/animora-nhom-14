import React from 'react';
import { Calendar, PawPrint } from 'lucide-react';
import { Language } from '@/types';
import { BookingTabCategory } from '@/utils/bookingHistoryUtils';

interface BookingEmptyStateProps {
  lang: Language;
  activeTab: BookingTabCategory;
  onNavigateUrl: (path: string) => void;
}

export const BookingEmptyState = ({
  lang,
  activeTab,
  onNavigateUrl,
}: BookingEmptyStateProps) => {
  const isVi = lang === 'vi';

  return (
    <div
      data-testid={`empty-state-${activeTab}`}
      className="rounded-[20px] border p-10 text-center space-y-4"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow)',
      }}
    >
      <div
        className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
        style={{
          backgroundColor: 'var(--surface-2)',
          color: 'var(--primary)',
        }}
      >
        <PawPrint className="w-8 h-8" />
      </div>

      {activeTab === 'upcoming' && (
        <>
          <h3
            className="font-heading text-2xl font-bold"
            style={{ color: 'var(--primary)' }}
          >
            {isVi
              ? 'Bạn chưa có lịch hẹn nào sắp tới'
              : 'You have no upcoming appointments'}
          </h3>
          <p
            className="text-sm max-w-md mx-auto"
            style={{ color: 'var(--text-muted)' }}
          >
            {isVi
              ? 'Đặt lịch khám tổng quát, spa thảo dược hoặc lưu trú để các bác sĩ Animora chăm sóc chu đáo cho bé.'
              : 'Book a vet checkup, herbal spa, or boarding session for your beloved pet.'}
          </p>
          <div className="pt-2">
            <button
              type="button"
              data-testid="empty-upcoming-book-now-btn"
              onClick={() => onNavigateUrl('/dat-lich')}
              className="btn-primary min-h-[48px] px-7 py-3 text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>{isVi ? 'Đặt lịch ngay' : 'Book now'}</span>
            </button>
          </div>
        </>
      )}

      {activeTab === 'past' && (
        <>
          <h3
            className="font-heading text-2xl font-bold"
            style={{ color: 'var(--primary)' }}
          >
            {isVi
              ? 'Chưa có lịch hẹn nào đã qua'
              : 'No past appointments yet'}
          </h3>
          <p
            className="text-sm max-w-md mx-auto"
            style={{ color: 'var(--text-muted)' }}
          >
            {isVi
              ? 'Các lịch hẹn đã hoàn thành của bé sẽ được lưu trữ tại đây để ba mẹ tiện theo dõi.'
              : "Your pet's completed visits will appear here for easy tracking."}
          </p>
        </>
      )}

      {activeTab === 'cancelled' && (
        <>
          <h3
            className="font-heading text-2xl font-bold"
            style={{ color: 'var(--primary)' }}
          >
            {isVi
              ? 'Không có lịch hẹn nào đã hủy'
              : 'No cancelled appointments'}
          </h3>
          <p
            className="text-sm max-w-md mx-auto"
            style={{ color: 'var(--text-muted)' }}
          >
            {isVi
              ? 'Tuyệt vời! Bạn chưa hủy lịch hẹn chăm sóc nào gần đây.'
              : 'Great! You have not cancelled any recent appointments.'}
          </p>
        </>
      )}
    </div>
  );
};

