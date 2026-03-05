import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { writeClient } from "@/lib/sanity";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const collection = await writeClient.fetch(
      `*[_type == "collection" && _id == $id][0] {
        _id, title, slug, description, status, _createdAt,
        "image": image.asset->{ _id, url }
      }`,
      { id }
    );

    if (!collection) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      ...collection,
      slug: collection.slug?.current || "",
    });
  } catch (err) {
    console.error("Failed to fetch collection:", err);
    return NextResponse.json({ error: "Failed to fetch collection" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    const result = await writeClient
      .patch(id)
      .set({
        title: body.title,
        slug: { _type: "slug", current: body.slug },
        description: body.description || "",
        image: body.image || undefined,
        status: body.status || "draft",
      })
      .commit();

    return NextResponse.json(result);
  } catch (err) {
    console.error("Failed to update collection:", err);
    return NextResponse.json({ error: "Failed to update collection" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    // Verify the document is actually a collection before deleting
    const doc = await writeClient.fetch(`*[_type == "collection" && _id == $id][0]{ _id }`, { id });
    if (!doc) return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    await writeClient.delete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete collection:", err);
    return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 });
  }
}
