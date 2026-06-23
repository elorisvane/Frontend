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

export interface CartItem {
  slug: string;
  name: string;
  image: string;
  /** Pre-formatted display price, e.g. "$48,500". */
  price: string;
  /** Selected material / metal option. */
  material: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  /** Total number of pieces in the bag (sum of quantities). */
  count: number;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (slug: string, material: string, quantity: number) => void;
  remove: (slug: string, material: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "eloris-bag";

/** Same piece in a different material is a distinct line. */
const sameLine = (a: CartItem, slug: string, material: string) =>
  a.slug === slug && a.material === material;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  // Avoid writing back to storage before the initial read has hydrated state.
  const hydrated = useRef(false);

  useEffect(() => {
    // Hydrate from localStorage after mount. We intentionally render an empty
    // bag during SSR / first paint and fill it here, so the server and client
    // markup match — this is the supported exception to set-state-in-effect.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      // Corrupt or unavailable storage — start with an empty bag.
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

  const value = useMemo<CartContextValue>(() => {
    return {
      items,
      count: items.reduce((n, i) => n + i.quantity, 0),

      add(item, quantity = 1) {
        setItems((prev) => {
          const existing = prev.find((i) =>
            sameLine(i, item.slug, item.material),
          );
          if (existing) {
            return prev.map((i) =>
              sameLine(i, item.slug, item.material)
                ? { ...i, quantity: i.quantity + quantity }
                : i,
            );
          }
          return [...prev, { ...item, quantity }];
        });
      },

      setQuantity(slug, material, quantity) {
        setItems((prev) =>
          quantity <= 0
            ? prev.filter((i) => !sameLine(i, slug, material))
            : prev.map((i) =>
                sameLine(i, slug, material) ? { ...i, quantity } : i,
              ),
        );
      },

      remove(slug, material) {
        setItems((prev) => prev.filter((i) => !sameLine(i, slug, material)));
      },

      clear() {
        setItems([]);
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}

/**
 * Parse a pre-formatted price string ("$48,500") into a number, or null when it
 * carries no numeric value (e.g. "Price on request"). Used to total the bag.
 */
export function parsePrice(price: string): number | null {
  const digits = price.replace(/[^0-9.]/g, "");
  if (!digits) return null;
  const value = Number.parseFloat(digits);
  return Number.isFinite(value) ? value : null;
}

/** Sum a bag into a display total, inferring the currency symbol from items. */
export function formatCartTotal(items: CartItem[]): string {
  let total = 0;
  let hasNumeric = false;
  for (const item of items) {
    const unit = parsePrice(item.price);
    if (unit !== null) {
      total += unit * item.quantity;
      hasNumeric = true;
    }
  }
  if (!hasNumeric) return "Price on request";
  const symbol = items[0]?.price.match(/^[^\d\s]+/)?.[0] ?? "$";
  return `${symbol}${total.toLocaleString("en-US")}`;
}
