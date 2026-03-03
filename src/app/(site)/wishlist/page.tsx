"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import PageHero from "@/components/PageHero";
import { useWishlist } from "@/components/WishlistProvider";
import { useCart } from "@/components/CartProvider";
import { useSiteSettings } from "@/components/SiteSettingsProvider";
import { useLocale } from "@/components/LocaleProvider";

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();
  const { formatPrice } = useSiteSettings();
  const { t } = useLocale();

  const handleAddToBag = (item: typeof items[0]) => {
    addItem({
      _id: item._id,
      name: item.name,
      slug: item.slug,
      price: item.price,
      image: item.image,
    });
  };

  return (
    <>
      <PageHero
        title={t("wishlist.title")}
        subtitle={t("wishlist.subtitle")}
        description={t("wishlist.description")}
      />

      <section className="bg-brand-bg py-16 md:py-24">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-brand-border mx-auto mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
              <p className="text-brand-muted text-sm mb-4">{t("wishlist.emptyMessage")}</p>
              <Link
                href="/shop"
                className="inline-block bg-brand-accent text-white uppercase text-[10px] tracking-[0.2em] px-8 py-3 hover:bg-brand-accent/90 transition-all"
              >
                {t("wishlist.exploreCta")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
              {items.map((item, i) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                >
                  <div className="group relative">
                    <Link href={`/shop/${item.slug}`} className="block">
                      <div className="relative overflow-hidden bg-brand-light aspect-[3/4]">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            sizes="(max-width: 768px) 45vw, (max-width: 1024px) 30vw, 22vw"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-brand-muted text-xs">
                            {t("common.noImage")}
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Remove button */}
                    <button
                      onClick={() => removeItem(item._id)}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#C08A6F] hover:bg-[#C08A6F] hover:text-white transition-all"
                      aria-label={t("wishlist.removeAriaLabel")}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                      </svg>
                    </button>

                    <div className="mt-4">
                      <Link href={`/shop/${item.slug}`}>
                        <p className="text-brand-text text-sm hover:text-[#C08A6F] transition-colors">{item.name}</p>
                      </Link>
                      <p className="text-brand-text font-medium text-sm mt-1">{formatPrice(item.price)}</p>
                      <button
                        onClick={() => handleAddToBag(item)}
                        className="mt-3 w-full bg-[#232323] text-white uppercase text-[9px] tracking-[0.15em] py-2.5 hover:bg-[#C08A6F] transition-colors"
                      >
                        {t("common.addToBag")}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
