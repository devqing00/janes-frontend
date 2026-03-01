import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { writeClient } from "@/lib/sanity";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const products = await writeClient.fetch(
      `*[_type == "product"] | order(_createdAt desc) {
        _id, name, slug, price, category, status, _createdAt,
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
    const doc = {
      _type: "product",
      name: body.name,
      slug: { _type: "slug", current: body.slug },
      price: Number(body.price),
      category: body.category,
      subcategory: body.subcategory || "",
      description: body.description || "",
      details: body.details ? body.details.split("\n").filter(Boolean) : [],
      sizes: body.sizes ? body.sizes.split(",").map((s: string) => s.trim()) : [],
      images: body.images || [],
      status: body.status || "draft",
    };

    const result = await writeClient.create(doc);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("Failed to create product:", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
