import Hero from "@/components/Hero";
import CollectionSection from "@/components/CollectionSection";
import CategoriesSection from "@/components/CategoriesSection";
import EditorialGrid from "@/components/EditorialGrid";
import FeaturedProducts from "@/components/FeaturedProducts";
import ParallaxSection from "@/components/ParallaxSection";
import { client } from "@/lib/sanity";

/* ── Server-side data fetching ── */
async function getHomeContent() {
  try {
    const [settings, collections] = await Promise.all([
      client.fetch(
        `*[_type == "siteSettings"][0]{
          tagline,
          heroImages[]{ "url": asset->url, "ref": asset._ref },
          heroSeasonLabel,
          heroCTAText,
          categoryCards[]{ title, "imageUrl": image.asset->url, link },
          editorialItems[]{ "imageUrl": image.asset->url, title, category },
          parallaxImage{ "url": asset->url },
          parallaxSubtitle,
          parallaxHeading,
          parallaxCTAText,
          parallaxCTALink
        }`
      ),
      client.fetch(
        `*[_type == "collection" && status == "published"] | order(_createdAt desc) [0...3] {
          title, "slug": slug.current, season, year,
          "image": image.asset->url
        }`
      ),
    ]);

    return { settings, collections };
  } catch (err) {
    console.error("Failed to fetch home content:", err);
    return { settings: null, collections: [] };
  }
}

export default async function HomePage() {
  const { settings, collections } = await getHomeContent();

  /* Map Sanity data → component props */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const heroImages = settings?.heroImages?.map((img: any) => img.url).filter(Boolean) as string[] | undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categoryCards = settings?.categoryCards?.map((c: any) => ({
    title: c.title,
    image: c.imageUrl || "",
    href: c.link || "/shop",
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorialItems = settings?.editorialItems?.map((e: any) => ({
    image: e.imageUrl || "",
    title: e.title || "",
    category: e.category || "",
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const collectionItems = collections?.map((c: any) => ({
    title: c.title || "",
    year: c.year || c.season || "",
    image: c.image || "",
    slug: c.slug || "",
  }));

  return (
    <>
      <Hero
        tagline={settings?.tagline}
        heroImages={heroImages}
        heroSeasonLabel={settings?.heroSeasonLabel}
        heroCTAText={settings?.heroCTAText}
      />
      <CollectionSection collections={collectionItems} />
      <CategoriesSection categories={categoryCards} />
      <FeaturedProducts />
      <EditorialGrid items={editorialItems} />
      <ParallaxSection
        image={settings?.parallaxImage?.url}
        subtitle={settings?.parallaxSubtitle}
        heading={settings?.parallaxHeading}
        ctaText={settings?.parallaxCTAText}
        ctaLink={settings?.parallaxCTALink}
      />
    </>
  );
}
