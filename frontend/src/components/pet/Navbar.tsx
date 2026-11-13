'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sun,
  Moon,
  ShoppingBag,
  Menu,
  X,
  User,
  UserPlus,
  CalendarCheck,
} from 'lucide-react';
import { Language, PageId, UserAccount } from '@/types';
import { translations } from '@/data/translations';
import { getLanguageToggleMeta } from '@/utils/petLogic';
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
  scrollSpyPage,
  onNavigate,
}: NavbarProps) => {
  // Keep active navbar tab strictly tied to current page so it does not shift during home page scrolling
  const effectiveActivePage = activePage;
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [badgePop, setBadgePop] = useState(false);
  const prevCartCountRef = React.useRef(cartCount);
  const t = translations[lang].nav;
  const langMeta = getLanguageToggleMeta(lang);

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
    { id: 'adopt', name: t.adopt, shortName: t.adopt },
    { id: 'shop', name: t.shop, shortName: t.shop },
    {
      id: 'pet-profiles',
      name: t.petProfiles,
      shortName: lang === 'vi' ? 'Hồ sơ' : 'Profiles',
    },
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
                {link.id === 'pet-profiles' ? (
                  <>
                    <span className="hidden min-[1280px]:inline">{link.name}</span>
                    <span className="inline min-[1280px]:hidden">{link.shortName}</span>
                  </>
                ) : (
                  link.name
                )}
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

              {/* Mobile My Bookings Link */}
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

              {/* Mobile Auth Buttons inside menu */}
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAccount();
                  }}
                  className="w-full btn-primary py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 mt-2 shadow-md"
                >
                  <User className="w-4 h-4" />
                  <span>{currentUser.fullName}</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenRegister();
                    }}
                    className="btn-secondary py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{t.register}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenLogin();
                    }}
                    className="btn-primary py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <User className="w-4 h-4" />
                    <span>{t.login}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

