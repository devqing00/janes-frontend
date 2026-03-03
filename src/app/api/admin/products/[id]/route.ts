import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { writeClient } from "@/lib/sanity";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const product = await writeClient.fetch(
      `*[_type == "product" && _id == $id][0] {
        _id, name, slug, price, description, details, sizes, status, _createdAt,
        "categoryId": category._ref,
        "subcategoryId": subcategory._ref,
        "tagIds": tags[]._ref,
        "images": images[]{asset->{ _id, url }}
      }`,
      { id }
    );

    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      ...product,
      slug: product.slug?.current || "",
      sizes: (product.sizes || []).join(", "),
      details: (product.details || []).join("\n"),
      tagIds: product.tagIds || [],
    });
  } catch (err) {
    console.error("Failed to fetch product:", err);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    const patch: Record<string, unknown> = {
      name: body.name,
      slug: { _type: "slug", current: body.slug },
      price: Number(body.price),
      description: body.description || "",
      details: body.details ? body.details.split("\n").filter(Boolean) : [],
      sizes: body.sizes ? body.sizes.split(",").map((s: string) => s.trim()) : [],
      images: body.images || [],
      status: body.status || "draft",
    };

    // Category reference
    if (body.categoryId) {
      patch.category = { _type: "reference", _ref: body.categoryId };
    }
    // Subcategory reference
    if (body.subcategoryId) {
      patch.subcategory = { _type: "reference", _ref: body.subcategoryId };
    }
    // Tags: array of references
    if (Array.isArray(body.tagIds) && body.tagIds.length > 0) {
      patch.tags = body.tagIds.map((tid: string, i: number) => ({
        _type: "reference",
        _ref: tid,
        _key: `tag-${i}`,
      }));
    } else {
      patch.tags = [];
    }

    const result = await writeClient.patch(id).set(patch).commit();
    return NextResponse.json(result);
  } catch (err) {
    console.error("Failed to update product:", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await writeClient.delete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete product:", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
