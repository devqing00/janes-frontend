"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";

const socials: { label: string; href: string }[] = [
  { label: "Instagram", href: "https://instagram.com/janes" },
];

export default function Footer() {
  const { t } = useLocale();
  const [nlEmail, setNlEmail] = useState("");
  const [nlStatus, setNlStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const footerLinks = {
    shop: [
      { label: t("categories.womenswear"), href: "/shop?category=Womenswear" },
      { label: t("categories.menswear"), href: "/shop?category=Menswear" },
      { label: t("categories.fabrics"), href: "/shop?category=Fabrics" },
      { label: t("footer.newArrivals"), href: "/shop" },
    ],
    company: [
      { label: t("nav.aboutUs"), href: "/about" },
      { label: t("nav.collections"), href: "/collections" },
      { label: t("nav.lookbook"), href: "/lookbook" },
      { label: t("nav.contact"), href: "/contact" },
    ],
    help: [
      { label: t("nav.faq"), href: "/faq" },
      { label: t("nav.shippingReturns"), href: "/shipping" },
      { label: t("footer.privacyPolicy"), href: "/privacy" },
      { label: t("footer.termsOfService"), href: "/terms" },
    ],
  };

  const dynamicSocials = socials;

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlEmail.includes("@")) return;
    setNlStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: nlEmail }),
      });
      if (res.ok) {
        setNlStatus("success");
        setNlEmail("");
      } else {
        setNlStatus("error");
      }
    } catch {
      setNlStatus("error");
    }
  };

  return (
    <footer className="bg-[#232323] text-white overflow-hidden">
      {/* Newsletter band */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 py-16 md:py-20">
          <div className="grid grid-cols-12 gap-8 items-center">
            <div className="col-span-12 md:col-span-5">
              <p className="text-white/40 uppercase text-[10px] tracking-[0.25em] mb-3">
                {t("footer.newsletterLabel")}
              </p>
              <h3 className="font-serif text-2xl md:text-3xl leading-snug">
                {t("footer.newsletterHeading1")}{" "}
                <span className="italic font-normal text-[#C08A6F]">
                  {t("footer.newsletterHeading2")}
                </span>{" "}
                {t("footer.newsletterHeading3")}
              </h3>
            </div>
            <div className="col-span-12 md:col-span-6 md:col-start-7 min-w-0">
              {nlStatus === "success" ? (
                <div className="py-4">
                  <p className="text-[#C08A6F] text-sm">
                    {t("footer.newsletterSuccess")}
                  </p>
                  <p className="text-white/30 text-xs mt-1">
                    {t("footer.newsletterSuccessSub")}
                  </p>
                </div>
              ) : (
                <>
                  <form
                    onSubmit={handleNewsletterSubmit}
                    className="flex flex-col md:flex-row items-start md:items-end gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <label htmlFor="newsletter-email" className="text-white/30 uppercase text-[9px] tracking-widest block mb-2">
                        {t("footer.emailLabel")}
                      </label>
                      <input
                        id="newsletter-email"
                        type="email"
                        value={nlEmail}
                        onChange={(e) => setNlEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="w-full bg-transparent border-b border-white/20 pb-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#C08A6F] transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={nlStatus === "loading"}
                      className="bg-[#C08A6F] text-white uppercase text-[10px] tracking-[0.2em] px-6 py-3 hover:bg-[#C08A6F]/90 transition-all shrink-0 disabled:opacity-50"
                    >
                      {nlStatus === "loading" ? t("footer.subscribing") : t("footer.subscribe")}
                    </button>
                  </form>
                  <p className="text-white/20 text-[10px] mt-3">
                    {nlStatus === "error"
                      ? t("footer.newsletterError")
                      : t("footer.newsletterDisclaimer")}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main footer links */}
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-4">
            <Link
              href="/"
              className="font-serif text-xl tracking-[0.2em] hover:opacity-80 transition-opacity"
            >
              JANES
            </Link>
            <p className="text-white/40 text-xs leading-relaxed mt-4 max-w-xs">
              {t("footer.brandDescription")}
            </p>
            <div className="flex gap-5 mt-6">
              {dynamicSocials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 text-[10px] uppercase tracking-widest hover:text-[#C08A6F] transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div className="col-span-1 md:col-span-2 md:col-start-6">
            <p className="text-white/60 uppercase text-[10px] tracking-[0.2em] mb-5">
              {t("footer.shopColumn")}
            </p>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/40 text-xs hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div className="col-span-1 md:col-span-2">
            <p className="text-white/60 uppercase text-[10px] tracking-[0.2em] mb-5">
              {t("footer.theHouse")}
            </p>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/40 text-xs hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help links */}
          <div className="col-span-1 md:col-span-2">
            <p className="text-white/60 uppercase text-[10px] tracking-[0.2em] mb-5">
              {t("footer.clientCare")}
            </p>
            <ul className="space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/40 text-xs hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-[10px] uppercase tracking-widest">
            {t("footer.copyright", { year: new Date().getFullYear().toString() })}
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-white/25 text-[10px] uppercase tracking-widest hover:text-white/50 transition-colors"
            >
              {t("nav.privacy")}
            </Link>
            <Link
              href="/terms"
              className="text-white/25 text-[10px] uppercase tracking-widest hover:text-white/50 transition-colors"
            >
              {t("nav.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
