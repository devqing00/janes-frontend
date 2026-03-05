"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";

export interface CartItem {
  _id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  size?: string;
  unit?: string; // fabric unit (yard, meter, etc.)
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Omit<CartItem, "quantity">, initialQuantity?: number) => void;
  removeItem: (id: string, size?: string, unit?: string) => void;
  updateQuantity: (id: string, quantity: number, size?: string, unit?: string) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "janes-cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage full or unavailable
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveCart(items);
  }, [items, mounted]);

  // Lock body scroll when cart is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const addItem = useCallback((product: Omit<CartItem, "quantity">, initialQuantity = 1) => {
    setItems((prev) => {
      const key = product._id + (product.size || "") + (product.unit || "");
      const existing = prev.find((item) => item._id + (item.size || "") + (item.unit || "") === key);
      if (existing) {
        return prev.map((item) =>
          item._id + (item.size || "") + (item.unit || "") === key
            ? { ...item, quantity: item.quantity + initialQuantity }
            : item
        );
      }
      return [...prev, { ...product, quantity: initialQuantity }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string, size?: string, unit?: string) => {
    setItems((prev) =>
      prev.filter((item) => !(item._id === id && (item.size || "") === (size || "") && (item.unit || "") === (unit || "")))
    );
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number, size?: string, unit?: string) => {
    if (quantity <= 0) {
      removeItem(id, size, unit);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item._id === id && (item.size || "") === (size || "") && (item.unit || "") === (unit || "")
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);
  const total = useMemo(() => items.reduce((acc, item) => acc + item.price * item.quantity, 0), [items]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextType>(
    () => ({ items, addItem, removeItem, updateQuantity, clearCart, itemCount, total, isOpen, openCart, closeCart }),
    [items, addItem, removeItem, updateQuantity, clearCart, itemCount, total, isOpen, openCart, closeCart]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
