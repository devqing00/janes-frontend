"use client";

import { motion } from "framer-motion";

interface PageHeroProps {
  title: string;
  titleItalic?: string;
  subtitle?: string;
  description?: string;
}

export default function PageHero({
  title,
  titleItalic,
  subtitle,
  description,
}: PageHeroProps) {
  return (
    <section className="relative bg-[#232323] overflow-hidden">
      {/* Ambient radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 20% 110%, rgba(192,138,111,0.12) 0%, transparent 65%)",
        }}
      />

      {/* Square grid overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            "repeating-linear-gradient(0deg,  transparent, transparent 79px, rgba(255,255,255,0.07) 79px, rgba(255,255,255,0.07) 80px)",
            "repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(255,255,255,0.07) 79px, rgba(255,255,255,0.07) 80px)",
          ].join(","),
        }}
      />

      {/* Film-grain noise */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
        }}
      />

      {/* Corner marks — bottom only */}
      <div aria-hidden="true" className="absolute bottom-6 left-8 w-6 h-6 border-b border-l border-brand-accent/30" />
      <div aria-hidden="true" className="absolute bottom-6 right-8 w-6 h-6 border-b border-r border-brand-accent/30" />

      {/* Animated vertical accent line */}
      <motion.div
        aria-hidden="true"
        className="absolute right-12 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-brand-accent/20 to-transparent hidden lg:block"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
        style={{ transformOrigin: "top" }}
      />

      {/* Animated horizontal accent line */}
      <motion.div
        aria-hidden="true"
        className="absolute left-0 bottom-0 h-px bg-gradient-to-r from-brand-accent/30 via-brand-accent/10 to-transparent"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "60%", opacity: 1 }}
        transition={{ delay: 0.5, duration: 1.0, ease: "easeOut" }}
      />

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-12 pt-36 md:pt-44 pb-16 md:pb-24">
        {subtitle && (
          <motion.p
            className="text-white/40 uppercase text-[10px] tracking-[0.3em] mb-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {subtitle}
          </motion.p>
        )}

        <motion.h1
          className="font-serif text-white text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          {title}
          {titleItalic && (
            <>
              {" "}
              <span className="italic font-normal opacity-75">
                {titleItalic}
              </span>
            </>
          )}
        </motion.h1>

        {description && (
          <motion.p
            className="text-white/45 text-sm md:text-base leading-relaxed mt-6 max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {description}
          </motion.p>
        )}

        {/* Decorative accent line */}
        <motion.div
          className="mt-10 h-px bg-gradient-to-r from-brand-accent/60 to-transparent"
          initial={{ width: 0 }}
          animate={{ width: "3rem" }}
          transition={{ duration: 0.7, delay: 0.55, ease: "easeOut" }}
        />
      </div>
    </section>
  );
}
