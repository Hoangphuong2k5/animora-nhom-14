import React, { useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  FileText,
  MapPin,
  Phone,
  Plus,
  Truck,
  User,
} from 'lucide-react';
import { Language, ShippingAddress, UserAccount } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { CheckoutFormErrors } from '@/hooks/shop/useCheckoutForm';

interface CheckoutShippingFormProps {
  lang: Language;
  errorTextColor: string;
  currentUser?: UserAccount | null;
  savedAddresses?: ShippingAddress[];
  selectedAddressId?: string | null;
  recipientName: string;
  phone: string;
  address: string;
  orderNote: string;
  paymentMethod: 'cod' | 'bank';
  errors: CheckoutFormErrors;
  onSelectSavedAddress?: (saved: ShippingAddress) => void;
  onAddSavedAddress?: (payload: {
    label: string;
    recipientName: string;
    phone: string;
    addressLine: string;
    isDefault: boolean;
  }) => void;
  onChangeRecipientName: (value: string) => void;
  onChangePhone: (value: string) => void;
  onChangeAddress: (value: string) => void;
  onChangeOrderNote: (value: string) => void;
  onChangePaymentMethod: (method: 'cod' | 'bank') => void;
}

export const CheckoutShippingForm = ({
  lang,
  errorTextColor,
  currentUser = null,
  savedAddresses = [],
  selectedAddressId = null,
  recipientName,
  phone,
  address,
  orderNote,
  paymentMethod,
  errors,
  onSelectSavedAddress,
  onAddSavedAddress,
  onChangeRecipientName,
  onChangePhone,
  onChangeAddress,
  onChangeOrderNote,
  onChangePaymentMethod,
}: CheckoutShippingFormProps) => {
  const isVi = lang === 'vi';
  const labelPresets = isVi
    ? ['Nhà riêng', 'Công ty', 'Nhà người thân']
    : ['Home', 'Office', 'Family'];
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLabelPreset, setSelectedLabelPreset] = useState<string>(
    isVi ? 'Nhà riêng' : 'Home'
  );
  const [customLabel, setCustomLabel] = useState('');
  const [newRecipient, setNewRecipient] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddressLine, setNewAddressLine] = useState('');
  const [newIsDefault, setNewIsDefault] = useState(true);
  const [addAddrError, setAddAddrError] = useState('');

  const handleOpenAddForm = () => {
    setSelectedLabelPreset(isVi ? 'Nhà riêng' : 'Home');
    setCustomLabel('');
    setNewRecipient(recipientName || currentUser?.fullName || '');
    setNewPhone(phone || currentUser?.phone || '');
    setNewAddressLine('');
    setNewIsDefault(savedAddresses.length === 0);
    setAddAddrError('');
    setShowAddForm(true);
  };

  const handleSaveNewAddress = () => {
    if (!newRecipient.trim() || !newPhone.trim() || !newAddressLine.trim()) {
      setAddAddrError(
        isVi
          ? 'Vui lòng nhập đầy đủ người nhận, số điện thoại và địa chỉ chi tiết.'
          : 'Please complete recipient name, phone number, and street address.'
      );
      return;
    }
    const digits = newPhone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 11) {
      setAddAddrError(
        isVi
          ? 'Số điện thoại không hợp lệ (cần 10-11 chữ số).'
          : 'Invalid phone number (10-11 digits required).'
      );
      return;
    }

    const resolvedLabel =
      selectedLabelPreset === '__custom__'
        ? customLabel.trim() || (isVi ? 'Khác' : 'Other')
        : selectedLabelPreset;

    onAddSavedAddress?.({
      label: resolvedLabel,
      recipientName: newRecipient.trim(),
      phone: newPhone.trim(),
      addressLine: newAddressLine.trim(),
      isDefault: newIsDefault,
    });
    setShowAddForm(false);
    setAddAddrError('');
  };

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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            className="font-heading text-xl sm:text-2xl font-extrabold"
            style={{ color: 'var(--primary)' }}
          >
            {isVi ? 'Thông tin nhận hàng' : 'Shipping details'}
          </h2>

          {currentUser && onAddSavedAddress && !showAddForm && (
            <button
              type="button"
              data-testid="checkout-add-address-btn"
              onClick={handleOpenAddForm}
              className="btn-secondary px-3.5 py-2 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isVi ? 'Thêm địa chỉ mới' : 'Add new address'}</span>
            </button>
          )}
        </div>

        {/* Sổ địa chỉ đã lưu của tài khoản khách hàng */}
        {currentUser && onAddSavedAddress && (
          <div className="space-y-3">
            {savedAddresses.length > 0 ? (
              <div className="space-y-2">
                <p
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {isVi
                    ? `Địa chỉ đã lưu (${savedAddresses.length})`
                    : `Saved addresses (${savedAddresses.length})`}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <button
                        key={addr.id}
                        type="button"
                        data-testid={`checkout-saved-addr-${addr.id}`}
                        onClick={() => onSelectSavedAddress?.(addr)}
                        className="text-left p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1"
                        style={{
                          backgroundColor: isSelected
                            ? 'var(--surface-2)'
                            : 'var(--bg)',
                          borderColor: isSelected
                            ? 'var(--primary)'
                            : 'var(--border)',
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className="text-xs font-extrabold"
                              style={{ color: 'var(--primary)' }}
                            >
                              {addr.label}
                            </span>
                            {addr.isDefault && (
                              <span
                                className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                style={{
                                  backgroundColor: 'var(--primary)',
                                  color: 'var(--on-primary)',
                                }}
                              >
                                {isVi ? 'Mặc định' : 'Default'}
                              </span>
                            )}
                          </div>
                          {isSelected && (
                            <CheckCircle2
                              className="w-4 h-4 shrink-0"
                              style={{ color: 'var(--primary)' }}
                            />
                          )}
                        </div>
                        <div
                          className="text-xs font-bold"
                          style={{ color: 'var(--text)' }}
                        >
                          {addr.recipientName} · {addr.phone}
                        </div>
                        <div
                          className="text-xs line-clamp-2"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {addr.addressLine}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              !showAddForm && (
                <div
                  className="p-4 rounded-2xl border border-dashed flex flex-wrap items-center justify-between gap-3"
                  style={{
                    backgroundColor: 'var(--bg)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="space-y-0.5">
                    <p
                      className="text-sm font-bold"
                      style={{ color: 'var(--text)' }}
                    >
                      {isVi
                        ? 'Bạn chưa có địa chỉ nhận hàng nào được lưu'
                        : 'No saved shipping address yet'}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {isVi
                        ? 'Thêm địa chỉ để lưu vào tài khoản và tự động điền cho các lần mua sau.'
                        : 'Add an address to save to your account for faster future checkouts.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    data-testid="checkout-empty-add-address-btn"
                    onClick={handleOpenAddForm}
                    className="btn-primary px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isVi ? 'Thêm địa chỉ mới' : 'Add new address'}</span>
                  </button>
                </div>
              )
            )}

            {showAddForm && (
              <div
                data-testid="checkout-add-address-panel"
                className="p-4 rounded-2xl border space-y-3"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--primary)',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-sm font-extrabold inline-flex items-center gap-1.5"
                    style={{ color: 'var(--primary)' }}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>
                      {isVi
                        ? 'Thêm địa chỉ nhận hàng mới'
                        : 'Add new shipping address'}
                    </span>
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="text-xs font-bold"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {isVi ? 'Loại địa chỉ:' : 'Address label:'}
                    </span>
                    {[
                      ...labelPresets.map((preset) => ({
                        value: preset,
                        text: preset,
                      })),
                      { value: '__custom__', text: isVi ? 'Khác' : 'Other' },
                    ].map((opt) => {
                      const active = selectedLabelPreset === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSelectedLabelPreset(opt.value)}
                          className="px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer"
                          style={{
                            backgroundColor: active
                              ? 'var(--primary)'
                              : 'var(--surface)',
                            borderColor: active
                              ? 'var(--primary)'
                              : 'var(--border)',
                            color: active
                              ? 'var(--on-primary)'
                              : 'var(--text)',
                          }}
                        >
                          {opt.text}
                        </button>
                      );
                    })}
                  </div>

                  {selectedLabelPreset === '__custom__' && (
                    <input
                      type="text"
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value)}
                      placeholder={
                        isVi
                          ? 'Nhập nhãn tùy chỉnh (VD: Ký túc xá, Cửa hàng...)'
                          : 'Enter custom label (e.g. Dorm, Studio...)'
                      }
                      className="form-input w-full text-sm"
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    placeholder={
                      isVi ? 'Họ và tên người nhận *' : 'Recipient name *'
                    }
                    className="form-input w-full text-sm"
                  />
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder={isVi ? 'Số điện thoại *' : 'Phone number *'}
                    className="form-input w-full text-sm"
                  />
                </div>

                <input
                  type="text"
                  value={newAddressLine}
                  onChange={(e) => setNewAddressLine(e.target.value)}
                  placeholder={
                    isVi
                      ? 'Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP *'
                      : 'Street, ward, district, city *'
                  }
                  className="form-input w-full text-sm"
                />

                <label
                  className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer select-none"
                  style={{ color: 'var(--text)' }}
                >
                  <input
                    type="checkbox"
                    checked={newIsDefault}
                    onChange={(e) => setNewIsDefault(e.target.checked)}
                    className="accent-[var(--primary)] w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>
                    {isVi
                      ? 'Đặt làm địa chỉ mặc định cho các lần mua sau'
                      : 'Set as default address for future orders'}
                  </span>
                </label>

                {addAddrError && (
                  <p
                    role="alert"
                    className="text-xs font-bold"
                    style={{ color: errorTextColor }}
                  >
                    {addAddrError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setAddAddrError('');
                    }}
                    className="btn-secondary px-4 py-2 text-xs font-bold cursor-pointer"
                  >
                    {isVi ? 'Hủy' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    data-testid="checkout-save-new-address-btn"
                    onClick={handleSaveNewAddress}
                    className="btn-primary px-4 py-2 text-xs font-bold cursor-pointer"
                  >
                    {isVi ? 'Lưu vào tài khoản' : 'Save address'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

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

