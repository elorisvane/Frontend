"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "../lib/auth";
import { CartProvider } from "../lib/cart";
import { WishlistProvider } from "../lib/wishlist";

/**
 * Client-side context shared across the storefront: the Supabase auth session,
 * the shopping bag, and the wishlist. Mounted once around the app tree in the
 * root layout.
 */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>{children}</CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
