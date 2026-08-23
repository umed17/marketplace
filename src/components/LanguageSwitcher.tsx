"use client";

import { localeLabels, localeNames, type Locale } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, tr } = useLocale();

  return (
    <div
      className={`inline-flex items-center rounded-lg border border-[var(--color-border)] bg-white p-0.5 ${className}`}
      role="group"
      aria-label={tr("chooseLanguage")}
    >
      {(["tg", "ru"] as Locale[]).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={`min-w-[2rem] rounded-md px-1.5 py-1 text-[11px] font-bold transition-colors sm:min-w-[2.25rem] sm:px-2 sm:py-1.5 sm:text-xs ${
            locale === code
              ? "bg-[var(--color-primary)] text-white"
              : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted-bg)]"
          }`}
          aria-pressed={locale === code}
          aria-label={localeNames[code]}
          title={localeNames[code]}
        >
          {localeLabels[code]}
        </button>
      ))}
    </div>
  );
}
