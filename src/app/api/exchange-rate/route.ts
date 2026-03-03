import { NextResponse } from "next/server";

// Next.js route-level cache: revalidate every hour
export const revalidate = 3600;

export async function GET() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/NGN", {
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error("Exchange rate fetch failed");

    const data = await res.json();
    const usdRate: number = data?.rates?.USD ?? 0;

    return NextResponse.json(
      { usdRate },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" } }
    );
  } catch {
    // Return 0 so callers know the rate is unavailable and fall back to NGN display
    return NextResponse.json({ usdRate: 0 });
  }
}
