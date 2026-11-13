"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/components/providers/I18nProvider";
import { getLanguageToggleMeta } from "@/utils/petLogic";
import { Language } from "@/types";

interface LanguageSwitcherProps {
  lang?: Language;
  onToggleLang?: () => void;
  tooltipId?: string;
  showTooltip?: boolean;
  className?: string;
}

export default function LanguageSwitcher({
  lang: propLang,
  onToggleLang: propOnToggle,
  tooltipId = "lang-toggle-tooltip",
  showTooltip = true,
  className = "",
}: LanguageSwitcherProps) {
  const { lang: contextLang, setLanguage } = useLanguage();
  let i18nContext: ReturnType<typeof useTranslation> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    i18nContext = useTranslation();
  } catch {
    // Graceful fallback if I18nProvider is not in tree
  }

  const currentLang: Language = propLang || contextLang || "vi";
  const langMeta = getLanguageToggleMeta(currentLang);

  const handleToggle = () => {
    if (propOnToggle) {
      propOnToggle();
      return;
    }
    const nextLang: Language = currentLang === "vi" ? "en" : "vi";
    setLanguage(nextLang);
    if (i18nContext?.setLocale) {
      i18nContext.setLocale(nextLang);
    }
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <button
        type="button"
        data-testid="lang-toggle"
        onClick={handleToggle}
        aria-label={langMeta.ariaLabel}
        aria-describedby={tooltipId}
        className="peer flex items-center gap-0.5 p-0.5 rounded-full text-[11px] font-extrabold transition-all duration-200 hover:scale-105 active:scale-95 uppercase tracking-wider glass-pill cursor-pointer"
      >
        <span
          className="px-2 py-0.5 rounded-full transition-all duration-200"
          style={{
            backgroundColor: currentLang === "vi" ? "var(--primary)" : "transparent",
            color: currentLang === "vi" ? "var(--on-primary)" : "var(--text-muted)",
          }}
        >
          VI
        </span>
        <span
          className="px-2 py-0.5 rounded-full transition-all duration-200"
          style={{
            backgroundColor: currentLang === "en" ? "var(--primary)" : "transparent",
            color: currentLang === "en" ? "var(--on-primary)" : "var(--text-muted)",
          }}
        >
          EN
        </span>
      </button>

      {/* Subtle Hover/Focus Tooltip */}
      {showTooltip && (
        <div
          id={tooltipId}
          role="tooltip"
          data-testid="lang-tooltip"
          className="pointer-events-none invisible opacity-0 peer-hover:visible peer-hover:opacity-100 peer-focus-visible:visible peer-focus-visible:opacity-100 transition-all duration-200 translate-y-1 peer-hover:translate-y-0 peer-focus-visible:translate-y-0 absolute right-0 top-full mt-2.5 z-50 whitespace-nowrap rounded-2xl px-3.5 py-2.5 shadow-xl border text-left glass-card"
          style={{
            borderColor: "var(--border)",
          }}
        >
          <div
            className="flex items-center gap-2 text-xs font-extrabold"
            style={{ color: "var(--primary)" }}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: "var(--coral)" }}
            />
            <span>{langMeta.tooltipStatus}</span>
          </div>
          <div
            className="text-[11px] font-semibold mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            {langMeta.tooltipAction} →
          </div>
        </div>
      )}
    </div>
  );
}
