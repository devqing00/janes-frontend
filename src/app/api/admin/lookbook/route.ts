import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { client, writeClient } from "@/lib/sanity";

const SETTINGS_ID = "siteSettings";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const settings = await client.fetch(
      `*[_type == "siteSettings" && _id == $id][0]{
        lookbookTitle,
        lookbookSubtitle,
        lookbookDescription,
        lookbookImages[]{ _key, caption, "url": image.asset->url, "assetId": image.asset->_id }
      }`,
      { id: SETTINGS_ID }
    );

    return NextResponse.json({
      lookbookTitle: settings?.lookbookTitle || "",
      lookbookSubtitle: settings?.lookbookSubtitle || "",
      lookbookDescription: settings?.lookbookDescription || "",
      lookbookImages: (settings?.lookbookImages || []).filter(
        (img: { url?: string }) => img.url
      ),
    });
  } catch (err) {
    console.error("Failed to fetch lookbook settings:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { lookbookTitle, lookbookSubtitle, lookbookDescription, lookbookImages } = body;

    // Build Sanity-compatible image array
    const images = (
      lookbookImages as { assetId: string; caption?: string }[]
    ).map((img, i) => ({
      _key: `lb-${i}-${img.assetId.slice(-6)}`,
      image: {
        _type: "image" as const,
        asset: { _type: "reference" as const, _ref: img.assetId },
      },
      caption: img.caption || "",
    }));

    await writeClient.createIfNotExists({ _id: SETTINGS_ID, _type: "siteSettings" });
    await writeClient
      .patch(SETTINGS_ID)
      .set({ lookbookTitle, lookbookSubtitle, lookbookDescription, lookbookImages: images })
      .commit();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to update lookbook:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
