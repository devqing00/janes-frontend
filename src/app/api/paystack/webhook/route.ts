import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { writeClient } from "@/lib/sanity";
import { client } from "@/lib/sanity";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature") ?? "";

    // Verify HMAC-SHA512 signature
    const expectedSig = createHmac("sha512", PAYSTACK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSig) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const { reference, metadata, customer } = event.data as {
        reference: string;
        metadata: {
          customer_name?: string;
          items?: Array<{
            productId: string;
            name: string;
            price: number;
            quantity: number;
            size?: string;
            image?: string;
          }>;
          shipping_address?: Record<string, string>;
        };
        customer: { email: string; first_name?: string; last_name?: string };
      };

      // Find existing pending order
      const existingOrder = await client.fetch(
        `*[_type == "order" && reference == $ref][0]{ _id, status }`,
        { ref: reference }
      );

      if (existingOrder) {
        if (existingOrder.status !== "success") {
          await writeClient
            .patch(existingOrder._id)
            .set({ status: "success", paidAt: new Date().toISOString() })
            .commit();
        }
      } else {
        // Safety net: create order if it somehow doesn't exist
        const items = metadata?.items ?? [];
        const subtotal = items.reduce((s: number, i) => s + i.price * i.quantity, 0);
        await writeClient.create({
          _type: "order",
          reference,
          status: "success",
          customerName: metadata?.customer_name ?? `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim(),
          customerEmail: customer.email,
          items: items.map((i, idx) => ({
            _key: `${i.productId}-${i.size ?? ""}-${idx}`,
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            size: i.size ?? null,
            image: i.image ?? null,
          })),
          subtotal,
          shippingAddress: metadata?.shipping_address ?? null,
          paidAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
