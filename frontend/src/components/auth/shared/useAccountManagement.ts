import React, { useState } from 'react';
import { Language, ShippingAddress, UserAccount } from '@/types';

interface UseAccountManagementParams {
  lang: Language;
  currentUser: UserAccount | null;
  onUpdateUser: (updatedUser: UserAccount) => void;
  setErrorMsg: (msg: string) => void;
  setSuccessBanner: (msg: string) => void;
}

/**
 * Shared account management hook (profile editing, shipping addresses CRUD,
 * and password change with currentPassInput verification).
 */
export function useAccountManagement({
  lang,
  currentUser,
  onUpdateUser,
  setErrorMsg,
  setSuccessBanner,
}: UseAccountManagementParams) {
  const [accountTab, setAccountTab] = useState<'profile' | 'addresses' | 'security'>(
    'profile'
  );
  const [editName, setEditName] = useState(currentUser?.fullName ?? '');
  const [editEmail, setEditEmail] = useState(currentUser?.email ?? '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone ?? '');

  // Address Form State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addrLabel, setAddrLabel] = useState('');
  const [addrRecipient, setAddrRecipient] = useState(currentUser?.fullName ?? '');
  const [addrPhone, setAddrPhone] = useState(currentUser?.phone ?? '');
  const [addrLine, setAddrLine] = useState('');

  // Password Change State
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmNewPassInput, setConfirmNewPassInput] = useState('');

  const userSyncKey = currentUser
    ? `${currentUser.id}|${currentUser.fullName}|${currentUser.email}|${currentUser.phone}`
    : '';
  const [syncedUserKey, setSyncedUserKey] = useState(userSyncKey);

  if (syncedUserKey !== userSyncKey) {
    setSyncedUserKey(userSyncKey);
    if (currentUser) {
      setEditName(currentUser.fullName);
      setEditEmail(currentUser.email);
      setEditPhone(currentUser.phone);
      setAddrRecipient(currentUser.fullName);
      setAddrPhone(currentUser.phone);
    }
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setErrorMsg('');

    if (editName.trim().length < 2) {
      setErrorMsg(
        lang === 'vi'
          ? 'Họ và tên phải có ít nhất 2 ký tự.'
          : 'Name must be at least 2 characters.'
      );
      return;
    }

    if (!editEmail.trim() || !editPhone.trim()) {
      setErrorMsg(
        lang === 'vi'
          ? 'Vui lòng điền đầy đủ thông tin hồ sơ.'
          : 'Please fill in all profile fields.'
      );
      return;
    }

    onUpdateUser({
      ...currentUser,
      fullName: editName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
    });
    setSuccessBanner(
      lang === 'vi'
        ? 'Đã cập nhật thông tin cá nhân thành công!'
        : 'Personal profile updated successfully!'
    );
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setErrorMsg('');

    if (!addrRecipient.trim() || !addrPhone.trim() || !addrLine.trim()) {
      setErrorMsg(
        lang === 'vi'
          ? 'Vui lòng điền đầy đủ người nhận, số điện thoại và địa chỉ.'
          : 'Please complete recipient name, phone, and address line.'
      );
      return;
    }

    const newAddr: ShippingAddress = {
      id: 'addr-' + Date.now(),
      label: addrLabel.trim() || (lang === 'vi' ? 'Nhà riêng' : 'Home'),
      recipientName: addrRecipient.trim(),
      phone: addrPhone.trim(),
      addressLine: addrLine.trim(),
      isDefault: currentUser.addresses.length === 0,
    };

    onUpdateUser({
      ...currentUser,
      addresses: [...currentUser.addresses, newAddr],
    });
    setAddrLabel('');
    setAddrLine('');
    setShowAddAddress(false);
    setSuccessBanner(
      lang === 'vi' ? 'Đã thêm địa chỉ giao hàng mới!' : 'New delivery address added!'
    );
  };

  const handleSetDefaultAddress = (addrId: string) => {
    if (!currentUser) return;
    onUpdateUser({
      ...currentUser,
      addresses: currentUser.addresses.map((a) => ({
        ...a,
        isDefault: a.id === addrId,
      })),
    });
  };

  const handleDeleteAddress = (addrId: string) => {
    if (!currentUser) return;
    onUpdateUser({
      ...currentUser,
      addresses: currentUser.addresses.filter((a) => a.id !== addrId),
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setErrorMsg('');

    const isOAuthAccount = currentUser.passwordHash === 'gmail-oauth-verified';
    if (!isOAuthAccount && currentUser.passwordHash !== currentPassInput) {
      setErrorMsg(
        lang === 'vi'
          ? 'Mật khẩu hiện tại không đúng.'
          : 'Current password is incorrect.'
      );
      return;
    }

    if (newPassInput.length < 6) {
      setErrorMsg(
        lang === 'vi'
          ? 'Mật khẩu mới phải có ít nhất 6 ký tự.'
          : 'New password must be at least 6 characters.'
      );
      return;
    }

    if (newPassInput !== confirmNewPassInput) {
      setErrorMsg(
        lang === 'vi'
          ? 'Xác nhận mật khẩu mới không khớp.'
          : 'New password confirmation does not match.'
      );
      return;
    }

    onUpdateUser({
      ...currentUser,
      passwordHash: newPassInput,
    });
    setCurrentPassInput('');
    setNewPassInput('');
    setConfirmNewPassInput('');
    setSuccessBanner(
      lang === 'vi' ? 'Đổi mật khẩu thành công!' : 'Password changed successfully!'
    );
  };

  return {
    accountTab,
    setAccountTab,
    editName,
    setEditName,
    editEmail,
    setEditEmail,
    editPhone,
    setEditPhone,
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
    currentPassInput,
    setCurrentPassInput,
    newPassInput,
    setNewPassInput,
    confirmNewPassInput,
    setConfirmNewPassInput,
    handleSaveProfile,
    handleAddAddress,
    handleSetDefaultAddress,
    handleDeleteAddress,
    handleChangePassword,
  };
}

export type UseAccountManagementReturn = ReturnType<typeof useAccountManagement>;
