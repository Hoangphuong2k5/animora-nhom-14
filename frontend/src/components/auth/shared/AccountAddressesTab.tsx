import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Language, ShippingAddress } from '@/types';

interface AccountAddressesTabProps {
  lang: Language;
  addresses: ShippingAddress[];
  showAddAddress: boolean;
  setShowAddAddress: (val: boolean) => void;
  addrLabel: string;
  setAddrLabel: (val: string) => void;
  addrRecipient: string;
  setAddrRecipient: (val: string) => void;
  addrPhone: string;
  setAddrPhone: (val: string) => void;
  addrLine: string;
  setAddrLine: (val: string) => void;
  onAddAddress: (e: React.FormEvent) => void;
  onSetDefaultAddress: (addrId: string) => void;
  onDeleteAddress: (addrId: string) => void;
}

/** Shared Shipping Address Book tab for AccountManagementPanel. */
export const AccountAddressesTab = ({
  lang,
  addresses,
  showAddAddress,
  setShowAddAddress,
  addrLabel,
  setAddrLabel,
  addrRecipient,
  setAddrRecipient,
  addrPhone,
  setAddrPhone,
  addrLine,
  setAddrLine,
  onAddAddress,
  onSetDefaultAddress,
  onDeleteAddress,
}: AccountAddressesTabProps) => {
  return (
    <div className="space-y-3">
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] flex items-start justify-between gap-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[var(--text)]">{addr.label}</span>
                {addr.isDefault && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)]">
                    {lang === 'vi' ? 'Mặc định' : 'Default'}
                  </span>
                )}
              </div>
              <div className="text-xs text-[var(--text)] font-medium">
                {addr.recipientName} • {addr.phone}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] line-clamp-2 mt-0.5">
                {addr.addressLine}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {!addr.isDefault && (
                <button
                  type="button"
                  onClick={() => onSetDefaultAddress(addr.id)}
                  className="p-1.5 text-xs text-[var(--primary)] hover:underline cursor-pointer"
                >
                  {lang === 'vi' ? 'Đặt mặc định' : 'Set default'}
                </button>
              )}
              <button
                type="button"
                onClick={() => onDeleteAddress(addr.id)}
                aria-label="Delete address"
                className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!showAddAddress ? (
        <button
          type="button"
          onClick={() => setShowAddAddress(true)}
          className="w-full py-2.5 rounded-xl border border-dashed border-[var(--border)] hover:border-[var(--coral)] text-xs font-bold text-[var(--primary)] flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'vi' ? 'Thêm địa chỉ mới' : 'Add New Address'}</span>
        </button>
      ) : (
        <form
          onSubmit={onAddAddress}
          className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] space-y-2"
        >
          <input
            type="text"
            placeholder={
              lang === 'vi' ? 'Nhãn (Nhà riêng / Văn phòng)' : 'Label (Home / Office)'
            }
            value={addrLabel}
            onChange={(e) => setAddrLabel(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder={lang === 'vi' ? 'Người nhận' : 'Recipient'}
              value={addrRecipient}
              onChange={(e) => setAddrRecipient(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs"
            />
            <input
              type="tel"
              placeholder={lang === 'vi' ? 'Số điện thoại' : 'Phone'}
              value={addrPhone}
              onChange={(e) => setAddrPhone(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs"
            />
          </div>
          <input
            type="text"
            placeholder={
              lang === 'vi' ? 'Số nhà, tên đường, quận/huyện...' : 'Street address...'
            }
            value={addrLine}
            onChange={(e) => setAddrLine(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="btn-primary flex-1 py-2 !rounded-lg text-xs font-bold cursor-pointer"
            >
              {lang === 'vi' ? 'Lưu địa chỉ' : 'Save Address'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddAddress(false)}
              className="px-3 py-2 rounded-lg text-xs border border-[var(--border)] cursor-pointer"
            >
              {lang === 'vi' ? 'Hủy' : 'Cancel'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
