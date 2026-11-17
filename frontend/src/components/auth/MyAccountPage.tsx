'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  KeyRound,
  Mail,
  MapPin,
  Package,
  PawPrint,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react';
import {
  AdoptionRequest,
  Booking,
  Language,
  PageId,
  Pet,
  UserAccount,
} from '@/types';
import { translations } from '@/data/translations';
import { cleanBookingPhoneDigits } from '@/data/serviceBookingData';
import {
  doesOrderBelongToUser,
  ORDERS_SYNC_EVENT,
  readOrdersFromStorage,
} from '@/utils/orderSync';
import type { CustomerOrder } from '@/types/order.type';
import { useAccountManagement } from './shared/useAccountManagement';
import { AuthFeedbackBanners } from './shared/AuthFeedbackBanners';
import { PasswordStrengthMeter } from './shared/PasswordStrengthMeter';

interface MyAccountPageProps {
  lang: Language;
  currentUser: UserAccount | null;
  pets: Pet[];
  bookings: Booking[];
  adoptionRequests: AdoptionRequest[];
  onUpdateUser: (updatedUser: UserAccount) => void;
  onLogout?: () => void;
  onNavigate: (page: PageId) => void;
  onShowToast?: (text: string) => void;
}

type AccountSectionId = 'profile' | 'addresses' | 'security';

export const MyAccountPage = ({
  lang,
  currentUser,
  pets,
  bookings,
  onUpdateUser,
  onNavigate,
  onShowToast,
}: MyAccountPageProps) => {
  const isVi = lang === 'vi';
  const t = translations[lang].loginModal;

  const [activeSection, setActiveSection] = useState<AccountSectionId>('profile');
  const [errorMsg, setErrorMsg] = useState('');
  const [successBanner, setSuccessBanner] = useState('');
  const [userOrders, setUserOrders] = useState<CustomerOrder[]>([]);

  const accountMgmt = useAccountManagement({
    lang,
    currentUser,
    onUpdateUser: (updated) => {
      onUpdateUser(updated);
      onShowToast?.(
        isVi
          ? 'Đã lưu thông tin tài khoản thành công!'
          : 'Account information saved successfully!'
      );
    },
    setErrorMsg,
    setSuccessBanner,
  });

  useEffect(() => {
    const syncOrders = () => {
      const all = readOrdersFromStorage();
      const matched = all.filter((o) => doesOrderBelongToUser(o, currentUser));
      setUserOrders(matched);
    };
    syncOrders();
    window.addEventListener(ORDERS_SYNC_EVENT, syncOrders);
    window.addEventListener('storage', syncOrders);
    return () => {
      window.removeEventListener(ORDERS_SYNC_EVENT, syncOrders);
      window.removeEventListener('storage', syncOrders);
    };
  }, [currentUser]);

  const userBookings = useMemo(() => {
    if (!currentUser) return [];
    const userPhone = cleanBookingPhoneDigits(currentUser.phone || '');
    const userEmail = (currentUser.email || '').trim().toLowerCase();
    const matched = bookings.filter((b) => {
      if (b.userId && b.userId === currentUser.id) return true;
      if (userPhone && cleanBookingPhoneDigits(b.phone || '') === userPhone) {
        return true;
      }
      if (userEmail && (b.email || '').trim().toLowerCase() === userEmail) {
        return true;
      }
      return false;
    });
    return matched;
  }, [bookings, currentUser]);

  const clearFeedback = () => {
    setErrorMsg('');
    setSuccessBanner('');
  };

  const handleSelectSection = (sec: AccountSectionId) => {
    clearFeedback();
    setActiveSection(sec);
    accountMgmt.setAccountTab(sec);
  };

  // Guest fallback view if not logged in
  if (!currentUser) {
    return (
      <div
        data-testid="page-account"
        className="min-h-screen pt-28 pb-20 shared-container flex items-center justify-center"
      >
        <div
          className="max-w-md w-full rounded-[28px] border p-8 text-center shadow-lg space-y-4"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-sm"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--on-primary)',
            }}
          >
            <User className="w-7 h-7" />
          </div>
          <h1
            className="font-heading text-2xl font-extrabold"
            style={{ color: 'var(--primary)' }}
          >
            {isVi ? 'Tài khoản của tôi' : 'My Account'}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {isVi
              ? 'Vui lòng đăng nhập để quản lý hồ sơ cá nhân, sổ địa chỉ nhận hàng và bảo mật tài khoản tại Animora.'
              : 'Please sign in to manage your profile, shipping addresses, and account security at Animora.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="btn-primary px-6 py-3 rounded-full text-xs font-extrabold cursor-pointer"
            >
              {isVi ? 'Đăng nhập ngay' : 'Sign In Now'}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="px-6 py-3 rounded-full text-xs font-bold border cursor-pointer"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
            >
              {isVi ? 'Về trang chủ' : 'Back to Home'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOAuthAccount = currentUser.passwordHash === 'gmail-oauth-verified';
  const userInitial = currentUser.fullName
    ? currentUser.fullName.charAt(0).toUpperCase()
    : 'U';

  const navItems: {
    id: AccountSectionId;
    label: string;
    sub: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    {
      id: 'profile',
      label: isVi ? 'Hồ sơ cá nhân' : 'Personal Profile',
      sub: isVi ? 'Họ tên, email & số điện thoại' : 'Name, email & phone number',
      icon: User,
    },
    {
      id: 'addresses',
      label: isVi ? 'Sổ địa chỉ nhận hàng' : 'Shipping Addresses',
      sub: isVi ? 'Địa chỉ giao hàng mặc định' : 'Default delivery addresses',
      icon: MapPin,
      badge: currentUser.addresses.length,
    },
    {
      id: 'security',
      label: isVi ? 'Đổi mật khẩu & Bảo mật' : 'Password & Security',
      sub: isVi ? 'Cập nhật mật khẩu tài khoản' : 'Update account password',
      icon: KeyRound,
    },
  ];

  const miniShortcuts = [
    {
      id: 'orders',
      label: isVi ? 'Đơn hàng' : 'Orders',
      count: userOrders.length,
      icon: Package,
      onClick: () => onNavigate('my-orders'),
    },
    {
      id: 'bookings',
      label: isVi ? 'Lịch hẹn' : 'Bookings',
      count: userBookings.length,
      icon: CalendarCheck,
      onClick: () => onNavigate('my-bookings'),
    },
    {
      id: 'pets',
      label: isVi ? 'Thú cưng' : 'Pets',
      count: pets.length,
      icon: PawPrint,
      onClick: () => onNavigate('pet-profiles'),
    },
  ];

  return (
    <div
      data-testid="page-account"
      className="min-h-screen pt-24 sm:pt-28 pb-24 shared-container space-y-8"
    >
      {/* 1. Standard Animora Page Header (Synced with /don-hang & /lich-hen) */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2.5 max-w-2xl">
          <span
            className="block uppercase font-bold"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'var(--primary)',
            }}
          >
            {isVi ? 'TÀI KHOẢN CÁ NHÂN' : 'MY ACCOUNT'}
          </span>
          <h1
            data-testid="my-account-title"
            className="font-heading font-extrabold leading-[1.14] tracking-[-0.02em]"
            style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              color: 'var(--primary)',
            }}
          >
            {isVi ? 'Tài khoản của tôi' : 'My Account'}
          </h1>
          <p
            className="text-[17px] sm:text-[18px] leading-relaxed font-normal"
            style={{ color: 'var(--text-muted)' }}
          >
            {isVi
              ? 'Quản lý thông tin liên hệ, sổ địa chỉ nhận hàng và bảo mật tài khoản của bạn.'
              : 'Manage your contact details, shipping address book, and account security.'}
          </p>
        </div>
      </header>

      {/* 2. Clean 2-Column Workspace */}
      <div
        data-testid="account-screen"
        className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start"
      >
        {/* LEFT COLUMN (4/12): Unified Member Profile Card + Navigation Menu */}
        <aside className="lg:col-span-4 space-y-5">
          <div
            className="rounded-[28px] border p-5 sm:p-6 shadow-sm space-y-5"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            {/* Member Identity Header on Light Surface */}
            <div className="flex items-center gap-4">
              <div
                className="w-15 h-15 rounded-2xl flex items-center justify-center font-heading text-2xl font-extrabold shadow-sm shrink-0"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--on-primary)',
                }}
              >
                {userInitial}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide"
                  style={{
                    backgroundColor: 'var(--bg)',
                    color: 'var(--primary)',
                  }}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{isVi ? 'Thành viên Animora' : 'Animora Member'}</span>
                </div>
                <h2
                  className="font-heading text-lg sm:text-xl font-extrabold leading-tight truncate"
                  style={{ color: 'var(--primary)' }}
                >
                  {currentUser.fullName}
                </h2>
                <div
                  className="text-xs truncate flex items-center gap-1.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{currentUser.email}</span>
                </div>
                {currentUser.phone && (
                  <div
                    className="text-xs truncate flex items-center gap-1.5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{currentUser.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Compact 3-Cell Shortcut Strip */}
            <div
              className="grid grid-cols-3 gap-2 pt-4 border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              {miniShortcuts.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.onClick}
                    className="rounded-2xl p-2.5 text-center border transition-all hover:border-[var(--primary)] cursor-pointer"
                    style={{
                      backgroundColor: 'var(--bg)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Icon
                        className="w-3.5 h-3.5"
                        style={{ color: 'var(--primary)' }}
                      />
                      <span
                        className="font-heading text-base font-extrabold leading-none"
                        style={{ color: 'var(--primary)' }}
                      >
                        {item.count}
                      </span>
                    </div>
                    <span
                      className="block text-[11px] font-bold truncate"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Vertical Section Menu */}
            <div
              className="space-y-1.5 pt-3 border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-testid={`account-tab-${item.id}`}
                    onClick={() => handleSelectSection(item.id)}
                    className="w-full rounded-2xl p-3.5 flex items-center justify-between gap-3 text-left transition-all cursor-pointer"
                    style={{
                      backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                      color: isActive ? 'var(--on-primary)' : 'var(--text)',
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: isActive
                            ? 'rgba(255,255,255,0.18)'
                            : 'var(--bg)',
                          color: isActive ? 'var(--on-primary)' : 'var(--primary)',
                        }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-extrabold truncate">
                          {item.label}
                        </div>
                        <div
                          className="text-[11px] truncate"
                          style={{
                            color: isActive
                              ? 'rgba(255,244,232,0.82)'
                              : 'var(--text-muted)',
                          }}
                        >
                          {item.sub}
                        </div>
                      </div>
                    </div>

                    {typeof item.badge === 'number' && (
                      <span
                        className="px-2 py-0.5 rounded-full text-[11px] font-extrabold shrink-0"
                        style={{
                          backgroundColor: isActive
                            ? 'rgba(255,255,255,0.22)'
                            : 'var(--bg)',
                          color: isActive ? '#FFFFFF' : 'var(--primary)',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN (8/12): Active Workspace Card */}
        <section
          className="lg:col-span-8 rounded-[28px] border p-6 sm:p-8 shadow-sm space-y-6"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <AuthFeedbackBanners errorMsg={errorMsg} successBanner={successBanner} />

          {/* TAB 1: PERSONAL PROFILE */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <div className="border-b pb-4" style={{ borderColor: 'var(--border)' }}>
                <h2
                  className="font-heading text-xl sm:text-2xl font-extrabold"
                  style={{ color: 'var(--primary)' }}
                >
                  {isVi ? 'Thông tin hồ sơ cá nhân' : 'Personal Profile Details'}
                </h2>
                <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  {isVi
                    ? 'Thông tin này được tự động điền khi bạn đặt lịch khám/spa hoặc mua sắm tại cửa hàng Animora.'
                    : 'Used to pre-fill your contact details during appointment booking and shop checkout.'}
                </p>
              </div>

              <form onSubmit={accountMgmt.handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="w-full rounded-2xl px-4 py-3 border border-[var(--border)] bg-[var(--bg)] focus-within:border-[var(--primary)] transition-colors">
                    <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                      {t.fullNameLabel}
                    </label>
                    <input
                      type="text"
                      value={accountMgmt.editName}
                      onChange={(e) => accountMgmt.setEditName(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-[var(--text)] outline-none"
                    />
                  </div>

                  <div className="w-full rounded-2xl px-4 py-3 border border-[var(--border)] bg-[var(--bg)] focus-within:border-[var(--primary)] transition-colors">
                    <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                      {t.phoneLabel}
                    </label>
                    <input
                      type="tel"
                      value={accountMgmt.editPhone}
                      onChange={(e) => accountMgmt.setEditPhone(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-[var(--text)] outline-none"
                    />
                  </div>
                </div>

                <div className="w-full rounded-2xl px-4 py-3 border border-[var(--border)] bg-[var(--bg)] focus-within:border-[var(--primary)] transition-colors">
                  <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                    {t.emailOnlyLabel}
                  </label>
                  <input
                    type="email"
                    value={accountMgmt.editEmail}
                    onChange={(e) => accountMgmt.setEditEmail(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-[var(--text)] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="rounded-2xl px-4 py-3.5 border border-[var(--border)] bg-[var(--bg)] flex items-center justify-between">
                    <div>
                      <span className="block text-[11px] font-semibold text-[var(--text-muted)]">
                        {isVi ? 'Phương thức đăng nhập' : 'Sign-in Method'}
                      </span>
                      <span className="text-xs font-extrabold text-[var(--text)]">
                        {isOAuthAccount
                          ? 'Google OAuth 2.0'
                          : isVi
                          ? 'Email & Mật khẩu'
                          : 'Email & Password'}
                      </span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>

                  <div className="rounded-2xl px-4 py-3.5 border border-[var(--border)] bg-[var(--bg)] flex items-center justify-between">
                    <div>
                      <span className="block text-[11px] font-semibold text-[var(--text-muted)]">
                        {isVi ? 'Trạng thái bảo mật' : 'Security Status'}
                      </span>
                      <span className="text-xs font-extrabold text-[var(--primary)]">
                        {isVi ? 'Đã kích hoạt bảo vệ' : 'Active Protection'}
                      </span>
                    </div>
                    <ShieldCheck className="w-4 h-4 text-[var(--primary)] shrink-0" />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="btn-primary px-7 h-[46px] !rounded-full font-extrabold text-sm cursor-pointer shadow-md"
                  >
                    {isVi ? 'Lưu thay đổi hồ sơ' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: SHIPPING ADDRESSES */}
          {activeSection === 'addresses' && (
            <div className="space-y-6">
              <div
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4"
                style={{ borderColor: 'var(--border)' }}
              >
                <div>
                  <h2
                    className="font-heading text-xl sm:text-2xl font-extrabold"
                    style={{ color: 'var(--primary)' }}
                  >
                    {isVi ? 'Sổ địa chỉ nhận hàng' : 'Shipping Address Book'}
                  </h2>
                  <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    {isVi
                      ? 'Quản lý các địa chỉ nhận thức ăn, phụ kiện và thuốc thú y từ cửa hàng Animora.'
                      : 'Manage delivery addresses for pet food, supplies, and prescriptions.'}
                  </p>
                </div>

                {!accountMgmt.showAddAddress && (
                  <button
                    type="button"
                    onClick={() => accountMgmt.setShowAddAddress(true)}
                    className="btn-primary px-5 py-2.5 !rounded-full text-xs font-extrabold inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isVi ? 'Thêm địa chỉ mới' : 'Add New Address'}</span>
                  </button>
                )}
              </div>

              {accountMgmt.showAddAddress && (
                <form
                  onSubmit={accountMgmt.handleAddAddress}
                  className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg)] space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[var(--primary)]">
                      {isVi ? 'Thêm địa chỉ giao hàng mới' : 'New Delivery Address'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {(isVi ? ['Nhà riêng', 'Văn phòng'] : ['Home', 'Office']).map(
                        (preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => accountMgmt.setAddrLabel(preset)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)] cursor-pointer"
                          >
                            {preset}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder={
                        isVi ? 'Nhãn (VD: Nhà riêng)' : 'Label (e.g. Home)'
                      }
                      value={accountMgmt.addrLabel}
                      onChange={(e) => accountMgmt.setAddrLabel(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold outline-none"
                    />
                    <input
                      type="text"
                      placeholder={isVi ? 'Họ tên người nhận *' : 'Recipient name *'}
                      value={accountMgmt.addrRecipient}
                      onChange={(e) => accountMgmt.setAddrRecipient(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold outline-none"
                    />
                    <input
                      type="tel"
                      placeholder={isVi ? 'Số điện thoại nhận hàng *' : 'Phone number *'}
                      value={accountMgmt.addrPhone}
                      onChange={(e) => accountMgmt.setAddrPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold outline-none"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder={
                      isVi
                        ? 'Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố *'
                        : 'Full street address, ward, district, city *'
                    }
                    value={accountMgmt.addrLine}
                    onChange={(e) => accountMgmt.setAddrLine(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold outline-none"
                  />

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => accountMgmt.setShowAddAddress(false)}
                      className="px-4 py-2 rounded-full text-xs font-bold border border-[var(--border)] cursor-pointer"
                    >
                      {isVi ? 'Hủy' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="btn-primary px-5 py-2 !rounded-full text-xs font-extrabold cursor-pointer"
                    >
                      {isVi ? 'Lưu địa chỉ' : 'Save Address'}
                    </button>
                  </div>
                </form>
              )}

              {currentUser.addresses.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-[var(--border)] text-center space-y-2">
                  <MapPin className="w-8 h-8 mx-auto text-[var(--primary)] opacity-70" />
                  <div className="text-sm font-bold text-[var(--text)]">
                    {isVi
                      ? 'Chưa có địa chỉ nhận hàng nào được lưu'
                      : 'No shipping addresses saved yet'}
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    {isVi
                      ? 'Thêm sẵn địa chỉ để tự động điền thông tin giao hàng khi mua sắm tại Cửa hàng Animora.'
                      : 'Add a delivery address for faster checkout in the Animora Shop.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5">
                  {currentUser.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-[var(--text)]">
                            {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[var(--primary)] text-[var(--on-primary)]">
                              {isVi ? 'Mặc định' : 'Default'}
                            </span>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-[var(--text)]">
                          {addr.recipientName} · {addr.phone}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] leading-relaxed">
                          {addr.addressLine}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => accountMgmt.handleSetDefaultAddress(addr.id)}
                            className="px-3.5 py-1.5 rounded-full text-xs font-bold border border-[var(--border)] bg-[var(--surface)] text-[var(--primary)] hover:border-[var(--primary)] cursor-pointer"
                          >
                            {isVi ? 'Đặt mặc định' : 'Set Default'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => accountMgmt.handleDeleteAddress(addr.id)}
                          aria-label="Delete address"
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PASSWORD & SECURITY */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <div className="border-b pb-4" style={{ borderColor: 'var(--border)' }}>
                <h2
                  className="font-heading text-xl sm:text-2xl font-extrabold"
                  style={{ color: 'var(--primary)' }}
                >
                  {isVi ? 'Đổi mật khẩu & Bảo mật' : 'Password & Security'}
                </h2>
                <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  {isVi
                    ? 'Sử dụng mật khẩu mạnh tối thiểu 6 ký tự kết hợp chữ hoa, chữ thường và chữ số.'
                    : 'Use a strong password with at least 6 characters including uppercase, lowercase, and numbers.'}
                </p>
              </div>

              <form onSubmit={accountMgmt.handleChangePassword} className="space-y-4 max-w-xl">
                {!isOAuthAccount && (
                  <div className="w-full rounded-2xl px-4 py-3 border border-[var(--border)] bg-[var(--bg)]">
                    <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                      {t.currentPassLabel}
                    </label>
                    <input
                      type="password"
                      value={accountMgmt.currentPassInput}
                      onChange={(e) => accountMgmt.setCurrentPassInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent text-sm font-bold text-[var(--text)] outline-none"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="w-full rounded-2xl px-4 py-3 border border-[var(--border)] bg-[var(--bg)]">
                    <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                      {t.newPassLabel}
                    </label>
                    <input
                      type="password"
                      value={accountMgmt.newPassInput}
                      onChange={(e) => accountMgmt.setNewPassInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent text-sm font-bold text-[var(--text)] outline-none"
                    />
                  </div>

                  <div className="w-full rounded-2xl px-4 py-3 border border-[var(--border)] bg-[var(--bg)]">
                    <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                      {t.confirmPassLabel}
                    </label>
                    <input
                      type="password"
                      value={accountMgmt.confirmNewPassInput}
                      onChange={(e) => accountMgmt.setConfirmNewPassInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent text-sm font-bold text-[var(--text)] outline-none"
                    />
                  </div>
                </div>

                {accountMgmt.newPassInput.length > 0 && (
                  <PasswordStrengthMeter
                    lang={lang}
                    password={accountMgmt.newPassInput}
                    confirmPassword={accountMgmt.confirmNewPassInput}
                  />
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="btn-primary px-7 h-[46px] !rounded-full font-extrabold text-sm inline-flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{isVi ? 'Cập nhật mật khẩu' : 'Update Password'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
