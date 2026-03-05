import { NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity";
import { adminAuth } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/orders (with Bearer token)  — authenticated user's orders
 * Email-only lookup is no longer supported (security: prevents order enumeration)
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let email: string | null = null;
  try {
    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(idToken);
    email = decoded.email || null;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
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
