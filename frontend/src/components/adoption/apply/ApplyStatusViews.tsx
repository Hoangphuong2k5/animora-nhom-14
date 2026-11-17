import React from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Mail,
  Phone,
  Sparkles,
} from 'lucide-react';
import { AdoptionPet, PageId } from '@/types';
import { CONTACT_INFO } from '@/constants/contact.constant';

interface ApplyPetNotFoundViewProps {
  isEn: boolean;
  onNavigate: (page: PageId) => void;
}

export const ApplyPetNotFoundView: React.FC<ApplyPetNotFoundViewProps> = ({
  isEn,
  onNavigate,
}) => (
  <div className="min-h-[70vh] pt-32 pb-20 shared-container">
    <div className="max-w-xl mx-auto text-center p-8 animora-card">
      <div className="w-16 h-16 rounded-full bg-[var(--surface-2)] text-[var(--primary)] flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold font-heading text-[var(--primary)] mb-3">
        {isEn ? 'Pet not found' : 'Không tìm thấy bé này'}
      </h2>
      <p className="text-[var(--text-muted)] mb-6">
        {isEn
          ? 'The pet you are looking for may have found a forever home or the link is incorrect.'
          : 'Bé cưng bạn tìm kiếm có thể đã được gia đình mới đón về hoặc đường dẫn không chính xác.'}
      </p>
      <button
        type="button"
        onClick={() => onNavigate('adopt')}
        className="btn-primary px-6 py-3 cursor-pointer"
      >
        {isEn ? 'Browse other pets' : 'Xem danh sách các bé khác'}
      </button>
    </div>
  </div>
);

interface ApplyPetAlreadyAdoptedViewProps {
  isEn: boolean;
  pet: AdoptionPet;
  onNavigate: (page: PageId) => void;
  onNavigateUrl: (url: string) => void;
}

export const ApplyPetAlreadyAdoptedView: React.FC<ApplyPetAlreadyAdoptedViewProps> = ({
  isEn,
  pet,
  onNavigate,
  onNavigateUrl,
}) => (
  <div className="min-h-[70vh] pt-32 pb-20 shared-container">
    <div className="max-w-xl mx-auto text-center p-8 animora-card">
      <div className="relative w-32 h-32 mx-auto mb-5">
        <img
          loading="lazy"
          decoding="async"
          src={pet.photo}
          alt={pet.name}
          className="w-32 h-32 rounded-full object-cover ring-4 ring-[var(--coral)] mx-auto"
        />
        <span className="absolute bottom-0 right-0 bg-emerald-500 text-white p-2 rounded-full shadow-md">
          <Check className="w-5 h-5 stroke-[3]" />
        </span>
      </div>
      <h2 className="text-2xl font-bold font-heading text-[var(--primary)] mb-2">
        {isEn ? `${pet.name} has found a loving home!` : `${pet.name} đã tìm được gia đình`}
      </h2>
      <p className="text-[var(--text-muted)] mb-6 max-w-md mx-auto">
        {isEn
          ? `${pet.name} has been adopted by a wonderful family. There are many other sweet friends still waiting for you!`
          : `Bé ${pet.name} đã được một gia đình yêu thương đón về nhà mới. Vẫn còn rất nhiều bé đáng yêu khác tại Animora đang chờ bạn!`}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={() => onNavigate('adopt')}
          className="btn-primary px-6 py-3 cursor-pointer"
        >
          {isEn ? 'Meet other pets' : 'Xem các bé đang chờ nhận nuôi'}
        </button>
        <button
          type="button"
          onClick={() => onNavigateUrl(`/nhan-nuoi/${pet.slug}`)}
          className="btn-secondary px-6 py-3 cursor-pointer"
        >
          {isEn ? `View ${pet.name}'s profile` : `Xem hồ sơ của ${pet.name}`}
        </button>
      </div>
    </div>
  </div>
);

interface ApplySuccessConfirmationViewProps {
  isEn: boolean;
  pet: AdoptionPet;
  lastSubmittedCode: string;
  copiedCode: boolean;
  onCopyCode: (codeToCopy: string) => void;
  onNavigate: (page: PageId) => void;
}

export const ApplySuccessConfirmationView: React.FC<ApplySuccessConfirmationViewProps> = ({
  isEn,
  pet,
  lastSubmittedCode,
  copiedCode,
  onCopyCode,
  onNavigate,
}) => {
  const displayCode = lastSubmittedCode || 'AN-2026-0842';

  return (
    <div className="min-h-screen pt-28 pb-20 shared-container">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Main Success Card */}
        <div className="animora-card p-6 sm:p-10 text-center relative overflow-hidden">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <span className="inline-block text-xs uppercase tracking-widest font-bold text-[var(--primary)] bg-[var(--surface-2)] px-3 py-1 rounded-full mb-3">
            {isEn ? 'APPLICATION SUBMITTED' : 'ĐƠN ĐĂNG KÝ ĐÃ ĐƯỢC GỬI'}
          </span>

          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-[var(--primary)] mb-3">
            {isEn
              ? `Thank you for opening your heart to ${pet.name}!`
              : `Cảm ơn bạn đã mở rộng vòng tay cho bé ${pet.name}!`}
          </h1>

          <p className="text-[var(--text-muted)] text-base sm:text-lg max-w-xl mx-auto mb-8">
            {isEn
              ? `Your adoption request has been recorded. Our team will review your application and contact you within 24 hours.`
              : `Đơn đăng ký nhận nuôi bé ${pet.name} của bạn đã được ghi nhận. Đội ngũ Animora sẽ xem xét và liên hệ với bạn trong vòng 24 giờ tới.`}
          </p>

          {/* Application Code Box */}
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl p-5 max-w-md mx-auto mb-8 text-center">
            <span className="text-xs uppercase font-bold text-[var(--text-muted)] tracking-wider block mb-1">
              {isEn ? 'YOUR APPLICATION CODE' : 'MÃ HỒ SƠ ĐĂNG KÝ CỦA BẠN'}
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-widest font-mono text-[var(--primary)]">
                {displayCode}
              </span>
              <button
                type="button"
                onClick={() => onCopyCode(displayCode)}
                className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--primary)] hover:bg-[var(--coral)] hover:text-white transition-colors cursor-pointer"
                title={isEn ? 'Copy code' : 'Sao chép mã'}
              >
                {copiedCode ? (
                  <Check className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              {isEn
                ? 'Please save this code for verification when our care coordinator calls you.'
                : 'Vui lòng lưu lại mã này để đối chiếu khi chuyên viên Animora gọi trao đổi.'}
            </p>
          </div>

          {/* Next Steps Timeline */}
          <div className="text-left bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 mb-8">
            <h3 className="text-base sm:text-lg font-bold font-heading text-[var(--primary)] mb-5 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--coral)]" />
              {isEn ? 'What happens next?' : 'Quy trình tiếp theo diễn ra thế nào?'}
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--text)]">
                    {isEn ? '1. Application Received' : '1. Tiếp nhận hồ sơ (Đã hoàn tất)'}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {isEn
                      ? 'Your submission is safely saved in Animora’s shelter management system.'
                      : 'Thông tin của bạn đã được chuyển đến bộ phận Điều phối Nhận nuôi.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--text)]">
                    {isEn
                      ? '2. Consultation Call (Within 24 Hours)'
                      : '2. Gọi tư vấn & xác minh (Trong vòng 24 giờ)'}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {isEn
                      ? 'A specialist will call you to discuss your home environment, pet personality, and schedule a center visit.'
                      : 'Chuyên viên Animora sẽ gọi theo khung giờ bạn chọn để trao đổi thêm về thói quen của bé.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[var(--surface-2)] text-[var(--text-muted)] flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--text)]">
                    {isEn ? `3. Meet ${pet.name} in person` : `3. Gặp gỡ bé ${pet.name} trực tiếp`}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {isEn
                      ? 'Visit our center to play and bond with the pet before making your final decision.'
                      : 'Ghé trung tâm Animora làm quen với bé và nhận tư vấn dinh dưỡng từ bác sĩ thú y.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[var(--surface-2)] text-[var(--text-muted)] flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--text)]">
                    {isEn
                      ? '4. Sign commitment & Welcome home'
                      : '4. Ký cam kết & Đón bé về nhà mới'}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {isEn
                      ? 'Complete the commitment agreement and receive the pet’s lifetime Health Passport.'
                      : 'Nhận Sổ sức khỏe của bé và gói ưu đãi chăm sóc trọn đời tại Animora.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Direct support line */}
          <div className="bg-[var(--surface-2)]/50 border border-[var(--border)] rounded-xl p-4 text-xs text-[var(--text-muted)] flex flex-col sm:flex-row items-center justify-between gap-3 mb-8">
            <span>{isEn ? 'Need urgent support?' : 'Cần hỗ trợ gấp hoặc đổi lịch hẹn?'}</span>
            <div className="flex items-center gap-4">
              <a
                href={CONTACT_INFO.phoneHref}
                className="font-bold text-[var(--primary)] hover:text-[var(--coral)] inline-flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                {CONTACT_INFO.phoneDisplay}
              </a>
              <span className="text-gray-300">·</span>
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="font-bold text-[var(--primary)] hover:text-[var(--coral)] inline-flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                {CONTACT_INFO.email}
              </a>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={() => onNavigate('adopt')}
              className="btn-primary px-7 py-3.5 cursor-pointer text-base"
            >
              {isEn ? 'Browse other pets' : 'Xem các bé khác đang tìm nhà'}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="btn-secondary px-7 py-3.5 cursor-pointer text-base"
            >
              {isEn ? 'Back to homepage' : 'Về trang chủ Animora'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
