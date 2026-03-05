import AboutPageClient from "@/components/AboutPageClient";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://janes.com";

export const metadata: Metadata = {
  title: "About | JANES — Nigerian Fashion Brand",
  description:
    "Learn about JANES — a Nigerian contemporary fashion brand rooted in Lagos. Our story, creative vision, and commitment to celebrating African identity through luxury fashion.",
  keywords: [
    "JANES fashion brand story", "Nigerian fashion designer", "Lagos fashion label",
    "African luxury fashion brand", "contemporary Nigerian fashion", "fashion Nigeria about",
  ],
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About | JANES — Nigerian Fashion Brand",
    description: "Discover the story behind JANES — celebrating African identity through contemporary luxury fashion, proudly made in Nigeria.",
    url: `${siteUrl}/about`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About | JANES — Nigerian Fashion Brand",
    description: "The story behind JANES — Nigerian luxury fashion rooted in Lagos.",
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
