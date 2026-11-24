import React from 'react';
import { ArrowRight } from 'lucide-react';
import { PageId } from '@/types';
import { MilestoneItem, StatItem } from './aboutData';

export interface AboutHeroAndStorySectionProps {
  isVi: boolean;
  milestones: MilestoneItem[];
  onNavigate: (page: PageId) => void;
}

export interface AboutStatsSectionProps {
  isVi: boolean;
  stats: StatItem[];
}

export const AboutHeroAndStorySection: React.FC<AboutHeroAndStorySectionProps> = ({
  isVi,
  milestones,
  onNavigate,
}) => {
  return (
    <>
      {/* ========================================================
          SECTION 1 – BRAND INTRODUCTION
          Clean 2-Column: Left Text (Eyebrow, Title, Mission, CTA),
          Right Cut-Out Pets with Soft Floor Shadow & Soft Pink Shape
          ======================================================== */}
      <section
        id="about-intro"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Text content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <span
                data-testid="about-page-eyebrow"
                className="inline-block uppercase font-bold tracking-widest text-xs sm:text-sm"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: 'var(--primary)',
                }}
              >
                {isVi ? 'VỀ CHÚNG TÔI' : 'ABOUT US'}
              </span>

              <h1
                data-testid="about-page-title"
                className="font-heading font-extrabold leading-[1.15] tracking-tight"
                style={{
                  fontSize: 'clamp(32px, 4vw, 50px)',
                  color: 'var(--primary)',
                }}
              >
                {isVi ? 'Câu chuyện của Animora' : 'The Animora Story'}
              </h1>
            </div>

            <p
              data-testid="about-page-subtitle"
              className="text-base sm:text-lg lg:text-[18px] leading-relaxed font-normal"
              style={{ color: 'var(--text)' }}
            >
              {isVi
                ? 'Khởi nguồn từ niềm tin sâu sắc rằng mỗi người bạn nhỏ — dù là chú cún trung thành, bé mèo kiêu kỳ, bạn thỏ hiền lành, chú hamster tí hon hay cánh chim líu lo — đều xứng đáng được yêu thương, tôn trọng và chăm sóc bằng sự thấu hiểu y khoa tận tâm nhất.'
                : 'Founded on the deep belief that every animal companion — whether a loyal canine, independent feline, gentle rabbit, tiny hamster, or cheerful bird — deserves boundless love, respect, and compassionate veterinary excellence.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                data-testid="about-cta-services"
                onClick={() => onNavigate('services')}
                className="btn-primary px-7 py-3.5 text-sm font-bold shadow-md hover:shadow-lg inline-flex items-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5"
              >
                <span>{isVi ? 'Khám phá dịch vụ' : 'Explore Services'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('shop')}
                className="px-6 py-3.5 rounded-full text-sm font-bold border-2 transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                style={{
                  borderColor: 'var(--primary)',
                  color: 'var(--primary)',
                }}
              >
                {isVi ? 'Khám phá cửa hàng' : 'Explore Shop'}
              </button>
            </div>
          </div>

          {/* Right Column: User-provided Founding Pets Illustration */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <div className="relative w-full max-w-[440px] sm:max-w-[480px] lg:max-w-[500px]">
              <img
                loading="lazy"
                decoding="async"
                src="/assets/aistudio/about_hero_pets.png"
                alt="Animora - Loving companions"
                className="w-full h-auto object-contain select-none drop-shadow-[0_16px_32px_rgba(107,31,46,0.12)] transition-transform duration-500 hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 2 – OUR STORY
          Emotional narrative: Why multi-species, inspiration & vision
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-[32px] border-2 p-8 sm:p-12 lg:p-16 relative overflow-hidden"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          {/* Subtle brand tint glow */}
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ backgroundColor: '#F4B6C2' }}
          />

          <div className="max-w-3xl space-y-6 relative z-10">
            <span
              className="inline-block uppercase font-bold tracking-widest text-xs"
              style={{ color: 'var(--coral)' }}
            >
              {isVi ? 'NGUỒN CẢM HỨNG' : 'OUR INSPIRATION'}
            </span>

            <h2
              className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl leading-[1.2]"
              style={{ color: 'var(--primary)' }}
            >
              {isVi
                ? 'Hành trình ra đời từ tình yêu vô điều kiện'
                : 'Born from Unconditional Love & Pure Compassion'}
            </h2>

            <div
              className="space-y-4 text-base sm:text-lg leading-relaxed"
              style={{ color: 'var(--text)' }}
            >
              <p>
                {isVi
                  ? 'Năm 2012, chúng tôi nhận thấy các phòng khám thú y truyền thống thường mang lại cảm giác xa lạ, nồng nặc mùi thuốc khử trùng và tiếng ồn lạ khiến thú cưng run rẩy hoảng loạn. Animora ra đời với một khát khao giản dị: kiến tạo một chốn bình yên, nơi các con được vuốt ve, an ủi bằng sự ân cần và quy trình y khoa không sợ hãi (Fear-Free).'
                  : 'In 2012, we noticed how clinical, intimidating, and stressful traditional vet clinics felt for pets. Animora was born from a heartfelt purpose: to create a calming sanctuary where fear is replaced by gentle hands, patient voices, and certified Fear-Free medical care.'}
              </p>

              {/* Highlight Quote Box */}
              <div
                className="my-6 p-6 sm:p-7 rounded-2xl border-l-4 space-y-2"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--coral)',
                }}
              >
                <p
                  className="font-heading text-lg sm:text-xl font-bold italic leading-snug"
                  style={{ color: 'var(--primary)' }}
                >
                  {isVi
                    ? '“Tại sao lại là đa loài? Bởi vì tình yêu với sinh linh không phân biệt kích thước hay chủng loài.”'
                    : '“Why multi-species? Because love and reverence for life know no boundary of size or species.”'}
                </p>
                <p
                  className="text-sm sm:text-base leading-relaxed"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {isVi
                    ? 'Một chú thỏ bị đầy hơi chướng bụng, một bé hamster cần chiếc bánh xe chạy êm bảo vệ cột sống, hay một chú chim vẹt cần không khí tinh khiết... tất cả đều xứng đáng nhận được sự thấu hiểu chuyên sâu như những chú chó hay mèo.'
                    : 'A rabbit suffering digestive stasis, a hamster needing a spine-safe silent running wheel, or a bird needing clean air... each deserves specialized, tailored veterinary understanding.'}
                </p>
              </div>

              <p>
                {isVi
                  ? 'Định hướng tương lai của Animora là xây dựng hệ sinh thái chăm sóc thú cưng toàn diện và bền vững: kết hợp y học dự phòng, liệu pháp spa thảo mộc tĩnh âm, trạm nhận nuôi nhân đạo và nguồn dinh dưỡng hữu cơ an lành.'
                  : 'Looking ahead, Animora is building a sustainable, holistic pet care ecosystem: integrating preventive medicine, whisper-quiet herbal spa therapies, ethical adoption sanctuaries, and certified organic nourishment.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 3 – OUR JOURNEY (Timeline)
          Horizontal on desktop, vertical on mobile (4 milestones)
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span
            className="inline-block uppercase font-bold tracking-widest text-xs"
            style={{ color: 'var(--coral)' }}
          >
            {isVi ? 'CỘT MỐC PHÁT TRIỂN' : 'OUR JOURNEY'}
          </span>
          <h2
            className="font-heading font-extrabold text-3xl sm:text-4xl"
            style={{ color: 'var(--primary)' }}
          >
            {isVi ? 'Hành trình đồng hành & trưởng thành' : 'A Journey of Care & Growth'}
          </h2>
          <p
            className="text-base sm:text-lg leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            {isVi
              ? 'Từng bước chuyển mình từ một phòng khám nhỏ trở thành hệ sinh thái chăm sóc đa loài đáng tin cậy.'
              : 'Evolving from a gentle neighborhood clinic into a trusted, multi-species sanctuary.'}
          </p>
        </div>

        {/* Timeline Grid (Horizontal on Desktop, Vertical on Mobile) */}
        <div className="relative pt-6">
          {/* Desktop Connecting Line */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-[45px] left-12 right-12 h-1 rounded-full z-0"
            style={{ backgroundColor: 'var(--border)' }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {milestones.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div
                  key={idx}
                  className="animora-card p-6 sm:p-7 flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1.5"
                >
                  <div className="space-y-4">
                    {/* Node Icon & Year */}
                    <div className="flex items-center justify-between">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: 'var(--primary)' }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className="text-xs font-extrabold px-3 py-1.5 rounded-full border"
                        style={{
                          backgroundColor: 'var(--surface-2)',
                          borderColor: 'var(--border)',
                          color: 'var(--coral)',
                        }}
                      >
                        {m.year}
                      </span>
                    </div>

                    {/* Milestone Titles */}
                    <div className="space-y-1">
                      <h3
                        className="font-heading text-xl font-extrabold"
                        style={{ color: 'var(--primary)' }}
                      >
                        {isVi ? m.titleVi : m.titleEn}
                      </h3>
                      <p
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: 'var(--coral)' }}
                      >
                        {isVi ? m.subtitleVi : m.subtitleEn}
                      </p>
                    </div>

                    {/* Milestone Description */}
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {isVi ? m.descVi : m.descEn}
                    </p>
                  </div>

                  <div
                    className="mt-5 pt-4 border-t flex items-center gap-1.5 text-xs font-bold"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--primary)',
                    }}
                  >
                    <span>{isVi ? `Giai đoạn 0${idx + 1}` : `Phase 0${idx + 1}`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

export const AboutStatsSection: React.FC<AboutStatsSectionProps> = ({
  isVi,
  stats,
}) => {
  return (
    /* ========================================================
       SECTION 6 – ANIMORA IN NUMBERS
       Animated ribbon / counter badges
       ======================================================== */
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div
        className="rounded-[32px] p-8 sm:p-12 lg:p-14 border-2 relative overflow-hidden"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--primary)',
        }}
      >
        {/* Subtle background glow */}
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ backgroundColor: 'var(--coral)' }}
        />

        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span
            className="inline-block uppercase font-bold tracking-widest text-xs"
            style={{ color: 'var(--coral)' }}
          >
            {isVi ? 'DẤU ẤN ĐỒNG HÀNH' : 'ANIMORA IN NUMBERS'}
          </span>
          <h2
            className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl"
            style={{ color: 'var(--primary)' }}
          >
            {isVi ? 'Những con số biết nói' : 'Milestones in Numbers'}
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, sIdx) => (
            <div
              key={sIdx}
              className="p-6 rounded-2xl border text-center transition-all duration-300 hover:border-[#FF7F6B] hover:shadow-md"
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: 'var(--border)',
              }}
            >
              <span
                className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold block leading-none mb-2"
                style={{ color: 'var(--coral)' }}
              >
                {stat.val}
              </span>
              <h4
                className="font-heading text-sm sm:text-base font-bold mb-1"
                style={{ color: 'var(--primary)' }}
              >
                {isVi ? stat.labelVi : stat.labelEn}
              </h4>
              <p
                className="text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                {isVi ? stat.subVi : stat.subEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
