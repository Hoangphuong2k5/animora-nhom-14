import React from 'react';
import { Check } from 'lucide-react';
import { Language } from '@/types';

interface BookingStepperHeaderProps {
  lang: Language;
  currentStep: 1 | 2 | 3;
  onGoToStep: (step: 1 | 2 | 3) => void;
}

export const BookingStepperHeader = ({
  lang,
  currentStep,
  onGoToStep,
}: BookingStepperHeaderProps) => {
  const isVi = lang === 'vi';
  const stepTitles = {
    1: isVi ? 'Dịch vụ & thời gian' : 'Service & time',
    2: isVi ? 'Thông tin liên hệ' : 'Your details',
    3: isVi ? 'Xác nhận' : 'Review & confirm',
  };

  return (
    <div className="mb-8">
      <div className="flex sm:hidden items-center justify-between mb-3">
        <span
          className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full"
          style={{
            backgroundColor: 'var(--surface-2)',
            color: 'var(--primary)',
          }}
        >
          {isVi ? `Bước ${currentStep}/3` : `Step ${currentStep}/3`}
        </span>
        <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>
          {stepTitles[currentStep]}
        </span>
      </div>

      <ol
        aria-label={isVi ? 'Các bước đặt lịch' : 'Booking steps'}
        className="relative grid grid-cols-3 items-start"
      >
        <div
          aria-hidden="true"
          className="absolute top-[20px] left-[16.66%] right-[16.66%] -translate-y-1/2 h-[2px]"
          style={{ backgroundColor: 'var(--border)' }}
        />
        <div
          aria-hidden="true"
          className="absolute top-[20px] left-[16.66%] -translate-y-1/2 h-[2px] transition-all duration-300"
          style={{
            backgroundColor: 'var(--primary)',
            width:
              currentStep === 1 ? '0%' : currentStep === 2 ? '33.33%' : '66.66%',
          }}
        />

        {[
          { step: 1 as const, labelVi: '1 Dịch vụ', labelEn: '1 Service' },
          { step: 2 as const, labelVi: '2 Thông tin', labelEn: '2 Details' },
          { step: 3 as const, labelVi: '3 Xác nhận', labelEn: '3 Confirm' },
        ].map((item) => {
          const isCurrent = currentStep === item.step;
          const isFinished = currentStep > item.step;
          const canClick = item.step < currentStep;

          return (
            <li key={item.step} className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                disabled={!canClick && !isCurrent}
                aria-current={isCurrent ? 'step' : undefined}
                data-testid={`stepper-circle-${item.step}`}
                onClick={() => {
                  if (canClick) onGoToStep(item.step);
                }}
                className={`w-[40px] h-[40px] rounded-full flex items-center justify-center font-heading text-base font-extrabold transition-all focus-visible:outline-2 focus-visible:outline-[#FF7F6B] focus-visible:outline-offset-2 ${
                  canClick ? 'cursor-pointer' : 'cursor-default'
                }`}
                style={{
                  backgroundColor:
                    isCurrent || isFinished ? 'var(--primary)' : 'var(--surface)',
                  color:
                    isCurrent || isFinished
                      ? 'var(--on-primary)'
                      : 'var(--text-muted)',
                  border:
                    isCurrent || isFinished
                      ? '2px solid var(--primary)'
                      : '2px solid var(--border)',
                }}
              >
                {isFinished ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  item.step
                )}
              </button>
              <span
                className="mt-2 text-xs sm:text-[13px] font-bold text-center whitespace-nowrap"
                style={{
                  color: isCurrent ? 'var(--primary)' : 'var(--text-muted)',
                }}
              >
                {isVi ? item.labelVi : item.labelEn}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

