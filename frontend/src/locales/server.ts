import "server-only";
import { cookies } from "next/headers";
import type { SupportedLocale } from "@/actions/locale.action";
import {
  translateMessage,
  type TranslationKey,
} from "@/components/providers/I18nProvider";
import { COOKIE_KEYS } from "@/constants/config.constant";

export async function getTranslations() {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get(COOKIE_KEYS.LOCALE)?.value;
  const locale: SupportedLocale = rawLocale === "en" ? "en" : "vi";

  return {
    locale,
    t: (key: TranslationKey, params?: Record<string, string | number>) =>
      translateMessage(locale, key, params),
  };
}
