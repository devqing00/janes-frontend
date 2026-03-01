"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";

interface ProductData {
  _id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  details: string[];
  sizes: string[];
  images: { _id: string; url: string }[];
  category: string;
  subcategory?: string;
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToBag, setAddedToBag] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products?slug=${encodeURIComponent(slug)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data._id) {
            setProduct(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  const handleAddToBag = () => {
    if (!product) return;
    addItem({
      _id: product._id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images?.[0]?.url || null,
      size: selectedSize || undefined,
    });
    setAddedToBag(true);
    setTimeout(() => setAddedToBag(false), 2000);
  };

  if (loading) {
    return (
      <div className="bg-[#FAF8F5] pt-24 md:pt-28 pb-20">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 pt-10">
            <div className="md:col-span-7">
              <div className="aspect-[3/4] bg-brand-light animate-pulse rounded" />
            </div>
            <div className="md:col-span-5 space-y-4">
              <div className="bg-brand-light h-4 w-24 animate-pulse rounded" />
              <div className="bg-brand-light h-8 w-64 animate-pulse rounded" />
              <div className="bg-brand-light h-6 w-20 animate-pulse rounded" />
              <div className="bg-brand-light h-20 w-full animate-pulse rounded mt-8" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-[#FAF8F5] pt-24 md:pt-28 pb-20">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 text-center py-32">
          <h1 className="font-serif text-3xl text-brand-text mb-4">Product Not Found</h1>
          <p className="text-brand-muted text-sm mb-8">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/shop" className="inline-block bg-brand-accent text-white uppercase text-[10px] tracking-[0.2em] px-8 py-3 hover:bg-brand-accent/90 transition-all">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.filter(img => img?.url) || [];
  const categoryLabels: Record<string, string> = { womenswear: "Womenswear", menswear: "Menswear", fabrics: "Raw Fabrics" };
  const categoryLabel = categoryLabels[product.category] || product.category;
  const inWishlist = isInWishlist(product._id);

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-[#FAF8F5] pt-24 md:pt-28">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-[#666]">
            <Link href="/shop" className="hover:text-[#C08A6F] transition-colors">
              Shop
            </Link>
            <span>/</span>
            <Link href={`/shop?category=${product.category}`} className="hover:text-[#C08A6F] transition-colors">
              {categoryLabel}
            </Link>
            <span>/</span>
            <span className="text-[#1A1A1A]">{product.name}</span>
          </nav>
        </div>
      </div>

      <section className="bg-[#FAF8F5] py-10 md:py-16">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
            {/* Image gallery */}
            <motion.div
              className="md:col-span-7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Main image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F0EB]">
                {images.length > 0 ? (
                  <Image
                    src={images[activeImage]?.url}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 58vw"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-brand-muted">
                    No Image Available
                  </div>
                )}
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 mt-3">
                  {images.map((img, i) => (
                    <button
                      key={img._id || i}
                      onClick={() => setActiveImage(i)}
                      className={`relative w-20 h-24 overflow-hidden border-2 transition-colors ${
                        activeImage === i ? "border-[#C08A6F]" : "border-transparent"
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={`${product.name} view ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product info */}
            <motion.div
              className="md:col-span-5 md:sticky md:top-28 md:self-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="text-[#666] uppercase text-[10px] tracking-[0.2em] mb-2">
                {categoryLabel}
              </p>
              <h1 className="font-serif text-[#1A1A1A] text-3xl md:text-4xl leading-tight">
                {product.name}
              </h1>
              <p className="text-[#1A1A1A] text-xl mt-4">
                ${product.price}
              </p>

              {product.description && (
                <div className="mt-8 pt-8 border-t border-[#E8E2DB]">
                  <p className="text-[#666] text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Size selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[#1A1A1A] uppercase text-[10px] tracking-[0.15em] font-medium">
                      Size
                    </p>
                    <button className="text-[#C08A6F] text-[10px] uppercase tracking-[0.15em] hover:underline">
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-5 py-2.5 border text-[11px] tracking-[0.1em] uppercase transition-all ${
                          selectedSize === size
                            ? "bg-[#232323] text-white border-[#232323]"
                            : "bg-transparent text-[#1A1A1A] border-[#E8E2DB] hover:border-[#1A1A1A]"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to cart + wishlist */}
              <div className="flex items-center gap-3 mt-8">
                <button
                  onClick={handleAddToBag}
                  className="flex-1 bg-[#C08A6F] text-white uppercase text-[11px] tracking-[0.2em] py-4 hover:bg-[#a8755c] transition-colors duration-300"
                >
                  {addedToBag ? "Added!" : "Add to Bag"}
                </button>
                <button
                  onClick={() => toggleItem({ _id: product._id, name: product.name, slug: product.slug, price: product.price, image: images[0]?.url || null })}
                  className={`w-14 h-14 flex items-center justify-center border transition-colors ${
                    inWishlist ? "bg-[#C08A6F] border-[#C08A6F] text-white" : "border-[#E8E2DB] text-[#666] hover:border-[#C08A6F] hover:text-[#C08A6F]"
                  }`}
                  aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={inWishlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                </button>
              </div>

              {/* Details */}
              {product.details && product.details.length > 0 && (
                <div className="mt-10 pt-8 border-t border-[#E8E2DB]">
                  <p className="text-[#1A1A1A] uppercase text-[10px] tracking-[0.15em] font-medium mb-4">
                    Details
                  </p>
                  <ul className="space-y-2">
                    {product.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-3 text-[#666] text-sm">
                        <span className="text-[#C08A6F] mt-0.5">—</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
