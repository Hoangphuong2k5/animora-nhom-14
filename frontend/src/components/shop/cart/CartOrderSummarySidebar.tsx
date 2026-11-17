import React from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  CreditCard,
  RefreshCw,
  ShieldCheck,
  Tag,
  Truck,
} from 'lucide-react';
import { Language } from '@/types';
import { calculateCartSummary, formatVnd } from '@/utils/cartLogic';
import { STANDARD_SHIPPING_FEE } from '@/constants/cart.constant';
import { handleSpaLinkClick } from '@/utils/spaNavigation';
import { Textarea } from '@/components/ui/textarea';

interface CartOrderSummarySidebarProps {
  lang: Language;
  summary: ReturnType<typeof calculateCartSummary>;
  isCheckoutValid: boolean;
  couponInput: string;
  couponError: string | null;
  couponSuccess: string | null;
  orderNote: string;
  errorTextColor: string;
  onChangeCouponInput: (value: string) => void;
  onSubmitCoupon: (e: React.FormEvent) => void;
  onRemoveCoupon: () => void;
  onChangeOrderNote: (note: string) => void;
  onNavigateUrl: (path: string) => void;
}

export const CartOrderSummarySidebar = ({
  lang,
  summary,
  isCheckoutValid,
  couponInput,
  couponError,
  couponSuccess,
  orderNote,
  errorTextColor,
  onChangeCouponInput,
  onSubmitCoupon,
  onRemoveCoupon,
  onChangeOrderNote,
  onNavigateUrl,
}: CartOrderSummarySidebarProps) => {
  return (
    <aside
      aria-label={lang === 'vi' ? 'Tóm tắt đơn hàng' : 'Order summary'}
      className="w-full lg:w-[38%] lg:sticky lg:top-[calc(var(--nav-h)+24px)] space-y-4"
    >
      <div
        data-testid="cart-summary-card"
        className="rounded-[24px] border p-5 sm:p-7 space-y-5"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <h2
          className="font-heading text-xl sm:text-2xl font-extrabold"
          style={{ color: 'var(--primary)' }}
        >
          {lang === 'vi' ? 'Tóm tắt đơn hàng' : 'Order summary'}
        </h2>

        {/* Free-shipping progress bar */}
        <div
          data-testid="cart-free-shipping-box"
          className="p-3.5 rounded-2xl border space-y-2"
          style={{
            backgroundColor: 'var(--bg)',
            borderColor: 'var(--border)',
          }}
        >
          <div
            className="flex items-center gap-2 text-xs sm:text-sm font-bold"
            style={{ color: 'var(--text)' }}
          >
            {summary.remainingForFreeShip > 0 ? (
              <>
                <Truck
                  className="w-4 h-4 shrink-0"
                  style={{ color: 'var(--primary)' }}
                />
                <span>
                  {lang === 'vi'
                    ? `Mua thêm ${formatVnd(summary.remainingForFreeShip)} để được miễn phí vận chuyển`
                    : `Add ${formatVnd(summary.remainingForFreeShip)} more for free shipping`}
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span style={{ color: 'var(--primary)' }}>
                  {lang === 'vi'
                    ? 'Bạn được miễn phí vận chuyển!'
                    : 'You unlocked free shipping!'}
                </span>
              </>
            )}
          </div>
          <div
            className="w-full h-2.5 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--surface-2)' }}
          >
            <div
              data-testid="cart-free-shipping-progress"
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${summary.freeShipProgressPercent}%`,
                backgroundColor: 'var(--primary)',
              }}
            />
          </div>
        </div>

        {/* Coupon Field */}
        <div className="space-y-2">
          <label
            htmlFor="cart-coupon-input"
            className="block text-xs sm:text-sm font-bold"
            style={{ color: 'var(--text)' }}
          >
            {lang === 'vi' ? 'Mã giảm giá' : 'Coupon code'}
          </label>
          <form onSubmit={onSubmitCoupon} className="flex gap-2" noValidate>
            <div className="relative flex-1">
              <Tag
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                id="cart-coupon-input"
                data-testid="cart-coupon-input"
                type="text"
                value={couponInput}
                onChange={(e) => onChangeCouponInput(e.target.value)}
                placeholder={
                  lang === 'vi'
                    ? 'Nhập mã (VD: ANIMORA10)'
                    : 'Enter code (e.g. ANIMORA10)'
                }
                className="form-input w-full pl-9 pr-3 uppercase font-bold text-sm"
              />
            </div>
            <button
              type="submit"
              data-testid="cart-coupon-apply-btn"
              className="btn-secondary min-h-[48px] px-4 rounded-2xl text-sm font-bold shrink-0 focus-visible:outline-2 focus-visible:outline-[#FF7F6B] cursor-pointer"
            >
              {lang === 'vi' ? 'Áp dụng' : 'Apply'}
            </button>
          </form>

          {couponError && (
            <p
              role="alert"
              data-testid="cart-coupon-error"
              className="text-xs sm:text-[13px] font-bold flex items-center gap-1.5 pt-0.5"
              style={{ color: errorTextColor }}
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{couponError}</span>
            </p>
          )}

          {summary.appliedCouponCode && (
            <div
              data-testid="cart-applied-coupon-tag"
              className="flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold"
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: 'var(--border)',
                color: 'var(--primary)',
              }}
            >
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {lang === 'vi'
                    ? `Mã ${summary.appliedCouponCode}: -${formatVnd(summary.discountAmount)}`
                    : `Code ${summary.appliedCouponCode}: -${formatVnd(summary.discountAmount)}`}
                </span>
              </span>
              <button
                type="button"
                data-testid="cart-remove-coupon-btn"
                onClick={onRemoveCoupon}
                className="underline font-extrabold ml-2 focus-visible:outline-2 focus-visible:outline-[#FF7F6B] cursor-pointer"
              >
                {lang === 'vi' ? 'Gỡ' : 'Remove'}
              </button>
            </div>
          )}

          {couponSuccess && !couponError && !summary.appliedCouponCode && (
            <p className="text-xs font-bold" style={{ color: 'var(--primary)' }}>
              {couponSuccess}
            </p>
          )}
        </div>

        {/* Price breakdown */}
        <div
          className="space-y-3 pt-3 border-t text-sm"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>
              {lang === 'vi' ? 'Tạm tính' : 'Subtotal'}
            </span>
            <span
              data-testid="cart-summary-subtotal"
              className="font-bold"
              style={{ color: 'var(--text)' }}
            >
              {formatVnd(summary.subtotal)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>
              {lang === 'vi' ? 'Phí vận chuyển tạm tính' : 'Estimated shipping'}
            </span>
            <span
              data-testid="cart-summary-shipping"
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

          <div className="flex items-center justify-between">
            <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>
              {lang === 'vi' ? 'Giảm giá' : 'Discount'}
            </span>
            <span
              data-testid="cart-summary-discount"
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
              {lang === 'vi' ? 'Tổng cộng' : 'Total'}
            </span>
            <span
              data-testid="cart-summary-total"
              className="font-heading text-2xl sm:text-3xl font-extrabold"
              style={{ color: 'var(--primary)' }}
            >
              {formatVnd(summary.total)}
            </span>
          </div>
        </div>

        {/* Optional Order Note */}
        <div className="space-y-1.5">
          <label
            htmlFor="cart-order-note"
            className="block text-xs sm:text-sm font-bold"
            style={{ color: 'var(--text)' }}
          >
            {lang === 'vi'
              ? 'Ghi chú đơn hàng (không bắt buộc)'
              : 'Order note (optional)'}
          </label>
          <Textarea
            id="cart-order-note"
            data-testid="cart-order-note"
            rows={2}
            value={orderNote}
            onChange={(e) => onChangeOrderNote(e.target.value)}
            placeholder={
              lang === 'vi'
                ? 'Ví dụ: Giao giờ hành chính, gọi trước khi giao...'
                : 'E.g., Deliver during business hours, call before arrival...'
            }
            className="w-full rounded-2xl border p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F6B]"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          />
        </div>

        {/* Primary CTA */}
        <div className="space-y-3 pt-1">
          {isCheckoutValid ? (
            <a
              href="/thanh-toan"
              data-testid="cart-proceed-checkout-btn"
              onClick={(e) => handleSpaLinkClick(e, '/thanh-toan', onNavigateUrl)}
              className="btn-primary w-full h-[52px] rounded-full text-base font-extrabold flex items-center justify-center gap-2 shadow-lg focus-visible:outline-2 focus-visible:outline-[#FF7F6B] cursor-pointer"
            >
              <span>
                {lang === 'vi'
                  ? 'Tiến hành thanh toán'
                  : 'Proceed to checkout'}
              </span>
            </a>
          ) : (
            <button
              type="button"
              disabled
              data-testid="cart-proceed-checkout-btn"
              aria-disabled="true"
              className="btn-primary w-full h-[52px] rounded-full text-base font-extrabold flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
            >
              <span>
                {lang === 'vi'
                  ? 'Tiến hành thanh toán'
                  : 'Proceed to checkout'}
              </span>
            </button>
          )}

          <div className="text-center">
            <a
              href="/cua-hang"
              data-testid="cart-continue-shopping-link"
              onClick={(e) => handleSpaLinkClick(e, '/cua-hang', onNavigateUrl)}
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 text-sm font-bold hover:underline focus-visible:outline-2 focus-visible:outline-[#FF7F6B] rounded-full cursor-pointer"
              style={{ color: 'var(--primary)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>
                {lang === 'vi' ? 'Tiếp tục mua sắm' : 'Continue shopping'}
              </span>
            </a>
          </div>
        </div>

        {/* Trust Row */}
        <div
          className="pt-4 border-t grid grid-cols-2 gap-2.5 text-xs font-bold"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--text-muted)',
          }}
        >
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 shrink-0" style={{ color: 'var(--primary)' }} />
            <span>{lang === 'vi' ? 'Giao nhanh' : 'Fast delivery'}</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 shrink-0" style={{ color: 'var(--primary)' }} />
            <span>{lang === 'vi' ? 'Đổi trả 7 ngày' : '7-day returns'}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: 'var(--primary)' }} />
            <span>{lang === 'vi' ? 'Hàng chính hãng' : '100% authentic'}</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 shrink-0" style={{ color: 'var(--primary)' }} />
            <span>{lang === 'vi' ? 'COD' : 'Cash on delivery'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

