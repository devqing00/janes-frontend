import type { MetadataRoute } from "next";
import { client } from "@/lib/sanity";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://janes.com";

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "",         changeFrequency: "daily",   priority: 1.0 },
  { path: "/shop",    changeFrequency: "daily",   priority: 0.95 },
  { path: "/collections", changeFrequency: "weekly", priority: 0.85 },
  { path: "/lookbook",    changeFrequency: "weekly", priority: 0.8 },
  { path: "/about",       changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact",     changeFrequency: "monthly", priority: 0.7 },
  { path: "/faq",         changeFrequency: "monthly", priority: 0.6 },
  { path: "/shipping",    changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy",     changeFrequency: "yearly",  priority: 0.3 },
  { path: "/terms",       changeFrequency: "yearly",  priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  let productEntries: MetadataRoute.Sitemap = [];
  let collectionEntries: MetadataRoute.Sitemap = [];

  try {
    const products: Array<{ slug: string; updatedAt: string }> = await client.fetch(
      `*[_type == "product" && status == "published" && defined(slug.current)] { "slug": slug.current, "updatedAt": _updatedAt }`
    );
    productEntries = products.map(({ slug, updatedAt }) => ({
      url: `${BASE_URL}/shop/${slug}`,
      lastModified: new Date(updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // non-fatal — static sitemap still generated
  }

  try {
    const collections: Array<{ slug: string; updatedAt: string }> = await client.fetch(
      `*[_type == "collection" && defined(slug.current)] { "slug": slug.current, "updatedAt": _updatedAt }`
    );
    collectionEntries = collections.map(({ slug, updatedAt }) => ({
      url: `${BASE_URL}/collections/${slug}`,
      lastModified: new Date(updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));
  } catch {
    // non-fatal
  }

  return [...staticEntries, ...productEntries, ...collectionEntries];
}

