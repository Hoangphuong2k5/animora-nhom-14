import React, { useState } from 'react';
import { ShoppingBag, Star, Heart } from 'lucide-react';
import { Language, Product } from '@/types';
import { formatVndPrice } from '@/data/shopData';

export const PawPlaceholderSVG = ({ className = 'w-12 h-12' }: { className?: string }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <ellipse cx="32" cy="41" rx="11" ry="9" fill="currentColor" fillOpacity="0.28" />
    <circle cx="19" cy="27" r="4.8" fill="currentColor" fillOpacity="0.28" />
    <circle cx="27.5" cy="21.5" r="5" fill="currentColor" fillOpacity="0.28" />
    <circle cx="36.5" cy="21.5" r="5" fill="currentColor" fillOpacity="0.28" />
    <circle cx="45" cy="27" r="4.8" fill="currentColor" fillOpacity="0.28" />
  </svg>
);

/**
 * Returns at most ONE top-left image badge per Section 1:
 * - Priority: "Hết hàng" (Out of stock) > "Giảm {x}%" (Discount) > "Mới" (New) > "Bán chạy" (Best seller).
 * - Show the discount percentage ONLY ONCE: keep the small "-20%" pill next to the price,
 *   and make the image badge show only for products that have no discount (New / Best seller). Do not show both.
 */
function getSingleImageBadge(
  product: Product,
  lang: Language,
  isOutOfStock: boolean,
  discountPercent: number
): { label: string; bg: string; color: string } | null {
  if (isOutOfStock) {
    return {
      label: lang === 'vi' ? 'Hết hàng' : 'Out of stock',
      bg: '#6B7280',
      color: '#FFFFFF',
    };
  }
  // Discount is shown once next to the price, so no image badge when discounted
  if (discountPercent > 0) {
    return null;
  }
  if (product.requiresPrescription) {
    return {
      label: lang === 'vi' ? 'Thuốc kê đơn BS' : 'Rx Required',
      bg: '#6B1F2E',
      color: '#FFF4E8',
    };
  }
  if (product.badges?.includes('new')) {
    return {
      label: lang === 'vi' ? 'Mới' : 'New',
      bg: '#6B1F2E',
      color: '#FFF4E8',
    };
  }
  if (product.badges?.includes('bestseller')) {
    return {
      label: lang === 'vi' ? 'Bán chạy' : 'Best seller',
      bg: '#F4B6C2',
      color: '#3A0F1B',
    };
  }
  return null;
}

export interface ProductCardProps {
  product: Product;
  lang: Language;
  isAdded: boolean;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onAddToCartClick: (product: Product) => void;
  onBuyNowClick?: (product: Product) => void;
  onOpenProductDetail: (slug: string) => void;
}

export const ProductCard = ({
  product,
  lang,
  isAdded,
  isWishlisted,
  onToggleWishlist,
  onAddToCartClick,
  onBuyNowClick,
  onOpenProductDetail,
}: ProductCardProps) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const slug = product.slug || product.id;
  const displayName = lang === 'en' && product.nameEn ? product.nameEn : product.name;
  const displaySpec =
    lang === 'en' && product.specEn
      ? product.specEn
      : product.spec || (lang === 'vi' ? 'Tiêu chuẩn' : 'Standard');
  const isOutOfStock =
    product.stock === 0 || Boolean(product.badges?.includes('out_of_stock'));
  const discountPercent =
    product.discountPercent ||
    (product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0);
  const reviewCount = product.reviewCount ?? 0;

  const singleBadge = getSingleImageBadge(product, lang, isOutOfStock, discountPercent);

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpenProductDetail(slug);
  };

  return (
    <article
      data-testid={`shop-product-card-${product.id}`}
      className={`group relative flex flex-col h-full rounded-[20px] border p-3 sm:p-4 transition-all duration-300 ${
        isOutOfStock ? '' : 'hover:-translate-y-1 hover:shadow-xl'
      }`}
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow)',
      }}
    >
      {/* 1. Square 1:1 Image Frame (consistent light/dark background, object-fit: contain, padding: 16px) */}
      <div className="shop-product-img-frame mb-3">
        {(!imgLoaded || imgError) && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: 'var(--surface-2)', color: 'var(--primary)' }}
          >
            <PawPlaceholderSVG className="w-14 h-14" />
          </div>
        )}

        <a
          href={`/cua-hang/${slug}`}
          onClick={handleCardClick}
          aria-label={displayName}
          className="w-full h-full flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#FF7F6B] rounded-xl cursor-pointer"
        >
          {!imgError && (
            <img
              src={product.image}
              alt={displayName}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`w-full h-full object-contain transition-transform duration-300 ${
                isOutOfStock
                  ? 'opacity-60'
                  : 'group-hover:scale-[1.04]'
              } ${imgLoaded ? '' : 'opacity-0'}`}
              referrerPolicy="no-referrer"
            />
          )}
        </a>

        {/* At most ONE top-left badge (height 24px, padding 0 10px, radius 999px, Nunito 13px, weight 700) */}
        {singleBadge && (
          <span
            data-testid={`product-badge-${product.id}`}
            className="absolute top-2.5 left-2.5 z-10 inline-flex items-center justify-center pointer-events-none shadow-xs"
            style={{
              height: '24px',
              padding: '0 10px',
              borderRadius: '999px',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 700,
              lineHeight: 1,
              backgroundColor: singleBadge.bg,
              color: singleBadge.color,
            }}
          >
            {singleBadge.label}
          </span>
        )}

        {/* Wishlist Heart inside top-right corner of image frame (36px round, glass style) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          aria-label={
            lang === 'vi'
              ? isWishlisted
                ? `Bỏ yêu thích ${displayName}`
                : `Yêu thích ${displayName}`
              : isWishlisted
              ? `Remove ${displayName} from wishlist`
              : `Add ${displayName} to wishlist`
          }
          aria-pressed={isWishlisted}
          className="absolute top-2.5 right-2.5 z-10 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-[#FF7F6B] shadow-xs cursor-pointer"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.86)',
            border: '1px solid rgba(90, 30, 45, 0.12)',
            color: isWishlisted ? '#FF7F6B' : '#5A1E2D',
          }}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-[#FF7F6B] text-[#FF7F6B]' : ''
            }`}
          />
        </button>
      </div>

      {/* 2. Product Name: Baloo 2, 17px (15px on mobile), weight 600, line-height 1.3, ALWAYS reserve 2 lines */}
      <a
        href={`/cua-hang/${slug}`}
        onClick={handleCardClick}
        className="block focus-visible:outline-2 focus-visible:outline-[#FF7F6B] rounded-lg cursor-pointer"
      >
        <h3
          className="font-heading text-[15px] sm:text-[17px] font-semibold leading-[1.3] line-clamp-2 transition-colors group-hover:opacity-85"
          style={{
            color: 'var(--text)',
            minHeight: '2.6em',
          }}
        >
          {displayName}
        </h3>
      </a>

      {/* 3. Spec line directly under the name, 14px, --text-muted, 4px spacing */}
      <p
        className="text-[13px] sm:text-[14px] font-medium mt-1 truncate"
        style={{ color: 'var(--text-muted)' }}
      >
        {displaySpec}
      </p>

      {/* Bottom-aligned block so price, rating, and button align across every row */}
      <div className="mt-auto pt-2.5 flex flex-col">
        {/* 4. Price row: current price 20px (18px on mobile) weight 800 in --primary, old price struck through, "-20%" pill */}
        <div className="flex flex-wrap items-center gap-1.5 min-h-[26px]">
          <span
            className="text-[18px] sm:text-[20px] font-extrabold leading-none"
            style={{ color: 'var(--primary)' }}
          >
            {formatVndPrice(product.price)}
          </span>
          {!isOutOfStock && product.oldPrice && product.oldPrice > product.price && (
            <>
              <span
                className="text-xs sm:text-[14px] line-through font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                {formatVndPrice(product.oldPrice)}
              </span>
              {discountPercent > 0 && (
                <span
                  className="inline-flex items-center justify-center"
                  style={{
                    height: '22px',
                    padding: '0 8px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 700,
                    lineHeight: 1,
                    backgroundColor: '#FF7F6B',
                    color: '#FFFFFF',
                  }}
                >
                  -{discountPercent}%
                </span>
              )}
            </>
          )}
        </div>

        {/* 5. Rating row: show stars + score + count only when reviewCount >= 5; otherwise "Chưa có đánh giá" keeping same height */}
        <div className="flex items-center gap-1.5 mt-1.5 mb-3 min-h-[22px]">
          {reviewCount >= 5 ? (
            <>
              <div className="flex items-center gap-0.5" aria-hidden="true">
                {[...Array(5)].map((_, idx) => (
                  <Star
                    key={idx}
                    className="w-3.5 h-3.5"
                    style={{
                      fill: idx < Math.round(product.rating) ? '#E8A33D' : 'transparent',
                      color: '#E8A33D',
                    }}
                  />
                ))}
              </div>
              <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                {product.rating.toFixed(1)}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                ({reviewCount})
              </span>
            </>
          ) : (
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              {lang === 'vi' ? 'Chưa có đánh giá' : 'No reviews yet'}
            </span>
          )}
        </div>

        {/* 6. Add-to-Cart Outline Action + Buy Now Primary Action */}
        {product.requiresPrescription ? (
          <a
            href="/ho-so-thu-cung"
            className="w-full h-[40px] sm:h-[42px] rounded-full text-[12px] sm:text-[13px] font-bold inline-flex items-center justify-center border border-[#6B1F2E]/35 bg-[#6B1F2E]/8 text-[#6B1F2E] dark:border-[#FF7F6B]/40 dark:bg-[#FF7F6B]/15 dark:text-[#FF7F6B] hover:opacity-90 transition-opacity"
          >
            {lang === 'vi' ? 'Mua theo đơn Bác sĩ' : 'Via Vet Prescription'}
          </a>
        ) : isOutOfStock ? (
          <button
            type="button"
            disabled
            aria-label={lang === 'vi' ? `${displayName} - Hết hàng` : `${displayName} - Out of stock`}
            className="w-full h-[40px] sm:h-[42px] rounded-full text-[13px] sm:text-[14px] font-bold inline-flex items-center justify-center border-2 cursor-not-allowed"
            style={{
              borderColor: '#9CA3AF',
              backgroundColor: 'rgba(156, 163, 175, 0.14)',
              color: '#6B7280',
            }}
          >
            {lang === 'vi' ? 'Hết hàng' : 'Out of stock'}
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              data-testid={`add-to-cart-btn-${product.id}`}
              data-added={isAdded ? 'true' : 'false'}
              aria-label={
                lang === 'vi'
                  ? `Thêm ${displayName} vào giỏ hàng`
                  : `Add ${displayName} to cart`
              }
              onClick={() => onAddToCartClick(product)}
              className="btn-shop-outline sm:flex-[1.15] min-w-0 cursor-pointer"
            >
              {isAdded ? (
                <span>{lang === 'vi' ? 'Đã thêm ✓' : 'Added ✓'}</span>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                  <span>{lang === 'vi' ? 'Thêm vào giỏ' : 'Add to cart'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              data-testid={`buy-now-btn-${product.id}`}
              aria-label={
                lang === 'vi'
                  ? `Mua hàng ${displayName}`
                  : `Buy ${displayName} now`
              }
              onClick={() =>
                onBuyNowClick
                  ? onBuyNowClick(product)
                  : onAddToCartClick(product)
              }
              className="btn-shop-buy sm:flex-1 min-w-0 cursor-pointer"
            >
              <span>{lang === 'vi' ? 'Mua hàng' : 'Buy now'}</span>
            </button>
          </div>
        )}
      </div>
    </article>
  );
};
