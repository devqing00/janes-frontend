"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import { useLocale } from "@/components/LocaleProvider";

/* Grid layout patterns that cycle for any number of images */
const GRID_PATTERNS = [
  { span: "col-span-6 md:col-span-4 row-span-2", aspect: "aspect-[3/5]" },
  { span: "col-span-6 md:col-span-4", aspect: "aspect-[3/4]" },
  { span: "col-span-6 md:col-span-4", aspect: "aspect-[3/4]" },
  { span: "col-span-6 md:col-span-4", aspect: "aspect-[4/5]" },
  { span: "col-span-6 md:col-span-8", aspect: "aspect-[16/9] md:aspect-[2/1]" },
  { span: "col-span-6 md:col-span-4 row-span-2", aspect: "aspect-[3/5]" },
  { span: "col-span-6 md:col-span-4", aspect: "aspect-[3/4]" },
  { span: "col-span-6 md:col-span-4", aspect: "aspect-[3/4]" },
  { span: "col-span-12 md:col-span-8", aspect: "aspect-[16/9] md:aspect-[2/1]" },
  { span: "col-span-6 md:col-span-4", aspect: "aspect-[3/4]" },
];

/* Placeholder lookbook images — used when Sanity has no data */
const FALLBACK_IMAGES = [
  { src: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&q=80", alt: "Look 1 — Linen drape set" },
  { src: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80", alt: "Look 2 — Tailored blazer" },
  { src: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80", alt: "Look 3 — Flowing dress" },
  { src: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800&q=80", alt: "Look 4 — Cashmere knit" },
  { src: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80", alt: "Look 5 — Street style" },
  { src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80", alt: "Look 6 — Bold colour" },
  { src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80", alt: "Look 7 — Editorial pose" },
  { src: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&q=80", alt: "Look 8 — Movement" },
  { src: "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=800&q=80", alt: "Look 9 — Outerwear" },
  { src: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80", alt: "Look 10 — Details" },
];

export interface LookbookImageData {
  src: string;
  alt: string;
}

export interface LookbookPageClientProps {
  title?: string;
  titleItalic?: string;
  description?: string;
  images?: LookbookImageData[];
}

export default function LookbookPageClient({
  title,
  titleItalic,
  description,
  images,
}: LookbookPageClientProps) {
  const { t } = useLocale();
  const lookbookImages = images && images.length > 0 ? images : FALLBACK_IMAGES;
  const pageTitle = title || t("lookbook.title");
  const pageItalic = titleItalic || t("lookbook.titleItalic");
  const pageDesc = description || t("lookbook.description");
  return (
    <>
      <PageHero
        title={pageTitle}
        titleItalic={pageItalic}
        subtitle={t("lookbook.subtitle")}
        description={pageDesc}
      />

      <section className="bg-brand-bg py-16 md:py-24">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          <div className="grid grid-cols-12 gap-3 md:gap-4">
            {lookbookImages.map((img, i) => {
              const pattern = GRID_PATTERNS[i % GRID_PATTERNS.length];
              return (
                <motion.div
                  key={i}
                  className={`relative overflow-hidden ${pattern.span}`}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-80px" }}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        delay: (i % 3) * 0.1,
                        duration: 0.7,
                        ease: "easeOut" as const,
                      },
                    },
                  }}
                >
                  <div className={`relative w-full h-full ${pattern.aspect}`}>
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover hover:scale-[1.03] transition-transform duration-700"
                      sizes="(max-width: 768px) 45vw, 33vw"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-xs uppercase tracking-widest">
                      {img.alt}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
