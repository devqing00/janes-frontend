"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

// Only NGN and USD — Paystack processes in NGN; USD is the one foreign currency
// that makes sense for a Nigerian store with international visitors.
const CURRENCY_OPTIONS = [
  { code: "NGN", symbol: "₦", label: "NGN (₦)" },
  { code: "USD", symbol: "$", label: "USD ($)" },
] as const;

type CurrencyCode = (typeof CURRENCY_OPTIONS)[number]["code"];

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = { NGN: "₦", USD: "$" };

interface SiteSettings {
  currency: CurrencyCode;
  currencySymbol: string;
  /** Rate to convert one NGN → display currency (1 when NGN selected) */
  usdRate: number | null;
  currencyOptions: typeof CURRENCY_OPTIONS;
  setCurrency: (code: CurrencyCode) => void;
  /** Always formats the supplied NGN amount in the currently selected display currency */
  formatPrice: (ngnAmount: number) => string;
  /** Always returns a ₦ formatted string regardless of selected currency — use in checkout */
  formatNGN: (ngnAmount: number) => string;
}

const formatNGN = (n: number) =>
  `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;

const defaults: SiteSettings = {
  currency: "NGN",
  currencySymbol: "₦",
  usdRate: null,
  currencyOptions: CURRENCY_OPTIONS,
  setCurrency: () => {},
  formatPrice: formatNGN,
  formatNGN,
};

const SiteSettingsContext = createContext<SiteSettings>(defaults);

const STORAGE_KEY = "janes-currency";
const RATE_CACHE_KEY = "janes-usd-rate";
const RATE_CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getSavedCurrency(): CurrencyCode {
  if (typeof window === "undefined") return "NGN";
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
    if (saved && CURRENCY_SYMBOLS[saved]) return saved;
  } catch { /* ignore */ }
  return "NGN";
}

function getCachedRate(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(RATE_CACHE_KEY);
    if (!raw) return null;
    const { rate, ts } = JSON.parse(raw) as { rate: number; ts: number };
    if (Date.now() - ts < RATE_CACHE_TTL) return rate;
  } catch { /* ignore */ }
  return null;
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(getSavedCurrency);
  const [usdRate, setUsdRate] = useState<number | null>(null);

  // Fetch live NGN → USD rate once per session (server-side cached for 1h)
  useEffect(() => {
    const cached = getCachedRate();
    if (cached !== null) {
      setUsdRate(cached);
      return;
    }
    fetch("/api/exchange-rate")
      .then((r) => r.json())
      .then(({ usdRate: rate }: { usdRate: number }) => {
        if (rate > 0) {
          setUsdRate(rate);
          sessionStorage.setItem(
            RATE_CACHE_KEY,
            JSON.stringify({ rate, ts: Date.now() })
          );
        }
      })
      .catch(() => { /* keep null — formatPrice falls back to NGN */ });
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    if (CURRENCY_SYMBOLS[code]) {
      setCurrencyState(code);
      try { localStorage.setItem(STORAGE_KEY, code); } catch { /* ignore */ }
    }
  }, []);

  const formatPrice = useCallback(
    (ngnAmount: number) => {
      if (currency === "USD" && usdRate && usdRate > 0) {
        const usd = ngnAmount * usdRate;
        return `$${usd.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      }
      return formatNGN(ngnAmount);
    },
    [currency, usdRate]
  );

  const value: SiteSettings = {
    currency,
    currencySymbol: CURRENCY_SYMBOLS[currency],
    usdRate,
    currencyOptions: CURRENCY_OPTIONS,
    setCurrency,
    formatPrice,
    formatNGN,
  };

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

