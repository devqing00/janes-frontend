import { NextResponse } from "next/server";
import { client } from "@/lib/sanity";

export interface ShippingRate {
  _key?: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

const DEFAULT_RATES: ShippingRate[] = [
  {
    name: "Standard Delivery",
    description: "Nationwide delivery",
    price: 3000,
    estimatedDays: "5–7 business days",
  },
  {
    name: "Express Delivery",
    description: "Priority dispatch, fast tracking",
    price: 7500,
    estimatedDays: "2–3 business days",
  },
  {
    name: "Same Day Delivery",
    description: "Lagos only — orders placed before 12pm",
    price: 15000,
    estimatedDays: "Today",
  },
];

export async function GET() {
  try {
    const settings = await client.fetch(
      `*[_type == "siteSettings"][0]{ shippingRates }`,
      {},
      { cache: "no-store" }
    );

    const rates: ShippingRate[] =
      Array.isArray(settings?.shippingRates) && settings.shippingRates.length > 0
        ? settings.shippingRates.map(
            (r: ShippingRate & { _key: string }) => ({
              _key: r._key,
              name: r.name ?? "",
              description: r.description ?? "",
              price: r.price ?? 0,
              estimatedDays: r.estimatedDays ?? "",
            })
          )
        : DEFAULT_RATES;

    return NextResponse.json(rates);
  } catch (err) {
    console.error("Failed to fetch shipping rates:", err);
    return NextResponse.json(DEFAULT_RATES);
  }
}
