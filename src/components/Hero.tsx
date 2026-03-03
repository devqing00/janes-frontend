"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";

const reveal = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2 + 0.15 * i,
      duration: 0.9,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
};

/* ── Fallback images ── */
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=600&q=80",
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80",
  "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80",
];

export interface HeroProps {
  tagline?: string;
  heroImages?: string[];
  heroSeasonLabel?: string;
  heroCTAText?: string;
}

export default function Hero({
  heroImages,
  heroSeasonLabel,
  heroCTAText,
}: HeroProps) {
  const { t } = useLocale();
  const images =
    heroImages && heroImages.length >= 3 ? heroImages : FALLBACK_IMAGES;
  const season = heroSeasonLabel || t("hero.season");
  const ctaText = heroCTAText || t("hero.exploreCollection");

  /* Parse tagline into styled heading lines.
     Default: "Luxurious and Contemporary Fashion for Every One" */
  const headingNode = (
    <h1 className="font-serif text-white text-[2.75rem] sm:text-5xl md:text-[3.5rem] lg:text-[4.25rem] xl:text-[5.5rem] leading-[1.05] tracking-tight">
      {t("hero.luxurious")}{" "}
      <span className="italic font-normal opacity-80">{t("hero.and")}</span>
      <br />
      {t("hero.classy")}
      <br />
      {t("hero.fashion")}
      <br />
      <span className="italic font-normal opacity-80">
        {t("hero.for")}
      </span>{" "}
      {t("hero.every")}
      <br />
      {t("hero.one")}
    </h1>
  );
  return (
    <section className="relative bg-[#232323] min-h-screen flex items-end overflow-x-hidden">
      {/* Ambient radial glow — warm accent behind heading area */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 60% at 38% 65%, rgba(192,138,111,0.13) 0%, transparent 70%)",
        }}
      />

      {/* Square grid overlay — z-[1] so it sits above the glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          backgroundImage: [
            "repeating-linear-gradient(0deg,  transparent, transparent 79px, rgba(255,255,255,0.07) 79px, rgba(255,255,255,0.07) 80px)",
            "repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(255,255,255,0.07) 79px, rgba(255,255,255,0.07) 80px)",
          ].join(","),
        }}
      />

      {/* Film-grain noise overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.045] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
        }}
      />

      {/* Decorative corner marks — bottom only */}
      <div aria-hidden="true" className="absolute bottom-20 left-8 w-8 h-8 border-b border-l border-brand-accent/35 z-[2]" />
      <div aria-hidden="true" className="absolute bottom-20 right-8 w-8 h-8 border-b border-r border-brand-accent/35 z-[2]" />

      {/* Animated vertical accent line */}
      <motion.div
        aria-hidden="true"
        className="absolute right-12 top-0 w-px bg-linear-to-b from-transparent via-brand-accent/30 to-transparent z-[2] hidden lg:block"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "100%", opacity: 1 }}
        transition={{ delay: 1.2, duration: 1.5, ease: "easeOut" }}
      />

      {/* Animated horizontal accent line */}
      <motion.div
        aria-hidden="true"
        className="absolute left-0 top-[28%] h-px bg-linear-to-r from-transparent via-brand-accent/20 to-transparent z-[2] hidden lg:block"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "45%", opacity: 1 }}
        transition={{ delay: 1.4, duration: 1.4, ease: "easeOut" }}
      />

      <div className="relative z-[3] mx-auto max-w-[1440px] w-full px-6 md:px-12 pb-16 md:pb-24 pt-28 md:pt-32">
        <div className="grid grid-cols-12 gap-4 md:gap-6 items-end">
          {/* Left image */}
          <motion.div
            className="col-span-5 md:col-span-3 lg:col-span-3 relative"
            variants={reveal}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <div className="aspect-[3/4] relative overflow-hidden">
              <Image
                src={images[0]}
                alt={t("hero.imageAlt")}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 40vw, 25vw"
                priority
              />
              {/* Editorial number */}
              <div className="absolute bottom-3 left-3 text-white/30 font-serif text-xs tracking-[0.2em] select-none">
                01
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-full h-full border border-brand-accent/20 -z-10" />
          </motion.div>

          {/* Center heading */}
          <motion.div
            className="col-span-12 md:col-span-6 lg:col-span-6 xl:col-span-5 text-center md:text-left order-first md:order-none mb-10 md:mb-0"
            variants={reveal}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            <div>{headingNode}</div>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
              <span className="text-white/30 uppercase text-[10px] tracking-widest">
                {season}
              </span>
            </motion.div>
          </motion.div>

          {/* Right image stack */}
          <div className="col-span-7 md:col-span-3 lg:col-span-3 xl:col-span-4 flex flex-col gap-4">
            <motion.div
              className="aspect-[4/3] relative overflow-hidden"
              variants={reveal}
              initial="hidden"
              animate="visible"
              custom={2}
            >
              <Image
                src={images[1]}
                alt={t("hero.imageAlt")}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 55vw, 33vw"
                priority
              />
              {/* Editorial number */}
              <div className="absolute bottom-3 right-3 text-white/30 font-serif text-xs tracking-[0.2em] select-none">
                02
              </div>
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
                alt={t("hero.imageAlt")}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 40vw, 25vw"
                priority
              />
              {/* Editorial number */}
              <div className="absolute bottom-3 right-3 text-white/30 font-serif text-xs tracking-[0.2em] select-none">
                03
              </div>
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
        <span className="text-white/25 uppercase text-[8px] tracking-[0.3em]">
          {t("hero.scroll")}
        </span>
        <motion.div
          className="w-px h-6 bg-white/20"
          animate={{ scaleY: [1, 0.5, 1] }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut" as const,
          }}
          style={{ transformOrigin: "top" }}
        />
      </motion.div>
    </section>
  );
}
