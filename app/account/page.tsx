import type { Metadata } from "next";
import Account from "../src/pages/account";

export const metadata: Metadata = {
  title: "My Account | ÉLORIS",
  description: "Sign in or create an ÉLORIS account to access your orders, wishlist and private appointments.",
};

export default function Page() {
  return <Account />;
}
