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
  { src: "https://images.pexels.com/photos/1625775/pexels-photo-1625775.jpeg?auto=compress&cs=tinysrgb&w=800&q=80", alt: "Look 1 — Ankara drape set" },
  { src: "https://images.pexels.com/photos/7521131/pexels-photo-7521131.jpeg?auto=compress&cs=tinysrgb&w=800&q=80", alt: "Look 2 — Aso-Oke ensemble" },
  { src: "https://images.pexels.com/photos/35069196/pexels-photo-35069196.jpeg?auto=compress&cs=tinysrgb&w=800&q=80", alt: "Look 3 — Agbada flow" },
  { src: "https://images.pexels.com/photos/34249459/pexels-photo-34249459.jpeg?auto=compress&cs=tinysrgb&w=800&q=80", alt: "Look 4 — Adire fabric" },
  { src: "https://images.pexels.com/photos/28988328/pexels-photo-28988328.jpeg?auto=compress&cs=tinysrgb&w=800&q=80", alt: "Look 5 — Lagos street style" },
  { src: "https://images.pexels.com/photos/29168547/pexels-photo-29168547.jpeg?auto=compress&cs=tinysrgb&w=800&q=80", alt: "Look 6 — Bold wax print" },
  { src: "https://images.pexels.com/photos/29168553/pexels-photo-29168553.jpeg?auto=compress&cs=tinysrgb&w=800&q=80", alt: "Look 7 — Gele editorial" },
  { src: "https://images.pexels.com/photos/28988329/pexels-photo-28988329.jpeg?auto=compress&cs=tinysrgb&w=800&q=80", alt: "Look 8 — Movement" },
  { src: "https://images.pexels.com/photos/34249446/pexels-photo-34249446.jpeg?auto=compress&cs=tinysrgb&w=800&q=80", alt: "Look 9 — Kaftan styling" },
  { src: "https://images.pexels.com/photos/29324632/pexels-photo-29324632.jpeg?auto=compress&cs=tinysrgb&w=800&q=80", alt: "Look 10 — Textile details" },
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
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
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
