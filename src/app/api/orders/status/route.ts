import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity";

// No auth needed — reference is a UUID-based unguessable token
// Used by the callback page to poll for webhook confirmation
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  if (!reference) {
    return NextResponse.json({ error: "reference required" }, { status: 400 });
  }

  try {
    // Use writeClient (no CDN) so we always get the latest committed value
    const order = await writeClient.fetch(
      `*[_type == "order" && reference == $ref][0]{
        status,
        webhookVerifiedAt,
        paidAt
      }`,
      { ref: reference }
    );

    if (!order) {
      return NextResponse.json({ found: false }, { status: 404 });
    }

    const res = NextResponse.json({
      found: true,
      status: order.status,
      webhookVerified: !!order.webhookVerifiedAt,
      paidAt: order.paidAt ?? null,
    });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (err) {
    console.error("[orders/status] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
