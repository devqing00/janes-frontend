"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/CartProvider";
import { useSearch } from "@/components/SearchProvider";
import { useWishlist } from "@/components/WishlistProvider";
import { useSiteSettings } from "@/components/SiteSettingsProvider";
import { useAuth } from "@/components/AuthProvider";
import { useLocale, LOCALES } from "@/components/LocaleProvider";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const currencyRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { itemCount, openCart } = useCart();
  const { openSearch } = useSearch();
  const { itemCount: wishlistCount } = useWishlist();
  const { currency, currencyOptions, setCurrency } = useSiteSettings();
  const { user, signInWithGoogle, signOut } = useAuth();
  const { t, locale, setLocale } = useLocale();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const [categoryTree, setCategoryTree] = useState<{ _id: string; title: string; slug: string; level: number; parent?: { _id: string; slug: string } | null }[]>([]);

  // Fetch dynamic category tree
  useEffect(() => {
    async function fetchCats() {
      try {
        const res = await fetch("/api/products?categoryTree=true");
        if (res.ok) {
          const tree = await res.json();
          setCategoryTree(Array.isArray(tree) ? tree : []);
        }
      } catch { /* fallback: empty dropdown */ }
    }
    fetchCats();
  }, []);

  // Build navLinks with dynamic shop dropdown (hierarchical)
  const shopDropdown = (() => {
    const items: { label: string; href: string }[] = [{ label: t("common.viewAll"), href: "/shop" }];
    const l1 = categoryTree.filter((c) => c.level === 1);
    const l2 = categoryTree.filter((c) => c.level === 2);
    l1.forEach((cat) => {
      items.push({ label: cat.title, href: `/shop?category=${cat.slug}` });
      l2.filter((sub) => sub.parent?._id === cat._id).forEach((sub) => {
        items.push({ label: `  ${sub.title}`, href: `/shop?category=${cat.slug}&subcategory=${sub.slug}` });
      });
    });
    return items;
  })();

  const navLinks = [
    {
      label: t("nav.shop"),
      href: "/shop",
      dropdown: shopDropdown,
    },
    { label: t("nav.collections"), href: "/collections" },
    { label: t("nav.lookbook"), href: "/lookbook" },
    {
      label: t("nav.more"),
      href: "#",
      dropdown: [
        { label: t("nav.aboutUs"), href: "/about" },
        { label: t("nav.contact"), href: "/contact" },
        { label: t("nav.faq"), href: "/faq" },
        { label: t("nav.shippingReturns"), href: "/shipping" },
      ],
    },
  ];

  const mobileLinks = [
    { label: t("nav.shop"), href: "/shop" },
    { label: t("nav.collections"), href: "/collections" },
    { label: t("nav.lookbook"), href: "/lookbook" },
    { label: t("nav.about"), href: "/about" },
    { label: t("nav.contact"), href: "/contact" },
    { label: t("nav.faq"), href: "/faq" },
    { label: t("nav.wishlist"), href: "/wishlist" },
  ];

  // Pages with dark hero where navbar should be transparent initially
  const isHeroPage = pathname === "/" || pathname === "/shop" || pathname === "/collections" || pathname === "/lookbook" || pathname === "/about" || pathname === "/contact";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Close currency / account dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setCurrencyOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showSolid = scrolled || !isHeroPage;

  const handleMouseEnter = (label: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 200);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          showSolid
            ? "bg-[#232323]/95 backdrop-blur-md shadow-lg shadow-black/5"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 flex items-center justify-between h-16 md:h-20">
          {/* Brand */}
          <Link
            href="/"
            className="font-serif text-white text-lg md:text-xl tracking-[0.2em] hover:opacity-80 transition-opacity"
          >
            JANES
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => {
              const isActive = link.href !== "#" && (pathname === link.href || pathname.startsWith(link.href + "/") || pathname.startsWith(link.href + "?"));
              const hasDropdown = link.dropdown && link.dropdown.length > 0;

              return (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => hasDropdown ? handleMouseEnter(link.label) : undefined}
                  onMouseLeave={hasDropdown ? handleMouseLeave : undefined}
                >
                  {link.href === "#" ? (
                    <button
                      className={`relative uppercase text-[10px] tracking-[0.25em] transition-colors duration-300 flex items-center gap-1 ${
                        isActive ? "text-white" : "text-white/60 hover:text-white"
                      }`}
                    >
                      {link.label}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-2.5 h-2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className={`relative uppercase text-[10px] tracking-[0.25em] transition-colors duration-300 flex items-center gap-1 ${
                        isActive ? "text-white" : "text-white/60 hover:text-white"
                      }`}
                    >
                      {link.label}
                      {hasDropdown && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-2.5 h-2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      )}
                      {isActive && (
                        <motion.span
                          layoutId="navbar-indicator"
                          className="absolute -bottom-1 left-0 right-0 h-px bg-brand-accent"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}
                    </Link>
                  )}

                  {/* Dropdown */}
                  <AnimatePresence>
                    {hasDropdown && activeDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 pt-1"
                        onMouseEnter={() => handleMouseEnter(link.label)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="bg-[#232323] border border-white/10 rounded-lg py-2 min-w-[180px] shadow-xl">
                          {link.dropdown!.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className="block px-5 py-2.5 text-white/60 text-[10px] uppercase tracking-[0.15em] hover:text-white hover:bg-white/5 transition-colors"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4 md:gap-5">
            {/* Currency toggle */}
            <div ref={currencyRef} className="relative hidden lg:block">
              <button
                aria-label="Select currency"
                onClick={() => setCurrencyOpen(!currencyOpen)}
                className="text-white/60 hover:text-white transition-colors duration-300 text-[10px] uppercase tracking-[0.15em] font-medium flex items-center gap-1"
              >
                {currency}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-2.5 h-2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <AnimatePresence>
                {currencyOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-2 bg-[#232323] border border-white/10 rounded-lg py-2 min-w-[120px] shadow-xl z-50"
                  >
                    {currencyOptions.map((opt) => (
                      <button
                        key={opt.code}
                        onClick={() => { setCurrency(opt.code); setCurrencyOpen(false); }}
                        className={`block w-full text-left px-4 py-2 text-[10px] uppercase tracking-[0.15em] transition-colors ${
                          currency === opt.code ? "text-[#C08A6F]" : "text-white/60 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Account */}
            <div ref={accountRef} className="relative hidden lg:block">
              {user ? (
                <>
                  <button
                    aria-label="Account"
                    onClick={() => setAccountOpen(!accountOpen)}
                    className="text-white/60 hover:text-white transition-colors duration-300 flex items-center gap-1.5"
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                    )}
                  </button>
                  <AnimatePresence>
                    {accountOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-2 bg-[#232323] border border-white/10 rounded-lg py-2 min-w-[180px] shadow-xl z-50"
                      >
                        <div className="px-4 py-2 border-b border-white/10">
                          <p className="text-white text-xs font-medium truncate">{user.displayName || user.email}</p>
                          <p className="text-white/40 text-[10px] truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/orders"
                          onClick={() => setAccountOpen(false)}
                          className="block px-4 py-2.5 text-white/60 text-[10px] uppercase tracking-[0.15em] hover:text-white hover:bg-white/5 transition-colors"
                        >
                          {t("nav.myOrders")}
                        </Link>
                        <button
                          onClick={() => { signOut(); setAccountOpen(false); }}
                          className="block w-full text-left px-4 py-2.5 text-white/60 text-[10px] uppercase tracking-[0.15em] hover:text-white hover:bg-white/5 transition-colors"
                        >
                          {t("nav.signOut")}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <button
                  aria-label="Sign in"
                  onClick={signInWithGoogle}
                  className="text-white/60 hover:text-white transition-colors duration-300 flex items-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  <span className="text-[10px] uppercase tracking-[0.15em] font-medium">{t("nav.signIn")}</span>
                </button>
              )}
            </div>

            {/* Language toggle */}
            <div ref={langRef} className="relative hidden lg:block">
              <button
                aria-label={t("nav.language")}
                onClick={() => setLangOpen(!langOpen)}
                className="text-white/60 hover:text-white transition-colors duration-300 text-[10px] uppercase tracking-[0.15em] font-medium flex items-center gap-1"
              >
                {locale.toUpperCase()}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-2.5 h-2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-2 bg-[#232323] border border-white/10 rounded-lg py-2 min-w-[120px] shadow-xl z-50"
                  >
                    {LOCALES.map((loc) => (
                      <button
                        key={loc.code}
                        onClick={() => { setLocale(loc.code); setLangOpen(false); }}
                        className={`block w-full text-left px-4 py-2 text-[10px] uppercase tracking-[0.15em] transition-colors ${
                          locale === loc.code ? "text-[#C08A6F]" : "text-white/60 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {loc.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search */}
            <button
              aria-label={t("nav.search")}
              onClick={openSearch}
              className="text-white/60 hover:text-white transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px]">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="hidden lg:flex text-white/60 hover:text-white transition-colors duration-300 relative"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#C08A6F] text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-medium">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              aria-label="Cart"
              onClick={openCart}
              className="text-white/60 hover:text-white transition-colors duration-300 relative"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#C08A6F] text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-medium">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              aria-label="Menu"
              className="lg:hidden text-white/60 hover:text-white transition-colors duration-300"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Fullscreen mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" as const }}
            className="fixed inset-0 z-[200] lg:hidden flex flex-col"
            style={{ backgroundColor: "#232323" }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between h-16 px-6">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="font-serif text-white text-lg tracking-[0.2em]"
              >
                JANES
              </Link>
              <button
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 flex items-center justify-center px-8 md:px-16 w-full">
              {/* Mobile: single centered column. md+: two columns flanking a fading divider */}
              <div className="w-full flex flex-col items-center gap-6 md:grid md:gap-0"
                style={{ gridTemplateColumns: "1fr 1px 1fr" }}>

                {/* Left column — right-aligned on md+ */}
                <div className="flex flex-col items-center md:items-end gap-6 md:gap-8 md:pr-12 lg:pr-16">
                  {mobileLinks.filter((_, i) => i % 2 === 0).map((link, idx) => {
                    const globalIdx = idx * 2;
                    const isActive = pathname === link.href;
                    return (
                      <motion.div
                        key={link.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08 + globalIdx * 0.05, duration: 0.4, ease: "easeOut" as const }}
                        className="md:text-right"
                      >
                        <Link
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={`font-serif text-4xl md:text-5xl tracking-wide transition-colors ${
                            isActive ? "text-brand-accent" : "text-white hover:text-brand-accent"
                          }`}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Fading vertical divider — hidden on mobile */}
                <div
                  className="hidden md:block self-stretch w-px"
                  style={{
                    background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.18) 20%, rgba(255,255,255,0.18) 80%, transparent 100%)",
                  }}
                />

                {/* Right column — left-aligned on md+ */}
                <div className="flex flex-col items-center md:items-start gap-6 md:gap-8 md:pl-12 lg:pl-16">
                  {mobileLinks.filter((_, i) => i % 2 === 1).map((link, idx) => {
                    const globalIdx = idx * 2 + 1;
                    const isActive = pathname === link.href;
                    return (
                      <motion.div
                        key={link.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08 + globalIdx * 0.05, duration: 0.4, ease: "easeOut" as const }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={`font-serif text-4xl md:text-5xl tracking-wide transition-colors ${
                            isActive ? "text-brand-accent" : "text-white hover:text-brand-accent"
                          }`}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </nav>

            {/* Bottom */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="px-8 md:px-16 pb-10 flex flex-col md:flex-row md:flex-wrap md:items-center md:justify-between items-center gap-4 md:gap-6 border-t border-white/10 pt-5"
            >
              {/* Currency selector mobile */}
              <div className="flex items-center gap-3 mb-2">
                {currencyOptions.map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => setCurrency(opt.code)}
                    className={`text-[10px] uppercase tracking-widest transition-colors ${
                      currency === opt.code ? "text-[#C08A6F]" : "text-white/30 hover:text-white/60"
                    }`}
                  >
                    {opt.code}
                  </button>
                ))}
              </div>
              {/* Language selector mobile */}
              <div className="flex items-center gap-3 mb-2">
                {LOCALES.map((loc) => (
                  <button
                    key={loc.code}
                    onClick={() => setLocale(loc.code)}
                    className={`text-[10px] uppercase tracking-widest transition-colors ${
                      locale === loc.code ? "text-[#C08A6F]" : "text-white/30 hover:text-white/60"
                    }`}
                  >
                    {loc.flag}
                  </button>
                ))}
              </div>
              {/* Account mobile */}
              {user ? (
                <button
                  onClick={() => { signOut(); setMobileOpen(false); }}
                  className="text-white/40 uppercase text-[10px] tracking-widest hover:text-white/60 transition-colors"
                >
                  {t("nav.signOut")} ({user.displayName || user.email})
                </button>
              ) : (
                <button
                  onClick={() => { signInWithGoogle(); setMobileOpen(false); }}
                  className="text-[#C08A6F] uppercase text-[10px] tracking-widest hover:text-white transition-colors"
                >
                  {t("nav.signIn")}
                </button>
              )}
              <div className="w-8 h-px bg-brand-accent/40" />
              <div className="flex items-center gap-6">
                <Link
                  href="/shipping"
                  onClick={() => setMobileOpen(false)}
                  className="text-white/30 uppercase text-[10px] tracking-widest hover:text-white/60 transition-colors"
                >
                  {t("nav.shipping")}
                </Link>
                <Link
                  href="/terms"
                  onClick={() => setMobileOpen(false)}
                  className="text-white/30 uppercase text-[10px] tracking-widest hover:text-white/60 transition-colors"
                >
                  {t("nav.terms")}
                </Link>
                <Link
                  href="/privacy"
                  onClick={() => setMobileOpen(false)}
                  className="text-white/30 uppercase text-[10px] tracking-widest hover:text-white/60 transition-colors"
                >
                  {t("nav.privacy")}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
