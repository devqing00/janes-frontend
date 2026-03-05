import { Metadata } from "next";
import { notFound } from "next/navigation";
import { client } from "@/lib/sanity";
import FabricGroupClient from "@/components/FabricGroupClient";

interface Props {
  params: Promise<{ tagSlug: string }>;
}

interface TagData {
  title: string;
  description?: string;
  slug: string;
  fabricPrice: number;
  fabricPricePerN: number;
  fabricUnit: string;
  minQuantity: number;
  maxQuantity?: number | null;
}

interface FabricVariantRaw {
  _id: string;
  images: string[];
}

export interface FabricVariantData {
  _id: string;        // product _id (used for cart)
  imageUrl: string;   // single image for this visual swatch
}

async function getTagAndVariants(tagSlug: string): Promise<{
  tag: TagData;
  variants: FabricVariantData[];
} | null> {
  const [tag, rawVariants] = await Promise.all([
    client.fetch<TagData | null>(
      `*[_type == "category" && slug.current == $slug][0]{
        title, description, "slug": slug.current,
        "fabricPrice": coalesce(fabricPrice, 0),
        "fabricPricePerN": coalesce(fabricPricePerN, 1),
        "fabricUnit": coalesce(fabricUnit, "yard"),
        "minQuantity": coalesce(minQuantity, 1),
        maxQuantity
      }`,
      { slug: tagSlug }
    ),
    client.fetch<FabricVariantRaw[]>(
      `*[_type == "product" && isFabricVariant == true && $slug in tags[]->slug.current] | order(_createdAt asc) {
        _id,
        "images": images[].asset->url
      }`,
      { slug: tagSlug }
    ),
  ]);

  if (!tag) return null;

  // Flatten: each image in any matching product becomes its own visual variant
  const variants: FabricVariantData[] = (rawVariants ?? []).flatMap((v) =>
    (v.images ?? []).filter(Boolean).map((url) => ({ _id: v._id, imageUrl: url }))
  );

  return { tag, variants };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tagSlug } = await params;
  const data = await getTagAndVariants(tagSlug);
  if (!data) return { title: "Fabrics — JANES" };
  return {
    title: `${data.tag.title} — Fabrics — JANES`,
    description: `Shop ${data.tag.title} fabric variants. ${data.variants.length} options available.`,
  };
}

export default async function FabricGroupPage({ params }: Props) {
  const { tagSlug } = await params;
  const data = await getTagAndVariants(tagSlug);

  if (!data) notFound();

  return (
    <FabricGroupClient
      tagSlug={tagSlug}
      tagName={data.tag.title}
      tagDescription={data.tag.description}
      fabricPrice={data.tag.fabricPrice}
      fabricPricePerN={data.tag.fabricPricePerN}
      fabricUnit={data.tag.fabricUnit}
      minQuantity={data.tag.minQuantity}
      maxQuantity={data.tag.maxQuantity}
      variants={data.variants}
    />
  );
}
