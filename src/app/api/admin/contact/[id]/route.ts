import { writeClient } from "@/lib/sanity";
import { getAdminSession } from "@/lib/auth";
import { NextResponse } from "next/server";

// PATCH /api/admin/contact/[id] — toggle read status
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  try {
    await writeClient.patch(id).set({ read: body.read }).commit();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}

// DELETE /api/admin/contact/[id] — permanently delete a message
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await writeClient.delete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}
