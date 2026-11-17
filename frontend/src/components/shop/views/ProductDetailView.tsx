import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  RefreshCw,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Phone,
  Plus,
  Minus,
} from 'lucide-react';
import { Language, Product } from '@/types';
import { PRODUCT_REVIEWS, formatVndPrice } from '@/data/shopData';
import { CONTACT_INFO } from '@/constants/contact.constant';
import { ProductCard, PawPlaceholderSVG } from './ProductCard';
import { CATEGORY_LABELS } from './ShopHeroAndToolbar';

type DetailTabId = 'description' | 'ingredients' | 'usage' | 'reviews';

export interface ProductDetailViewProps {
  lang: Language;
  selectedSlug: string;
  catalogProducts: Product[];
  addedIds: Record<string, boolean>;
  wishlistedIds: Record<string, boolean>;
  onToggleWishlist: (productId: string) => void;
  onAddProduct: (product: Product, quantity?: number, customSpec?: string) => void;
  onBuyNowProduct: (product: Product, quantity?: number, customSpec?: string) => void;
  onNavigateToProductSlug: (slug: string | null) => void;
}

export const ProductDetailView = ({
  lang,
  selectedSlug,
  catalogProducts,
  addedIds,
  wishlistedIds,
  onToggleWishlist,
  onAddProduct,
  onBuyNowProduct,
  onNavigateToProductSlug,
}: ProductDetailViewProps) => {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedSpecIdx, setSelectedSpecIdx] = useState(0);
  const [detailQty, setDetailQty] = useState(1);
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTabId>('description');
  const [reviewStarFilter, setReviewStarFilter] = useState<number | 'all'>('all');

  useEffect(() => {
    setSelectedImageIdx(0);
    setSelectedSpecIdx(0);
    setDetailQty(1);
    setActiveDetailTab('description');
    setReviewStarFilter('all');
  }, [selectedSlug]);

  const detailProduct = catalogProducts.find(
    (p) => p.slug === selectedSlug || p.id === selectedSlug
  );

  if (!detailProduct) {
    return (
      <div className="pt-28 pb-24 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center py-16 space-y-5">
          <div
            className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
            style={{
              backgroundColor: 'var(--surface-2)',
              color: 'var(--primary)',
            }}
          >
            <PawPlaceholderSVG className="w-12 h-12" />
          </div>
          <h1
            className="font-heading text-3xl sm:text-4xl font-extrabold"
            style={{ color: 'var(--primary)' }}
          >
            {lang === 'vi' ? 'Không tìm thấy sản phẩm' : 'Product not found'}
          </h1>
          <p className="text-base" style={{ color: 'var(--text-muted)' }}>
            {lang === 'vi'
              ? 'Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã ngừng kinh doanh.'
              : 'The product you are looking for does not exist or has been discontinued.'}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigateToProductSlug(null)}
              className="btn-primary px-6 py-3 rounded-full text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'vi' ? 'Quay lại cửa hàng' : 'Back to shop'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayName =
    lang === 'en' && detailProduct.nameEn ? detailProduct.nameEn : detailProduct.name;
  const categoryLabel =
    CATEGORY_LABELS[detailProduct.category][lang === 'vi' ? 'vi' : 'en'];
  const galleryImages =
    detailProduct.images && detailProduct.images.length > 0
      ? detailProduct.images
      : [detailProduct.image];
  const activeImage = galleryImages[selectedImageIdx] || detailProduct.image;

  const specOptions =
    detailProduct.specOptions && detailProduct.specOptions.length > 0
      ? detailProduct.specOptions
      : [
          {
            labelVi: detailProduct.spec || 'Tiêu chuẩn',
            labelEn: detailProduct.specEn || 'Standard',
            price: detailProduct.price,
            oldPrice: detailProduct.oldPrice,
          },
        ];
  const activeSpecOption = specOptions[selectedSpecIdx] || specOptions[0];
  const currentPrice = activeSpecOption.price;
  const currentOldPrice = activeSpecOption.oldPrice;
  const currentDiscount =
    currentOldPrice && currentOldPrice > currentPrice
      ? Math.round(((currentOldPrice - currentPrice) / currentOldPrice) * 100)
      : detailProduct.discountPercent || 0;
  const isOutOfStock =
    detailProduct.stock === 0 ||
    detailProduct.badges?.includes('out_of_stock') ||
    false;

  const allProductReviews = PRODUCT_REVIEWS.filter(
    (r) => r.productId === detailProduct.id
  );
  const reviewsToUse =
    allProductReviews.length > 0 ? allProductReviews : PRODUCT_REVIEWS.slice(0, 3);
  const filteredReviews =
    reviewStarFilter === 'all'
      ? reviewsToUse
      : reviewsToUse.filter((r) => r.stars === reviewStarFilter);

  const relatedProducts = catalogProducts
    .filter(
      (p) =>
        p.id !== detailProduct.id &&
        (p.category === detailProduct.category ||
          p.petTypes?.some((pt) => detailProduct.petTypes?.includes(pt)))
    )
    .slice(0, 4);

  const activeSpecLabel =
    lang === 'en' ? activeSpecOption.labelEn : activeSpecOption.labelVi;

  const handleDetailAddToCart = () => {
    if (isOutOfStock) return;
    const productWithSpec: Product = {
      ...detailProduct,
      price: currentPrice,
      oldPrice: currentOldPrice,
      spec: activeSpecOption.labelVi,
      specEn: activeSpecOption.labelEn,
    };
    onAddProduct(productWithSpec, detailQty, activeSpecLabel);
  };

  const handleDetailBuyNow = () => {
    if (isOutOfStock) return;
    const productWithSpec: Product = {
      ...detailProduct,
      price: currentPrice,
      oldPrice: currentOldPrice,
      spec: activeSpecOption.labelVi,
      specEn: activeSpecOption.labelEn,
    };
    onBuyNowProduct(productWithSpec, detailQty, activeSpecLabel);
  };

  return (
    <div className="pt-24 pb-28 sm:pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* 2 Columns on Desktop */}
        <div
          className="rounded-3xl border p-5 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow)',
          }}
        >
          {/* Left Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="shop-product-img-frame border group" style={{ borderColor: 'var(--border)' }}>
              <img
                loading="lazy"
                decoding="async"
                src={activeImage}
                alt={displayName}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="grid grid-cols-4 gap-3">
              {galleryImages.map((imgUrl, idx) => {
                const isSelected = idx === selectedImageIdx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    aria-label={
                      lang === 'vi' ? `Xem ảnh ${idx + 1}` : `View image ${idx + 1}`
                    }
                    className={`shop-product-img-frame !p-2 !rounded-xl border-2 transition-all focus-visible:outline-2 focus-visible:outline-[#FF7F6B] cursor-pointer ${
                      isSelected ? 'shadow-xs' : 'opacity-75 hover:opacity-100'
                    }`}
                    style={{
                      borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                    }}
                  >
                    <img
                      loading="lazy"
                      decoding="async"
                      src={imgUrl}
                      alt=""
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Info */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {detailProduct.brand && (
                  <span
                    className="px-3 py-1 rounded-full text-xs font-extrabold"
                    style={{
                      backgroundColor: 'var(--surface-2)',
                      color: 'var(--primary)',
                    }}
                  >
                    {detailProduct.brand}
                  </span>
                )}
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold border"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {categoryLabel}
                </span>
                {isOutOfStock ? (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-gray-600 text-white">
                    {lang === 'vi' ? 'Hết hàng' : 'Out of stock'}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-700 text-white">
                    {lang === 'vi'
                      ? `Còn hàng (${detailProduct.stock ?? 20})`
                      : `In stock (${detailProduct.stock ?? 20})`}
                  </span>
                )}
              </div>

              <h1
                className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight"
                style={{ color: 'var(--primary)' }}
              >
                {displayName}
              </h1>

              <div className="flex items-center gap-2">
                {(detailProduct.reviewCount ?? 0) >= 5 ? (
                  <>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          className="w-4 h-4"
                          style={{
                            fill:
                              idx < Math.round(detailProduct.rating)
                                ? '#E8A33D'
                                : 'transparent',
                            color: '#E8A33D',
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-extrabold" style={{ color: 'var(--text)' }}>
                      {detailProduct.rating.toFixed(1)}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      ({detailProduct.reviewCount}{' '}
                      {lang === 'vi' ? 'đánh giá' : 'reviews'})
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                    {lang === 'vi' ? 'Chưa có đánh giá' : 'No reviews yet'}
                  </span>
                )}
              </div>

              {/* Price + Old Price */}
              <div className="flex flex-wrap items-baseline gap-3 pt-1">
                <span
                  className="text-3xl sm:text-4xl font-extrabold"
                  style={{ color: 'var(--primary)' }}
                >
                  {formatVndPrice(currentPrice)}
                </span>
                {currentOldPrice && currentOldPrice > currentPrice && (
                  <>
                    <span
                      className="text-lg line-through font-medium"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {formatVndPrice(currentOldPrice)}
                    </span>
                    {currentDiscount > 0 && (
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-extrabold"
                        style={{
                          backgroundColor: '#FF7F6B',
                          color: '#FFFFFF',
                        }}
                      >
                        -{currentDiscount}%
                      </span>
                    )}
                  </>
                )}
              </div>

              <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {lang === 'en' && detailProduct.descriptionEn
                  ? detailProduct.descriptionEn
                  : detailProduct.description}
              </p>

              {/* Spec selector chips */}
              <div className="space-y-2 pt-1">
                <label
                  className="block text-xs font-extrabold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {lang === 'vi' ? 'Chọn quy cách đóng gói' : 'Select size / pack'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {specOptions.map((opt, idx) => {
                    const active = idx === selectedSpecIdx;
                    const label = lang === 'en' ? opt.labelEn : opt.labelVi;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setSelectedSpecIdx(idx)}
                        className="px-4 py-2 rounded-full text-xs sm:text-sm font-bold border transition-all focus-visible:outline-2 focus-visible:outline-[#FF7F6B] cursor-pointer"
                        style={{
                          backgroundColor: active ? 'var(--primary)' : 'var(--bg)',
                          color: active ? 'var(--on-primary)' : 'var(--text)',
                          borderColor: active ? 'var(--primary)' : 'var(--border)',
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity stepper */}
              <div className="flex items-center gap-4 pt-2">
                <span
                  className="text-xs font-extrabold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {lang === 'vi' ? 'Số lượng' : 'Quantity'}
                </span>
                <div
                  className="inline-flex items-center rounded-full border p-1"
                  style={{
                    backgroundColor: 'var(--bg)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <button
                    type="button"
                    disabled={detailQty <= 1}
                    onClick={() => setDetailQty((q) => Math.max(1, q - 1))}
                    aria-label={lang === 'vi' ? 'Giảm số lượng' : 'Decrease quantity'}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--surface-2)] disabled:opacity-40 cursor-pointer"
                    style={{ color: 'var(--text)' }}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span
                    className="w-10 text-center text-sm font-extrabold"
                    style={{ color: 'var(--text)' }}
                  >
                    {detailQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDetailQty((q) => q + 1)}
                    aria-label={lang === 'vi' ? 'Tăng số lượng' : 'Increase quantity'}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--surface-2)] cursor-pointer"
                    style={{ color: 'var(--text)' }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Primary "Thêm vào giỏ" + Secondary "Mua ngay" */}
              {detailProduct.requiresPrescription ? (
                <div
                  className="p-4 rounded-2xl border space-y-2.5 text-sm"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <p className="font-bold" style={{ color: 'var(--primary)' }}>
                    {lang === 'vi'
                      ? 'Dược phẩm kê đơn của Bác sĩ thú y'
                      : 'Veterinary Prescription Medicine'}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {lang === 'vi'
                      ? 'Thuốc thuộc danh mục Shop chỉ được mua lại trực tuyến thông qua đơn thuốc hợp lệ (bệnh nhẹ, còn lượt mua lại) trong Sổ sức khỏe thú cưng.'
                      : 'Prescription medicines can only be ordered online via a valid mild-condition prescription in your Pet Health Record.'}
                  </p>
                  <a
                    href="/ho-so-thu-cung"
                    className="btn-primary h-10 px-5 rounded-full text-xs font-bold inline-flex items-center justify-center gap-2"
                  >
                    <span>
                      {lang === 'vi'
                        ? 'Mở Sổ sức khỏe để mua theo đơn'
                        : 'Open Pet Health Record'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={handleDetailAddToCart}
                    className={`h-12 px-6 rounded-full text-sm font-bold inline-flex items-center justify-center gap-2 ${
                      isOutOfStock
                        ? 'opacity-60 cursor-not-allowed border'
                        : 'btn-primary shadow-md cursor-pointer'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {isOutOfStock
                        ? lang === 'vi'
                          ? 'Hết hàng'
                          : 'Out of stock'
                        : lang === 'vi'
                        ? 'Thêm vào giỏ'
                        : 'Add to cart'}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={handleDetailBuyNow}
                    className="btn-secondary h-12 px-6 rounded-full text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <span>{lang === 'vi' ? 'Mua hàng' : 'Buy now'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="pt-1">
                <a
                  href={CONTACT_INFO.phoneHref}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold hover:underline"
                  style={{ color: 'var(--primary)' }}
                >
                  <Phone className="w-4 h-4" />
                  <span>
                    {lang === 'vi'
                      ? 'Gọi tư vấn: 0337 203 332'
                      : 'Call for advice: 0337 203 332'}
                  </span>
                </a>
              </div>
            </div>

            {/* Trust mini-row */}
            <div
              className="grid grid-cols-2 gap-3 pt-4 border-t text-xs font-bold"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 shrink-0" style={{ color: 'var(--primary)' }} />
                <span>{lang === 'vi' ? 'Giao nhanh trong ngày' : 'Same-day delivery'}</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 shrink-0" style={{ color: 'var(--primary)' }} />
                <span>{lang === 'vi' ? 'Đổi trả trong 7 ngày' : '7-day easy returns'}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: 'var(--primary)' }} />
                <span>{lang === 'vi' ? 'Hàng chính hãng 100%' : '100% authentic'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 shrink-0" style={{ color: 'var(--primary)' }} />
                <span>{lang === 'vi' ? 'Thanh toán khi nhận hàng' : 'Cash on delivery'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Tabs */}
        <div
          className="rounded-3xl border p-6 sm:p-8 space-y-6"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <div
            className="flex items-center gap-2 overflow-x-auto pb-2 border-b"
            style={{ borderColor: 'var(--border)', scrollbarWidth: 'none' }}
          >
            {(
              [
                { id: 'description', vi: 'Mô tả', en: 'Overview' },
                { id: 'ingredients', vi: 'Thành phần', en: 'Ingredients & materials' },
                { id: 'usage', vi: 'Hướng dẫn sử dụng', en: 'How to use' },
                {
                  id: 'reviews',
                  vi: `Đánh giá (${reviewsToUse.length})`,
                  en: `Reviews (${reviewsToUse.length})`,
                },
              ] as const
            ).map((tab) => {
              const active = activeDetailTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveDetailTab(tab.id)}
                  className="px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer"
                  style={{
                    backgroundColor: active ? 'var(--primary)' : 'transparent',
                    color: active ? 'var(--on-primary)' : 'var(--text)',
                  }}
                >
                  {lang === 'vi' ? tab.vi : tab.en}
                </button>
              );
            })}
          </div>

          {activeDetailTab === 'description' && (
            <div className="space-y-3 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text)' }}>
              <p>
                {lang === 'en' && detailProduct.descriptionEn
                  ? detailProduct.descriptionEn
                  : detailProduct.description}
              </p>
              <p style={{ color: 'var(--text-muted)' }}>
                {lang === 'vi'
                  ? 'Tất cả sản phẩm tại cửa hàng Animora đều được đội ngũ bác sĩ thú y kiểm định nguồn gốc, hạn sử dụng và độ an toàn sinh học trước khi giao đến tay gia đình bé cưng.'
                  : 'Every item in the Animora shop is vetted by our veterinary team for ingredient safety, freshness, and species appropriateness.'}
              </p>
            </div>
          )}

          {activeDetailTab === 'ingredients' && (
            <div className="space-y-2 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text)' }}>
              <p>
                {lang === 'en'
                  ? detailProduct.ingredientsEn || detailProduct.descriptionEn
                  : detailProduct.ingredientsVi || detailProduct.description}
              </p>
            </div>
          )}

          {activeDetailTab === 'usage' && (
            <div className="space-y-2 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text)' }}>
              <p>
                {lang === 'en'
                  ? detailProduct.usageEn || detailProduct.descriptionEn
                  : detailProduct.usageVi || detailProduct.description}
              </p>
            </div>
          )}

          {activeDetailTab === 'reviews' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold mr-1" style={{ color: 'var(--text-muted)' }}>
                  {lang === 'vi' ? 'Lọc theo số sao:' : 'Filter by rating:'}
                </span>
                {(['all', 5, 4, 3] as const).map((starOpt) => {
                  const active = reviewStarFilter === starOpt;
                  return (
                    <button
                      key={String(starOpt)}
                      type="button"
                      onClick={() => setReviewStarFilter(starOpt)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer"
                      style={{
                        backgroundColor: active ? 'var(--primary)' : 'var(--bg)',
                        color: active ? 'var(--on-primary)' : 'var(--text)',
                        borderColor: active ? 'var(--primary)' : 'var(--border)',
                      }}
                    >
                      {starOpt === 'all'
                        ? lang === 'vi'
                          ? 'Tất cả'
                          : 'All'
                        : `${starOpt} ★`}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-4">
                {filteredReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl border space-y-2"
                    style={{
                      backgroundColor: 'var(--bg)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-heading text-sm font-bold block" style={{ color: 'var(--text)' }}>
                          {rev.author}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {lang === 'vi' ? rev.petInfoVi : rev.petInfoEn}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-3.5 h-3.5"
                              style={{
                                fill: i < rev.stars ? '#E8A33D' : 'transparent',
                                color: '#E8A33D',
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {rev.date}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                      {lang === 'vi' ? rev.textVi : rev.textEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Related Products (4 cards) */}
        <div className="space-y-5">
          <h2
            className="font-heading text-2xl sm:text-3xl font-extrabold"
            style={{ color: 'var(--primary)' }}
          >
            {lang === 'vi' ? 'Có thể bạn cũng thích' : 'You may also like'}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((relProd) => (
              <ProductCard
                key={relProd.id}
                product={relProd}
                lang={lang}
                isAdded={Boolean(addedIds[relProd.id])}
                isWishlisted={Boolean(wishlistedIds[relProd.id])}
                onToggleWishlist={onToggleWishlist}
                onAddToCartClick={(p) => onAddProduct(p, 1)}
                onBuyNowClick={(p) => onBuyNowProduct(p, 1)}
                onOpenProductDetail={(slug) => onNavigateToProductSlug(slug)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sticky "Thêm vào giỏ" + "Mua hàng" bar on mobile */}
      <div
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 p-3 border-t shadow-2xl flex items-center justify-between gap-2"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="min-w-0">
          <span className="text-[11px] block truncate" style={{ color: 'var(--text-muted)' }}>
            {activeSpecLabel}
          </span>
          <span className="text-base font-extrabold" style={{ color: 'var(--primary)' }}>
            {formatVndPrice(currentPrice * detailQty)}
          </span>
        </div>
        {!detailProduct.requiresPrescription && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleDetailAddToCart}
              className="btn-secondary h-10 px-3.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{lang === 'vi' ? 'Thêm vào giỏ' : 'Add to cart'}</span>
            </button>
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleDetailBuyNow}
              className="btn-primary h-10 px-4 rounded-full text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>{lang === 'vi' ? 'Mua hàng' : 'Buy now'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
