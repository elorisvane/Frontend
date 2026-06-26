"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface WishlistItem {
  slug: string;
  name: string;
  image: string;
  /** Pre-formatted display price, e.g. "$41,200". */
  price: string;
  category: string;
}

interface WishlistContextValue {
  items: WishlistItem[];
  /** Number of saved pieces. */
  count: number;
  /** Whether a piece (by slug) is already saved. */
  has: (slug: string) => boolean;
  /** Save the piece if it isn't saved; remove it if it is. */
  toggle: (item: WishlistItem) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

const STORAGE_KEY = "eloris-wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  // Avoid writing back to storage before the initial read has hydrated state.
  const hydrated = useRef(false);

  useEffect(() => {
    // Hydrate from localStorage after mount, mirroring the bag: render an empty
    // wishlist during SSR / first paint so server and client markup match.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw) as WishlistItem[]);
    } catch {
      // Corrupt or unavailable storage — start with an empty wishlist.
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage write failures (e.g. private mode quota).
    }
  }, [items]);

  const value = useMemo<WishlistContextValue>(() => {
    return {
      items,
      count: items.length,
      has: (slug) => items.some((i) => i.slug === slug),

      toggle(item) {
        setItems((prev) =>
          prev.some((i) => i.slug === item.slug)
            ? prev.filter((i) => i.slug !== item.slug)
            : [item, ...prev],
        );
      },

      remove(slug) {
        setItems((prev) => prev.filter((i) => i.slug !== slug));
      },

      clear() {
        setItems([]);
      },
    };
  }, [items]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx)
    throw new Error("useWishlist must be used within <WishlistProvider>");
  return ctx;
}
