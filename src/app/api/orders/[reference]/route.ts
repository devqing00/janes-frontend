import { NextResponse } from "next/server";
import { client } from "@/lib/sanity";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;

  try {
    const order = await client.fetch(
      `*[_type == "order" && reference == $reference][0] {
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
        shippingAddress,
        shippingMethod,
        paidAt
      }`,
      { reference }
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Mask email for privacy
    const email = order.customerEmail || "";
    const [user, domain] = email.split("@");
    const maskedEmail = user
      ? `${user[0]}***@${domain}`
      : "";

    return NextResponse.json({
      ...order,
      customerEmail: maskedEmail,
    });
  } catch (err) {
    console.error("Failed to fetch order:", err);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
