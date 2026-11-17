import React from 'react';
import { Language } from '@/types';
import { formatVnd } from '@/utils/cartLogic';
import { handleSpaLinkClick } from '@/utils/spaNavigation';

interface CartMobileBottomBarProps {
  lang: Language;
  total: number;
  isCheckoutValid: boolean;
  onNavigateUrl: (path: string) => void;
}

export const CartMobileBottomBar = ({
  lang,
  total,
  isCheckoutValid,
  onNavigateUrl,
}: CartMobileBottomBarProps) => {
  return (
    <div
      data-testid="cart-mobile-bottom-bar"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t px-4 py-3 shadow-2xl"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
        <div>
          <span
            className="text-xs font-bold block"
            style={{ color: 'var(--text-muted)' }}
          >
            {lang === 'vi' ? 'Tổng thanh toán' : 'Total'}
          </span>
          <span
            data-testid="cart-mobile-total"
            className="font-heading text-xl font-extrabold"
            style={{ color: 'var(--primary)' }}
          >
            {formatVnd(total)}
          </span>
        </div>

        {isCheckoutValid ? (
          <a
            href="/thanh-toan"
            data-testid="cart-mobile-checkout-btn"
            onClick={(e) => handleSpaLinkClick(e, '/thanh-toan', onNavigateUrl)}
            className="btn-primary min-h-[48px] px-6 rounded-full text-sm font-extrabold inline-flex items-center justify-center gap-2 shadow-md focus-visible:outline-2 focus-visible:outline-[#FF7F6B] cursor-pointer"
          >
            <span>{lang === 'vi' ? 'Thanh toán' : 'Checkout'}</span>
          </a>
        ) : (
          <button
            type="button"
            disabled
            data-testid="cart-mobile-checkout-btn"
            className="btn-primary min-h-[48px] px-6 rounded-full text-sm font-extrabold inline-flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
          >
            <span>{lang === 'vi' ? 'Thanh toán' : 'Checkout'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

