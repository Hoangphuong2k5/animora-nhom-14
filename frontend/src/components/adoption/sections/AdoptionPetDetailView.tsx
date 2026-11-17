import React, { useRef } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Heart,
  Phone,
  MapPin,
  ShieldCheck,
  Sparkles,
  Check,
  Calendar,
  Cpu,
  CheckCircle2,
  Clock,
  Home as HomeIcon,
} from 'lucide-react';
import { AdoptionPet, Language } from '@/types';
import {
  ADOPTION_PROCESS_STEPS,
  ADOPTER_REQUIREMENTS,
  getSpeciesDisplayName,
  getGenderChipLabel,
  isPetAdopted,
} from '@/data/adoptionData';
import { AdoptionPetCard } from '../AdoptionShared';

interface AdoptionPetDetailViewProps {
  lang: Language;
  selectedPet: AdoptionPet;
  adoptionPets: AdoptionPet[];
  likedPetIds: string[];
  activePhotoIndex: number;
  setActivePhotoIndex: React.Dispatch<React.SetStateAction<number>>;
  onToggleLike: (petId: string) => void;
  onNavigateToSlug: (slug: string | null) => void;
  onOpenApply: (petOrSlug: AdoptionPet | string) => void;
}

export const AdoptionPetDetailView: React.FC<AdoptionPetDetailViewProps> = ({
  lang,
  selectedPet,
  adoptionPets,
  likedPetIds,
  activePhotoIndex,
  setActivePhotoIndex,
  onToggleLike,
  onNavigateToSlug,
  onOpenApply,
}) => {
  const touchStartXRef = useRef<number | null>(null);

  const adopted = isPetAdopted(selectedPet);
  const isLiked = likedPetIds.includes(selectedPet.id);
  const photos =
    selectedPet.photos && selectedPet.photos.length > 0
      ? selectedPet.photos
      : [selectedPet.photo];
  const safePhotoIdx = Math.min(activePhotoIndex, photos.length - 1);

  const speciesLabel = getSpeciesDisplayName(selectedPet.species, lang);
  const breedLabel =
    lang === 'vi' ? selectedPet.breed : selectedPet.breedEn || selectedPet.breed;
  const ageLabel =
    lang === 'vi' ? selectedPet.age : selectedPet.ageEn || selectedPet.age;
  const genderLabel = getGenderChipLabel(selectedPet.gender, lang);
  const colorLabel =
    lang === 'vi' ? selectedPet.color : selectedPet.colorEn || selectedPet.color;
  const areaLabel =
    lang === 'vi' ? selectedPet.area : selectedPet.areaEn || selectedPet.area;

  const storyParagraphs = (
    lang === 'vi' ? selectedPet.story : selectedPet.storyEn || selectedPet.story
  )
    .split('\n\n')
    .filter(Boolean);

  const personalityTags =
    (lang === 'vi'
      ? selectedPet.personalityTagsVi
      : selectedPet.personalityTagsEn) || selectedPet.tags || [];

  const goodWithList =
    (lang === 'vi' ? selectedPet.goodWithVi : selectedPet.goodWithEn) || [];

  const vaccinationsList = selectedPet.vaccinations || [];

  const otherPetsWaiting = adoptionPets
    .filter((p) => p.id !== selectedPet.id && !isPetAdopted(p))
    .slice(0, 3);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        setActivePhotoIndex((prev) => (prev + 1) % photos.length);
      } else {
        setActivePhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
      }
    }
    touchStartXRef.current = null;
  };

  return (
    <div
      data-testid="page-adopt-detail"
      className="pt-24 pb-28 md:pb-20"
    >
      <div className="max-w-[1200px] mx-auto px-6 space-y-12">
        {/* 1. "← Quay lại" */}
        <div className="flex flex-wrap items-center justify-end gap-4">
          <button
            type="button"
            data-testid="adopt-detail-back-btn"
            onClick={() => onNavigateToSlug(null)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-bold transition-colors hover:border-[#FF7F6B] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--primary)',
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'vi' ? 'Quay lại' : 'Back'}</span>
          </button>
        </div>

        {/* 2. Two Columns on Desktop: Left = Photo Gallery, Right = Info Card */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Photo Gallery (Main photo + 3-5 thumbnails, swipe on mobile) */}
          <div className="lg:col-span-6 space-y-4">
            <div
              className="relative aspect-square rounded-[24px] overflow-hidden border select-none"
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow)',
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                loading="lazy"
                decoding="async"
                src={photos[safePhotoIdx]}
                alt={`${selectedPet.name} - ${safePhotoIdx + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-all duration-300"
                style={{ objectPosition: 'center 30%' }}
              />

              {/* Prev / Next Gallery Arrows */}
              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label={lang === 'vi' ? 'Ảnh trước' : 'Previous photo'}
                    onClick={() =>
                      setActivePhotoIndex(
                        (prev) => (prev - 1 + photos.length) % photos.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border shadow-md transition-transform hover:scale-105 cursor-pointer"
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--border)',
                      color: 'var(--primary)',
                    }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    aria-label={lang === 'vi' ? 'Ảnh tiếp theo' : 'Next photo'}
                    onClick={() =>
                      setActivePhotoIndex((prev) => (prev + 1) % photos.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border shadow-md transition-transform hover:scale-105 cursor-pointer"
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--border)',
                      color: 'var(--primary)',
                    }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails Row (4 thumbnails) */}
            <div className="grid grid-cols-4 gap-3">
              {photos.map((thumbUrl, idx) => {
                const isSelected = idx === safePhotoIdx;
                return (
                  <button
                    key={idx}
                    type="button"
                    data-testid={`adopt-gallery-thumb-${idx}`}
                    onClick={() => setActivePhotoIndex(idx)}
                    aria-label={`${selectedPet.name} ${
                      lang === 'vi' ? 'ảnh' : 'photo'
                    } ${idx + 1}`}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF7F6B] ${
                      isSelected ? 'scale-[1.02]' : 'opacity-75 hover:opacity-100'
                    }`}
                    style={{
                      borderColor: isSelected ? '#FF7F6B' : 'var(--border)',
                      backgroundColor: 'var(--surface-2)',
                    }}
                  >
                    <img
                      loading="lazy"
                      decoding="async"
                      src={thumbUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      style={{ objectPosition: 'center 30%' }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Info Card */}
          <div
            className="lg:col-span-6 rounded-[24px] border p-6 sm:p-8 space-y-6"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow)',
            }}
          >
            {/* Status Ribbon & Wishlist Heart */}
            <div className="flex items-center justify-between gap-3">
              <span
                className="px-3.5 py-1 rounded-full text-xs font-extrabold tracking-wide"
                style={{
                  backgroundColor: adopted ? '#6B7280' : '#FF7F6B',
                  color: '#FFFFFF',
                }}
              >
                {adopted
                  ? lang === 'vi'
                    ? 'Đã có gia đình'
                    : 'Adopted'
                  : lang === 'vi'
                  ? 'Đang chờ gia đình'
                  : 'Waiting for a family'}
              </span>

              <button
                type="button"
                aria-pressed={isLiked}
                aria-label={
                  lang === 'vi'
                    ? `${isLiked ? 'Bỏ yêu thích' : 'Yêu thích'} ${selectedPet.name}`
                    : `${isLiked ? 'Remove from wishlist' : 'Save to wishlist'} ${
                        selectedPet.name
                      }`
                }
                onClick={() => onToggleLike(selectedPet.id)}
                className="w-10 h-10 rounded-full border flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
                style={{
                  backgroundColor: isLiked ? '#FFF0EE' : 'var(--surface-2)',
                  borderColor: isLiked ? '#FF7F6B' : 'var(--border)',
                  color: isLiked ? '#FF7F6B' : 'var(--text-muted)',
                }}
              >
                <Heart
                  className={`w-4.5 h-4.5 ${
                    isLiked ? 'fill-[#FF7F6B] text-[#FF7F6B]' : ''
                  }`}
                />
              </button>
            </div>

            {/* Pet Name (Baloo 2, 40px) */}
            <div>
              <h1
                data-testid="adopt-detail-name"
                className="font-heading text-[34px] sm:text-[40px] font-bold leading-tight"
                style={{ color: 'var(--primary)' }}
              >
                {selectedPet.name}
              </h1>
              <p
                className="text-base font-medium mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                {lang === 'vi'
                  ? selectedPet.personality
                  : selectedPet.personalityEn || selectedPet.personality}
              </p>
            </div>

            {/* Key Attributes Grid: species, breed, age, gender, weight, color, area */}
            <div
              className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl border"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border)',
              }}
            >
              <div>
                <span
                  className="text-xs font-semibold block"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {lang === 'vi' ? 'Loài' : 'Species'}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color: 'var(--text)' }}
                >
                  {speciesLabel}
                </span>
              </div>
              <div>
                <span
                  className="text-xs font-semibold block"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {lang === 'vi' ? 'Giống' : 'Breed'}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color: 'var(--text)' }}
                >
                  {breedLabel}
                </span>
              </div>
              <div>
                <span
                  className="text-xs font-semibold block"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {lang === 'vi' ? 'Độ tuổi' : 'Age'}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color: 'var(--text)' }}
                >
                  {ageLabel}
                </span>
              </div>
              <div>
                <span
                  className="text-xs font-semibold block"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {lang === 'vi' ? 'Giới tính' : 'Gender'}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color: 'var(--text)' }}
                >
                  {genderLabel}
                </span>
              </div>
              <div>
                <span
                  className="text-xs font-semibold block"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {lang === 'vi' ? 'Cân nặng' : 'Weight'}
                </span>
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{ color: 'var(--text)' }}
                >
                  {selectedPet.weight}
                </span>
              </div>
              <div>
                <span
                  className="text-xs font-semibold block"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {lang === 'vi' ? 'Màu sắc' : 'Color'}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color: 'var(--text)' }}
                >
                  {colorLabel}
                </span>
              </div>
              <div
                className="col-span-2 sm:col-span-3 pt-2 border-t flex items-center justify-between"
                style={{ borderColor: 'var(--border)' }}
              >
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-bold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <MapPin className="w-3.5 h-3.5" style={{ color: '#FF7F6B' }} />
                  {lang === 'vi' ? 'Khu vực:' : 'Location:'}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color: 'var(--primary)' }}
                >
                  {areaLabel}
                </span>
              </div>
              <div
                className="col-span-2 sm:col-span-3 pt-2 border-t flex items-center justify-between"
                style={{ borderColor: 'var(--border)' }}
              >
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-bold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <HomeIcon className="w-3.5 h-3.5" style={{ color: '#FF7F6B' }} />
                  {lang === 'vi' ? 'Trạm cứu hộ:' : 'Rescue shelter:'}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color: 'var(--primary)' }}
                >
                  {selectedPet.shelterName ||
                    (lang === 'vi'
                      ? 'Trạm cứu hộ Animora'
                      : 'Animora Rescue Shelter')}
                </span>
              </div>
            </div>

            {/* Fact Chips */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap gap-2">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-bold"
                  style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text)' }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{genderLabel}</span>
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-bold"
                  style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text)' }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    {selectedPet.vaccinated
                      ? lang === 'vi'
                        ? 'Đã tiêm phòng'
                        : 'Vaccinated'
                      : lang === 'vi'
                      ? 'Chưa tiêm phòng'
                      : 'Not vaccinated'}
                  </span>
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-bold"
                  style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text)' }}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {selectedPet.neutered
                      ? lang === 'vi'
                        ? 'Đã triệt sản'
                        : 'Neutered'
                      : lang === 'vi'
                      ? 'Chưa triệt sản'
                      : 'Not neutered'}
                  </span>
                </span>
                {selectedPet.microchip && (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-bold tabular-nums"
                    style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text)' }}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Microchip: {selectedPet.microchip}</span>
                  </span>
                )}
              </div>

              {goodWithList.length > 0 && (
                <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {lang === 'vi' ? 'Hòa hợp tốt với: ' : 'Good with: '}
                  <span style={{ color: 'var(--text)' }}>{goodWithList.join(' · ')}</span>
                </p>
              )}
            </div>

            {/* Primary "Nhận nuôi {name}" button & Secondary "Gọi tư vấn: 0337 203 332" button */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={adopted}
                data-testid="adopt-detail-primary-btn"
                onClick={() => onOpenApply(selectedPet.slug)}
                className={`h-[48px] px-6 rounded-full text-[15px] font-bold inline-flex items-center justify-center gap-2 transition-colors ${
                  adopted
                    ? 'cursor-not-allowed opacity-60 bg-gray-400 text-white'
                    : 'cursor-pointer bg-[var(--primary)] text-[var(--on-primary)] hover:!bg-[#FF7F6B] hover:!text-white'
                }`}
              >
                <span>
                  {adopted
                    ? lang === 'vi'
                      ? `${selectedPet.name} đã có gia đình`
                      : `${selectedPet.name} is adopted`
                    : lang === 'vi'
                    ? `Nhận nuôi ${selectedPet.name}`
                    : `Adopt ${selectedPet.name}`}
                </span>
              </button>

              <a
                href="tel:+84337203332"
                data-testid="adopt-detail-call-btn"
                className="h-[48px] px-5 rounded-full border text-[14px] font-bold inline-flex items-center justify-center gap-2 transition-colors hover:border-[#FF7F6B]"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  color: 'var(--primary)',
                }}
              >
                <Phone className="w-4 h-4 shrink-0" style={{ color: '#FF7F6B' }} />
                <span>
                  {lang === 'vi'
                    ? 'Gọi tư vấn: 0337 203 332'
                    : 'Call advice: 0337 203 332'}
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* 3. "Câu chuyện của {name}" (Story) & 4. "Tính cách" (Personality) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 3. Story (1-2 paragraphs) */}
          <div
            className="lg:col-span-7 rounded-[24px] border p-6 sm:p-8 space-y-4"
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
                ? `Câu chuyện của ${selectedPet.name}`
                : `${selectedPet.name}'s story`}
            </h2>
            <div className="space-y-3 text-base leading-relaxed" style={{ color: 'var(--text)' }}>
              {storyParagraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </div>

          {/* 4. Personality (3-5 tags) */}
          <div
            className="lg:col-span-5 rounded-[24px] border p-6 sm:p-8 space-y-4"
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
              {lang === 'vi' ? 'Tính cách' : 'Personality'}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {lang === 'vi'
                ? selectedPet.personality
                : selectedPet.personalityEn || selectedPet.personality}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {personalityTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-full text-sm font-bold"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    color: 'var(--primary)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 5. "Sức khỏe" (Health) & 6. "Yêu cầu với người nhận nuôi" (Adopter requirements) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 5. Health: vaccination list with status pills and last checkup date */}
          <div
            className="lg:col-span-6 rounded-[24px] border p-6 sm:p-8 space-y-5"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow)',
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2
                className="font-heading text-2xl sm:text-3xl font-bold"
                style={{ color: 'var(--primary)' }}
              >
                {lang === 'vi' ? 'Sức khỏe' : 'Health'}
              </h2>
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  color: 'var(--text-muted)',
                }}
              >
                <Calendar className="w-3.5 h-3.5" style={{ color: '#FF7F6B' }} />
                <span>
                  {lang === 'vi' ? 'Khám gần nhất:' : 'Last checkup:'}{' '}
                  {selectedPet.lastCheckupDate}
                </span>
              </span>
            </div>

            <div className="space-y-3">
              {vaccinationsList.map((vac) => {
                const isDone = vac.status === 'vaccinated';
                return (
                  <div
                    key={vac.id}
                    className="p-4 rounded-2xl border flex items-center justify-between gap-3"
                    style={{
                      backgroundColor: 'var(--bg)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                        {lang === 'vi' ? vac.nameVi : vac.nameEn}
                      </p>
                      <p
                        className="text-xs font-medium mt-0.5 tabular-nums"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {vac.date}
                      </p>
                    </div>
                    <span
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shrink-0"
                      style={{
                        backgroundColor: isDone ? '#DCFCE7' : '#FEF3C7',
                        color: isDone ? '#166534' : '#92400E',
                      }}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {isDone
                          ? lang === 'vi'
                            ? 'Đã tiêm'
                            : 'Vaccinated'
                          : lang === 'vi'
                          ? 'Sắp đến hạn'
                          : 'Due soon'}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6. Adopter Requirements: 4 bullets */}
          <div
            className="lg:col-span-6 rounded-[24px] border p-6 sm:p-8 space-y-5"
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
                ? 'Yêu cầu với người nhận nuôi'
                : 'Adopter requirements'}
            </h2>
            <ul className="space-y-3.5">
              {ADOPTER_REQUIREMENTS.map((req, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span
                    className="w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5"
                    style={{
                      backgroundColor: 'var(--surface-2)',
                      color: 'var(--primary)',
                    }}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                    {lang === 'vi' ? req.vi : req.en}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 7. "Quy trình nhận nuôi" (Process): the 4 steps expanded */}
        <section
          className="rounded-[24px] border p-6 sm:p-8 space-y-6"
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
            {lang === 'vi' ? 'Quy trình nhận nuôi' : 'Adoption process'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ADOPTION_PROCESS_STEPS.map((s) => (
              <div
                key={s.step}
                className="p-5 rounded-2xl border space-y-2"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--border)',
                }}
              >
                <span
                  className="w-8 h-8 rounded-full inline-flex items-center justify-center text-sm font-extrabold"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    color: 'var(--primary)',
                  }}
                >
                  {s.step}
                </span>
                <h3 className="font-heading text-lg font-bold" style={{ color: 'var(--primary)' }}>
                  {lang === 'vi' ? s.titleVi : s.titleEn}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {lang === 'vi' ? s.descVi : s.descEn}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 8. "Các bé khác đang chờ" (Other pets waiting): 3 cards */}
        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2
              className="font-heading text-2xl sm:text-3xl font-bold"
              style={{ color: 'var(--primary)' }}
            >
              {lang === 'vi' ? 'Các bé khác đang chờ' : 'Other pets waiting'}
            </h2>
            <button
              type="button"
              onClick={() => onNavigateToSlug(null)}
              className="text-sm font-bold hover:underline cursor-pointer"
              style={{ color: 'var(--primary)' }}
            >
              {lang === 'vi' ? 'Xem tất cả →' : 'See all →'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {otherPetsWaiting.map((otherPet) => (
              <AdoptionPetCard
                key={otherPet.id}
                pet={otherPet}
                lang={lang}
                isLiked={likedPetIds.includes(otherPet.id)}
                onToggleLike={onToggleLike}
                onOpenProfile={(p) => onNavigateToSlug(p.slug)}
                onOpenAdoptForm={(p) => onOpenApply(p.slug)}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Mobile Sticky Bottom Bar with "Nhận nuôi {name}" */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 py-2.5 border-t flex items-center justify-between gap-3"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
        }}
      >
        <div className="min-w-0">
          <p
            className="font-heading text-base font-bold truncate"
            style={{ color: 'var(--primary)' }}
          >
            {selectedPet.name}
          </p>
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
            {breedLabel} · {ageLabel}
          </p>
        </div>
        <button
          type="button"
          disabled={adopted}
          onClick={() => onOpenApply(selectedPet.slug)}
          className={`h-[42px] px-5 rounded-full text-xs font-bold shrink-0 ${
            adopted
              ? 'bg-gray-400 text-white opacity-60 cursor-not-allowed'
              : 'bg-[var(--primary)] text-[var(--on-primary)] cursor-pointer'
          }`}
        >
          {adopted
            ? lang === 'vi'
              ? 'Đã có gia đình'
              : 'Adopted'
            : lang === 'vi'
            ? `Nhận nuôi ${selectedPet.name}`
            : `Adopt ${selectedPet.name}`}
        </button>
      </div>
    </div>
  );
};
