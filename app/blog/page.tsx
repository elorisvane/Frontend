import type { Metadata } from "next";
import Blog from "../src/pages/Blog/blog";

export const metadata: Metadata = {
  title: "The Journal | ÉLORIS",
  description: "Stories and insights from the world of ÉLORIS high jewellery.",
};

export default function Page() {
  return <Blog />;
}
