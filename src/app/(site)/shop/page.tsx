import { Suspense } from "react";
import ShopPageClient from "@/components/ShopPageClient";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://janes.com";

export const metadata: Metadata = {
  title: "Shop | JANES — Premium Nigerian Fashion",
  description:
    "Shop JANES — Nigeria's curated contemporary fashion destination. Browse luxury ready-to-wear, African print collections, Ankara, Aso-oke fabrics, and designer pieces crafted in Lagos.",
  keywords: [
    "Nigerian fashion shop", "buy Ankara online", "Aso-oke fabric Nigeria",
    "Lagos fashion brand", "African contemporary fashion", "luxury ready-to-wear Nigeria",
    "designer clothes Lagos", "JANES fashion store",
  ],
  alternates: { canonical: "/shop" },
  openGraph: {
    title: "Shop | JANES — Premium Nigerian Fashion",
    description: "Browse luxury ready-to-wear, African print collections and exclusive designer pieces by JANES, crafted in Lagos, Nigeria.",
    url: `${siteUrl}/shop`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop | JANES — Premium Nigerian Fashion",
    description: "Discover luxury African contemporary fashion — Ankara, Aso-oke, and designer pieces by JANES.",
  },
};

export default function ShopPage() {
  return (
    <Suspense>
      <ShopPageClient />
    </Suspense>
  );
}
