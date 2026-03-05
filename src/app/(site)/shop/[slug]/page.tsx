import { client } from "@/lib/sanity";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://janes.com";

async function getProduct(slug: string) {
  return client.fetch(
    `*[_type == "product" && slug.current == $slug && status == "published"][0] {
      _id, name, "slug": slug.current, price, priceType, priceMax, comparePrice, inStock, description, details, sizes, featured,
      "images": images[].asset->{ _id, url },
      "categoryRef": category._ref,
      "category": category->{ _id, title, "slug": slug.current },
      "subcategory": subcategory->{ _id, title, "slug": slug.current }
    }`,
    { slug }
  );
}

async function getRelatedProducts(categoryRef: string, currentId: string) {
  return client.fetch(
    `*[_type == "product" && status == "published" && category._ref == $categoryRef && _id != $currentId] | order(_createdAt desc)[0...4] {
      _id, name, "slug": slug.current, price, priceType, priceMax, comparePrice, inStock,
      "image": images[0].asset->url
    }`,
    { categoryRef, currentId }
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found | JANES" };

  const desc =
    product.description ||
    `Shop ${product.name} at JANES. Premium Nigerian fashion crafted with precision. ${
      product.category?.title ? `Category: ${product.category.title}.` : ""
    }`;
  const imageUrl = product.images?.[0]?.url;

  return {
    title: `${product.name} | JANES`,
    description: desc,
    alternates: { canonical: `/shop/${slug}` },
    openGraph: {
      title: `${product.name} | JANES`,
      description: desc,
      url: `/shop/${slug}`,
      type: "website",
      images: imageUrl ? [{ url: imageUrl, width: 800, height: 1000, alt: product.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | JANES`,
      description: desc,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categoryRef || "", product._id);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} by JANES`,
    image: product.images?.map((i: { url: string }) => i.url) || [],
    brand: { "@type": "Brand", name: "JANES" },
    url: `${siteUrl}/shop/${product.slug}`,
    offers: {
      "@type": "Offer",
      priceCurrency: "NGN",
      price: product.price || 0,
      availability: product.inStock !== false
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "JANES" },
    },
    category: product.category?.title || "Fashion",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${siteUrl}/shop` },
      ...(product.category
        ? [{ "@type": "ListItem", position: 3, name: product.category.title, item: `${siteUrl}/shop?category=${product.category.slug}` }]
        : []),
      { "@type": "ListItem", position: product.category ? 4 : 3, name: product.name, item: `${siteUrl}/shop/${product.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <ProductDetailClient product={product} relatedProducts={related} />
    </>
  );
}

