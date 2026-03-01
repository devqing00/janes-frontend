import { NextResponse } from "next/server";
import { client } from "@/lib/sanity";

export interface BankAccount {
  _key?: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode?: string;
}

export async function GET() {
  try {
    const settings = await client.fetch(
      `*[_type == "siteSettings"][0]{ activePaymentMethods, bankAccounts, currency, instagramUrl }`
    );

    const methods: string[] = settings?.activePaymentMethods ?? ["paystack"];
    const bankAccounts: BankAccount[] = settings?.bankAccounts ?? [];
    const currency: string = settings?.currency ?? "USD";
    const instagramUrl: string = settings?.instagramUrl ?? "";

    return NextResponse.json({ methods, bankAccounts, currency, instagramUrl });
  } catch (err) {
    console.error("Payment methods error:", err);
    return NextResponse.json({ methods: ["paystack"], bankAccounts: [] });
  }
}
