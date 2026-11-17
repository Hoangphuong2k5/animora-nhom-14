import React, { useState } from 'react';
import {
  Heart,
  MapPin,
  ShieldCheck,
  Sparkles,
  Check,
  ArrowRight,
} from 'lucide-react';
import { AdoptionPet, Language } from '@/types';
import {
  getSpeciesDisplayName,
  getGenderChipLabel,
  isPetAdopted,
} from '@/data/adoptionData';
import { SmallPawDecoration } from './AdoptionDecorationsAndStates';

export interface AdoptionPetCardProps {
  pet: AdoptionPet;
  lang: Language;
  isLiked: boolean;
  onToggleLike: (petId: string) => void;
  onOpenProfile: (pet: AdoptionPet) => void;
  onOpenAdoptForm: (pet: AdoptionPet) => void;
  matchScore?: number;
  matchReason?: string;
}

export const AdoptionPetCard = ({
  pet,
  lang,
  isLiked,
  onToggleLike,
  onOpenProfile,
  onOpenAdoptForm,
  matchScore,
  matchReason,
}: AdoptionPetCardProps) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const adopted = isPetAdopted(pet);

  const speciesLabel = getSpeciesDisplayName(pet.species, lang);
  const breedLabel = lang === 'vi' ? pet.breed : pet.breedEn || pet.breed;
  const ageLabel = lang === 'vi' ? pet.age : pet.ageEn || pet.age;
  const genderLabel = getGenderChipLabel(pet.gender, lang);
  const areaLabel = lang === 'vi' ? pet.area : pet.areaEn || pet.area;
  const personalityText =
    lang === 'vi' ? pet.personality : pet.personalityEn || pet.personality;

  const vaccinatedLabel = pet.vaccinated
    ? lang === 'vi'
      ? 'Đã tiêm phòng'
      : 'Vaccinated'
    : lang === 'vi'
    ? 'Chưa tiêm phòng'
    : 'Not vaccinated';

  const neuteredLabel = pet.neutered
    ? lang === 'vi'
      ? 'Đã triệt sản'
      : 'Neutered'
    : lang === 'vi'
    ? 'Chưa triệt sản'
    : 'Not neutered';

  const statusText = adopted
    ? lang === 'vi'
      ? 'Đã có gia đình'
      : 'Adopted'
    : lang === 'vi'
    ? 'Đang chờ gia đình'
    : 'Waiting for a family';

  const profileHref = `/nhan-nuoi/${pet.slug}`;

  const handleNavigateProfile = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpenProfile(pet);
  };

  return (
    <article
      data-testid={`adopt-card-${pet.slug}`}
      className={`group relative h-full flex flex-col rounded-[24px] border p-6 transition-all duration-200 hover:-translate-y-1 focus-within:ring-2 focus-within:ring-[#FF7F6B] ${
        adopted ? 'opacity-70' : ''
      }`}
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow)',
      }}
    >
      {/* Top-right Wishlist Heart Button (36px round, aria-pressed) */}
      <button
        type="button"
        aria-pressed={isLiked}
        aria-label={
          lang === 'vi'
            ? `${isLiked ? 'Bỏ yêu thích' : 'Yêu thích'} ${pet.name}`
            : `${isLiked ? 'Remove from wishlist' : 'Save to wishlist'} ${pet.name}`
        }
        data-testid={`adopt-wishlist-${pet.slug}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleLike(pet.id);
        }}
        className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full border flex items-center justify-center transition-transform duration-150 hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7F6B]"
        style={{
          backgroundColor: isLiked ? '#FFF0EE' : 'var(--surface)',
          borderColor: isLiked ? '#FF7F6B' : 'var(--border)',
          color: isLiked ? '#FF7F6B' : 'var(--text-muted)',
        }}
      >
        <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#FF7F6B] text-[#FF7F6B]' : ''}`} />
      </button>

      {/* Circular Photo Section (160px on mobile, 200px on desktop) */}
      <div className="relative mx-auto mb-5 flex flex-col items-center">
        <a
          href={profileHref}
          onClick={handleNavigateProfile}
          aria-label={
            lang === 'vi' ? `Xem hồ sơ của ${pet.name}` : `View profile of ${pet.name}`
          }
          className="relative block w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] rounded-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF7F6B]"
        >
          {/* Rotated slightly pink #F4B6C2 offset ring behind photo */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-1.5 rounded-full border-[3px] border-[#F4B6C2] translate-x-1.5 translate-y-1 rotate-6 transition-transform duration-300 group-hover:rotate-12"
          />

          {/* Circle image container with 4px var(--surface) ring */}
          <div
            className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center"
            style={{
              backgroundColor: 'var(--surface-2)',
              boxShadow: '0 0 0 4px var(--surface)',
            }}
          >
            {/* Paw icon placeholder on --surface-2 while loading or on error */}
            {(!imgLoaded || imgError) && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ backgroundColor: 'var(--surface-2)', color: 'var(--primary)' }}
              >
                <SmallPawDecoration className="w-12 h-12 opacity-45" />
              </div>
            )}

            {!imgError && (
              <img loading="lazy" decoding="async"
                src={pet.photo}
                alt={pet.name}
                referrerPolicy="no-referrer"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
                className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04] ${
                  imgLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ objectPosition: 'center 30%' }}
              />
            )}
          </div>
        </a>

        {/* Status ribbon on the bottom of photo */}
        <span
          data-testid={`adopt-status-${pet.slug}`}
          className="relative z-10 -mt-3.5 px-3.5 py-1 rounded-full text-[12px] font-extrabold tracking-wide shadow-xs whitespace-nowrap"
          style={{
            backgroundColor: adopted ? '#6B7280' : '#FF7F6B',
            color: '#FFFFFF',
          }}
        >
          {statusText}
        </span>

        {/* Compatibility Match Score Pill if calculated */}
        {matchScore !== undefined && matchScore > 0 && !adopted && (
          <span
            data-testid={`adopt-match-${pet.slug}`}
            className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold shadow-xs"
            style={{
              backgroundColor: matchScore >= 85 ? '#FF7F6B' : 'var(--primary)',
              color: '#FFFFFF',
            }}
            title={matchReason}
          >
            <Sparkles className="w-3 h-3" />
            <span>
              {matchScore}% {lang === 'vi' ? 'Phù hợp' : 'Match'}
            </span>
          </span>
        )}
      </div>

      {/* Text & Metadata Content */}
      <div className="flex flex-col items-center text-center flex-1">
        {/* Name: Baloo 2, 24px, weight 700, --primary, max 2 lines */}
        <h3 className="font-heading text-[24px] font-bold leading-snug line-clamp-2">
          <a
            href={profileHref}
            onClick={handleNavigateProfile}
            className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7F6B] rounded"
            style={{ color: 'var(--primary)' }}
          >
            {pet.name}
          </a>
        </h3>

        {/* Info line: species · breed · age, Nunito 15px, --text-muted, max 2 lines */}
        <p
          className="font-sans text-[15px] font-medium mt-1 line-clamp-2"
          style={{ color: 'var(--text-muted)' }}
        >
          {speciesLabel} · {breedLabel} · {ageLabel}
        </p>

        {/* Fact chips row (max 3 chips: gender, vaccinated, neutered) + Area with pin icon */}
        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5">
          {/* Chip 1: Gender */}
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[13px] font-bold leading-none"
            style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text)' }}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0 opacity-75" />
            <span>{genderLabel}</span>
          </span>

          {/* Chip 2: Vaccinated */}
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[13px] font-bold leading-none"
            style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text)' }}
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 opacity-75" />
            <span>{vaccinatedLabel}</span>
          </span>

          {/* Chip 3: Neutered */}
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[13px] font-bold leading-none"
            style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text)' }}
          >
            <Check className="w-3.5 h-3.5 shrink-0 opacity-75" />
            <span>{neuteredLabel}</span>
          </span>
        </div>

        {/* Area & Shelter */}
        <div
          className="mt-2 inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[13px] font-bold"
          style={{ color: 'var(--text-muted)' }}
        >
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: '#FF7F6B' }} />
            <span>
              {lang === 'vi' ? 'Khu vực:' : 'Area:'} {areaLabel}
            </span>
          </span>
          <span>
            · {pet.shelterName || 'Trạm cứu hộ Animora'}
          </span>
        </div>

        {/* Personality line: 16px, weight 500, color --text, max 2 lines */}
        <p
          className="font-sans text-[16px] font-medium mt-3 line-clamp-2 leading-snug"
          style={{ color: 'var(--text)' }}
        >
          {personalityText}
        </p>
      </div>

      {/* Actions at bottom of card (grid, margin-top: auto) */}
      <div className="grid gap-3 pt-5 mt-auto">
        {/* Primary button: full width, height 44px, --primary fill with --on-primary text, hover coral #FF7F6B */}
        <button
          type="button"
          disabled={adopted}
          data-testid={`adopt-primary-btn-${pet.slug}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!adopted) {
              onOpenAdoptForm(pet);
            }
          }}
          className={`w-full h-[44px] px-4 rounded-full text-[15px] font-bold inline-flex items-center justify-center gap-2 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7F6B] ${
            adopted
              ? 'cursor-not-allowed opacity-60 bg-gray-400 text-white'
              : 'cursor-pointer bg-[var(--primary)] text-[var(--on-primary)] hover:!bg-[#FF7F6B] hover:!text-white'
          }`}
        >
          <span>
            {adopted
              ? lang === 'vi'
                ? `${pet.name} đã có gia đình`
                : `${pet.name} is adopted`
              : lang === 'vi'
              ? `Nhận nuôi ${pet.name}`
              : `Adopt ${pet.name}`}
          </span>
        </button>

        {/* Secondary row below: text link "Xem hồ sơ" */}
        <div className="flex items-center justify-center pt-0.5">
          <a
            href={profileHref}
            data-testid={`adopt-view-profile-${pet.slug}`}
            onClick={handleNavigateProfile}
            className="inline-flex items-center gap-1.5 text-[14px] font-bold hover:underline py-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7F6B] rounded"
            style={{ color: 'var(--primary)' }}
          >
            <span>{lang === 'vi' ? 'Xem hồ sơ' : 'View profile'}</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </article>
  );
};
