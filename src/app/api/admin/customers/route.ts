import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { client } from "@/lib/sanity";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [customers, orders] = await Promise.all([
    client.fetch(
      `*[_type == "customer"] | order(_createdAt desc) {
        _id,
        _createdAt,
        firebaseUid,
        email,
        displayName,
        firstName,
        lastName,
        phone,
        address,
        city,
        state,
        country,
        photoURL
      }`
    ),
    client.fetch(
      `*[_type == "order"] {
        customerEmail,
        subtotal,
        currency,
        status
      }`
    ),
  ]);

  // Enrich each customer with order stats
  const enriched = customers.map((c: {
    _id: string;
    _createdAt: string;
    firebaseUid?: string;
    email?: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    photoURL?: string;
  }) => {
    const customerOrders = orders.filter(
      (o: { customerEmail?: string; subtotal?: number; currency?: string; status?: string }) =>
        o.customerEmail === c.email
    );
    const orderCount = customerOrders.length;
    const totalSpend = customerOrders
      .filter((o: { status?: string }) => o.status === "success")
      .reduce((sum: number, o: { subtotal?: number }) => sum + (o.subtotal || 0), 0);
    const currency =
      customerOrders.length > 0
        ? customerOrders[customerOrders.length - 1].currency
        : "NGN";

    return { ...c, orderCount, totalSpend, currency };
  });

  return NextResponse.json(enriched);
}
