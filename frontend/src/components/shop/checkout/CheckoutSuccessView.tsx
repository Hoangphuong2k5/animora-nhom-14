import React from 'react';
import { CheckCircle2, Package, ShoppingBag } from 'lucide-react';
import { Language } from '@/types';
import { formatVnd } from '@/utils/cartLogic';
import { handleSpaLinkClick } from '@/utils/spaNavigation';
import { SubmittedOrderInfo } from '@/hooks/shop/useCheckoutForm';

interface CheckoutSuccessViewProps {
  lang: Language;
  order: SubmittedOrderInfo;
  onNavigateUrl: (path: string) => void;
}

export const CheckoutSuccessView = ({
  lang,
  order,
  onNavigateUrl,
}: CheckoutSuccessViewProps) => {
  return (
    <div
      data-testid="checkout-success"
      className="pt-[calc(var(--nav-h)+32px)] pb-20 min-h-screen relative z-10"
    >
      <div className="shared-container max-w-2xl mx-auto">
        <div
          className="rounded-[24px] border p-8 sm:p-12 text-center space-y-6"
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
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span
              className="text-xs font-extrabold uppercase tracking-widest"
              style={{ color: 'var(--primary)' }}
            >
              {lang === 'vi' ? 'ĐẶT HÀNG THÀNH CÔNG' : 'ORDER CONFIRMED'}
            </span>
            <h1
              className="font-heading text-2xl sm:text-4xl font-extrabold"
              style={{ color: 'var(--primary)' }}
            >
              {lang === 'vi'
                ? `Cảm ơn ${order.recipientName}!`
                : `Thank you, ${order.recipientName}!`}
            </h1>
            <p
              className="text-sm sm:text-base font-medium"
              style={{ color: 'var(--text-muted)' }}
            >
              {lang === 'vi'
                ? `Mã đơn hàng ${order.orderCode} đang được đội ngũ Animora chuẩn bị đóng gói.`
                : `Order ${order.orderCode} is being prepared by the Animora team.`}
            </p>
          </div>

          <div
            className="p-5 rounded-2xl border text-left space-y-2.5 text-sm"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex justify-between gap-2">
              <span style={{ color: 'var(--text-muted)' }}>
                {lang === 'vi' ? 'Mã đơn hàng:' : 'Order code:'}
              </span>
              <span className="font-extrabold" style={{ color: 'var(--primary)' }}>
                {order.orderCode}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span style={{ color: 'var(--text-muted)' }}>
                {lang === 'vi' ? 'Người nhận:' : 'Recipient:'}
              </span>
              <span className="font-bold" style={{ color: 'var(--text)' }}>
                {order.recipientName} · {order.phone}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span style={{ color: 'var(--text-muted)' }}>
                {lang === 'vi' ? 'Địa chỉ:' : 'Address:'}
              </span>
              <span
                className="font-bold text-right"
                style={{ color: 'var(--text)' }}
              >
                {order.address}
              </span>
            </div>
            {order.note && (
              <div className="flex justify-between gap-2">
                <span style={{ color: 'var(--text-muted)' }}>
                  {lang === 'vi' ? 'Ghi chú:' : 'Order note:'}
                </span>
                <span
                  className="font-bold text-right"
                  style={{ color: 'var(--text)' }}
                >
                  {order.note}
                </span>
              </div>
            )}
            <div
              className="pt-2.5 border-t flex justify-between items-baseline"
              style={{ borderColor: 'var(--border)' }}
            >
              <span className="font-bold" style={{ color: 'var(--text)' }}>
                {lang === 'vi' ? 'Tổng thanh toán:' : 'Total amount:'}
              </span>
              <span
                className="font-heading text-xl font-extrabold"
                style={{ color: 'var(--primary)' }}
              >
                {formatVnd(order.total)}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/don-hang"
              data-testid="checkout-view-orders-btn"
              onClick={(e) => handleSpaLinkClick(e, '/don-hang', onNavigateUrl)}
              className="btn-secondary min-h-[48px] px-6 rounded-full text-sm font-bold inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-[#FF7F6B] cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>
                {lang === 'vi' ? 'Xem đơn hàng của tôi' : 'View my orders'}
              </span>
            </a>
            <a
              href="/cua-hang"
              onClick={(e) => handleSpaLinkClick(e, '/cua-hang', onNavigateUrl)}
              className="btn-primary min-h-[48px] px-7 rounded-full text-sm font-bold inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-[#FF7F6B] cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                {lang === 'vi' ? 'Tiếp tục mua sắm' : 'Continue shopping'}
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

