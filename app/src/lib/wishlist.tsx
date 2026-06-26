"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./auth";
import {
  getServerWishlist,
  addServerWishlist,
  removeServerWishlist,
} from "../data/wishlist";

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
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);

  // Avoid writing back to storage before the initial read has hydrated state.
  const hydrated = useRef(false);
  // Mirror `items` into a ref so callbacks/effects can read the latest value
  // without re-subscribing on every change.
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  // Which user id we've already synced with the server, so we sync once per login.
  const syncedFor = useRef<string | null>(null);

  useEffect(() => {
    // Hydrate from localStorage after mount (empty during SSR / first paint so
    // server and client markup match).
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

  // On sign-in, reconcile the local (guest) wishlist with the server: push any
  // local-only saves up, then show the union. This records every save under the
  // shopper's account so the Admin can see who saved what.
  useEffect(() => {
    const uid = user?.id ?? null;
    if (!uid) {
      syncedFor.current = null;
      return;
    }
    if (syncedFor.current === uid) return;
    syncedFor.current = uid;

    let active = true;
    (async () => {
      try {
        const server = await getServerWishlist();
        const serverSlugs = new Set(server.map((i) => i.slug));
        const localOnly = itemsRef.current.filter(
          (i) => !serverSlugs.has(i.slug),
        );
        await Promise.all(
          localOnly.map((i) => addServerWishlist(i).catch(() => {})),
        );
        if (!active) return;

        // Union, newest-ish first (local saves ahead of older server saves),
        // de-duplicated by slug.
        const seen = new Set<string>();
        const union = [...localOnly, ...server].filter((i) => {
          if (seen.has(i.slug)) return false;
          seen.add(i.slug);
          return true;
        });
        setItems(union);
      } catch {
        // Network/db issue — keep the local wishlist as-is.
      }
    })();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const toggle = useCallback(
    (item: WishlistItem) => {
      const exists = itemsRef.current.some((i) => i.slug === item.slug);
      setItems((prev) =>
        prev.some((i) => i.slug === item.slug)
          ? prev.filter((i) => i.slug !== item.slug)
          : [item, ...prev],
      );
      if (user) {
        if (exists) removeServerWishlist(item.slug).catch(() => {});
        else addServerWishlist(item).catch(() => {});
      }
    },
    [user],
  );

  const remove = useCallback(
    (slug: string) => {
      setItems((prev) => prev.filter((i) => i.slug !== slug));
      if (user) removeServerWishlist(slug).catch(() => {});
    },
    [user],
  );

  const clear = useCallback(() => {
    const current = itemsRef.current;
    setItems([]);
    if (user) {
      current.forEach((i) => removeServerWishlist(i.slug).catch(() => {}));
    }
  }, [user]);

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      count: items.length,
      has: (slug) => items.some((i) => i.slug === slug),
      toggle,
      remove,
      clear,
    }),
    [items, toggle, remove, clear],
  );

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
