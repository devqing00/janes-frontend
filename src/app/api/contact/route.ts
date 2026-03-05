import { NextResponse } from "next/server";
import { client, writeClient } from "@/lib/sanity";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

const MAX_FIELD_LENGTH = 5000;

/* GET — returns contact info from siteSettings (public, uses CDN) */
export async function GET() {
  try {
    const settings = await client.fetch(
      `*[_type == "siteSettings"][0]{ contactEmail, contactPhone, contactAddress, instagramHandle }`
    );
    return NextResponse.json({
      email: settings?.contactEmail || "",
      phone: settings?.contactPhone || "",
      address: settings?.contactAddress || "",
      instagram: settings?.instagramHandle || "",
    });
  } catch (err) {
    console.error("Failed to fetch contact settings:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

/* POST — saves a contact message to Sanity (public, no auth) */
export async function POST(request: Request) {
  // Rate limit: 5 messages per 15 minutes per IP
  const ip = getClientIP(request);
  const rl = rateLimit(`contact:${ip}`, { limit: 5, windowSeconds: 900 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });
  }

  try {
    const body = await request.json();

    const { name, email, subject, message } = body;
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email and message are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Enforce field lengths
    if (String(name).length > MAX_FIELD_LENGTH || String(message).length > MAX_FIELD_LENGTH) {
      return NextResponse.json({ error: "Input too long" }, { status: 400 });
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
