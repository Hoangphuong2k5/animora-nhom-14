'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/pet/Navbar';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { SearchModal } from '@/components/pet/SearchModal';
import { LoginModal } from '@/components/auth/LoginModal';
import { Footer } from '@/components/pet/Footer';
import { AnimoraPageRenderer } from '@/components/AnimoraPageRenderer';
import { AiPetCareChatWidget } from '@/components/common/AiPetCareChatWidget';
import { useAnimoraRouter } from '@/hooks/animora/useAnimoraRouter';
import { useAnimoraPreferences } from '@/hooks/animora/useAnimoraPreferences';
import { useAnimoraCart } from '@/hooks/animora/useAnimoraCart';
import { useAnimoraAuth } from '@/hooks/animora/useAnimoraAuth';
import { useAnimoraDomainData } from '@/hooks/animora/useAnimoraDomainData';
import { AuthMode, PageId } from '@/types/animora.type';

export interface AppProps {
  initialPage?: PageId;
}

export default function App({ initialPage = 'home' }: AppProps) {
  const {
    activePage,
    returnPageAfterAuth,
    setReturnPageAfterAuth,
    bookingUrlState,
    myBookingsUrlState,
    scrollSpyPage,
    handleNavigate,
    handleNavigateCustomUrl,
    handleOpenBookingPage,
  } = useAnimoraRouter(initialPage);

  const { lang, darkMode, toggleLanguage, toggleDarkMode, addToast } =
    useAnimoraPreferences();

  const [isStorageHydrated, setIsStorageHydrated] = useState(false);

  // Modals & local UI triggers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authModalMode] = useState<AuthMode>('login');
  const [preFilledService, setPreFilledService] = useState('');
  const [bookingTrigger] = useState(0);

  const domain = useAnimoraDomainData({
    lang,
    isStorageHydrated,
    addToast,
  });

  const auth = useAnimoraAuth({
    lang,
    isStorageHydrated,
    addToast,
  });

  const cartState = useAnimoraCart({
    lang,
    activePage,
    products: domain.products,
    currentUser: auth.currentUser,
    isStorageHydrated,
    onOpenCartDrawer: () => setIsCartOpen(true),
    onCloseCartDrawer: () => setIsCartOpen(false),
    onNavigateCustomUrl: handleNavigateCustomUrl,
    addToast,
  });

  const handleLoginWithCartMerge = (user: NonNullable<typeof auth.currentUser>) => {
    cartState.handleMergeCartOnUserLogin(user);
    auth.handleLoginSuccess(user);
  };

  const handleRegisterWithCartMerge = (
    newUser: NonNullable<typeof auth.currentUser>,
    deduplicate: boolean
  ) => {
    cartState.handleMergeCartOnUserLogin(newUser);
    auth.handleRegisterSuccess(newUser, deduplicate);
  };

  // Hydrate all persisted client data after mount (SSR-safe)
  const { hydrateDomainFromStorage } = domain;
  const { hydrateCartFromStorage } = cartState;
  const { hydrateAuthFromStorage } = auth;

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      hydrateDomainFromStorage();
      hydrateCartFromStorage();
      hydrateAuthFromStorage();
      setIsStorageHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [hydrateDomainFromStorage, hydrateCartFromStorage, hydrateAuthFromStorage]);

  const handleSelectService = (serviceName: string) => {
    setPreFilledService(serviceName);
    handleOpenBookingPage(serviceName);
  };

  const isAuthFullPage =
    activePage === 'login' ||
    activePage === 'register';

  return (
    <div
      className="min-h-screen relative transition-colors duration-300 selection:bg-[var(--coral)] selection:text-[var(--on-coral)]"
      style={{
        backgroundColor: 'var(--bg)',
        color: 'var(--text)',
      }}
    >
      {!isAuthFullPage && (
        <Navbar
          lang={lang}
          onToggleLang={toggleLanguage}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          cartCount={cartState.totalCartCount}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenLogin={() => handleNavigate('login')}
          onOpenRegister={() => handleNavigate('register')}
          onOpenAccount={() => handleNavigate('account')}
          onLogout={auth.handleUniversalLogout}
          currentUser={auth.currentUser}
          activePage={activePage}
          scrollSpyPage={scrollSpyPage}
          onNavigate={handleNavigate}
        />
      )}

      <main className="relative z-1">
        <AnimoraPageRenderer
          activePage={activePage}
          lang={lang}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onToggleLang={toggleLanguage}
          addToast={addToast}
          isStorageHydrated={isStorageHydrated}
          bookingUrlState={bookingUrlState}
          myBookingsUrlState={myBookingsUrlState}
          preFilledService={preFilledService}
          setPreFilledService={setPreFilledService}
          bookingTrigger={bookingTrigger}
          onNavigate={handleNavigate}
          onNavigateCustomUrl={handleNavigateCustomUrl}
          onOpenBookingPage={handleOpenBookingPage}
          onSelectService={handleSelectService}
          onOpenCartDrawer={() => setIsCartOpen(true)}
          pets={domain.pets}
          vaccinations={domain.vaccinations}
          products={domain.products}
          bookings={domain.bookings}
          onAddBooking={domain.handleAddBooking}
          onUpdateBooking={domain.handleUpdateBooking}
          onUpdatePet={domain.handleUpdatePet}
          onAddPet={domain.handleAddPet}
          onDeletePet={domain.handleDeletePet}
          cart={cartState.cart}
          savedForLater={cartState.savedForLater}
          appliedCoupon={cartState.appliedCoupon}
          orderNote={cartState.orderNote}
          cartRedirectNotice={cartState.cartRedirectNotice}
          totalCartCount={cartState.totalCartCount}
          setAppliedCoupon={cartState.setAppliedCoupon}
          setOrderNote={cartState.setOrderNote}
          setCartRedirectNotice={cartState.setCartRedirectNotice}
          onAddToCart={cartState.handleAddToCart}
          onBuyNow={cartState.handleBuyNow}
          onUpdateCartQuantity={cartState.handleUpdateCartQuantity}
          onSetCartQuantity={cartState.handleSetCartQuantity}
          onChangeCartItemSpec={cartState.handleChangeCartItemSpec}
          onRemoveItemWithUndo={cartState.handleRemoveItemWithUndo}
          onSaveForLater={cartState.handleSaveForLater}
          onMoveSavedToCart={cartState.handleMoveSavedToCart}
          onRemoveSavedItem={cartState.handleRemoveSavedItem}
          onAcceptCartPriceChange={cartState.handleAcceptCartPriceChange}
          onRefillPrescription={cartState.handleAddPrescriptionRefillToCart}
          onCompleteOrder={cartState.handleCompleteOrder}
          currentUser={auth.currentUser}
          registeredUsers={auth.registeredUsers}
          returnPageAfterAuth={returnPageAfterAuth}
          setReturnPageAfterAuth={setReturnPageAfterAuth}
          onAuthLoginSuccess={handleLoginWithCartMerge}
          onAuthRegisterSuccess={(newUser) =>
            handleRegisterWithCartMerge(newUser, true)
          }
          onAuthUpdateUser={(u) => auth.handleUpdateUser(u, true)}
          onAuthResetPasswordSuccess={(id, pwd) =>
            auth.handleResetPasswordSuccess(id, pwd, true)
          }
          onUniversalLogout={auth.handleUniversalLogout}
        />
      </main>

      {!isAuthFullPage && (
        <Footer
          lang={lang}
          darkMode={darkMode}
          onNavigate={handleNavigate}
          onShowToast={addToast}
        />
      )}

      <CartDrawer
        lang={lang}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cartState.cart}
        products={domain.products}
        onUpdateQuantity={cartState.handleUpdateCartQuantity}
        onRemoveItemWithUndo={cartState.handleRemoveItemWithUndo}
        onAddToCart={cartState.handleAddToCart}
        onNavigateUrl={handleNavigateCustomUrl}
        onContinueShopping={() => handleNavigate('shop')}
      />

      <SearchModal
        lang={lang}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={domain.products}
        onNavigate={handleNavigate}
      />

      <LoginModal
        lang={lang}
        isOpen={isLoginOpen}
        initialMode={authModalMode}
        currentUser={auth.currentUser}
        registeredUsers={auth.registeredUsers}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginWithCartMerge}
        onRegisterSuccess={(newUser) =>
          handleRegisterWithCartMerge(newUser, false)
        }
        onUpdateUser={(u) => auth.handleUpdateUser(u, false)}
        onLogout={auth.handleUniversalLogout}
        onResetPasswordSuccess={(id, pwd) =>
          auth.handleResetPasswordSuccess(id, pwd, false)
        }
      />

      {!isAuthFullPage && (
        <AiPetCareChatWidget
          lang={lang}
          onNavigateUrl={handleNavigateCustomUrl}
        />
      )}
    </div>
  );
}
