"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

/* ── Fallback ── */
const FALLBACK_CATEGORIES = [
  {
    title: "Womenswear",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80",
    href: "/shop?category=Womenswear",
  },
  {
    title: "Menswear",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    href: "/shop?category=Menswear",
  },
  {
    title: "Raw Fabrics",
    image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&q=80",
    href: "/shop?category=Fabrics",
  },
];

export interface CategoryCardData {
  title: string;
  image: string;
  href: string;
}

export interface CategoriesSectionProps {
  categories?: CategoryCardData[];
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  const items = categories && categories.length > 0 ? categories : FALLBACK_CATEGORIES;
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
            Browse by Category
          </p>
          <h2 className="font-serif text-[#1A1A1A] text-4xl sm:text-5xl md:text-6xl leading-[1.05]">
            Shop the <span className="italic font-normal">Edit</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {items.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.12, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Link href={cat.href} className="group block relative overflow-hidden">
                <div className="aspect-[4/5] relative">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-500" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <h3 className="font-serif text-white text-3xl md:text-4xl tracking-wide">
                      {cat.title}
                    </h3>
                    <div className="mt-5 overflow-hidden">
                      <span className="block text-white uppercase text-[10px] tracking-[0.2em] translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                        Shop Now →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
