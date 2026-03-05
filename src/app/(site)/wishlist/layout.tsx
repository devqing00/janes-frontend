import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wishlist — JANES",
  description: "View and manage your saved JANES pieces.",
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
