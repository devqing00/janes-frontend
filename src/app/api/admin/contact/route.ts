import { writeClient } from "@/lib/sanity";
import { getAdminSession } from "@/lib/auth";
import { NextResponse } from "next/server";

// GET /api/admin/contact — list all messages, newest first
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const messages = await writeClient.fetch(
    `*[_type == "contactMessage"] | order(_createdAt desc) {
      _id,
      _createdAt,
      name,
      email,
      subject,
      message,
      read
    }`
  );

  return NextResponse.json(messages);
}
