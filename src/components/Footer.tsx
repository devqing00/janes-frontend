"use client";

import { useState } from "react";
import Link from "next/link";
import { useSiteSettings } from "./SiteSettingsProvider";

const footerLinks = {
  shop: [
    { label: "Womenswear", href: "/shop?category=Womenswear" },
    { label: "Menswear", href: "/shop?category=Menswear" },
    { label: "Raw Fabrics", href: "/shop?category=Fabrics" },
    { label: "New Arrivals", href: "/shop" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Collections", href: "/collections" },
    { label: "Lookbook", href: "/lookbook" },
    { label: "Contact", href: "/contact" },
  ],
  help: [
    { label: "FAQ", href: "/faq" },
    { label: "Shipping & Returns", href: "/shipping" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

const socials: { label: string; href: string }[] = [];

export default function Footer() {
  const [nlEmail, setNlEmail] = useState("");
  const [nlStatus, setNlStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const { instagramUrl } = useSiteSettings();

  const dynamicSocials = [
    ...(instagramUrl ? [{ label: "Instagram", href: instagramUrl }] : []),
    ...socials,
  ];

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
    <footer className="bg-[#232323] text-white">
      {/* Newsletter band */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 py-16 md:py-20">
          <div className="grid grid-cols-12 gap-8 items-center">
            <div className="col-span-12 md:col-span-5">
              <p className="text-white/40 uppercase text-[10px] tracking-[0.25em] mb-3">
                Stay Connected
              </p>
              <h3 className="font-serif text-2xl md:text-3xl leading-snug">
                Join our world of{" "}
                <span className="italic font-normal text-[#C08A6F]">
                  timeless
                </span>{" "}
                fashion
              </h3>
            </div>
            <div className="col-span-12 md:col-span-6 md:col-start-7">
              {nlStatus === "success" ? (
                <div className="py-4">
                  <p className="text-[#C08A6F] text-sm">Thank you for subscribing!</p>
                  <p className="text-white/30 text-xs mt-1">You&apos;ll hear from us soon.</p>
                </div>
              ) : (
                <>
                  <form
                    onSubmit={handleNewsletterSubmit}
                    className="flex flex-col md:flex-row items-stretch md:items-end gap-4 pr-6 md:pr-0"
                  >
                    <div className="flex-1">
                      <label className="text-white/30 uppercase text-[9px] tracking-widest block mb-2">
                        Email Address
                      </label>
                      <input
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
                      {nlStatus === "loading" ? "Subscribing..." : "Subscribe"}
                    </button>
                  </form>
                  <p className="text-white/20 text-[10px] mt-3">
                    {nlStatus === "error" ? "Something went wrong. Please try again." : "No spam. Unsubscribe at any time."}
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
              Luxurious and contemporary fashion crafted with passion, precision
              and purpose. Designed for the modern individual.
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
              Shop
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
              The House
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
              Client Care
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
            &copy; {new Date().getFullYear()} JANES. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-white/25 text-[10px] uppercase tracking-widest hover:text-white/50 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-white/25 text-[10px] uppercase tracking-widest hover:text-white/50 transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
