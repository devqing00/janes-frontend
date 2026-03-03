import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { writeClient, client } from "@/lib/sanity";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";

// Always parse raw body before JSON, preserving exact bytes for HMAC
export async function POST(req: NextRequest) {
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ error: "Could not read body" }, { status: 400 });
  }

  // ── 1. Verify HMAC-SHA512 signature ──────────────────────────────────────
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const expectedSig = createHmac("sha512", PAYSTACK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (!PAYSTACK_SECRET || signature !== expectedSig) {
    console.warn("[webhook] Invalid or missing Paystack signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const now = new Date().toISOString();
  console.log(`[webhook] ${event.event} received at ${now}`);

  try {
    // ── 2. Resolve order by reference ─────────────────────────────────────
    const reference =
      (event.data.reference as string) ||
      (event.data.transaction_reference as string) ||
      "";

    const fetchOrder = (ref: string) =>
      client.fetch(
        `*[_type == "order" && reference == $ref][0]{ _id, status }`,
        { ref }
      );

    // ── 3. charge.success ─────────────────────────────────────────────────
    if (event.event === "charge.success") {
      const data = event.data as {
        reference: string;
        metadata: {
          customer_name?: string;
          items?: Array<{
            productId: string; name: string; price: number;
            quantity: number; size?: string; image?: string;
          }>;
          shipping_address?: Record<string, string>;
        };
        customer: { email: string; first_name?: string; last_name?: string };
      };

      const existingOrder = await fetchOrder(data.reference);

      if (existingOrder) {
        // Idempotent — only patch if not already confirmed
        if (existingOrder.status !== "success") {
          await writeClient
            .patch(existingOrder._id)
            .set({
              status: "success",
              paidAt: now,
              webhookVerifiedAt: now,
            })
            .commit();
          console.log(`[webhook] Order ${existingOrder._id} → success`);
        } else {
          // Still stamp webhookVerifiedAt for audit even if already success
          await writeClient
            .patch(existingOrder._id)
            .setIfMissing({ webhookVerifiedAt: now })
            .commit();
        }
      } else {
        // Safety net: order wasn't pre-created (e.g. callback never fired)
        const items = data.metadata?.items ?? [];
        const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
        await writeClient.create({
          _type: "order",
          reference: data.reference,
          status: "success",
          paymentMethod: "paystack",
          customerName:
            data.metadata?.customer_name ??
            `${data.customer.first_name ?? ""} ${data.customer.last_name ?? ""}`.trim(),
          customerEmail: data.customer.email,
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
          currency: "NGN",
          shippingAddress: data.metadata?.shipping_address ?? null,
          paidAt: now,
          webhookVerifiedAt: now,
        });
        console.log(`[webhook] Safety-net order created for ref ${data.reference}`);
      }
    }

    // ── 4. refund.processed ───────────────────────────────────────────────
    if (event.event === "refund.processed") {
      const refundRef =
        (event.data.transaction_reference as string) ||
        (event.data.reference as string) ||
        "";

      if (refundRef) {
        const order = await fetchOrder(refundRef);
        if (order) {
          await writeClient
            .patch(order._id)
            .set({ status: "refunded", refundedAt: now })
            .commit();
          console.log(`[webhook] Order ${order._id} → refunded`);
        }
      }
    }

    // ── 5. charge.dispute.create ──────────────────────────────────────────
    if (event.event === "charge.dispute.create") {
      if (reference) {
        const order = await fetchOrder(reference);
        if (order) {
          await writeClient
            .patch(order._id)
            .set({ status: "disputed", disputedAt: now })
            .commit();
          console.log(`[webhook] Order ${order._id} → disputed`);
        }
      }
    }

    // ── 6. charge.dispute.resolve ─────────────────────────────────────────
    if (event.event === "charge.dispute.resolve") {
      const resolution = (event.data.resolution as string) ?? "";
      if (reference) {
        const order = await fetchOrder(reference);
        if (order) {
          // merchant-won → restore success; customer-won → refunded
          const resolvedStatus =
            resolution === "merchant-won" ? "success" : "refunded";
          await writeClient
            .patch(order._id)
            .set({ status: resolvedStatus, disputeResolvedAt: now })
            .commit();
          console.log(
            `[webhook] Order ${order._id} dispute resolved → ${resolvedStatus}`
          );
        }
      }
    }

    // Always respond 200 quickly so Paystack doesn't retry unnecessarily
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[webhook] Handler error:", err);
    // Return 200 anyway — returning 5xx causes Paystack to retry
    return NextResponse.json({ received: true, warning: "processing error" });
  }
}
