'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  Menu,
  X,
  User,
  CalendarCheck,
  Package,
  PawPrint,
  LogOut,
  Search,
} from 'lucide-react';
import { Language, PageId, UserAccount } from '@/types';
import { translations } from '@/data/translations';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { AnimoraNavAuth } from './AnimoraNavAuth';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenSearch?: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenAccount: () => void;
  onLogout?: () => void;
  currentUser: UserAccount | null;
  activePage: PageId;
  scrollSpyPage?: PageId | null;
  onNavigate: (page: PageId) => void;
}

export const Navbar = ({
  lang,
  onToggleLang,
  darkMode,
  onToggleDarkMode,
  cartCount,
  onOpenCart,
  onOpenLogin,
  onOpenRegister,
  onOpenAccount,
  onLogout,
  currentUser,
  activePage,
  onNavigate,
}: NavbarProps) => {
  // Keep active navbar tab strictly tied to current page so it does not shift during home page scrolling
  const effectiveActivePage = activePage;
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [badgePop, setBadgePop] = useState(false);
  const prevCartCountRef = useRef(cartCount);
  const t = translations[lang].nav;

  useEffect(() => {
    if (cartCount > prevCartCountRef.current) {
      setBadgePop(true);
      const timer = window.setTimeout(() => setBadgePop(false), 260);
      prevCartCountRef.current = cartCount;
      return () => window.clearTimeout(timer);
    }
    prevCartCountRef.current = cartCount;
  }, [cartCount]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { id: PageId; name: string; shortName: string }[] = [
    { id: 'home', name: t.home, shortName: t.home },
    { id: 'about', name: t.about, shortName: t.about },
    { id: 'services', name: t.services, shortName: t.services },
    {
      id: 'booking',
      name: lang === 'vi' ? 'Đặt lịch' : 'Booking',
      shortName: lang === 'vi' ? 'Đặt lịch' : 'Book',
    },
    { id: 'shop', name: t.shop, shortName: t.shop },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-[var(--nav-h)] transition-all duration-300 flex items-center ${
        scrolled
          ? 'glass-card border-b shadow-md'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="shared-container w-full flex items-center justify-between gap-3 lg:gap-4">
        {/* Left: Brand Logo */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 sm:gap-3 group shrink-0 cursor-pointer"
        >
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 transition-transform duration-300 group-hover:scale-105 shadow-md flex items-center justify-center shrink-0"
            style={{
              borderColor: 'var(--primary)',
              backgroundColor: 'transparent',
            }}
          >
            <img
              loading="eager"
              fetchPriority="high"
              decoding="sync"
              src="/assets/images/animora_pet_logo_1793179870995.jpg"
              alt="Animora Pet Care Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span
            className="font-heading text-xl sm:text-2xl font-extrabold tracking-tight pt-0.5 transition-colors duration-300"
            style={{ color: 'var(--primary)' }}
          >
            Animora
          </span>
        </button>

        {/* Center: Floating GLASS Pill Menu Container (Visible >= 960px) */}
        <nav className="hidden min-[960px]:flex items-center gap-0.5 p-1 rounded-full whitespace-nowrap transition-all duration-300 glass-pill">
          {navLinks.map((link) => {
            const isActive = effectiveActivePage === link.id;
            return (
              <button
                key={link.id}
                type="button"
                data-testid={`nav-link-${link.id}`}
                onClick={() => onNavigate(link.id)}
                className={`px-2.5 xl:px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap cursor-pointer ${
                  isActive ? 'shadow-sm' : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? 'var(--on-primary)' : 'var(--text)',
                }}
              >
                {link.name}
              </button>
            );
          })}
        </nav>

        {/* Right: Action Buttons (Glass Pills) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Language Toggle with Subtle Tooltip */}
          <LanguageSwitcher
            lang={lang}
            onToggleLang={onToggleLang}
            tooltipId="navbar-lang-tooltip"
          />

          {/* Light/Dark Mode Toggle */}
          <ThemeToggle
            darkMode={darkMode}
            onToggleDarkMode={onToggleDarkMode}
          />

          {/* Shopping Cart Button */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={onOpenCart}
                  data-testid="navbar-cart-btn"
                  className="relative w-8.5 h-8.5 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 glass-pill cursor-pointer"
                  aria-label={lang === 'vi' ? `Giỏ hàng (${cartCount})` : `View Cart (${cartCount})`}
                />
              }
            >
              <ShoppingBag className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              {cartCount > 0 && (
                <span
                  data-testid="navbar-cart-badge"
                  className="absolute -top-1 -right-1 text-[10px] font-extrabold min-w-4.5 h-4.5 px-1 rounded-full flex items-center justify-center shadow-md"
                  style={{
                    backgroundColor: '#FF7F6B',
                    color: '#FFFFFF',
                    transform: badgePop ? 'scale(1.3)' : 'scale(1)',
                    transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  {cartCount}
                </span>
              )}
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {lang === 'vi' ? `Giỏ hàng (${cartCount})` : `Cart (${cartCount})`}
            </TooltipContent>
          </Tooltip>

          {/* Auth Action Buttons (Desktop >= 640px) - Isolated Dynamic Island */}
          <AnimoraNavAuth
            currentUser={currentUser}
            lang={lang}
            activePage={activePage}
            onOpenLogin={onOpenLogin}
            onOpenRegister={onOpenRegister}
            onOpenAccount={onOpenAccount}
            onLogout={onLogout}
            onNavigate={onNavigate}
          />

          {/* Mobile Hamburger Toggle (Visible < 960px) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-[960px]:hidden w-9 h-9 rounded-full flex items-center justify-center transition-colors glass-pill"
            style={{ color: 'var(--text)' }}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Glass Dropdown Panel (< 960px) */}
      {mobileMenuOpen && (
        <div className="min-[960px]:hidden absolute top-[var(--nav-h)] left-0 right-0 p-4">
          <div className="shared-container">
            <div className="glass-card rounded-2xl p-4 space-y-2 shadow-2xl border">
              {navLinks.map((link) => {
                const isActive = effectiveActivePage === link.id;
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => {
                      onNavigate(link.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left block px-4 py-3 text-base font-bold rounded-xl transition-all cursor-pointer ${
                      isActive ? 'shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    style={{
                      backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                      color: isActive ? 'var(--on-primary)' : 'var(--text)',
                    }}
                  >
                    {link.name}
                  </button>
                );
              })}

              {/* Separator before personal / lookup links */}
              <div
                className="my-2 border-t"
                style={{ borderColor: 'var(--border)' }}
              />

              {currentUser ? (
                <>
                  {/* Authenticated Member Actions */}
                  <button
                    type="button"
                    data-testid="mobile-nav-pet-profiles"
                    onClick={() => {
                      onNavigate('pet-profiles');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-base font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                    style={{
                      backgroundColor:
                        activePage === 'pet-profiles' ? 'var(--primary)' : 'transparent',
                      color:
                        activePage === 'pet-profiles' ? 'var(--on-primary)' : 'var(--text)',
                    }}
                  >
                    <PawPrint className="w-4 h-4 shrink-0" />
                    <span>{lang === 'vi' ? 'Hồ sơ thú cưng' : 'Pet profiles'}</span>
                  </button>

                  <button
                    type="button"
                    data-testid="mobile-nav-my-bookings"
                    onClick={() => {
                      onNavigate('my-bookings');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-base font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                    style={{
                      backgroundColor:
                        activePage === 'my-bookings' ? 'var(--primary)' : 'transparent',
                      color:
                        activePage === 'my-bookings' ? 'var(--on-primary)' : 'var(--text)',
                    }}
                  >
                    <CalendarCheck className="w-4 h-4 shrink-0" />
                    <span>{lang === 'vi' ? 'Lịch hẹn của tôi' : 'My bookings'}</span>
                  </button>

                  <button
                    type="button"
                    data-testid="mobile-nav-my-orders"
                    onClick={() => {
                      onNavigate('my-orders');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-base font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                    style={{
                      backgroundColor:
                        activePage === 'my-orders' ? 'var(--primary)' : 'transparent',
                      color:
                        activePage === 'my-orders' ? 'var(--on-primary)' : 'var(--text)',
                    }}
                  >
                    <Package className="w-4 h-4 shrink-0" />
                    <span>{lang === 'vi' ? 'Đơn hàng của tôi' : 'My orders'}</span>
                  </button>

                  {/* Member Account Button */}
                  <button
                    type="button"
                    data-testid="mobile-nav-account"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAccount();
                    }}
                    className="w-full btn-primary py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 mt-2 shadow-md cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span className="truncate">{currentUser.fullName}</span>
                  </button>

                  {/* Member Logout Button */}
                  {onLogout && (
                    <button
                      type="button"
                      data-testid="mobile-nav-logout"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border mt-1"
                      style={{
                        borderColor: 'var(--border)',
                        color: 'var(--coral)',
                        backgroundColor: 'var(--surface-2)',
                      }}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{lang === 'vi' ? 'Đăng xuất' : 'Log out'}</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  {/* Guest Visitor Quick Lookups */}
                  <button
                    type="button"
                    data-testid="mobile-nav-guest-lookup-bookings"
                    onClick={() => {
                      onNavigate('my-bookings');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer opacity-90 hover:opacity-100"
                    style={{
                      backgroundColor:
                        activePage === 'my-bookings' ? 'var(--surface-2)' : 'transparent',
                      color: 'var(--text)',
                    }}
                  >
                    <Search className="w-4 h-4 shrink-0 text-primary" />
                    <span>{lang === 'vi' ? 'Tra cứu lịch hẹn' : 'Lookup appointment'}</span>
                  </button>

                  <button
                    type="button"
                    data-testid="mobile-nav-guest-lookup-orders"
                    onClick={() => {
                      onNavigate('my-orders');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer opacity-90 hover:opacity-100"
                    style={{
                      backgroundColor:
                        activePage === 'my-orders' ? 'var(--surface-2)' : 'transparent',
                      color: 'var(--text)',
                    }}
                  >
                    <Search className="w-4 h-4 shrink-0 text-primary" />
                    <span>{lang === 'vi' ? 'Tra cứu đơn hàng' : 'Lookup order'}</span>
                  </button>

                  {/* Guest Login CTA */}
                  <div className="pt-2">
                    <button
                      type="button"
                      data-testid="mobile-nav-login-btn"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenLogin();
                      }}
                      className="w-full btn-primary py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      <span>{lang === 'vi' ? 'Đăng nhập / Đăng ký' : 'Sign In / Register'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

