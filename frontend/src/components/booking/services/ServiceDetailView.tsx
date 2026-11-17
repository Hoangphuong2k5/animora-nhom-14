import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  PawPrint,
  Phone,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Language } from '@/types';
import { CONTACT_INFO } from '@/constants/contact.constant';
import {
  ServiceEntity,
  formatServicePrice,
} from '@/data/servicesData';
import { useSyncedActiveServices } from '@/hooks/booking/useSyncedActiveServices';
import { ServiceIcon } from '../shared/ServiceIcon';

interface ServiceDetailViewProps {
  lang: Language;
  activeService: ServiceEntity;
  onBackToList: (e?: React.MouseEvent) => void;
  onBookFromDetail: (srv: ServiceEntity) => void;
  onOpenServiceDetail: (slug: string, e?: React.MouseEvent) => void;
}

export const ServiceDetailView = ({
  lang,
  activeService,
  onBackToList,
  onBookFromDetail,
  onOpenServiceDetail,
}: ServiceDetailViewProps) => {
  const priceFormatted = formatServicePrice(activeService.priceFrom);
  const priceWithUnit = activeService.priceUnit
    ? `${priceFormatted} ${activeService.priceUnit[lang]}`
    : priceFormatted;
  const activeServices = useSyncedActiveServices();
  const relatedServices = activeServices.filter(
    (s) => s.slug !== activeService.slug
  ).slice(0, 3);

  return (
    <div
      data-testid={`page-service-detail-${activeService.slug}`}
      className="pt-24 pb-28 lg:pb-24 space-y-10"
    >
      {/* Breadcrumb & Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            type="button"
            data-testid="service-detail-back-btn"
            onClick={onBackToList}
            className="inline-flex items-center gap-1.5 text-sm font-bold hover:underline cursor-pointer"
            style={{ color: 'var(--primary)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {lang === 'vi' ? 'Quay lại dịch vụ' : 'Back to services'}
            </span>
          </button>
        </div>
      </div>

      {/* Header Block */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-[20px] border p-6 sm:p-10 space-y-6"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-[20px] flex items-center justify-center shrink-0 shadow-md"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--on-primary)',
              }}
            >
              <ServiceIcon
                type={activeService.icon}
                className="w-10 h-10 sm:w-12 sm:h-12"
              />
            </div>

            <div className="space-y-3 flex-1">
              <span
                className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  color: 'var(--primary)',
                }}
              >
                {activeService.categoryLabel[lang]}
              </span>

              <h1
                className="font-heading font-extrabold leading-[1.12] tracking-tight"
                style={{
                  fontSize: 'clamp(32px, 4vw, 52px)',
                  color: 'var(--primary)',
                }}
              >
                {activeService.name[lang]}
              </h1>
            </div>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            <div
              className="p-4 rounded-2xl border flex items-center gap-3.5"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border)',
              }}
            >
              <Clock
                className="w-5 h-5 shrink-0"
                style={{ color: 'var(--coral)' }}
              />
              <div>
                <span
                  className="block text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {lang === 'vi' ? 'Thời lượng' : 'Duration'}
                </span>
                <span
                  className="text-base font-extrabold"
                  style={{ color: 'var(--text)' }}
                >
                  {activeService.duration[lang]}
                </span>
              </div>
            </div>

            <div
              className="p-4 rounded-2xl border flex items-center gap-3.5"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border)',
              }}
            >
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center font-heading font-extrabold text-sm shrink-0"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--on-primary)',
                }}
              >
                ₫
              </span>
              <div>
                <span
                  className="block text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {lang === 'vi' ? 'Chi phí tiêu chuẩn' : 'Starting Price'}
                </span>
                <span
                  className="text-lg font-extrabold"
                  style={{ color: 'var(--primary)' }}
                >
                  {lang === 'vi'
                    ? `Từ ${priceWithUnit}`
                    : `From ${priceWithUnit}`}
                </span>
              </div>
            </div>

            <div
              className="p-4 rounded-2xl border flex items-center gap-3.5"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border)',
              }}
            >
              <PawPrint
                className="w-5 h-5 shrink-0"
                style={{ color: 'var(--coral)' }}
              />
              <div>
                <span
                  className="block text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {lang === 'vi' ? 'Thú cưng phù hợp' : 'Suitable Pets'}
                </span>
                <span
                  className="text-sm sm:text-base font-bold"
                  style={{ color: 'var(--text)' }}
                >
                  {activeService.suitablePets[lang]}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              data-testid="detail-book-service-btn"
              onClick={() => onBookFromDetail(activeService)}
              className="btn-primary px-7 py-3.5 text-base font-bold inline-flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>
                {lang === 'vi' ? 'Đặt lịch dịch vụ này' : 'Book this service'}
              </span>
            </button>

            <a
              href={CONTACT_INFO.phoneHref}
              className="btn-secondary px-6 py-3.5 text-base font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>
                {lang === 'vi'
                  ? `Gọi ngay: ${CONTACT_INFO.phoneDisplay}`
                  : `Call now: ${CONTACT_INFO.phoneDisplay}`}
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Two-Column Detail Body */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            {/* Overview */}
            <div
              className="rounded-[20px] border p-6 sm:p-8 space-y-4"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow)',
              }}
            >
              <h2
                className="font-heading text-2xl sm:text-3xl font-bold"
                style={{ color: 'var(--primary)' }}
              >
                {lang === 'vi' ? 'Mô tả dịch vụ' : 'Service Overview'}
              </h2>
              <div className="space-y-4">
                {activeService.description[lang].map((paragraph, idx) => (
                  <p
                    key={idx}
                    className="text-base leading-relaxed"
                    style={{ color: 'var(--text)' }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Included */}
            <div
              className="rounded-[20px] border p-6 sm:p-8 space-y-5"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow)',
              }}
            >
              <h2
                className="font-heading text-2xl sm:text-3xl font-bold"
                style={{ color: 'var(--primary)' }}
              >
                {lang === 'vi' ? 'Dịch vụ bao gồm' : 'What Is Included'}
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeService.included[lang].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-[16px] font-medium leading-snug"
                    style={{ color: 'var(--text)' }}
                  >
                    <CheckCircle2
                      className="w-5 h-5 shrink-0 mt-0.5"
                      style={{ color: 'var(--coral)' }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Process Timeline */}
            <div
              className="rounded-[20px] border p-6 sm:p-8 space-y-6"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow)',
              }}
            >
              <h2
                className="font-heading text-2xl sm:text-3xl font-bold"
                style={{ color: 'var(--primary)' }}
              >
                {lang === 'vi' ? 'Quy trình thực hiện' : 'Step-by-Step Process'}
              </h2>
              <ol className="relative space-y-6 before:content-[''] before:absolute before:top-4 before:bottom-4 before:left-5 before:w-0.5 before:bg-[var(--border)]">
                {activeService.steps.map((step, idx) => (
                  <li key={idx} className="relative flex items-start gap-4">
                    <span
                      className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-heading text-lg font-extrabold shrink-0 shadow-xs"
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'var(--on-primary)',
                      }}
                    >
                      {idx + 1}
                    </span>
                    <div className="pt-1 space-y-1">
                      <h3
                        className="font-heading text-lg sm:text-xl font-bold leading-snug"
                        style={{ color: 'var(--primary)' }}
                      >
                        {lang === 'vi' ? step.titleVi : step.titleEn}
                      </h3>
                      <p
                        className="text-base leading-relaxed"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {lang === 'vi' ? step.textVi : step.textEn}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Price by Weight Table */}
            <div
              className="rounded-[20px] border p-6 sm:p-8 space-y-5"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow)',
              }}
            >
              <h2
                className="font-heading text-2xl sm:text-3xl font-bold"
                style={{ color: 'var(--primary)' }}
              >
                {lang === 'vi' ? 'Bảng giá theo cân nặng' : 'Price by Weight'}
              </h2>

              <div
                className="overflow-hidden rounded-2xl border"
                style={{ borderColor: 'var(--border)' }}
              >
                <Table className="w-full text-left border-collapse">
                  <TableHeader>
                    <TableRow
                      className="border-b-0 hover:bg-transparent"
                      style={{
                        backgroundColor: 'var(--surface-2)',
                        color: 'var(--primary)',
                      }}
                    >
                      <TableHead
                        className="py-3.5 px-5 h-auto text-sm sm:text-base font-extrabold"
                        style={{ color: 'var(--primary)' }}
                      >
                        {lang === 'vi' ? 'Mức cân nặng của bé' : 'Pet Weight Range'}
                      </TableHead>
                      <TableHead
                        className="py-3.5 px-5 h-auto text-sm sm:text-base font-extrabold text-right"
                        style={{ color: 'var(--primary)' }}
                      >
                        {lang === 'vi' ? 'Chi phí niêm yết' : 'Standard Price'}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeService.priceTable.map((row, idx) => (
                      <TableRow
                        key={idx}
                        className="border-t"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <TableCell
                          className="py-3.5 px-5 text-base font-semibold"
                          style={{ color: 'var(--text)' }}
                        >
                          {lang === 'vi' ? row.weightRangeVi : row.weightRangeEn}
                        </TableCell>
                        <TableCell
                          className="py-3.5 px-5 text-base font-extrabold text-right"
                          style={{ color: 'var(--primary)' }}
                        >
                          {formatServicePrice(row.price)}
                          {activeService.priceUnit
                            ? ` ${activeService.priceUnit[lang]}`
                            : ''}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <p
                className="text-sm font-medium flex items-center gap-2"
                style={{ color: 'var(--text-muted)' }}
              >
                <Info
                  className="w-4 h-4 shrink-0"
                  style={{ color: 'var(--coral)' }}
                />
                <span>
                  {lang === 'vi'
                    ? 'Giá có thể thay đổi theo tình trạng thực tế của bé.'
                    : 'Prices may vary depending on your pet’s actual condition.'}
                </span>
              </p>
            </div>

            {/* Before You Come */}
            <div
              className="rounded-[20px] border p-6 sm:p-8 space-y-4"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow)',
              }}
            >
              <h2
                className="font-heading text-2xl sm:text-3xl font-bold"
                style={{ color: 'var(--primary)' }}
              >
                {lang === 'vi' ? 'Lưu ý trước khi đến' : 'Before You Come'}
              </h2>
              <ul className="space-y-3">
                {activeService.tips[lang].map((tip, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-base leading-relaxed"
                    style={{ color: 'var(--text)' }}
                  >
                    <span
                      className="w-2 h-2 rounded-full mt-2.5 shrink-0"
                      style={{ backgroundColor: 'var(--coral)' }}
                    />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* FAQ Accordion */}
            <div
              className="rounded-[20px] border p-6 sm:p-8 space-y-5"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow)',
              }}
            >
              <h2
                className="font-heading text-2xl sm:text-3xl font-bold"
                style={{ color: 'var(--primary)' }}
              >
                {lang === 'vi'
                  ? 'Câu hỏi thường gặp'
                  : 'Frequently Asked Questions'}
              </h2>
              <Accordion
                key={activeService.slug}
                defaultValue={['faq-0']}
                className="space-y-3"
              >
                {activeService.faq.map((item, idx) => (
                  <AccordionItem
                    key={idx}
                    value={`faq-${idx}`}
                    className="rounded-2xl border overflow-hidden px-0 not-last:border-b"
                    style={{
                      backgroundColor: 'var(--bg)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <AccordionTrigger
                      className="w-full p-4 sm:p-5 text-left font-bold text-base hover:no-underline cursor-pointer items-center"
                      style={{ color: 'var(--text)' }}
                    >
                      <span>
                        {lang === 'vi' ? item.questionVi : item.questionEn}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent
                      className="px-4 sm:px-5 pb-5 pt-3 border-t text-base leading-relaxed"
                      style={{
                        borderColor: 'var(--border)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {lang === 'vi' ? item.answerVi : item.answerEn}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Desktop Sticky Booking Sidebar */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-28">
            <div
              className="rounded-[20px] border p-7 space-y-6"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow)',
              }}
            >
              <div
                className="space-y-2 pb-5 border-b"
                style={{ borderColor: 'var(--border)' }}
              >
                <span
                  className="block text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {lang === 'vi' ? 'Tóm tắt dịch vụ' : 'Service Summary'}
                </span>
                <h3
                  className="font-heading text-2xl font-bold"
                  style={{ color: 'var(--primary)' }}
                >
                  {activeService.name[lang]}
                </h3>
                <div className="pt-1">
                  <span
                    className="font-heading text-3xl font-extrabold"
                    style={{ color: 'var(--primary)' }}
                  >
                    {lang === 'vi'
                      ? `Từ ${priceWithUnit}`
                      : `From ${priceWithUnit}`}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span style={{ color: 'var(--text-muted)' }}>
                    {lang === 'vi' ? 'Thời lượng:' : 'Duration:'}
                  </span>
                  <span className="font-bold" style={{ color: 'var(--text)' }}>
                    {activeService.duration[lang]}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="shrink-0" style={{ color: 'var(--text-muted)' }}>
                    {lang === 'vi' ? 'Loài phù hợp:' : 'Suitable for:'}
                  </span>
                  <span
                    className="font-bold text-right"
                    style={{ color: 'var(--text)' }}
                  >
                    {activeService.suitablePets[lang]}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  data-testid="sidebar-book-service-btn"
                  onClick={() => onBookFromDetail(activeService)}
                  className="btn-primary w-full py-3.5 px-6 text-base font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>
                    {lang === 'vi' ? 'Đặt lịch dịch vụ này' : 'Book this service'}
                  </span>
                </button>

                <a
                  href={CONTACT_INFO.phoneHref}
                  className="btn-secondary w-full py-3 px-5 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>
                    {lang === 'vi'
                      ? `Gọi ngay: ${CONTACT_INFO.phoneDisplay}`
                      : `Call now: ${CONTACT_INFO.phoneDisplay}`}
                  </span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Related Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-4">
        <h2
          className="font-heading text-2xl sm:text-3xl font-extrabold"
          style={{ color: 'var(--primary)' }}
        >
          {lang === 'vi' ? 'Dịch vụ liên quan' : 'Related Services'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedServices.map((rel) => {
            const relPrice = formatServicePrice(rel.priceFrom);
            return (
              <a
                key={rel.slug}
                href={`/dich-vu/${rel.slug}`}
                data-testid={`related-service-card-${rel.slug}`}
                onClick={(e) => onOpenServiceDetail(rel.slug, e)}
                className="group rounded-[20px] border p-6 flex flex-col justify-between gap-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-[#FF7F6B] focus-visible:outline-offset-2 cursor-pointer"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  boxShadow: 'var(--shadow)',
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'var(--on-primary)',
                      }}
                    >
                      <ServiceIcon type={rel.icon} className="w-6 h-6" />
                    </div>
                    <h3
                      className="font-heading text-xl font-bold leading-snug"
                      style={{ color: 'var(--primary)' }}
                    >
                      {rel.name[lang]}
                    </h3>
                  </div>
                  <p
                    className="text-sm line-clamp-2 leading-relaxed"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {rel.shortDescription[lang]}
                  </p>
                </div>

                <div
                  className="pt-3 border-t flex items-center justify-between text-sm font-bold"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <span
                    className="font-extrabold"
                    style={{ color: 'var(--primary)' }}
                  >
                    {lang === 'vi' ? `Từ ${relPrice}` : `From ${relPrice}`}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 font-bold"
                    style={{ color: 'var(--coral)' }}
                  >
                    <span>{lang === 'vi' ? 'Xem chi tiết' : 'View details'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Mobile Sticky Bottom Booking Bar */}
      <div
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t px-4 py-3 flex items-center justify-between gap-4"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.12)',
        }}
      >
        <div>
          <span
            className="block text-xs font-semibold"
            style={{ color: 'var(--text-muted)' }}
          >
            {activeService.duration[lang]}
          </span>
          <span
            className="font-heading text-xl font-extrabold"
            style={{ color: 'var(--primary)' }}
          >
            {lang === 'vi' ? `Từ ${priceWithUnit}` : `From ${priceWithUnit}`}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onBookFromDetail(activeService)}
          className="btn-primary px-6 py-3 text-sm font-bold inline-flex items-center gap-2 shadow-md cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>{lang === 'vi' ? 'Đặt lịch' : 'Book now'}</span>
        </button>
      </div>
    </div>
  );
};

