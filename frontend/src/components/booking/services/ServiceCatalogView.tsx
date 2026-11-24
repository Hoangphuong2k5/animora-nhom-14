import React, { useMemo, useState } from 'react';
import { Calendar, Clock, Search, Star, Stethoscope } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Language } from '@/types';
import {
  SERVICE_CATEGORIES,
  ServiceCategoryId,
  ServiceEntity,
  formatServicePrice,
  resolveServicePaymentTiming,
} from '@/data/servicesData';
import { getDoctorsWithLiveRatings } from '@/data/doctorsDirectory';
import { ServiceIcon } from '../shared/ServiceIcon';

interface ServiceCatalogViewProps {
  lang: Language;
  selectedCategory: ServiceCategoryId;
  filteredServices: ServiceEntity[];
  onSelectCategory: (cat: ServiceCategoryId) => void;
  onOpenServiceDetail: (slug: string, e?: React.MouseEvent) => void;
  onBookService: (serviceSlug?: string) => void;
}

export const ServiceCatalogView = ({
  lang,
  selectedCategory,
  filteredServices,
  onSelectCategory,
  onOpenServiceDetail,
  onBookService,
}: ServiceCatalogViewProps) => {
  const [doctorQuery, setDoctorQuery] = useState('');
  const [minRating, setMinRating] = useState<0 | 4.8 | 4.9>(0);

  const doctors = useMemo(() => {
    const all = getDoctorsWithLiveRatings(
      [],
      selectedCategory === 'all' ? undefined : selectedCategory
    );
    const q = doctorQuery.toLowerCase().trim();
    return all.filter((d) => {
      if (d.rating < minRating) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.specialtyVi.toLowerCase().includes(q) ||
        d.specialtyEn.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, doctorQuery, minRating]);

  return (
    <div data-testid="page-services" className="pt-24 pb-20 space-y-12">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <span
              data-testid="services-page-eyebrow"
              className="block uppercase font-bold"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: 'var(--primary)',
              }}
            >
              {lang === 'vi' ? 'DỊCH VỤ THÚ CƯNG' : 'PET SERVICES'}
            </span>
            <h1
              data-testid="services-page-title"
              className="font-heading font-extrabold leading-[1.14] tracking-[-0.02em]"
              style={{
                fontSize: 'clamp(32px, 4vw, 48px)',
                color: 'var(--primary)',
              }}
            >
              {lang === 'vi'
                ? 'Chăm sóc thú y & Spa của bé'
                : "Your pet's veterinary & spa care"}
            </h1>
            <p
              data-testid="services-page-subtitle"
              className="text-[18px] leading-relaxed font-normal"
              style={{ color: 'var(--text-muted)' }}
            >
              {lang === 'vi'
                ? 'Khám định kỳ, tiêm chủng, nha khoa và spa thảo mộc chuẩn quốc tế cho từng bé.'
                : 'Preventive checkups, vaccinations, dental care, and herbal spa for each pet.'}
            </p>
          </div>

          <button
            type="button"
            data-testid="services-page-top-book-btn"
            onClick={() => onBookService()}
            className="btn-primary px-6 py-3 text-[15px] font-bold shadow-sm self-start md:self-auto shrink-0 cursor-pointer"
          >
            {lang === 'vi' ? 'Đặt lịch hẹn ngay' : 'Book Appointment'}
          </button>
        </div>

        <Tabs
          value={selectedCategory}
          onValueChange={(val) => {
            if (val) onSelectCategory(val as ServiceCategoryId);
          }}
        >
          <TabsList
            aria-label={
              lang === 'vi' ? 'Lọc danh mục dịch vụ' : 'Filter services by category'
            }
            className="h-auto! flex-wrap justify-start gap-2 p-1.5 rounded-2xl border bg-[var(--surface)] border-[var(--border)]"
          >
            {SERVICE_CATEGORIES.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                data-testid={`services-cat-${cat.id}`}
                className="h-auto px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap cursor-pointer text-[var(--text-muted)] hover:text-[var(--text)] data-active:bg-[var(--primary)]! data-active:text-[var(--on-primary)]! data-active:shadow-sm transition-all"
              >
                {lang === 'vi' ? cat.labelVi : cat.labelEn}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {filteredServices.map((srv) => {
            const formattedPrice = formatServicePrice(srv.priceFrom);
            const priceText = srv.priceUnit
              ? `${formattedPrice} ${srv.priceUnit[lang]}`
              : formattedPrice;

            return (
              <a
                key={srv.slug}
                href={`/dich-vu/${srv.slug}`}
                data-testid={`detail-service-card-${srv.id}`}
                onClick={(e) => onOpenServiceDetail(srv.slug, e)}
                className="group h-full rounded-[20px] border p-7 sm:p-8 flex flex-col justify-between gap-6 transition-all duration-250 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-2 focus-visible:outline-[#FF7F6B] focus-visible:outline-offset-2 cursor-pointer"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  boxShadow: 'var(--shadow)',
                }}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'var(--on-primary)',
                      }}
                    >
                      <ServiceIcon type={srv.icon} className="w-7 h-7" />
                    </div>
                    <h2
                      className="font-heading text-[24px] font-bold leading-snug"
                      style={{ color: 'var(--primary)' }}
                    >
                      {srv.name[lang]}
                    </h2>
                  </div>

                  <p
                    className="font-body text-[16px] leading-relaxed line-clamp-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {srv.shortDescription[lang]}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 text-sm font-semibold"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Clock
                          className="w-4 h-4 shrink-0"
                          style={{ color: 'var(--coral)' }}
                        />
                        <span>{srv.duration[lang]}</span>
                      </span>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
                        style={{
                          backgroundColor: 'var(--surface-2)',
                          borderColor: 'var(--border)',
                          color: 'var(--primary)',
                        }}
                      >
                        {resolveServicePaymentTiming(srv) === 'prepaid'
                          ? lang === 'vi'
                            ? 'Trả trước'
                            : 'Prepaid'
                          : lang === 'vi'
                          ? 'Trả sau'
                          : 'Postpaid'}
                      </span>
                    </div>

                    <span
                      className="text-[18px] font-extrabold leading-none"
                      style={{ color: 'var(--primary)' }}
                    >
                      {lang === 'vi' ? `Từ ${priceText}` : `From ${priceText}`}
                    </span>
                  </div>

                  <div
                    className="pt-4 border-t flex items-center justify-between gap-3"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <span
                      className="inline-flex items-center gap-1.5 text-sm font-bold group-hover:underline"
                      style={{ color: 'var(--coral)' }}
                    >
                      <span>
                        {lang === 'vi' ? 'Xem chi tiết' : 'View details'}
                      </span>
                      <span
                        aria-hidden="true"
                        className="inline-block transition-transform duration-200 group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </span>

                    <button
                      type="button"
                      data-testid={`card-book-service-btn-${srv.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onBookService(srv.slug);
                      }}
                      className="btn-primary px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{lang === 'vi' ? 'Đặt lịch' : 'Book'}</span>
                    </button>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* Tìm Bác sĩ & Chuyên viên theo đánh giá */}
        <div
          data-testid="services-doctor-directory"
          className="rounded-[24px] border p-6 sm:p-8 space-y-5"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span
                className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: 'var(--primary)' }}
              >
                <Stethoscope className="w-4 h-4" />
                <span>
                  {lang === 'vi'
                    ? 'TÌM BÁC SĨ & CHUYÊN VIÊN THEO ĐÁNH GIÁ'
                    : 'FIND SPECIALISTS BY RATING'}
                </span>
              </span>
              <h2
                className="font-heading text-2xl font-extrabold mt-1"
                style={{ color: 'var(--primary)' }}
              >
                {lang === 'vi'
                  ? 'Đội ngũ bác sĩ & chuyên viên được đánh giá cao'
                  : 'Top-rated veterinarians & care specialists'}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {([
                { val: 0, vi: 'Tất cả', en: 'All' },
                { val: 4.8, vi: 'Từ 4.8★', en: '4.8★+' },
                { val: 4.9, vi: 'Từ 4.9★', en: '4.9★+' },
              ] as const).map((f) => {
                const active = minRating === f.val;
                return (
                  <button
                    key={f.val}
                    type="button"
                    onClick={() => setMinRating(f.val)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition-colors"
                    style={{
                      backgroundColor: active ? 'var(--primary)' : 'var(--bg)',
                      color: active ? 'var(--on-primary)' : 'var(--text)',
                      borderColor: active ? 'var(--primary)' : 'var(--border)',
                    }}
                  >
                    {lang === 'vi' ? f.vi : f.en}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative max-w-md">
            <Search
              className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              value={doctorQuery}
              onChange={(e) => setDoctorQuery(e.target.value)}
              placeholder={
                lang === 'vi'
                  ? 'Tìm theo tên bác sĩ hoặc chuyên khoa...'
                  : 'Search doctor by name or specialty...'
              }
              className="form-input w-full pl-10 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doc) => {
              const targetSlug = doc.serviceCategories.includes('vet')
                ? 'kham-tong-quat'
                : doc.serviceCategories.includes('spa')
                ? 'spa-tam'
                : 'huan-luyen';
              return (
                <div
                  key={doc.id}
                  className="rounded-2xl border p-4 flex flex-col justify-between gap-3"
                  style={{
                    backgroundColor: 'var(--bg)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      className="w-12 h-12 rounded-full object-cover border shrink-0"
                      style={{ borderColor: 'var(--border)' }}
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                        {doc.name}
                      </h3>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {lang === 'vi' ? doc.roleTitleVi : doc.roleTitleEn}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span style={{ color: 'var(--text)' }}>{doc.rating.toFixed(2)}</span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          ({doc.reviewCount} {lang === 'vi' ? 'đánh giá' : 'reviews'})
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {lang === 'vi' ? doc.specialtyVi : doc.specialtyEn}
                  </p>
                  <button
                    type="button"
                    onClick={() => onBookService(targetSlug)}
                    className="btn-secondary w-full py-2 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{lang === 'vi' ? 'Đặt lịch với chuyên gia' : 'Book specialist'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

