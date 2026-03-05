import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders — JANES",
  description: "Track your JANES orders, view order history, and check delivery status.",
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
