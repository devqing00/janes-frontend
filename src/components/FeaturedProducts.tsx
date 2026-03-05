"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSiteSettings } from "./SiteSettingsProvider";
import { useWishlist } from "./WishlistProvider";
import { useLocale } from "@/components/LocaleProvider";

interface FeaturedProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  priceType?: "single" | "range";
  priceMax?: number;
  image: string | null;
  featured?: boolean;
  category?: string;
  _createdAt?: string;
  isFabricVariant?: boolean;
  tags?: Array<{
    fabricPrice?: number;
    fabricPricePerN?: number;
    fabricUnit?: string;
  }>;
}

const NEW_THRESHOLD_DAYS = 30;

function isNew(createdAt?: string): boolean {
  if (!createdAt) return false;
  const diff = Date.now() - new Date(createdAt).getTime();
  return diff < NEW_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
}

function getEffectivePrice(p: FeaturedProduct): number {
  if (p.isFabricVariant && p.tags?.[0]?.fabricPrice) {
    const perN = p.tags[0].fabricPricePerN && p.tags[0].fabricPricePerN > 0 ? p.tags[0].fabricPricePerN : 1;
    return p.tags[0].fabricPrice / perN;
  }
  return p.price;
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useSiteSettings();
  const { toggleItem, isInWishlist } = useWishlist();
  const { t } = useLocale();

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch("/api/products?featured=true");
        if (res.ok) {
          const data = await res.json();
          setProducts(Array.isArray(data) ? data.slice(0, 5) : []);
        }
      } catch (err) {
        console.error("Failed to fetch featured products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  if (!loading && products.length === 0) return null;

  /* ── Bento skeleton ── */
  const BentoSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-3 md:gap-4 auto-rows-[280px] md:auto-rows-[320px]">
      <div className="col-span-2 row-span-2 bg-[#F5F0EB] animate-pulse rounded-sm" />
      <div className="bg-[#F5F0EB] animate-pulse rounded-sm" />
      <div className="bg-[#F5F0EB] animate-pulse rounded-sm" />
      <div className="bg-[#F5F0EB] animate-pulse rounded-sm" />
      <div className="bg-[#F5F0EB] animate-pulse rounded-sm" />
    </div>
  );

  /* ── Bento card ── */
  const BentoCard = ({
    item,
    index,
    isHero,
  }: {
    item: FeaturedProduct;
    index: number;
    isHero: boolean;
  }) => {
    const effectivePrice = getEffectivePrice(item);
    const inWishlist = isInWishlist(item._id);
    const isFabric = item.isFabricVariant;
    const fabricUnit = item.tags?.[0]?.fabricUnit;

    return (
      <motion.div
        className={`relative group ${isHero ? "col-span-2 row-span-2" : ""}`}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{
          delay: index * 0.08,
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        <Link href={isFabric ? `/shop/fabric-group/${item.tags?.[0] && "slug" in item.tags[0] ? (item.tags[0] as Record<string, string>).slug : item.slug}` : `/shop/${item.slug}`} className="block h-full">
          <div className="relative overflow-hidden h-full bg-[#F5F0EB]">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes={isHero ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[#666] text-xs">
                {t("common.noImage")}
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Always-visible bottom gradient on hero */}
            {isHero && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              {isNew(item._createdAt) && (
                <span className="bg-[#C08A6F] text-white uppercase text-[8px] tracking-[0.15em] px-2.5 py-1">
                  {t("common.new")}
                </span>
              )}
              {isFabric && (
                <span className="bg-white/90 backdrop-blur-sm text-[#1A1A1A] uppercase text-[8px] tracking-[0.15em] px-2.5 py-1">
                  Fabric
                </span>
              )}
            </div>

            {/* Wishlist */}
            <button
              aria-label={inWishlist ? t("home.removeFromWishlist") : t("home.addToWishlist")}
              onClick={(e) => {
                e.preventDefault();
                toggleItem({
                  _id: item._id,
                  name: item.name,
                  slug: item.slug,
                  price: effectivePrice,
                  image: item.image,
                });
              }}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={`w-4 h-4 transition-colors ${
                  inWishlist ? "fill-[#C08A6F] stroke-[#C08A6F]" : "fill-none stroke-[#1A1A1A]"
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
            </button>

            {/* Product info — bottom overlay */}
            <div
              className={`absolute bottom-0 left-0 right-0 p-4 ${
                isHero ? "md:p-6" : "md:p-4"
              } z-10 ${
                isHero
                  ? ""
                  : "translate-y-full group-hover:translate-y-0 transition-transform duration-500"
              }`}
            >
              <h3 className={`text-white font-medium truncate ${isHero ? "text-lg md:text-xl" : "text-sm"}`}>
                {item.name}
              </h3>
              <p className={`text-white/80 mt-1 ${isHero ? "text-sm" : "text-xs"}`}>
                {formatPrice(effectivePrice)}
                {isFabric && fabricUnit ? ` / ${fabricUnit}` : ""}
              </p>
            </div>

            {/* Quick view band (non-hero) */}
            {!isHero && (
              <div className="absolute inset-x-0 bottom-0 h-10 bg-white/95 backdrop-blur-sm flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-500 delay-75">
                <span className="uppercase text-[10px] tracking-[0.15em] text-[#1A1A1A]">
                  {t("common.quickView")}
                </span>
              </div>
            )}
          </div>
        </Link>
      </motion.div>
    );
  };

  return (
    <section className="bg-white py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <div>
            <p className="text-[#666] uppercase text-[10px] tracking-[0.3em] mb-3">
              {t("home.featuredLabel")}
            </p>
            <h2 className="font-serif text-[#1A1A1A] text-4xl sm:text-5xl md:text-6xl leading-[1.05]">
              {t("home.featuredHeading1")}{" "}
              <span className="italic font-normal">{t("home.featuredHeading2")}</span>
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-[#1A1A1A] uppercase text-[10px] tracking-[0.2em] border-b border-[#1A1A1A]/30 pb-1 hover:border-[#C08A6F] hover:text-[#C08A6F] transition-colors group inline-flex items-center gap-2"
          >
            {t("home.shopAll")}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-3 h-3 group-hover:translate-x-1 transition-transform"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </motion.div>

        {loading ? (
          <BentoSkeleton />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-3 md:gap-4 auto-rows-[280px] md:auto-rows-[320px]">
            {products.map((item, i) => (
              <BentoCard key={item._id} item={item} index={i} isHero={i === 0} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
