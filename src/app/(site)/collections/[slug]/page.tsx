import { client } from "@/lib/sanity";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CollectionDetailClient from "./CollectionDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCollection(slug: string) {
  return client.fetch(
    `*[_type == "collection" && slug.current == $slug && status == "published"][0] {
      _id,
      title,
      "slug": slug.current,
      description,
      season,
      year,
      "image": image.asset->url,
      "heroImages": heroImages[].asset->url,
      "lookbookImages": lookbookImages[].asset->url
    }`,
    { slug }
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) return { title: "Collection Not Found" };
  return {
    title: `${collection.title} | JANES`,
    description: collection.description || `Shop the ${collection.title} collection at JANES.`,
    openGraph: {
      title: `${collection.title} | JANES`,
      description: collection.description || `Shop the ${collection.title} collection at JANES.`,
      images: collection.image ? [collection.image] : [],
    },
  };
}

export default async function CollectionSlugPage({ params }: Props) {
  const { slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) notFound();
  return <CollectionDetailClient collection={collection} />;
}
