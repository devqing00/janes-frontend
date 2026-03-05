import { NextResponse } from "next/server";
import { client, writeClient } from "@/lib/sanity";

export const dynamic = "force-dynamic";

// Common projection that dereferences category references
const PRODUCT_LIST_PROJ = `{
  _id, name, "slug": slug.current, price, priceType, priceMax, comparePrice, inStock, featured, status,
  isFabricVariant,
  "category": category->{ _id, title, "slug": slug.current, level },
  "subcategory": subcategory->{ _id, title, "slug": slug.current, level },
  "tags": tags[]->{ _id, title, "slug": slug.current, level, fabricPrice, fabricPricePerN, fabricUnit },
  "image": images[0].asset->url
}`;

const PRODUCT_DETAIL_PROJ = `{
  _id, name, "slug": slug.current, price, priceType, priceMax, comparePrice, inStock, description, details, sizes, status, featured,
  isFabricVariant,
  "category": category->{ _id, title, "slug": slug.current, level },
  "subcategory": subcategory->{ _id, title, "slug": slug.current, level },
  "tags": tags[]->{ _id, title, "slug": slug.current, level, fabricPrice, fabricPricePerN, fabricUnit },
  "images": images[].asset->{ _id, url }
}`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const getCategories = searchParams.get("categories");
  const getCategoryTree = searchParams.get("categoryTree");
  const categorySlug = searchParams.get("category");
  const subcategorySlug = searchParams.get("subcategory");
  const tagSlug = searchParams.get("tag");
  const fabricGroup = searchParams.get("fabricGroup"); // fabric variant group by tag slug
  const featured = searchParams.get("featured");
  const search = searchParams.get("q");
  const slug = searchParams.get("slug");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "0", 10);

  try {
    // Return the full category tree for nav/filter
    if (getCategoryTree === "true") {
      const tree = await writeClient.fetch(
        `*[_type == "category"] | order(level asc, order asc) {
          _id, title, "slug": slug.current, level, order,
          "image": image.asset->url,
          "parent": parent->{ _id, "slug": slug.current }
        }`
      );
      return NextResponse.json(tree);
    }

    // Return distinct main categories that have at least 1 published product
    if (getCategories === "true") {
      const cats = await writeClient.fetch(
        `*[_type == "category" && level == 1] | order(order asc) {
          _id, title, "slug": slug.current, "image": image.asset->url,
          "productCount": count(*[_type == "product" && (status == "published" || !defined(status)) && category._ref == ^._id])
        }`
      );
      return NextResponse.json(cats);
    }

    let query: string;
    let params: Record<string, string | number> = {};

    if (slug) {
      query = `*[_type == "product" && slug.current == $slug && (status == "published" || !defined(status))][0] ${PRODUCT_DETAIL_PROJ}`;
      params = { slug };
    } else if (search) {
      query = `*[_type == "product" && (status == "published" || !defined(status)) && (
        name match $search || 
        category->title match $search || 
        subcategory->title match $search ||
        description match $search
      )] | order(_createdAt desc) ${PRODUCT_LIST_PROJ}`;
      params = { search: `${search}*` };
    } else if (featured === "true") {
      query = `*[_type == "product" && (status == "published" || !defined(status)) && featured == true] | order(_createdAt desc)[0...8] {
        _id, name, "slug": slug.current, price, priceType, priceMax, comparePrice, inStock, featured, _createdAt,
        "category": category->{ _id, title, "slug": slug.current },
        "image": images[0].asset->url
      }`;
    } else if (fabricGroup) {
      // Return the tag (with pricing) + all fabric variant images for a given tag slug
      // Tag pricing fields live on the category document, not on products.
      const tagData = await client.fetch(
        `*[_type == "category" && slug.current == $fabricGroup][0]{
          title, description, "slug": slug.current,
          fabricPrice, fabricPricePerN, fabricUnit, minQuantity, maxQuantity
        }`,
        { fabricGroup }
      );
      const variants = await client.fetch(
        `*[_type == "product" && (status == "published" || !defined(status)) && isFabricVariant == true && $fabricGroup in tags[]->slug.current] | order(_createdAt asc) {
          _id, "slug": slug.current,
          "image": images[0].asset->url,
          "allImages": images[].asset->url
        }`,
        { fabricGroup }
      );
      return NextResponse.json({ tag: tagData, variants: variants ?? [] });
    } else if (tagSlug && tagSlug !== "All") {
      // Filter by tag (level 3)
      query = `*[_type == "product" && (status == "published" || !defined(status)) && $tagSlug in tags[]->slug.current] | order(_createdAt desc) ${PRODUCT_LIST_PROJ}`;
      params = { tagSlug };
    } else if (subcategorySlug && subcategorySlug !== "All") {
      // Filter by subcategory (level 2)
      query = `*[_type == "product" && (status == "published" || !defined(status)) && subcategory->slug.current == $subcategorySlug] | order(_createdAt desc) ${PRODUCT_LIST_PROJ}`;
      params = { subcategorySlug };
    } else if (categorySlug && categorySlug !== "All") {
      // Filter by main category (level 1)
      query = `*[_type == "product" && (status == "published" || !defined(status)) && category->slug.current == $categorySlug] | order(_createdAt desc) ${PRODUCT_LIST_PROJ}`;
      params = { categorySlug };
    } else {
      if (limit > 0) {
        const start = (page - 1) * limit;
        const end = start + limit;
        const total = await client.fetch(`count(*[_type == "product" && (status == "published" || !defined(status))])`);
        const products = await client.fetch(
          `*[_type == "product" && (status == "published" || !defined(status))] | order(_createdAt desc)[$start...$end] ${PRODUCT_LIST_PROJ}`,
          { start, end }
        );
        return NextResponse.json({ products, total, page, limit });
      }
      query = `*[_type == "product" && (status == "published" || !defined(status))] | order(_createdAt desc) ${PRODUCT_LIST_PROJ}`;
    }

    const data = await client.fetch(query, params);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

