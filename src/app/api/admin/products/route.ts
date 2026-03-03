import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { writeClient } from "@/lib/sanity";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const products = await writeClient.fetch(
      `*[_type == "product"] | order(_createdAt desc) {
        _id, name, slug, price, status, _createdAt,
        "category": category->title,
        "imageUrl": images[0].asset->url
      }`
    );
    return NextResponse.json(products);
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const doc: { _type: string; [key: string]: unknown } = {
      _type: "product",
      name: body.name,
      slug: { _type: "slug", current: body.slug },
      price: Number(body.price),
      description: body.description || "",
      details: body.details ? body.details.split("\n").filter(Boolean) : [],
      sizes: body.sizes ? body.sizes.split(",").map((s: string) => s.trim()) : [],
      images: body.images || [],
      status: body.status || "draft",
    };

    // Category reference (level 1)
    if (body.categoryId) {
      doc.category = { _type: "reference", _ref: body.categoryId };
    }
    // Subcategory reference (level 2)
    if (body.subcategoryId) {
      doc.subcategory = { _type: "reference", _ref: body.subcategoryId };
    }
    // Tags: array of references (level 3)
    if (Array.isArray(body.tagIds) && body.tagIds.length > 0) {
      doc.tags = body.tagIds.map((id: string, i: number) => ({
        _type: "reference",
        _ref: id,
        _key: `tag-${i}`,
      }));
    }

    const result = await writeClient.create(doc);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("Failed to create product:", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
