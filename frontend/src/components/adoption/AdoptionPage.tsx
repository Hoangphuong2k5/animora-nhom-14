import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Heart, ShieldCheck, Check, Search, RotateCcw, X } from 'lucide-react';
import { AdoptionPet, AdoptionRequest, Language, PageId } from '@/types';
import { AdoptionSpeciesTab, AdoptionSortOption, getAdoptionSpeciesCounts, isPetAdopted, parseAdoptionUrlPath } from '@/data/adoptionData';
import { AdoptionFilterToolbar, AdoptionPetCard, AdoptionSkeletonGrid, AdoptionEmptyState } from '../adoption/AdoptionShared';
import { AdoptionApplyPage } from '../adoption/AdoptionApplyPage';
import { calculateAdoptionMatchScore, AdoptionMatchPreferences, AdoptionMatchResult } from '@/utils/petLogic';
import { AdoptionPetDetailView } from './sections/AdoptionPetDetailView';
import { AdoptionHeroAndQuizSection } from './sections/AdoptionHeroAndQuizSection';
import { AdoptionInfoAndRequestsSection } from './sections/AdoptionInfoAndRequestsSection';

interface AdoptionPageProps {
  lang: Language;
  adoptionPets: AdoptionPet[];
  adoptionRequests: AdoptionRequest[];
  onAddAdoptionRequest: (req: AdoptionRequest) => void;
  onNavigate: (page: PageId) => void;
  initialPetSlug?: string | null;
}

export const AdoptionPage = ({
  lang,
  adoptionPets,
  adoptionRequests,
  onAddAdoptionRequest,
  onNavigate,
  initialPetSlug = null,
}: AdoptionPageProps) => {
  const initialUrlState = parseAdoptionUrlPath(
    typeof window !== 'undefined' ? window.location.pathname : '/nhan-nuoi'
  );

  const [currentSlug, setCurrentSlug] = useState<string | null>(() => initialUrlState.slug || initialPetSlug);
  const [isApplyRoute, setIsApplyRoute] = useState<boolean>(() => initialUrlState.isApplyRoute);
  const [isSuccessRoute, setIsSuccessRoute] = useState<boolean>(() => initialUrlState.isSuccessRoute);

  const [activeTab, setActiveTab] = useState<AdoptionSpeciesTab>('All');
  const [sortBy, setSortBy] = useState<AdoptionSortOption>('newest');
  const [isLoading] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const catalogSectionRef = useRef<HTMLDivElement | null>(null);
  const processSectionRef = useRef<HTMLDivElement | null>(null);

  // Search & Secondary filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [ageFilter, setAgeFilter] = useState<'all' | 'baby' | 'young' | 'adult'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Đực' | 'Cái'>('all');
  const [onlyVaccinated, setOnlyVaccinated] = useState(false);
  const [onlyNeutered, setOnlyNeutered] = useState(false);
  const [onlyLiked, setOnlyLiked] = useState(false);

  // Interactive Match-Maker Quiz state
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizPrefs, setQuizPrefs] = useState<AdoptionMatchPreferences>({
    preferredSpecies: 'All',
    livingSpace: 'apartment',
    dailyTime: 'moderate',
    experience: 'first_time',
  });
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const [likedPetIds, setLikedPetIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('animora_adoption_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Calculate compatibility scores for all pets when quiz is submitted
  const matchScoresMap = useMemo(() => {
    if (!quizSubmitted) return new Map<string, AdoptionMatchResult>();
    const map = new Map<string, AdoptionMatchResult>();
    for (const pet of adoptionPets) {
      map.set(pet.id, calculateAdoptionMatchScore(pet, quizPrefs));
    }
    return map;
  }, [quizSubmitted, quizPrefs, adoptionPets]);

  const counts = useMemo(() => getAdoptionSpeciesCounts(adoptionPets), [adoptionPets]);

  const filteredPets = useMemo(() => {
    let list = [...adoptionPets];

    if (activeTab !== 'All') list = list.filter((p) => p.species === activeTab);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        const matchName = p.name.toLowerCase().includes(q);
        const matchBreed = (p.breed + ' ' + (p.breedEn || '')).toLowerCase().includes(q);
        const matchColor = (p.color + ' ' + (p.colorEn || '')).toLowerCase().includes(q);
        const matchPersonality = (p.personality + ' ' + (p.personalityEn || '')).toLowerCase().includes(q);
        const matchTags = (p.tags || []).some((t) => t.toLowerCase().includes(q));
        const matchArea = (p.area + ' ' + (p.areaEn || '')).toLowerCase().includes(q);
        return matchName || matchBreed || matchColor || matchPersonality || matchTags || matchArea;
      });
    }

    if (ageFilter === 'baby') {
      list = list.filter(
        (p) =>
          (p.ageMonths ?? 24) <= 12 ||
          p.age.toLowerCase().includes('tháng') ||
          (p.ageEn && p.ageEn.toLowerCase().includes('month'))
      );
    } else if (ageFilter === 'young') {
      list = list.filter((p) => {
        const m = p.ageMonths ?? 24;
        return m > 12 && m <= 36;
      });
    } else if (ageFilter === 'adult') {
      list = list.filter((p) => (p.ageMonths ?? 24) > 36);
    }

    if (genderFilter !== 'all') list = list.filter((p) => p.gender === genderFilter);
    if (onlyVaccinated) list = list.filter((p) => p.vaccinated);
    if (onlyNeutered) list = list.filter((p) => p.neutered);
    if (onlyLiked) list = list.filter((p) => likedPetIds.includes(p.id));

    list.sort((a, b) => {
      const adoptedA = isPetAdopted(a);
      const adoptedB = isPetAdopted(b);
      if (adoptedA && !adoptedB) return 1;
      if (!adoptedA && adoptedB) return -1;

      if (quizSubmitted) {
        const scoreA = matchScoresMap.get(a.id)?.score ?? 0;
        const scoreB = matchScoresMap.get(b.id)?.score ?? 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
      }

      if (sortBy === 'youngest') return (a.ageMonths ?? 24) - (b.ageMonths ?? 24);
      if (sortBy === 'nearest') return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });

    return list;
  }, [adoptionPets, activeTab, searchQuery, ageFilter, genderFilter, onlyVaccinated, onlyNeutered, onlyLiked, likedPetIds, sortBy, quizSubmitted, matchScoresMap]);

  const handleResetFilters = () => {
    setActiveTab('All');
    setSearchQuery('');
    setAgeFilter('all');
    setGenderFilter('all');
    setOnlyVaccinated(false);
    setOnlyNeutered(false);
    setOnlyLiked(false);
    setSortBy('newest');
    setQuizSubmitted(false);
  };

  useEffect(() => {
    const syncRoute = () => {
      const parsed = parseAdoptionUrlPath(window.location.pathname);
      setCurrentSlug(parsed.slug);
      setIsApplyRoute(parsed.isApplyRoute);
      setIsSuccessRoute(parsed.isSuccessRoute);
      setActivePhotoIndex(0);
    };

    syncRoute();
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, [adoptionPets]);

  useEffect(() => {
    if (initialPetSlug) {
      setCurrentSlug(initialPetSlug);
      setActivePhotoIndex(0);
    }
  }, [initialPetSlug]);

  const handleToggleLike = (petId: string) => {
    setLikedPetIds((prev) => {
      const next = prev.includes(petId) ? prev.filter((id) => id !== petId) : [...prev, petId];
      try {
        localStorage.setItem('animora_adoption_wishlist', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleOpenApply = (petOrSlug: AdoptionPet | string) => {
    const targetSlug = typeof petOrSlug === 'string' ? petOrSlug : petOrSlug.slug;
    const targetPath = `/nhan-nuoi/${targetSlug}/dang-ky`;
    if (window.location.pathname !== targetPath) window.history.pushState({}, '', targetPath);
    setCurrentSlug(targetSlug);
    setIsApplyRoute(true);
    setIsSuccessRoute(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const handleNavigateUrl = (targetUrl: string) => {
    if (window.location.pathname !== targetUrl) window.history.pushState({}, '', targetUrl);
    const parsed = parseAdoptionUrlPath(targetUrl);
    setCurrentSlug(parsed.slug);
    setIsApplyRoute(parsed.isApplyRoute);
    setIsSuccessRoute(parsed.isSuccessRoute);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const navigateToSlug = (slug: string | null) => {
    const targetPath = slug ? `/nhan-nuoi/${slug}` : '/nhan-nuoi';
    if (window.location.pathname !== targetPath) window.history.pushState({}, '', targetPath);
    setCurrentSlug(slug);
    setIsApplyRoute(false);
    setIsSuccessRoute(false);
    setActivePhotoIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isApplyRoute && currentSlug) {
    const applyPet = adoptionPets.find((p) => p.slug === currentSlug || p.id === currentSlug) || null;
    return (
      <AdoptionApplyPage
        lang={lang}
        pet={applyPet}
        onAddAdoptionRequest={onAddAdoptionRequest}
        onNavigate={onNavigate}
        onNavigateUrl={handleNavigateUrl}
        isSuccessView={isSuccessRoute}
      />
    );
  }

  const selectedPet = currentSlug
    ? adoptionPets.find((p) => p.slug === currentSlug || p.id === currentSlug) || null
    : null;

  if (selectedPet) {
    return (
      <AdoptionPetDetailView
        lang={lang}
        selectedPet={selectedPet}
        adoptionPets={adoptionPets}
        likedPetIds={likedPetIds}
        activePhotoIndex={activePhotoIndex}
        setActivePhotoIndex={setActivePhotoIndex}
        onToggleLike={handleToggleLike}
        onNavigateToSlug={navigateToSlug}
        onOpenApply={handleOpenApply}
      />
    );
  }

  const hasActiveFilters =
    activeTab !== 'All' ||
    searchQuery.trim() !== '' ||
    ageFilter !== 'all' ||
    genderFilter !== 'all' ||
    onlyVaccinated ||
    onlyNeutered ||
    onlyLiked ||
    quizSubmitted;

  return (
    <div data-testid="page-adopt" className="pt-24 pb-24 min-h-screen">
      <div className="max-w-[1200px] min-[1920px]:max-w-[1520px] mx-auto px-4 sm:px-6 space-y-8">
        <AdoptionHeroAndQuizSection
          lang={lang}
          totalPetsCount={adoptionPets.length}
          isQuizOpen={isQuizOpen}
          setIsQuizOpen={setIsQuizOpen}
          quizPrefs={quizPrefs}
          setQuizPrefs={setQuizPrefs}
          quizSubmitted={quizSubmitted}
          setQuizSubmitted={setQuizSubmitted}
          onScrollToCatalog={() => catalogSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
          onScrollToProcess={() => processSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
        />

        {/* 3. MULTI-FILTER TOOLBAR & SEARCH */}
        <section ref={catalogSectionRef} className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold" style={{ color: 'var(--primary)' }}>
                {lang === 'vi' ? 'Danh sách các bé đang chờ bạn' : 'Pets waiting for adoption'}
              </h2>
              <p className="text-xs sm:text-sm font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {lang === 'vi'
                  ? `Tìm thấy ${filteredPets.length} bé phù hợp tiêu chí`
                  : `Showing ${filteredPets.length} pets matching criteria`}
              </p>
            </div>

            <div className="relative w-full lg:w-72">
              <input
                type="text"
                data-testid="adopt-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'vi' ? 'Tìm tên bé, giống, màu lông...' : 'Search name, breed, color...'}
                className="w-full h-11 pl-10 pr-9 rounded-full text-sm font-medium border transition-colors focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
              <Search
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label={lang === 'vi' ? 'Xóa tìm kiếm' : 'Clear search'}
                  className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center hover:opacity-75 cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <AdoptionFilterToolbar
            lang={lang}
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
            counts={counts}
            sortBy={sortBy}
            onChangeSort={(s) => setSortBy(s)}
          />

          <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <span className="text-xs font-bold uppercase tracking-wider mr-1" style={{ color: 'var(--text-muted)' }}>
                {lang === 'vi' ? 'Độ tuổi:' : 'Age:'}
              </span>
              {[
                { id: 'all' as const, vi: 'Tất cả', en: 'All' },
                { id: 'baby' as const, vi: 'Dưới 1 tuổi', en: '< 1 yr' },
                { id: 'young' as const, vi: '1 - 3 tuổi', en: '1 - 3 yrs' },
                { id: 'adult' as const, vi: '> 3 tuổi', en: '> 3 yrs' },
              ].map((opt) => {
                const active = ageFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAgeFilter(opt.id)}
                    className="h-8 px-3 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap"
                    style={{
                      backgroundColor: active ? 'var(--primary)' : 'var(--surface)',
                      color: active ? 'var(--on-primary)' : 'var(--text)',
                      borderColor: active ? 'var(--primary)' : 'var(--border)',
                    }}
                  >
                    {lang === 'vi' ? opt.vi : opt.en}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <span className="text-xs font-bold uppercase tracking-wider mr-1" style={{ color: 'var(--text-muted)' }}>
                {lang === 'vi' ? 'Giới tính:' : 'Gender:'}
              </span>
              {[
                { id: 'all' as const, vi: 'Tất cả', en: 'All' },
                { id: 'Đực' as const, vi: 'Đực', en: 'Male' },
                { id: 'Cái' as const, vi: 'Cái', en: 'Female' },
              ].map((opt) => {
                const active = genderFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setGenderFilter(opt.id)}
                    className="h-8 px-3 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap"
                    style={{
                      backgroundColor: active ? 'var(--primary)' : 'var(--surface)',
                      color: active ? 'var(--on-primary)' : 'var(--text)',
                      borderColor: active ? 'var(--primary)' : 'var(--border)',
                    }}
                  >
                    {lang === 'vi' ? opt.vi : opt.en}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setOnlyVaccinated((prev) => !prev)}
              className="h-8 px-3 rounded-full text-xs font-bold border inline-flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
              style={{
                backgroundColor: onlyVaccinated ? 'var(--surface-2)' : 'var(--surface)',
                borderColor: onlyVaccinated ? '#FF7F6B' : 'var(--border)',
                color: onlyVaccinated ? '#FF7F6B' : 'var(--text)',
              }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{lang === 'vi' ? 'Đã tiêm phòng' : 'Vaccinated'}</span>
            </button>

            <button
              type="button"
              onClick={() => setOnlyNeutered((prev) => !prev)}
              className="h-8 px-3 rounded-full text-xs font-bold border inline-flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
              style={{
                backgroundColor: onlyNeutered ? 'var(--surface-2)' : 'var(--surface)',
                borderColor: onlyNeutered ? '#FF7F6B' : 'var(--border)',
                color: onlyNeutered ? '#FF7F6B' : 'var(--text)',
              }}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{lang === 'vi' ? 'Đã triệt sản' : 'Neutered'}</span>
            </button>

            <button
              type="button"
              onClick={() => setOnlyLiked((prev) => !prev)}
              className="h-8 px-3 rounded-full text-xs font-bold border inline-flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
              style={{
                backgroundColor: onlyLiked ? '#FFF0EE' : 'var(--surface)',
                borderColor: onlyLiked ? '#FF7F6B' : 'var(--border)',
                color: onlyLiked ? '#FF7F6B' : 'var(--text)',
              }}
            >
              <Heart className={`w-3.5 h-3.5 ${onlyLiked ? 'fill-[#FF7F6B]' : ''}`} />
              <span>{lang === 'vi' ? 'Bé đã lưu' : 'Saved'} ({likedPetIds.length})</span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                data-testid="adopt-reset-filters-btn"
                onClick={handleResetFilters}
                className="h-8 px-3 rounded-full text-xs font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
                style={{ color: '#FF7F6B' }}
              >
                <RotateCcw className="w-3 h-3" />
                <span>{lang === 'vi' ? 'Xóa lọc' : 'Reset'}</span>
              </button>
            )}
          </div>
        </section>

        {/* 4. PET CARDS GRID */}
        {isLoading ? (
          <AdoptionSkeletonGrid count={6} />
        ) : filteredPets.length === 0 ? (
          <AdoptionEmptyState lang={lang} onResetFilter={handleResetFilters} />
        ) : (
          <div
            data-testid="adopt-page-cards-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-[1920px]:grid-cols-4 gap-6 items-stretch"
          >
            {filteredPets.map((pet) => {
              const matchResult = matchScoresMap.get(pet.id);
              const matchScore = matchResult?.score;
              const matchReason =
                lang === 'vi'
                  ? matchResult?.matchReasonsVi.join(' · ')
                  : matchResult?.matchReasonsEn.join(' · ');

              return (
                <AdoptionPetCard
                  key={pet.id}
                  pet={pet}
                  lang={lang}
                  isLiked={likedPetIds.includes(pet.id)}
                  onToggleLike={handleToggleLike}
                  onOpenProfile={(p) => navigateToSlug(p.slug)}
                  onOpenAdoptForm={(p) => handleOpenApply(p.slug)}
                  matchScore={matchScore}
                  matchReason={matchReason}
                />
              );
            })}
          </div>
        )}

        <AdoptionInfoAndRequestsSection
          lang={lang}
          adoptionRequests={adoptionRequests}
          processSectionRef={processSectionRef}
        />
      </div>
    </div>
  );
};
