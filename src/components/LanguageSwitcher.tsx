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
          className={`min-w-[2.25rem] rounded-md px-2 py-1.5 text-xs font-bold transition-colors ${
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
