import { NextRequest, NextResponse } from "next/server";
import { client, writeClient } from "@/lib/sanity";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  if (!reference) {
    return NextResponse.json({ error: "reference is required" }, { status: 400 });
  }

  try {
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
        cache: "no-store",
      }
    );

    if (!paystackRes.ok) {
      return NextResponse.json({ error: "Verification failed" }, { status: 502 });
    }

    const { data } = await paystackRes.json();

    if (data.status === "success") {
      // Find matching order in Sanity and mark it success (idempotent)
      const order = await client.fetch(
        `*[_type == "order" && reference == $ref][0]{ _id, status }`,
        { ref: reference }
      );

      if (order && order.status !== "success") {
        await writeClient
          .patch(order._id)
          .set({ status: "success", paidAt: new Date().toISOString() })
          .commit();
      }

      return NextResponse.json({
        verified: true,
        status: "success",
        reference,
        amount: data.amount,
        currency: data.currency,
        customer: data.customer,
      });
    }

    return NextResponse.json({ verified: false, status: data.status, reference });
  } catch (err) {
    console.error("Verify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
