'use client';

import React from 'react';
import { Hero } from '@/components/pet/Hero';
import { QuickBooking } from '@/components/booking/QuickBooking';
import { AboutUs } from '@/components/pet/AboutUs';
import { Services } from '@/components/booking/Services';
import { Shop } from '@/components/shop/Shop';
import { PetProfiles } from '@/components/pet/PetProfiles';
import { Testimonials } from '@/components/pet/Testimonials';
import { AboutPage } from '@/components/pet/AboutPage';
import { ServicesPage } from '@/components/booking/ServicesPage';
import { ShopPage } from '@/components/shop/ShopPage';
import { PetProfilesPage } from '@/components/pet/PetProfilesPage';
import { AuthPage } from '@/components/auth/AuthPage';
import { MyAccountPage } from '@/components/auth/MyAccountPage';
import { ServiceBookingPage } from '@/components/booking/ServiceBookingPage';
import { MyBookingsPage } from '@/components/booking/MyBookingsPage';
import { CartPage } from '@/components/shop/CartPage';
import { CheckoutPage } from '@/components/shop/CheckoutPage';
import { MyOrdersPage } from '@/components/shop/MyOrdersPage';
import type { Prescription } from '@/types/expert.type';
import {
  Booking,
  CartItem,
  Language,
  PageId,
  Pet,
  Product,
  UserAccount,
  Vaccination,
} from '@/types/animora.type';
import { parseServiceBookingUrl } from '@/data/serviceBookingData';
import { parseMyBookingsUrl } from '@/utils/bookingHistoryUtils';
import { ToastOptions } from '@/hooks/animora/useAnimoraPreferences';

export interface AnimoraPageRendererProps {
  activePage: PageId;
  lang: Language;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleLang: () => void;
  addToast: (text: string, options?: ToastOptions) => void;
  isStorageHydrated: boolean;

  // Routing & UI states
  bookingUrlState: ReturnType<typeof parseServiceBookingUrl>;
  myBookingsUrlState: ReturnType<typeof parseMyBookingsUrl>;
  preFilledService: string;
  setPreFilledService: (service: string) => void;
  bookingTrigger: number;
  onNavigate: (page: PageId) => void;
  onNavigateCustomUrl: (path: string) => void;
  onOpenBookingPage: (serviceSlugOrName?: string) => void;
  onSelectService: (serviceName: string) => void;
  onOpenCartDrawer: () => void;

  // Domain Data
  pets: Pet[];
  vaccinations: Vaccination[];
  products: Product[];
  bookings: Booking[];
  onAddBooking: (booking: Booking) => void;
  onUpdateBooking: (booking: Booking) => void;
  onUpdatePet: (pet: Pet, vaccinations: Vaccination[]) => void;
  onAddPet: (pet: Pet, vaccinations: Vaccination[]) => void;
  onDeletePet: (petId: string) => void;

  // Cart
  cart: CartItem[];
  savedForLater: CartItem[];
  appliedCoupon: string;
  orderNote: string;
  cartRedirectNotice: string | null;
  totalCartCount: number;
  setAppliedCoupon: (code: string) => void;
  setOrderNote: (note: string) => void;
  setCartRedirectNotice: (notice: string | null) => void;
  onAddToCart: (product: Product, quantity?: number, selectedSpec?: string) => void;
  onBuyNow: (product: Product, quantity?: number, selectedSpec?: string) => void;
  onUpdateCartQuantity: (itemKeyOrProductId: string, delta: number) => void;
  onSetCartQuantity: (itemKey: string, newQty: number) => void;
  onChangeCartItemSpec: (itemKey: string, newSpecVi: string) => void;
  onRemoveItemWithUndo: (item: CartItem) => void;
  onSaveForLater: (item: CartItem) => void;
  onMoveSavedToCart: (item: CartItem) => void;
  onRemoveSavedItem: (itemKey: string) => void;
  onAcceptCartPriceChange: (itemKey: string) => void;
  onRefillPrescription?: (prescription: Prescription) => void;
  onCompleteOrder: (orderDetails?: {
    orderCode?: string;
    recipientName?: string;
    phone?: string;
    address?: string;
    paymentMethod?: 'cod' | 'bank';
    note?: string;
    total?: number;
  }) => void;

  // Auth
  currentUser: UserAccount | null;
  registeredUsers: UserAccount[];
  returnPageAfterAuth: PageId | null;
  setReturnPageAfterAuth: (page: PageId | null) => void;
  onAuthLoginSuccess: (user: UserAccount) => void;
  onAuthRegisterSuccess: (user: UserAccount) => void;
  onAuthUpdateUser: (user: UserAccount) => void;
  onAuthResetPasswordSuccess: (identifier: string, newPassword: string) => void;
  onUniversalLogout: () => Promise<void>;
}

export const AnimoraPageRenderer = ({
  activePage,
  lang,
  darkMode,
  onToggleDarkMode,
  onToggleLang,
  addToast,
  isStorageHydrated,
  bookingUrlState,
  myBookingsUrlState,
  preFilledService,
  setPreFilledService,
  bookingTrigger,
  onNavigate,
  onNavigateCustomUrl,
  onOpenBookingPage,
  onSelectService,
  onOpenCartDrawer,
  pets,
  vaccinations,
  products,
  bookings,
  onAddBooking,
  onUpdateBooking,
  onUpdatePet,
  onAddPet,
  onDeletePet,
  cart,
  savedForLater,
  appliedCoupon,
  orderNote,
  cartRedirectNotice,
  totalCartCount,
  setAppliedCoupon,
  setOrderNote,
  setCartRedirectNotice,
  onAddToCart,
  onBuyNow,
  onUpdateCartQuantity,
  onSetCartQuantity,
  onChangeCartItemSpec,
  onRemoveItemWithUndo,
  onSaveForLater,
  onMoveSavedToCart,
  onRemoveSavedItem,
  onAcceptCartPriceChange,
  onRefillPrescription,
  onCompleteOrder,
  currentUser,
  registeredUsers,
  returnPageAfterAuth,
  setReturnPageAfterAuth,
  onAuthLoginSuccess,
  onAuthRegisterSuccess,
  onAuthUpdateUser,
  onAuthResetPasswordSuccess,
  onUniversalLogout,
}: AnimoraPageRendererProps) => {
  switch (activePage) {
    case 'home':
      return (
        <>
          <Hero
            lang={lang}
            darkMode={darkMode}
            onOpenConsultation={() => onOpenBookingPage()}
          />
          <QuickBooking
            lang={lang}
            onAddBooking={onAddBooking}
            onOpenBookingPage={onOpenBookingPage}
            selectedServicePreFill={preFilledService}
            bookingTrigger={bookingTrigger}
          />
          <AboutUs lang={lang} onOpenDetail={() => onNavigate('about')} />
          <Services
            lang={lang}
            onSelectService={onSelectService}
            onOpenDetail={() => onNavigate('services')}
          />
          <Shop
            lang={lang}
            products={products}
            onAddToCart={onAddToCart}
            onBuyNow={onBuyNow}
            onOpenDetail={() => onNavigate('shop')}
          />
          <PetProfiles
            lang={lang}
            currentUser={currentUser}
            pets={pets}
            vaccinations={vaccinations}
            onUpdatePet={onUpdatePet}
            onAddPet={onAddPet}
            onDeletePet={onDeletePet}
            onOpenDetail={() => onNavigate('pet-profiles')}
            onBookService={onSelectService}
            onAddBooking={onAddBooking}
            onShowToast={addToast}
            onLogin={() => {
              setReturnPageAfterAuth('home');
              onNavigate('login');
            }}
          />
          <Testimonials lang={lang} />
        </>
      );

    case 'about':
      return (
        <AboutPage
          lang={lang}
          onNavigate={onNavigate}
          onBookWithSpecialist={(serviceName) => {
            setPreFilledService(serviceName);
            onOpenBookingPage(serviceName);
          }}
        />
      );

    case 'services':
      return (
        <ServicesPage
          lang={lang}
          bookings={bookings}
          onAddBooking={onAddBooking}
          onNavigate={onNavigate}
          onBookService={(serviceSlug) => onOpenBookingPage(serviceSlug)}
          initialSelectedService={preFilledService}
        />
      );

    case 'booking':
      return (
        <ServiceBookingPage
          lang={lang}
          darkMode={darkMode}
          pets={pets}
          bookings={bookings}
          currentUser={currentUser}
          initialServiceSlug={bookingUrlState.preselectedServiceSlug}
          isSuccessRoute={bookingUrlState.isSuccessRoute}
          onAddBooking={onAddBooking}
          onAddPet={onAddPet}
          onNavigate={onNavigate}
          onNavigateBookingUrl={onNavigateCustomUrl}
        />
      );

    case 'my-bookings':
      return (
        <MyBookingsPage
          lang={lang}
          darkMode={darkMode}
          bookings={bookings}
          pets={pets}
          currentUser={currentUser}
          detailCode={myBookingsUrlState.detailCode}
          queryCode={myBookingsUrlState.queryCode}
          action={myBookingsUrlState.action}
          onUpdateBooking={onUpdateBooking}
          onNavigate={onNavigate}
          onNavigateUrl={onNavigateCustomUrl}
          onShowToast={addToast}
        />
      );

    case 'my-orders':
      return (
        <MyOrdersPage
          lang={lang}
          currentUser={currentUser}
          onNavigate={onNavigate}
          onShowToast={addToast}
        />
      );

    case 'shop':
      return (
        <ShopPage
          lang={lang}
          products={products}
          pets={pets}
          onAddToCart={onAddToCart}
          onBuyNow={onBuyNow}
          onOpenCart={onOpenCartDrawer}
          cartCount={totalCartCount}
          onNavigate={onNavigate}
        />
      );

    case 'cart':
      return (
        <CartPage
          lang={lang}
          darkMode={darkMode}
          cart={cart}
          savedForLater={savedForLater}
          products={products}
          currentUser={currentUser}
          appliedCoupon={appliedCoupon}
          orderNote={orderNote}
          redirectNotice={cartRedirectNotice}
          onClearRedirectNotice={() => setCartRedirectNotice(null)}
          onUpdateQuantity={onUpdateCartQuantity}
          onSetQuantity={onSetCartQuantity}
          onChangeSpec={onChangeCartItemSpec}
          onRemoveItemWithUndo={onRemoveItemWithUndo}
          onSaveForLater={onSaveForLater}
          onMoveSavedToCart={onMoveSavedToCart}
          onRemoveSavedItem={onRemoveSavedItem}
          onAcceptPriceChange={onAcceptCartPriceChange}
          onApplyCoupon={(code) => setAppliedCoupon(code)}
          onRemoveCoupon={() => setAppliedCoupon('')}
          onChangeOrderNote={setOrderNote}
          onAddToCart={onAddToCart}
          onBuyNow={onBuyNow}
          onNavigate={onNavigate}
          onNavigateUrl={onNavigateCustomUrl}
        />
      );

    case 'checkout':
      return (
        <CheckoutPage
          lang={lang}
          darkMode={darkMode}
          cart={cart}
          isCartHydrated={isStorageHydrated}
          products={products}
          currentUser={currentUser}
          appliedCoupon={appliedCoupon}
          orderNote={orderNote}
          onChangeOrderNote={setOrderNote}
          onReturnToCartWithNotice={(notice) => {
            setCartRedirectNotice(notice);
            onNavigateCustomUrl('/gio-hang');
          }}
          onClearInvalidCoupon={() => setAppliedCoupon('')}
          onCompleteOrder={onCompleteOrder}
          onUpdateUser={onAuthUpdateUser}
          onShowToast={addToast}
          onNavigate={onNavigate}
          onNavigateUrl={onNavigateCustomUrl}
        />
      );

    case 'pet-profiles':
      return (
        <PetProfilesPage
          lang={lang}
          currentUser={currentUser}
          pets={pets}
          vaccinations={vaccinations}
          onUpdatePet={onUpdatePet}
          onAddPet={onAddPet}
          onDeletePet={onDeletePet}
          onNavigate={onNavigate}
          onBookService={onSelectService}
          onAddBooking={onAddBooking}
          onRefillPrescription={onRefillPrescription}
          onShowToast={addToast}
          onRequestLogin={() => {
            setReturnPageAfterAuth('pet-profiles');
            onNavigate('login');
          }}
        />
      );

    case 'account':
      return (
        <MyAccountPage
          lang={lang}
          currentUser={currentUser}
          pets={pets}
          bookings={bookings}
          onUpdateUser={onAuthUpdateUser}
          onLogout={async () => {
            await onUniversalLogout();
            onNavigate('login');
          }}
          onNavigate={onNavigate}
          onShowToast={addToast}
        />
      );

    case 'login':
    case 'register':
      return (
        <AuthPage
          lang={lang}
          darkMode={darkMode}
          onToggleDarkMode={onToggleDarkMode}
          onToggleLang={onToggleLang}
          initialMode={activePage === 'register' ? 'register' : 'login'}
          currentUser={currentUser}
          registeredUsers={registeredUsers}
          onNavigate={onNavigate}
          onLoginSuccess={(user) => {
            onAuthLoginSuccess(user);
            const dest = returnPageAfterAuth || 'home';
            setReturnPageAfterAuth(null);
            onNavigate(dest);
          }}
          onRegisterSuccess={(newUser) => {
            onAuthRegisterSuccess(newUser);
            const dest = returnPageAfterAuth || 'home';
            setReturnPageAfterAuth(null);
            onNavigate(dest);
          }}
          onUpdateUser={onAuthUpdateUser}
          onLogout={async () => {
            await onUniversalLogout();
            onNavigate('login');
          }}
          onResetPasswordSuccess={onAuthResetPasswordSuccess}
        />
      );

    default:
      return null;
  }
};

