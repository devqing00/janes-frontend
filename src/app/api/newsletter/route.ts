import { NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Rate limit: 3 subscribes per 10 minutes per IP
  const ip = getClientIP(request);
  const rl = rateLimit(`newsletter:${ip}`, { limit: 3, windowSeconds: 600 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const { email } = await request.json();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(String(email))) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    // Check if email already subscribed
    const existing = await writeClient.fetch(
      `*[_type == "newsletterSubscriber" && email == $email][0]`,
      { email }
    );

    if (existing) {
      return NextResponse.json({ message: "Already subscribed" });
    }

    await writeClient.create({
      _type: "newsletterSubscriber",
      email,
      subscribedAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Subscribed successfully" });
  } catch (err) {
    console.error("Newsletter subscribe error:", err);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
