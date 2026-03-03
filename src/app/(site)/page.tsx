import Hero from "@/components/Hero";
import MarqueeBanner from "@/components/MarqueeBanner";
import StatsStrip from "@/components/StatsStrip";
import CollectionSection from "@/components/CollectionSection";
import CategoriesSection from "@/components/CategoriesSection";
import EditorialGrid from "@/components/EditorialGrid";
import FeaturedProducts from "@/components/FeaturedProducts";
import ParallaxSection from "@/components/ParallaxSection";
import { client } from "@/lib/sanity";

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
