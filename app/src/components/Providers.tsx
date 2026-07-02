"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "../lib/auth";
import { CartProvider } from "../lib/cart";
import { WishlistProvider } from "../lib/wishlist";
import CurrencyProvider from "./CurrencyProvider";
import type { Rates } from "../lib/currency";

/**
 * Client-side context shared across the storefront: the Supabase auth session,
 * the shopping bag, the wishlist, and the display currency. Mounted once around
 * the app tree in the root layout. Currency is seeded by the server (detected
 * currency + fetched rates) so prices render correctly on first paint.
 */
export default function Providers({
  children,
  currencyCode,
  rates,
}: {
  children: ReactNode;
  currencyCode: string;
  rates: Rates;
}) {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <CurrencyProvider initialCode={currencyCode} rates={rates}>
            {children}
          </CurrencyProvider>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
