import React from 'react';
import { PawPrint, ShoppingBag } from 'lucide-react';
import { CartItem, Language, Product } from '@/types';
import { handleSpaLinkClick } from '@/utils/spaNavigation';
import { SavedForLaterSection } from './SavedForLaterSection';
import { CartRecommendedGrid } from './CartRecommendedGrid';

interface CartEmptyStateProps {
  lang: Language;
  savedForLater: CartItem[];
  products: Product[];
  featuredProducts: Product[];
  addedItemIds: Record<string, boolean>;
  wishlistedIds: Record<string, boolean>;
  onMoveSavedToCart: (item: CartItem) => void;
  onRemoveSavedItem: (itemKey: string) => void;
  onToggleWishlist: (productId: string) => void;
  onAddToCartClick: (product: Product) => void;
  onBuyNowClick: (product: Product) => void;
  onOpenProductDetail: (slug: string) => void;
  onNavigateUrl: (path: string) => void;
}

export const CartEmptyState = ({
  lang,
  savedForLater,
  products,
  featuredProducts,
  addedItemIds,
  wishlistedIds,
  onMoveSavedToCart,
  onRemoveSavedItem,
  onToggleWishlist,
  onAddToCartClick,
  onBuyNowClick,
  onOpenProductDetail,
  onNavigateUrl,
}: CartEmptyStateProps) => {
  return (
    <div className="space-y-10">
      <div
        data-testid="cart-page-empty-state"
        className="rounded-[24px] border p-8 sm:p-14 text-center max-w-2xl mx-auto space-y-5"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div
          className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
          style={{
            backgroundColor: 'var(--surface-2)',
            color: 'var(--primary)',
          }}
        >
          <PawPrint className="w-10 h-10" />
        </div>
        <h2
          className="font-heading text-2xl sm:text-3xl font-extrabold"
          style={{ color: 'var(--primary)' }}
        >
          {lang === 'vi'
            ? 'Giỏ hàng của bạn đang trống'
            : 'Your cart is empty'}
        </h2>
        <p
          className="text-sm sm:text-base max-w-md mx-auto font-medium"
          style={{ color: 'var(--text-muted)' }}
        >
          {lang === 'vi'
            ? 'Khám phá hạt hữu cơ, pate tươi, đồ chơi an toàn và sản phẩm chăm sóc sức khỏe cho các bé thú cưng tại Animora.'
            : 'Discover organic kibble, fresh wet food, safe toys, and veterinary care essentials for your beloved pets.'}
        </p>
        <div className="pt-2">
          <a
            href="/cua-hang"
            data-testid="empty-cart-explore-btn"
            onClick={(e) => handleSpaLinkClick(e, '/cua-hang', onNavigateUrl)}
            className="btn-primary min-h-[48px] px-8 py-3 rounded-full text-base font-bold inline-flex items-center justify-center gap-2 shadow-md focus-visible:outline-2 focus-visible:outline-[#FF7F6B] cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>
              {lang === 'vi' ? 'Khám phá cửa hàng' : 'Explore shop'}
            </span>
          </a>
        </div>
      </div>

      <SavedForLaterSection
        lang={lang}
        savedForLater={savedForLater}
        products={products}
        onMoveSavedToCart={onMoveSavedToCart}
        onRemoveSavedItem={onRemoveSavedItem}
        onNavigateUrl={onNavigateUrl}
      />

      <CartRecommendedGrid
        lang={lang}
        products={featuredProducts}
        variant="featured"
        addedItemIds={addedItemIds}
        wishlistedIds={wishlistedIds}
        onToggleWishlist={onToggleWishlist}
        onAddToCartClick={onAddToCartClick}
        onBuyNowClick={onBuyNowClick}
        onOpenProductDetail={onOpenProductDetail}
      />
    </div>
  );
};

