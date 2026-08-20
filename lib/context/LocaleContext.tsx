"use client";

/**
 * lib/context/LocaleContext.tsx
 * ─────────────────────────────────────────────────────────────
 * Global locale state for desktools.run.
 *
 * - Provides { locale, setLocale, t } to all child components
 * - `t(key)` returns the translated string for the current locale
 * - Persists the selected language to localStorage
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { translations, type Locale, type Translations } from "@/lib/i18n";

// ── Context shape ──────────────────────────────────────────────
interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof Translations) => string;
}

// ── Create context ─────────────────────────────────────────────
const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

// Helper to detect OS / Browser language for first-time visitors
function detectSystemLocale(): Locale {
  if (typeof window === "undefined" || !navigator) return "en";

  const languages = navigator.languages || [navigator.language];
  for (const lang of languages) {
    if (!lang) continue;
    const lower = lang.toLowerCase();
    if (lower.startsWith("ko")) return "ko";
    if (lower.startsWith("ja")) return "ja";
    if (lower.startsWith("zh")) return "zh";
    if (lower.startsWith("es")) return "es";
    if (lower.startsWith("fr")) return "fr";
    if (lower.startsWith("en")) return "en";
  }
  return "en";
}

// ── Provider ───────────────────────────────────────────────────
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Restore saved language from localStorage or detect OS/Browser language on first visit
  useEffect(() => {
    const saved = localStorage.getItem("desktools-locale") as Locale | null;
    if (saved && saved in translations) {
      setLocaleState(saved);
    } else {
      // First visit: Auto-detect OS/Browser language
      const detected = detectSystemLocale();
      setLocaleState(detected);
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem("desktools-locale", next);
  }, []);

  // Translate function — falls back to English if key missing
  const t = useCallback(
    (key: keyof Translations): string => {
      return translations[locale]?.[key] ?? translations.en[key] ?? key;
    },
    [locale]
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────
export function useLocale() {
  return useContext(LocaleContext);
}
