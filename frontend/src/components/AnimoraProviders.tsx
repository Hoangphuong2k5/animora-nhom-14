'use client';

import React from 'react';
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

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
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
