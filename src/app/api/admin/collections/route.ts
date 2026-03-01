import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { writeClient } from "@/lib/sanity";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const collections = await writeClient.fetch(
      `*[_type == "collection"] | order(_createdAt desc) {
        _id, title, slug, description, status, _createdAt,
        "image": { "url": image.asset->url },
        "productCount": count(*[_type == "product" && references(^._id)])
      }`
    );
    return NextResponse.json(collections);
  } catch (err) {
    console.error("Failed to fetch collections:", err);
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const doc = {
      _type: "collection",
      title: body.title,
      slug: { _type: "slug", current: body.slug },
      description: body.description || "",
      image: body.image || undefined,
      status: body.status || "draft",
    };

    const result = await writeClient.create(doc);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("Failed to create collection:", err);
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}
