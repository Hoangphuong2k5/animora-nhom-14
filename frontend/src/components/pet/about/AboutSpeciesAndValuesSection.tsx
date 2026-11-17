import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PageId } from '@/types';
import { SpeciesApproachItem, CoreValueItem } from './aboutData';

export interface AboutSpeciesAndValuesSectionProps {
  isVi: boolean;
  speciesApproaches: SpeciesApproachItem[];
  coreValues: CoreValueItem[];
  onNavigate: (page: PageId) => void;
}

export const AboutSpeciesAndValuesSection: React.FC<AboutSpeciesAndValuesSectionProps> = ({
  isVi,
  speciesApproaches,
  coreValues,
  onNavigate,
}) => {
  return (
    <>
      {/* ========================================================
          SECTION 4 – OUR APPROACH (Species-Specific Care Cards)
          5 Cards: Dog, Cat, Rabbit, Hamster, Bird
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span
            className="inline-block uppercase font-bold tracking-widest text-xs"
            style={{ color: 'var(--coral)' }}
          >
            {isVi ? 'PHƯƠNG PHÁP CHĂM SÓC ĐA LOÀI' : 'OUR APPROACH'}
          </span>
          <h2
            className="font-heading font-extrabold text-3xl sm:text-4xl"
            style={{ color: 'var(--primary)' }}
          >
            {isVi
              ? 'Thấu hiểu sinh học, tôn trọng từng cá thể'
              : 'Biological Respect for Every Companion'}
          </h2>
          <p
            className="text-base sm:text-lg leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            {isVi
              ? 'Mỗi loài sở hữu cấu trúc sinh lý, tâm lý và nhịp sinh học khác biệt. Animora xây dựng phác đồ chuẩn xác cho từng nhóm bạn nhỏ.'
              : 'Each species possesses distinct physiology and psychological needs. We tailor care protocols to honor their biological essence.'}
          </p>
        </div>

        {/* 5 Species Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {speciesApproaches.map((spec) => {
            const Icon = spec.icon;
            return (
              <div
                key={spec.id}
                className="animora-card overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div>
                  {/* Photo Header */}
                  <div className="relative h-48 sm:h-52 overflow-hidden bg-black/5">
                    <img
                      loading="lazy"
                      decoding="async"
                      src={spec.image}
                      alt={isVi ? spec.speciesVi : spec.speciesEn}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Species Badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-[#6B1F2E] shadow-sm backdrop-blur-sm">
                        {isVi ? spec.badgeVi : spec.badgeEn}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#FF7F6B] flex items-center justify-center text-white shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h3 className="font-heading text-xl font-bold drop-shadow-sm">
                          {isVi ? spec.speciesVi : spec.speciesEn}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-1">
                      <span
                        className="text-xs font-bold uppercase tracking-wide block"
                        style={{ color: 'var(--coral)' }}
                      >
                        {isVi ? 'Trọng tâm chăm sóc' : 'Key Focus Areas'}
                      </span>
                      <p
                        className="font-bold text-sm sm:text-base"
                        style={{ color: 'var(--primary)' }}
                      >
                        {isVi ? spec.focusVi : spec.focusEn}
                      </p>
                    </div>

                    {/* 3 Structured Pillars */}
                    <ul className="space-y-2.5 pt-1">
                      {(isVi ? spec.pointsVi : spec.pointsEn).map(
                        (pt, pIdx) => (
                          <li
                            key={pIdx}
                            className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed"
                            style={{ color: 'var(--text)' }}
                          >
                            <CheckCircle2
                              className="w-4 h-4 shrink-0 mt-0.5"
                              style={{ color: 'var(--coral)' }}
                            />
                            <span>{pt}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>

                <div
                  className="px-6 pb-6 pt-2 border-t flex items-center justify-between"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <button
                    type="button"
                    onClick={() => onNavigate('services')}
                    className="text-xs font-bold inline-flex items-center gap-1.5 hover:underline cursor-pointer"
                    style={{ color: 'var(--primary)' }}
                  >
                    <span>
                      {isVi ? 'Xem gói dịch vụ cho bé →' : 'Explore care plans →'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          SECTION 5 – CORE VALUES (TẬN TÂM, MINH BẠCH, BỀN VỮNG)
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span
            className="inline-block uppercase font-bold tracking-widest text-xs"
            style={{ color: 'var(--coral)' }}
          >
            {isVi ? 'TRIẾT LÝ HOẠT ĐỘNG' : 'OUR CORE PILLARS'}
          </span>
          <h2
            className="font-heading font-extrabold text-3xl sm:text-4xl"
            style={{ color: 'var(--primary)' }}
          >
            {isVi
              ? '3 Trụ cột định hình tiêu chuẩn Animora'
              : '3 Core Values Guiding the Animora Standard'}
          </h2>
          <p
            className="text-base sm:text-lg leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            {isVi
              ? 'Những cam kết bất biến giúp hàng nghìn gia đình gửi trọn niềm tin cho chúng tôi suốt hơn một thập kỷ qua.'
              : 'Uncompromising principles that inspire thousands of families to trust Animora with their cherished companions.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {coreValues.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div
                key={idx}
                className="animora-card p-8 flex flex-col justify-between space-y-6 group transition-all duration-300 hover:-translate-y-1.5"
              >
                <div className="space-y-4">
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:rotate-6"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <h3
                      className="font-heading text-2xl font-extrabold tracking-tight"
                      style={{ color: 'var(--primary)' }}
                    >
                      {isVi ? val.titleVi : val.titleEn}
                    </h3>
                    <p
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: 'var(--coral)' }}
                    >
                      {isVi ? val.subVi : val.subEn}
                    </p>
                  </div>

                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--text)' }}
                  >
                    {isVi ? val.descVi : val.descEn}
                  </p>
                </div>

                <div
                  className="pt-4 border-t"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor: 'var(--surface-2)',
                      color: 'var(--primary)',
                    }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FF7F6B]" />
                    <span>{isVi ? val.badgeVi : val.badgeEn}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
};
