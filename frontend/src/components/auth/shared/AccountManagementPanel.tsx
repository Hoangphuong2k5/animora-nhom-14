import React from 'react';
import { KeyRound, LogOut, MapPin, User } from 'lucide-react';
import { Language, UserAccount } from '@/types';
import { translations } from '@/data/translations';
import { AccountAddressesTab } from './AccountAddressesTab';

interface AccountManagementPanelProps {
  lang: Language;
  currentUser: UserAccount;
  accountTab: 'profile' | 'addresses' | 'security';
  onSelectTab: (tab: 'profile' | 'addresses' | 'security') => void;
  editName: string;
  setEditName: (val: string) => void;
  editEmail: string;
  setEditEmail: (val: string) => void;
  editPhone: string;
  setEditPhone: (val: string) => void;
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
  currentPassInput: string;
  setCurrentPassInput: (val: string) => void;
  newPassInput: string;
  setNewPassInput: (val: string) => void;
  confirmNewPassInput: string;
  setConfirmNewPassInput: (val: string) => void;
  onSaveProfile: (e: React.FormEvent) => void;
  onAddAddress: (e: React.FormEvent) => void;
  onSetDefaultAddress: (addrId: string) => void;
  onDeleteAddress: (addrId: string) => void;
  onChangePassword: (e: React.FormEvent) => void;
  showUserHeader?: boolean;
  onLogout?: () => void;
}

/** Shared Profile / Addresses / Security panel for AuthPage and LoginModal. */
export const AccountManagementPanel = ({
  lang,
  currentUser,
  accountTab,
  onSelectTab,
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
  onSaveProfile,
  onAddAddress,
  onSetDefaultAddress,
  onDeleteAddress,
  onChangePassword,
  showUserHeader = false,
  onLogout,
}: AccountManagementPanelProps) => {
  const t = translations[lang].loginModal;
  const isOAuthAccount = currentUser.passwordHash === 'gmail-oauth-verified';

  const tabs = [
    { id: 'profile' as const, label: lang === 'vi' ? 'Hồ sơ' : 'Profile', icon: User },
    { id: 'addresses' as const, label: lang === 'vi' ? 'Sổ địa chỉ' : 'Addresses', icon: MapPin },
    { id: 'security' as const, label: lang === 'vi' ? 'Bảo mật' : 'Security', icon: KeyRound },
  ];

  return (
    <div data-testid="account-screen" className="space-y-5">
      {showUserHeader && (
        <div
          className="flex items-center justify-between gap-3 pb-3 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-heading text-lg font-extrabold shadow-sm shrink-0"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--on-primary)',
              }}
            >
              {currentUser.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3
                className="text-lg font-extrabold leading-tight truncate"
                style={{ color: 'var(--text)' }}
              >
                {currentUser.fullName}
              </h3>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {currentUser.email} · {currentUser.phone}
              </p>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              data-testid="logout-btn"
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all hover:opacity-90 cursor-pointer shrink-0"
              style={{
                borderColor: 'rgba(239, 68, 68, 0.35)',
                color: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
              }}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.logoutBtn}</span>
            </button>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-[var(--border)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = accountTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                active
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {accountTab === 'profile' && (
        <form onSubmit={onSaveProfile} className="space-y-3">
          <div className="w-full rounded-xl px-4 py-2 border border-[var(--border)] bg-[var(--bg)]">
            <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-0.5">
              {t.fullNameLabel}
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-transparent text-[14px] font-semibold text-[var(--text)] outline-none"
            />
          </div>
          <div className="w-full rounded-xl px-4 py-2 border border-[var(--border)] bg-[var(--bg)]">
            <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-0.5">
              {t.emailOnlyLabel}
            </label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full bg-transparent text-[14px] font-semibold text-[var(--text)] outline-none"
            />
          </div>
          <div className="w-full rounded-xl px-4 py-2 border border-[var(--border)] bg-[var(--bg)]">
            <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-0.5">
              {t.phoneLabel}
            </label>
            <input
              type="tel"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-full bg-transparent text-[14px] font-semibold text-[var(--text)] outline-none"
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full h-[46px] !rounded-xl font-bold text-sm cursor-pointer"
          >
            {lang === 'vi' ? 'Lưu thay đổi' : 'Save Changes'}
          </button>
        </form>
      )}

      {accountTab === 'addresses' && (
        <AccountAddressesTab
          lang={lang}
          addresses={currentUser.addresses}
          showAddAddress={showAddAddress}
          setShowAddAddress={setShowAddAddress}
          addrLabel={addrLabel}
          setAddrLabel={setAddrLabel}
          addrRecipient={addrRecipient}
          setAddrRecipient={setAddrRecipient}
          addrPhone={addrPhone}
          setAddrPhone={setAddrPhone}
          addrLine={addrLine}
          setAddrLine={setAddrLine}
          onAddAddress={onAddAddress}
          onSetDefaultAddress={onSetDefaultAddress}
          onDeleteAddress={onDeleteAddress}
        />
      )}

      {accountTab === 'security' && (
        <form onSubmit={onChangePassword} className="space-y-3">
          {!isOAuthAccount && (
            <div className="w-full rounded-xl px-4 py-2 border border-[var(--border)] bg-[var(--bg)]">
              <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-0.5">
                {t.currentPassLabel}
              </label>
              <input
                type="password"
                value={currentPassInput}
                onChange={(e) => setCurrentPassInput(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-[14px] font-semibold text-[var(--text)] outline-none"
              />
            </div>
          )}
          <div className="w-full rounded-xl px-4 py-2 border border-[var(--border)] bg-[var(--bg)]">
            <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-0.5">
              {t.newPassLabel}
            </label>
            <input
              type="password"
              value={newPassInput}
              onChange={(e) => setNewPassInput(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent text-[14px] font-semibold text-[var(--text)] outline-none"
            />
          </div>
          <div className="w-full rounded-xl px-4 py-2 border border-[var(--border)] bg-[var(--bg)]">
            <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-0.5">
              {t.confirmPassLabel}
            </label>
            <input
              type="password"
              value={confirmNewPassInput}
              onChange={(e) => setConfirmNewPassInput(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent text-[14px] font-semibold text-[var(--text)] outline-none"
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full h-[46px] !rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>{lang === 'vi' ? 'Cập nhật mật khẩu' : 'Update Password'}</span>
          </button>
        </form>
      )}

      {!showUserHeader && onLogout && (
        <div className="pt-2 border-t border-[var(--border)]">
          <button
            type="button"
            data-testid="logout-btn"
            onClick={onLogout}
            className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all hover:opacity-90 cursor-pointer"
            style={{
              borderColor: 'rgba(239, 68, 68, 0.35)',
              color: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.logoutBtn}</span>
          </button>
        </div>
      )}
    </div>
  );
};
