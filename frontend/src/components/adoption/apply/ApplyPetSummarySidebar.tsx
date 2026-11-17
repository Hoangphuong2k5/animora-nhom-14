import React from 'react';
import {
  ArrowLeft,
  Check,
  Clock,
  ExternalLink,
  Info,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { AdoptionPet, PageId } from '@/types';
import { CONTACT_INFO } from '@/constants/contact.constant';

interface ApplyWizardHeaderProps {
  isEn: boolean;
  pet: AdoptionPet;
  speciesLabel: string;
  hasRestoredDraft: boolean;
  onNavigate: (page: PageId) => void;
  onNavigateUrl: (url: string) => void;
  onClearDraft: () => void;
}

export const ApplyWizardHeader: React.FC<ApplyWizardHeaderProps> = ({
  isEn,
  pet,
  speciesLabel,
  hasRestoredDraft,
  onNavigate,
  onNavigateUrl,
  onClearDraft,
}) => (
  <>
    {/* Breadcrumbs */}
    <nav
      aria-label="Breadcrumb"
      className="mb-3 text-xs sm:text-sm text-[var(--text-muted)] flex items-center flex-wrap gap-1.5 font-medium"
    >
      <button
        type="button"
        onClick={() => onNavigate('home')}
        className="hover:text-[var(--primary)] transition-colors cursor-pointer"
      >
        {isEn ? 'Home' : 'Trang chủ'}
      </button>
      <span className="opacity-50">›</span>
      <button
        type="button"
        onClick={() => onNavigate('adopt')}
        className="hover:text-[var(--primary)] transition-colors cursor-pointer"
      >
        {isEn ? 'Adoption' : 'Nhận nuôi'}
      </button>
      <span className="opacity-50">›</span>
      <button
        type="button"
        onClick={() => onNavigateUrl(`/nhan-nuoi/${pet.slug}`)}
        className="hover:text-[var(--primary)] transition-colors cursor-pointer"
      >
        {pet.name}
      </button>
      <span className="opacity-50">›</span>
      <span className="font-bold text-[var(--primary)]">
        {isEn ? 'Register' : 'Đăng ký'}
      </span>
    </nav>

    {/* Top Back Link (Single arrow icon, no duplicate text arrow) */}
    <div className="flex items-center justify-start gap-3 mb-6">
      <button
        type="button"
        onClick={() => onNavigateUrl(`/nhan-nuoi/${pet.slug}`)}
        className="text-xs sm:text-sm font-bold text-[var(--primary)] hover:text-[var(--coral)] inline-flex items-center gap-1.5 self-start cursor-pointer transition-colors"
      >
        <ArrowLeft className="w-4 h-4 shrink-0" />
        <span>{isEn ? `Back to ${pet.name}'s profile` : `Quay lại hồ sơ của bé ${pet.name}`}</span>
      </button>
    </div>

    {/* Page Header */}
    <div className="mb-8 space-y-2.5 max-w-2xl">
      <span
        className="block uppercase font-bold"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: 'var(--primary)',
        }}
      >
        {isEn ? 'ADOPTION APPLICATION' : 'ĐƠN ĐĂNG KÝ NHẬN NUÔI'}
      </span>
      <h1
        className="font-heading font-extrabold leading-[1.14] tracking-[-0.02em]"
        style={{
          fontSize: 'clamp(32px, 4vw, 48px)',
          color: 'var(--primary)',
        }}
      >
        {isEn ? `Adopt ${pet.name}` : `Nhận nuôi bé ${pet.name}`}
      </h1>
      <p
        className="text-[16px] sm:text-[18px] leading-relaxed font-normal"
        style={{ color: 'var(--text-muted)' }}
      >
        {isEn
          ? 'Your information is only used for adoption review and to contact you.'
          : 'Thông tin của bạn chỉ được dùng để xét duyệt nhận nuôi và liên hệ với bạn.'}
      </p>
    </div>

    {/* Mobile Sticky / Pinned Pet Bar (< 960px) */}
    <div className="lg:hidden mb-6 animora-card p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <img
          loading="lazy"
          decoding="async"
          src={pet.photo}
          alt={pet.name}
          className="w-14 h-14 rounded-full object-cover ring-2 ring-[var(--coral)] flex-shrink-0"
        />
        <div>
          <h3 className="font-bold font-heading text-base text-[var(--primary)] leading-tight">
            {pet.name}
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            {speciesLabel} · {isEn ? pet.breedEn || pet.breed : pet.breed} ·{' '}
            {isEn ? pet.ageEn || pet.age : pet.age}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onNavigateUrl(`/nhan-nuoi/${pet.slug}`)}
        className="text-xs font-bold text-[var(--primary)] hover:text-[var(--coral)] underline cursor-pointer flex-shrink-0"
      >
        {isEn ? 'View profile' : 'Xem hồ sơ'}
      </button>
    </div>

    {/* Restored Draft Alert Banner */}
    {hasRestoredDraft && (
      <div className="mb-6 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-up">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[var(--text)]">
          <Info className="w-4 h-4 text-[var(--coral)] flex-shrink-0" />
          <span>
            {isEn
              ? 'Animora restored your application draft.'
              : 'Animora đã khôi phục bản nháp của bạn.'}
          </span>
        </div>
        <button
          type="button"
          onClick={onClearDraft}
          className="text-xs font-bold text-[var(--primary)] hover:text-[var(--coral)] inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {isEn ? 'Clear draft & start over' : 'Xóa bản nháp'}
        </button>
      </div>
    )}
  </>
);

interface ApplyStepProgressProps {
  isEn: boolean;
  currentStep: number;
  onJumpToStep: (step: number) => void;
}

export const ApplyStepProgress: React.FC<ApplyStepProgressProps> = ({
  isEn,
  currentStep,
  onJumpToStep,
}) => (
  <div
    className="mb-8"
    role="progressbar"
    aria-valuenow={currentStep}
    aria-valuemin={1}
    aria-valuemax={3}
  >
    <div className="relative flex items-center justify-between w-full">
      {/* Connecting Line behind circles at vertical center */}
      <div className="absolute top-5 left-5 right-5 -translate-y-1/2 h-1 bg-[var(--border)] -z-0" />
      <div
        className="absolute top-5 left-5 -translate-y-1/2 h-1 bg-[var(--primary)] transition-all duration-500 -z-0"
        style={{
          width:
            currentStep === 1
              ? '0%'
              : currentStep === 2
              ? '50%'
              : 'calc(100% - 40px)',
        }}
      />

      {/* Step 1: 40px Circle & Centered Label */}
      <button
        type="button"
        onClick={() => onJumpToStep(1)}
        className="relative z-1 flex flex-col items-center cursor-pointer group flex-1"
        aria-label={isEn ? 'Step 1: Your Information' : 'Bước 1: Thông tin của bạn'}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
            currentStep > 1
              ? 'bg-[var(--primary)] text-[var(--on-primary)] ring-2 ring-[var(--primary)]'
              : currentStep === 1
              ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-md ring-4 ring-[var(--primary)]/20'
              : 'bg-[var(--surface)] border-2 border-[var(--border)] text-[var(--text-muted)]'
          }`}
        >
          {currentStep > 1 ? <Check className="w-5 h-5 stroke-[2.5]" /> : '1'}
        </div>
        <span
          className={`hidden sm:block mt-2 text-[13px] font-bold text-center leading-tight transition-colors ${
            currentStep === 1
              ? 'text-[var(--primary)]'
              : currentStep > 1
              ? 'text-[var(--text)]'
              : 'text-[var(--text-muted)]'
          }`}
        >
          {isEn ? '1. About you' : '1. Thông tin của bạn'}
        </span>
      </button>

      {/* Step 2: 40px Circle & Centered Label */}
      <button
        type="button"
        onClick={() => onJumpToStep(2)}
        disabled={currentStep < 2}
        className={`relative z-1 flex flex-col items-center transition-all flex-1 ${
          currentStep >= 2 ? 'cursor-pointer group' : 'cursor-default'
        }`}
        aria-label={isEn ? 'Step 2: Home & care' : 'Bước 2: Điều kiện nuôi'}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
            currentStep > 2
              ? 'bg-[var(--primary)] text-[var(--on-primary)] ring-2 ring-[var(--primary)]'
              : currentStep === 2
              ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-md ring-4 ring-[var(--primary)]/20'
              : 'bg-[var(--surface)] border-2 border-[var(--border)] text-[var(--text-muted)]'
          }`}
        >
          {currentStep > 2 ? <Check className="w-5 h-5 stroke-[2.5]" /> : '2'}
        </div>
        <span
          className={`hidden sm:block mt-2 text-[13px] font-bold text-center leading-tight transition-colors ${
            currentStep === 2
              ? 'text-[var(--primary)]'
              : currentStep > 2
              ? 'text-[var(--text)]'
              : 'text-[var(--text-muted)]'
          }`}
        >
          {isEn ? '2. Home & care' : '2. Điều kiện nuôi'}
        </span>
      </button>

      {/* Step 3: 40px Circle & Centered Label */}
      <div
        className="relative z-1 flex flex-col items-center flex-1"
        aria-label={isEn ? 'Step 3: Commit & Send' : 'Bước 3: Cam kết & gửi'}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
            currentStep === 3
              ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-md ring-4 ring-[var(--primary)]/20'
              : 'bg-[var(--surface)] border-2 border-[var(--border)] text-[var(--text-muted)]'
          }`}
        >
          3
        </div>
        <span
          className={`hidden sm:block mt-2 text-[13px] font-bold text-center leading-tight transition-colors ${
            currentStep === 3 ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'
          }`}
        >
          {isEn ? '3. Commit & Send' : '3. Cam kết & gửi'}
        </span>
      </div>
    </div>

    {/* Mobile Step indicator: "Bước 1/3: Thông tin của bạn" */}
    <div className="sm:hidden mt-3 text-center">
      <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider bg-[var(--surface-2)] px-3 py-1 rounded-full">
        {isEn
          ? `Step ${currentStep}/3: ${
              currentStep === 1
                ? 'About you'
                : currentStep === 2
                ? 'Home & care'
                : 'Commit & Send'
            }`
          : `Bước ${currentStep}/3: ${
              currentStep === 1
                ? 'Thông tin của bạn'
                : currentStep === 2
                ? 'Điều kiện nuôi'
                : 'Cam kết & gửi'
            }`}
      </span>
    </div>
  </div>
);

interface ApplyPetSummarySidebarProps {
  isEn: boolean;
  pet: AdoptionPet;
  speciesLabel: string;
  factChips: string[];
  onNavigateUrl: (url: string) => void;
}

export const ApplyPetSummarySidebar: React.FC<ApplyPetSummarySidebarProps> = ({
  isEn,
  pet,
  speciesLabel,
  factChips,
  onNavigateUrl,
}) => {
  return (
    <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-[calc(var(--nav-h,72px)+24px)] lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto pr-1">
      {/* Card A: Selected Pet Card */}
      <div className="animora-card p-6 text-center">
        <div className="relative w-28 h-28 mx-auto mb-4">
          <img
            loading="lazy"
            decoding="async"
            src={pet.photo}
            alt={pet.name}
            className="w-28 h-28 rounded-full object-cover ring-4 ring-[var(--coral)] shadow-md mx-auto"
            style={{ objectPosition: 'center 30%' }}
          />
        </div>

        <h3 className="text-2xl font-bold font-heading text-[var(--primary)] mb-1">
          {pet.name}
        </h3>

        <p className="text-xs sm:text-sm text-[var(--text-muted)] mb-3">
          {speciesLabel} · {isEn ? pet.breedEn || pet.breed : pet.breed} ·{' '}
          {isEn ? pet.ageEn || pet.age : pet.age}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4">
          {factChips.map((chip, idx) => (
            <span
              key={idx}
              className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--surface-2)] text-[var(--primary)]"
            >
              {chip}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onNavigateUrl(`/nhan-nuoi/${pet.slug}`)}
          className="text-xs font-bold text-[var(--primary)] hover:text-[var(--coral)] inline-flex items-center gap-1.5 underline cursor-pointer transition-colors"
        >
          <span>{isEn ? `View ${pet.name}'s full profile` : `Xem hồ sơ chi tiết của bé`}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Card B: What Happens Next (4 Steps) */}
      <div className="animora-card p-6">
        <h4 className="text-sm font-bold font-heading text-[var(--primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--coral)]" />
          {isEn ? 'What happens next?' : 'Quy trình tiếp theo'}
        </h4>

        <div className="space-y-3.5">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 shadow-sm">
              1
            </div>
            <div>
              <h5 className="font-bold text-xs sm:text-sm text-[var(--primary)]">
                {isEn ? '1. Submit application' : '1. Gửi đơn đăng ký'}
              </h5>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {isEn ? 'You are currently here.' : 'Bạn đang hoàn tất bước này.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[var(--surface-2)] text-[var(--text-muted)] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h5 className="font-bold text-xs sm:text-sm text-[var(--text)]">
                {isEn ? '2. Consultation call in 24h' : '2. Chúng tôi gọi tư vấn trong 24h'}
              </h5>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {isEn
                  ? 'Discuss routine and home fit.'
                  : 'Giải đáp thói quen ăn uống & tính cách bé.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[var(--surface-2)] text-[var(--text-muted)] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h5 className="font-bold text-xs sm:text-sm text-[var(--text)]">
                {isEn ? '3. Meet the pet in person' : '3. Gặp gỡ bé tại trung tâm'}
              </h5>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {isEn
                  ? 'Play together before final decision.'
                  : 'Làm quen trực tiếp tại Animora.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[var(--surface-2)] text-[var(--text-muted)] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
              4
            </div>
            <div>
              <h5 className="font-bold text-xs sm:text-sm text-[var(--text)]">
                {isEn ? '4. Welcome home' : '4. Nhận bé về nhà'}
              </h5>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
                {isEn
                  ? 'Welcome pet home with initial care instructions.'
                  : 'Nhận bé về nhà và được hướng dẫn chăm sóc ban đầu.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card C: Direct Support Box */}
      <div className="animora-card p-5 bg-[var(--surface-2)]/40">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] mb-2 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[var(--coral)]" />
          {isEn ? 'Need help?' : 'Cần hỗ trợ?'}
        </h4>
        <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
          {isEn
            ? 'Our pet coordinators are ready to assist you anytime.'
            : 'Đội ngũ tư vấn nhận nuôi luôn sẵn sàng lắng nghe mọi thắc mắc của bạn.'}
        </p>
        <div className="space-y-1.5 text-xs">
          <div>
            <span className="text-[var(--text-muted)]">{isEn ? 'Call: ' : 'Gọi: '}</span>
            <a
              href={CONTACT_INFO.phoneHref}
              className="font-bold text-[var(--primary)] hover:text-[var(--coral)] underline transition-colors"
            >
              {CONTACT_INFO.phoneDisplay}
            </a>
          </div>
          <div>
            <span className="text-[var(--text-muted)]">Email: </span>
            <a
              href={`mailto:${CONTACT_INFO.email}`}
              className="font-bold text-[var(--primary)] hover:text-[var(--coral)] underline transition-colors"
            >
              {CONTACT_INFO.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
