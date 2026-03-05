import type { Metadata } from "next";
import Hero from "@/components/Hero";
import MarqueeBanner from "@/components/MarqueeBanner";
import StatsStrip from "@/components/StatsStrip";
import CollectionSection from "@/components/CollectionSection";
import CategoriesSection from "@/components/CategoriesSection";
import EditorialGrid from "@/components/EditorialGrid";
import FeaturedProducts from "@/components/FeaturedProducts";
import ParallaxSection from "@/components/ParallaxSection";
import { client } from "@/lib/sanity";

export const metadata: Metadata = {
  title: "JANES — Premium Nigerian Fashion Brand",
  description:
    "Discover JANES — Nigeria's leading contemporary fashion brand. Shop premium Ankara fabrics, Aso-Oke collections, womenswear and menswear crafted to celebrate African elegance. Free delivery across Lagos.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "JANES — Premium Nigerian Fashion Brand",
    description: "Nigeria's leading contemporary fashion brand — Ankara, Aso-Oke, womenswear & menswear.",
    url: "/",
    type: "website",
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://janes.com";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  name: "JANES",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  description:
    "Nigeria's premium contemporary fashion brand specialising in Ankara, Aso-Oke, womenswear, menswear and bespoke African print designs.",
  address: {
    "@type": "PostalAddress",
    addressCountry: "NG",
    addressRegion: "Lagos",
  },
  sameAs: [
    `https://www.instagram.com/janesfashion`,
    `https://www.facebook.com/janesfashion`,
  ],
  priceRange: "₦₦₦",
  openingHours: "Mo-Sa 09:00-18:00",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "JANES",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/shop?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

/* ── Server-side data fetching ── */
async function getHomeContent() {
  try {
    const collections = await client.fetch(
      `*[_type == "collection" && status == "published"] | order(_createdAt desc) [0...3] {
        title, "slug": slug.current, season, year,
        "image": image.asset->url
      }`
    );

    return { collections };
  } catch (err) {
    console.error("Failed to fetch home content:", err);
    return { collections: [] };
  }
}

export default async function HomePage() {
  const { collections } = await getHomeContent();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const collectionItems = collections?.map((c: any) => ({
    title: c.title || "",
    year: c.year || c.season || "",
    image: c.image || "",
    slug: c.slug || "",
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Hero />
      <MarqueeBanner />
      <StatsStrip />
      <CollectionSection collections={collectionItems} />
      <CategoriesSection />
      <FeaturedProducts />
      <EditorialGrid />
      <ParallaxSection />
    </>
  );
}

