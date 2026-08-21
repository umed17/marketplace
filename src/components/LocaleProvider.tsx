"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { LOCALE_STORAGE_KEY, type Locale, type TranslationKey, t } from "@/lib/i18n";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  tr: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("tg");

  useEffect(() => {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    if (saved === "tg" || saved === "ru") {
      setLocaleState(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "tg" ? "tg" : "ru";
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  function setLocale(next: Locale) {
    setLocaleState(next);
  }

  function tr(key: TranslationKey, vars?: Record<string, string | number>) {
    return t(locale, key, vars);
  }

  return <LocaleContext.Provider value={{ locale, setLocale, tr }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
