import { NextResponse } from "next/server";
import { client, writeClient } from "@/lib/sanity";

/* GET — returns contact info from siteSettings (public, uses CDN) */
export async function GET() {
  try {
    const settings = await client.fetch(
      `*[_type == "siteSettings"][0]{ email, phone, address, instagramHandle }`
    );
    return NextResponse.json({
      email: settings?.email || "",
      phone: settings?.phone || "",
      address: settings?.address || "",
      instagram: settings?.instagramHandle || "",
    });
  } catch (err) {
    console.error("Failed to fetch contact settings:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

/* POST — saves a contact message to Sanity (public, no auth) */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, subject, message } = body;
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email and message are required" },
        { status: 400 }
      );
    }

    const doc = await writeClient.create({
      _type: "contactMessage",
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      subject: subject ? String(subject).trim() : "",
      message: String(message).trim(),
      read: false,
    });

    return NextResponse.json({ success: true, id: doc._id }, { status: 201 });
  } catch (err) {
    console.error("Failed to save contact message:", err);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
