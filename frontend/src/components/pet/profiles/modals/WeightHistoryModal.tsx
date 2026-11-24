import React, { useState } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Language } from '@/types';
import {
  PetProfileEntity,
  WeightLog,
  computeWeightTrend,
  formatDisplayDate,
  formatWeightNumber,
  toLocalIsoDate,
} from '@/data/petProfilesData';

interface WeightHistoryModalProps {
  open: boolean;
  lang: Language;
  activePet: PetProfileEntity;
  weightTrend: ReturnType<typeof computeWeightTrend>;
  readOnly?: boolean;
  onOpenChange: (open: boolean) => void;
  onAddWeightLog: (log: WeightLog, formattedWeight: string) => void;
}

function WeightAddForm({
  lang,
  activePetId,
  onAddWeightLog,
}: {
  lang: Language;
  activePetId: string;
  onAddWeightLog: (log: WeightLog, formattedWeight: string) => void;
}) {
  const [newWeightKg, setNewWeightKg] = useState('');
  const [newWeightDate, setNewWeightDate] = useState(() =>
    toLocalIsoDate(new Date())
  );
  const [weightFormError, setWeightFormError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(newWeightKg.replace(',', '.'));
    if (Number.isNaN(parsed) || parsed <= 0 || parsed > 120) {
      setWeightFormError(
        lang === 'vi'
          ? 'Vui lòng nhập cân nặng hợp lệ (0,05 – 120 kg).'
          : 'Please enter a valid weight (0.05 – 120 kg).'
      );
      return;
    }
    if (!newWeightDate) {
      setWeightFormError(
        lang === 'vi' ? 'Vui lòng chọn ngày cân.' : 'Please select a date.'
      );
      return;
    }

    const log: WeightLog = {
      id: 'w-' + Date.now(),
      pet: activePetId,
      date: newWeightDate,
      kg: Math.round(parsed * 100) / 100,
    };

    const formattedW = `${formatWeightNumber(log.kg, lang)} kg`;
    onAddWeightLog(log, formattedW);
    setNewWeightKg('');
    setWeightFormError('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 pt-2 border-t"
      style={{ borderColor: 'var(--border)' }}
    >
      <h4
        className="font-heading text-lg font-bold"
        style={{ color: 'var(--text)' }}
      >
        {lang === 'vi' ? 'Thêm cân nặng' : 'Add weight'}
      </h4>
      {weightFormError && (
        <p className="text-[14px] font-bold text-[#C2410C]">
          {weightFormError}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label
            className="text-[13px] font-bold block"
            style={{ color: 'var(--text)' }}
          >
            {lang === 'vi' ? 'Cân nặng (kg) *' : 'Weight (kg) *'}
          </label>
          <input
            type="text"
            data-testid="input-new-weight-kg"
            value={newWeightKg}
            onChange={(e) => setNewWeightKg(e.target.value)}
            placeholder={lang === 'vi' ? 'VD: 3,9' : 'e.g. 3.9'}
            className="form-input w-full"
          />
        </div>
        <div className="space-y-1">
          <label
            className="text-[13px] font-bold block"
            style={{ color: 'var(--text)' }}
          >
            {lang === 'vi' ? 'Ngày cân *' : 'Date *'}
          </label>
          <input
            type="date"
            value={newWeightDate}
            onChange={(e) => setNewWeightDate(e.target.value)}
            className="form-input w-full"
          />
        </div>
      </div>
      <button
        type="submit"
        data-testid="submit-new-weight-btn"
        className="btn-primary w-full py-3 text-[15px] font-bold cursor-pointer"
      >
        {lang === 'vi' ? 'Lưu cân nặng' : 'Save weight'}
      </button>
    </form>
  );
}

export const WeightHistoryModal = ({
  open,
  lang,
  activePet,
  weightTrend,
  readOnly = false,
  onOpenChange,
  onAddWeightLog,
}: WeightHistoryModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        aria-label={lang === 'vi' ? 'Biểu đồ cân nặng' : 'Weight chart'}
        className="animora-card sm:max-w-lg p-6 gap-5 max-h-[92vh] overflow-y-auto scrollbar-thin"
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label={lang === 'vi' ? 'Đóng' : 'Close'}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-[var(--surface-2)] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
          style={{ color: 'var(--text-muted)' }}
        >
          <X className="w-5 h-5" />
        </button>

        <DialogHeader className="gap-1 pr-8">
          <DialogTitle
            className="font-heading text-2xl font-bold leading-snug"
            style={{ color: 'var(--text)' }}
          >
            {lang === 'vi'
              ? `Theo dõi cân nặng — ${activePet.name}`
              : `Weight History — ${activePet.name}`}
          </DialogTitle>
          <DialogDescription
            className="text-[14px] font-semibold"
            style={{ color: 'var(--text-muted)' }}
          >
            {weightTrend.formattedLatest} · {weightTrend.formattedDelta}
          </DialogDescription>
        </DialogHeader>

        <div
          className="p-4 rounded-2xl border space-y-3"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
        >
          <svg viewBox="0 0 240 80" className="w-full h-32 overflow-visible">
            {weightTrend.areaPath && (
              <path
                d={weightTrend.areaPath}
                fill="#F4B6C2"
                fillOpacity="0.45"
              />
            )}
            {weightTrend.linePath && (
              <path
                d={weightTrend.linePath}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {weightTrend.points.map((pt, idx) => (
              <g key={`${pt.date}-${idx}`}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={4}
                  fill={
                    idx === weightTrend.points.length - 1
                      ? '#FF7F6B'
                      : 'var(--primary)'
                  }
                  stroke="var(--surface)"
                  strokeWidth="1.5"
                />
              </g>
            ))}
          </svg>

          <div
            className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2 border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            {weightTrend.lastSix.map((item) => (
              <div key={item.id} className="text-center">
                <span
                  className="block text-[14px] font-bold tabular-nums"
                  style={{ color: 'var(--text)' }}
                >
                  {formatWeightNumber(item.kg, lang)} kg
                </span>
                <span
                  className="block text-[12px] tabular-nums"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {formatDisplayDate(item.date, lang).slice(0, 5)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {open && !readOnly && (
          <WeightAddForm
            key={activePet.id}
            lang={lang}
            activePetId={activePet.id}
            onAddWeightLog={onAddWeightLog}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

