"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";

/* Placeholder images per-slug — used only when the Sanity category has no image */
const PLACEHOLDER_IMAGES: Record<string, string> = {
  womenswear: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80",
  menswear: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80",
  "raw-fabrics": "https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?w=600&q=80",
};

interface CategoryFromAPI {
  _id: string;
  title: string;
  slug: string;
  image?: string;
  productCount: number;
}

type CategoryItem = { _id: string; title: string; image: string; href: string; live: boolean };

export default function CategoriesSection() {
  const { t } = useLocale();
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/products?categories=true", { cache: "no-store" });
        if (res.ok) {
          const cats: CategoryFromAPI[] = await res.json();
          setItems(
            cats.map((c) => ({
              _id: c._id,
              title: c.title,
              image: c.image || PLACEHOLDER_IMAGES[c.slug] || PLACEHOLDER_IMAGES["womenswear"],
              href: `/shop?category=${c.slug}`,
              live: c.productCount > 0,
            }))
          );
        }
      } catch (err) {
        console.error("[CategoriesSection] failed to fetch categories", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return (
    <section className="bg-white py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <motion.div
          className="text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-[#666] uppercase text-[10px] tracking-[0.3em] mb-3">
            {t("home.categoriesLabel")}
          </p>
          <h2 className="font-serif text-[#1A1A1A] text-4xl sm:text-5xl md:text-6xl leading-[1.05]">
            {t("home.categoriesHeading1")} <span className="italic font-normal">{t("home.categoriesHeading2")}</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-[#F5F0EB] animate-pulse rounded" />
              ))
            : items.map((cat, i) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.12, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {cat.live ? (
                <Link href={cat.href} className="group block relative overflow-hidden">
                  <div className="aspect-[4/5] relative">
                    <Image src={cat.image} alt={cat.title} fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-500" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <h3 className="font-serif text-white text-3xl md:text-4xl tracking-wide">{cat.title}</h3>
                      <div className="mt-5 overflow-hidden">
                        <span className="block text-white uppercase text-[10px] tracking-[0.2em] translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                          {t("common.shopNow")}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="block relative overflow-hidden cursor-default">
                  <div className="aspect-[4/5] relative">
                    <Image src={cat.image} alt={cat.title} fill
                      className="object-cover grayscale opacity-60"
                      sizes="(max-width: 768px) 100vw, 33vw" />
                    {/* Vignette */}
                    <div className="absolute inset-0 bg-black/40" />
                    {/* Top-right badge */}
                    <div className="absolute top-4 right-4">
                      <span className="inline-block border border-white/40 text-white/70 text-[9px] uppercase tracking-[0.25em] px-2.5 py-1">
                        Coming Soon
                      </span>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <h3 className="font-serif text-white/60 text-3xl md:text-4xl tracking-wide">{cat.title}</h3>
                      {/* Animated ellipsis dots */}
                      <div className="flex items-center gap-1.5">
                        {[0, 1, 2].map((dot) => (
                          <motion.span
                            key={dot}
                            className="w-1 h-1 rounded-full bg-white/30 block"
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 1.4, repeat: Infinity, delay: dot * 0.2 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>      </div>
    </section>
  );
}