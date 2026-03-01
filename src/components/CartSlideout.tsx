"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "./CartProvider";
import { useSiteSettings } from "./SiteSettingsProvider";

export default function CartSlideout() {
  const { items, removeItem, updateQuantity, clearCart, itemCount, total, isOpen, closeCart } = useCart();
  const { formatPrice } = useSiteSettings();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 z-[300]"
            onClick={closeCart}
          />

          {/* Slide-out panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[301] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E2DB]">
              <div>
                <h2 className="font-serif text-lg text-[#1A1A1A]">Your Bag</h2>
                <p className="text-[#666] text-xs mt-0.5">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </p>
              </div>
              <button
                onClick={closeCart}
                className="text-[#666] hover:text-[#1A1A1A] transition-colors p-1"
                aria-label="Close cart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-[#E8E2DB] mb-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  <p className="text-[#666] text-sm mb-2">Your bag is empty</p>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="text-[#C08A6F] text-xs uppercase tracking-[0.15em] hover:underline"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  {items.map((item) => (
                    <div
                      key={item._id + (item.size || "")}
                      className="flex gap-4 pb-5 border-b border-[#E8E2DB] last:border-0"
                    >
                      {/* Image */}
                      <Link
                        href={`/shop/${item.slug}`}
                        onClick={closeCart}
                        className="relative w-20 h-24 bg-[#F5F0EB] flex-shrink-0 overflow-hidden"
                      >
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#999] text-[8px]">
                            No Image
                          </div>
                        )}
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/shop/${item.slug}`}
                          onClick={closeCart}
                          className="text-[#1A1A1A] text-sm font-medium hover:text-[#C08A6F] transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        {item.size && (
                          <p className="text-[#666] text-xs mt-0.5">Size: {item.size}</p>
                        )}
                        <p className="text-[#1A1A1A] text-sm mt-1">{formatPrice(item.price)}</p>

                        {/* Quantity + remove */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-[#E8E2DB]">
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity - 1, item.size)}
                              className="w-7 h-7 flex items-center justify-center text-[#666] hover:text-[#1A1A1A] transition-colors text-sm"
                            >
                              −
                            </button>
                            <span className="w-7 h-7 flex items-center justify-center text-xs text-[#1A1A1A] border-x border-[#E8E2DB]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1, item.size)}
                              className="w-7 h-7 flex items-center justify-center text-[#666] hover:text-[#1A1A1A] transition-colors text-sm"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item._id, item.size)}
                            className="text-[#666] hover:text-red-500 transition-colors text-xs uppercase tracking-wider"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-[#E8E2DB] px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#666] text-sm">Subtotal</span>
                  <span className="text-[#1A1A1A] text-lg font-medium">{formatPrice(total)}</span>
                </div>
                <p className="text-[#666] text-[10px]">Shipping & taxes calculated at checkout.</p>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full bg-[#C08A6F] text-white uppercase text-[11px] tracking-[0.2em] py-4 hover:bg-[#a8755c] transition-colors duration-300 text-center"
                >
                  Checkout
                </Link>
                <div className="flex items-center justify-between">
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="text-[#666] text-[10px] uppercase tracking-[0.15em] hover:text-[#1A1A1A] transition-colors"
                  >
                    Continue Shopping
                  </Link>
                  <button
                    onClick={clearCart}
                    className="text-[#666] text-[10px] uppercase tracking-[0.15em] hover:text-red-500 transition-colors"
                  >
                    Clear Bag
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
