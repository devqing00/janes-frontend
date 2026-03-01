import { NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
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
