import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { writeClient } from "@/lib/sanity";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await writeClient.fetch(
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

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: "orderId and status are required" }, { status: 400 });
    }

    const validStatuses = ["pending", "awaiting_payment", "success", "failed", "processing", "shipped", "delivered", "refunded", "disputed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const result = await writeClient.patch(orderId).set({ status }).commit();
    return NextResponse.json(result);
  } catch (err) {
    console.error("Failed to update order status:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
