"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const reveal = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.2 + 0.15 * i, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

/* ── Fallback images ── */
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80",
];

export interface HeroProps {
  tagline?: string;
  heroImages?: string[];
  heroSeasonLabel?: string;
  heroCTAText?: string;
}

export default function Hero({
  tagline,
  heroImages,
  heroSeasonLabel,
  heroCTAText,
}: HeroProps) {
  const images = heroImages && heroImages.length >= 3 ? heroImages : FALLBACK_IMAGES;
  const season = heroSeasonLabel || "SS 2026";
  const ctaText = heroCTAText || "Explore Collection";

  /* Parse tagline into styled heading lines.
     Default: "Luxurious and Contemporary Fashion for Every One" */
  const headingNode = tagline ? (
    <h1 className="font-serif text-white text-[2.75rem] sm:text-5xl md:text-6xl lg:text-[5.5rem] leading-[1.05] tracking-tight uppercase">
      {tagline}
    </h1>
  ) : (
    <h1 className="font-serif text-white text-[2.75rem] sm:text-5xl md:text-6xl lg:text-[5.5rem] leading-[1.05] tracking-tight">
      LUXURIOUS{" "}
      <span className="italic font-normal opacity-80">and</span>
      <br />
      CLASSY
      <br />
      FASHION
      <br />
      <span className="italic font-normal opacity-80">for</span> EVERY
      <br />
      ONE
    </h1>
  );
  return (
    <section className="relative bg-[#232323] min-h-screen flex items-end overflow-hidden">
      {/* Subtle grain overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

      <div className="mx-auto max-w-[1440px] w-full px-6 md:px-12 pb-16 md:pb-24 pt-28 md:pt-32">
        <div className="grid grid-cols-12 gap-4 md:gap-6 items-end">
          {/* Left image */}
          <motion.div
            className="col-span-5 md:col-span-3 relative"
            variants={reveal}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <div className="aspect-[3/4] relative overflow-hidden">
              <Image
                src={images[0]}
                alt="Fashion editorial"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 40vw, 25vw"
                priority
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-full h-full border border-brand-accent/20 -z-10" />
          </motion.div>

          {/* Center heading */}
          <motion.div
            className="col-span-12 md:col-span-5 text-center md:text-left order-first md:order-none mb-10 md:mb-0"
            variants={reveal}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            <div className="overflow-hidden">
              {headingNode}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.7 }}
              className="mt-8 md:mt-12 flex flex-col sm:flex-row items-center md:items-start gap-4"
            >
              <Link
                href="/shop"
                className="inline-flex items-center gap-3 bg-brand-accent text-white uppercase text-[10px] tracking-[0.25em] px-8 py-3.5 hover:bg-brand-accent/90 transition-all duration-300 group"
              >
                {ctaText}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <span className="text-white/30 uppercase text-[10px] tracking-widest">
                {season}
              </span>
            </motion.div>
          </motion.div>

          {/* Right image stack */}
          <div className="col-span-7 md:col-span-4 flex flex-col gap-4">
            <motion.div
              className="aspect-[4/3] relative overflow-hidden"
              variants={reveal}
              initial="hidden"
              animate="visible"
              custom={2}
            >
              <Image
                src={images[1]}
                alt="Fashion editorial"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 55vw, 33vw"
                priority
              />
            </motion.div>
            <motion.div
              className="aspect-[3/4] relative overflow-hidden w-3/4 ml-auto"
              variants={reveal}
              initial="hidden"
              animate="visible"
              custom={3}
            >
              <Image
                src={images[2]}
                alt="Fashion editorial"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 40vw, 25vw"
                priority
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <span className="text-white/25 uppercase text-[8px] tracking-[0.3em]">Scroll</span>
        <motion.div
          className="w-px h-6 bg-white/20"
          animate={{ scaleY: [1, 0.5, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" as const }}
          style={{ transformOrigin: "top" }}
        />
      </motion.div>
    </section>
  );
}
