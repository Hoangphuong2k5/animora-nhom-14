"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useTranslation } from "@/components/providers/I18nProvider";
import { CONFIG, ROUTES } from "@/constants/config.constant";
import { cn } from "@/lib/utils";

const subscribeNoop = () => () => {};

export default function Footer({ className }: { className?: string }) {
  const { t } = useTranslation();

  // Đọc năm hiện tại ở phía Client sau khi hydrate để tránh lỗi Blocking Route (new Date) khi prerender tĩnh
  const year = useSyncExternalStore(
    subscribeNoop,
    () => new Date().getFullYear(),
    () => null
  );

  return (
    <footer
      className={cn(
        "py-5 px-6 text-center text-xs text-zinc-400 dark:text-[#777777]",
        className
      )}
    >
      <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <li>© {year}</li>
        <li>
          <Link href={ROUTES.HOME} className="hover:underline">
            {t("footer.terms", { appName: CONFIG.APP_NAME })}
          </Link>
        </li>
        <li>
          <Link href={ROUTES.HOME} className="hover:underline">
            {t("footer.privacy")}
          </Link>
        </li>
        <li>
          <Link href={ROUTES.HOME} className="hover:underline">
            {t("footer.cookies")}
          </Link>
        </li>
      </ul>
    </footer>
  );
}

