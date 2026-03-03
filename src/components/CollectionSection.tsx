"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useLocale } from "@/components/LocaleProvider";

/* ── Fallback data ── */
const FALLBACK_COLLECTIONS = [
  {
    title: "Spring / Summer",
    year: "2026",
    image: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&q=80",
    slug: "ss-2026",
  },
  {
    title: "Autumn / Winter",
    year: "2025",
    image: "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=800&q=80",
    slug: "aw-2025",
  },
  {
    title: "Resort",
    year: "2025",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80",
    slug: "resort-2025",
  },
];

export interface CollectionItem {
  title: string;
  year?: string;
  image: string;
  slug: string;
}

export interface CollectionSectionProps {
  collections?: CollectionItem[];
}

export default function CollectionSection({ collections }: CollectionSectionProps) {
  const { t } = useLocale();
  const items = collections && collections.length > 0 ? collections.slice(0, 3) : FALLBACK_COLLECTIONS;
  return (
    <section className="bg-[#FAF8F5] py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 md:mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <div>
            <p className="text-[#666] uppercase text-[10px] tracking-[0.3em] mb-3">
              {t("home.collectionLabel")}
            </p>
            <h2 className="font-serif text-[#1A1A1A] text-4xl sm:text-5xl md:text-6xl leading-[1.05]">
              {t("home.collectionHeading1")} <span className="italic font-normal">{t("home.collectionHeading2")}</span>
            </h2>
          </div>
          <Link
            href="/collections"
            className="text-[#1A1A1A] uppercase text-[10px] tracking-[0.2em] border-b border-[#1A1A1A]/30 pb-1 hover:border-[#C08A6F] hover:text-[#C08A6F] transition-colors group inline-flex items-center gap-2"
          >
            {t("common.viewAll")}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 group-hover:translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {items.map((col, i) => (
            <CollectionCard key={col.slug} collection={col} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CollectionCard({ collection, index }: { collection: CollectionItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useLocale();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: index * 0.15, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link href={`/collections/${collection.slug}`} className="group block">
        <div className="relative overflow-hidden aspect-[3/4]">
          <motion.div className="absolute inset-0" style={{ y }}>
            <Image
              src={collection.image}
              alt={collection.title}
              fill
              className="object-cover scale-110 group-hover:scale-[1.15] transition-transform duration-[1.2s]"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </motion.div>
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <p className="text-white/50 uppercase text-[10px] tracking-[0.2em] mb-2">{collection.year || ""}</p>
            <h3 className="font-serif text-white text-2xl md:text-3xl leading-tight">{collection.title}</h3>
            <div className="mt-4 flex items-center gap-2 text-white/60 group-hover:text-white transition-colors">
              <span className="uppercase text-[10px] tracking-[0.15em]">{t("common.explore")}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
