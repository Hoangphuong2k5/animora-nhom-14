import React from 'react';
import { PhoneInput } from '@/components/common/forms/PhoneInput';
import { Textarea } from '@/components/ui/textarea';

export const CheckoutForm = ({ fullName, phone, address, onChangeName, onChangePhone, onChangeAddress }: {
  fullName: string;
  phone: string;
  address: string;
  onChangeName: (v: string) => void;
  onChangePhone: (v: string) => void;
  onChangeAddress: (v: string) => void;
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-bold text-[var(--text)]">Họ tên người nhận *</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => onChangeName(e.target.value)}
          className="form-input w-full mt-1"
          placeholder="Nguyễn Văn A"
        />
      </div>
      <PhoneInput
        value={phone}
        onChange={onChangePhone}
        label="Số điện thoại *"
        required
      />
      <div>
        <label className="text-sm font-bold text-[var(--text)]">Địa chỉ giao hàng *</label>
        <Textarea
          value={address}
          onChange={(e) => onChangeAddress(e.target.value)}
          className="form-input w-full mt-1 min-h-[80px]"
          placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
        />
      </div>
    </div>
  );
};
