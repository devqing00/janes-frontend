import { NextResponse } from "next/server";
import { client, writeClient } from "@/lib/sanity";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const getCategories = searchParams.get("categories");
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const search = searchParams.get("q");
  const slug = searchParams.get("slug");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "0", 10);

  try {
    // Return distinct categories that have at least 1 published product
    if (getCategories === "true") {
      // Use writeClient (no CDN) so the result is always fresh
      const cats: string[] = await writeClient.fetch(
        `array::unique(*[_type == "product" && (status == "published" || !defined(status))].category)`
      );
      const res = NextResponse.json(cats.filter(Boolean).map((c) => c.toLowerCase()).sort());
      res.headers.set("Cache-Control", "no-store");
      return res;
    }

    let query: string;
    let params: Record<string, string | number> = {};

    if (slug) {
      // Single product by slug
      query = `*[_type == "product" && slug.current == $slug && (status == "published" || !defined(status))][0] {
        _id, name, "slug": slug.current, price, comparePrice, inStock, category, subcategory, description, details, sizes, status, featured,
        "images": images[].asset->{ _id, url }
      }`;
      params = { slug };
    } else if (search) {
      // Search products
      query = `*[_type == "product" && (status == "published" || !defined(status)) && (
        name match $search || 
        category match $search || 
        subcategory match $search ||
        description match $search
      )] | order(_createdAt desc) {
        _id, name, "slug": slug.current, price, comparePrice, inStock, category, subcategory, featured,
        "image": images[0].asset->url
      }`;
      params = { search: `${search}*` };
    } else if (featured === "true") {
      // Featured products only
      query = `*[_type == "product" && (status == "published" || !defined(status)) && featured == true] | order(_createdAt desc)[0...8] {
        _id, name, "slug": slug.current, price, comparePrice, inStock, category, featured, _createdAt,
        "image": images[0].asset->url
      }`;
    } else if (category && category !== "All") {
      // Filter by category
      query = `*[_type == "product" && (status == "published" || !defined(status)) && category == $category] | order(_createdAt desc) {
        _id, name, "slug": slug.current, price, comparePrice, inStock, category, subcategory, featured,
        "image": images[0].asset->url
      }`;
      params = { category };
    } else {
      // All published products (with optional pagination)
      if (limit > 0) {
        const start = (page - 1) * limit;
        const end = start + limit;
        // Get total count and paginated results
        const total = await client.fetch(`count(*[_type == "product" && (status == "published" || !defined(status))])`);
        const products = await client.fetch(
          `*[_type == "product" && (status == "published" || !defined(status))] | order(_createdAt desc)[$start...$end] {
            _id, name, "slug": slug.current, price, comparePrice, inStock, category, subcategory, featured,
            "image": images[0].asset->url
          }`,
          { start, end }
        );
        return NextResponse.json({ products, total, page, limit });
      }
      query = `*[_type == "product" && (status == "published" || !defined(status))] | order(_createdAt desc) {
        _id, name, "slug": slug.current, price, comparePrice, inStock, category, subcategory, featured,
        "image": images[0].asset->url
      }`;
    }

    const data = await client.fetch(query, params);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
