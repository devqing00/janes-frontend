import CollectionsPageClient from "@/components/CollectionsPageClient";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://janes.com";

export const metadata: Metadata = {
  title: "Collections | JANES — Seasonal African Fashion",
  description:
    "Explore JANES seasonal fashion collections — editorial-grade ready-to-wear, fabric archives, and curated lookbooks celebrating contemporary African aesthetics from Lagos, Nigeria.",
  keywords: [
    "JANES collections", "Nigerian fashion collections", "African fashion season",
    "Lagos designer collections", "Ankara collection Nigeria", "African ready-to-wear collection",
  ],
  alternates: { canonical: "/collections" },
  openGraph: {
    title: "Collections | JANES — Seasonal African Fashion",
    description: "Browse JANES seasonal collections — editorial-grade fashion celebrating contemporary African aesthetics.",
    url: `${siteUrl}/collections`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Collections | JANES — Seasonal African Fashion",
    description: "JANES seasonal collections — editorial-grade African contemporary fashion.",
  },
};

export default function CollectionsPage() {
  return <CollectionsPageClient />;
}
