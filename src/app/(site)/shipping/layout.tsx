import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://janes.com";

export const metadata: Metadata = {
  title: "Shipping & Returns | JANES",
  description:
    "JANES shipping policy: domestic Nigerian delivery in 3–5 business days, international in 7–14 days. Learn about returns, exchanges, and our hassle-free process.",
  keywords: ["JANES shipping Nigeria", "JANES delivery time", "returns policy JANES", "Nigerian fashion delivery"],
  alternates: { canonical: "/shipping" },
  openGraph: {
    title: "Shipping & Returns | JANES",
    description: "Shipping information for JANES orders within Nigeria and worldwide, plus returns and exchange policy.",
    url: `${siteUrl}/shipping`,
    type: "website",
  },
  robots: { index: false, follow: true },
};

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
