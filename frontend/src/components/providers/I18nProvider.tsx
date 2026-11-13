"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  setLocaleAction,
  type SupportedLocale,
} from "@/actions/locale.action";
import { COOKIE_KEYS } from "@/constants/config.constant";
import enMessages from "@/locales/en.json";
import viMessages from "@/locales/vi.json";

export type Messages = typeof viMessages;

// Sinh kiểu tự động cho các key lồng nhau dạng "nav.home" | "home.welcome"...
type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;
export type TranslationKey<T = Messages> = (
  T extends object
    ? {
        [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<
          TranslationKey<T[K]>
        >}`;
      }[Exclude<keyof T, symbol>]
    : ""
) extends infer D
  ? Extract<D, string>
  : never;

const dictionaries: Record<SupportedLocale, Messages> = {
  vi: viMessages,
  en: enMessages,
};

export function translateMessage(
  locale: SupportedLocale,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  const keys = key.split(".");
  let current: unknown = dictionaries[locale] ?? dictionaries.vi;

  for (const segment of keys) {
    if (current && typeof current === "object" && segment in current) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      current = undefined;
      break;
    }
  }

  let text = typeof current === "string" ? current : key;

  if (params) {
    for (const [paramKey, paramVal] of Object.entries(params)) {
      text = text.replaceAll(`{{${paramKey}}}`, String(paramVal));
    }
  }

  return text;
}

interface I18nContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (
    key: TranslationKey,
    params?: Record<string, string | number>
  ) => string;
  isPending: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  defaultLocale = "vi",
}: {
  children: React.ReactNode;
  defaultLocale?: SupportedLocale;
}) {
  const [locale, setLocaleState] = useState<SupportedLocale>(defaultLocale);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Khôi phục ngôn ngữ đã lưu sau khi mount để không gây lỗi Hydration Mismatch với Static Shell
  useEffect(() => {
    const cookieMatch = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${COOKIE_KEYS.LOCALE}=`))
      ?.split("=")[1] as SupportedLocale | undefined;

    const saved =
      cookieMatch ||
      (localStorage.getItem(COOKIE_KEYS.LOCALE) as SupportedLocale | null);

    if (saved === "vi" || saved === "en") {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (nextLocale: SupportedLocale) => {
    setLocaleState(nextLocale);
    localStorage.setItem(COOKIE_KEYS.LOCALE, nextLocale);

    startTransition(async () => {
      await setLocaleAction(nextLocale);
      router.refresh();
    });
  };

  const t = (
    key: TranslationKey,
    params?: Record<string, string | number>
  ) => translateMessage(locale, key, params);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isPending }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation phải được sử dụng bên trong <I18nProvider>");
  }
  return context;
}
