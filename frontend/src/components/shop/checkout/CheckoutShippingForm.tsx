import React from 'react';
import {
  CreditCard,
  FileText,
  MapPin,
  Phone,
  Truck,
  User,
} from 'lucide-react';
import { Language } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { CheckoutFormErrors } from '@/hooks/shop/useCheckoutForm';

interface CheckoutShippingFormProps {
  lang: Language;
  errorTextColor: string;
  recipientName: string;
  phone: string;
  address: string;
  orderNote: string;
  paymentMethod: 'cod' | 'bank';
  errors: CheckoutFormErrors;
  onChangeRecipientName: (value: string) => void;
  onChangePhone: (value: string) => void;
  onChangeAddress: (value: string) => void;
  onChangeOrderNote: (value: string) => void;
  onChangePaymentMethod: (method: 'cod' | 'bank') => void;
}

export const CheckoutShippingForm = ({
  lang,
  errorTextColor,
  recipientName,
  phone,
  address,
  orderNote,
  paymentMethod,
  errors,
  onChangeRecipientName,
  onChangePhone,
  onChangeAddress,
  onChangeOrderNote,
  onChangePaymentMethod,
}: CheckoutShippingFormProps) => {
  return (
    <div className="w-full lg:w-[62%] space-y-6">
      <div
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
          {lang === 'vi' ? 'Thông tin nhận hàng' : 'Shipping details'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="checkout-name"
              className="flex items-center gap-1.5 text-sm font-bold"
              style={{ color: 'var(--text)' }}
            >
              <User className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              <span>
                {lang === 'vi' ? 'Họ và tên người nhận *' : 'Recipient name *'}
              </span>
            </label>
            <input
              id="checkout-name"
              data-testid="checkout-name-input"
              type="text"
              value={recipientName}
              onChange={(e) => onChangeRecipientName(e.target.value)}
              placeholder={lang === 'vi' ? 'Nguyễn Thảo Nhi' : 'Full name'}
              className="form-input w-full"
            />
            {errors.recipientName && (
              <p
                role="alert"
                className="text-xs font-bold"
                style={{ color: errorTextColor }}
              >
                {errors.recipientName}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="checkout-phone"
              className="flex items-center gap-1.5 text-sm font-bold"
              style={{ color: 'var(--text)' }}
            >
              <Phone className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              <span>{lang === 'vi' ? 'Số điện thoại *' : 'Phone number *'}</span>
            </label>
            <input
              id="checkout-phone"
              data-testid="checkout-phone-input"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => onChangePhone(e.target.value)}
              placeholder="0901234567"
              className="form-input w-full"
            />
            {errors.phone && (
              <p
                role="alert"
                className="text-xs font-bold"
                style={{ color: errorTextColor }}
              >
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="checkout-address"
            className="flex items-center gap-1.5 text-sm font-bold"
            style={{ color: 'var(--text)' }}
          >
            <MapPin className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            <span>
              {lang === 'vi'
                ? 'Địa chỉ nhận hàng chi tiết *'
                : 'Shipping address *'}
            </span>
          </label>
          <input
            id="checkout-address"
            data-testid="checkout-address-input"
            type="text"
            value={address}
            onChange={(e) => onChangeAddress(e.target.value)}
            placeholder={
              lang === 'vi'
                ? 'Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố'
                : 'Street address, ward, district, city'
            }
            className="form-input w-full"
          />
          {errors.address && (
            <p
              role="alert"
              className="text-xs font-bold"
              style={{ color: errorTextColor }}
            >
              {errors.address}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="checkout-order-note"
            className="flex items-center gap-1.5 text-sm font-bold"
            style={{ color: 'var(--text)' }}
          >
            <FileText className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            <span>{lang === 'vi' ? 'Ghi chú đơn hàng' : 'Order note'}</span>
          </label>
          <Textarea
            id="checkout-order-note"
            data-testid="checkout-order-note"
            rows={2}
            value={orderNote}
            onChange={(e) => onChangeOrderNote(e.target.value)}
            placeholder={
              lang === 'vi'
                ? 'Ghi chú giao hàng cho shipper...'
                : 'Delivery instructions...'
            }
            className="w-full rounded-2xl border p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F6B]"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          />
        </div>
      </div>

      {/* Payment Method */}
      <div
        className="rounded-[24px] border p-5 sm:p-7 space-y-4"
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
          {lang === 'vi' ? 'Phương thức thanh toán' : 'Payment method'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChangePaymentMethod('cod')}
            aria-pressed={paymentMethod === 'cod'}
            className="p-4 rounded-2xl border text-left flex items-start gap-3 transition-all focus-visible:outline-2 focus-visible:outline-[#FF7F6B] cursor-pointer"
            style={{
              backgroundColor:
                paymentMethod === 'cod' ? 'var(--surface-2)' : 'var(--bg)',
              borderColor:
                paymentMethod === 'cod' ? 'var(--primary)' : 'var(--border)',
            }}
          >
            <Truck
              className="w-5 h-5 shrink-0 mt-0.5"
              style={{ color: 'var(--primary)' }}
            />
            <div>
              <p className="text-sm font-extrabold" style={{ color: 'var(--text)' }}>
                {lang === 'vi'
                  ? 'Thanh toán khi nhận hàng (COD)'
                  : 'Cash on Delivery (COD)'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {lang === 'vi'
                  ? 'Kiểm tra hàng trước khi thanh toán'
                  : 'Inspect package upon delivery'}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onChangePaymentMethod('bank')}
            aria-pressed={paymentMethod === 'bank'}
            className="p-4 rounded-2xl border text-left flex items-start gap-3 transition-all focus-visible:outline-2 focus-visible:outline-[#FF7F6B] cursor-pointer"
            style={{
              backgroundColor:
                paymentMethod === 'bank' ? 'var(--surface-2)' : 'var(--bg)',
              borderColor:
                paymentMethod === 'bank' ? 'var(--primary)' : 'var(--border)',
            }}
          >
            <CreditCard
              className="w-5 h-5 shrink-0 mt-0.5"
              style={{ color: 'var(--primary)' }}
            />
            <div>
              <p className="text-sm font-extrabold" style={{ color: 'var(--text)' }}>
                {lang === 'vi'
                  ? 'Chuyển khoản ngân hàng / VietQR'
                  : 'Bank Transfer / VietQR'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {lang === 'vi'
                  ? 'Xác nhận tự động qua mã QR'
                  : 'Instant verification via QR'}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

