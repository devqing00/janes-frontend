"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  NGN: "₦",
};

interface SiteSettings {
  currency: string;
  currencySymbol: string;
  instagramUrl: string;
  formatPrice: (amount: number) => string;
}

const defaults: SiteSettings = {
  currency: "USD",
  currencySymbol: "$",
  instagramUrl: "",
  formatPrice: (n) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 0 })}`,
};

const SiteSettingsContext = createContext<SiteSettings>(defaults);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaults);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/payment-methods");
        if (res.ok) {
          const data = await res.json();
          const cur = data.currency || "USD";
          const sym = CURRENCY_SYMBOLS[cur] || cur + " ";
          setSettings({
            currency: cur,
            currencySymbol: sym,
            instagramUrl: data.instagramUrl || "",
            formatPrice: (n: number) =>
              `${sym}${n.toLocaleString(undefined, { minimumFractionDigits: 0 })}`,
          });
        }
      } catch {
        // keep defaults
      }
    }
    load();
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
