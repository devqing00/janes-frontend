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
      `*[_type == "siteSettings"][0]{ activePaymentMethods, bankAccounts }`
    );

    const methods: string[] = settings?.activePaymentMethods ?? ["paystack"];
    const bankAccounts: BankAccount[] = settings?.bankAccounts ?? [];

    return NextResponse.json({ methods, bankAccounts });
  } catch (err) {
    console.error("Payment methods error:", err);
    return NextResponse.json({ methods: ["paystack"], bankAccounts: [] });
  }
}
