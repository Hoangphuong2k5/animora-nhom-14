import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Language, Product, ProductCategory, PageId, Pet, ShopPetGroup } from '@/types';
import {
  SHOP_PRODUCTS,
  normalizeViText,
  mapSpeciesToShopPetGroup,
  parsePetAgeStage,
} from '@/data/shopData';
import { safeGetStorage, safeSetStorage } from '@/utils/cartLogic';
import { ProductCard, PawPlaceholderSVG } from './views/ProductCard';
import { ProductDetailView } from './views/ProductDetailView';
import { ShopHeroAndToolbar, SortOption } from './views/ShopHeroAndToolbar';

export { ProductCard } from './views/ProductCard';
export type { ProductCardProps } from './views/ProductCard';

interface ShopPageProps {
  lang: Language;
  products: Product[];
  pets?: Pet[];
  onAddToCart: (product: Product, quantity?: number, selectedSpec?: string) => void;
  onBuyNow?: (product: Product, quantity?: number, selectedSpec?: string) => void;
  onOpenCart: () => void;
  cartCount: number;
  onNavigate: (page: PageId) => void;
}

function getShopSlugFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/cua-hang\/([^/?#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export const ShopPage = ({
  lang,
  products: propProducts,
  pets = [],
  onAddToCart,
  onBuyNow,
  onOpenCart,
  onNavigate,
}: ShopPageProps) => {
  const catalogProducts = useMemo(() => {
    return propProducts.length >= SHOP_PRODUCTS.length ? propProducts : SHOP_PRODUCTS;
  }, [propProducts]);

  // URL slug state for /cua-hang/{slug}
  const [selectedSlug, setSelectedSlug] = useState<string | null>(() =>
    typeof window !== 'undefined' ? getShopSlugFromPath(window.location.pathname) : null
  );

  useEffect(() => {
    const handlePopState = () => {
      setSelectedSlug(getShopSlugFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToProductSlug = (slug: string | null) => {
    const nextUrl = slug ? `/cua-hang/${slug}` : '/cua-hang';
    if (window.location.pathname !== nextUrl) {
      window.history.pushState({}, '', nextUrl);
    }
    setSelectedSlug(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter & Search States
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [activePetGroup, setActivePetGroup] = useState<ShopPetGroup | 'all'>('all');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [onlyOnSale, setOnlyOnSale] = useState(false);

  const sortItems = useMemo<Record<SortOption, string>>(
    () => ({
      popular: lang === 'vi' ? 'Phổ biến nhất' : 'Most popular',
      'price-asc': lang === 'vi' ? 'Giá thấp đến cao' : 'Price: Low to high',
      'price-desc': lang === 'vi' ? 'Giá cao đến thấp' : 'Price: High to low',
      newest: lang === 'vi' ? 'Mới nhất' : 'Newest',
      discount: lang === 'vi' ? 'Giảm giá nhiều nhất' : 'Biggest discount',
    }),
    [lang]
  );

  // Pagination ("Xem thêm" loads 12 at a time)
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Wishlist & Add-to-cart feedback states
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [wishlistedIds, setWishlistedIds] = useState<Record<string, boolean>>(() =>
    safeGetStorage<Record<string, boolean>>('animora_wishlist', {})
  );

  // Pet profile recommendation state
  const [selectedPetId, setSelectedPetId] = useState<string>(() =>
    pets.length > 0 ? pets[0].id : ''
  );

  useEffect(() => {
    if (pets.length > 0 && !pets.some((p) => p.id === selectedPetId)) {
      setSelectedPetId(pets[0].id);
    }
  }, [pets, selectedPetId]);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchInput);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  // Sync wishlist to localStorage
  useEffect(() => {
    safeSetStorage('animora_wishlist', wishlistedIds);
  }, [wishlistedIds]);

  const gridSectionRef = useRef<HTMLDivElement>(null);

  const toggleWishlist = (productId: string) => {
    setWishlistedIds((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleAddProduct = (product: Product, quantity = 1, customSpec?: string) => {
    onAddToCart(product, quantity, customSpec);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    window.setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
    onOpenCart();
  };

  const handleBuyNowProduct = (product: Product, quantity = 1, customSpec?: string) => {
    if (onBuyNow) {
      onBuyNow(product, quantity, customSpec);
    } else {
      onAddToCart(product, quantity, customSpec);
      onNavigate('checkout');
    }
  };

  // Active Pet Profile for Recommendation (Section 7)
  const activePetProfile = useMemo(
    () => (pets.length > 0 ? pets.find((p) => p.id === selectedPetId) || pets[0] : null),
    [pets, selectedPetId]
  );

  const recommendedProductsForPet = useMemo(() => {
    if (!activePetProfile) return [];
    const targetGroup = mapSpeciesToShopPetGroup(activePetProfile.species);
    const targetAge = parsePetAgeStage(activePetProfile.age);
    const matches = catalogProducts.filter((prod) => {
      const matchesSpecies = prod.petTypes?.includes(targetGroup);
      const matchesAge =
        !prod.recommendedAges || prod.recommendedAges.includes(targetAge);
      return matchesSpecies && matchesAge && (prod.stock ?? 1) > 0;
    });
    if (matches.length >= 4) return matches.slice(0, 4);
    const fallback = catalogProducts.filter(
      (prod) => !matches.some((m) => m.id === prod.id) && (prod.stock ?? 1) > 0
    );
    return [...matches, ...fallback].slice(0, 4);
  }, [activePetProfile, catalogProducts]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    const normQuery = normalizeViText(debouncedQuery);

    return catalogProducts
      .filter((prod) => {
        if (activeCategory !== 'all' && prod.category !== activeCategory) return false;
        if (
          activePetGroup !== 'all' &&
          (!prod.petTypes || !prod.petTypes.includes(activePetGroup))
        ) {
          return false;
        }
        if (onlyOnSale) {
          const hasDiscount =
            (prod.discountPercent && prod.discountPercent > 0) ||
            (prod.oldPrice && prod.oldPrice > prod.price);
          if (!hasDiscount) return false;
        }
        if (normQuery) {
          const searchable = normalizeViText(
            `${prod.name} ${prod.nameEn || ''} ${prod.brand || ''} ${prod.description}`
          );
          if (!searchable.includes(normQuery)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'newest') return (b.createdAtOrder ?? 0) - (a.createdAtOrder ?? 0);
        if (sortBy === 'discount') return (b.discountPercent ?? 0) - (a.discountPercent ?? 0);
        const popA = (a.reviewCount ?? 10) * a.rating;
        const popB = (b.reviewCount ?? 10) * b.rating;
        return popB - popA;
      });
  }, [catalogProducts, activeCategory, activePetGroup, onlyOnSale, debouncedQuery, sortBy]);

  const clearAllFilters = () => {
    setActiveCategory('all');
    setActivePetGroup('all');
    setOnlyOnSale(false);
    setSearchInput('');
    setDebouncedQuery('');
    setSortBy('popular');
  };

  const hasAnyActiveFilter =
    activeCategory !== 'all' ||
    activePetGroup !== 'all' ||
    onlyOnSale ||
    debouncedQuery.trim() !== '';

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    window.setTimeout(() => {
      setVisibleCount((prev) => prev + 12);
      setIsLoadingMore(false);
    }, 450);
  };

  // VIEW 1: PRODUCT DETAIL PAGE (/cua-hang/{slug})
  if (selectedSlug) {
    return (
      <ProductDetailView
        lang={lang}
        selectedSlug={selectedSlug}
        catalogProducts={catalogProducts}
        addedIds={addedIds}
        wishlistedIds={wishlistedIds}
        onToggleWishlist={toggleWishlist}
        onAddProduct={handleAddProduct}
        onBuyNowProduct={handleBuyNowProduct}
        onNavigateToProductSlug={navigateToProductSlug}
      />
    );
  }

  // VIEW 2: MAIN SHOP PAGE (/cua-hang)
  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMoreProducts = visibleCount < filteredProducts.length;

  return (
    <div className="pt-24 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <ShopHeroAndToolbar
          lang={lang}
          gridSectionRef={gridSectionRef}
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          onClearSearch={() => {
            setSearchInput('');
            setDebouncedQuery('');
          }}
          debouncedQuery={debouncedQuery}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortItems={sortItems}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          activePetGroup={activePetGroup}
          onPetGroupChange={setActivePetGroup}
          onlyOnSale={onlyOnSale}
          onOnlyOnSaleChange={setOnlyOnSale}
          filteredCount={filteredProducts.length}
          hasAnyActiveFilter={hasAnyActiveFilter}
          onClearAllFilters={clearAllFilters}
          onShopDeals={() => {
            setOnlyOnSale(true);
            setActiveCategory('all');
            gridSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
          }}
          pets={pets}
          activePetProfile={activePetProfile}
          onSelectPetId={setSelectedPetId}
          recommendedProductsForPet={recommendedProductsForPet}
          addedIds={addedIds}
          wishlistedIds={wishlistedIds}
          onToggleWishlist={toggleWishlist}
          onAddProduct={handleAddProduct}
          onBuyNowProduct={handleBuyNowProduct}
          onNavigateToProductSlug={navigateToProductSlug}
        >
          {filteredProducts.length === 0 ? (
            <div
              className="rounded-3xl border py-16 px-6 text-center space-y-4"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                style={{ backgroundColor: 'var(--surface-2)', color: 'var(--primary)' }}
              >
                <PawPlaceholderSVG className="w-10 h-10" />
              </div>
              <h3 className="font-heading text-xl font-bold" style={{ color: 'var(--text)' }}>
                {lang === 'vi' ? 'Không tìm thấy sản phẩm phù hợp' : 'No matching products found'}
              </h3>
              <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                {lang === 'vi'
                  ? 'Hãy thử điều chỉnh từ khóa hoặc xóa bớt bộ lọc để xem thêm các sản phẩm khác.'
                  : 'Try adjusting your search keywords or clearing active filters.'}
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="btn-primary px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold cursor-pointer"
                >
                  {lang === 'vi' ? 'Xóa bộ lọc' : 'Clear filters'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    lang={lang}
                    isAdded={Boolean(addedIds[product.id])}
                    isWishlisted={Boolean(wishlistedIds[product.id])}
                    onToggleWishlist={toggleWishlist}
                    onAddToCartClick={(p) => handleAddProduct(p, 1)}
                    onBuyNowClick={(p) => handleBuyNowProduct(p, 1)}
                    onOpenProductDetail={(slug) => navigateToProductSlug(slug)}
                  />
                ))}

                {isLoadingMore &&
                  [...Array(4)].map((_, idx) => (
                    <div
                      key={`skeleton-${idx}`}
                      className="rounded-[20px] border p-4 space-y-3 animate-pulse"
                      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                    >
                      <div className="aspect-square w-full rounded-2xl" style={{ backgroundColor: 'var(--surface-2)' }} />
                      <div className="h-4 w-4/5 rounded-full" style={{ backgroundColor: 'var(--surface-2)' }} />
                      <div className="h-3 w-1/3 rounded-full" style={{ backgroundColor: 'var(--surface-2)' }} />
                      <div className="h-5 w-1/2 rounded-full" style={{ backgroundColor: 'var(--surface-2)' }} />
                      <div className="h-11 w-full rounded-full" style={{ backgroundColor: 'var(--surface-2)' }} />
                    </div>
                  ))}
              </div>

              {hasMoreProducts && (
                <div className="pt-4 text-center">
                  <button
                    type="button"
                    disabled={isLoadingMore}
                    onClick={handleLoadMore}
                    className="btn-secondary px-8 py-3 rounded-full text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>
                      {isLoadingMore
                        ? lang === 'vi'
                          ? 'Đang tải thêm...'
                          : 'Loading...'
                        : lang === 'vi'
                        ? `Xem thêm (${filteredProducts.length - visibleCount} sản phẩm)`
                        : `Load more (${filteredProducts.length - visibleCount} products)`}
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </ShopHeroAndToolbar>
      </div>
    </div>
  );
};
