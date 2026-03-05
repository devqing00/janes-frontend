"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";
import { useSiteSettings } from "@/components/SiteSettingsProvider";

interface ProductImage {
  _id: string;
  url: string;
}

interface ProductData {
  _id: string;
  name: string;
  slug: string;
  price: number;
  priceType?: "single" | "range";
  priceMax?: number;
  comparePrice?: number;
  inStock?: boolean;
  description: string;
  details: string[];
  sizes: string[];
  images: ProductImage[];
  category: string;
  subcategory?: string;
}

interface RelatedProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  priceType?: "single" | "range";
  priceMax?: number;
  comparePrice?: number;
  inStock?: boolean;
  image: string | null;
}

export default function ProductDetailClient({
  product,
  relatedProducts,
}: {
  product: ProductData;
  relatedProducts: RelatedProduct[];
}) {
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const { formatPrice } = useSiteSettings();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToBag, setAddedToBag] = useState(false);
  const [customPrice, setCustomPrice] = useState<string>("");

  const isOutOfStock = product.inStock === false;
  const isRange = product.priceType === "range" && !!product.priceMax;
  const effectivePrice = isRange ? (Number(customPrice) || product.price) : product.price;
  const rangeValid = !isRange || (Number(customPrice) >= product.price && Number(customPrice) <= (product.priceMax ?? product.price));

  const handleAddToBag = () => {
    if (!product || isOutOfStock) return;
    if (isRange && !rangeValid) return;
    addItem({
      _id: product._id,
      name: product.name,
      slug: product.slug,
      price: effectivePrice,
      image: product.images?.[0]?.url || null,
      size: selectedSize || undefined,
    });
    setAddedToBag(true);
    setTimeout(() => setAddedToBag(false), 2000);
  };

  const images = product.images?.filter((img) => img?.url) || [];
  const categoryLabels: Record<string, string> = {
    womenswear: "Womenswear",
    menswear: "Menswear",
    fabrics: "Raw Fabrics",
  };
  const categoryLabel = categoryLabels[product.category] || product.category;
  const inWishlist = isInWishlist(product._id);
  const onSale = product.comparePrice && product.comparePrice > product.price;

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-[#FAF8F5] pt-24 md:pt-28">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-[#666]">
            <Link href="/shop" className="hover:text-[#C08A6F] transition-colors">Shop</Link>
            <span>/</span>
            <Link href={`/shop?category=${product.category}`} className="hover:text-[#C08A6F] transition-colors">{categoryLabel}</Link>
            <span>/</span>
            <span className="text-[#1A1A1A]">{product.name}</span>
          </nav>
        </div>
      </div>

      <section className="bg-[#FAF8F5] py-10 md:py-16">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
            {/* Image gallery */}
            <motion.div className="md:col-span-7" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
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
                  <div className="absolute inset-0 flex items-center justify-center text-brand-muted">No Image Available</div>
                )}
                {isOutOfStock && (
                  <div className="absolute top-4 left-4 bg-[#232323] text-white uppercase text-[9px] tracking-[0.15em] px-4 py-2">
                    Sold Out
                  </div>
                )}
                {onSale && !isOutOfStock && (
                  <div className="absolute top-4 left-4 bg-[#C08A6F] text-white uppercase text-[9px] tracking-[0.15em] px-4 py-2">
                    Sale
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 mt-3">
                  {images.map((img, i) => (
                    <button
                      key={img._id || i}
                      onClick={() => setActiveImage(i)}
                      className={`relative w-20 h-24 overflow-hidden border-2 transition-colors ${activeImage === i ? "border-[#C08A6F]" : "border-transparent"}`}
                    >
                      <Image src={img.url} alt={`${product.name} view ${i + 1}`} fill className="object-cover" sizes="80px" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product info */}
            <motion.div className="md:col-span-5 md:sticky md:top-28 md:self-start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <p className="text-[#666] uppercase text-[10px] tracking-[0.2em] mb-2">{categoryLabel}</p>
              <h1 className="font-serif text-[#1A1A1A] text-3xl md:text-4xl leading-tight">{product.name}</h1>

              {/* Price with compare-at price support */}
              <div className="flex items-center gap-3 mt-4">
                {isRange ? (
                  <p className="text-xl text-[#1A1A1A]">
                    {formatPrice(product.price)} &ndash; {formatPrice(product.priceMax!)}
                  </p>
                ) : (
                  <>
                    <p className={`text-xl ${onSale ? "text-[#C08A6F]" : "text-[#1A1A1A]"}`}>
                      {formatPrice(product.price)}
                    </p>
                    {onSale && (
                      <p className="text-[#999] text-base line-through">
                        {formatPrice(product.comparePrice!)}
                      </p>
                    )}
                  </>
                )}
              </div>

              {isOutOfStock && (
                <p className="mt-3 text-[#999] text-sm uppercase tracking-[0.1em]">Currently out of stock</p>
              )}

              {product.description && (
                <div className="mt-8 pt-8 border-t border-[#E8E2DB]">
                  <p className="text-[#666] text-sm leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Custom price input for range products */}
              {isRange && (
                <div className="mt-8">
                  <p className="text-[#1A1A1A] uppercase text-[10px] tracking-[0.15em] font-medium mb-3">Your Price</p>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999] text-sm">₦</span>
                      <input
                        type="number"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        min={product.price}
                        max={product.priceMax}
                        step="1"
                        placeholder={`${product.price} – ${product.priceMax}`}
                        className="w-full border border-[#E8E2DB] pl-7 pr-4 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C08A6F] bg-white transition-colors"
                      />
                    </div>
                  </div>
                  {customPrice && !rangeValid && (
                    <p className="text-red-500 text-[11px] mt-1.5">
                      Please enter a price between {formatPrice(product.price)} and {formatPrice(product.priceMax!)}
                    </p>
                  )}
                </div>
              )}

              {/* Size selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[#1A1A1A] uppercase text-[10px] tracking-[0.15em] font-medium">Size</p>
                    <button className="text-[#C08A6F] text-[10px] uppercase tracking-[0.15em] hover:underline">Size Guide</button>
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
                  disabled={isOutOfStock || (isRange && !rangeValid)}
                  className={`flex-1 uppercase text-[11px] tracking-[0.2em] py-4 transition-colors duration-300 ${
                    isOutOfStock || (isRange && !rangeValid)
                      ? "bg-[#E8E2DB] text-[#999] cursor-not-allowed"
                      : "bg-[#C08A6F] text-white hover:bg-[#a8755c]"
                  }`}
                >
                  {isOutOfStock ? "Sold Out" : addedToBag ? "Added!" : "Add to Bag"}
                </button>
                <button
                  onClick={() =>
                    toggleItem({
                      _id: product._id,
                      name: product.name,
                      slug: product.slug,
                      price: product.price,
                      image: images[0]?.url || null,
                    })
                  }
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
                  <p className="text-[#1A1A1A] uppercase text-[10px] tracking-[0.15em] font-medium mb-4">Details</p>
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

      {/* Related Products (#10) */}
      {relatedProducts.length > 0 && (
        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <h2 className="font-serif text-[#1A1A1A] text-2xl md:text-3xl mb-10">
              You May Also <span className="italic font-normal">Like</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
              {relatedProducts.map((item) => {
                const itemOnSale = item.comparePrice && item.comparePrice > item.price;
                return (
                  <Link key={item._id} href={`/shop/${item.slug}`} className="group block">
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
                        <div className="absolute inset-0 flex items-center justify-center text-[#666] text-xs">No Image</div>
                      )}
                      {item.inStock === false && (
                        <span className="absolute top-3 left-3 bg-[#232323] text-white uppercase text-[8px] tracking-[0.15em] px-3 py-1.5">Sold Out</span>
                      )}
                      {itemOnSale && item.inStock !== false && (
                        <span className="absolute top-3 left-3 bg-[#C08A6F] text-white uppercase text-[8px] tracking-[0.15em] px-3 py-1.5">Sale</span>
                      )}
                    </div>
                    <div className="mt-4">
                      <h3 className="text-[#1A1A1A] text-sm font-medium">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {item.priceType === "range" && item.priceMax ? (
                          <p className="text-sm text-[#666]">{formatPrice(item.price)} &ndash; {formatPrice(item.priceMax)}</p>
                        ) : (
                          <>
                            <p className={`text-sm ${itemOnSale ? "text-[#C08A6F] font-medium" : "text-[#666]"}`}>{formatPrice(item.price)}</p>
                            {itemOnSale && <p className="text-[#999] text-sm line-through">{formatPrice(item.comparePrice!)}</p>}
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
