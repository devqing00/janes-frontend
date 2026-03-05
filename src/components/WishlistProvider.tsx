"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { onAuthStateChanged, getIdToken, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

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
const SERVER_SYNC_DEBOUNCE_MS = 1200;

function loadLocal(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocal(items: WishlistItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch { /* storage unavailable */ }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const authUserRef = useRef<User | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Initial load from localStorage ──────────────────────────
  useEffect(() => {
    setItems(loadLocal());
    setMounted(true);
  }, []);

  // ── Firebase auth state: sync with server wishlist ───────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        authUserRef.current = firebaseUser;
        try {
          const idToken = await getIdToken(firebaseUser);
          const res = await fetch("/api/auth/wishlist", {
            headers: { Authorization: `Bearer ${idToken}` },
          });
          if (res.ok) {
            const { items: serverItems }: { items: WishlistItem[] } = await res.json();
            // Merge: server is source of truth; append any local-only items on top
            setItems((local) => {
              const merged = [...serverItems];
              for (const localItem of local) {
                if (!merged.find((s) => s._id === localItem._id)) {
                  merged.push(localItem);
                }
              }
              return merged;
            });
          }
        } catch { /* stay with localStorage */ }
      } else {
        // Signed out — drop back to local-only, clear server ref
        authUserRef.current = null;
        setItems(loadLocal());
      }
    });
    return () => unsub();
  }, []);

  // ── Persist: localStorage always, server when logged in ──────
  useEffect(() => {
    if (!mounted) return;
    saveLocal(items);

    if (!authUserRef.current) return;
    const user = authUserRef.current;

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      try {
        const idToken = await getIdToken(user);
        await fetch("/api/auth/wishlist", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ items }),
        });
      } catch { /* silent — localStorage is the fallback */ }
    }, SERVER_SYNC_DEBOUNCE_MS);

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [items, mounted]);

  const toggleItem = useCallback((product: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      return exists
        ? prev.filter((item) => item._id !== product._id)
        : [...prev, product];
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

  const value = useMemo<WishlistContextType>(
    () => ({ items, toggleItem, removeItem, isInWishlist, itemCount }),
    [items, toggleItem, removeItem, isInWishlist, itemCount]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
  return context;
}
