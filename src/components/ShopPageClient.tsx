"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import PageHero from "@/components/PageHero";
import { useSiteSettings } from "@/components/SiteSettingsProvider";
import { useLocale } from "@/components/LocaleProvider";

interface CategoryRef {
  _id: string;
  title: string;
  slug: string;
  level: number;
}

interface CategoryTreeItem {
  _id: string;
  title: string;
  slug: string;
  level: number;
  parent?: { _id: string; slug: string } | null;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  category: CategoryRef | null;
  subcategory?: CategoryRef | null;
  tags?: CategoryRef[];
  price: number;
  comparePrice?: number;
  inStock?: boolean;
  image: string | null;
  featured?: boolean;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function ShopPageClient() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category") || "All";
  const urlSubcategory = searchParams.get("subcategory") || "All";

  const [categoryTree, setCategoryTree] = useState<CategoryTreeItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(urlCategory);
  const [activeSub, setActiveSub] = useState<string>(urlSubcategory);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);
  const { formatPrice } = useSiteSettings();
  const { t } = useLocale();

  // Fetch the full category tree
  useEffect(() => {
    async function fetchTree() {
      try {
        const res = await fetch("/api/products?categoryTree=true");
        if (res.ok) {
          const tree: CategoryTreeItem[] = await res.json();
          setCategoryTree(tree);
        }
      } catch { /* keep default */ }
    }
    fetchTree();
  }, []);

  // Sync from URL on mount
  useEffect(() => {
    const cat = searchParams.get("category") || "All";
    if (cat !== "All") setActiveCategory(cat);
    const sub = searchParams.get("subcategory") || "All";
    if (sub !== "All") setActiveSub(sub);
  }, [searchParams]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Derive main categories and subcategories from the tree
  const mainCategories = useMemo(
    () => categoryTree.filter((c) => c.level === 1),
    [categoryTree]
  );
  const subCategories = useMemo(() => {
    if (activeCategory === "All") return [];
    const parentCat = categoryTree.find((c) => c.level === 1 && c.slug === activeCategory);
    if (!parentCat) return [];
    return categoryTree.filter((c) => c.level === 2 && c.parent?._id === parentCat._id);
  }, [categoryTree, activeCategory]);

  const filtered = products.filter((p) => {
    const catSlug = p.category?.slug || "";
    const subSlug = p.subcategory?.slug || "";
    const catMatch = activeCategory === "All" || catSlug === activeCategory;
    const subMatch = activeSub === "All" || subSlug === activeSub;
    return catMatch && subMatch;
  });

  const paginatedProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <>
      <PageHero
        title={t("shop.title")}
        subtitle={t("shop.subtitle")}
        description={t("shop.description")}
      />

      <section className="bg-brand-bg py-16 md:py-24">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          {/* Filters */}
          <div className="mb-12 md:mb-16 space-y-6">
            {/* Category filter */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => { setActiveCategory("All"); setActiveSub("All"); }}
                className={`uppercase text-[10px] tracking-[0.2em] px-6 py-2.5 border transition-all ${
                  activeCategory === "All"
                    ? "bg-brand-text text-white border-brand-text"
                    : "bg-transparent text-brand-text border-brand-text/20 hover:border-brand-text/50"
                }`}
              >
                All
              </button>
              {mainCategories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => { setActiveCategory(cat.slug); setActiveSub("All"); }}
                  className={`uppercase text-[10px] tracking-[0.2em] px-6 py-2.5 border transition-all ${
                    activeCategory === cat.slug
                      ? "bg-brand-text text-white border-brand-text"
                      : "bg-transparent text-brand-text border-brand-text/20 hover:border-brand-text/50"
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>

            {/* Subcategory filter */}
            {subCategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveSub("All")}
                  className={`uppercase text-[9px] tracking-[0.15em] px-4 py-2 border transition-all ${
                    activeSub === "All"
                      ? "bg-brand-accent text-white border-brand-accent"
                      : "bg-transparent text-brand-muted border-brand-text/10 hover:border-brand-accent/50"
                  }`}
                >
                  All
                </button>
                {subCategories.map((sub) => (
                  <button
                    key={sub._id}
                    onClick={() => setActiveSub(sub.slug)}
                    className={`uppercase text-[9px] tracking-[0.15em] px-4 py-2 border transition-all ${
                      activeSub === sub.slug
                        ? "bg-brand-accent text-white border-brand-accent"
                        : "bg-transparent text-brand-muted border-brand-text/10 hover:border-brand-accent/50"
                    }`}
                  >
                    {sub.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-brand-light aspect-[3/4] rounded" />
                  <div className="mt-4 space-y-2">
                    <div className="bg-brand-light h-3 w-20 rounded" />
                    <div className="bg-brand-light h-4 w-32 rounded" />
                    <div className="bg-brand-light h-4 w-16 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Product grid */}
          {!loading && (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14"
              initial="hidden"
              animate="visible"
              key={activeCategory + activeSub}
              variants={containerVariants}
            >
              {paginatedProducts.map((item) => {
                const onSale = item.comparePrice && item.comparePrice > item.price;
                const outOfStock = item.inStock === false;
                return (
                  <motion.div key={item._id} variants={cardVariants}>
                    <Link href={`/shop/${item.slug}`} className="group block">
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
                        {outOfStock && (
                          <span className="absolute top-3 left-3 bg-[#232323] text-white uppercase text-[8px] tracking-[0.15em] px-3 py-1.5">
                            {t("common.soldOut")}
                          </span>
                        )}
                        {!outOfStock && onSale && (
                          <span className="absolute top-3 left-3 bg-[#C08A6F] text-white uppercase text-[8px] tracking-[0.15em] px-3 py-1.5">
                            {t("common.sale")}
                          </span>
                        )}
                        {!outOfStock && !onSale && item.featured && (
                          <span className="absolute top-3 left-3 bg-[#232323] text-white uppercase text-[8px] tracking-[0.15em] px-3 py-1.5">
                            {t("common.featured")}
                          </span>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                          <span className="uppercase text-[10px] tracking-[0.15em] text-[#1A1A1A]">
                            {t("common.quickView")}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-brand-muted uppercase text-[9px] tracking-widest">
                          {item.category?.title || "Uncategorized"}
                        </p>
                        <p className="text-brand-text text-sm mt-1">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className={`text-sm font-medium ${onSale ? "text-[#C08A6F]" : "text-brand-text"}`}>
                            {formatPrice(item.price)}
                          </p>
                          {onSale && (
                            <p className="text-[#999] text-sm line-through">
                              {formatPrice(item.comparePrice!)}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Load more button */}
          {!loading && hasMore && (
            <div className="text-center mt-12">
              <button
                onClick={() => setVisibleCount((prev) => prev + 12)}
                className="inline-block uppercase text-[10px] tracking-[0.2em] text-[#1A1A1A] border border-[#1A1A1A]/20 px-10 py-3.5 hover:border-[#C08A6F] hover:text-[#C08A6F] transition-colors"
              >
                {t("shop.loadMore", { n: String(filtered.length - visibleCount) })}
              </button>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-brand-muted text-sm">
                {t("shop.noResults")}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
