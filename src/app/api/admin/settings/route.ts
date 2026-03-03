import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { writeClient } from "@/lib/sanity";

const SETTINGS_ID = "siteSettings";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const settings = await writeClient.fetch(
      `*[_type == "siteSettings" && _id == $id][0]`,
      { id: SETTINGS_ID }
    );
    return NextResponse.json({
      shippingRates: settings?.shippingRates || [],
      activePaymentMethods: settings?.activePaymentMethods || ["paystack"],
      bankAccounts: settings?.bankAccounts || [],
    });
  } catch (err) {
    console.error("Failed to fetch settings:", err);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();

    await writeClient.createIfNotExists({
      _id: SETTINGS_ID,
      _type: "siteSettings",
    });

    const patchData = Object.fromEntries(
      Object.entries({
        shippingRates: body.shippingRates,
        activePaymentMethods: body.activePaymentMethods,
        bankAccounts: body.bankAccounts,
      }).filter(([, v]) => v !== undefined)
    );

    const result = await writeClient.patch(SETTINGS_ID).set(patchData).commit();

    return NextResponse.json(result);
  } catch (err) {
    console.error("Failed to update settings:", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
