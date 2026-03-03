import { NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity";
import { adminAuth } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/orders?email=...  — public lookup by email
 * GET /api/orders (with Bearer token)  — authenticated user's orders
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const emailParam = searchParams.get("email");

  let email: string | null = emailParam;

  // If no email param, try to get from Firebase token
  if (!email) {
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const idToken = authHeader.split("Bearer ")[1];
        const decoded = await adminAuth.verifyIdToken(idToken);
        email = decoded.email || null;
      } catch {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    }
  }

  if (!email) {
    return NextResponse.json({ error: "Email or authentication required" }, { status: 400 });
  }

  try {
    const orders = await writeClient.fetch(
      `*[_type == "order" && customerEmail == $email] | order(_createdAt desc) {
        _id,
        _createdAt,
        reference,
        status,
        paymentMethod,
        customerName,
        customerEmail,
        items,
        subtotal,
        currency,
        shippingMethod,
        paidAt
      }`,
      { email }
    );

    return NextResponse.json(orders || []);
  } catch (err) {
    console.error("Failed to fetch user orders:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
