'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (val: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [darkMode, setDarkModeState] = useState<boolean>(false);

  // Sync DOM with dark mode state
  const applyTheme = useCallback((isDark: boolean) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const theme = isDark ? 'dark' : 'light';
    root.setAttribute('data-theme', theme);
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('animora_theme', theme);
    } catch {
      // ignore
    }
  }, []);

  // Initialize theme from localStorage / media query on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('animora_theme');
      let initialDark = false;
      if (saved !== null) {
        initialDark = saved === 'dark';
      } else if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        initialDark = true;
      }
      setDarkModeState(initialDark);
      applyTheme(initialDark);
    } catch {
      // ignore
    }
  }, [applyTheme]);

  const toggleDarkMode = useCallback(() => {
    setDarkModeState((prev) => {
      const next = !prev;
      applyTheme(next);
      return next;
    });
  }, [applyTheme]);

  const setDarkMode = useCallback((val: boolean) => {
    setDarkModeState(val);
    applyTheme(val);
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
