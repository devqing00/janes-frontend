import { NextResponse } from "next/server";
import { client } from "@/lib/sanity";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const search = searchParams.get("q");
  const slug = searchParams.get("slug");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "0", 10);

  try {
    let query: string;
    let params: Record<string, string | number> = {};

    if (slug) {
      // Single product by slug
      query = `*[_type == "product" && slug.current == $slug && status == "published"][0] {
        _id, name, "slug": slug.current, price, comparePrice, inStock, category, subcategory, description, details, sizes, status, featured,
        "images": images[].asset->{ _id, url }
      }`;
      params = { slug };
    } else if (search) {
      // Search products
      query = `*[_type == "product" && status == "published" && (
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
      query = `*[_type == "product" && status == "published" && featured == true] | order(_createdAt desc)[0...8] {
        _id, name, "slug": slug.current, price, comparePrice, inStock, category, featured,
        "image": images[0].asset->url
      }`;
    } else if (category && category !== "All") {
      // Filter by category
      query = `*[_type == "product" && status == "published" && category == $category] | order(_createdAt desc) {
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
        const total = await client.fetch(`count(*[_type == "product" && status == "published"])`);
        const products = await client.fetch(
          `*[_type == "product" && status == "published"] | order(_createdAt desc)[$start...$end] {
            _id, name, "slug": slug.current, price, comparePrice, inStock, category, subcategory, featured,
            "image": images[0].asset->url
          }`,
          { start, end }
        );
        return NextResponse.json({ products, total, page, limit });
      }
      query = `*[_type == "product" && status == "published"] | order(_createdAt desc) {
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
