"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface WishlistItem {
  _id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
}

interface WishlistContextType {
  items: WishlistItem[];
  toggleItem: (product: WishlistItem) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  itemCount: number;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

const STORAGE_KEY = "janes-wishlist";

function loadWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveWishlist(items: WishlistItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage unavailable
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(loadWishlist());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveWishlist(items);
  }, [items, mounted]);

  const toggleItem = useCallback((product: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      if (exists) {
        return prev.filter((item) => item._id !== product._id);
      }
      return [...prev, product];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item._id !== id));
  }, []);

  const isInWishlist = useCallback(
    (id: string) => items.some((item) => item._id === id),
    [items]
  );

  const itemCount = items.length;

  return (
    <WishlistContext.Provider value={{ items, toggleItem, removeItem, isInWishlist, itemCount }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
  return context;
}
