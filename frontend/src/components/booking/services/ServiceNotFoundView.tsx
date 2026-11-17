import React from 'react';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Language } from '@/types';

interface ServiceNotFoundViewProps {
  lang: Language;
  onBackToList: (e?: React.MouseEvent) => void;
}

export const ServiceNotFoundView = ({
  lang,
  onBackToList,
}: ServiceNotFoundViewProps) => {
  return (
    <div
      data-testid="page-service-not-found"
      className="pt-28 pb-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
    >
      <div
        className="rounded-[20px] border p-8 sm:p-12 space-y-6"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--on-primary)',
          }}
        >
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1
          className="font-heading text-3xl sm:text-4xl font-extrabold"
          style={{ color: 'var(--primary)' }}
        >
          {lang === 'vi' ? 'Không tìm thấy dịch vụ' : 'Service not found'}
        </h1>
        <p
          className="text-base max-w-lg mx-auto"
          style={{ color: 'var(--text-muted)' }}
        >
          {lang === 'vi'
            ? 'Dịch vụ bạn đang tìm kiếm không tồn tại hoặc đường dẫn đã thay đổi. Vui lòng quay lại danh sách dịch vụ của Animora.'
            : 'The service you are looking for does not exist or its link has changed. Please return to our services catalog.'}
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={onBackToList}
            className="btn-primary px-6 py-3 text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {lang === 'vi' ? '← Quay lại dịch vụ' : '← Back to services'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

