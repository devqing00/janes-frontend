import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { client } from "@/lib/sanity";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await client.fetch(
    `*[_type == "order"] | order(_createdAt desc) {
      _id,
      _createdAt,
      reference,
      status,
      customerName,
      customerEmail,
      subtotal,
      currency,
      items,
      shippingAddress,
      shippingMethod,
      paymentMethod,
      paidAt,
      note
    }`
  );

  return NextResponse.json(orders);
}
