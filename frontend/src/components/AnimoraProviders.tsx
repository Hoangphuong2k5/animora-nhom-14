'use client';

import React, { Suspense, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { I18nProvider } from '@/components/providers/I18nProvider';
import { TooltipProvider } from '@/components/ui/tooltip';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

const PORTAL_ROUTE_PREFIXES = ['/admin', '/manager', '/expert', '/supplier', '/rescue'];

function PortalThemeSync() {
  const pathname = usePathname();

  useEffect(() => {
    const isPortalRoute = PORTAL_ROUTE_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
    if (isPortalRoute) {
      document.documentElement.setAttribute('data-portal-theme', 'slate');
    } else {
      document.documentElement.removeAttribute('data-portal-theme');
    }
  }, [pathname]);

  return null;
}

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Suspense fallback={null}>
          <PortalThemeSync />
        </Suspense>
        <LanguageProvider>
          <I18nProvider defaultLocale="vi">
            <AuthProvider>
              <CartProvider>
                <TooltipProvider delay={200}>{children}</TooltipProvider>
              </CartProvider>
            </AuthProvider>
          </I18nProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
