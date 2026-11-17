import React from 'react';
import { Heart, Sparkles, X } from 'lucide-react';
import { Language } from '@/types';
import { SmallPawDecoration } from '../AdoptionShared';
import { AdoptionMatchPreferences } from '@/utils/petLogic';

interface AdoptionHeroAndQuizSectionProps {
  lang: Language;
  totalPetsCount: number;
  isQuizOpen: boolean;
  setIsQuizOpen: React.Dispatch<React.SetStateAction<boolean>>;
  quizPrefs: AdoptionMatchPreferences;
  setQuizPrefs: React.Dispatch<React.SetStateAction<AdoptionMatchPreferences>>;
  quizSubmitted: boolean;
  setQuizSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  onScrollToCatalog: () => void;
  onScrollToProcess: () => void;
}

export const AdoptionHeroAndQuizSection: React.FC<AdoptionHeroAndQuizSectionProps> = ({
  lang,
  totalPetsCount,
  isQuizOpen,
  setIsQuizOpen,
  quizPrefs,
  setQuizPrefs,
  quizSubmitted,
  setQuizSubmitted,
  onScrollToCatalog,
  onScrollToProcess,
}) => {
  return (
    <>
      {/* ================================================================= */}
      {/* PAGE INTRO HEADER                                                 */}
      {/* ================================================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2.5 max-w-2xl">
          <span
            data-testid="adopt-page-eyebrow"
            className="block uppercase font-bold"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'var(--primary)',
            }}
          >
            {lang === 'vi' ? 'NHẬN NUÔI THÚ CƯNG' : 'PET ADOPTION'}
          </span>
          <h1
            data-testid="adopt-page-title"
            className="font-heading font-extrabold leading-[1.14] tracking-[-0.02em]"
            style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              color: 'var(--primary)',
            }}
          >
            {lang === 'vi' ? 'Mái ấm mới cho các bé' : 'Find a new friend'}
          </h1>
          <p
            data-testid="adopt-page-subtitle"
            className="text-[18px] leading-relaxed font-normal"
            style={{ color: 'var(--text-muted)' }}
          >
            {lang === 'vi'
              ? 'Tìm hiểu tính cách, sức khỏe và đón người bạn bốn chân về với gia đình yêu thương.'
              : 'Explore profiles, health records and welcome a four-legged friend home.'}
          </p>
        </div>

        <span
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border self-start md:self-auto shrink-0"
          style={{
            backgroundColor: 'var(--surface-2)',
            borderColor: 'var(--border)',
            color: 'var(--primary)',
          }}
        >
          <SmallPawDecoration className="w-3.5 h-3.5" />
          <span>
            {lang === 'vi'
              ? 'Trạm cứu hộ Animora · 100% Phi thương mại'
              : 'Animora Sanctuary · 100% Non-profit'}
          </span>
        </span>
      </div>

      {/* ================================================================= */}
      {/* 1. ADOPTION HERO & MISSION BANNER                                 */}
      {/* ================================================================= */}
      <section
        data-testid="adopt-hero-banner"
        className="relative rounded-3xl overflow-hidden border p-6 sm:p-10 transition-all duration-300"
        style={{
          background:
            'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 65%, color-mix(in srgb, var(--pink) 30%, var(--surface)) 100%)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div className="max-w-3xl space-y-4">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--primary)',
            }}
          >
            <Heart className="w-3.5 h-3.5 fill-[#FF7F6B] text-[#FF7F6B]" />
            <span>
              {lang === 'vi'
                ? 'KẾT NỐI MÁI ẤM YÊU THƯƠNG'
                : 'CONNECTING LOVING HOMES'}
            </span>
          </div>

          <h2
            className="font-heading font-extrabold tracking-tight text-2xl sm:text-3xl lg:text-[38px] leading-[1.18]"
            style={{ color: 'var(--primary)' }}
          >
            {lang === 'vi'
              ? 'Trao mái ấm yêu thương, đón người bạn bốn chân về nhà'
              : 'Give a loving home, welcome a four-legged friend'}
          </h2>

          <p
            className="text-sm sm:text-base leading-relaxed font-medium"
            style={{ color: 'var(--text-muted)' }}
          >
            {lang === 'vi'
              ? 'Hơn 250 bé chó, mèo, thỏ và thú nhỏ đã tìm được gia đình trọn đời qua Animora. Mỗi bé tại trạm đều được bác sĩ kiểm tra sức khỏe, tiêm phòng đầy đủ và nuôi dưỡng bằng tình yêu thương vô điều kiện.'
              : 'Over 250 dogs, cats, rabbits, and small pets have found lifelong homes through Animora. Every pet in our care is vet-examined, fully vaccinated, and raised with unconditional love.'}
          </p>

          {/* Impact Metric Cards (4 stats) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div
              className="p-3.5 rounded-2xl border text-center space-y-0.5"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <p className="font-heading text-xl sm:text-2xl font-extrabold" style={{ color: '#FF7F6B' }}>
                250+
              </p>
              <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>
                {lang === 'vi' ? 'Bé đã có nhà' : 'Pets rehomed'}
              </p>
            </div>

            <div
              className="p-3.5 rounded-2xl border text-center space-y-0.5"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <p className="font-heading text-xl sm:text-2xl font-extrabold" style={{ color: 'var(--primary)' }}>
                100%
              </p>
              <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>
                {lang === 'vi' ? 'Tiêm chủng & Sức khỏe' : 'Vet checked'}
              </p>
            </div>

            <div
              className="p-3.5 rounded-2xl border text-center space-y-0.5"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <p className="font-heading text-xl sm:text-2xl font-extrabold" style={{ color: '#FF7F6B' }}>
                0 VNĐ
              </p>
              <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>
                {lang === 'vi' ? 'Phí thương mại' : 'Adoption fee'}
              </p>
            </div>

            <div
              className="p-3.5 rounded-2xl border text-center space-y-0.5"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <p className="font-heading text-xl sm:text-2xl font-extrabold" style={{ color: 'var(--primary)' }}>
                24/7
              </p>
              <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>
                {lang === 'vi' ? 'Đồng hành trọn đời' : 'Lifetime support'}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              type="button"
              data-testid="adopt-open-quiz-btn"
              onClick={() => setIsQuizOpen((prev) => !prev)}
              className="h-11 px-5 rounded-full text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition-all duration-200"
              style={{
                backgroundColor: isQuizOpen ? 'var(--surface-2)' : 'var(--primary)',
                color: isQuizOpen ? 'var(--primary)' : 'var(--on-primary)',
                border: isQuizOpen ? '1px solid var(--border)' : 'none',
              }}
            >
              <Sparkles className="w-4 h-4 text-[#FF7F6B]" />
              <span>
                {isQuizOpen
                  ? lang === 'vi'
                    ? 'Đóng trắc nghiệm'
                    : 'Close match quiz'
                  : lang === 'vi'
                  ? 'Trắc nghiệm tìm bé phù hợp'
                  : 'Pet compatibility quiz'}
              </span>
            </button>

            <button
              type="button"
              onClick={onScrollToCatalog}
              className="h-11 px-5 rounded-full text-sm font-bold inline-flex items-center gap-2 border transition-colors hover:border-[#FF7F6B] cursor-pointer"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
            >
              <span>{lang === 'vi' ? 'Xem các bé' : 'Explore pets'}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--surface-2)]">
                {totalPetsCount}
              </span>
            </button>

            <button
              type="button"
              onClick={onScrollToProcess}
              className="h-11 px-4 rounded-full text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition-colors hover:underline cursor-pointer"
              style={{ color: 'var(--primary)' }}
            >
              <span>{lang === 'vi' ? 'Quy trình 4 bước →' : '4-step process →'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 2. INTERACTIVE COMPATIBILITY MATCH-MAKER QUIZ (Expandable)        */}
      {/* ================================================================= */}
      {isQuizOpen && (
        <section
          data-testid="adopt-compatibility-quiz"
          className="rounded-3xl border p-6 sm:p-8 space-y-6 transition-all duration-300 animate-in fade-in slide-in-from-top-4"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <div
            className="flex flex-wrap items-center justify-between gap-3 border-b pb-4"
            style={{ borderColor: 'var(--border)' }}
          >
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#FF7F6B]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'vi' ? 'TRẮC NGHIỆM TƯƠNG THÍCH' : 'MATCH-MAKER QUIZ'}</span>
              </div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                {lang === 'vi'
                  ? 'Tìm bé cưng phù hợp với phong cách sống của bạn'
                  : 'Find the pet that fits your lifestyle'}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsQuizOpen(false)}
              className="w-8 h-8 rounded-full border flex items-center justify-center hover:opacity-80 cursor-pointer"
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
              aria-label={lang === 'vi' ? 'Đóng' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Question 1: Species */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {lang === 'vi' ? '1. Bạn muốn nhận nuôi loài nào?' : '1. Which species do you prefer?'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['All', 'Chó', 'Mèo', 'Thỏ', 'Hamster', 'Chim'] as const).map((sp) => {
                  const isSelected = quizPrefs.preferredSpecies === sp;
                  const label =
                    sp === 'All'
                      ? lang === 'vi'
                        ? 'Tất cả'
                        : 'Any'
                      : sp === 'Chim'
                      ? lang === 'vi'
                        ? 'Chim/Vẹt'
                        : 'Birds'
                      : sp;
                  return (
                    <button
                      key={sp}
                      type="button"
                      onClick={() =>
                        setQuizPrefs((prev) => ({ ...prev, preferredSpecies: sp }))
                      }
                      className="h-10 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer"
                      style={{
                        backgroundColor: isSelected ? 'var(--primary)' : 'var(--surface-2)',
                        color: isSelected ? 'var(--on-primary)' : 'var(--text)',
                        borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question 2: Living Space */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {lang === 'vi' ? '2. Không gian sống của gia đình?' : '2. Your living space?'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    id: 'apartment' as const,
                    vi: 'Căn hộ chung cư',
                    en: 'Apartment / Condo',
                  },
                  {
                    id: 'house_yard' as const,
                    vi: 'Nhà có sân / Vườn rộng',
                    en: 'House with yard',
                  },
                ].map((opt) => {
                  const isSelected = quizPrefs.livingSpace === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        setQuizPrefs((prev) => ({ ...prev, livingSpace: opt.id }))
                      }
                      className="h-10 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer"
                      style={{
                        backgroundColor: isSelected ? 'var(--primary)' : 'var(--surface-2)',
                        color: isSelected ? 'var(--on-primary)' : 'var(--text)',
                        borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                      }}
                    >
                      {lang === 'vi' ? opt.vi : opt.en}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question 3: Daily Time */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {lang === 'vi'
                  ? '3. Thời gian rảnh dành cho bé mỗi ngày?'
                  : '3. Daily time available for pet?'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'compact' as const, vi: '< 2 tiếng', en: '< 2 hours' },
                  { id: 'moderate' as const, vi: '2 - 4 tiếng', en: '2 - 4 hours' },
                  { id: 'plenty' as const, vi: '> 4 tiếng', en: '> 4 hours' },
                ].map((opt) => {
                  const isSelected = quizPrefs.dailyTime === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        setQuizPrefs((prev) => ({ ...prev, dailyTime: opt.id }))
                      }
                      className="h-10 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer"
                      style={{
                        backgroundColor: isSelected ? 'var(--primary)' : 'var(--surface-2)',
                        color: isSelected ? 'var(--on-primary)' : 'var(--text)',
                        borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                      }}
                    >
                      {lang === 'vi' ? opt.vi : opt.en}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question 4: Experience */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {lang === 'vi' ? '4. Kinh nghiệm nuôi thú cưng?' : '4. Pet parenting experience?'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    id: 'first_time' as const,
                    vi: 'Lần đầu nuôi bé',
                    en: 'First-time pet parent',
                  },
                  {
                    id: 'experienced' as const,
                    vi: 'Đã có kinh nghiệm',
                    en: 'Experienced caregiver',
                  },
                ].map((opt) => {
                  const isSelected = quizPrefs.experience === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        setQuizPrefs((prev) => ({ ...prev, experience: opt.id }))
                      }
                      className="h-10 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer"
                      style={{
                        backgroundColor: isSelected ? 'var(--primary)' : 'var(--surface-2)',
                        color: isSelected ? 'var(--on-primary)' : 'var(--text)',
                        borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                      }}
                    >
                      {lang === 'vi' ? opt.vi : opt.en}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quiz Submit Bar */}
          <div
            className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            <button
              type="button"
              onClick={() => {
                setQuizSubmitted(true);
                onScrollToCatalog();
              }}
              className="h-11 px-6 rounded-full text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
              style={{
                backgroundColor: '#FF7F6B',
                color: '#FFFFFF',
              }}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {lang === 'vi' ? 'Xem các bé phù hợp nhất' : 'Show best matches'}
              </span>
            </button>

            {quizSubmitted && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {lang === 'vi'
                    ? '✓ Đã sắp xếp theo độ tương thích cao nhất'
                    : '✓ Sorted by highest compatibility match'}
                </span>
                <button
                  type="button"
                  onClick={() => setQuizSubmitted(false)}
                  className="text-xs font-bold underline cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {lang === 'vi' ? 'Hủy kết quả trắc nghiệm' : 'Clear quiz match'}
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
};
