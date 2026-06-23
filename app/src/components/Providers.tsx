"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "../lib/auth";
import { CartProvider } from "../lib/cart";

/**
 * Client-side context shared across the storefront: the Supabase auth session
 * and the shopping bag. Mounted once around the app tree in the root layout.
 */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
