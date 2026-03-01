import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { writeClient } from "@/lib/sanity";

const SETTINGS_ID = "siteSettings";

/* ── Helper: reconstruct image objects from Sanity ── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapImage(img: any) {
  if (!img?.asset?._ref && !img?.asset?._id) return null;
  const ref = img.asset._ref || img.asset._id;
  return {
    _id: ref,
    url: `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${ref.replace("image-", "").replace(/-([a-z]+)$/, ".$1")}`,
    assetRef: {
      _type: "image" as const,
      asset: { _type: "reference" as const, _ref: ref },
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapImages(arr: any[] | undefined) {
  if (!Array.isArray(arr)) return [];
  return arr.map(mapImage).filter(Boolean);
}

export async function GET() {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const s = await writeClient.fetch(
      `*[_type == "siteSettings" && _id == $id][0]`,
      { id: SETTINGS_ID }
    );

    return NextResponse.json({
      // Hero
      tagline: s?.tagline || "",
      heroImages: mapImages(s?.heroImages),
      heroSeasonLabel: s?.heroSeasonLabel || "",
      heroCTAText: s?.heroCTAText || "",

      // Categories
      categoryCards: Array.isArray(s?.categoryCards)
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          s.categoryCards.map((c: any) => ({
            title: c.title || "",
            image: mapImage(c.image),
            link: c.link || "",
          }))
        : [],

      // Editorial Grid
      editorialItems: Array.isArray(s?.editorialItems)
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          s.editorialItems.map((e: any) => ({
            image: mapImage(e.image),
            title: e.title || "",
            category: e.category || "",
          }))
        : [],

      // Parallax
      parallaxImage: mapImage(s?.parallaxImage) || null,
      parallaxSubtitle: s?.parallaxSubtitle || "",
      parallaxHeading: s?.parallaxHeading || "",
      parallaxCTAText: s?.parallaxCTAText || "",
      parallaxCTALink: s?.parallaxCTALink || "",

      // Lookbook
      lookbookTitle: s?.lookbookTitle || "",
      lookbookSubtitle: s?.lookbookSubtitle || "",
      lookbookDescription: s?.lookbookDescription || "",
      lookbookImages: Array.isArray(s?.lookbookImages)
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          s.lookbookImages.map((l: any) => ({
            image: mapImage(l.image),
            caption: l.caption || "",
          }))
        : [],
    });
  } catch (err) {
    console.error("Failed to fetch content:", err);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();

    // First fetch existing doc to preserve settings fields
    const existing = await writeClient.fetch(
      `*[_type == "siteSettings" && _id == $id][0]`,
      { id: SETTINGS_ID }
    );

    const doc = {
      _id: SETTINGS_ID,
      _type: "siteSettings" as const,
      // Preserve existing settings fields
      brandName: existing?.brandName,
      email: existing?.email,
      phone: existing?.phone,
      instagramHandle: existing?.instagramHandle,
      currency: existing?.currency,
      shippingNote: existing?.shippingNote,

      // Hero
      tagline: body.tagline,
      heroImages: body.heroImages?.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (img: any) => img.assetRef || { _type: "image", asset: { _type: "reference", _ref: img._id } }
      ),
      heroSeasonLabel: body.heroSeasonLabel,
      heroCTAText: body.heroCTAText,

      // Categories
      categoryCards: body.categoryCards?.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c: any) => ({
          _type: "object",
          title: c.title,
          image: c.image?.assetRef || (c.image?._id ? { _type: "image", asset: { _type: "reference", _ref: c.image._id } } : undefined),
          link: c.link,
        })
      ),

      // Editorial Grid
      editorialItems: body.editorialItems?.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (e: any) => ({
          _type: "object",
          image: e.image?.assetRef || (e.image?._id ? { _type: "image", asset: { _type: "reference", _ref: e.image._id } } : undefined),
          title: e.title,
          category: e.category,
        })
      ),

      // Parallax
      parallaxImage: body.parallaxImage?.assetRef || (body.parallaxImage?._id
        ? { _type: "image", asset: { _type: "reference", _ref: body.parallaxImage._id } }
        : existing?.parallaxImage),
      parallaxSubtitle: body.parallaxSubtitle,
      parallaxHeading: body.parallaxHeading,
      parallaxCTAText: body.parallaxCTAText,
      parallaxCTALink: body.parallaxCTALink,

      // Lookbook
      lookbookTitle: body.lookbookTitle,
      lookbookSubtitle: body.lookbookSubtitle,
      lookbookDescription: body.lookbookDescription,
      lookbookImages: body.lookbookImages?.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (l: any) => ({
          _type: "object",
          image: l.image?.assetRef || (l.image?._id ? { _type: "image", asset: { _type: "reference", _ref: l.image._id } } : undefined),
          caption: l.caption,
        })
      ),
    };

    const result = await writeClient.createOrReplace(doc);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Failed to update content:", err);
    return NextResponse.json(
      { error: "Failed to update content" },
      { status: 500 }
    );
  }
}
