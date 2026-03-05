"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSearch } from "./SearchProvider";
import { useSiteSettings } from "./SiteSettingsProvider";
import { useLocale } from "@/components/LocaleProvider";

interface SearchResult {
  _id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  category: string;
}

export default function SearchOverlay() {
  const { isOpen, closeSearch } = useSearch();
  const { formatPrice } = useSiteSettings();
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
      setSearched(false);
    }
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(Array.isArray(data) ? data : []);
        }
      } catch {
        // silent fail
      } finally {
        setLoading(false);
        setSearched(true);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [closeSearch]);

  const categoryLabels: Record<string, string> = {
    womenswear: t("categories.womenswear"),
    menswear: t("categories.menswear"),
    fabrics: t("categories.fabrics"),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[400] bg-[#232323]/95 backdrop-blur-md flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label={t("search.title")}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 md:px-12 py-5 max-w-[1440px] mx-auto w-full">
            <span className="font-serif text-white text-lg tracking-[0.2em]">JANES</span>
            <button
              onClick={closeSearch}
              className="text-white/60 hover:text-white transition-colors p-1"
              aria-label={t("search.closeSearch")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search input */}
          <div className="max-w-2xl mx-auto w-full px-6 pt-8 md:pt-16">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("search.placeholder")}
                className="w-full bg-transparent border-b border-white/20 pb-4 pl-8 text-white text-xl md:text-2xl placeholder:text-white/30 focus:outline-none focus:border-[#C08A6F] transition-colors"
              />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full px-6 pt-8">
            {loading && (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-16 h-20 bg-white/10 rounded" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-white/10 rounded w-32" />
                      <div className="h-3 bg-white/10 rounded w-20" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && searched && results.length === 0 && (
              <div className="text-center py-12">
                <p className="text-white/40 text-sm">{t("search.noResults")} &ldquo;{query}&rdquo;</p>
                <Link
                  href="/shop"
                  onClick={closeSearch}
                  className="text-[#C08A6F] text-xs uppercase tracking-[0.15em] mt-3 inline-block hover:underline"
                >
                  {t("search.exploreCta")}
                </Link>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="space-y-1" aria-live="polite">
                <p className="text-white/30 text-[10px] uppercase tracking-widest mb-4">
                  {results.length} {results.length !== 1 ? t("search.results") : t("search.result")}
                </p>
                {results.map((product) => (
                  <Link
                    key={product._id}
                    href={`/shop/${product.slug}`}
                    onClick={closeSearch}
                    className="flex items-center gap-4 py-3 px-3 -mx-3 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <div className="relative w-14 h-18 bg-white/10 flex-shrink-0 overflow-hidden" style={{ height: "72px" }}>
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 text-[8px]">
                          {t("common.noImage")}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm group-hover:text-[#C08A6F] transition-colors truncate">
                        {product.name}
                      </p>
                      <p className="text-white/40 text-xs mt-0.5">
                        {categoryLabels[product.category] || product.category}
                      </p>
                    </div>
                    <p className="text-white/60 text-sm">{formatPrice(product.price)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="max-w-2xl mx-auto w-full px-6 pb-8 pt-4">
            <div className="border-t border-white/10 pt-4">
              <p className="text-white/20 text-[10px] uppercase tracking-widest mb-3">{t("search.quickLinks")}</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: t("categories.womenswear"), href: "/shop?category=womenswear" },
                  { label: t("categories.menswear"), href: "/shop?category=menswear" },
                  { label: t("categories.fabrics"), href: "/shop?category=fabrics" },
                  { label: t("nav.collections"), href: "/collections" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeSearch}
                    className="text-white/40 text-xs hover:text-[#C08A6F] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
