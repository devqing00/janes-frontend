import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { writeClient } from "@/lib/sanity";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 50)));
  const offset = (page - 1) * limit;

  const [orders, totalCount] = await Promise.all([
    writeClient.fetch(
      `*[_type == "order"] | order(_createdAt desc) [$offset...$end] {
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
      }`,
      { offset, end: offset + limit }
    ),
    writeClient.fetch(`count(*[_type == "order"])`),
  ]);

  return NextResponse.json({ orders, totalCount, page, limit });
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

    // Enforce status transition rules
    const current = await writeClient.fetch(
      `*[_type == "order" && _id == $id][0]{ status }`,
      { id: orderId }
    );
    if (!current) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const ALLOWED_TRANSITIONS: Record<string, string[]> = {
      pending: ["processing", "failed", "success"],
      awaiting_payment: ["success", "failed"],
      success: ["processing", "refunded", "disputed"],
      processing: ["shipped", "refunded", "disputed"],
      shipped: ["delivered", "refunded", "disputed"],
      delivered: ["refunded", "disputed"],
      failed: ["pending"],
      refunded: [],
      disputed: ["refunded"],
    };

    const allowed = ALLOWED_TRANSITIONS[current.status] ?? [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from '${current.status}' to '${status}'` },
        { status: 400 }
      );
    }

    const result = await writeClient.patch(orderId).set({ status, [`${status}At`]: new Date().toISOString() }).commit();
    return NextResponse.json(result);
  } catch (err) {
    console.error("Failed to update order status:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
