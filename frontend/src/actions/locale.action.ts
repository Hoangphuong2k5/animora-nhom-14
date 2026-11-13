"use server";

import { cookies } from "next/headers";
import { COOKIE_KEYS } from "@/constants/config.constant";

export type SupportedLocale = "vi" | "en";

export async function setLocaleAction(locale: SupportedLocale): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_KEYS.LOCALE, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // Lưu 1 năm
  });
}
