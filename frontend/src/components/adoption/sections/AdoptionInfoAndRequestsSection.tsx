import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { AdoptionRequest, Language } from '@/types';
import { ADOPTION_PROCESS_STEPS } from '@/data/adoptionData';
import { SmallPawDecoration } from '../AdoptionShared';
import { CONTACT_INFO } from '@/constants/contact.constant';

const ADOPTION_FAQS = [
  {
    qVi: 'Chi phí nhận nuôi tại trạm Animora là bao nhiêu?',
    qEn: 'What is the adoption fee at Animora?',
    aVi: 'Animora hoạt động theo tôn chỉ cứu hộ & kết nối nhận nuôi phi lợi nhuận. Bạn KHÔNG phải trả bất kỳ khoản phí thương mại nào. Mọi bé đều được tặng kèm gói kiểm tra thú y ban đầu và Sổ tiêm chủng điện tử Animora Care. Người nhận nuôi có thể tùy tâm đóng góp quỹ y tế để hỗ trợ chi phí cho các bé cứu hộ tiếp theo.',
    aEn: 'Animora operates as a non-profit animal rescue and rehoming sanctuary. There is ZERO adoption fee. Every adopted pet receives a free comprehensive veterinary health check and an Animora Digital Health Passport. Adopters may make an optional goodwill donation to our medical fund for future rescues.',
  },
  {
    qVi: 'Quy trình xét duyệt hồ sơ đăng ký diễn ra trong bao lâu?',
    qEn: 'How long does the application review take?',
    aVi: 'Đội ngũ Animora sẽ tiếp nhận hồ sơ và liên hệ trực tiếp với bạn qua điện thoại trong vòng 24 - 48 giờ làm việc. Chúng tôi sẽ trò chuyện thân mật để hiểu thêm về điều kiện chăm sóc và sắp xếp lịch hẹn giao lưu trực tiếp với bé tại trung tâm.',
    aEn: 'Our team reviews applications and reaches out via phone/message within 24 to 48 business hours. We will have a friendly chat to understand your home environment and arrange an in-person meet-and-greet.',
  },
  {
    qVi: 'Tôi sống ở căn hộ chung cư có được nhận nuôi không?',
    qEn: 'Can I adopt if I live in an apartment?',
    aVi: 'Hoàn toàn được! Rất nhiều bé mèo, thỏ, hamster, chim và các giống chó nhỏ (Poodle, French Bulldog, Corgi) tại trạm rất quen thuộc với nếp sống căn hộ, đã biết đi vệ sinh đúng khay và không gây ồn ào. Bạn chỉ cần đảm bảo ban công có lưới an toàn và tòa nhà cho phép nuôi thú cưng.',
    aEn: 'Absolutely! Many cats, rabbits, hamsters, birds, and apartment-friendly dog breeds thrive in condominiums. They are litter/pad trained and peaceful. You just need to ensure secure balcony screening and pet-friendly building guidelines.',
  },
  {
    qVi: 'Nếu bé về nhà mới không hòa hợp với thú cưng cũ thì sao?',
    qEn: 'What if the pet does not get along with our existing pets?',
    aVi: 'Animora áp dụng chính sách "14 ngày hòa nhập cùng chuyên gia". Bác sĩ và chuyên viên hành vi Animora sẽ hướng dẫn bạn các bước làm quen từng bước (cách ly mùi hương, gặp gỡ qua rào chắn, khen thưởng). Nếu sau 14 ngày vẫn không thể hòa nhập, chúng tôi sẵn sàng đón bé trở lại trạm an toàn.',
    aEn: 'Animora provides a 14-day rehoming adaptation trial with behavioral guidance. Our specialists will guide you through scent swapping, barrier introductions, and positive reinforcement. If it doesn’t work out, you can safely return the pet without any judgment.',
  },
  {
    qVi: 'Bé được bàn giao kèm theo những giấy tờ và hỗ trợ gì?',
    qEn: 'What documents and support come with the adopted pet?',
    aVi: 'Khi đón bé, bạn sẽ nhận được: Sổ tiêm chủng điện tử Animora Care, mã số định danh Microchip quốc tế, cẩm nang dinh dưỡng cá nhân hóa và voucher giảm giá 20% trọn đời dịch vụ thú y và spa tại Animora.',
    aEn: 'When welcoming your pet home, you receive: Animora Digital Health Passport, international microchip certificate, personalized nutritional guide, and a lifetime 20% discount on veterinary and grooming services at Animora.',
  },
];

interface AdoptionInfoAndRequestsSectionProps {
  lang: Language;
  adoptionRequests: AdoptionRequest[];
  processSectionRef: React.RefObject<HTMLDivElement | null>;
}

export const AdoptionInfoAndRequestsSection: React.FC<AdoptionInfoAndRequestsSectionProps> = ({
  lang,
  adoptionRequests,
  processSectionRef,
}) => {
  return (
    <>
      {/* ================================================================= */}
      {/* 5. 4-STEP ADOPTION PROCESS WITH PREPARATION TIPS                  */}
      {/* ================================================================= */}
      <section
        ref={processSectionRef}
        data-testid="adopt-process-section"
        className="rounded-3xl border p-6 sm:p-10 space-y-8"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF7F6B]">
            {lang === 'vi' ? 'QUY TRÌNH NHÂN VĂN' : 'HUMANE PROCESS'}
          </span>
          <h2
            className="font-heading text-2xl sm:text-3xl font-extrabold"
            style={{ color: 'var(--primary)' }}
          >
            {lang === 'vi'
              ? '4 bước chuẩn mực đón bé về tổ ấm mới'
              : '4 thoughtful steps to welcome your pet home'}
          </h2>
          <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            {lang === 'vi'
              ? 'Quy trình được thiết kế nhằm đảm bảo mỗi bé đều tìm được gia đình phù hợp và có cuộc sống hạnh phúc lâu dài.'
              : 'Designed to ensure every pet finds the right forever family for a happy and lasting life together.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ADOPTION_PROCESS_STEPS.map((step) => (
            <div
              key={step.step}
              className="p-5 rounded-2xl border space-y-3 transition-transform duration-200 hover:-translate-y-1"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="w-9 h-9 rounded-full inline-flex items-center justify-center text-sm font-extrabold"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    color: 'var(--primary)',
                  }}
                >
                  0{step.step}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF7F6B]">
                  {lang === 'vi' ? step.shortVi : step.shortEn}
                </span>
              </div>

              <h3
                className="font-heading text-base sm:text-lg font-bold leading-snug"
                style={{ color: 'var(--primary)' }}
              >
                {lang === 'vi' ? step.titleVi : step.titleEn}
              </h3>

              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {lang === 'vi' ? step.descVi : step.descEn}
              </p>
            </div>
          ))}
        </div>

        {/* Adopter Preparation Checklist Box */}
        <div
          className="p-5 sm:p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4"
          style={{
            backgroundColor: 'var(--surface-2)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="space-y-1">
            <p className="font-heading text-base font-bold" style={{ color: 'var(--primary)' }}>
              {lang === 'vi'
                ? 'Gia đình cần chuẩn bị gì trước ngày đón bé?'
                : 'What should your family prepare before pickup day?'}
            </p>
            <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
              {lang === 'vi'
                ? 'Bát ăn, đệm ngủ êm ái, khay vệ sinh phù hợp, thức ăn dinh dưỡng và không gian yên tĩnh 3 ngày đầu để bé làm quen.'
                : 'Food bowls, cozy bed, potty area, age-appropriate nutrition, and a calm space for the first 3 days of adjustment.'}
            </p>
          </div>
          <a
            href={CONTACT_INFO.phoneHref}
            className="h-10 px-5 rounded-full text-xs font-bold inline-flex items-center justify-center gap-2 shrink-0 border transition-colors hover:border-[#FF7F6B]"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--primary)',
            }}
          >
            <Phone className="w-3.5 h-3.5 text-[#FF7F6B]" />
            <span>{lang === 'vi' ? 'Hỏi bác sĩ tư vấn' : 'Ask our vet team'}</span>
          </a>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 6. ADOPTION FAQS ACCORDION                                        */}
      {/* ================================================================= */}
      <section
        data-testid="adopt-faq-section"
        className="rounded-3xl border p-6 sm:p-10 space-y-6"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF7F6B]">
            {lang === 'vi' ? 'HỎI ĐÁP THƯỜNG GẶP' : 'FREQUENTLY ASKED QUESTIONS'}
          </span>
          <h2
            className="font-heading text-2xl sm:text-3xl font-extrabold"
            style={{ color: 'var(--primary)' }}
          >
            {lang === 'vi' ? 'Thắc mắc về nhận nuôi thú cưng' : 'Adoption Q&A'}
          </h2>
        </div>

        <Accordion
          defaultValue={['faq-0']}
          className="space-y-3 max-w-3xl mx-auto"
        >
          {ADOPTION_FAQS.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`faq-${idx}`}
              className="rounded-2xl border! border-(--border)! data-open:border-(--primary)! bg-(--bg) px-5 overflow-hidden transition-colors"
            >
              <AccordionTrigger className="py-4 text-left font-heading text-sm sm:text-base font-bold text-(--primary) hover:no-underline cursor-pointer items-center">
                <span>{lang === 'vi' ? faq.qVi : faq.qEn}</span>
              </AccordionTrigger>
              <AccordionContent className="pb-5 pt-3 text-xs sm:text-sm leading-relaxed border-t border-(--border) text-(--text-muted)">
                {lang === 'vi' ? faq.aVi : faq.aEn}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* ================================================================= */}
      {/* 7. SHELTER SANCTUARY VISIT & HOTLINE DIRECT CARD                  */}
      {/* ================================================================= */}
      <section
        data-testid="adopt-shelter-info-card"
        className="rounded-3xl border p-6 sm:p-8"
        style={{
          background:
            'linear-gradient(135deg, var(--surface-2) 0%, var(--surface) 100%)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF7F6B]">
              <MapPin className="w-4 h-4" />
              <span>
                {lang === 'vi'
                  ? 'TRẠM CỨU TRỢ & KẾT NỐI NHẬN NUÔI ANIMORA'
                  : 'ANIMORA ADOPTION SANCTUARY'}
              </span>
            </div>
            <h3
              className="font-heading text-xl sm:text-2xl font-extrabold"
              style={{ color: 'var(--primary)' }}
            >
              {lang === 'vi'
                ? 'Ghé thăm & giao lưu trực tiếp cùng các bé'
                : 'Visit in person & meet the rescued pets'}
            </h3>
            <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              {lang === 'vi'
                ? 'Địa chỉ: 128 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh & Chi nhánh Đà Nẵng'
                : 'Address: 128 Nguyen Trai, Ben Thanh Ward, District 1, HCMC & Da Nang Sanctuary'}
            </p>
            <p className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--text)' }}>
              <Clock className="w-3.5 h-3.5 inline mr-1.5 text-[#FF7F6B]" />
              {lang === 'vi'
                ? 'Giờ mở cửa đón khách: 08:30 – 19:30 hàng ngày (Thứ 2 – Chủ Nhật)'
                : 'Visiting hours: 08:30 – 19:30 daily (Monday – Sunday)'}
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
            <a
              href={CONTACT_INFO.phoneHref}
              data-testid="adopt-shelter-hotline-btn"
              className="h-11 px-6 rounded-full text-sm font-bold inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--on-primary)',
              }}
            >
              <Phone className="w-4 h-4 text-[#FF7F6B]" />
              <span>
                {lang === 'vi'
                  ? `Hotline: ${CONTACT_INFO.phoneDisplay}`
                  : `Call: ${CONTACT_INFO.phoneDisplay}`}
              </span>
            </a>

            <a
              href={CONTACT_INFO.mailtoHref}
              className="h-11 px-6 rounded-full text-sm font-bold inline-flex items-center justify-center gap-2 border transition-colors hover:border-[#FF7F6B] cursor-pointer"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
            >
              <Mail className="w-4 h-4 text-[#FF7F6B]" />
              <span>{lang === 'vi' ? 'Gửi email cho trạm' : 'Send us an email'}</span>
            </a>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 8. SUBMITTED ADOPTION REQUESTS TRACKER (When exists)               */}
      {/* ================================================================= */}
      {adoptionRequests.length > 0 && (
        <section
          data-testid="adopt-submitted-requests"
          className="rounded-[24px] border p-6 sm:p-8 space-y-4"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <div className="flex items-center gap-2">
            <SmallPawDecoration className="w-5 h-5" />
            <h2
              className="font-heading text-2xl font-bold"
              style={{ color: 'var(--primary)' }}
            >
              {lang === 'vi'
                ? 'Đơn đăng ký nhận nuôi đã gửi'
                : 'Submitted adoption requests'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adoptionRequests.map((req) => {
              const status = req.status || 'pending';
              const statusMeta: Record<
                NonNullable<AdoptionRequest['status']>,
                { vi: string; en: string; bg: string; color: string }
              > = {
                pending: {
                  vi: 'Đã tiếp nhận (Chờ duyệt)',
                  en: 'Received (Pending)',
                  bg: '#FF7F6B',
                  color: '#FFFFFF',
                },
                reviewing: {
                  vi: 'Đang xem xét & phỏng vấn',
                  en: 'Under review',
                  bg: '#F59E0B',
                  color: '#FFFFFF',
                },
                approved: {
                  vi: 'Đã duyệt — Hẹn đón bé',
                  en: 'Approved',
                  bg: '#10B981',
                  color: '#FFFFFF',
                },
                completed: {
                  vi: 'Hoàn tất nhận nuôi',
                  en: 'Completed',
                  bg: '#6B1F2E',
                  color: '#FFFFFF',
                },
                rejected: {
                  vi: 'Chưa phù hợp / Từ chối',
                  en: 'Rejected',
                  bg: '#E11D48',
                  color: '#FFFFFF',
                },
              };
              const badge = statusMeta[status] || statusMeta.pending;

              return (
                <div
                  key={req.id}
                  data-testid={`adoption-request-card-${req.id}`}
                  className="p-4 rounded-2xl border flex items-center justify-between gap-3"
                  style={{
                    backgroundColor: 'var(--bg)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--primary)' }}>
                      {lang === 'vi'
                        ? `Nhận nuôi bé ${req.petName}`
                        : `Adoption request for ${req.petName}`}
                      {req.requestCode ? ` · ${req.requestCode}` : ''}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {req.applicantName} · {req.phone} · {req.email}
                    </p>
                  </div>
                  <span
                    data-testid={`adoption-request-status-${req.id}`}
                    className="px-3 py-1 rounded-full text-xs font-bold shrink-0"
                    style={{ backgroundColor: badge.bg, color: badge.color }}
                  >
                    {lang === 'vi' ? badge.vi : badge.en}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
};
