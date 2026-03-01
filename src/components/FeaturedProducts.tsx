"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSiteSettings } from "./SiteSettingsProvider";

interface FeaturedProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  featured?: boolean;
  category?: string;
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useSiteSettings();

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch("/api/products?featured=true");
        if (res.ok) {
          const data = await res.json();
          setProducts(Array.isArray(data) ? data.slice(0, 4) : []);
        }
      } catch (err) {
        console.error("Failed to fetch featured products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  // Don't render the section if no featured products
  if (!loading && products.length === 0) return null;

  return (
    <section className="bg-white py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <div>
            <p className="text-[#666] uppercase text-[10px] tracking-[0.3em] mb-3">
              Featured Pieces
            </p>
            <h2 className="font-serif text-[#1A1A1A] text-4xl sm:text-5xl md:text-6xl leading-[1.05]">
              New <span className="italic font-normal">Arrivals</span>
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-[#1A1A1A] uppercase text-[10px] tracking-[0.2em] border-b border-[#1A1A1A]/30 pb-1 hover:border-[#C08A6F] hover:text-[#C08A6F] transition-colors group inline-flex items-center gap-2"
          >
            Shop All
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 group-hover:translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-[#F5F0EB] aspect-[3/4] rounded" />
                <div className="mt-4 space-y-2">
                  <div className="bg-[#F5F0EB] h-4 w-32 rounded" />
                  <div className="bg-[#F5F0EB] h-4 w-16 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
            {products.map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.1, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const }}
              >
                <Link href={`/shop/${item.slug}`} className="group block">
                  <div className="relative overflow-hidden aspect-[3/4] bg-[#F5F0EB]">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 768px) 45vw, 22vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[#666] text-xs">
                        No Image
                      </div>
                    )}
                    {item.featured && (
                      <span className="absolute top-3 left-3 bg-[#232323] text-white uppercase text-[8px] tracking-[0.15em] px-3 py-1.5">
                        Featured
                      </span>
                    )}
                    {/* Quick add overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                      <span className="uppercase text-[10px] tracking-[0.15em] text-[#1A1A1A]">
                        Quick View
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-[#1A1A1A] text-sm font-medium">{item.name}</h3>
                    <p className="text-[#666] text-sm mt-1">{formatPrice(item.price)}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
