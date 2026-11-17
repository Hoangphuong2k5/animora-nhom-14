import React from 'react';
import { AlertTriangle, Calendar, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { Language } from '@/types';
import {
  PetProfileEntity,
  computeWeightTrend,
  formatAgeWithDob,
  formatDisplayDate,
  translateGender,
  translateSpecies,
} from '@/data/petProfilesData';

interface PetOverviewColumnProps {
  lang: Language;
  activePet: PetProfileEntity;
  weightTrend: ReturnType<typeof computeWeightTrend>;
  nextCheckupDays: number | null;
  hasVaccinationHistory?: boolean;
  onOpenWeightModal: () => void;
  onEditPet?: () => void;
  onDeletePet?: () => void;
}

export const PetOverviewColumn = ({
  lang,
  activePet,
  weightTrend,
  nextCheckupDays,
  hasVaccinationHistory = false,
  onOpenWeightModal,
  onEditPet,
  onDeletePet,
}: PetOverviewColumnProps) => {
  const { ageLabel, dobLabel } = formatAgeWithDob(
    activePet.age,
    activePet.ageEn,
    activePet.birthDate,
    lang
  );

  const rawAllergies =
    lang === 'en' && activePet.allergiesEn
      ? activePet.allergiesEn
      : activePet.allergies;
  const hasAllergyWarning =
    Boolean(rawAllergies) &&
    !['không có', 'none', 'không', 'chưa ghi nhận'].includes(
      rawAllergies.trim().toLowerCase()
    );

  const hasMicrochip =
    Boolean(activePet.microchip) &&
    !activePet.microchip.toLowerCase().includes('chưa') &&
    !activePet.microchip.toLowerCase().includes('none');

  return (
    <div
      className="lg:col-span-5 w-full space-y-5 border-b lg:border-b-0 lg:border-r pb-7 lg:pb-0 lg:pr-8"
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Top row: Photo + Name + Fact Chips */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 w-full">
        <div
          className="relative w-[160px] h-[160px] rounded-full overflow-hidden border-4 shadow-md shrink-0"
          style={{ borderColor: '#FF7F6B' }}
        >
          <img
            loading="lazy"
            decoding="async"
            src={activePet.photo}
            alt={activePet.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src =
                '/assets/images/about_fluffy_cat_1793177483392.jpg';
            }}
          />
        </div>

        <div className="flex-1 min-w-0 space-y-2.5 w-full">
          <span
            className="block text-[13px] font-bold uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            {translateSpecies(activePet.species, lang)} ·{' '}
            {translateGender(activePet.gender, lang)}
          </span>

          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2">
            <h3
              data-testid="active-pet-name"
              className="font-heading text-[32px] font-bold leading-tight"
              style={{ color: 'var(--text)' }}
            >
              {activePet.name}
            </h3>

            {(onEditPet || onDeletePet) && (
              <div className="flex items-center gap-1.5 shrink-0">
                {onEditPet && (
                  <button
                    type="button"
                    data-testid="edit-pet-btn"
                    onClick={onEditPet}
                    aria-label={lang === 'vi' ? 'Cập nhật hồ sơ' : 'Edit pet profile'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer hover:bg-[var(--surface-2)] focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>{lang === 'vi' ? 'Cập nhật' : 'Edit'}</span>
                  </button>
                )}
                {onDeletePet && (
                  <button
                    type="button"
                    data-testid="delete-pet-btn"
                    onClick={onDeletePet}
                    aria-label={lang === 'vi' ? 'Xóa hồ sơ' : 'Delete pet profile'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer hover:bg-rose-500/10 focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'color-mix(in srgb, #e11d48 35%, var(--border))',
                      color: '#fb7185',
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{lang === 'vi' ? 'Xóa' : 'Delete'}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
            {hasVaccinationHistory && (
              <span
                className="px-2.5 py-1 rounded-full text-[12px] font-bold border"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  color: 'var(--text)',
                  borderColor: 'var(--border)',
                }}
              >
                {lang === 'vi' ? 'Đã tiêm phòng' : 'Vaccinated'}
              </span>
            )}
            {activePet.neutered && (
              <span
                className="px-2.5 py-1 rounded-full text-[12px] font-bold border"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  color: 'var(--text)',
                  borderColor: 'var(--border)',
                }}
              >
                {lang === 'vi' ? 'Đã triệt sản' : 'Neutered'}
              </span>
            )}
            {hasMicrochip && (
              <span
                className="px-2.5 py-1 rounded-full text-[12px] font-bold border"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  color: 'var(--text)',
                  borderColor: 'var(--border)',
                }}
              >
                {lang === 'vi' ? 'Có vi mạch' : 'Microchipped'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2 x 3 Info Tiles Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="p-3.5 rounded-2xl border min-h-[86px] h-full flex flex-col justify-start gap-1.5"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
        >
          <span
            className="text-[13px] font-bold block"
            style={{ color: 'var(--text-muted)' }}
          >
            {lang === 'vi' ? 'Giống / loài' : 'Breed'}
          </span>
          <span
            className="text-[16px] font-bold leading-snug block"
            style={{ color: 'var(--text)' }}
          >
            {lang === 'en' && activePet.breedEn
              ? activePet.breedEn
              : activePet.breed}
          </span>
        </div>

        <div
          className="p-3.5 rounded-2xl border min-h-[86px] h-full flex flex-col justify-start gap-1.5"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
        >
          <span
            className="text-[13px] font-bold block"
            style={{ color: 'var(--text-muted)' }}
          >
            {lang === 'vi' ? 'Tuổi' : 'Age'}
          </span>
          <div>
            <span
              className="text-[16px] font-bold leading-snug block"
              style={{ color: 'var(--text)' }}
            >
              {ageLabel}
            </span>
            <span
              className="text-[12px] font-semibold block"
              style={{ color: 'var(--text-muted)' }}
            >
              {dobLabel}
            </span>
          </div>
        </div>

        <div
          className="p-3.5 rounded-2xl border min-h-[86px] h-full flex flex-col justify-start gap-1.5"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
        >
          <span
            className="text-[13px] font-bold block"
            style={{ color: 'var(--text-muted)' }}
          >
            {lang === 'vi' ? 'Cân nặng' : 'Weight'}
          </span>
          <span
            data-testid="pet-tile-weight"
            className="text-[16px] font-bold leading-snug tabular-nums block"
            style={{ color: 'var(--text)' }}
          >
            {weightTrend.formattedLatest || activePet.weight}
          </span>
        </div>

        <div
          className="p-3.5 rounded-2xl border min-h-[86px] h-full flex flex-col justify-start gap-1.5"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
        >
          <span
            className="text-[13px] font-bold flex items-center gap-1.5"
            style={{ color: 'var(--text-muted)' }}
          >
            <span>{lang === 'vi' ? 'Dị ứng' : 'Allergies'}</span>
            {hasAllergyWarning && (
              <AlertTriangle
                className="w-4 h-4 shrink-0"
                style={{ color: '#D9534F' }}
                aria-label={lang === 'vi' ? 'Lưu ý dị ứng' : 'Allergy warning'}
              />
            )}
          </span>
          <span
            className="text-[16px] font-bold leading-snug block"
            style={{ color: 'var(--text)' }}
          >
            {rawAllergies}
          </span>
        </div>

        <div
          className="col-span-2 p-3.5 rounded-2xl border min-h-[86px] h-full flex flex-col justify-start gap-1.5"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
        >
          <span
            className="text-[13px] font-bold block"
            style={{ color: 'var(--text-muted)' }}
          >
            {lang === 'vi' ? 'Mã vi mạch' : 'Microchip'}
          </span>
          <span
            className="text-[16px] font-bold leading-snug tabular-nums block"
            style={{ color: 'var(--text)' }}
          >
            {activePet.microchip}
          </span>
        </div>

        {activePet.note && (
          <div
            className="col-span-2 p-3.5 rounded-2xl border min-h-[74px] flex flex-col justify-start gap-1.5"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
          >
            <span
              className="text-[13px] font-bold block"
              style={{ color: 'var(--text-muted)' }}
            >
              {lang === 'vi' ? 'Ghi chú thêm' : 'Additional notes'}
            </span>
            <span
              className="text-[15px] font-medium leading-relaxed block"
              style={{ color: 'var(--text)' }}
            >
              {activePet.note}
            </span>
          </div>
        )}
      </div>

      {/* Next Checkup Row */}
      <div
        className="p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 border"
        style={{
          backgroundColor: 'var(--surface-2)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center gap-2">
          <Calendar
            className="w-4.5 h-4.5 shrink-0"
            style={{ color: 'var(--primary)' }}
          />
          <span className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>
            {lang === 'vi' ? 'Khám định kỳ tiếp theo' : 'Next checkup'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[16px] font-extrabold tabular-nums"
            style={{ color: 'var(--text)' }}
          >
            {formatDisplayDate(activePet.nextCheckupDate, lang)}
          </span>
          {nextCheckupDays !== null && (
            <span
              className="px-2.5 py-0.5 rounded-full text-[12px] font-bold"
              style={{
                backgroundColor: '#F4B6C2',
                color: '#3A0F1B',
              }}
            >
              {nextCheckupDays >= 0
                ? lang === 'vi'
                  ? `còn ${nextCheckupDays} ngày`
                  : `${nextCheckupDays} days left`
                : lang === 'vi'
                ? `quá hạn ${Math.abs(nextCheckupDays)} ngày`
                : `${Math.abs(nextCheckupDays)}d overdue`}
            </span>
          )}
        </div>
      </div>

      {/* Weight Trend Sparkline */}
      <button
        type="button"
        data-testid="pet-weight-sparkline-btn"
        onClick={onOpenWeightModal}
        className="w-full text-left p-4 rounded-2xl border transition-all hover:shadow-md cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7F6B]"
        style={{
          backgroundColor: 'var(--bg)',
          borderColor: 'var(--border)',
        }}
        aria-label={
          lang === 'vi'
            ? `Biểu đồ cân nặng của ${activePet.name}: ${weightTrend.formattedLatest} (${weightTrend.formattedDelta}). Nhấn để xem chi tiết và thêm cân nặng.`
            : `Weight trend for ${activePet.name}: ${weightTrend.formattedLatest} (${weightTrend.formattedDelta}). Click to view chart and add weight.`
        }
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <span
            className="text-[13px] font-bold flex items-center gap-1.5"
            style={{ color: 'var(--text-muted)' }}
          >
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            <span>
              {lang === 'vi'
                ? 'Xu hướng cân nặng (6 lần)'
                : 'Weight trend (last 6)'}
            </span>
          </span>
          <span
            data-testid="pet-weight-trend-summary"
            className="text-[16px] font-extrabold tabular-nums"
            style={{ color: 'var(--text)' }}
          >
            {weightTrend.formattedLatest} · {weightTrend.formattedDelta}
          </span>
        </div>

        <div className="w-full h-[80px]">
          <svg
            viewBox="0 0 240 80"
            className="w-full h-[80px] overflow-visible"
            role="img"
            aria-hidden="true"
          >
            {weightTrend.areaPath && (
              <path
                d={weightTrend.areaPath}
                fill="#F4B6C2"
                fillOpacity="0.42"
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
            {weightTrend.points.map((pt, idx) => {
              const isLast = idx === weightTrend.points.length - 1;
              return (
                <circle
                  key={`${pt.date}-${idx}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={isLast ? 4.5 : 3}
                  fill={isLast ? '#FF7F6B' : 'var(--primary)'}
                  stroke="var(--surface)"
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>
        </div>
      </button>
    </div>
  );
};

