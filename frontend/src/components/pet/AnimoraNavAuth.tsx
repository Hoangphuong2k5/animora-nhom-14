'use client';

import React from 'react';
import {
  ChevronDown,
  CalendarCheck,
  Package,
  PawPrint,
  User,
  LogOut,
} from 'lucide-react';
import { UserAccount, Language, PageId } from '@/types/animora.type';
import { translations } from '@/data/translations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AnimoraNavAuthProps {
  currentUser: UserAccount | null;
  lang: Language;
  activePage: PageId;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenAccount: () => void;
  onLogout?: () => void;
  onNavigate: (page: PageId) => void;
}

export function AnimoraNavAuth({
  currentUser,
  lang,
  activePage,
  onOpenLogin,
  onOpenAccount,
  onLogout,
  onNavigate,
}: AnimoraNavAuthProps) {
  const t = translations[lang].nav;

  // 1. Authenticated State: Shadcn DropdownMenu + Avatar
  if (currentUser) {
    const initial = currentUser.fullName
      ? currentUser.fullName.charAt(0).toUpperCase()
      : 'U';

    return (
      <div className="hidden sm:block" suppressHydrationWarning>
        <DropdownMenu>
          <DropdownMenuTrigger
            data-testid="nav-user-profile-btn"
            className={`flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full text-xs font-bold shadow-sm transition-transform hover:scale-105 glass-pill cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-(--coral) ${
              activePage === 'account' ||
              activePage === 'my-bookings' ||
              activePage === 'my-orders' ||
              activePage === 'pet-profiles'
                ? 'ring-2 ring-(--coral)'
                : ''
            }`}
            style={{ color: 'var(--text)' }}
          >
            <Avatar size="sm" className="size-6.5">
              <AvatarFallback
                className="font-extrabold text-xs"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--on-primary)',
                }}
              >
                {initial}
              </AvatarFallback>
            </Avatar>
            <span className="whitespace-nowrap font-bold max-w-36 truncate">
              {currentUser.fullName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 opacity-75 shrink-0" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            data-testid="nav-account-dropdown"
            className="w-60 rounded-2xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2.5 py-2 flex flex-col gap-0.5">
                <span className="text-xs font-extrabold text-foreground truncate">
                  {currentUser.fullName}
                </span>
                {currentUser.email && (
                  <span className="text-[11px] font-normal text-muted-foreground truncate">
                    {currentUser.email}
                  </span>
                )}
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                data-testid="nav-dropdown-pet-profiles"
                onClick={() => onNavigate('pet-profiles')}
                className={`rounded-xl px-3 py-2.5 text-xs font-bold gap-2.5 cursor-pointer ${
                  activePage === 'pet-profiles'
                    ? 'bg-primary/10 text-primary'
                    : ''
                }`}
              >
                <PawPrint className="w-4 h-4 shrink-0 text-primary" />
                <span>
                  {lang === 'vi' ? 'Hồ sơ thú cưng' : 'Pet profiles'}
                </span>
              </DropdownMenuItem>

              <DropdownMenuItem
                data-testid="nav-dropdown-my-bookings"
                onClick={() => onNavigate('my-bookings')}
                className={`rounded-xl px-3 py-2.5 text-xs font-bold gap-2.5 cursor-pointer ${
                  activePage === 'my-bookings'
                    ? 'bg-primary/10 text-primary'
                    : ''
                }`}
              >
                <CalendarCheck className="w-4 h-4 shrink-0 text-primary" />
                <span>
                  {lang === 'vi' ? 'Lịch hẹn của tôi' : 'My bookings'}
                </span>
              </DropdownMenuItem>

              <DropdownMenuItem
                data-testid="nav-dropdown-my-orders"
                onClick={() => onNavigate('my-orders')}
                className={`rounded-xl px-3 py-2.5 text-xs font-bold gap-2.5 cursor-pointer ${
                  activePage === 'my-orders'
                    ? 'bg-primary/10 text-primary'
                    : ''
                }`}
              >
                <Package className="w-4 h-4 shrink-0 text-primary" />
                <span>
                  {lang === 'vi' ? 'Đơn hàng của tôi' : 'My orders'}
                </span>
              </DropdownMenuItem>

              <DropdownMenuItem
                data-testid="nav-dropdown-account"
                onClick={onOpenAccount}
                className={`rounded-xl px-3 py-2.5 text-xs font-bold gap-2.5 cursor-pointer ${
                  activePage === 'account' ? 'bg-primary/10 text-primary' : ''
                }`}
              >
                <User className="w-4 h-4 shrink-0 text-primary" />
                <span>
                  {lang === 'vi' ? 'Tài khoản của tôi' : 'My account'}
                </span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            {onLogout && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  data-testid="nav-dropdown-logout"
                  onClick={onLogout}
                  className="rounded-xl px-3 py-2.5 text-xs font-bold gap-2.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>{lang === 'vi' ? 'Đăng xuất' : 'Log out'}</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // 2. Guest State: Single unified Login CTA button
  return (
    <div className="hidden sm:flex items-center" suppressHydrationWarning>
      <button
        type="button"
        data-testid="nav-login-btn"
        onClick={onOpenLogin}
        className="px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 whitespace-nowrap transition-transform hover:scale-105 cursor-pointer btn-primary shadow-md"
      >
        <User className="w-3.5 h-3.5" />
        <span className="font-bold">{t.login}</span>
      </button>
    </div>
  );
}
