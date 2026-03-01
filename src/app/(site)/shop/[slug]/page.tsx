import { client } from "@/lib/sanity";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  return client.fetch(
    `*[_type == "product" && slug.current == $slug && status == "published"][0] {
      _id, name, "slug": slug.current, price, comparePrice, inStock, category, subcategory, description, details, sizes, featured,
      "images": images[].asset->{ _id, url }
    }`,
    { slug }
  );
}

async function getRelatedProducts(category: string, currentId: string) {
  return client.fetch(
    `*[_type == "product" && status == "published" && category == $category && _id != $currentId] | order(_createdAt desc)[0...4] {
      _id, name, "slug": slug.current, price, comparePrice, inStock,
      "image": images[0].asset->url
    }`,
    { category, currentId }
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found | JANES" };

  return {
    title: `${product.name} | JANES`,
    description: product.description || `Shop ${product.name} at JANES. Contemporary fashion crafted with precision.`,
    openGraph: {
      title: `${product.name} | JANES`,
      description: product.description || `Shop ${product.name} at JANES.`,
      images: product.images?.[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.category, product._id);

  return <ProductDetailClient product={product} relatedProducts={related} />;
}
