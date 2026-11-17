import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Language } from '@/types/animora.type';
import { useTheme } from '@/contexts/ThemeContext';

export interface ToastOptions {
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
}

/**
 * Manages bilingual language state, light/dark theme persistence (via ThemeContext),
 * and unified Sonner toast notifications.
 */
export function useAnimoraPreferences() {
  const [lang, setLang] = useState<Language>('vi');
  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const savedLang = localStorage.getItem('animora_lang');
        if (savedLang === 'en' || savedLang === 'vi') {
          setLang(savedLang);
        }
      } catch {
        // ignore storage errors
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleLanguage = useCallback(() => {
    setLang((prev) => {
      const next = prev === 'vi' ? 'en' : 'vi';
      try {
        localStorage.setItem('animora_lang', next);
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const addToast = useCallback((text: string, options?: ToastOptions) => {
    if (options?.actionLabel && options?.onAction) {
      toast(text, {
        duration: options.durationMs ?? 2500,
        action: {
          label: options.actionLabel,
          onClick: () => options.onAction?.(),
        },
      });
    } else {
      toast.success(text, {
        duration: options?.durationMs ?? 2500,
      });
    }
  }, []);

  return {
    lang,
    darkMode,
    toggleLanguage,
    toggleDarkMode,
    addToast,
  };
}

