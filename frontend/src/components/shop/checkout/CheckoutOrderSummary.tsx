import React from 'react';
import { ArrowLeft, ShieldCheck, Tag } from 'lucide-react';
import { CartItem, Language, Product } from '@/types';
import {
  calculateCartSummary,
  formatVnd,
  getCartItemKey,
  resolveProductSpecDetails,
} from '@/utils/cartLogic';
import { STANDARD_SHIPPING_FEE } from '@/constants/cart.constant';
import { handleSpaLinkClick } from '@/utils/spaNavigation';

interface CheckoutOrderSummaryProps {
  lang: Language;
  cart: CartItem[];
  products: Product[];
  summary: ReturnType<typeof calculateCartSummary>;
  onNavigateUrl: (path: string) => void;
}

export const CheckoutOrderSummary = ({
  lang,
  cart,
  products,
  summary,
  onNavigateUrl,
}: CheckoutOrderSummaryProps) => {
  return (
    <aside className="w-full lg:w-[38%] lg:sticky lg:top-[calc(var(--nav-h)+24px)]">
      <div
        data-testid="checkout-summary-card"
        className="rounded-[24px] border p-5 sm:p-7 space-y-5"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div className="flex items-center justify-between">
          <h2
            className="font-heading text-xl font-extrabold"
            style={{ color: 'var(--primary)' }}
          >
            {lang === 'vi' ? 'Đơn hàng của bạn' : 'Your order'}
          </h2>
          <a
            href="/gio-hang"
            onClick={(e) => handleSpaLinkClick(e, '/gio-hang', onNavigateUrl)}
            className="text-xs font-extrabold underline focus-visible:outline-2 focus-visible:outline-[#FF7F6B] rounded-sm"
            style={{ color: 'var(--primary)' }}
          >
            {lang === 'vi' ? 'Sửa giỏ hàng' : 'Edit cart'}
          </a>
        </div>

        {/* Compact Item List */}
        <div
          className="space-y-3 max-h-[280px] overflow-y-auto pr-1 divide-y"
          style={{ borderColor: 'var(--border)' }}
        >
          {cart.map((item) => {
            const catalogProd =
              products.find((p) => p.id === item.productId) || item.product;
            const resolved = resolveProductSpecDetails(
              catalogProd,
              item.selectedSpec,
              lang
            );
            const displayName =
              lang === 'en' && item.product.nameEn
                ? item.product.nameEn
                : item.product.name;
            const unitPrice = item.unitPriceAtAdd ?? item.product.price;
            const itemKey = getCartItemKey(item.productId, item.selectedSpec);

            return (
              <div
                key={itemKey}
                className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-12 h-12 rounded-xl border p-1 shrink-0 flex items-center justify-center"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <img
                      loading="lazy"
                      decoding="async"
                      src={item.product.image}
                      alt={displayName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <p
                      className="font-bold line-clamp-1"
                      style={{ color: 'var(--text)' }}
                    >
                      {displayName}
                    </p>
                    <p
                      className="text-xs font-medium"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {resolved.displaySpec} × {item.quantity}
                    </p>
                  </div>
                </div>
                <span
                  className="font-extrabold shrink-0"
                  style={{ color: 'var(--primary)' }}
                >
                  {formatVnd(unitPrice * item.quantity)}
                </span>
              </div>
            );
          })}
        </div>

        {summary.appliedCouponCode && (
          <div
            data-testid="checkout-applied-coupon"
            className="px-3.5 py-2.5 rounded-xl border flex items-center justify-between text-xs font-bold"
            style={{
              backgroundColor: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--primary)',
            }}
          >
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>
                {lang === 'vi'
                  ? `Mã giảm giá: ${summary.appliedCouponCode}`
                  : `Coupon: ${summary.appliedCouponCode}`}
              </span>
            </span>
            <span>-{formatVnd(summary.discountAmount)}</span>
          </div>
        )}

        {/* Totals */}
        <div
          className="space-y-2.5 pt-3 border-t text-sm"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>
              {lang === 'vi' ? 'Tạm tính' : 'Subtotal'}
            </span>
            <span
              data-testid="checkout-subtotal"
              className="font-bold"
              style={{ color: 'var(--text)' }}
            >
              {formatVnd(summary.subtotal)}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>
              {lang === 'vi' ? 'Phí vận chuyển' : 'Shipping fee'}
            </span>
            <span
              data-testid="checkout-shipping"
              className="font-bold"
              style={{ color: 'var(--text)' }}
            >
              {summary.shippingFee === 0
                ? lang === 'vi'
                  ? 'Miễn phí (0đ)'
                  : 'Free (0đ)'
                : formatVnd(STANDARD_SHIPPING_FEE)}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>
              {lang === 'vi' ? 'Giảm giá' : 'Discount'}
            </span>
            <span
              data-testid="checkout-discount"
              className="font-bold"
              style={{
                color:
                  summary.discountAmount > 0 ? 'var(--primary)' : 'var(--text)',
              }}
            >
              {summary.discountAmount > 0
                ? `-${formatVnd(summary.discountAmount)}`
                : '0đ'}
            </span>
          </div>
          <div
            className="pt-3 border-t flex items-baseline justify-between"
            style={{ borderColor: 'var(--border)' }}
          >
            <span
              className="text-base font-extrabold"
              style={{ color: 'var(--text)' }}
            >
              {lang === 'vi' ? 'Tổng thanh toán' : 'Total'}
            </span>
            <span
              data-testid="checkout-total"
              className="font-heading text-2xl sm:text-3xl font-extrabold"
              style={{ color: 'var(--primary)' }}
            >
              {formatVnd(summary.total)}
            </span>
          </div>
        </div>

        <button
          type="submit"
          data-testid="checkout-submit-order-btn"
          className="btn-primary w-full h-[52px] rounded-full text-base font-extrabold flex items-center justify-center gap-2 shadow-lg focus-visible:outline-2 focus-visible:outline-[#FF7F6B] cursor-pointer"
        >
          <ShieldCheck className="w-5 h-5" />
          <span>{lang === 'vi' ? 'Đặt hàng ngay' : 'Place order'}</span>
        </button>

        <div className="text-center">
          <a
            href="/gio-hang"
            data-testid="checkout-back-to-cart-link"
            onClick={(e) => handleSpaLinkClick(e, '/gio-hang', onNavigateUrl)}
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 text-sm font-bold hover:underline focus-visible:outline-2 focus-visible:outline-[#FF7F6B] rounded-full cursor-pointer"
            style={{ color: 'var(--primary)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'vi' ? 'Quay lại giỏ hàng' : 'Back to cart'}</span>
          </a>
        </div>
      </div>
    </aside>
  );
};

