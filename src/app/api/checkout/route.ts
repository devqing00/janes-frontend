import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity";
import { randomUUID } from "crypto";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";
const CURRENCY = process.env.PAYSTACK_CURRENCY ?? "NGN";
const UNIT_MULTIPLIER = 100;

export interface CheckoutItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  image: string | null;
  slug: string;
}

export interface ShippingMethod {
  name: string;
  price: number;
  estimatedDays?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email, name, items, shippingAddress, shippingMethod, note,
      paymentMethod = "paystack",
    }: {
      email: string;
      name: string;
      items: CheckoutItem[];
      shippingAddress?: {
        line1?: string; line2?: string; city?: string;
        state?: string; country?: string; postalCode?: string;
      };
      shippingMethod?: ShippingMethod;
      note?: string;
      paymentMethod?: "paystack" | "bank_transfer";
    } = body;

    if (!email || !items?.length) {
      return NextResponse.json({ error: "email and items are required" }, { status: 400 });
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingPrice = shippingMethod?.price ?? 0;
    const grandTotal = subtotal + shippingPrice;

    const orderItems = items.map((i) => ({
      _key: `${i._id}-${i.size ?? ""}`,
      productId: i._id, name: i.name, price: i.price,
      quantity: i.quantity, size: i.size ?? null, image: i.image ?? null,
    }));

    /* ── Bank Transfer ── */
    if (paymentMethod === "bank_transfer") {
      const reference = `BT-${Date.now()}-${randomUUID().slice(0, 8)}`;

      await writeClient.create({
        _type: "order",
        reference,
        status: "awaiting_payment",
        paymentMethod: "bank_transfer",
        customerName: name,
        customerEmail: email,
        items: orderItems,
        subtotal,
        currency: CURRENCY,
        shippingAddress: shippingAddress ?? null,
        shippingMethod: shippingMethod ?? null,
        note: note ?? null,
      });

      return NextResponse.json({ paymentMethod: "bank_transfer", reference, grandTotal });
    }

    /* ── Paystack ── */
    const amountInSmallestUnit = Math.round(grandTotal * UNIT_MULTIPLIER);
    const origin = req.headers.get("origin") ?? req.nextUrl.origin;
    const callbackUrl = `${origin}/checkout/callback`;

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amountInSmallestUnit,
        currency: CURRENCY,
        callback_url: callbackUrl,
        metadata: {
          custom_fields: [
            { display_name: "Name", variable_name: "name", value: name },
            { display_name: "Shipping", variable_name: "shipping", value: shippingMethod?.name ?? "None" },
          ],
          customer_name: name,
          items: items.map((i) => ({
            productId: i._id, name: i.name, price: i.price,
            quantity: i.quantity, size: i.size ?? null, image: i.image ?? null,
          })),
          shipping_address: shippingAddress ?? null,
          shipping_method: shippingMethod ?? null,
          note: note ?? null,
        },
      }),
    });

    if (!paystackRes.ok) {
      const err = await paystackRes.json();
      return NextResponse.json({ error: err.message ?? "Paystack error" }, { status: 502 });
    }

    const { data } = await paystackRes.json();

    await writeClient.create({
      _type: "order",
      reference: data.reference,
      status: "pending",
      paymentMethod: "paystack",
      customerName: name,
      customerEmail: email,
      items: orderItems,
      subtotal,
      currency: CURRENCY,
      shippingAddress: shippingAddress ?? null,
      shippingMethod: shippingMethod ?? null,
      note: note ?? null,
    });

    return NextResponse.json({
      paymentMethod: "paystack",
      authorizationUrl: data.authorization_url,
      reference: data.reference,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
