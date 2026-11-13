"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useTranslation } from "@/components/providers/I18nProvider";
import Footer from "@/components/shared/Footer";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/config.constant";

export default function ForbiddenPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(ROUTES.HOME);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground">
      <div className="h-12" aria-hidden="true" />

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border bg-zinc-50 dark:bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          <span>{t("forbidden.code")}</span>
        </div>

        <h1 className="text-base font-bold tracking-normal text-foreground">
          {t("forbidden.title")}
        </h1>

        <p className="mt-2 max-w-80 text-balance text-[15px] leading-[1.4] text-zinc-500 dark:text-[#777777]">
          {t("forbidden.description")}
        </p>

        <div className="mt-5 flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex h-9 items-center justify-center rounded-[10px] bg-foreground px-4 text-sm font-semibold text-background transition-all hover:opacity-90 active:scale-95 cursor-pointer"
          >
            {t("forbidden.back")}
          </button>

          <Link
            href={ROUTES.HOME}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            {t("forbidden.goHome")}
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

