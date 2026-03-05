"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import en from "@/i18n/en.json";
import fr from "@/i18n/fr.json";

/* ── Supported locales ────────────────────────────────── */
export const LOCALES = [
  { code: "en", label: "English", flag: "EN" },
  { code: "fr", label: "Français", flag: "FR" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

const messages: Record<string, Record<string, unknown>> = { en, fr };

const STORAGE_KEY = "janes-locale";

/* ── Helpers ──────────────────────────────────────────── */

/** Resolve a dot-path key from a nested object, e.g. "nav.shop" → value */
function resolve(obj: unknown, path: string): string | undefined {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : undefined;
}

/* ── Context ──────────────────────────────────────────── */

interface LocaleContextValue {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  /** Translate a key. Optionally pass params for {placeholder} interpolation. */
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

/* ── Provider ─────────────────────────────────────────── */

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>("en");
  const [mounted, setMounted] = useState(false);

  // Hydration-safe: read localStorage only after mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && messages[saved]) {
      setLocaleState(saved as LocaleCode);
      document.documentElement.lang = saved;
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((code: LocaleCode) => {
    if (messages[code]) {
      setLocaleState(code);
      localStorage.setItem(STORAGE_KEY, code);
      // Update <html lang> attribute
      document.documentElement.lang = code;
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let value =
        resolve(messages[locale], key) ??
        resolve(messages.en, key) ??
        key;

      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          value = value!.replace(`{${k}}`, String(v));
        });
      }
      return value;
    },
    [locale]
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

/* ── Hook ─────────────────────────────────────────────── */

export function useLocale() {
  return useContext(LocaleContext);
}
