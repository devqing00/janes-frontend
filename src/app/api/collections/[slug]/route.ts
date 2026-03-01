import { NextResponse } from "next/server";
import { client } from "@/lib/sanity";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const collection = await client.fetch(
      `*[_type == "collection" && slug.current == $slug && status == "published"][0] {
        _id,
        title,
        "slug": slug.current,
        description,
        season,
        year,
        "image": image.asset->url,
        "heroImages": heroImages[].asset->url,
        "lookbookImages": lookbookImages[].asset->url,
        status,
        active
      }`,
      { slug }
    );

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    // Fetch products in this collection (products that reference this collection)
    // Since there's no direct reference, we'll return all published products for now
    // The collection page can filter/curate as needed

    return NextResponse.json(collection);
  } catch (err) {
    console.error("Failed to fetch collection:", err);
    return NextResponse.json({ error: "Failed to fetch collection" }, { status: 500 });
  }
}
