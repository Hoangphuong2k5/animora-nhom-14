import React from 'react';
import { Sparkles } from 'lucide-react';
import { Language, Product } from '@/types';
import { ProductCard } from '../ShopPage';

interface CartRecommendedGridProps {
  lang: Language;
  products: Product[];
  variant: 'featured' | 'related';
  addedItemIds: Record<string, boolean>;
  wishlistedIds: Record<string, boolean>;
  onToggleWishlist: (productId: string) => void;
  onAddToCartClick: (product: Product) => void;
  onBuyNowClick: (product: Product) => void;
  onOpenProductDetail: (slug: string) => void;
}

export const CartRecommendedGrid = ({
  lang,
  products,
  variant,
  addedItemIds,
  wishlistedIds,
  onToggleWishlist,
  onAddToCartClick,
  onBuyNowClick,
  onOpenProductDetail,
}: CartRecommendedGridProps) => {
  if (products.length === 0) return null;

  const isFeatured = variant === 'featured';
  const headingId = isFeatured
    ? 'empty-cart-featured-heading'
    : 'cart-recommendations-heading';

  return (
    <section
      data-testid={isFeatured ? undefined : 'cart-you-may-also-like'}
      aria-labelledby={headingId}
      className={isFeatured ? 'space-y-5' : 'pt-4 space-y-5'}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {!isFeatured && (
            <Sparkles className="w-5 h-5" style={{ color: 'var(--primary)' }} />
          )}
          <h2
            id={headingId}
            className="font-heading text-2xl sm:text-3xl font-extrabold"
            style={{ color: 'var(--primary)' }}
          >
            {isFeatured
              ? lang === 'vi'
                ? 'Sản phẩm nổi bật'
                : 'Featured products'
              : lang === 'vi'
              ? 'Có thể bạn cũng thích'
              : 'You may also like'}
          </h2>
        </div>
      </div>

      <div
        className={
          isFeatured
            ? 'grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'
            : 'grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5'
        }
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            lang={lang}
            isAdded={Boolean(addedItemIds[product.id])}
            isWishlisted={Boolean(wishlistedIds[product.id])}
            onToggleWishlist={onToggleWishlist}
            onAddToCartClick={onAddToCartClick}
            onBuyNowClick={onBuyNowClick}
            onOpenProductDetail={onOpenProductDetail}
          />
        ))}
      </div>
    </section>
  );
};

