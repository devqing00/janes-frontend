"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useLocale } from "@/components/LocaleProvider";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1400&q=80";

export interface ParallaxSectionProps {
  image?: string;
  subtitle?: string;
  heading?: string;
  ctaText?: string;
  ctaLink?: string;
}

export default function ParallaxSection({
  image,
  subtitle,
  heading,
  ctaText,
  ctaLink,
}: ParallaxSectionProps) {
  const { t } = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  const bgImage = image || FALLBACK_IMAGE;
  const sub = subtitle || t("home.parallaxSubtitle");
  const head = heading || t("home.parallaxHeading");
  const cta = ctaText || t("home.parallaxCta");
  const link = ctaLink || "/about";

  return (
    <section ref={ref} className="relative h-[70vh] md:h-[85vh] overflow-hidden">
      <motion.div className="absolute inset-[-10%]" style={{ y }}>
        <Image
          src={bgImage}
          alt={t("hero.imageAlt")}
          fill
          className="object-cover"
          sizes="100vw"
        />
      </motion.div>
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="text-center px-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <p className="text-white/50 uppercase text-[10px] tracking-[0.3em] mb-4">
            {sub}
          </p>
          <h2 className="font-serif text-white text-3xl sm:text-5xl md:text-7xl leading-[1.1] max-w-4xl mx-auto">
            {head}
          </h2>
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Link
              href={link}
              className="inline-flex items-center gap-3 text-white uppercase text-[10px] tracking-[0.25em] border border-white/30 px-8 py-3.5 hover:bg-white hover:text-[#1A1A1A] transition-all duration-500 group"
            >
              {cta}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
