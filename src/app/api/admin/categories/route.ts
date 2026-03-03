import { NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity";

export const dynamic = "force-dynamic";

// GET all categories (tree structure)
export async function GET() {
  try {
    const categories = await writeClient.fetch(
      `*[_type == "category"] | order(level asc, order asc) {
        _id, title, "slug": slug.current, level, order, description,
        "image": image.asset->url,
        "parent": parent->{_id, title, "slug": slug.current, level}
      }`
    );
    return NextResponse.json(categories);
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST - create a new category
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, level, parentId, description, order, image } = body;

    if (!title || !slug || !level) {
      return NextResponse.json({ error: "title, slug and level are required" }, { status: 400 });
    }

    const doc: Record<string, unknown> = {
      _type: "category",
      title,
      slug: { _type: "slug", current: slug },
      level,
      description: description || "",
      order: order || 0,
    };

    if (parentId) {
      doc.parent = { _type: "reference", _ref: parentId };
    }

    if (image) {
      doc.image = {
        _type: "image",
        asset: { _type: "reference", _ref: image },
      };
    }

    const created = await writeClient.create(doc);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("Failed to create category:", err);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

// PATCH - update a category
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { _id, title, slug, level, parentId, description, order, image } = body;

    if (!_id) {
      return NextResponse.json({ error: "_id is required" }, { status: 400 });
    }

    const patch: Record<string, unknown> = {};
    if (title !== undefined) patch.title = title;
    if (slug !== undefined) patch.slug = { _type: "slug", current: slug };
    if (level !== undefined) patch.level = level;
    if (description !== undefined) patch.description = description;
    if (order !== undefined) patch.order = order;
    if (parentId !== undefined) {
      patch.parent = parentId ? { _type: "reference", _ref: parentId } : undefined;
    }
    if (image !== undefined) {
      patch.image = image
        ? { _type: "image", asset: { _type: "reference", _ref: image } }
        : undefined;
    }

    const updated = await writeClient.patch(_id).set(patch).commit();
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Failed to update category:", err);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// DELETE - delete a category
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Check if any children reference this category
    const children = await writeClient.fetch(
      `count(*[_type == "category" && parent._ref == $id])`,
      { id }
    );
    if (children > 0) {
      return NextResponse.json(
        { error: "Cannot delete: this category has child categories. Delete them first." },
        { status: 409 }
      );
    }

    // Check if any products reference this category
    const productCount = await writeClient.fetch(
      `count(*[_type == "product" && (category._ref == $id || subcategory._ref == $id || $id in tags[]._ref)])`,
      { id }
    );
    if (productCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${productCount} product(s) reference this category.` },
        { status: 409 }
      );
    }

    await writeClient.delete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete category:", err);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
