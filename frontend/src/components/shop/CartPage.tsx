import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { CartItem, Language, PageId, Product, UserAccount } from '@/types';
import {
  calculateCartSummary,
  formatVnd,
  getCartItemKey,
  validateCartForCheckout,
  validateCouponCode,
} from '@/utils/cartLogic';
import { CartEmptyState } from './cart/CartEmptyState';
import { CartItemRow } from './cart/CartItemRow';
import { SavedForLaterSection } from './cart/SavedForLaterSection';
import { CartRecommendedGrid } from './cart/CartRecommendedGrid';
import { CartOrderSummarySidebar } from './cart/CartOrderSummarySidebar';
import { CartMobileBottomBar } from './cart/CartMobileBottomBar';

interface CartPageProps {
  lang: Language;
  darkMode?: boolean;
  cart: CartItem[];
  savedForLater: CartItem[];
  products: Product[];
  currentUser?: UserAccount | null;
  appliedCoupon: string;
  orderNote: string;
  redirectNotice: string | null;
  onClearRedirectNotice: () => void;
  onUpdateQuantity: (itemKey: string, delta: number) => void;
  onSetQuantity: (itemKey: string, newQty: number) => void;
  onChangeSpec: (itemKey: string, newSpecVi: string) => void;
  onRemoveItemWithUndo: (item: CartItem) => void;
  onSaveForLater: (item: CartItem) => void;
  onMoveSavedToCart: (item: CartItem) => void;
  onRemoveSavedItem: (itemKey: string) => void;
  onAcceptPriceChange: (itemKey: string) => void;
  onSimulatePriceChange?: (itemKey: string) => void;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  onChangeOrderNote: (note: string) => void;
  onAddToCart: (product: Product, quantity?: number, selectedSpec?: string) => void;
  onBuyNow?: (product: Product, quantity?: number, selectedSpec?: string) => void;
  onNavigate: (page: PageId) => void;
  onNavigateUrl: (path: string) => void;
}

export const CartPage = ({
  lang,
  darkMode = false,
  cart,
  savedForLater,
  products,
  currentUser = null,
  appliedCoupon,
  orderNote,
  redirectNotice,
  onClearRedirectNotice,
  onUpdateQuantity,
  onChangeSpec,
  onRemoveItemWithUndo,
  onSaveForLater,
  onMoveSavedToCart,
  onRemoveSavedItem,
  onAcceptPriceChange,
  onApplyCoupon,
  onRemoveCoupon,
  onChangeOrderNote,
  onAddToCart,
  onBuyNow,
  onNavigateUrl,
}: CartPageProps) => {
  const [couponDraft, setCouponDraft] = useState<string | null>(null);
  const couponInput = couponDraft ?? (appliedCoupon || '');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [liveQuantityAnnouncement, setLiveQuantityAnnouncement] = useState('');
  const [openSpecSelectorKey, setOpenSpecSelectorKey] = useState<string | null>(null);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});
  const [wishlistedIds, setWishlistedIds] = useState<Record<string, boolean>>({});

  const summary = calculateCartSummary(cart, appliedCoupon, products, { currentUser });
  const checkoutValidation = validateCartForCheckout(cart, products);
  const isEmpty = cart.length === 0;

  const errorTextColor = darkMode ? '#FDA29B' : '#B42318';
  const errorBgColor = darkMode
    ? 'rgba(253, 162, 155, 0.14)'
    : 'rgba(180, 35, 24, 0.08)';
  const errorBorderColor = darkMode
    ? 'rgba(253, 162, 155, 0.4)'
    : 'rgba(180, 35, 24, 0.3)';

  const cartProductIds = new Set(cart.map((c) => c.productId));
  const recommendedProducts = products
    .filter(
      (p) =>
        !cartProductIds.has(p.id) &&
        (p.stock ?? 20) > 0 &&
        !p.badges?.includes('out_of_stock')
    )
    .slice(0, 4);

  const featuredProducts =
    recommendedProducts.length >= 4
      ? recommendedProducts
      : products
          .filter((p) => (p.stock ?? 20) > 0 && !p.badges?.includes('out_of_stock'))
          .slice(0, 4);

  const handleApplyCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    const res = validateCouponCode(couponInput.trim(), summary.subtotal, lang, {
      currentUser,
      scope: 'shop',
    });
    if (!res.valid) {
      setCouponError(
        res.errorMessage ||
          (lang === 'vi'
            ? 'Mã không hợp lệ hoặc đã hết hạn'
            : 'Invalid or expired coupon code')
      );
      return;
    }

    onApplyCoupon(res.normalizedCode);
    setCouponDraft(res.normalizedCode);
    setCouponSuccess(
      lang === 'vi'
        ? `Đã áp dụng mã ${res.normalizedCode} (-${formatVnd(res.discountAmount)})`
        : `Applied code ${res.normalizedCode} (-${formatVnd(res.discountAmount)})`
    );
  };

  const handleCardAddToCart = (product: Product) => {
    onAddToCart(product, 1, product.spec);
    setAddedItemIds((prev) => ({ ...prev, [product.id]: true }));
    window.setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  const handleCardBuyNow = (product: Product) => {
    if (onBuyNow) {
      onBuyNow(product, 1, product.spec);
    } else {
      onAddToCart(product, 1, product.spec);
      onNavigateUrl('/thanh-toan');
    }
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlistedIds((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleOpenProductDetail = (slug: string) => {
    onNavigateUrl(`/cua-hang/${slug}`);
  };

  return (
    <div
      data-testid="cart-page"
      className="pt-[calc(var(--nav-h)+24px)] pb-36 lg:pb-20 min-h-screen relative z-10"
    >
      <div
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        data-testid="cart-live-region"
      >
        {liveQuantityAnnouncement}
      </div>

      <div className="shared-container space-y-8">
        <div className="space-y-2.5 max-w-2xl">
          <span
            data-testid="cart-page-eyebrow"
            className="block uppercase font-bold"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'var(--primary)',
            }}
          >
            {lang === 'vi' ? 'GIỎ HÀNG' : 'SHOPPING CART'}
          </span>
          <h1
            className="font-heading font-extrabold leading-[1.14] tracking-[-0.02em]"
            style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              color: 'var(--primary)',
            }}
          >
            {lang === 'vi' ? 'Giỏ hàng của bạn' : 'Your cart'}{' '}
            <span
              data-testid="cart-page-item-count"
              className="text-lg sm:text-2xl font-bold align-middle"
              style={{ color: 'var(--text-muted)' }}
            >
              ({summary.totalQuantity}{' '}
              {lang === 'vi'
                ? 'sản phẩm'
                : summary.totalQuantity === 1
                ? 'item'
                : 'items'}
              )
            </span>
          </h1>
          <p
            data-testid="cart-page-subtitle"
            className="text-[18px] leading-relaxed font-normal"
            style={{ color: 'var(--text-muted)' }}
          >
            {lang === 'vi'
              ? 'Kiểm tra sản phẩm, chọn quy cách và áp dụng mã ưu đãi trước khi thanh toán.'
              : 'Review your items, select package sizes, and apply promo codes before checkout.'}
          </p>
        </div>

        {redirectNotice && (
          <div
            role="alert"
            data-testid="cart-redirect-notice"
            className="p-4 rounded-2xl border flex items-center justify-between gap-3"
            style={{
              backgroundColor: errorBgColor,
              borderColor: errorBorderColor,
              color: errorTextColor,
            }}
          >
            <div className="flex items-center gap-2.5 text-sm font-bold">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{redirectNotice}</span>
            </div>
            <button
              type="button"
              onClick={onClearRedirectNotice}
              className="min-h-[36px] px-3 py-1 rounded-full text-xs font-extrabold underline focus-visible:outline-2 focus-visible:outline-[#FF7F6B] cursor-pointer"
            >
              {lang === 'vi' ? 'Đã hiểu' : 'Dismiss'}
            </button>
          </div>
        )}

        {isEmpty ? (
          <CartEmptyState
            lang={lang}
            savedForLater={savedForLater}
            products={products}
            featuredProducts={featuredProducts}
            addedItemIds={addedItemIds}
            wishlistedIds={wishlistedIds}
            onMoveSavedToCart={onMoveSavedToCart}
            onRemoveSavedItem={onRemoveSavedItem}
            onToggleWishlist={handleToggleWishlist}
            onAddToCartClick={handleCardAddToCart}
            onBuyNowClick={handleCardBuyNow}
            onOpenProductDetail={handleOpenProductDetail}
            onNavigateUrl={onNavigateUrl}
          />
        ) : (
          <div className="flex flex-col lg:flex-row items-start gap-7">
            <div className="w-full lg:w-[62%] space-y-8 min-w-0">
              {!checkoutValidation.isValid && (
                <div
                  role="alert"
                  data-testid="cart-blocking-alert"
                  className="p-4 rounded-2xl border flex items-start gap-3"
                  style={{
                    backgroundColor: errorBgColor,
                    borderColor: errorBorderColor,
                    color: errorTextColor,
                  }}
                >
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="text-sm font-bold leading-snug">
                    {lang === 'vi'
                      ? checkoutValidation.blockingMessageVi
                      : checkoutValidation.blockingMessageEn}
                  </div>
                </div>
              )}

              <div
                className="rounded-[24px] border p-4 sm:p-6 divide-y"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  boxShadow: 'var(--shadow)',
                }}
              >
                {cart.map((item) => {
                  const itemKey = getCartItemKey(
                    item.productId,
                    item.selectedSpec
                  );
                  return (
                    <CartItemRow
                      key={itemKey}
                      lang={lang}
                      item={item}
                      products={products}
                      validation={checkoutValidation.itemValidations[itemKey]}
                      isSpecOpen={openSpecSelectorKey === itemKey}
                      errorTextColor={errorTextColor}
                      errorBgColor={errorBgColor}
                      errorBorderColor={errorBorderColor}
                      onToggleSpecSelector={(key) =>
                        setOpenSpecSelectorKey((prev) =>
                          prev === key ? null : key
                        )
                      }
                      onCloseSpecSelector={() => setOpenSpecSelectorKey(null)}
                      onChangeSpec={onChangeSpec}
                      onUpdateQuantity={onUpdateQuantity}
                      onSaveForLater={onSaveForLater}
                      onRemoveItemWithUndo={onRemoveItemWithUndo}
                      onAcceptPriceChange={onAcceptPriceChange}
                      onAnnounceQuantity={setLiveQuantityAnnouncement}
                      onNavigateUrl={onNavigateUrl}
                    />
                  );
                })}
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
                variant="related"
                addedItemIds={addedItemIds}
                wishlistedIds={wishlistedIds}
                onToggleWishlist={handleToggleWishlist}
                onAddToCartClick={handleCardAddToCart}
                onBuyNowClick={handleCardBuyNow}
                onOpenProductDetail={handleOpenProductDetail}
              />
            </div>

            <CartOrderSummarySidebar
              lang={lang}
              summary={summary}
              isCheckoutValid={checkoutValidation.isValid}
              couponInput={couponInput}
              couponError={couponError}
              couponSuccess={couponSuccess}
              orderNote={orderNote}
              errorTextColor={errorTextColor}
              onChangeCouponInput={(value) => {
                setCouponDraft(value);
                if (couponError) setCouponError(null);
              }}
              onSubmitCoupon={handleApplyCouponSubmit}
              onRemoveCoupon={() => {
                onRemoveCoupon();
                setCouponDraft('');
                setCouponSuccess(null);
                setCouponError(null);
              }}
              onChangeOrderNote={onChangeOrderNote}
              onNavigateUrl={onNavigateUrl}
            />
          </div>
        )}
      </div>

      {!isEmpty && (
        <CartMobileBottomBar
          lang={lang}
          total={summary.total}
          isCheckoutValid={checkoutValidation.isValid}
          onNavigateUrl={onNavigateUrl}
        />
      )}
    </div>
  );
};
