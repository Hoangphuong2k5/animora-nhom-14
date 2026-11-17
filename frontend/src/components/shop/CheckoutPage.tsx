import React from 'react';
import { CartItem, Language, PageId, Product, UserAccount } from '@/types';
import { useCheckoutForm } from '@/hooks/shop/useCheckoutForm';
import { CheckoutSuccessView } from './checkout/CheckoutSuccessView';
import { CheckoutShippingForm } from './checkout/CheckoutShippingForm';
import { CheckoutOrderSummary } from './checkout/CheckoutOrderSummary';

interface CheckoutPageProps {
  lang: Language;
  darkMode?: boolean;
  cart: CartItem[];
  isCartHydrated?: boolean;
  products: Product[];
  currentUser: UserAccount | null;
  appliedCoupon: string;
  orderNote: string;
  onChangeOrderNote: (note: string) => void;
  onReturnToCartWithNotice: (notice: string) => void;
  onClearInvalidCoupon?: () => void;
  onCompleteOrder: (orderDetails: {
    orderCode: string;
    recipientName: string;
    phone: string;
    address: string;
    paymentMethod: 'cod' | 'bank';
    note: string;
    total: number;
  }) => void;
  onNavigate: (page: PageId) => void;
  onNavigateUrl: (path: string) => void;
}

export const CheckoutPage = ({
  lang,
  darkMode = false,
  cart,
  isCartHydrated = true,
  products,
  currentUser,
  appliedCoupon,
  orderNote,
  onChangeOrderNote,
  onReturnToCartWithNotice,
  onClearInvalidCoupon,
  onCompleteOrder,
  onNavigateUrl,
}: CheckoutPageProps) => {
  const {
    recipientName,
    phone,
    address,
    paymentMethod,
    errors,
    submittedOrder,
    summary,
    setRecipientName,
    setPhone,
    setAddress,
    setPaymentMethod,
    handleSubmitOrder,
  } = useCheckoutForm({
    lang,
    cart,
    isCartHydrated,
    products,
    currentUser,
    appliedCoupon,
    orderNote,
    onReturnToCartWithNotice,
    onClearInvalidCoupon,
    onCompleteOrder,
  });

  if (submittedOrder) {
    return (
      <CheckoutSuccessView
        lang={lang}
        order={submittedOrder}
        onNavigateUrl={onNavigateUrl}
      />
    );
  }

  const errorTextColor = darkMode ? '#FDA29B' : '#B42318';

  return (
    <div
      data-testid="checkout-page"
      className="pt-[calc(var(--nav-h)+24px)] pb-20 min-h-screen relative z-10"
    >
      <div className="shared-container space-y-8">
        <div className="space-y-2.5 max-w-2xl">
          <span
            data-testid="checkout-page-eyebrow"
            className="block uppercase font-bold"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'var(--primary)',
            }}
          >
            {lang === 'vi' ? 'THANH TOÁN' : 'CHECKOUT'}
          </span>
          <h1
            className="font-heading font-extrabold leading-[1.14] tracking-[-0.02em]"
            style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              color: 'var(--primary)',
            }}
          >
            {lang === 'vi' ? 'Thanh toán đơn hàng' : 'Checkout'}
          </h1>
          <p
            data-testid="checkout-page-subtitle"
            className="text-[18px] leading-relaxed font-normal"
            style={{ color: 'var(--text-muted)' }}
          >
            {lang === 'vi'
              ? 'Điền thông tin nhận hàng và chọn phương thức thanh toán thuận tiện nhất.'
              : 'Enter your shipping details and choose your preferred payment method.'}
          </p>
        </div>

        <form
          onSubmit={handleSubmitOrder}
          noValidate
          className="flex flex-col lg:flex-row items-start gap-7"
        >
          <CheckoutShippingForm
            lang={lang}
            errorTextColor={errorTextColor}
            recipientName={recipientName}
            phone={phone}
            address={address}
            orderNote={orderNote}
            paymentMethod={paymentMethod}
            errors={errors}
            onChangeRecipientName={setRecipientName}
            onChangePhone={setPhone}
            onChangeAddress={setAddress}
            onChangeOrderNote={onChangeOrderNote}
            onChangePaymentMethod={setPaymentMethod}
          />

          <CheckoutOrderSummary
            lang={lang}
            cart={cart}
            products={products}
            summary={summary}
            onNavigateUrl={onNavigateUrl}
          />
        </form>
      </div>
    </div>
  );
};
