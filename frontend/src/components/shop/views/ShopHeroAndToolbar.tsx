import React from 'react';
import {
  Search,
  Truck,
  ShieldCheck,
  RefreshCw,
  CreditCard,
  X,
  ArrowRight,
  Dog,
  Cat,
  Rabbit,
  Bird,
  Fish,
  PawPrint,
} from 'lucide-react';
import { Language, Pet, Product, ProductCategory, ShopPetGroup } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProductCard } from './ProductCard';

export type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'newest' | 'discount';

export const CATEGORY_LABELS: Record<ProductCategory | 'all', { vi: string; en: string }> = {
  all: { vi: 'Tất cả', en: 'All' },
  food: { vi: 'Đồ ăn', en: 'Food' },
  toys: { vi: 'Đồ chơi', en: 'Toys' },
  accessories: { vi: 'Phụ kiện', en: 'Accessories' },
  care: { vi: 'Chăm sóc', en: 'Care' },
  medicine: { vi: 'Thuốc (Theo đơn BS)', en: 'Rx Medicine' },
};

const PET_GROUP_OPTIONS: {
  id: ShopPetGroup | 'all';
  labelVi: string;
  labelEn: string;
  icon: React.ReactNode;
}[] = [
  { id: 'all', labelVi: 'Tất cả', labelEn: 'All', icon: <PawPrint className="w-3.5 h-3.5" /> },
  { id: 'dog', labelVi: 'Chó', labelEn: 'Dogs', icon: <Dog className="w-3.5 h-3.5" /> },
  { id: 'cat', labelVi: 'Mèo', labelEn: 'Cats', icon: <Cat className="w-3.5 h-3.5" /> },
  {
    id: 'rabbit_rodent',
    labelVi: 'Thỏ & chuột',
    labelEn: 'Rabbits & rodents',
    icon: <Rabbit className="w-3.5 h-3.5" />,
  },
  { id: 'bird', labelVi: 'Chim', labelEn: 'Birds', icon: <Bird className="w-3.5 h-3.5" /> },
  {
    id: 'fish_reptile',
    labelVi: 'Cá & bò sát',
    labelEn: 'Fish & reptiles',
    icon: <Fish className="w-3.5 h-3.5" />,
  },
];

export interface ShopHeroAndToolbarProps {
  lang: Language;
  gridSectionRef: React.RefObject<HTMLDivElement | null>;
  searchInput: string;
  onSearchInputChange: (val: string) => void;
  onClearSearch: () => void;
  debouncedQuery: string;
  sortBy: SortOption;
  onSortByChange: (val: SortOption) => void;
  sortItems: Record<SortOption, string>;
  activeCategory: ProductCategory | 'all';
  onCategoryChange: (cat: ProductCategory | 'all') => void;
  activePetGroup: ShopPetGroup | 'all';
  onPetGroupChange: (group: ShopPetGroup | 'all') => void;
  onlyOnSale: boolean;
  onOnlyOnSaleChange: (val: boolean) => void;
  filteredCount: number;
  hasAnyActiveFilter: boolean;
  onClearAllFilters: () => void;
  onShopDeals: () => void;
  pets: Pet[];
  activePetProfile: Pet | null;
  onSelectPetId: (id: string) => void;
  recommendedProductsForPet: Product[];
  addedIds: Record<string, boolean>;
  wishlistedIds: Record<string, boolean>;
  onToggleWishlist: (productId: string) => void;
  onAddProduct: (product: Product, quantity?: number) => void;
  onBuyNowProduct: (product: Product, quantity?: number) => void;
  onNavigateToProductSlug: (slug: string | null) => void;
  children: React.ReactNode;
}

export const ShopHeroAndToolbar = ({
  lang,
  gridSectionRef,
  searchInput,
  onSearchInputChange,
  onClearSearch,
  debouncedQuery,
  sortBy,
  onSortByChange,
  sortItems,
  activeCategory,
  onCategoryChange,
  activePetGroup,
  onPetGroupChange,
  onlyOnSale,
  onOnlyOnSaleChange,
  filteredCount,
  hasAnyActiveFilter,
  onClearAllFilters,
  onShopDeals,
  pets,
  activePetProfile,
  onSelectPetId,
  recommendedProductsForPet,
  addedIds,
  wishlistedIds,
  onToggleWishlist,
  onAddProduct,
  onBuyNowProduct,
  onNavigateToProductSlug,
  children,
}: ShopHeroAndToolbarProps) => {
  return (
    <>
      {/* ================================================================= */}
      {/* 1. PAGE HEADER (Eyebrow + H1 "Cửa hàng cho bé cưng" + Subtitle)   */}
      {/* ================================================================= */}
      <div className="space-y-2.5 max-w-3xl">
        <span
          data-testid="shop-page-eyebrow"
          className="block uppercase font-bold"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: 'var(--primary)',
          }}
        >
          {lang === 'vi' ? 'CỬA HÀNG THÚ CƯNG' : 'PET SHOP'}
        </span>
        <h1
          data-testid="shop-page-title"
          className="font-heading font-extrabold leading-[1.14] tracking-[-0.02em]"
          style={{
            fontSize: 'clamp(32px, 4vw, 48px)',
            color: 'var(--primary)',
          }}
        >
          {lang === 'vi' ? 'Cửa hàng cho bé cưng' : 'Shop for your pet'}
        </h1>
        <p
          data-testid="shop-page-subtitle"
          className="text-[18px] leading-relaxed font-normal text-pretty"
          style={{ color: 'var(--text-muted)' }}
        >
          {lang === 'vi'
            ? 'Thức ăn hữu cơ, đồ chơi và phụ kiện an toàn được tuyển chọn bởi đội ngũ bác sĩ thú y.'
            : 'Organic food, toys, and safe accessories curated by the Animora veterinary team.'}
        </p>
      </div>

      {/* ================================================================= */}
      {/* 2. COMPACT PROMO BANNER (~156px height on desktop)                */}
      {/* ================================================================= */}
      <div
        className="relative rounded-3xl overflow-hidden border shadow-xs lg:h-[156px] flex items-center"
        style={{
          background:
            'linear-gradient(95deg, var(--surface-2) 0%, var(--surface) 52%, color-mix(in srgb, var(--pink) 35%, var(--surface)) 100%)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 items-center px-5 sm:px-7 py-3.5 gap-4">
          <div className="lg:col-span-8 flex items-center gap-4">
            <div
              aria-hidden="true"
              className="hidden sm:flex w-13 h-13 rounded-2xl items-center justify-center shrink-0"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--on-primary)',
              }}
            >
              <PawPrint className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <span
                className="block text-[11px] font-extrabold uppercase tracking-[0.16em]"
                style={{ color: 'var(--primary)' }}
              >
                {lang === 'vi' ? 'ƯU ĐÃI ĐẶC BIỆT' : 'SPECIAL OFFER'}
              </span>
              <h2
                className="font-heading text-lg sm:text-xl lg:text-2xl font-extrabold leading-tight"
                style={{ color: 'var(--primary)' }}
              >
                {lang === 'vi'
                  ? 'Giảm đến 30% sản phẩm thiết yếu tuyển chọn'
                  : 'Up to 30% off selected pet essentials'}
              </h2>
              <div className="pt-0.5">
                <button
                  type="button"
                  data-testid="promo-shop-deals-btn"
                  onClick={onShopDeals}
                  className="btn-primary px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>{lang === 'vi' ? 'Săn ưu đãi' : 'Shop deals'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex items-center justify-center lg:justify-end">
            <div
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border p-2 flex items-center justify-center"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--surface-2) 60%, var(--surface))',
                borderColor: 'var(--border)',
              }}
            >
              <img
                loading="lazy"
                decoding="async"
                src="/assets/products/nutripet-organic-2kg.png"
                alt={
                  lang === 'vi'
                    ? 'Hạt NutriPet hữu cơ đa loài (2kg)'
                    : 'NutriPet organic multi-species kibble (2kg)'
                }
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 5. SHORTER 2-ROW STICKY TOOLBAR & PRODUCT GRID                    */}
      {/* ================================================================= */}
      <div ref={gridSectionRef} id="shop-products-grid" className="space-y-4">
        {/* Sticky 2-Row Glass Toolbar */}
        <div
          className="sticky top-[var(--nav-h)] z-30 glass-card rounded-2xl px-4 py-2.5 border space-y-2"
          style={{ borderColor: 'var(--border)' }}
        >
          {/* Row 1: Title on left; Search, Sort dropdown, and "Bộ lọc" button on right */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
            <h2
              className="font-heading text-xl sm:text-2xl font-extrabold leading-tight shrink-0"
              style={{ color: 'var(--primary)' }}
            >
              {lang === 'vi' ? 'Sản phẩm nổi bật' : 'Featured products'}
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search Box (300ms debounced + clear ×) */}
              <div className="relative flex-1 sm:w-60 min-w-[190px]">
                <Search
                  className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => onSearchInputChange(e.target.value)}
                  placeholder={
                    lang === 'vi'
                      ? 'Tìm theo tên, thương hiệu...'
                      : 'Search name, brand...'
                  }
                  aria-label={lang === 'vi' ? 'Tìm kiếm sản phẩm' : 'Search products'}
                  className="w-full h-9.5 pl-9 pr-8 rounded-full text-xs sm:text-sm border focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={onClearSearch}
                    aria-label={lang === 'vi' ? 'Xóa từ khóa tìm kiếm' : 'Clear search'}
                    className="w-6 h-6 rounded-full flex items-center justify-center absolute right-1.5 top-1/2 -translate-y-1/2 hover:bg-[var(--surface-2)] cursor-pointer"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <Select
                items={sortItems}
                value={sortBy}
                onValueChange={(val) => {
                  if (val !== null) onSortByChange(val as SortOption);
                }}
              >
                <SelectTrigger
                  aria-label={lang === 'vi' ? 'Sắp xếp sản phẩm' : 'Sort products'}
                  className="h-10! px-3.5 rounded-full text-xs sm:text-sm font-bold border focus-visible:ring-2 focus-visible:ring-[#FF7F6B] cursor-pointer"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">
                    {lang === 'vi' ? 'Phổ biến nhất' : 'Most popular'}
                  </SelectItem>
                  <SelectItem value="price-asc">
                    {lang === 'vi' ? 'Giá thấp đến cao' : 'Price: Low to high'}
                  </SelectItem>
                  <SelectItem value="price-desc">
                    {lang === 'vi' ? 'Giá cao đến thấp' : 'Price: High to low'}
                  </SelectItem>
                  <SelectItem value="newest">
                    {lang === 'vi' ? 'Mới nhất' : 'Newest'}
                  </SelectItem>
                  <SelectItem value="discount">
                    {lang === 'vi' ? 'Giảm giá nhiều nhất' : 'Biggest discount'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Single horizontally scrollable row with Category Pills | Divider | Pet-type icon chips with active underline | Result count on far right */}
          <div
            className="flex items-center flex-nowrap overflow-x-auto gap-1.5 pt-0.5"
            style={{ scrollbarWidth: 'none' }}
          >
            {/* Category Chips (filled/outlined pills) */}
            {(['all', 'food', 'toys', 'accessories', 'care', 'medicine'] as const).map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onCategoryChange(cat)}
                  className="h-8 px-3.5 rounded-full text-[13px] font-bold whitespace-nowrap shrink-0 border transition-all focus-visible:outline-2 focus-visible:outline-[#FF7F6B] cursor-pointer"
                  style={{
                    backgroundColor: active ? 'var(--primary)' : 'var(--surface)',
                    color: active ? 'var(--on-primary)' : 'var(--text)',
                    borderColor: active ? 'var(--primary)' : 'var(--border)',
                  }}
                >
                  {CATEGORY_LABELS[cat][lang === 'vi' ? 'vi' : 'en']}
                </button>
              );
            })}

            {/* Thin Vertical Divider */}
            <div
              aria-hidden="true"
              className="w-px h-5 shrink-0 mx-1.5"
              style={{ backgroundColor: 'var(--border)' }}
            />

            {/* Pet-type chips (smaller, icon + subtle underline when active) */}
            {PET_GROUP_OPTIONS.map((petOpt) => {
              const active = activePetGroup === petOpt.id;
              return (
                <button
                  key={petOpt.id}
                  type="button"
                  onClick={() => onPetGroupChange(petOpt.id)}
                  className="h-8 px-2.5 text-[13px] font-bold whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 border-b-2 transition-all focus-visible:outline-2 focus-visible:outline-[#FF7F6B] cursor-pointer"
                  style={{
                    borderColor: active ? 'var(--primary)' : 'transparent',
                    color: active ? 'var(--primary)' : 'var(--text-muted)',
                    backgroundColor: 'transparent',
                  }}
                >
                  {petOpt.icon}
                  <span>{lang === 'vi' ? petOpt.labelVi : petOpt.labelEn}</span>
                </button>
              );
            })}

            {/* Far right result count: "16 sản phẩm" (13px, --text-muted) */}
            <span
              className="ml-auto pl-3 text-[13px] font-semibold whitespace-nowrap shrink-0"
              style={{ color: 'var(--text-muted)' }}
            >
              {lang === 'vi'
                ? `${filteredCount} sản phẩm`
                : `${filteredCount} products`}
            </span>
          </div>
        </div>

        {/* Removable Active Filter Chips under the toolbar ONLY when at least one is active */}
        {hasAnyActiveFilter && (
          <div className="flex flex-wrap items-center gap-2 px-1">
            {activeCategory !== 'all' && (
              <button
                type="button"
                onClick={() => onCategoryChange('all')}
                className="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border cursor-pointer"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--primary)',
                }}
              >
                <span>{CATEGORY_LABELS[activeCategory][lang === 'vi' ? 'vi' : 'en']}</span>
                <X className="w-3 h-3" />
              </button>
            )}

            {activePetGroup !== 'all' && (
              <button
                type="button"
                onClick={() => onPetGroupChange('all')}
                className="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border cursor-pointer"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--primary)',
                }}
              >
                <span>
                  {
                    PET_GROUP_OPTIONS.find((p) => p.id === activePetGroup)?.[
                      lang === 'vi' ? 'labelVi' : 'labelEn'
                    ]
                  }
                </span>
                <X className="w-3 h-3" />
              </button>
            )}

            {onlyOnSale && (
              <button
                type="button"
                onClick={() => onOnlyOnSaleChange(false)}
                className="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border cursor-pointer"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--primary)',
                }}
              >
                <span>{lang === 'vi' ? 'Đang giảm giá' : 'On sale'}</span>
                <X className="w-3 h-3" />
              </button>
            )}

            {debouncedQuery.trim() !== '' && (
              <button
                type="button"
                onClick={onClearSearch}
                className="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border cursor-pointer"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--primary)',
                }}
              >
                <span>"{debouncedQuery}"</span>
                <X className="w-3 h-3" />
              </button>
            )}

            <button
              type="button"
              onClick={onClearAllFilters}
              className="text-xs font-extrabold underline ml-1 focus-visible:outline-2 focus-visible:outline-[#FF7F6B] rounded-xs cursor-pointer"
              style={{ color: 'var(--primary)' }}
            >
              {lang === 'vi' ? 'Xóa tất cả' : 'Clear all'}
            </button>
          </div>
        )}

        {/* =============================================================== */}
        {/* 7. PET-PROFILE SUGGESTIONS IN A DEDICATED ROW ABOVE THE GRID    */}
        {/* =============================================================== */}
        {pets.length > 0 && activePetProfile && recommendedProductsForPet.length > 0 && (
          <section
            aria-label={
              lang === 'vi'
                ? `Gợi ý cho ${activePetProfile.name}`
                : `Suggested for ${activePetProfile.name}`
            }
            className="space-y-3 pt-1 pb-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    color: 'var(--primary)',
                  }}
                >
                  <PawPrint className="w-4 h-4" />
                </span>
                <h3
                  className="font-heading text-lg sm:text-xl font-extrabold"
                  style={{ color: 'var(--primary)' }}
                >
                  {lang === 'vi'
                    ? `Gợi ý cho ${activePetProfile.name}`
                    : `Suggested for ${activePetProfile.name}`}
                </h3>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    color: 'var(--primary)',
                  }}
                >
                  {activePetProfile.species} • {activePetProfile.age}
                </span>
              </div>

              {pets.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {pets.map((petItem) => {
                    const active = petItem.id === activePetProfile.id;
                    return (
                      <button
                        key={petItem.id}
                        type="button"
                        onClick={() => onSelectPetId(petItem.id)}
                        className="px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap transition-all focus-visible:outline-2 focus-visible:outline-[#FF7F6B] cursor-pointer"
                        style={{
                          backgroundColor: active ? 'var(--primary)' : 'var(--surface)',
                          color: active ? 'var(--on-primary)' : 'var(--text)',
                          borderColor: active ? 'var(--primary)' : 'var(--border)',
                        }}
                      >
                        {petItem.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Horizontally scrollable strip on mobile, 4-column grid on desktop */}
            <div
              className="flex lg:grid lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto lg:overflow-visible snap-x snap-mandatory pb-1"
              style={{ scrollbarWidth: 'none' }}
            >
              {recommendedProductsForPet.map((prod) => (
                <div
                  key={`rec-${prod.id}`}
                  className="w-[265px] sm:w-[285px] lg:w-auto shrink-0 snap-start"
                >
                  <ProductCard
                    product={prod}
                    lang={lang}
                    isAdded={Boolean(addedIds[prod.id])}
                    isWishlisted={Boolean(wishlistedIds[prod.id])}
                    onToggleWishlist={onToggleWishlist}
                    onAddToCartClick={(p) => onAddProduct(p, 1)}
                    onBuyNowClick={(p) => onBuyNowProduct(p, 1)}
                    onOpenProductDetail={(slug) => onNavigateToProductSlug(slug)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {children}
      </div>

      {/* ================================================================= */}
      {/* 6. TRUST ROW (4 items, 2x2 grid on mobile)                        */}
      {/* ================================================================= */}
      <div
        className="rounded-3xl border p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        {[
          {
            icon: <Truck className="w-6 h-6" />,
            titleVi: 'Giao nhanh trong ngày',
            titleEn: 'Same-day delivery',
            descVi: 'Nội thành TP.HCM trong 2 giờ',
            descEn: 'Within 2 hours in HCMC',
          },
          {
            icon: <RefreshCw className="w-6 h-6" />,
            titleVi: 'Đổi trả trong 7 ngày',
            titleEn: '7-day easy returns',
            descVi: 'Hỗ trợ đổi mới tận nơi miễn phí',
            descEn: 'Free doorstep exchange',
          },
          {
            icon: <ShieldCheck className="w-6 h-6" />,
            titleVi: 'Hàng chính hãng',
            titleEn: '100% authentic',
            descVi: 'Kiểm định bởi bác sĩ thú y Animora',
            descEn: 'Verified by Animora veterinarians',
          },
          {
            icon: <CreditCard className="w-6 h-6" />,
            titleVi: 'Thanh toán khi nhận hàng',
            titleEn: 'Cash on delivery',
            descVi: 'Kiểm tra hàng trước khi thanh toán',
            descEn: 'Inspect your order upon arrival',
          },
        ].map((item, idx) => (
          <div key={idx} className="flex items-start gap-3.5">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'var(--surface-2)',
                color: 'var(--primary)',
              }}
            >
              {item.icon}
            </div>
            <div>
              <h3
                className="font-heading text-sm sm:text-base font-bold leading-snug"
                style={{ color: 'var(--text)' }}
              >
                {lang === 'vi' ? item.titleVi : item.titleEn}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {lang === 'vi' ? item.descVi : item.descEn}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
