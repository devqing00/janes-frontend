import { NextResponse } from "next/server";
import { client } from "@/lib/sanity";

export async function GET() {
  try {
    const collections = await client.fetch(
      `*[_type == "collection" && status == "published"] | order(_createdAt desc) {
        _id, title, "slug": slug.current, description, season, year, status,
        "image": image.asset->url,
        "images": [image.asset->url],
      }`
    );
    return NextResponse.json(collections);
  } catch (err) {
    console.error("Failed to fetch collections:", err);
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}
