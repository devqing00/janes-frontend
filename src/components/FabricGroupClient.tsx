"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "./CartProvider";
import { useSiteSettings } from "./SiteSettingsProvider";
import { useWishlist } from "./WishlistProvider";

export interface FabricVariant {
  _id: string;
  imageUrl: string;
}

interface Props {
  tagSlug: string;
  tagName: string;
  tagDescription?: string;
  fabricPrice: number;
  fabricPricePerN: number;
  fabricUnit: string;
  minQuantity: number;
  maxQuantity?: number | null;
  variants: FabricVariant[];
}

const UNIT_LABELS: Record<string, string> = {
  yard: "yard",
  meter: "meter",
  piece: "piece",
  roll: "roll",
  kg: "kg",
  length: "length",
};

export default function FabricGroupClient({
  tagSlug,
  tagName,
  tagDescription,
  fabricPrice,
  fabricPricePerN,
  fabricUnit,
  minQuantity: min,
  maxQuantity,
  variants,
}: Props) {
  const { addItem } = useCart();
  const { formatPrice } = useSiteSettings();
  const { toggleItem, isInWishlist } = useWishlist();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(min);
  const [added, setAdded] = useState(false);
  const [heroImg, setHeroImg] = useState<string | null>(null);

  const selected = selectedIndex !== null ? variants[selectedIndex] : null;
  const unitLabel = UNIT_LABELS[fabricUnit] ?? fabricUnit;
  const max = maxQuantity ?? null;
  const unitPrice = fabricPricePerN > 0 ? fabricPrice / fabricPricePerN : fabricPrice;
  const priceLabel = `${formatPrice(fabricPrice)} / ${fabricPricePerN > 1 ? `${fabricPricePerN} ` : ""}${unitLabel}${fabricPricePerN > 1 ? "s" : ""}`;

  // Reset quantity when selection changes
  useEffect(() => {
    setQuantity(min);
    if (selected) setHeroImg(selected.imageUrl);
  }, [selectedIndex, min, selected]);

  // On mount, set hero to first variant image
  useEffect(() => {
    if (variants.length > 0 && !heroImg) {
      setHeroImg(variants[0].imageUrl);
    }
  }, [variants, heroImg]);

  const decrement = () => setQuantity((q) => Math.max(min, q - 1));
  const increment = () => setQuantity((q) => (max !== null ? Math.min(max, q + 1) : q + 1));

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;
    setQuantity(max !== null ? Math.min(max, Math.max(min, val)) : Math.max(min, val));
  };

  const handleAddToCart = () => {
    if (!selected || selectedIndex === null) return;
    addItem(
      {
        _id: selected._id,
        name: `${tagName} #${selectedIndex + 1}`,
        slug: tagSlug,
        price: unitPrice,
        image: selected.imageUrl,
        unit: fabricUnit,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  if (variants.length === 0) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center bg-[#FAFAF8]">
        <div className="text-center px-6">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#F5F0EB] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-7 h-7 text-[#C08A6F]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21Z" />
            </svg>
          </div>
          <h2 className="text-lg font-light text-[#1A1A1A] mb-2">No variants yet</h2>
          <p className="text-[#999] text-sm">Variants for {tagName} will appear here once added.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#FAFAF8] min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8">
        <nav className="flex items-center gap-1.5 text-[10px] sm:text-xs text-[#999] uppercase tracking-[0.15em]">
          <Link href="/shop" className="hover:text-[#1A1A1A] transition-colors">Shop</Link>
          <span>/</span>
          <Link href="/shop?category=fabrics" className="hover:text-[#1A1A1A] transition-colors">Fabrics</Link>
          <span>/</span>
          <span className="text-[#1A1A1A]">{tagName}</span>
        </nav>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Left: Hero image + thumbnails */}
          <div className="lg:col-span-7">
            {/* Hero image */}
            <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#F0ECE6]">
              {heroImg ? (
                <Image
                  src={heroImg}
                  alt={selected ? `${tagName} #${selectedIndex! + 1}` : tagName}
                  fill
                  className="object-cover transition-opacity duration-500"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#C4B9AE] text-sm">
                  Select a variant
                </div>
              )}
              {selected && (
                <div className="absolute top-4 left-4 sm:top-5 sm:left-5 bg-white/90 backdrop-blur-sm rounded-full px-3.5 py-1.5 shadow-sm">
                  <span className="text-[10px] sm:text-xs font-medium text-[#1A1A1A] tracking-wide">
                    #{selectedIndex! + 1} of {variants.length}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            <div className="mt-4 sm:mt-5">
              <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-3 pt-2 px-2 scrollbar-hide">
                {variants.map((v, i) => {
                  const imgSrc = v.imageUrl;
                  const isActive = selectedIndex === i;
                  return (
                    <button
                      key={`${v._id}-${i}`}
                      type="button"
                      onClick={() => setSelectedIndex(i)}
                      className={`group relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden transition-all duration-200 ${
                        isActive
                          ? "ring-2 ring-[#C08A6F] ring-offset-2 ring-offset-[#FAFAF8] scale-[1.02]"
                          : "ring-1 ring-black/5 hover:ring-black/15"
                      }`}
                      aria-label={`${tagName} variant ${i + 1}`}
                    >
                      <Image
                        src={imgSrc}
                        alt={`${tagName} #${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                      {!isActive && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Product info & order panel */}
          <div className="lg:col-span-5 lg:sticky lg:top-20 self-start">
            <div className="bg-white rounded-2xl border border-black/[0.06] p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              {/* Tag & title */}
              <div className="mb-6">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#C08A6F] font-medium">Fabrics</span>
                <h1 className="text-2xl sm:text-3xl font-light text-[#1A1A1A] tracking-tight mt-1.5 leading-tight">{tagName}</h1>
                <p className="text-lg sm:text-xl text-[#1A1A1A] font-medium mt-3">{priceLabel}</p>
                {tagDescription && (
                  <p className="text-[#777] text-sm mt-3 leading-relaxed">{tagDescription}</p>
                )}
              </div>

              <div className="h-px bg-black/[0.06] -mx-6 sm:-mx-8" />

              {selected ? (
                <div className="pt-6 space-y-6">
                  {/* Selected indicator */}
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 ring-1 ring-black/5">
                      <Image src={selected.imageUrl} alt="" fill className="object-cover" sizes="56px" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1A1A1A]">{tagName} #{selectedIndex! + 1}</p>
                      <p className="text-xs text-[#999] mt-0.5">Variant selected</p>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-xs text-[#666] uppercase tracking-widest font-medium">
                        Quantity ({unitLabel}s)
                      </label>
                      {max && (
                        <span className="text-[10px] text-[#999] uppercase tracking-wider">Max: {max}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-0 border border-black/10 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={decrement}
                        disabled={quantity <= min}
                        className="w-12 h-12 flex items-center justify-center text-[#666] hover:bg-black/[0.02] transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-r border-black/10"
                        aria-label="Decrease"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                        </svg>
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        min={min}
                        max={max ?? undefined}
                        onChange={handleQuantityChange}
                        className="flex-1 text-center text-sm font-medium text-[#1A1A1A] py-3 focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={increment}
                        disabled={max !== null && quantity >= max}
                        className="w-12 h-12 flex items-center justify-center text-[#666] hover:bg-black/[0.02] transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-l border-black/10"
                        aria-label="Increase"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="flex items-center justify-between py-3 border-y border-black/[0.04]">
                    <span className="text-xs text-[#999] uppercase tracking-widest">Subtotal</span>
                    <span className="text-base font-medium text-[#1A1A1A]">{formatPrice(unitPrice * quantity)}</span>
                  </div>

                  {/* Add to cart + Wishlist */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={added}
                      className={`flex-1 text-sm font-medium py-4 rounded-xl tracking-wide transition-all duration-300 ${
                        added
                          ? "bg-green-600 text-white"
                          : "bg-[#1A1A1A] text-white hover:bg-[#C08A6F]"
                      }`}
                    >
                      {added ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                          Added to Cart
                        </span>
                      ) : (
                        `Add ${quantity} ${unitLabel}${quantity !== 1 ? "s" : ""} to Cart`
                      )}
                    </button>

                    {/* Wishlist toggle */}
                    <button
                      type="button"
                      aria-label={isInWishlist(selected._id) ? "Remove from wishlist" : "Save to wishlist"}
                      onClick={() =>
                        toggleItem({
                          _id: selected._id,
                          name: `${tagName} #${selectedIndex! + 1}`,
                          slug: tagSlug,
                          price: unitPrice,
                          image: selected.imageUrl,
                        })
                      }
                      className={`w-14 rounded-xl border transition-all duration-200 flex items-center justify-center shrink-0 ${
                        isInWishlist(selected._id)
                          ? "border-[#C08A6F] bg-[#fdf9f7]"
                          : "border-black/10 hover:border-[#C08A6F] bg-white"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className={`w-5 h-5 transition-colors ${
                          isInWishlist(selected._id)
                            ? "fill-[#C08A6F] stroke-[#C08A6F]"
                            : "fill-none stroke-[#1A1A1A]"
                        }`}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-8 pb-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#F5F0EB] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#C08A6F]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
                    </svg>
                  </div>
                  <p className="text-sm text-[#999]">Select a variant below to continue</p>
                  <p className="text-xs text-[#C4B9AE] mt-1">{variants.length} option{variants.length !== 1 ? "s" : ""} available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
