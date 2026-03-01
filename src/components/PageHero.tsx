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
      {/* Grain texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

      <div className="mx-auto max-w-[1440px] px-6 md:px-12 pt-32 md:pt-40 pb-16 md:pb-24">
        {subtitle && (
          <motion.p
            className="text-white/40 uppercase text-[10px] tracking-[0.3em] mb-4"
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
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          {title}
          {titleItalic && (
            <>
              {" "}
              <span className="italic font-normal opacity-80">
                {titleItalic}
              </span>
            </>
          )}
        </motion.h1>

        {description && (
          <motion.p
            className="text-white/50 text-sm md:text-base leading-relaxed mt-6 max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {description}
          </motion.p>
        )}

        {/* Decorative line */}
        <motion.div
          className="w-12 h-px mt-10"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{ transformOrigin: "left", backgroundColor: "#C08A6F" }}
        />
      </div>
    </section>
  );
}
